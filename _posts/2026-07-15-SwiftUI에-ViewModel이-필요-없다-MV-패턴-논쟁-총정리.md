---
title: "SwiftUI에 ViewModel이 필요 없다? MV 패턴 논쟁 총정리"
description: "iOS 커뮤니티에서 몇 년째 이어지는 뜨거운 논쟁이 있습니다."
header:
  og_image: /assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png
tags:
  - SwiftUI
  - MVVM
  - ViewModel
  - iOS
permalink: /SwiftUI에-ViewModel이-필요-없다-MV-패턴-논쟁-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

iOS 커뮤니티에서 몇 년째 이어지는 뜨거운 논쟁이 있습니다.

**"SwiftUI에 ViewModel이 필요한가?"**

지난 편에서 MVVM의 핵심이 바인딩이라고 정리했는데, SwiftUI는 바인딩이 프레임워크에 내장돼 있습니다. 그러자 "그럼 ViewModel이라는 계층 자체가 중복 아니냐"는 주장이 나오기 시작했어요. 이른바 **MV(Model-View) 패턴** 진영입니다.

오늘은 시리즈 마지막 편으로, 이 논쟁의 양쪽 논거를 공정하게 놓고 **실제로 어떤 기준으로 판단하면 되는지**까지 정리해보겠습니다.

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png" alt="SwiftUI 커뮤니티에서 몇 년째 이어지는 MV vs MVVM 논쟁">
  <figcaption>SwiftUI 커뮤니티에서 몇 년째 이어지는 MV vs MVVM 논쟁</figcaption>
</figure>

---

## SwiftUI View는 이미 ViewModel을 닮았다

UIKit에서 MVVM이 필요했던 이유를 되짚어보면 이렇습니다.

- UIViewController가 비대해지니 상태와 로직을 밖으로 빼고 싶다
- 상태와 화면을 동기화할 바인딩이 필요하다

그런데 SwiftUI의 View는 애초에 **상태의 함수**입니다. `body`는 상태를 받아 화면 선언을 반환할 뿐이고, `@State` 값이 바뀌면 프레임워크가 알아서 다시 그립니다. 바인딩을 위해 Combine 구독 코드를 쓸 일이 없어요.

게다가 SwiftUI의 View는 클래스가 아니라 **값 타입 struct**입니다. UIViewController처럼 수천 줄로 비대해질 생명주기 덩어리가 아니라, 매 렌더링마다 새로 만들어지는 가벼운 설계도에 가깝습니다.

MV 진영의 주장은 여기서 출발합니다. "비대해질 View도 없고 바인딩도 공짜인데, 화면마다 ViewModel 클래스를 만드는 건 UIKit의 습관을 관성으로 들고 온 것 아니냐"는 거죠.

---

## MV 진영의 논거

MV 패턴에서는 화면마다 ViewModel을 두지 않고, View가 상태 도구들을 직접 사용합니다.

- 뷰 하나에 갇힌 상태는 `@State`로
- 여러 화면이 공유하는 상태는 `@Observable` 모델을 `@Environment`로 주입해서
- 서버 데이터는 Model 계층의 store나 client가 담당

```swift
struct ProfileView: View {
    @Environment(UserStore.self) private var store
    @State private var isEditing = false

    var body: some View {
        List(store.posts) { PostRow(post: $0) }
            .task { await store.loadPosts() }
    }
}
```

Apple의 공식 샘플 코드(Fruta, Food Truck 등)도 대체로 이 구조입니다. 화면별 ViewModel 대신 도메인 단위의 `@Observable` 모델 하나를 여러 View가 공유하죠.

이 방식의 장점은 명확합니다. 화면마다 클래스를 하나씩 만드는 보일러플레이트가 사라지고, `@State`·`@Binding` 같은 프레임워크 도구를 우회 없이 그대로 쓸 수 있습니다.

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/2.png" alt="SwiftUI의 View는 애초에 상태의 함수입니다">
  <figcaption>SwiftUI의 View는 애초에 상태의 함수입니다</figcaption>
</figure>

---

## MVVM 진영의 반론

반대쪽 논거도 만만치 않습니다.

**첫째, 로직이 View에 스며듭니다.** "포스트가 0개이고 로딩이 끝났고 에러가 없으면 안내 문구를 보여준다" 같은 조건이 `body` 안에 삼항연산자로 쌓이기 시작하면, 값 타입이라도 읽기 어려운 건 마찬가지입니다.

**둘째, 테스트 문제입니다.** View의 `body`는 단위 테스트로 실행하기 어렵습니다. 프레젠테이션 로직이 View 안에 있으면 그 로직도 같이 테스트 사각지대로 들어가요. ViewModel로 빼두면 순수 Swift 객체라 바로 검증할 수 있습니다.

**셋째, 규모의 문제입니다.** 화면이 수십 개이고 여러 명이 작업하는 앱이라면, "상태와 로직이 어디 있는지"에 대한 일관된 규칙이 필요합니다. 화면마다 ViewModel이라는 정해진 자리가 있는 편이 협업 비용을 줄여준다는 주장이에요.

---

## 이름이 아니라 의존성 방향

양쪽 논거를 놓고 보면, 사실 이 논쟁은 "ViewModel이라는 클래스가 있느냐"보다 **로직과 상태가 어디에 사는가**의 문제입니다. 판단 기준을 이렇게 잡으면 대부분의 경우가 정리됩니다.

- **뷰 하나에 갇힌 UI 상태**(토글, 포커스, 시트 표시 여부)는 `@State`로 View에 둡니다. 이걸 ViewModel로 빼는 건 과설계예요.
- **여러 화면이 공유하는 도메인 상태**는 `@Observable` 모델로 만들어 주입합니다. 이름이 Store든 ViewModel이든 본질은 같습니다.
- **화면용 가공 로직이 복잡해지면**(포매팅, 표시 조건, 정렬·필터) View 밖의 테스트 가능한 타입으로 뺍니다. 그게 사실상 ViewModel입니다.
- 어느 쪽이든 **View가 네트워크나 DB를 직접 만지지 않게** 의존성 방향만 지키면, MV냐 MVVM이냐는 이름 차이에 가깝습니다.

결국 "SwiftUI에 ViewModel이 필요 없다"는 말의 실체는 이렇게 요약할 수 있습니다. **화면마다 기계적으로 ViewModel을 만들 필요는 없다. 하지만 View 밖으로 빼야 할 로직이 사라지는 것은 아니다.**

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/3.png" alt="이름이 아니라 의존성 방향이 진짜 판단 기준이에요">
  <figcaption>이름이 아니라 의존성 방향이 진짜 판단 기준이에요</figcaption>
</figure>

---

## 시리즈 정리

세 편에 걸친 iOS 아키텍처 시리즈를 한 줄씩 압축하면 이렇습니다.

- **MVC**: UIViewController가 View와 Controller를 겸하는 구조라 책임이 몰린다. 작은 화면엔 여전히 유효하다.
- **MVVM**: 화면 상태를 ViewModel로 빼고 바인딩으로 동기화한다. 바인딩 없으면 반쪽이다.
- **MV 논쟁**: SwiftUI는 바인딩이 내장이라 화면마다 ViewModel을 강제할 이유는 없다. 다만 로직의 자리와 의존성 방향은 여전히 설계해야 한다.

아키텍처는 유행이 아니라 **팀과 앱의 규모에 맞는 트레이드오프 선택**입니다. 반응이 좋으면 VIPER와 TCA 같은 더 무거운 선택지들도 이어서 다뤄볼게요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [iOS MVVM 패턴, 바인딩 없으면 반쪽인 이유 (Combine·Observation 예제)](/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/)
- [iOS MVC 패턴, Massive View Controller가 생기는 진짜 이유](/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
- [Swift 커스텀 에러 메시지 정의, LocalizedError 완벽 정리 (예제 포함)](/error-description/)
<!-- /RELATED-POSTS -->
