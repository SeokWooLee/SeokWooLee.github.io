---
title: "Objective-C 메시지 포워딩 3단계, unrecognized selector 크래시 전 마지막 세 번의 기회"
description: "iOS 크래시 로그에서 가장 자주 만나는 문장 중 하나가 unrecognized selector sent to instance입니다."
header:
  og_image: /assets/images/posts/67f3c7b4-b296-4421-acf9-175360fc12a8/objc-message-forwarding-1.jpg
tags:
  - ObjectiveC
  - 메시지포워딩
  - FastForwarding
  - forwardInvocation
permalink: /Objective-C-메시지-포워딩-3단계-unrecognized-selector-크래시-전-마지막-세-번의-기회/
toc: true
toc_sticky: true
last_modified_at: 2026-07-29
---

iOS 크래시 로그에서 가장 자주 만나는 문장 중 하나가 `unrecognized selector sent to instance`입니다.

그런데 이 크래시, 사실 "즉사"가 아닙니다. Objective-C 런타임은 크래시를 내기 전에 그 객체에게 **세 번의 기회**를 줍니다. 이 구제 절차가 바로 메시지 포워딩(Message Forwarding)입니다.

지난 objc_msgSend 글에서 "메서드 탐색이 실패하면 포워딩 3단계가 돌아간다"까지 정리했는데, 이번 글은 그 세 단계를 하나씩 코드로 뜯어봅니다. 특히 2단계가 왜 **Fast Forwarding**이라는 별명으로 불리는지, 그리고 3단계에서 메서드 시그니처가 왜 필요한지가 핵심입니다.

<figure>
  <img src="/assets/images/posts/67f3c7b4-b296-4421-acf9-175360fc12a8/objc-message-forwarding-1.jpg" alt="Objective-C 메시지 포워딩 개념 썸네일, 닫힌 문에 튕긴 메시지를 받아내는 3개의 안전망" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>크래시가 나기 전, 세 개의 그물이 순서대로 기다리고 있습니다</figcaption>
</figure>

---

## 전체 지도: 세 번의 기회와 비용

메서드 탐색이 최상위 클래스까지 올라가도 IMP(메서드의 실제 구현을 가리키는 함수 포인터)를 못 찾으면, 런타임은 아래 순서로 물어봅니다.

| 단계 | 메서드 | 질문 | 비용 |
|---|---|---|---|
| 1. 동적 메서드 해석 | `resolveInstanceMethod:` | "지금이라도 메서드를 추가할래?" | 저렴 |
| 2. 대체 수신자 | `forwardingTargetForSelector:` | "대신 받을 객체라도 있어?" | 저렴 (Fast) |
| 3. 완전한 포워딩 | `methodSignatureForSelector:` + `forwardInvocation:` | "메시지를 통째로 줄 테니 알아서 해볼래?" | 비쌈 |

순서가 곧 비용 순서입니다. 런타임은 가장 싼 방법부터 물어보고 전부 거절당하면 `doesNotRecognizeSelector:`가 호출되면서 그 유명한 크래시가 납니다.

---

## 1단계: resolveInstanceMethod: — 지금이라도 만들어 붙이기

첫 번째 질문은 클래스 메서드로 옵니다. 여기서 `class_addMethod`로 구현을 붙이고 YES를 리턴하면, 메시지 전송이 처음부터 다시 시작되고 이번엔 성공합니다.

```objc
void dynamicIMP(id self, SEL _cmd) {
    NSLog(@"동적으로 추가된 구현");
}

+ (BOOL)resolveInstanceMethod:(SEL)sel {
    if (sel == @selector(dynamicMethod)) {
        class_addMethod(self, sel, (IMP)dynamicIMP, "v@:");
        return YES;
    }
    return [super resolveInstanceMethod:sel];
}
```

세 번째 인자의 `"v@:"`는 타입 인코딩입니다. 반환값 void(v), 수신자 id(@), 셀렉터(:) — 모든 Objective-C 메서드가 숨겨진 인자 두 개(self, _cmd)를 받는다는 사실이 여기서 드러납니다.

이 단계의 대표 고객이 Core Data입니다. `@dynamic`으로 선언된 프로퍼티는 컴파일 타임에 접근자가 없고 처음 호출되는 순간 이 단계에서 실시간으로 만들어집니다.

한 가지 주의할 점이 있습니다. `resolveInstanceMethod:`는 포워딩 상황이 아니어도 호출될 수 있습니다. `respondsToSelector:`나 KVC(Key-Value Coding)가 내부적으로 메서드를 조회할 때도 불리기 때문에, 이 안에서 로깅을 하면 예상보다 훨씬 자주 찍힙니다.

---

## 2단계: forwardingTargetForSelector: — Fast Forwarding의 정체

두 번째 질문은 "네가 처리 못 하면, 대신 처리할 객체라도 알려줄래?"입니다.

```objc
- (id)forwardingTargetForSelector:(SEL)aSelector {
    if ([self.helper respondsToSelector:aSelector]) {
        return self.helper;
    }
    return [super forwardingTargetForSelector:aSelector];
}
```

nil이 아닌 객체를 리턴하면 메시지가 통째로 그 객체에게 다시 전송됩니다. 이 단계가 **Fast Forwarding**이라 불리는 이유는 3단계와 비교하면 명확합니다. NSInvocation 객체를 만들지 않고 수신자만 바꿔치기하기 때문에, 일반 메시지 전송과 거의 같은 비용으로 끝납니다.

실전 활용처가 명확한 단계이기도 합니다.

- **다중 상속 흉내**: 여러 helper 객체에 셀렉터별로 위임하면, 상속 없이 여러 클래스의 능력을 합칠 수 있습니다
- **weak proxy**: NSTimer의 retain cycle을 끊는 중간 대리 객체가 이 지점(정확히는 NSProxy의 포워딩)을 이용합니다
- **API 안전망**: 신버전 OS에만 있는 메서드를 구버전에서 대체 객체로 돌리는 방어 코드

<figure>
  <img src="/assets/images/posts/67f3c7b4-b296-4421-acf9-175360fc12a8/objc-message-forwarding-2.png" alt="objc_msgSend 탐색 실패 후 메시지 포워딩 3단계 분기 흐름도, resolveInstanceMethod부터 forwardInvocation까지" width="1200" height="1280" loading="lazy" decoding="async">
  <figcaption>세 단계 중 하나만 성공해도 크래시는 없습니다</figcaption>
</figure>

---

## 3단계: 완전한 포워딩 — 시그니처가 먼저 필요한 이유

2단계까지 거절하면 런타임은 마지막 수단을 꺼냅니다. 그런데 이 단계는 메서드 하나가 아니라 **두 개를 세트로** 오버라이드해야 합니다.

```objc
- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector {
    NSMethodSignature *sig = [super methodSignatureForSelector:aSelector];
    if (!sig) {
        sig = [self.target methodSignatureForSelector:aSelector];
    }
    return sig;
}

- (void)forwardInvocation:(NSInvocation *)invocation {
    for (id target in self.targets) {
        if ([target respondsToSelector:invocation.selector]) {
            [invocation invokeWithTarget:target];
        }
    }
}
```

왜 시그니처가 먼저일까요? 런타임이 메시지를 NSInvocation 객체로 포장하려면 **인자가 몇 개고 각각 몇 바이트인지** 알아야 하기 때문입니다. `methodSignatureForSelector:`가 유효한 시그니처를 리턴하지 못하면, forwardInvocation:은 아예 호출되지 않고 곧장 크래시로 갑니다.

NSInvocation을 손에 쥐면 할 수 있는 일이 많아집니다. 인자를 바꾸거나, 위 예제처럼 **여러 객체에 같은 메시지를 뿌리거나**(멀티캐스트 델리게이트), 응답을 기록해뒀다 나중에 재생할 수도 있습니다. NSUndoManager의 `prepareWithInvocationTarget:`이 바로 이 방식입니다. 실행취소할 메서드 호출을 NSInvocation으로 캡처해뒀다가 undo 시점에 재생합니다.

가장 유연하지만 가장 비쌉니다. NSInvocation 생성과 인자 패킹 비용 때문에, 애플 문서도 "일반적인 메시지 전송보다 훨씬 느리다"고 못을 박아둡니다. 성능이 중요한 경로라면 2단계에서 끝내는 게 정답입니다.

---

## 함정: respondsToSelector:는 포워딩을 모른다

포워딩으로 메시지를 잘 처리하는 객체라도, `respondsToSelector:`에게 물어보면 NO라고 답합니다. 셀렉터 조회는 메서드 리스트만 보고, 포워딩 경로는 실제로 메시지를 보내봐야 작동하기 때문입니다.

그래서 포워딩 기반 프록시를 제대로 만들려면 `respondsToSelector:`도 함께 오버라이드해서 "그 메시지, 나 받을 수 있어"라고 거짓말을 맞춰줘야 합니다. 델리게이트 체크(`if ([delegate respondsToSelector:...])`)가 흔한 Objective-C 세계에서 이걸 빼먹으면, 포워딩이 멀쩡히 준비돼 있어도 호출 자체가 오지 않는 미스터리를 만나게 됩니다.

NSProxy가 NSObject를 상속하지 않는 별도의 루트 클래스인 이유도 여기에 닿아 있습니다. 상속받은 메서드가 많을수록 포워딩까지 내려오지 않고 자기가 처리해버리는 메시지가 많아지니, 아예 뼈대만 남긴 클래스를 따로 만든 겁니다. 이 이야기는 NSProxy 글에서 따로 다루겠습니다.

<figure>
  <img src="/assets/images/posts/67f3c7b4-b296-4421-acf9-175360fc12a8/objc-message-forwarding-3.jpg" alt="로봇이 다른 로봇에게 메시지 봉투를 건네는 Fast Forwarding 대체 수신자 일러스트" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>2단계는 수신자만 바꿔서 넘깁니다, 그래서 빠릅니다</figcaption>
</figure>

---

## 정리

- unrecognized selector 크래시는 즉사가 아니라 **3단계 구제 절차가 전부 실패한 결과**입니다
- 1단계 `resolveInstanceMethod:`는 메서드를 즉석에서 추가합니다 — @dynamic과 Core Data가 여기서 돌아갑니다
- 2단계 `forwardingTargetForSelector:`는 수신자만 바꿔치기하는 **Fast Forwarding** — NSInvocation 없이 저렴하게 끝납니다
- 3단계는 `methodSignatureForSelector:`와 `forwardInvocation:` 세트 — 시그니처가 있어야 NSInvocation을 만들 수 있습니다
- 멀티캐스트 델리게이트, NSUndoManager, weak proxy가 전부 이 구조 위의 응용입니다
- 포워딩 프록시를 만들 땐 `respondsToSelector:` 오버라이드를 빼먹지 마세요

Swift가 기본적으로 이 유연함을 버리고 정적 디스패치를 택한 이유, 그리고 그럼에도 `@objc dynamic`으로 이 세계에 다시 들어올 수 있는 이유까지 이어서 보면, 두 언어의 설계 철학이 한층 입체적으로 읽힙니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [objc_msgSend 완벽 정리, Objective-C 메서드 호출이 함수 호출이 아닌 이유](/objcmsgSend-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-Objective-C-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%98%B8%EC%B6%9C%EC%9D%B4-%ED%95%A8%EC%88%98-%ED%98%B8%EC%B6%9C%EC%9D%B4-%EC%95%84%EB%8B%8C-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
