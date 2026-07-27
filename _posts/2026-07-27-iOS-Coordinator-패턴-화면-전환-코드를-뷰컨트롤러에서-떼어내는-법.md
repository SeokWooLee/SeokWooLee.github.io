---
title: "iOS Coordinator 패턴, 화면 전환 코드를 뷰컨트롤러에서 떼어내는 법"
description: "iOS 앱을 만들다 보면 뷰컨트롤러가 자꾸 뚱뚱해지는 순간이 옵니다."
header:
  og_image: /assets/images/posts/302b7b3b-2f5e-4f5f-bb02-47ab8e2e9deb/1.png
tags:
  - iOS
  - Coordinator패턴
  - 스위프트
  - Swift
permalink: /iOS-Coordinator-패턴-화면-전환-코드를-뷰컨트롤러에서-떼어내는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

iOS 앱을 만들다 보면 뷰컨트롤러가 자꾸 뚱뚱해지는 순간이 옵니다.

화면 그리는 코드에, 데이터 처리에, 거기다 다음 화면으로 넘어가는 `pushViewController`까지 다 뒤섞이죠.

그냥 두면 화면 흐름이 복잡해질수록 어디서 어디로 넘어가는지 추적이 안 됩니다.

오늘은 그 화면 전환 로직을 뷰컨트롤러에서 깔끔하게 떼어내는 **iOS Coordinator 패턴**을 이야기해보려 합니다.

결론부터 말씀드리면, Coordinator 패턴은 "화면 전환을 담당하는 별도 객체"를 하나 두는 방식입니다. 뷰컨트롤러는 화면만 그리고 "다음에 어디로 갈지"는 Coordinator에게 맡기는 거예요.

<figure>
  <img src="/assets/images/posts/302b7b3b-2f5e-4f5f-bb02-47ab8e2e9deb/1.png" alt="Coordinator 패턴을 쓰면 뷰컨트롤러와 화면 전환이 이렇게 나뉩니다">
  <figcaption>Coordinator 패턴을 쓰면 뷰컨트롤러와 화면 전환이 이렇게 나뉩니다</figcaption>
</figure>

---

## Coordinator 패턴이 뭔가요?

한 줄로 정의하면 이렇습니다.

> Coordinator는 화면 전환(네비게이션) 흐름을 전담하는 객체입니다.

원래 뷰컨트롤러는 화면을 그리고 사용자 입력을 받고 다음 화면으로 넘기는 일까지 혼자 다 했습니다.

이 중에서 **다음 화면으로 넘기는 일**만 쏙 빼서 Coordinator에게 맡기는 거예요.

그러면 뷰컨트롤러는 "버튼이 눌렸다"는 사실만 Coordinator에게 알려주면 됩니다.

실제로 어디로, 어떻게 넘어갈지는 몰라도 되는 거죠.

덕분에 뷰컨트롤러끼리 서로를 직접 알 필요가 없어집니다. A화면이 B화면의 존재를 몰라도 되니 재사용도 훨씬 쉬워져요.

---

## 왜 화면 전환을 떼어내야 할까요?

뷰컨트롤러 안에 화면 전환 코드가 있으면 생기는 문제가 꽤 많습니다.

제가 직접 겪었던 걸 정리해봤어요.

- **의존성이 얽힘**: A화면이 B화면을 직접 생성하니, B가 바뀌면 A도 같이 고쳐야 함
- **재사용 불가**: 같은 화면을 다른 흐름에서 쓰려면 전환 코드를 또 손봐야 함
- **흐름 파악이 어려움**: 화면 이동 로직이 20개 파일에 흩어져 전체 그림이 안 보임
- **테스트가 힘듦**: 전환 로직이 뷰컨트롤러에 묶여 단독 테스트가 까다로움

전환 로직을 한곳에 모으면 이 문제들이 상당 부분 풀립니다.

"이 앱의 화면 흐름"이 Coordinator 파일 하나만 봐도 눈에 들어오거든요.

---

## Coordinator 어떻게 만드나요?

기본 구조는 생각보다 단순합니다.

먼저 공통 규격이 되는 프로토콜을 하나 정의합니다. `start()`가 시작점 역할을 해요.

```swift
protocol Coordinator: AnyObject {
    var navigationController: UINavigationController { get }
    func start()
}
```

그다음 실제 Coordinator를 만듭니다. 여기서 첫 화면을 만들고 화면에 띄우는 일까지 담당합니다.

```swift
final class MainCoordinator: Coordinator {
    let navigationController: UINavigationController
    init(nav: UINavigationController) { self.navigationController = nav }

    func start() {
        let vc = HomeViewController()
        vc.coordinator = self          // 전환 요청을 받을 통로
        navigationController.pushViewController(vc, animated: false)
    }

    func showDetail() {                // 다음 화면 전환은 여기서만
        let vc = DetailViewController()
        navigationController.pushViewController(vc, animated: true)
    }
}
```

뷰컨트롤러는 버튼이 눌리면 `coordinator?.showDetail()`만 호출하면 끝입니다.

<figure>
  <img src="/assets/images/posts/302b7b3b-2f5e-4f5f-bb02-47ab8e2e9deb/4-1783847591092.png" alt="버튼 한 번 누르면 나머지는 Coordinator가 다 알아서" loading="lazy">
  <figcaption>버튼 한 번 누르면 나머지는 Coordinator가 다 알아서</figcaption>
</figure>

어느 화면으로 가는지, 어떻게 밀어 넣는지까지는 신경 쓰지 않아도 되죠.

<figure>
  <img src="/assets/images/posts/302b7b3b-2f5e-4f5f-bb02-47ab8e2e9deb/2.png" alt="이 한 줄 호출만 남기면 뷰컨트롤러가 훨씬 홀가분해져요" loading="lazy">
  <figcaption>이 한 줄 호출만 남기면 뷰컨트롤러가 훨씬 홀가분해져요</figcaption>
</figure>

---

## 세구에나 직접 push랑 뭐가 다를까요?

많이들 헷갈려 하시는 부분이라 표로 정리했습니다.

| 항목 | 직접 push / Segue | Coordinator 패턴 |
|------|------------------|-----------------|
| 전환 로직 위치 | 뷰컨트롤러 안 | Coordinator에 모임 |
| 화면 간 의존성 | 서로 직접 앎 | 서로 몰라도 됨 |
| 화면 재사용 | 어려움 | 쉬움 |
| 흐름 파악 | 여러 파일에 흩어짐 | 한곳에서 관리 |
| 초기 작업량 | 적음 | 다소 많음 |

보시면 Coordinator가 만능은 아닙니다.

화면이 두세 개뿐인 작은 앱이라면 오히려 코드만 늘어나 배보다 배꼽이 커질 수 있어요.

반대로 로그인, 온보딩, 탭 전환처럼 흐름이 여러 갈래로 뻗는 앱이라면 확실히 값을 합니다.

<figure>
  <img src="/assets/images/posts/302b7b3b-2f5e-4f5f-bb02-47ab8e2e9deb/3.png" alt="흐름이 여러 갈래로 뻗는 앱일수록 값을 합니다" loading="lazy">
  <figcaption>흐름이 여러 갈래로 뻗는 앱일수록 값을 합니다</figcaption>
</figure>

---

## 자주 묻는 것들

**Q. 화면이 여러 개면 Coordinator도 여러 개 만드나요?**

네. 보통 흐름 단위로 나눕니다. 로그인 흐름, 메인 흐름처럼요. 상위 Coordinator가 하위를 자식으로 관리하는 구조를 많이 씁니다.

**Q. 자식 Coordinator는 언제 정리하나요?**

흐름이 끝나면 부모가 자식 참조를 배열에서 제거해줘야 합니다. 안 그러면 메모리에 계속 남아 누수가 생겨요.

**Q. SwiftUI에서도 쓰나요?**

SwiftUI는 `NavigationStack`과 `path` 기반 라우팅이 있어 결이 조금 다릅니다. 다만 흐름을 별도 객체로 뺀다는 아이디어는 그대로 응용할 수 있어요.

---

처음엔 파일이 하나 더 늘어 번거롭게 느껴질 수 있습니다.

그런데 화면이 열 개, 스무 개로 불어나는 순간 이 구조의 고마움을 체감하시게 될 거예요.

작은 화면 흐름 하나부터 Coordinator로 떼어내 보세요. 뷰컨트롤러가 한결 가벼워지는 걸 직접 느끼실 겁니다. 🙂

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 미디에이터 패턴(Mediator Pattern) 완벽 정리 (객체 간 통신 중재자에게 맡기기)](/Swift-%EB%AF%B8%EB%94%94%EC%97%90%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4Mediator-Pattern-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EA%B0%9D%EC%B2%B4-%EA%B0%84-%ED%86%B5%EC%8B%A0-%EC%A4%91%EC%9E%AC%EC%9E%90%EC%97%90%EA%B2%8C-%EB%A7%A1%EA%B8%B0%EA%B8%B0/)
- [[Swift 기초 #6] Swift 문자열은 왜 text[0]이 안 될까? 그래핌 클러스터(Grapheme Cluster) 총정리](/Swift-%EA%B8%B0%EC%B4%88-6-Swift-%EB%AC%B8%EC%9E%90%EC%97%B4%EC%9D%80-%EC%99%9C-text0%EC%9D%B4-%EC%95%88-%EB%90%A0%EA%B9%8C-%EA%B7%B8%EB%9E%98%ED%95%8C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0Grapheme-Cluster-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 클래스(class)와 구조체(struct) 차이 총정리 (값 타입·참조 타입)](/Swift-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EC%B0%A8%EC%9D%B4-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EA%B0%92-%ED%83%80%EC%9E%85%EC%B0%B8%EC%A1%B0-%ED%83%80%EC%9E%85/)
<!-- /RELATED-POSTS -->
