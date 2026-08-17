---
title: "델리게이트(Delegate) vs 클로저(Closure), 콜백 선택 기준 3가지"
description: "델리게이트와 클로저는 같은 콜백 요구를 처리하지만 결이 다릅니다. 같은 예제를 나란히 구현해 드러나는 다섯 가지 실질 차이와, 이벤트 개수·관계 수명·반환값 필요 여부로 고르는 기준을 정리했습니다."
header:
  og_image: /assets/images/posts/dd72093d-d3f8-4824-9d42-ce0749a0b226/delegate-vs-closure-1.jpg
categories:
  - Swift
  - iOS
tags:
  - Swift
  - 스위프트
  - 델리게이트
  - delegate
permalink: /델리게이트Delegate-vs-클로저Closure-콜백-선택-기준-3가지/
toc: true
toc_sticky: true
last_modified_at: 2026-08-14
---

"이 콜백, 델리게이트로 뺄까요 클로저로 받을까요?" iOS 코드 리뷰에서 유독 자주 나오는 질문입니다.

둘 다 "일이 생기면 알려줘"라는 같은 요구를 처리하는 도구라서, 기능만 보면 어느 쪽으로도 구현이 됩니다.

UIKit은 델리게이트 천지입니다(UITableViewDelegate, UITextFieldDelegate). 그런데 애플의 새 API들은 클로저를 받고, 팀마다 컨벤션도 갈리죠.

이 글은 두 방식을 같은 예제로 나란히 구현해 차이를 드러내고 선택 기준을 정리합니다.

델리게이트 패턴 자체의 문법과 옵저버와의 비교는 별도 글에서 다뤘고, 클로저의 캡처·순환 참조 원리도 클로저 편에서 정리했습니다. 여기서는 두 글의 교차점인 "선택"에 집중합니다.

<figure>
  <img src="/assets/images/posts/dd72093d-d3f8-4824-9d42-ce0749a0b226/delegate-vs-closure-1.jpg" alt="DELEGATE VS CLOSURE 텍스트와 계약서·메시지 캡슐을 맞세운 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>계약을 타입으로 선언하느냐, 이벤트를 값으로 주고받느냐</figcaption>
</figure>

## 같은 문제, 두 가지 답 — 나란히 놓고 보기

이미지 피커 화면을 만든다고 해볼게요. 사용자가 사진을 고르면 호출한 화면에 알려줘야 합니다.

델리게이트 버전입니다.

```swift
protocol ImagePickerDelegate: AnyObject {
    func imagePicker(_ picker: ImagePickerVC, didSelect image: UIImage)
    func imagePickerDidCancel(_ picker: ImagePickerVC)
}

final class ImagePickerVC: UIViewController {
    weak var delegate: ImagePickerDelegate?

    private func selectionDone(_ image: UIImage) {
        delegate?.imagePicker(self, didSelect: image)
    }
}

// 호출하는 쪽
extension ProfileVC: ImagePickerDelegate {
    func imagePicker(_ picker: ImagePickerVC, didSelect image: UIImage) {
        avatarView.image = image
    }
    func imagePickerDidCancel(_ picker: ImagePickerVC) { /* 무시 */ }
}
```

클로저 버전입니다.

```swift
final class ImagePickerVC: UIViewController {
    var onSelect: ((UIImage) -> Void)?
    var onCancel: (() -> Void)?

    private func selectionDone(_ image: UIImage) {
        onSelect?(image)
    }
}

// 호출하는 쪽
let picker = ImagePickerVC()
picker.onSelect = { [weak self] image in
    self?.avatarView.image = image
}
```

동작은 같습니다. 차이는 구조에서 나요.

델리게이트는 통신 계약을 프로토콜이라는 타입으로 먼저 선언하고, 받는 쪽이 그 계약 전체를 채택합니다. 클로저는 계약 없이 이벤트 하나하나를 값으로 주고받고요.

이 구조 차이가 아래의 실질적인 차이들로 이어집니다.

## 다섯 가지 실질 차이

**첫째, 이벤트 수가 늘어날 때의 확장성.** 델리게이트는 이벤트가 5개, 10개로 늘어도 프로토콜에 메서드를 추가하면 됩니다.

관련 이벤트들이 하나의 계약으로 묶여 있고, 채택자는 "이 화면과 주고받는 대화 전체"를 extension 한 곳에 모아 구현하게 되죠. UITableViewDelegate에 메서드가 수십 개인데도 관리가 되는 이유입니다.

클로저는 이벤트마다 프로퍼티가 하나씩 늘어납니다. 서너 개를 넘어가면 설정 코드가 흩어지고, "어떤 콜백을 안 꽂았는지"를 컴파일러가 안 잡아줘요.

델리게이트는 필수 메서드 미구현이 컴파일 에러인 반면, 클로저 프로퍼티는 nil인 채로 조용히 넘어갑니다.

**둘째, 설정 지점의 거리.** 클로저의 강점은 이벤트를 소비하는 코드가 이벤트를 일으키는 호출 바로 옆에 붙는다는 겁니다.

피커를 여는 코드와 결과를 받는 코드가 세 줄 안에 있으니 흐름이 한눈에 읽혀요. 델리게이트는 설정(delegate = self)과 구현(extension)이 파일 안에서 떨어져 있습니다.

단발성 상호작용에는 그 의식이 과하죠. 네트워크 요청 완료, 알럿 버튼 응답, 애니메이션 종료처럼 "한 번 일어나고 끝나는" 이벤트에 클로저가 표준이 된 이유입니다.

**셋째, 상태와 정체성.** 델리게이트 메서드에는 관례적으로 발신자가 첫 인자로 옵니다(`imagePicker(_:didSelect:)`의 picker).

한 화면이 테이블뷰 두 개를 쓸 때 어느 쪽에서 온 이벤트인지 구분할 수 있는 건 이 관례 덕분이에요.

클로저는 발신자 전달이 자동이 아니라서, 같은 상황이면 클로저를 두 벌 꽂거나 발신자를 인자에 직접 설계해야 합니다.

**넷째, 메모리 관리의 함정 위치.** 둘 다 순환 참조 위험이 있는데 함정의 모양이 다릅니다.

델리게이트는 선언 시점에 `weak var delegate` 한 번으로 끝나고, 관례가 워낙 강해서 실수가 드뭅니다. 클로저는 꽂는 곳마다 [weak self] 판단을 반복해야 해요.

ARC(Automatic Reference Counting, 자동 참조 계수) 편에서 정리한 그대로입니다. 소유 고리가 없는 일회성 실행이면 weak가 불필요하지만, 프로퍼티로 저장되는 콜백은 순환 후보죠.

그 판단을 사용처마다 다시 하는 겁니다. 실수의 표면적은 클로저 쪽이 넓습니다.

**다섯째, 테스트와 재사용.** 클로저는 테스트에서 가볍습니다.

목 객체 없이 테스트 본문에서 콜백을 바로 꽂고 호출 여부를 검증하면 되니까요. 델리게이트는 테스트용 스파이 클래스를 만들어야 해서 준비 코드가 붙습니다.

대신 델리게이트 프로토콜은 "이 컴포넌트와 통신하는 법"의 문서 역할을 합니다. 여러 화면이 같은 컴포넌트를 재사용할 때 계약이 명시적이라는 장점이 있어요.

<figure>
  <img src="/assets/images/posts/dd72093d-d3f8-4824-9d42-ce0749a0b226/delegate-vs-closure-2.jpg" alt="회의실의 계약과 창구의 쪽지로 델리게이트와 클로저를 비유한 비교 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>델리게이트는 회의실의 계약, 클로저는 창구의 쪽지</figcaption>
</figure>

## 선택 기준 — 이벤트의 개수·수명·방향으로 정한다

차이를 알았으니 기준으로 압축하겠습니다. 세 가지 질문이면 대부분 정리됩니다.

**질문 1 — 이벤트가 몇 개인가.** 하나나 둘이면 클로저, 셋을 넘고 앞으로 늘어날 관계면 델리게이트.

이벤트 묶음이 "대화"에 가까워질수록 계약(프로토콜)의 값어치가 커집니다.

**질문 2 — 관계의 수명이 어떤가.** 요청-응답처럼 짧게 끝나면 클로저, 화면이 살아 있는 내내 지속적으로 오가는 관계(스크롤 이벤트, 텍스트 편집 중 검증)면 델리게이트.

오래 사는 관계일수록 weak delegate 한 곳의 안전함이 사용처마다의 [weak self]보다 유리해집니다.

**질문 3 — 값을 되돌려받아야 하는가.** 델리게이트 메서드는 반환값을 가질 수 있습니다.

`textField(_:shouldChangeCharactersIn:)`가 대표적이죠. "해도 되는지"를 물어보는 질의형 통신은 델리게이트의 홈그라운드예요.

클로저로도 반환형을 설계할 수는 있지만, 저장된 옵셔널 클로저의 반환값 처리(nil이면 기본값은?)가 어색해집니다.

경계가 애매한 자리도 물론 있습니다. 그럴 때 참고할 만한 외부 신호가 애플의 최근 방향이에요.

UIAction 기반 버튼 핸들러, `UICollectionViewDiffableDataSource`의 클로저 프로바이더가 그렇습니다. async/await로의 이행(에러 처리 편에서 본 completion 핸들러의 세대교체)도 같은 흐름이고요.

단발성·데이터 공급형 통신은 꾸준히 클로저·async 쪽으로 이동 중입니다.

반면 지속적 상호작용의 표준은 델리게이트로 남아 있습니다. UITableViewDelegate, UINavigationControllerDelegate가 그렇죠.

프레임워크의 이 분업 구도가 위의 세 질문과 정확히 일치합니다.

한 가지 안티패턴만 짚어둡니다. 메서드가 하나뿐인 델리게이트 프로토콜을 화면마다 새로 만드는 코드입니다.

단일 이벤트에 프로토콜 선언, 채택, weak 프로퍼티, extension까지 네 겹의 의식을 치르는 건 대부분 과설계예요. 그 자리는 클로저 한 줄이 맞습니다.

반대 극단, 클로저 프로퍼티가 예닐곱 개 붙은 클래스는 델리게이트로 묶으라는 신호고요.

<figure>
  <img src="/assets/images/posts/dd72093d-d3f8-4824-9d42-ce0749a0b226/delegate-vs-closure-3.jpg" alt="이벤트 수·관계 수명·반환값 세 질문으로 갈라지는 콜백 선택 흐름도" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>이벤트 수·관계 수명·반환값, 세 질문이면 결정됩니다</figcaption>
</figure>

## 정리

- 델리게이트와 클로저는 같은 요구("일이 생기면 알려줘")의 두 구현입니다. 차이의 뿌리는 계약을 타입으로 선언하느냐(프로토콜), 이벤트를 값으로 주고받느냐입니다.
- 실질 차이 다섯 가지: 이벤트 확장성과 미구현 검출은 델리게이트, 설정 지점의 응집은 클로저, 발신자 구분은 델리게이트 관례, 메모리 함정 표면적은 클로저가 넓고, 테스트 경량성은 클로저가 우세합니다.
- 선택은 세 질문으로: 이벤트가 셋 이상인가, 관계가 오래 사는가, 반환값이 필요한가. 셋 다 아니면 클로저, 하나라도 강하게 그렇다면 델리게이트입니다.
- 단일 메서드 델리게이트 프로토콜과 클로저 프로퍼티 대여섯 개는 서로 반대 방향의 과설계 신호입니다.

두 도구의 각론이 궁금하다면 이어서 읽어 보세요. 델리게이트 패턴 편은 옵저버와의 비교, 1:1 통신의 정석을 다룹니다.

클로저 완전 정리 편에서는 캡처·weak self·escaping을 정리했고요.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [Swift DI 라이브러리 Factory 정리, Swinject와 뭐가 다를까](/Swift-DI-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-Factory-%EC%A0%95%EB%A6%AC-Swinject%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C/)
- [\[Swift 심화 #3\] Sendable과 Swift 6 동시성 에러 마이그레이션](/Swift-%EC%8B%AC%ED%99%94-3-Sendable%EA%B3%BC-Swift-6-%EB%8F%99%EC%8B%9C%EC%84%B1-%EC%97%90%EB%9F%AC-%EB%A7%88%EC%9D%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%85%98/)
<!-- /RELATED-POSTS -->
