---
title: "클래스 클러스터 패턴(Class Cluster), NSArray가 사실 추상 클래스인 이유 (Objective-C)"
description: "Objective-C에서 이 코드를 실행하면 결과가 꽤 의외입니다."
header:
  og_image: /assets/images/posts/f48d06ba-d2af-41d1-901e-ff7b3161325d/1.jpg
tags:
  - 클래스클러스터
  - NSArray
  - ObjectiveC
  - Foundation
permalink: /클래스-클러스터-패턴Class-Cluster-NSArray가-사실-추상-클래스인-이유-Objective-C/
toc: true
toc_sticky: true
last_modified_at: 2026-07-25
---

Objective-C에서 이 코드를 실행하면 결과가 꽤 의외입니다.

```objc
NSArray *array = [NSArray arrayWithObjects:@1, @2, nil];
NSLog(@"%@", [array class]);
// 출력: __NSArrayI
```

분명 NSArray를 만들었는데 클래스 이름이 `__NSArrayI`입니다. 빈 배열이면 `__NSArray0`, 요소가 하나면 `__NSSingleObjectArrayI`가 나오기도 합니다.

버그가 아닙니다. 이게 바로 **클래스 클러스터(Class Cluster)** 패턴입니다.

> NSArray, NSString, NSNumber, NSDictionary는 전부 추상 클래스입니다.
>
> 실제 인스턴스는 상황에 맞는 숨겨진 서브클래스로 만들어집니다.

Effective Objective-C 2.0의 9번 항목이 다루는 내용인데, Foundation을 쓰는 한 피해 갈 수 없는 구조입니다.

<figure>
  <img src="/assets/images/posts/f48d06ba-d2af-41d1-901e-ff7b3161325d/1.jpg" alt="NSArray라는 가면 뒤에 진짜 구현체들이 숨어 있습니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>NSArray라는 가면 뒤에 진짜 구현체들이 숨어 있습니다</figcaption>
</figure>

---

## 핵심 요약부터 (3가지)

1. NSArray 같은 Foundation 컬렉션은 공개 인터페이스만 제공하는 **추상 클래스**입니다.
2. 이니셜라이저가 비공개 서브클래스 인스턴스를 골라서 반환합니다 (팩토리 패턴의 일종).
3. 그래서 `[array class]` 비교는 위험하고, 서브클래싱은 규칙이 까다롭습니다.

---

## 왜 이렇게 만들었을까요?

배열 하나에도 최적화 전략이 여러 갈래입니다.

- 요소 0개짜리 불변 배열: 매번 만들 필요 없이 싱글턴 하나로 충분
- 요소 1~2개: 포인터를 구조체에 인라인으로 박는 게 빠름
- 큰 가변 배열: 재할당 전략이 필요한 별도 구현

이걸 전부 NSArray 하나의 구현에 if문으로 욱여넣는 대신, Foundation은 상황별 전용 서브클래스를 만들어두고 팩토리 메서드가 적절한 놈을 골라 반환하게 했습니다. 사용하는 쪽은 NSArray 인터페이스만 알면 되고, 내부 구현은 OS 버전마다 자유롭게 갈아끼울 수 있습니다.

실제로 `[NSArray alloc]`이 반환하는 건 __NSPlaceholderArray라는 임시 객체이고, 이어지는 init 계열 호출에서 진짜 구현체로 바뀝니다. alloc과 init을 관습처럼 붙여 쓰지만, 클래스 클러스터에서는 이 두 단계가 실제로 다른 객체를 오가는 과정입니다.

<figure>
  <img src="/assets/images/posts/f48d06ba-d2af-41d1-901e-ff7b3161325d/2.png" alt="팩토리가 요소 개수를 보고 구현체를 골라줍니다" width="1200" height="996" loading="lazy" decoding="async">
  <figcaption>팩토리가 요소 개수를 보고 구현체를 골라줍니다</figcaption>
</figure>

---

## 실무에서 밟는 지뢰 두 가지

**지뢰 1: 클래스 직접 비교**

```objc
// 위험한 코드
if ([object class] == [NSArray class]) {
    // 절대 여기 못 들어옵니다. 실제 클래스는 __NSArrayI 등이니까요.
}

// 올바른 코드
if ([object isKindOfClass:[NSArray class]]) {
    // 클러스터 전체를 포괄해서 판정합니다
}
```

클래스 클러스터 멤버는 공개 클래스의 서브클래스이므로, 동등 비교가 아니라 isKindOfClass:로 계열 소속을 물어야 합니다.

**지뢰 2: 안이한 서브클래싱**

NSArray를 상속해서 메서드 하나만 오버라이드하면 될 것 같지만, 그렇게 만든 서브클래스는 저장 공간조차 물려받지 못합니다. 추상 클래스라 스토리지가 없기 때문입니다. 클러스터에 서브클래스를 제대로 편입시키려면 규칙을 따라야 합니다.

- 자기만의 저장소를 직접 마련할 것 (보통 내부에 진짜 NSArray를 품습니다)
- 지정된 프리미티브 메서드를 전부 구현할 것 (NSArray라면 count와 objectAtIndex:)

나머지 메서드들은 전부 이 프리미티브 위에서 동작하도록 설계되어 있어서, 두 개만 구현하면 클러스터의 모든 기능이 살아납니다. 다만 Effective Objective-C의 조언은 명확합니다. 대부분의 경우 상속보다 **컴포지션**(NSArray를 품은 래퍼 클래스)이 낫습니다.

---

## Swift 개발자에게도 남의 일이 아닌 이유

Swift의 Array는 구조체라 이 패턴과 무관해 보이지만, 접점이 두 군데 있습니다.

첫째, **브리징**입니다. Objective-C API에서 넘어온 NSArray가 Swift Array로 바뀌는 순간에도, 그 뒤에는 _ContiguousArrayStorage나 __NSArrayI 같은 실제 구현체가 살아 있습니다. 브리징 성능 이슈를 파다 보면 결국 이 클러스터 구현체들과 마주치게 됩니다.

둘째, 발상 자체가 Swift로 이어졌습니다. "공개 타입은 인터페이스만 노출하고, 실제 구현은 숨겨진 타입이 담당한다"는 아이디어는 Swift의 AnySequence 같은 타입 소거 래퍼, 그리고 `some` 키워드(불투명 타입)로 이어집니다. 반환 타입은 하나인데 실제 타입은 컴파일러와 구현부만 아는 구조, 클래스 클러스터의 정신과 같은 계보입니다.

<figure>
  <img src="/assets/images/posts/f48d06ba-d2af-41d1-901e-ff7b3161325d/3.jpg" alt="디버거에 찍히는 __NS 클래스들이 바로 그 주인공입니다" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>디버거에 찍히는 __NS 클래스들이 바로 그 주인공입니다</figcaption>
</figure>

---

## 마무리

- NSArray·NSString·NSNumber·NSDictionary는 추상 클래스이고, 실제 인스턴스는 숨겨진 서브클래스입니다
- 타입 판정은 반드시 isKindOfClass:, 클래스 동등 비교는 금물입니다
- 클러스터 서브클래싱은 프리미티브 메서드 구현이 필수이며, 웬만하면 컴포지션이 낫습니다
- 인터페이스와 구현을 분리하는 이 발상은 Swift의 불투명 타입까지 이어지는 유서 깊은 설계입니다

디버거에서 낯선 `__NS` 접두사 클래스를 만나더라도 이제 당황할 이유가 없습니다. Foundation이 30년 가까이 다듬어온 최적화가 눈앞에 드러난 순간일 뿐이니까요.
