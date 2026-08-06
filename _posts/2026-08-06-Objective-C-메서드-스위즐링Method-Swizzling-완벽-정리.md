---
title: "Objective-C 메서드 스위즐링(Method Swizzling) 완벽 정리"
description: "메서드 스위즐링은 셀렉터와 IMP를 잇는 연결표를 런타임에 맞바꾸는 기법입니다. 관례적인 구현 전체와 _cmd가 거짓말을 하는 부작용, 어디까지 써도 되는지의 경계를 정리했습니다."
header:
  og_image: /assets/images/posts/b0aea0de-3fe7-4b89-a54b-01a1dd53eaa7/objc-method-swizzling-1.jpg
categories:
  - Objective-C
tags:
  - ObjectiveC
  - 메서드스위즐링
  - MethodSwizzling
  - 런타임
permalink: /Objective-C-메서드-스위즐링Method-Swizzling-완벽-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-06
---

Firebase Analytics를 붙이면 화면 진입 이벤트가 자동으로 찍힙니다. `viewDidAppear`에 코드를 한 줄도 안 넣었는데 말이죠.

이게 가능한 이유가 **메서드 스위즐링(Method Swizzling)**입니다. 런타임에 메서드의 구현을 통째로 바꿔치기하는 기법인데, Objective-C 런타임의 유연함을 보여주는 대표 사례이자, 잘못 쓰면 디버깅 지옥을 여는 양날의 검이기도 합니다.

objc_msgSend 글에서 다뤘듯 Objective-C 메서드 호출은 "셀렉터로 IMP(함수 포인터)를 찾아 점프"하는 구조입니다. 스위즐링은 바로 이 **셀렉터→IMP 연결표를 런타임에 수정**하는 일입니다.

<figure>
  <img src="/assets/images/posts/b0aea0de-3fe7-4b89-a54b-01a1dd53eaa7/objc-method-swizzling-1.jpg" alt="두 소켓의 케이블을 맞바꾸는 로봇 팔로 표현한 메서드 스위즐링 개념 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>연결을 통째로 맞바꾸는 순간입니다</figcaption>
</figure>

---

## 원리: 연결표의 두 줄을 맞바꾼다

클래스의 메서드 리스트는 "셀렉터 → IMP" 매핑 테이블입니다. `method_exchangeImplementations`는 두 항목의 IMP를 서로 맞바꿉니다.

| 셀렉터 | 교체 전 IMP | 교체 후 IMP |
|---|---|---|
| `viewDidAppear:` | 원본 구현 | **내 구현** |
| `swz_viewDidAppear:` | 내 구현 | **원본 구현** |

교체 후에는 시스템이 `viewDidAppear:`를 호출하는 순간 내 구현이 실행됩니다. 원본이 사라진 게 아니라 `swz_viewDidAppear:`라는 이름 뒤로 이사 갔을 뿐입니다.

<figure>
  <img src="/assets/images/posts/b0aea0de-3fe7-4b89-a54b-01a1dd53eaa7/objc-method-swizzling-2.png" alt="메서드 스위즐링 전후 셀렉터와 IMP 연결 변화를 보여주는 다이어그램" width="1200" height="292" loading="lazy" decoding="async">
  <figcaption>원본은 사라지지 않고 다른 셀렉터 뒤로 이사합니다</figcaption>
</figure>

---

## 관례적인 구현 전체

실무에서 통용되는 안전 장치가 다 들어간 형태는 이렇습니다.

```objc
@implementation UIViewController (Tracking)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class cls = [self class];
        SEL originalSEL = @selector(viewDidAppear:);
        SEL swizzledSEL = @selector(swz_viewDidAppear:);
        Method original = class_getInstanceMethod(cls, originalSEL);
        Method swizzled = class_getInstanceMethod(cls, swizzledSEL);

        BOOL added = class_addMethod(cls, originalSEL,
                                     method_getImplementation(swizzled),
                                     method_getTypeEncoding(swizzled));
        if (added) {
            class_replaceMethod(cls, swizzledSEL,
                                method_getImplementation(original),
                                method_getTypeEncoding(original));
        } else {
            method_exchangeImplementations(original, swizzled);
        }
    });
}

- (void)swz_viewDidAppear:(BOOL)animated {
    [self swz_viewDidAppear:animated]; // 재귀 아님! 아래 설명
    NSLog(@"화면 진입: %@", NSStringFromClass([self class]));
}

@end
```

이 코드에서 헷갈리기 쉬운 포인트가 두 곳 있습니다.

**첫째, `[self swz_viewDidAppear:animated]`는 재귀가 아닙니다.** 이 코드가 실행되는 시점엔 이미 IMP가 맞바뀐 뒤라서 `swz_` 셀렉터에는 원본 구현이 연결돼 있습니다. 즉 이 한 줄이 "원본 호출"입니다. 원본을 빼먹으면 화면 전환 로직이 통째로 증발하니, 사실상 필수입니다.

**둘째, 왜 `method_exchangeImplementations`를 바로 안 부르고 `class_addMethod`를 먼저 시도할까요?** 대상 메서드가 그 클래스가 아니라 **부모 클래스에만 구현돼 있는 경우** 때문입니다. 이때 바로 exchange하면 부모 클래스의 메서드를 바꿔버려서 그 부모를 상속한 다른 서브클래스 전부가 영향을 받습니다. `class_addMethod`가 성공하면 "이 클래스에 원본을 새로 추가"한 것이므로 안전하게 자기 클래스 범위에서만 교체됩니다.

`+load`와 `dispatch_once`를 쓰는 이유는 간단합니다. 스위즐링은 전역 상태를 바꾸는 일이라 앱 수명에서 딱 한 번, 가장 이른 시점에 일어나야 하기 때문입니다. `+load`의 정확한 호출 시점은 다음 글(+load vs +initialize)에서 따로 다룹니다.

---

## 조용한 부작용: _cmd가 거짓말을 한다

스위즐링된 메서드 안에서 `_cmd`(현재 셀렉터)를 출력하면 `viewDidAppear:`가 아니라 `swz_viewDidAppear:`가 나옵니다. 구현은 바뀌었지만 호출 경로의 셀렉터는 그대로이기 때문입니다.

평소엔 문제가 없지만 `_cmd`를 키로 쓰는 코드(예: Associated Objects의 키로 `_cmd`를 쓰는 패턴)와 섞이면 미묘한 버그가 됩니다. 원본 구현이 내부적으로 `_cmd`에 의존하고 있었다면 동작이 달라질 수 있습니다.

---

## 어디까지 써도 되는가

스위즐링이 정당화되는 영역은 꽤 좁습니다.

- **전 화면 공통 계측**: Analytics·로깅 SDK가 화면 진입, 버튼 탭을 자동 수집할 때
- **서드파티·시스템 버그 우회**: 소스가 없는 프레임워크의 동작을 임시로 교정할 때
- **개발용 디버깅 도구**: 특정 메서드 호출을 전부 추적하고 싶을 때

반대로 이런 상황이라면 위험 신호입니다.

- 여러 라이브러리가 **같은 메서드를 스위즐링**하면 실행 순서가 로드 순서에 좌우되고 하나가 원본 호출을 빼먹으면 나머지 전부가 무너집니다
- 스택 트레이스에 `swz_` 메서드가 끼어들어 크래시 리포트 해석이 어려워집니다
- 시스템 내부 구현에 기대는 스위즐링은 OS 업데이트 한 번에 깨질 수 있습니다

그래서 서브클래싱, 델리게이트 프록시, 컴포지션으로 해결되는 문제라면 그쪽이 항상 먼저입니다. 스위즐링은 "다른 방법이 구조적으로 불가능할 때"의 마지막 카드로 남겨두는 게 맞습니다.

---

## Swift에서는?

순수 Swift 메서드는 정적 디스패치(또는 vtable)라서 이 기법이 통하지 않습니다. 스위즐링하려면 대상 메서드가 Objective-C 런타임에 노출돼 있어야 합니다.

```swift
class Tracker: NSObject {
    @objc dynamic func fire() { }
}
```

`@objc dynamic`이 붙어야 objc_msgSend 경로로 호출이 흐르고 그래야 연결표를 바꿔칠 수 있습니다. UIKit 클래스들은 Objective-C 기반이라 여전히 스위즐링이 통하지만 SwiftUI 세계로 갈수록 이 기법의 자리는 좁아지고 있습니다.

<figure>
  <img src="/assets/images/posts/b0aea0de-3fe7-4b89-a54b-01a1dd53eaa7/objc-method-swizzling-3.jpg" alt="코드 카드 탑에서 카드 하나를 교체하는 메서드 스위즐링 위험성 일러스트" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>카드 하나 잘못 빼면 전체가 흔들립니다</figcaption>
</figure>

---

## 정리

- 스위즐링은 셀렉터→IMP 연결표를 런타임에 맞바꾸는 기법입니다 — 원본은 사라지지 않고 다른 셀렉터 뒤로 이사합니다
- swizzled 구현 안의 `[self swz_...]` 호출은 재귀가 아니라 **원본 호출**입니다
- `class_addMethod` 먼저 시도하는 이유는 부모 클래스 메서드를 건드리지 않기 위해서입니다
- `+load` + `dispatch_once`로 앱 수명에서 한 번만 실행되게 합니다
- `_cmd` 불일치, 라이브러리 간 충돌, OS 업데이트 리스크가 실존하니 **마지막 카드**로만 씁니다
- Swift에서는 `@objc dynamic`이 붙은 메서드만 스위즐링됩니다

다음 글에서는 스위즐링과 헷갈리기 쉬운 또 하나의 런타임 마법, KVO(Key-Value Observing)의 isa-swizzling을 뜯어봅니다. 메서드가 아니라 **클래스 자체를 바꿔치기**하는 이야기입니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [+load vs +initialize 완벽 비교, 호출 시점부터 상속 함정까지 (Objective-C 면접 단골)](/load-vs-initialize-%EC%99%84%EB%B2%BD-%EB%B9%84%EA%B5%90-%ED%98%B8%EC%B6%9C-%EC%8B%9C%EC%A0%90%EB%B6%80%ED%84%B0-%EC%83%81%EC%86%8D-%ED%95%A8%EC%A0%95%EA%B9%8C%EC%A7%80-Objective-C-%EB%A9%B4%EC%A0%91-%EB%8B%A8%EA%B3%A8/)
<!-- /RELATED-POSTS -->
