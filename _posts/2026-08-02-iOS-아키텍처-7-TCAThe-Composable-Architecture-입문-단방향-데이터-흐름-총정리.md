---
title: "[iOS 아키텍처 #7] TCA(The Composable Architecture) 입문, 단방향 데이터 흐름 총정리"
description: "SwiftUI 시대의 아키텍처 논의에서 빠지지 않는 이름이 하나 있습니다. Point-Free가 만든 TCA(The Composable Architecture)입니다."
header:
  og_image: /assets/images/posts/caac9fa2-c44c-4646-87b0-01421048db10/1.jpg
tags:
  - iOS
  - TCA
  - ComposableArchitecture
  - SwiftUI
permalink: /iOS-아키텍처-7-TCAThe-Composable-Architecture-입문-단방향-데이터-흐름-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-02
---

SwiftUI 시대의 아키텍처 논의에서 빠지지 않는 이름이 하나 있습니다. Point-Free가 만든 **TCA(The Composable Architecture)**입니다.

앞선 편들에서 다룬 MVVM(Model-View-ViewModel)·클린 아키텍처가 "역할을 어떻게 나눌까"의 이야기였다면, TCA는 질문 자체가 다릅니다. **"상태가 바뀌는 모든 경로를 하나의 규칙으로 통제할 수 없을까?"**

오늘은 TCA의 단방향 데이터 흐름이 어떻게 동작하는지, 그리고 무엇을 얻고 무엇을 지불하는지 정리해보겠습니다.

<figure>
  <img src="/assets/images/posts/caac9fa2-c44c-4646-87b0-01421048db10/1.jpg" alt="상태가 바뀌는 샛길이 없는 단방향 순환" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>상태가 바뀌는 샛길이 없는 단방향 순환</figcaption>
</figure>

---

## 세 가지 재료: State, Action, Reducer

TCA에서 화면 하나(기능 하나)는 세 가지로 정의됩니다.

- **State**: 이 기능의 모든 상태를 담은 하나의 구조체
- **Action**: 이 기능에서 일어날 수 있는 모든 사건을 담은 enum. 버튼 탭, 응답 도착, 알림 수신까지 전부요
- **Reducer**: "현재 State에서 이 Action이 오면 State가 어떻게 바뀌는가"를 정의하는 순수 함수

```swift
@Reducer
struct Counter {
    @ObservableState
    struct State: Equatable {
        var count = 0
    }
    enum Action {
        case incrementTapped
        case decrementTapped
    }
    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .incrementTapped:
                state.count += 1
                return .none
            case .decrementTapped:
                state.count -= 1
                return .none
            }
        }
    }
}
```

View는 상태를 직접 바꾸지 못합니다. 할 수 있는 건 **Store에 Action을 보내는 것뿐**이에요. Store가 Reducer를 돌려 State를 바꾸면 View는 바뀐 State를 그립니다.

`사건 발생 → Action 전송 → Reducer가 State 변경 → View 갱신`

이 한 방향 순환이 전부입니다. 상태가 바뀌는 샛길이 없어요. "이 값이 대체 어디서 바뀐 거지?"라는 디버깅 미궁이 구조적으로 사라집니다.

---

## 사이드 이펙트도 규칙 안으로

네트워크 요청 같은 비동기 작업은 Reducer가 직접 하지 않고 **Effect**로 반환합니다. Effect가 끝나면 결과가 다시 Action이 되어 돌아와요.

```swift
case .refreshTapped:
    state.isLoading = true
    return .run { send in
        let posts = try await postClient.fetch()
        await send(.postsLoaded(posts))
    }

case .postsLoaded(let posts):
    state.isLoading = false
    state.posts = posts
    return .none
```

의존성(postClient)은 TCA의 의존성 주입 시스템으로 꽂기 때문에, 테스트에서는 가짜 클라이언트로 교체합니다. 바로 이 대목에서 TCA 최고의 무기가 나옵니다. **TestStore**예요.

```swift
let store = TestStore(initialState: Feed.State()) { Feed() }
await store.send(.refreshTapped) { $0.isLoading = true }
await store.receive(.postsLoaded(mockPosts)) {
    $0.isLoading = false
    $0.posts = mockPosts
}
```

Action 하나하나에 대해 State가 정확히 어떻게 변해야 하는지를 **전부 명시하도록 강제**합니다. 예상 못 한 상태 변화가 하나라도 있으면 테스트가 실패해요. 이 수준의 완전성 검증은 MVVM 테스트로는 흉내 내기 어렵습니다.

<figure>
  <img src="/assets/images/posts/caac9fa2-c44c-4646-87b0-01421048db10/2.jpg" alt="TestStore는 상태 변화 하나하나를 전부 명시하게 강제합니다" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>TestStore는 상태 변화 하나하나를 전부 명시하게 강제합니다</figcaption>
</figure>

---

## 대가는 무엇인가요?

이 정밀함에는 청구서가 따라옵니다.

**러닝커브가 가파릅니다.** Reducer, Effect, Store, Scope, 의존성 시스템까지, 생산성이 나기 전에 학습해야 할 개념이 많습니다. 함수형 프로그래밍 배경이 없는 팀이라면 더 그래요.

**보일러플레이트가 있습니다.** 값 하나 바꾸는 데도 Action 케이스를 만들고 Reducer에 분기를 추가해야 합니다. 단순한 화면에서는 이 의식(儀式)이 과합니다.

**서드파티 의존입니다.** TCA는 애플이 아니라 Point-Free가 만드는 라이브러리입니다. 매년 바뀌는 SwiftUI에 맞춰 TCA도 큰 마이그레이션을 여러 번 거쳤고 앱의 모든 화면이 이 라이브러리 위에 서게 됩니다. 활발히 관리되는 성숙한 프로젝트지만 앱의 뼈대를 외부에 맡긴다는 결정 자체는 가볍지 않아요.

---

## 어떤 팀에게 맞을까요?

TCA가 값을 하는 조건은 비교적 뚜렷합니다.

- 상태가 복잡하게 얽히는 앱(협업 문서, 금융, 복잡한 폼과 실시간 동기화)
- 상태 변화의 완전한 테스트가 중요한 도메인
- 함수형 개념에 익숙하거나 학습 투자가 가능한 팀

반대로 화면 대부분이 "받아서 보여주기"인 앱이라면, 3편에서 다룬 MV(Model-View)/MVVM에 UseCase 정도로 충분한 경우가 많습니다. TCA는 틀린 선택지가 아니라 **비싼 선택지**이고, 그 비용을 상태 복잡도가 정당화해줄 때 빛납니다.

<figure>
  <img src="/assets/images/posts/caac9fa2-c44c-4646-87b0-01421048db10/3.jpg" alt="TCA는 틀린 선택지가 아니라 비싼 선택지예요" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>TCA는 틀린 선택지가 아니라 비싼 선택지예요</figcaption>
</figure>

---

## 정리

- TCA는 State·Action·Reducer로 기능을 정의하고, 상태 변경 경로를 단방향 순환 하나로 강제합니다.
- 사이드 이펙트도 Effect → Action으로 규칙 안에 들어오고, TestStore가 상태 변화의 완전성을 검증합니다.
- 대가는 러닝커브, 보일러플레이트, 그리고 앱의 뼈대를 서드파티에 맡긴다는 결정입니다.
- 상태 복잡도가 높은 앱일수록 이득이 커지는, 명확한 트레이드오프의 아키텍처입니다.

이제 시리즈의 마지막 질문만 남았습니다. MVC부터 TCA까지, 이 많은 선택지 중에 **우리 팀은 뭘 골라야 할까요?** 다음 편에서 선택 기준을 정리하며 시리즈를 마무리하겠습니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[iOS 아키텍처 #8] iOS 아키텍처 선택 가이드, 팀 규모·앱 수명·상태 복잡도로 고르는 법](/iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-8-iOS-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EC%84%A0%ED%83%9D-%EA%B0%80%EC%9D%B4%EB%93%9C-%ED%8C%80-%EA%B7%9C%EB%AA%A8%EC%95%B1-%EC%88%98%EB%AA%85%EC%83%81%ED%83%9C-%EB%B3%B5%EC%9E%A1%EB%8F%84%EB%A1%9C-%EA%B3%A0%EB%A5%B4%EB%8A%94-%EB%B2%95/)
<!-- /RELATED-POSTS -->
