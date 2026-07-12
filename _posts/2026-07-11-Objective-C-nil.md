---
title: "Objective-C nil vs Java null 비교, 왜 다르게 동작할까"
description: "개발자로 처음 iOS를 만졌을 때 저를 제일 당황하게 한 게 이거였어요."
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - ObjectiveC
  - nil
  - iOS개발
  - NullPointerException
  - objcmsgSend
  - Swift옵셔널
  - 프로그래밍
  - 런타임
  - 개발공부
  - 코딩
permalink: /Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 **한국어** · [English](/en/Objective-C-nil/) · [日本語](/ja/Objective-C-nil/) · [中文](/zh/Objective-C-nil/)
{: .notice--info}

개발자로 처음 iOS를 만졌을 때 저를 제일 당황하게 한 게 이거였어요.

Java나 C++에서는 nil(널) 객체에 뭔가를 시키면 바로 앱이 죽잖아요. 그 유명한 NullPointerException이요.

그런데 Objective-C는 nil한테 메시지를 보내도 조용합니다. 크래시도 없고 에러도 없어요.

처음엔 "이거 버그 아니야?" 싶었는데, 알고 보니 언어가 일부러 그렇게 설계된 거더라고요.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-C nil 메시지는 예외 대신 조용히 넘어갑니다">
  <figcaption>Objective-C nil 메시지는 예외 대신 조용히 넘어갑니다</figcaption>
</figure>

결론부터 말씀드리면, Objective-C에서 nil에 메시지를 보내면 아무 일도 일어나지 않고 그냥 0(또는 nil)을 돌려줍니다.

이건 실수를 방치하는 게 아니라, 언어 차원에서 의도적으로 만든 안전장치예요.

오늘은 왜 이런 동작이 가능한지, 그리고 이걸 어떻게 받아들이면 좋은지 이야기해볼게요.

---

## nil 메시지 전송이 왜 안 죽을까?

핵심은 Objective-C의 메시지 전송 방식에 있어요.

우리가 `[object doSomething]` 이렇게 코드를 쓰면, 컴파일러는 이걸 `objc_msgSend(object, @selector(doSomething))` 라는 함수 호출로 바꿉니다.

메서드를 직접 부르는 게 아니라, "이 객체한테 이 메시지 좀 전달해줘" 하고 런타임에 부탁하는 구조예요.

그런데 이 `objc_msgSend` 함수는 맨 처음에 받는 객체가 nil인지 아닌지를 확인합니다.

받는 객체가 nil이면?

> 메서드를 찾으러 가지 않고, 그 자리에서 곧바로 0을 반환하며 조용히 끝냅니다.

즉, nil은 "메시지를 삼켜버리는 존재"인 셈이에요. 보내봤자 아무 데도 도착하지 않으니 죽을 일도 없는 거죠.

```objc
// receiver가 nil이면 메서드를 찾지 않고 즉시 0 반환
NSString *name = nil;
NSUInteger len = [name length];  // 크래시 없이 len == 0
```

---

## NullPointerException과 뭐가 다른 건가요?

많이들 헷갈려 하시는 부분이라 표로 정리해봤어요.

| 구분 | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| null에 메서드 호출 | 무시하고 0/nil 반환 | NullPointerException 발생 |
| 앱 동작 | 죽지 않고 계속 진행 | 예외로 크래시 |
| 처리 주체 | 런타임(objc_msgSend) | JVM 예외 처리 |

Java는 null 참조에 접근하는 순간 "그런 객체 없는데?" 하면서 예외를 던져요.

반면 Objective-C 런타임은 nil을 정상적인 값으로 취급합니다.

그래서 자바 개발자가 Objective-C로 넘어오면 이 차이 때문에 한동안 어색해하시더라고요.

반환값도 타입에 따라 조금씩 달라요. 객체 타입이면 nil, 숫자 타입이면 0, 구조체면 0으로 채워진 값이 돌아옵니다.

---

## 안 죽는 게 무조건 좋은 걸까?

솔직히 말하면 양날의 검이에요.

장점은 분명합니다. nil 체크 코드를 곳곳에 도배하지 않아도 되거든요.

예를 들어 배열이 비어 있어서 nil이 반환돼도, 거기에 `count`를 물어보면 그냥 0이 나오니 흐름이 끊기지 않아요.

그런데 바로 이 점이 함정이 되기도 합니다.

버그가 크래시로 드러나지 않고 조용히 묻혀버리거든요.

저도 예전에 데이터가 화면에 안 뜨길래 한참을 헤맸는데, 알고 보니 중간에 어떤 객체가 nil이라 메시지가 전부 무시되고 있던 거였어요.

크래시라도 났으면 금방 찾았을 텐데, 조용히 넘어가니 원인 추적이 더 오래 걸렸죠.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="직접 돌려보면 정말 안 죽는지 금방 확인됩니다">
  <figcaption>직접 돌려보면 정말 안 죽는지 금방 확인됩니다</figcaption>
</figure>

그래서 nil이 흘러가도 되는 자리인지, 아니면 반드시 값이 있어야 하는 자리인지를 개발자가 구분하는 습관이 중요해요.

---

## 실무에서 어떻게 다루면 좋을까?

제가 쓰는 방법 몇 가지를 정리해볼게요.

1. 중요한 분기에서는 nil을 명시적으로 체크한다 (`if (object == nil)`)
2. nil이 반환될 수 있는 메서드는 주석이나 이름으로 표시해둔다
3. 예상치 못한 nil이 의심되면 `NSAssert`로 개발 단계에서 걸러낸다

특히 Swift로 넘어가면 이야기가 또 달라져요.

Swift는 아예 옵셔널(Optional)이라는 개념으로 nil 가능성을 타입 시스템에 못 박아버립니다.

nil일 수 있는 값은 반드시 물음표를 붙여 표시하고 풀어서 쓸 때도 안전하게 처리하도록 강제하죠.

말하자면 Objective-C의 "조용히 넘어가기"를 Swift는 "미리 드러내기"로 바꾼 셈이에요.

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Swift와 나란히 보면 설계 철학 차이가 보여요">
  <figcaption>Swift와 나란히 보면 설계 철학 차이가 보여요</figcaption>
</figure>

---

Objective-C가 nil 메시지에 안 죽는 건 버그가 아니라 철학입니다.

편리한 만큼 조용한 버그도 감춰지니, "왜 안 죽지?"를 이해하고 나면 오히려 더 단단한 코드를 쓸 수 있게 돼요.

혹시 지금 iOS 코드에서 원인 모를 빈 화면을 만나셨다면, 중간에 nil이 슬쩍 지나가고 있진 않은지 한번 살펴보세요. 분명 도움이 될 거예요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Objective-C 메모리 관리 역사: MRC에서 ARC까지 총정리](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [YAGNI 정리, 개발자의 '언젠가 쓰겠지'가 비싼 이유](/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
