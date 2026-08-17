---
title: "Objective-C Associated Objects, 카테고리에 프로퍼티 넣기"
description: "카테고리는 ivar를 추가할 수 없지만 Associated Objects로 값을 매달 수 있습니다. 객체 옆 사이드 테이블에 저장되는 원리와 카테고리 프로퍼티 완성형, assign만 조심하면 되는 메모리 정책을 정리했습니다."
header:
  og_image: /assets/images/posts/5bc2063e-761e-456d-87f4-7cb59f1e2a17/objc-associated-objects-1.jpg
categories:
  - Objective-C
tags:
  - ObjectiveC
  - AssociatedObjects
  - 카테고리
  - objc_setAssociatedObject
permalink: /Objective-C-Associated-Objects-카테고리에-프로퍼티-넣기/
toc: true
toc_sticky: true
last_modified_at: 2026-08-15
---

카테고리 vs extension 글에서 "카테고리에는 저장 프로퍼티를 추가할 수 없다"고 정리했습니다. 클래스의 메모리 레이아웃이 컴파일 시점에 굳기 때문에, 나중에 로드되는 카테고리가 ivar를 끼워 넣을 자리가 없다는 게 이유였죠.

그런데 실무 코드를 보다 보면 카테고리에 버젓이 프로퍼티가 살아 있는 경우를 만납니다. 비밀은 **Associated Objects**입니다. ivar 없이 객체에 값을 매달아 두는 런타임 기능이죠.

카테고리 저장 프로퍼티 문제를 푸는 공식 우회로이자, Objective-C 런타임이 객체 바깥에 숨겨둔 보조 저장소입니다.

<figure>
  <img src="/assets/images/posts/5bc2063e-761e-456d-87f4-7cb59f1e2a17/objc-associated-objects-1.jpg" alt="객체 옆 사이드 테이블에 값을 매다는 Associated Objects 개념 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>객체 밖에 매다는 보조 저장소입니다</figcaption>
</figure>

---

## 원리: 객체 옆에 붙는 사이드 테이블

Associated Objects의 핵심 함수는 두 개입니다.

```objc
objc_setAssociatedObject(대상 객체, 키, 값, 메모리 정책);
objc_getAssociatedObject(대상 객체, 키);
```

값은 객체의 ivar 영역에 저장되지 않습니다. 런타임이 전역으로 관리하는 **연관 테이블(사이드 테이블)**에 "객체 주소 → {키: 값}" 형태로 기록됩니다.

객체 본체의 메모리 레이아웃은 1바이트도 변하지 않으니, 컴파일 시점에 굳은 레이아웃 제약과 충돌하지 않습니다.

대상 객체가 해제되면 런타임이 연관 테이블에서 해당 항목을 찾아 정책에 따라 함께 정리합니다. 수명을 자동으로 관리해 주니 실무에서 쓸 만합니다.

<figure>
  <img src="/assets/images/posts/5bc2063e-761e-456d-87f4-7cb59f1e2a17/objc-associated-objects-2.png" alt="objc_setAssociatedObject가 런타임 전역 연관 테이블에 값을 기록하는 구조 다이어그램" width="1200" height="582" loading="lazy" decoding="async">
  <figcaption>본체 레이아웃은 그대로, 값은 옆 테이블에 삽니다</figcaption>
</figure>

---

## 카테고리 프로퍼티 완성형

카테고리에서 프로퍼티를 선언하면 컴파일러는 getter/setter 선언만 만들어 주고 저장 공간은 만들지 않습니다. 그 빈칸을 Associated Objects로 채우면 됩니다.

```objc
#import <objc/runtime.h>

@interface UIView (BadgeCount)
@property (nonatomic, strong) NSNumber *badgeCount;
@end

@implementation UIView (BadgeCount)

- (NSNumber *)badgeCount {
    return objc_getAssociatedObject(self, @selector(badgeCount));
}

- (void)setBadgeCount:(NSNumber *)badgeCount {
    objc_setAssociatedObject(self, @selector(badgeCount),
                             badgeCount,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

@end
```

키로 `@selector(badgeCount)`를 쓴 부분이 관례입니다. 키는 값이 아니라 **포인터 주소로 비교**되기 때문에 앱 전체에서 유일한 주소면 뭐든 됩니다.

셀렉터는 런타임에 유일함이 보장되고 별도 static 변수를 선언할 필요도 없어서 가장 깔끔합니다. `static void *kBadgeKey = &kBadgeKey;` 같은 고전적인 방법도 여전히 유효합니다.

문자열 리터럴을 키로 쓰는 건 함정입니다. 내용이 같아도 컴파일 단위가 다르면 주소가 달라질 수 있습니다.

"분명 저장했는데 nil이 나오는" 미스터리가 여기서 생기죠.

---

## 메모리 정책: assign만 조심하면 된다

네 번째 인자가 프로퍼티 특성과 대응됩니다.

| 정책 | 대응 특성 |
|---|---|
| `OBJC_ASSOCIATION_RETAIN_NONATOMIC` | strong, nonatomic |
| `OBJC_ASSOCIATION_COPY_NONATOMIC` | copy, nonatomic |
| `OBJC_ASSOCIATION_RETAIN` / `COPY` | 위와 같지만 atomic |
| `OBJC_ASSOCIATION_ASSIGN` | assign — **weak이 아님** |

주의할 곳은 딱 하나, `ASSIGN`입니다. 이름만 보면 weak처럼 보이지만 **자동으로 nil이 되지 않는 unsafe_unretained**입니다.

연관된 객체가 먼저 해제되면 댕글링 포인터가 남습니다. 접근하는 순간 크래시죠.

weak 의미가 필요하면 값을 weak 프로퍼티로 감싼 래퍼 객체를 RETAIN으로 연관시키는 우회가 필요합니다.

특정 연관 값을 지우려면 nil을 set하면 됩니다. `objc_removeAssociatedObjects`는 그 객체의 연관 값을 전부 날리는 극약이라 사실상 쓸 일이 없어야 합니다.

---

## 실전 활용과 선

실무에서 자주 보는 조합은 이렇습니다.

- **UIKit 클래스 확장**: UIView에 배지 수, UIButton에 클로저 기반 액션 핸들러, UIViewController에 분석용 화면 이름 붙이기
- **델리게이트 → 블록 변환 래퍼**: 델리게이트 객체를 원본 객체에 연관시켜 수명을 묶어두는 패턴 (Alamofire 이전 세대의 네트워킹 카테고리들이 즐겨 썼습니다)
- **스위즐링과 세트**: 스위즐링으로 끼워 넣은 로직이 상태를 저장할 곳이 필요할 때 씁니다. 런타임 시리즈의 두 기법이 실무에서 자주 함께 다니는 이유죠

다만 선은 지켜야 합니다. Associated Objects는 어디까지나 보조 데이터를 위한 통로입니다.

객체의 핵심 상태가 연관 테이블에 흩어져 있으면 코드를 읽는 사람이 전체 그림을 잡기 어렵습니다. 서브클래스를 만들 수 있는 상황이면 ivar가 정답입니다.

소유하지 않은 클래스에 부가 정보를 붙여야 할 때, 그때만 이 카드를 꺼내는 게 맞습니다.

Swift extension의 stored property 제약을 우회할 때도 같은 함수를 쓸 수 있습니다(NSObject 계열 한정). 다만 Swift 세계에서는 프로토콜 + 전용 저장 타입 조합이나 구성(composition)으로 푸는 쪽이 더 자연스럽습니다.

<figure>
  <img src="/assets/images/posts/5bc2063e-761e-456d-87f4-7cb59f1e2a17/objc-associated-objects-3.jpg" alt="여행 가방에 카라비너로 파우치를 매단 Associated Objects 비유 일러스트" width="1200" height="1200" loading="lazy" decoding="async">
  <figcaption>가방 밖에 파우치를 거는 방식입니다</figcaption>
</figure>

---

## 정리

- Associated Objects는 객체 본체가 아니라 런타임의 사이드 테이블에 값을 저장합니다. 그래서 카테고리에서도 동작하죠
- 키는 포인터 주소로 비교됩니다. `@selector` 재활용이 관례이고, 문자열 리터럴은 함정입니다
- 메모리 정책 중 `ASSIGN`은 weak이 아니라 unsafe_unretained입니다. 댕글링 크래시에 주의하세요
- 대상 객체가 해제되면 연관 값도 자동 정리됩니다
- 용도는 소유하지 않은 클래스에 보조 데이터를 붙이는 선까지입니다. 핵심 상태를 여기 두면 설계 신호등에 빨간불이 켜집니다

런타임 시리즈 다음 글은 NSProxy입니다. 메시지 포워딩 글에서 예고했던, NSObject가 아닌 또 하나의 루트 클래스가 어떻게 "순수한 대리인"으로 동작하는지 뜯어봅니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [Objective-C 메서드 스위즐링(Method Swizzling) 완벽 정리](/Objective-C-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%8A%A4%EC%9C%84%EC%A6%90%EB%A7%81Method-Swizzling-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
