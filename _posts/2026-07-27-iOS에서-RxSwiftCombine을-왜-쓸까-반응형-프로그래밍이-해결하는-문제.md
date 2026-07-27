---
title: "iOS에서 RxSwift·Combine을 왜 쓸까? 반응형 프로그래밍이 해결하는 문제"
description: "iOS 개발 공부를 하다 보면 어느 시점에 반드시 RxSwift나 Combine이라는 벽을 만나게 됩니다. 채용 공고에는 빠지지 않고 등장하는데, 막상 코드를 열어보면 map, flatMap, sink가 줄줄이 이어지는 낯선 문법에 당황하기 쉽습니다. \"그냥 클로저랑…"
header:
  og_image: /assets/images/posts/74ee8235-bb8c-45f0-b76d-7ea13ff47f71/1.png
tags:
  - iOS
  - RxSwift
  - Combine
  - 반응형프로그래밍
permalink: /iOS에서-RxSwiftCombine을-왜-쓸까-반응형-프로그래밍이-해결하는-문제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

iOS 개발 공부를 하다 보면 어느 시점에 반드시 RxSwift나 Combine이라는 벽을 만나게 됩니다. 채용 공고에는 빠지지 않고 등장하는데, 막상 코드를 열어보면 `map`, `flatMap`, `sink`가 줄줄이 이어지는 낯선 문법에 당황하기 쉽습니다. "그냥 클로저랑 델리게이트로도 잘 돌아가는데, 굳이 이걸 배워야 하나?"라는 의문이 드는 게 자연스러워요.

오늘은 문법 이전에 **왜 이런 도구가 필요해졌는지**부터 정리해보겠습니다. 이유를 알고 나면 문법은 따라옵니다.

<figure>
  <img src="/assets/images/posts/74ee8235-bb8c-45f0-b76d-7ea13ff47f71/1.png" alt="제각각인 다섯 가지 이벤트 전달 방식이 하나의 스트림으로 합쳐집니다">
  <figcaption>제각각인 다섯 가지 이벤트 전달 방식이 하나의 스트림으로 합쳐집니다</figcaption>
</figure>

---

## iOS 앱은 사실 "이벤트 처리 기계"입니다

앱이 하는 일을 뜯어보면 대부분 이벤트에 반응하는 일입니다.

- 사용자가 버튼을 탭한다 → 화면을 바꾼다
- 네트워크 응답이 도착한다 → 목록을 갱신한다
- 키보드가 올라온다 → 입력창을 위로 밀어올린다
- 텍스트필드 값이 바뀐다 → 검색 결과를 다시 요청한다

문제는 UIKit이 이 이벤트들을 **제각각 다른 방식으로** 전달한다는 점입니다.

| 이벤트 소스 | 전달 방식 |
|---|---|
| 버튼 탭 | target-action |
| 테이블뷰 스크롤 | delegate |
| 네트워크 응답 | completion handler(클로저) |
| 키보드 등장 | NotificationCenter |
| 객체 속성 변화 | KVO(Key-Value Observing) |

한 화면에서 이 다섯 가지가 동시에 쓰이는 게 iOS에서는 지극히 평범한 풍경입니다. 같은 "이벤트에 반응한다"는 일인데 코드 모양은 다섯 가지로 흩어져 있으니, 화면 하나의 동작을 파악하려면 뷰컨트롤러 곳곳을 뒤져야 합니다.

RxSwift와 Combine이 해결하려는 첫 번째 문제가 바로 이겁니다. **모든 이벤트를 "시간에 따라 흘러오는 값의 스트림"이라는 하나의 형태로 통일**하는 거예요. 버튼 탭도, 네트워크 응답도, 키보드 알림도 전부 같은 인터페이스로 다루게 됩니다.

---

## 콜백으로 버티다 보면 만나는 두 가지 벽

### 벽 1: 비동기 작업의 조합

"프로필 화면에 유저 정보와 최근 글 목록을 동시에 요청해서, **둘 다 도착하면** 화면을 그린다"는 흔한 요구사항을 completion handler로 짜보면 이렇게 됩니다.

```swift
var user: User?
var posts: [Post]?

func loadProfile() {
    let group = DispatchGroup()
    group.enter()
    api.fetchUser { result in
        user = try? result.get()
        group.leave()
    }
    group.enter()
    api.fetchPosts { result in
        posts = try? result.get()
        group.leave()
    }
    group.notify(queue: .main) {
        guard let user, let posts else { /* 에러 처리는 또 어디서? */ return }
        render(user, posts)
    }
}
```

DispatchGroup, 중간 저장용 변수, 흩어진 에러 처리까지 동원해야 합니다. 요청이 셋, 넷으로 늘고 "A가 끝나면 그 결과로 B를 요청"하는 의존 관계까지 섞이면 중첩은 걷잡을 수 없이 깊어져요. 이른바 콜백 지옥입니다.

Combine에서는 같은 요구사항이 이렇게 표현됩니다.

```swift
api.fetchUser()
    .zip(api.fetchPosts())
    .receive(on: DispatchQueue.main)
    .sink(receiveCompletion: { completion in
        if case .failure(let error) = completion { showError(error) }
    }, receiveValue: { user, posts in
        render(user, posts)
    })
    .store(in: &cancellables)
```

"둘을 묶어서(zip), 메인 스레드에서 받아(receive), 성공이면 그리고 실패면 알린다." 코드가 요구사항을 거의 그대로 읽어줍니다. 에러 처리도 한 곳으로 모이고요.

### 벽 2: 연속된 이벤트의 제어

검색창을 생각해봅시다. 글자를 입력할 때마다 API를 호출하면 "스위프트" 여섯 글자에 요청이 여섯 번 나갑니다. 그래서 보통 이런 조건이 붙습니다.

- 입력이 멈추고 0.3초 지난 뒤에만 요청한다 (debounce)
- 직전 검색어와 같으면 요청하지 않는다 (중복 제거)
- 새 요청이 나가면 아직 안 끝난 이전 요청은 취소한다

이걸 Timer와 플래그 변수로 직접 구현해보면, 타이머 무효화 시점과 요청 취소 타이밍이 얽히면서 버그가 나기 딱 좋은 코드가 됩니다. Combine에서는 이미 검증된 연산자를 이어 붙이는 것으로 끝납니다.

```swift
searchTextSubject
    .debounce(for: .seconds(0.3), scheduler: DispatchQueue.main)
    .removeDuplicates()
    .map { api.search(query: $0) }
    .switchToLatest()   // 새 요청이 오면 이전 요청 자동 취소
    .sink { results in render(results) }
    .store(in: &cancellables)
```

핵심은 이겁니다. **시간이 개입하는 이벤트 제어 로직을 직접 구현하지 않고 검증된 부품을 조립해서 해결한다.** 반응형 프로그래밍의 가치가 가장 선명하게 드러나는 지점입니다.

<figure>
  <img src="/assets/images/posts/74ee8235-bb8c-45f0-b76d-7ea13ff47f71/2.png" alt="시간 제어 로직은 직접 구현하지 않고 검증된 연산자를 조립합니다" loading="lazy">
  <figcaption>시간 제어 로직은 직접 구현하지 않고 검증된 연산자를 조립합니다</figcaption>
</figure>

---

## MVVM 바인딩의 표준 부품

이전 글에서 다뤘듯 MVVM(Model-View-ViewModel)은 "ViewModel이 바뀌면 View가 자동으로 따라 바뀐다"는 바인딩이 있어야 완성됩니다. 그런데 UIKit에는 내장 바인딩이 없어요. 이 빈자리를 채워온 게 RxSwift(RxCocoa)였고, iOS 13부터는 Combine이 그 역할을 이어받았습니다.

```swift
viewModel.$isLoading
    .sink { [weak self] in self?.spinner.isAnimating = $0 }
    .store(in: &cancellables)
```

실무에서 RxSwift나 Combine을 요구하는 채용 공고가 많은 실질적인 이유가 여기 있습니다. MVVM 기반 코드베이스에서 바인딩 계층이 사실상 이 두 프레임워크 중 하나로 만들어져 있기 때문입니다.

---

## RxSwift와 Combine, 뭐가 다를까요?

둘은 개념적으로 같은 반응형 프로그래밍 도구입니다. Observable이 Publisher로, `subscribe`가 `sink`로 이름만 바뀌었다고 봐도 큰 무리가 없을 정도예요. 하나를 익히면 다른 하나는 용어 대응표만으로 넘어갈 수 있습니다. 그래도 선택 기준은 분명합니다.

- **RxSwift**: 서드파티 라이브러리. iOS 버전 제약이 없고 RxCocoa 덕분에 UIKit 바인딩이 풍부하며, 오래 쌓인 자료와 커뮤니티가 강점입니다. 대신 외부 의존성이 생기고 빌드 시간이 늘어납니다.
- **Combine**: 애플 퍼스트파티 프레임워크. iOS 13 이상에서 의존성 추가 없이 쓸 수 있고 SwiftUI의 `@Published`, `ObservableObject`와 자연스럽게 맞물립니다. 다만 UIKit 바인딩 지원은 RxCocoa보다 얇습니다.

새 프로젝트라면 Combine이 무난한 기본값이고 RxSwift는 기존 코드베이스가 그걸로 쓰여 있는 팀에 합류할 때 배우게 되는 경우가 많습니다.

<figure>
  <img src="/assets/images/posts/74ee8235-bb8c-45f0-b76d-7ea13ff47f71/3.png" alt="RxSwift와 Combine은 같은 일을 하는 두 공구함, 선택 기준은 팀 상황입니다" loading="lazy">
  <figcaption>RxSwift와 Combine은 같은 일을 하는 두 공구함, 선택 기준은 팀 상황입니다</figcaption>
</figure>

---

## async/await가 나왔는데도 필요할까요?

Swift 5.5의 async/await 이후 "이제 Combine은 안 배워도 되지 않나?"라는 질문이 자주 나옵니다. 절반은 맞는 말입니다. **"요청 한 번, 응답 한 번"으로 끝나는 단발성 비동기**는 async/await가 훨씬 읽기 좋습니다. 위의 프로필 예제도 `async let` 두 줄이면 됩니다.

하지만 앞서 본 검색창처럼 **값이 계속 흘러들어오는 스트림**은 이야기가 다릅니다. 텍스트 입력, 위치 업데이트, 웹소켓 메시지, ViewModel 상태 변화처럼 끝나지 않고 이어지는 이벤트에 debounce나 combineLatest 같은 시간 기반 제어를 걸어야 한다면, 여전히 반응형 도구의 영역입니다. 애플도 AsyncSequence로 이 영역을 넓혀가고 있지만 연산자 생태계는 아직 Combine 쪽이 두텁습니다.

정리하면 이렇게 됩니다.

- 단발성 비동기(네트워크 요청 등) → **async/await**
- 지속되는 이벤트 스트림 + 시간 기반 제어, UI 바인딩 → **Combine(또는 RxSwift)**

둘은 경쟁 관계라기보다 담당 구역이 다른 도구입니다.

---

## 마무리

RxSwift와 Combine을 쓰는 이유를 한 문장으로 줄이면 이렇습니다. **제각각인 비동기 이벤트를 하나의 스트림 인터페이스로 통일하고 그 위에서 조합·시간 제어·바인딩을 선언적으로 처리하기 위해서**입니다.

- 델리게이트·클로저·노티피케이션으로 흩어진 이벤트 처리를 한 가지 방식으로 통일합니다
- 여러 비동기 작업의 조합을 중첩 콜백 없이 표현합니다
- debounce, 중복 제거, 요청 취소 같은 시간 제어를 검증된 연산자로 해결합니다
- MVVM 바인딩의 사실상 표준 부품입니다

문법이 낯설어서 진입 장벽이 높아 보이지만, "이벤트를 값의 스트림으로 본다"는 관점 하나만 잡히면 연산자들은 배열의 `map`, `filter`를 시간 축으로 확장한 것에 지나지 않습니다. 다음 편에서는 Combine의 Publisher와 Subscriber가 실제로 어떻게 맞물려 돌아가는지 내부 동작을 뜯어보겠습니다.
