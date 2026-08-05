---
title: "[iOS 아키텍처 #9] ReactorKit 정리, 단방향 아키텍처의 표준"
description: "ReactorKit은 UIKit과 RxSwift 조합에서 단방향 데이터 흐름을 표준처럼 만든 프레임워크입니다. View와 Reactor 두 역할, Mutation이라는 중간 단계가 필요한 이유, TCA와의 차이를 정리했습니다."
header:
  og_image: /assets/images/posts/317cfd0d-2a59-49f9-9bce-a85ec25ae593/reactorkit-unidirectional-flow-1.jpg
categories:
  - iOS
tags:
  - iOS
  - ReactorKit
  - RxSwift
  - 단방향
permalink: /iOS-아키텍처-9-ReactorKit-정리-단방향-아키텍처의-표준/
toc: true
toc_sticky: true
last_modified_at: 2026-08-05
---

TCA(The Composable Architecture) 편에서 단방향 데이터 흐름을 다뤘는데, 사실 국내 iOS 씬에는 그보다 먼저 단방향을 표준처럼 만든 프레임워크가 있습니다. 바로 ReactorKit입니다.

전수열(Suyeol Jeon) 님이 2017년에 공개한 이 프레임워크는 StyleShare와 카카오 계열 서비스들이 도입하면서 UIKit + RxSwift 조합의 사실상 표준 아키텍처로 자리 잡았어요. 채용 공고에 "ReactorKit 경험 우대"가 흔하게 등장하던 시기가 있었을 정도입니다.

오늘은 ReactorKit이 어떤 구조인지, TCA와 무엇이 다른지, 그리고 지금 시점에 어떤 위치인지 정리해보겠습니다.

<figure>
  <img src="/assets/images/posts/317cfd0d-2a59-49f9-9bce-a85ec25ae593/reactorkit-unidirectional-flow-1.jpg" alt="ReactorKit 단방향 데이터 흐름 View Action Reactor State 순환 다이어그램" width="1200" height="800">
  <figcaption>View에서 나간 액션이 State로 돌아오는 길은 하나뿐입니다</figcaption>
</figure>

---

## View와 Reactor, 역할은 딱 둘입니다

ReactorKit의 구조는 단순합니다. 화면 하나를 View와 Reactor 둘로 나눕니다.

- **View**: 사용자 입력을 `Action`으로 흘려보내고 `State`를 구독해 화면을 그립니다. 로직은 없습니다.
- **Reactor**: Action을 받아 State를 만들어내는 로직 덩어리입니다. UI를 전혀 모릅니다.

핵심은 Reactor 내부의 데이터 흐름이 한 방향으로 고정돼 있다는 점입니다.

```
Action → mutate() → Mutation → reduce() → State → View
```

버튼 탭이 `Action.refresh`로 들어오면, `mutate()`가 네트워크 요청 같은 부수 효과를 처리하고 `Mutation.setItems([...])`를 방출합니다. `reduce()`는 이 Mutation을 받아 새 State를 계산하죠. View는 그 State를 구독하고 있다가 화면을 갱신합니다.

## Mutation이라는 중간 단계가 왜 필요할까

MVVM(Model-View-ViewModel)에 익숙하다면 "Action에서 바로 State 바꾸면 되지 않나?"라는 의문이 들 수 있습니다. Mutation이 끼어 있는 이유는 **비동기를 격리**하기 위해서예요.

`mutate()`는 비동기 작업이 허용되는 유일한 곳입니다. 반대로 `reduce()`는 순수 함수라서 같은 State와 Mutation을 넣으면 항상 같은 결과가 나옵니다. 부수 효과가 일어나는 지점이 한 곳으로 고정되니, 상태가 왜 이렇게 바뀌었는지 추적할 때 볼 곳도 한 곳입니다.

```swift
final class SearchReactor: Reactor {
    enum Action { case updateQuery(String) }
    enum Mutation { case setResults([Repo]) }

    struct State { var results: [Repo] = [] }

    func mutate(action: Action) -> Observable<Mutation> {
        switch action {
        case .updateQuery(let query):
            return service.search(query)
                .map { Mutation.setResults($0) }
        }
    }

    func reduce(state: State, mutation: Mutation) -> State {
        var newState = state
        switch mutation {
        case .setResults(let repos): newState.results = repos
        }
        return newState
    }
}
```

Reactor는 UI를 모르는 순수 로직이라 테스트도 간단합니다. Action을 넣고 State를 확인하면 끝이에요.

<figure>
  <img src="/assets/images/posts/317cfd0d-2a59-49f9-9bce-a85ec25ae593/reactorkit-unidirectional-flow-2.png" alt="ReactorKit Action mutate Mutation reduce State 단방향 플로우 다이어그램" width="1200" height="351" loading="lazy">
  <figcaption>비동기는 mutate()에, 순수 계산은 reduce()에 격리됩니다</figcaption>
</figure>

---

## TCA와 뭐가 다를까

둘 다 Redux의 영향을 받은 단방향 아키텍처지만, 적용 단위가 다릅니다.

| | ReactorKit | TCA |
|---|---|---|
| 기반 | RxSwift | Combine·Swift Concurrency |
| 적용 단위 | 화면(View) 하나당 Reactor 하나 | 기능 단위 Reducer를 트리로 합성 |
| 도입 방식 | 화면 하나씩 점진 도입 가능 | 앱 전체를 하나의 체계로 구성 |
| 주 무대 | UIKit | SwiftUI |

ReactorKit의 실용성은 도입 방식에서 나옵니다. 기존 MVC(Model-View-Controller) 프로젝트에서 화면 하나만 골라 Reactor를 붙여도 동작해요. 앱 전체를 뜯어고칠 필요가 없습니다. 반면 TCA는 기능 간 상태 합성까지 프레임워크가 관리하는 대신, 체계 전체를 받아들여야 하죠.

참고로 Redux를 iOS에 직접 이식한 ReSwift라는 라이브러리도 있었지만, 앱 전역 단일 스토어 방식이 UIKit과 맞물리기 어려워 ReactorKit만큼 퍼지지는 못했습니다.

## 지금 시점의 ReactorKit

솔직하게 말하면, 신규 프로젝트에서 ReactorKit을 선택하는 경우는 줄고 있습니다. 약점이 뚜렷해졌기 때문이에요.

첫째, **RxSwift에 강하게 결합**돼 있습니다. 애플 생태계가 Combine과 Swift Concurrency로 넘어가면서 RxSwift 의존성 자체가 부담이 됐습니다.

둘째, **SwiftUI와 맞지 않습니다**. View 프로토콜과 바인딩 방식이 UIKit의 명령형 갱신을 전제로 설계돼 있어요.

그래도 ReactorKit이 남긴 유산은 분명합니다. "상태는 한 방향으로만 흐른다", "부수 효과는 한 곳에 격리한다"라는 감각을 국내 iOS 개발자들에게 먼저 심어준 게 이 프레임워크예요. 지금 TCA를 배우는 분이라면 Action·Mutation·State 구조가 낯설지 않을 텐데, 그 감각의 상당 부분이 ReactorKit 시대에 만들어졌습니다.

기존 UIKit + RxSwift 코드베이스를 유지보수하고 있다면 ReactorKit은 여전히 검증된 선택입니다. 화면 단위로 붙었다 떨어지는 구조 덕분에, 나중에 화면별로 걷어내며 마이그레이션하기도 상대적으로 수월하고요.

<figure>
  <img src="/assets/images/posts/317cfd0d-2a59-49f9-9bce-a85ec25ae593/reactorkit-tca-baton-handoff-3.jpg" alt="ReactorKit에서 TCA로 단방향 흐름 바통을 넘기는 릴레이 일러스트" width="1200" height="800" loading="lazy">
  <figcaption>단방향이라는 감각은 ReactorKit이 먼저 심었고 TCA가 이어받았어요</figcaption>
</figure>

---

## 정리하면

- ReactorKit은 화면 하나를 View와 Reactor로 나누고 Action → Mutation → State의 단방향 흐름을 강제하는 RxSwift 기반 아키텍처입니다.
- 비동기는 `mutate()`에, 순수 상태 계산은 `reduce()`에 격리됩니다. 그래서 추적과 테스트가 쉽습니다.
- TCA와 개념은 같지만 화면 단위 점진 도입이라는 실용 노선이 차별점입니다.
- RxSwift 결합과 SwiftUI 비호환 때문에 신규 도입은 줄었지만 UIKit 레거시에서는 여전히 유효합니다.

다음 편에서는 화면이 아니라 비즈니스 로직 단위로 앱을 쪼개는 Uber의 RIBs를 다룹니다. VIPER 편에서 한 문단으로만 언급했던 그 아키텍처를 제대로 파봅니다.

---

## 참고 자료

- [ReactorKit/ReactorKit](https://github.com/ReactorKit/ReactorKit)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [iOS에서 RxSwift·Combine을 왜 쓸까? 반응형 프로그래밍이 해결하는 문제](/iOS%EC%97%90%EC%84%9C-RxSwiftCombine%EC%9D%84-%EC%99%9C-%EC%93%B8%EA%B9%8C-%EB%B0%98%EC%9D%91%ED%98%95-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D%EC%9D%B4-%ED%95%B4%EA%B2%B0%ED%95%98%EB%8A%94-%EB%AC%B8%EC%A0%9C/)
<!-- /RELATED-POSTS -->
