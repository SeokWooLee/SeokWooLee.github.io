---
title: "[iOS 아키텍처 #4] MVP vs MVVM 차이, Presenter와 ViewModel은 뭐가 다를까 (면접 대비)"
description: "iOS 아키텍처 면접에서 단골로 나오는 질문이 있습니다."
header:
  og_image: /assets/images/posts/4b118d20-6c27-4d0a-ad4a-7ec1b68ffb16/1.png
tags:
  - iOS
  - MVP
  - MVVM
  - Presenter
permalink: /iOS-아키텍처-4-MVP-vs-MVVM-차이-Presenter와-ViewModel은-뭐가-다를까-면접-대비/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

iOS 아키텍처 면접에서 단골로 나오는 질문이 있습니다.

"MVP와 MVVM의 차이가 뭔가요?"

둘 다 뷰컨트롤러를 다이어트시키는 패턴이고 둘 다 가운데에 중간 객체(Presenter/ViewModel)를 둡니다. 구조도만 보면 상자 이름 하나 바뀐 수준이라 답하기가 은근히 까다로워요.

오늘은 이 둘의 차이를 딱 하나의 기준으로 정리해보겠습니다. **"중간 객체가 View를 아는가, 모르는가"**입니다.

<figure>
  <img src="/assets/images/posts/4b118d20-6c27-4d0a-ad4a-7ec1b68ffb16/1.png" alt="차이는 하나, 중간 객체가 View를 아는가 모르는가">
  <figcaption>차이는 하나, 중간 객체가 View를 아는가 모르는가</figcaption>
</figure>

---

## MVP: Presenter가 View에게 명령합니다

MVP(Model-View-Presenter)에서 Presenter는 **View를 알고 있습니다**. 정확히는 View가 구현한 프로토콜(인터페이스)을 참조해요.

```swift
protocol ProfileViewProtocol: AnyObject {
    func showName(_ name: String)
    func showLoading(_ isLoading: Bool)
}

final class ProfilePresenter {
    weak var view: ProfileViewProtocol?

    func load() {
        view?.showLoading(true)
        // ...데이터 로드 후
        view?.showName("홍길동")
        view?.showLoading(false)
    }
}
```

흐름이 보이시나요? Presenter가 데이터를 가공한 뒤 **view에게 직접 "이걸 표시해"라고 명령**합니다. View(뷰컨트롤러)는 프로토콜 메서드를 구현해두고 시키는 대로만 그리면 돼요.

- 장점: 흐름이 명시적이라 따라가기 쉽고 바인딩 프레임워크가 전혀 필요 없습니다
- 단점: 화면 요소가 늘어날수록 프로토콜 메서드가 계속 불어납니다. `showName`, `showAge`, `showBadge`...

---

## MVVM: ViewModel은 View의 존재를 모릅니다

반면 MVVM(Model-View-ViewModel)의 ViewModel은 **View를 참조하지 않습니다**. 그냥 상태를 들고 있을 뿐이에요.

```swift
final class ProfileViewModel {
    @Published private(set) var displayName = ""
    @Published private(set) var isLoading = false

    func load() {
        isLoading = true
        // ...데이터 로드 후
        displayName = "홍길동"
        isLoading = false
    }
}
```

`view?.showName(...)` 같은 호출이 없습니다. ViewModel은 자기 상태만 갱신하고 **View 쪽에서 그 상태를 구독(바인딩)해서** 알아서 그립니다. 명령의 방향이 뒤집힌 거예요.

- MVP: Presenter → View로 **밀어넣기(push)**
- MVVM: View가 ViewModel을 **구독해서 끌어오기(observe)**

이 차이 때문에 MVVM은 바인딩 수단(Combine, @Observable 등)이 사실상 필수입니다. 바인딩 없는 MVVM이 반쪽짜리인 이유는 지난 편에서 자세히 다뤘어요.

<figure>
  <img src="/assets/images/posts/4b118d20-6c27-4d0a-ad4a-7ec1b68ffb16/2.png" alt="Presenter는 밀어넣고, ViewModel은 구독당합니다" loading="lazy">
  <figcaption>Presenter는 밀어넣고, ViewModel은 구독당합니다</figcaption>
</figure>

---

## 테스트 코드를 보면 차이가 선명해집니다

두 패턴 모두 "화면 없이 로직을 테스트한다"가 목표인데, 테스트 방식이 다릅니다.

MVP 테스트는 **가짜 View를 만들어서 호출을 기록**해야 합니다.

```swift
final class MockView: ProfileViewProtocol {
    var shownName: String?
    func showName(_ name: String) { shownName = name }
    func showLoading(_ isLoading: Bool) {}
}
// presenter.load() 후 mockView.shownName 검증
```

MVVM 테스트는 mock 없이 **상태 값만 확인**하면 끝입니다.

```swift
let vm = ProfileViewModel()
vm.load()
#expect(vm.displayName == "홍길동")
```

프로토콜도, mock 객체도 필요 없어요. ViewModel이 View를 모르기 때문에 생기는 실질적인 이득입니다.

---

## 그럼 뭘 써야 할까요?

기준은 의외로 단순합니다. **바인딩 수단이 자연스럽게 있느냐**예요.

- **SwiftUI, 또는 Combine을 쓰는 UIKit** → MVVM이 자연스럽습니다. 바인딩이 공짜니까요.
- **바인딩 도입이 부담스러운 레거시 UIKit** → MVP가 오히려 실용적입니다. 프로토콜만으로 굴러가고 흐름이 명시적이라 온보딩도 쉬워요.

요즘 iOS에서 MVVM이 사실상 표준처럼 자리 잡은 건 MVP보다 우월해서라기보다, **Combine과 @Observable이 프레임워크 차원에서 제공되면서 MVVM의 유일한 진입 장벽(바인딩)이 사라졌기 때문**에 가깝습니다.

<figure>
  <img src="/assets/images/posts/4b118d20-6c27-4d0a-ad4a-7ec1b68ffb16/3.png" alt="바인딩이 공짜인 환경인지가 선택 기준이에요" loading="lazy">
  <figcaption>바인딩이 공짜인 환경인지가 선택 기준이에요</figcaption>
</figure>

---

## 정리

- MVP와 MVVM의 본질적 차이는 하나입니다. Presenter는 View(프로토콜)를 알고 직접 명령하고 ViewModel은 View를 모른 채 상태만 노출합니다.
- 그래서 MVP는 바인딩이 필요 없고 MVVM은 바인딩이 필수입니다.
- 테스트에서 MVP는 mock View가 필요하고 MVVM은 상태 검증만으로 끝납니다.
- 바인딩이 공짜인 환경(SwiftUI·Combine)이면 MVVM, 아니면 MVP도 충분히 좋은 선택입니다.

다음 편에서는 여기서 한 발 더 나간 모듈 분리의 극단, VIPER를 다룹니다. 대형 앱들이 왜 도입했고 왜 떠났는지까지 정리해볼게요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [SwiftUI에 ViewModel이 필요 없다? MV 패턴 논쟁 총정리](/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [iOS MVVM 패턴, 바인딩 없으면 반쪽인 이유 (Combine·Observation 예제)](/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/)
<!-- /RELATED-POSTS -->
