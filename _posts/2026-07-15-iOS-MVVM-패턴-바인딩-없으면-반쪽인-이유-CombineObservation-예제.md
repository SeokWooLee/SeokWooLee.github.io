---
title: "iOS MVVM 패턴, 바인딩 없으면 반쪽인 이유 (Combine·Observation 예제)"
description: "지난 편에서 Massive View Controller가 생기는 이유를 다뤘습니다. 뷰컨트롤러가 View와 Controller를 겸하는 바람에, 갈 곳 없는 코드가 전부 그리로 몰린다는 이야기였죠."
header:
  og_image: /assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/1.png
tags:
  - iOS
  - MVVM
  - 아키텍처
  - ViewModel
permalink: /iOS-MVVM-패턴-바인딩-없으면-반쪽인-이유-CombineObservation-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

지난 편에서 Massive View Controller가 생기는 이유를 다뤘습니다. 뷰컨트롤러가 View와 Controller를 겸하는 바람에, 갈 곳 없는 코드가 전부 그리로 몰린다는 이야기였죠.

그 해법으로 가장 널리 쓰이는 게 **MVVM(Model-View-ViewModel)**입니다. 그런데 MVVM을 도입했다는 코드를 열어보면 이런 경우가 의외로 많습니다. 이름만 ViewModel인 클래스가 있고, 뷰컨트롤러가 여전히 값을 일일이 꺼내서 화면에 반영하고 있는 구조요.

오늘은 ViewModel의 진짜 역할이 뭔지, 그리고 왜 바인딩 없는 MVVM이 반쪽짜리인지 정리해보겠습니다.

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/1.png" alt="MVVM의 완성은 ViewModel이 아니라 바인딩입니다">
  <figcaption>MVVM의 완성은 ViewModel이 아니라 바인딩입니다</figcaption>
</figure>

---

## ViewModel은 화면 상태를 만드는 공장입니다

MVVM의 세 축은 이렇게 나뉩니다.

- **Model**: 데이터와 비즈니스 로직 (MVC와 동일)
- **View**: 화면 표시. iOS에서는 UIView와 UIViewController 둘 다 여기 속합니다
- **ViewModel**: Model의 데이터를 **화면에 보여줄 형태로 가공**하고, 화면의 상태를 들고 있는 객체

포인트가 두 가지 있습니다.

첫째, MVVM에서는 **UIViewController가 View 쪽**입니다. 지난 편의 문제였던 뷰컨트롤러의 애매한 위치를 아예 View로 못 박아버린 거예요. 뷰컨트롤러는 화면을 그리는 일만 하고, 판단은 전부 ViewModel에 넘깁니다.

둘째, ViewModel은 **UIKit을 몰라야 합니다**. `import UIKit`이 없어야 한다는 뜻이에요. `Date`를 받아 "3분 전" 같은 문자열로 바꾸고, 로딩 중인지 아닌지를 Bool로 들고 있는 것까지가 ViewModel의 일입니다. 그 문자열을 어떤 UILabel에 넣을지는 View의 일이고요.

이 분리 덕분에 ViewModel은 화면 없이 테스트할 수 있습니다. "포스트가 0개면 안내 문구가 나온다"를 UIViewController 없이 순수 로직으로 검증할 수 있게 되는 거죠.

---

## 바인딩이 없으면 왜 반쪽일까요?

여기까지만 하고 멈추면 이런 코드가 됩니다.

```swift
// 바인딩 없는 "무늬만 MVVM"
final class ProfileViewController: UIViewController {
    let viewModel = ProfileViewModel()

    func refresh() {
        viewModel.load()
        nameLabel.text = viewModel.displayName   // 값을 직접 꺼내서
        statusLabel.text = viewModel.statusText  // 하나하나 반영
        emptyView.isHidden = !viewModel.isEmpty
    }
}
```

ViewModel의 상태가 바뀔 때마다 뷰컨트롤러가 `refresh()`를 잊지 않고 불러줘야 합니다. 호출 타이밍을 하나라도 빠뜨리면 화면과 상태가 어긋나요. 상태를 옮겼을 뿐, "상태와 화면을 동기화하는 책임"은 여전히 뷰컨트롤러에 남아 있는 겁니다.

MVVM이 마이크로소프트의 WPF에서 태어날 때부터 **데이터 바인딩을 전제로 설계된** 이유가 여기 있어요. "ViewModel이 바뀌면 View가 따라 바뀐다"가 자동으로 보장돼야 비로소 완성이에요.

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/2.png" alt="구독 한 번 걸어두면 화면이 상태를 알아서 따라옵니다">
  <figcaption>구독 한 번 걸어두면 화면이 상태를 알아서 따라옵니다</figcaption>
</figure>

---

## UIKit에서는 Combine으로 바인딩합니다

UIKit에는 내장 바인딩이 없어서 Combine을 붙이는 게 표준에 가깝습니다.

```swift
final class ProfileViewModel {
    @Published private(set) var displayName = ""
    @Published private(set) var isLoading = false

    func load() { ... }  // 완료 시 @Published 값 갱신
}

final class ProfileViewController: UIViewController {
    private var cancellables = Set<AnyCancellable>()

    override func viewDidLoad() {
        super.viewDidLoad()
        viewModel.$displayName
            .assign(to: \.text!, on: nameLabel)
            .store(in: &cancellables)
        viewModel.$isLoading
            .sink { [weak self] in self?.spinner.isAnimating = $0 }
            .store(in: &cancellables)
    }
}
```

구독을 한 번 걸어두면, 이후 ViewModel이 언제 어떻게 바뀌든 화면이 따라옵니다. "refresh를 언제 불러야 하지?"라는 고민 자체가 사라지는 거예요.

SwiftUI에서는 이 바인딩이 언어 차원에 들어와 있습니다. `@Observable`을 붙인 객체의 프로퍼티를 View가 읽기만 하면, 그 값이 바뀔 때 해당 View가 자동으로 다시 그려집니다. 구독 코드조차 필요 없어요.

---

## Massive ViewModel이라는 함정

MVVM을 도입하고 몇 달 지나면 새로운 문제를 만나게 됩니다. 이번에는 **ViewModel이 비대해지는** 거예요. 네트워크 요청, 캐싱, 비즈니스 규칙까지 전부 ViewModel로 들어가면, 괴물의 위치만 옮긴 셈이 됩니다.

ViewModel은 어디까지나 **프레젠테이션 로직**(화면 상태 가공)의 자리입니다. 데이터를 가져오는 일은 Repository나 Service로, 비즈니스 규칙은 Model 계층으로 내려보내야 해요. MVVM은 View와 나머지를 나누는 패턴이지, 나머지 전부를 ViewModel에 담으라는 패턴이 아닙니다.

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/3.png" alt="전부 밀어 넣으면 괴물의 위치만 옮긴 셈이 됩니다">
  <figcaption>전부 밀어 넣으면 괴물의 위치만 옮긴 셈이 됩니다</figcaption>
</figure>

---

## 정리

- ViewModel은 Model 데이터를 화면용 상태로 가공하는 객체이고, UIKit을 몰라야 합니다. 그래야 화면 없이 테스트할 수 있어요.
- 상태만 옮기고 바인딩이 없으면, 동기화 책임이 뷰컨트롤러에 그대로 남습니다. MVVM은 바인딩까지 있어야 완성입니다.
- UIKit에서는 Combine, SwiftUI에서는 @Observable이 그 바인딩을 담당합니다.
- 모든 로직을 ViewModel에 담으면 Massive ViewModel이 됩니다. 프레젠테이션 로직까지만 맡기세요.

그런데 SwiftUI에서는 View 자체가 상태를 선언적으로 반영하는 구조라, "ViewModel이 아예 필요 없다"는 주장도 힘을 얻고 있습니다. 이 논쟁은 다음 편에서 정면으로 다뤄보겠습니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 옵저버 패턴, NotificationCenter부터 Combine까지 (실전 정리)](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Swift 커스텀 에러 메시지 정의, LocalizedError 완벽 정리 (예제 포함)](/error-description/)
- [SwiftUI에 ViewModel이 필요 없다? MV 패턴 논쟁 총정리](/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
