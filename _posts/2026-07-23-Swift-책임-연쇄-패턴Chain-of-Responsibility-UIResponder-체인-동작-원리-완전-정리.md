---
title: "Swift 책임 연쇄 패턴(Chain of Responsibility), UIResponder 체인 동작 원리 완전 정리"
description: "Swift로 iOS 앱을 만들다 보면 버튼을 눌렀는데 왜 이 뷰컨트롤러가 이벤트를 받는 걸까 궁금했던 순간이 다들 있으실 거예요."
header:
  og_image: /assets/images/posts/f7301cd2-fb4d-4c74-92d4-201cfcfec04b/1.png
tags:
  - Swift
  - 책임연쇄패턴
  - UIResponder
  - iOS개발
permalink: /Swift-책임-연쇄-패턴Chain-of-Responsibility-UIResponder-체인-동작-원리-완전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-23
---

Swift로 iOS 앱을 만들다 보면 버튼을 눌렀는데 왜 이 뷰컨트롤러가 이벤트를 받는 걸까 궁금했던 순간이 다들 있으실 거예요.

터치 이벤트가 화면 어디서 어떻게 흘러가는지 파고들어 보면, 그 밑바닥에 책임 연쇄 패턴이 깔려 있습니다.

결론부터 말씀드리면, UIResponder 체인은 GoF 디자인 패턴 중 하나인 책임 연쇄 패턴(Chain of Responsibility)을 애플이 프레임워크 차원에서 구현해 둔 대표적인 사례입니다. 이벤트를 처리할 객체를 찾을 때까지 responder들이 다음 responder에게 책임을 넘기는 구조예요.

이 글에서는 책임 연쇄 패턴이 뭔지, UIResponder 체인이 실제로 어떻게 동작하는지, 그리고 이걸 알면 실무에서 뭐가 좋은지까지 제가 직접 코드를 뜯어보며 이해한 내용을 정리해드릴게요.

<figure>
  <img src="/assets/images/posts/f7301cd2-fb4d-4c74-92d4-201cfcfec04b/1.png" alt="책임 연쇄 패턴이 UIResponder 체인으로 이렇게 위로 흘러갑니다">
  <figcaption>책임 연쇄 패턴이 UIResponder 체인으로 이렇게 위로 흘러갑니다</figcaption>
</figure>

## 핵심 요약 먼저

1. 책임 연쇄 패턴은 요청을 처리할 객체를 찾을 때까지 여러 객체가 사슬처럼 요청을 넘기는 디자인 패턴입니다.
2. iOS의 UIResponder 체인이 바로 이 패턴을 프레임워크 레벨에서 구현한 것입니다.
3. 터치 이벤트는 UIView에서 시작해 상위 뷰, 뷰컨트롤러, 윈도우, 애플리케이션 순으로 올라갑니다.
4. next 프로퍼티가 체인의 다음 고리를 가리키며, 아무도 처리하지 않으면 이벤트는 그냥 버려집니다.

---

## 책임 연쇄 패턴이 뭔가요?

책임 연쇄 패턴은 요청을 보내는 쪽과 처리하는 쪽을 느슨하게 떼어놓는 행동 패턴입니다.

쉽게 비유하면 회사에서 결재 올릴 때랑 비슷해요. 대리가 처리할 수 있으면 대리 선에서 끝나고 못 하면 과장에게, 과장도 안 되면 부장에게 넘어가죠.

요청을 넣는 사람은 누가 최종 결재를 하는지 몰라도 됩니다. 그냥 사슬의 첫 고리에 던지면 알아서 흘러가니까요.

이 패턴의 핵심은 각 처리 객체가 두 가지만 안다는 점입니다. 하나는 내가 이 요청을 처리할 수 있는가, 다른 하나는 못 하면 다음 객체가 누구인가.

Swift로 아주 단순하게 옮겨보면 이런 뼈대가 됩니다.

```swift
class Handler {
    var next: Handler?  // 체인의 다음 고리
    func handle(_ request: Int) {
        // 처리 못 하면 다음 객체로 책임을 넘긴다
        next?.handle(request)
    }
}
```

next 프로퍼티 하나로 사슬이 이어지고 처리 못 하면 next에게 넘기는 이 구조가 그대로 UIResponder에 들어가 있습니다.

---

## UIResponder 체인은 어떻게 동작하나요?

iOS에서 터치, 모션, 리모트 컨트롤 같은 이벤트를 받을 수 있는 객체는 전부 UIResponder를 상속합니다. UIView도, UIViewController도, UIWindow도, UIApplication도 전부 UIResponder의 자식이에요.

그래서 이 객체들은 저마다 프로퍼티를 하나씩 갖고 있는데, 그 정확한 이름이 next입니다. UIResponder에 정의된 프로퍼티죠.

```swift
// UIResponder에 정의된 프로퍼티
var next: UIResponder? { get }
```

사용자가 화면을 터치하면 시스템은 먼저 가장 안쪽에서 터치된 뷰를 찾습니다. 이걸 히트 테스트라고 부르는데, 이때 first responder 후보가 정해져요.

그 뷰가 이벤트를 처리하지 않으면 next를 따라 위로 올라갑니다. 순서는 대략 이렇습니다.

<figure>
  <img src="/assets/images/posts/f7301cd2-fb4d-4c74-92d4-201cfcfec04b/4-1783847789167.png" alt="next를 타고 위로, 위로 넘어가는 책임의 사슬" loading="lazy">
  <figcaption>next를 타고 위로, 위로 넘어가는 책임의 사슬</figcaption>
</figure>

- UIView(터치된 뷰)
- 상위 슈퍼뷰들
- 그 뷰를 관리하는 UIViewController
- UIWindow
- UIApplication
- UIApplicationDelegate

이 사슬을 끝까지 올라가도 아무도 이벤트를 처리하지 않으면, 그 이벤트는 조용히 버려집니다. 앱이 죽거나 에러가 나는 게 아니라 그냥 무시되는 거예요.

> 여기서 재밌는 게, 뷰의 next가 항상 슈퍼뷰인 건 아닙니다.
>
> 그 뷰가 뷰컨트롤러의 루트 뷰라면 next는 슈퍼뷰가 아니라 뷰컨트롤러가 됩니다.

---

## 이걸 알면 실무에서 뭐가 좋을까?

솔직히 처음엔 이런 내부 구조 몰라도 앱은 잘 돌아갑니다. 근데 알고 나면 디버깅할 때 확실히 달라집니다.

제가 겪었던 사례 하나를 말씀드릴게요. 커스텀 뷰에서 탭 제스처가 안 먹는 문제가 있었어요.

이벤트가 어느 responder에서 멈추는지 순서대로 추적하니 상위 뷰의 isUserInteractionEnabled가 false라 거기서 사슬이 끊긴 걸 금방 찾았습니다.

또 하나 유용한 게 커스텀 이벤트 전파입니다. UIResponder 체인을 타고 올라가는 메시지를 직접 정의해서, 깊숙한 뷰에서 발생한 액션을 상위 뷰컨트롤러까지 델리게이트 없이 전달할 수 있어요.

키보드를 내릴 때 자주 쓰는 endEditing(true)도 사실 이 체인을 활용한 동작입니다. first responder를 찾아 resignFirstResponder를 호출하는 방식이죠.

정리하면 이렇습니다. UIResponder 체인을 이해하면 이벤트가 안 먹을 때 어디서 끊겼는지 논리적으로 추적할 수 있고 델리게이트 남발 없이 이벤트를 위로 흘려보내는 설계도 가능해집니다.

<figure>
  <img src="/assets/images/posts/f7301cd2-fb4d-4c74-92d4-201cfcfec04b/2.png" alt="실제로 next 프로퍼티를 코드에서 뜯어보던 날" loading="lazy">
  <figcaption>실제로 next 프로퍼티를 코드에서 뜯어보던 날</figcaption>
</figure>

---

## 자주 묻는 질문

Q. first responder와 responder 체인은 다른 건가요?
A. first responder는 이벤트를 가장 먼저 받을 자격이 있는 하나의 객체이고, responder 체인은 그 first responder부터 위로 이어지는 사슬 전체를 말합니다.

Q. next는 항상 슈퍼뷰를 가리키나요?
A. 아닙니다. 일반 뷰는 슈퍼뷰를 가리키지만, 뷰컨트롤러의 루트 뷰는 next가 뷰컨트롤러가 됩니다.

<figure>
  <img src="/assets/images/posts/f7301cd2-fb4d-4c74-92d4-201cfcfec04b/3.png" alt="이 탭 하나가 어느 responder까지 올라가는지 따라가 봤어요" loading="lazy">
  <figcaption>이 탭 하나가 어느 responder까지 올라가는지 따라가 봤어요</figcaption>
</figure>

책임 연쇄 패턴이라는 이름만 보면 어렵게 느껴지지만, 결국 처리 못 하면 다음에게 넘긴다는 단순한 원리 하나예요. 오늘 이 글이 UIResponder 체인이라는 iOS의 숨은 뼈대를 이해하는 데 도움이 되었길 바랍니다. 다음에 이벤트가 안 먹는 버그를 만나면, 이 사슬을 한 고리씩 따라가 보세요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 스테이트 패턴(State Pattern)으로 if문 지옥 탈출하기](/Swift-%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-if%EB%AC%B8-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%83%81%ED%83%9C-%EA%B0%9D%EC%B2%B4-%EC%A0%95%EB%A6%AC%EB%B2%95/)
- [Swift 프록시 패턴(Proxy Pattern), lazy 뒤에 숨은 대리인 객체](/Swift-%ED%94%84%EB%A1%9D%EC%8B%9C-%ED%8C%A8%ED%84%B4-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-lazy-%EB%92%A4%EC%97%90-%EC%88%A8%EC%9D%80-%EB%8C%80%EB%A6%AC%EC%9D%B8-%EA%B0%9D%EC%B2%B4-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 이터레이터 패턴(Iterator Pattern), Sequence와 IteratorProtocol 정체 파헤치기](/Swift-%EC%9D%B4%ED%84%B0%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4Iterator-Pattern-Sequence%EC%99%80-IteratorProtocol-%EC%A0%95%EC%B2%B4-%ED%8C%8C%ED%97%A4%EC%B9%98%EA%B8%B0/)
<!-- /RELATED-POSTS -->
