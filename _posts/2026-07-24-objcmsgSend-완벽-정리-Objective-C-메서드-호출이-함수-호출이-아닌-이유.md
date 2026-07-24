---
title: "objc_msgSend 완벽 정리, Objective-C 메서드 호출이 함수 호출이 아닌 이유"
description: "Objective-C 코드에서 대괄호로 감싼 [receiver message] 구문, 겉보기엔 그냥 메서드 호출처럼 보입니다."
header:
  og_image: /assets/images/posts/7587b18c-95fb-4935-9cdf-27b41ceef58d/1.png
tags:
  - ObjectiveC
  - objc_msgSend
  - 메시지포워딩
  - iOS개발
permalink: /objcmsgSend-완벽-정리-Objective-C-메서드-호출이-함수-호출이-아닌-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

Objective-C 코드에서 대괄호로 감싼 `[receiver message]` 구문, 겉보기엔 그냥 메서드 호출처럼 보입니다.

그런데 이게 C++이나 Java의 메서드 호출과는 근본적으로 다른 물건입니다.

결론부터 말씀드릴게요.

> Objective-C의 메서드 호출은 "함수 호출"이 아니라 "메시지 전달"입니다.
>
> 어떤 코드가 실행될지는 컴파일 시점이 아니라 **런타임에** 결정됩니다.

이 차이를 알면 메서드 스위즐링, KVO(Key-Value Observing), 크래시 로그의 `unrecognized selector`까지 한 줄로 꿰어집니다. Effective Objective-C 2.0의 11~12번 항목이 다루는 내용이기도 합니다.

<figure>
  <img src="/assets/images/posts/7587b18c-95fb-4935-9cdf-27b41ceef58d/1.png" alt="objc_msgSend 하나로 모든 메시지가 모입니다">
  <figcaption>objc_msgSend 하나로 모든 메시지가 모입니다</figcaption>
</figure>

---

## 핵심 요약부터 (3가지)

1. `[obj foo]`는 컴파일되면 **objc_msgSend(obj, @selector(foo))** 함수 호출로 바뀝니다.
2. objc_msgSend는 런타임에 클래스의 **메서드 테이블을 탐색**해서 실행할 함수(IMP)를 찾습니다.
3. 못 찾으면 바로 크래시가 아니라 **메시지 포워딩**이라는 3단계 구제 절차가 돌아갑니다.

---

## 모든 메시지는 objc_msgSend로 모입니다

C++의 가상 함수는 컴파일 시점에 vtable 인덱스가 정해집니다. 반면 Objective-C는 거의 모든 메시지가 objc_msgSend라는 관문을 지나갑니다. 정확히 말하면 `[super foo]`는 objc_msgSendSuper로 컴파일되고, x86-64 시절엔 구조체 반환용 objc_msgSend_stret 같은 형제 함수도 있었지만(arm64에서는 objc_msgSend로 통합), 동작 원리는 전부 같습니다.

```objc
NSString *result = [greeting uppercaseString];
```

이 코드는 컴파일러를 거치면 이런 C 함수 호출이 됩니다.

```c
NSString *result = objc_msgSend(greeting, @selector(uppercaseString));
```

objc_msgSend가 하는 일은 단순합니다.

1. receiver의 isa 포인터를 따라 클래스를 찾는다
2. 클래스의 메서드 캐시를 먼저 뒤진다 (매우 빠름)
3. 캐시에 없으면 메서드 리스트를 탐색하고 없으면 부모 클래스로 올라간다
4. 찾은 함수 포인터(IMP)로 점프한다

찾은 결과는 캐시에 저장되기 때문에 같은 메시지를 두 번째 보낼 때부터는 함수 호출에 가까운 속도가 나옵니다. "동적 디스패치라 느리다"는 걱정이 실무에서 거의 문제가 안 되는 이유입니다.

<figure>
  <img src="/assets/images/posts/7587b18c-95fb-4935-9cdf-27b41ceef58d/2.png" alt="탐색이 실패해도 세 번의 구제 기회가 남아 있습니다" loading="lazy">
  <figcaption>탐색이 실패해도 세 번의 구제 기회가 남아 있습니다</figcaption>
</figure>

---

## 못 찾으면? 메시지 포워딩 3단계

메서드 탐색이 최상위 클래스까지 올라가도 실패하면, 런타임은 크래시 전에 세 번의 기회를 줍니다.

**1단계: 동적 메서드 해석 (resolveInstanceMethod:)**

"이 셀렉터에 해당하는 메서드를 지금이라도 추가할래?"라고 클래스에 물어봅니다. Core Data의 @dynamic 프로퍼티가 이 단계에서 접근자를 실시간으로 만들어 붙입니다.

```objc
+ (BOOL)resolveInstanceMethod:(SEL)sel {
    if (sel == @selector(dynamicMethod)) {
        class_addMethod(self, sel, (IMP)dynamicIMP, "v@:");
        return YES;
    }
    return [super resolveInstanceMethod:sel];
}
```

**2단계: 대체 수신자 (forwardingTargetForSelector:)**

"네가 처리 못 하면 대신 처리할 객체라도 알려줄래?"라고 묻습니다. 다른 객체를 리턴하면 메시지가 그쪽으로 넘어갑니다. 상속 없이 "다중 상속 비슷한 것"을 흉내 낼 때 쓰이는 지점입니다.

**3단계: 완전한 포워딩 (forwardInvocation:)**

이 단계에 들어가기 전에 런타임은 methodSignatureForSelector:로 메서드 시그니처부터 물어봅니다. 여기서 nil이 돌아오면 포워딩은 열리지도 않고 곧장 doesNotRecognizeSelector:로 넘어가 크래시합니다. 시그니처가 있으면 그걸 바탕으로 메시지 전체가 NSInvocation 객체로 포장되어 넘어옵니다. 여기서는 인자를 바꾸거나, 여러 객체에 뿌리거나, 아예 조용히 삼켜버릴 수도 있습니다. 가장 유연하지만 가장 비쌉니다.

3단계까지 전부 실패했을 때 비로소 그 유명한 크래시가 납니다.

```
-[MyViewController buttonTapped:]: unrecognized selector sent to instance 0x7f8a2c400c50
```

이 크래시 로그가 "함수가 없다"가 아니라 "셀렉터를 인식하지 못했다"인 이유, 이제 명확해집니다. 컴파일 타임엔 아무 문제가 없었고 런타임 탐색과 포워딩이 전부 실패한 결과물이니까요.

---

## 이 구조가 만들어낸 것들

이 런타임 구조 위에서 iOS 개발의 익숙한 기능들이 돌아갑니다.

- **KVO**: 옵저버를 붙이면 런타임이 해당 객체의 isa를 몰래 서브클래스로 바꿔치기합니다
- **메서드 스위즐링**: 셀렉터와 IMP의 연결을 런타임에 교체합니다
- **NSProxy**: 포워딩만으로 동작하는 대리 객체를 만듭니다 (NSTimer 순환 참조 해결에도 등장합니다)
- **@dynamic**: 접근자를 컴파일 타임에 만들지 않고 1단계 포워딩에서 해결합니다

Swift가 메시지 디스패치 대신 정적·vtable(테이블) 디스패치를 택하면서 이 유연함 대신 속도와 안전을 가져갔는데, 그래서 역으로 Swift에서 KVO를 쓰려면 `@objc dynamic`을 붙여야 합니다. Objective-C 런타임의 메시징 세계로 그 프로퍼티를 다시 넘겨주는 표시인 셈입니다.

<figure>
  <img src="/assets/images/posts/7587b18c-95fb-4935-9cdf-27b41ceef58d/3.png" alt="이 크래시 로그, 이제 다르게 읽힙니다" loading="lazy">
  <figcaption>이 크래시 로그, 이제 다르게 읽힙니다</figcaption>
</figure>

---

## 마무리

- Objective-C 메서드 호출의 실체는 objc_msgSend를 통한 메시지 전달입니다
- 실행할 코드는 런타임에 결정되고, 캐시 덕분에 속도 걱정은 접어두셔도 됩니다
- 탐색 실패 시 동적 해석 → 대체 수신자 → 완전한 포워딩 순서로 구제 기회가 있습니다
- unrecognized selector 크래시는 이 모든 단계가 실패했다는 뜻입니다

Objective-C 레거시 코드를 만질 일이 없더라도, UIKit 아래에서 여전히 이 런타임이 돌고 있습니다. 크래시 로그 한 줄이 다르게 읽히기 시작하면, 디버깅의 결이 달라집니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 탄생 배경, 크리스 래트너는 왜 Objective-C를 버렸을까](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
- [Objective-C 메모리 관리 역사: MRC에서 ARC까지 총정리](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Objective-C 역사 총정리, 잡스가 사랑한 언어 이야기 (NS 접두어 유래까지)](/Objective-C-%EC%97%AD%EC%82%AC/)
<!-- /RELATED-POSTS -->
