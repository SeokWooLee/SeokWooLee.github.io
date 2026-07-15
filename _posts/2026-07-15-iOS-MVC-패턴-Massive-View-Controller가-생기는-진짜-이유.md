---
title: "iOS MVC 패턴, Massive View Controller가 생기는 진짜 이유"
description: "iOS 개발을 하다 보면 한 번쯤 듣게 되는 농담이 있습니다."
header:
  og_image: /assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/1.png
tags:
  - iOS
  - MVC
  - 아키텍처
  - UIKit
  - 뷰컨트롤러
  - Swift
  - iOS개발
  - MassiveViewController
  - 앱개발
  - iOS아키텍처
permalink: /iOS-MVC-패턴-Massive-View-Controller가-생기는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 **한국어** · [English](/en/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

iOS 개발을 하다 보면 한 번쯤 듣게 되는 농담이 있습니다.

"MVC는 Model-View-Controller가 아니라 Massive View Controller의 약자다."

우스갯소리지만 뼈가 있는 말이에요. 분명 Apple이 공식으로 권장하는 아키텍처인데, 왜 따라 하다 보면 뷰컨트롤러가 수천 줄짜리 괴물이 되는 걸까요?

오늘은 iOS 아키텍처 시리즈 첫 편으로, **MVC가 원래 어떤 그림이었는지, 그리고 iOS에서는 왜 그 그림대로 안 되는지**를 정리해보겠습니다.

결론부터 말씀드리면, 문제는 MVC라는 개념이 아니라 **UIViewController라는 클래스가 View와 Controller의 경계에 걸쳐 있다는 구조** 자체에 있습니다.

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/1.png" alt="Model도 View도 아닌 코드는 결국 전부 뷰컨트롤러로 모입니다">
  <figcaption>Model도 View도 아닌 코드는 결국 전부 뷰컨트롤러로 모입니다</figcaption>
</figure>

---

## 원래 MVC는 어떤 그림이었나

MVC는 1979년 Smalltalk에서 나온 아주 오래된 패턴입니다. 원형은 세 역할이 명확히 나뉘어 있어요.

- **Model**: 데이터와 비즈니스 로직
- **View**: 화면 표시
- **Controller**: 사용자 입력을 받아 Model에 전달

원형 MVC에서는 View가 Model을 직접 관찰합니다. Model이 바뀌면 View가 알아서 갱신되는 구조였죠.

그런데 Apple의 MVC는 조금 다릅니다. View와 Model이 서로를 전혀 모르게 하고, **Controller가 가운데서 모든 중개를 담당**하게 바꿨어요. 재사용성을 높이려는 합리적인 선택이었지만 대신 Controller에게 일이 몰릴 길을 열어둔 셈입니다.

---

## UIViewController는 이름부터 반칙입니다

Apple MVC의 Controller는 iOS에서 UIViewController로 구현됩니다. 그런데 이 클래스의 이름을 다시 보세요. **View + Controller**입니다. 이름부터 두 역할이 붙어 있어요.

실제로 UIViewController는 이런 일을 전부 담당합니다.

- `viewDidLoad`, `viewWillAppear` 같은 **뷰 생명주기** 관리
- 화면 회전, 레이아웃 갱신 같은 **뷰에 밀착된 이벤트** 처리
- `UITableViewDataSource`, `UITableViewDelegate` 같은 **뷰 프로토콜** 구현

여기까지는 그래도 뷰 관련 일입니다. 문제는 "그럼 네트워크 요청은 어디에 쓰지?", "화면 전환은?", "데이터 포매팅은?"이라는 질문에 마땅한 답이 없다는 거예요. Model도 View도 아니니, 결국 전부 뷰컨트롤러로 들어갑니다.

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/2.png" alt="이름부터 View+Controller, 혼자서 다 하는 게 기본값이에요">
  <figcaption>이름부터 View+Controller, 혼자서 다 하는 게 기본값이에요</figcaption>
</figure>

---

## 비대해진 뷰컨트롤러의 전형적인 모습

흔히 보게 되는 뷰컨트롤러의 구조를 코드로 요약하면 이렇습니다.

```swift
final class ProfileViewController: UIViewController {
    // 1. 뷰 프로퍼티들
    private let tableView = UITableView()

    // 2. 상태(사실상 Model 캐시)
    private var user: User?
    private var posts: [Post] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayout()          // 3. 레이아웃 코드
        fetchProfile()         // 4. 네트워크 요청
    }

    private func fetchProfile() {
        URLSession.shared.dataTask(...) { ... }  // 5. 파싱, 에러 처리
    }

    @objc private func editTapped() {
        // 6. 화면 전환까지 직접
        navigationController?.pushViewController(EditViewController(), animated: true)
    }
}
```

레이아웃, 상태 관리, 네트워크, 파싱, 화면 전환이 한 파일에 다 있습니다. 여기에 delegate 구현부까지 붙으면 금방 천 줄을 넘겨요.

이 구조의 진짜 비용은 줄 수가 아니라 **테스트가 불가능하다는 점**입니다. "user가 nil이면 편집 버튼이 숨겨진다" 같은 단순한 로직을 검증하려 해도, UIViewController를 통째로 띄우고 생명주기를 흉내 내야 하거든요.

---

## 그럼 MVC는 버려야 할까요?

그렇지는 않습니다. 규모가 작은 화면에서는 MVC가 여전히 가장 빠르고 단순한 선택이에요. Apple의 프레임워크 자체가 MVC를 전제로 설계돼 있어서 억지로 다른 구조를 얹으면 오히려 마찰이 생기기도 합니다.

핵심은 MVC를 쓰더라도 **뷰컨트롤러에서 떼어낼 수 있는 책임을 의식적으로 떼어내는 것**입니다.

- 네트워크·데이터 로직 → 별도 서비스 객체로
- 화면 전환 → Coordinator 같은 전담 객체로
- 셀 구성, 포매팅 → 전용 타입으로

그리고 "화면에 보여줄 상태를 만드는 로직"까지 분리하고 싶어지는 순간이 옵니다. 그 답이 바로 다음 편에서 다룰 **MVVM**입니다. ViewModel이라는 객체가 왜 필요한지, 그리고 바인딩이 없으면 왜 반쪽짜리인지 이어서 정리해볼게요.

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/3.png" alt="떼어낼 수 있는 책임부터 의식적으로 분리하는 게 시작입니다">
  <figcaption>떼어낼 수 있는 책임부터 의식적으로 분리하는 게 시작입니다</figcaption>
</figure>

---

## 정리

- MVC 자체는 죄가 없습니다. 문제는 UIViewController가 View와 Controller 역할을 겸하는 iOS의 구조적 특성이에요.
- Model도 View도 아닌 코드가 갈 곳이 없어서 전부 뷰컨트롤러에 쌓이는 것이 Massive View Controller의 정체입니다.
- 작은 화면에는 MVC가 여전히 유효합니다. 다만 네트워크·화면 전환·포매팅은 의식적으로 분리해야 해요.
- 뷰 상태를 만드는 로직까지 분리하려면 MVVM이 필요합니다. 다음 편에서 다룹니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 싱글톤 패턴, shared가 안티패턴 소리 듣는 진짜 이유](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
- [Swift 커스텀 에러 메시지 정의, LocalizedError 완벽 정리 (예제 포함)](/error-description/)
- [Swift 옵저버 패턴, NotificationCenter부터 Combine까지 (실전 정리)](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
