---
title: "[Swift 중급 #3] Swift some vs any 완전 정리, some View의 정체와 existential의 비용"
description: "Swift 5.6 이후 코드를 보면 프로토콜 이름 앞에 some 아니면 any가 붙어 있습니다. some View, any Error, some Collection. 예전엔 프로토콜 이름을 그냥 타입 자리에 썼는데, 이제 컴파일러가 any를 붙이라고 경고하거나 에러를 냅니다.…"
header:
  og_image: /assets/images/posts/a880d464-6c55-4a06-bf69-b6f45434a102/1.png
tags:
  - Swift
  - 스위프트
  - some
  - any
permalink: /Swift-중급-3-Swift-some-vs-any-완전-정리-some-View의-정체와-existential의-비용/
toc: true
toc_sticky: true
last_modified_at: 2026-08-04
---

Swift 5.6 이후 코드를 보면 프로토콜 이름 앞에 some 아니면 any가 붙어 있습니다. `some View`, `any Error`, `some Collection`. 예전엔 프로토콜 이름을 그냥 타입 자리에 썼는데, 이제 컴파일러가 any를 붙이라고 경고하거나 에러를 냅니다. 뭐가 달라진 걸까요.

결론부터 말하면, 원래 두 가지로 다르게 동작하던 것이 한 가지 표기로 뭉뚱그려져 있었고, Swift가 그 구분을 표면으로 끌어올린 겁니다. 제네릭 편에서 예고했던 정적 다형성과 동적 다형성의 구분이 바로 이것이에요. 중급 시리즈 3편, some과 any를 정리합니다.

<figure>
  <img src="/assets/images/posts/a880d464-6c55-4a06-bf69-b6f45434a102/1.png" alt="some은 하나를 감추는 가면, any는 무엇이든 담는 상자">
  <figcaption>some은 하나를 감추는 가면, any는 무엇이든 담는 상자</figcaption>
</figure>

## 문제의 기원 — 프로토콜은 타입 자리에 서면 두 얼굴이 된다

프로토콜은 원래 제약의 언어입니다. Comparable을 채택한 타입처럼 자격을 표현하죠. 그런데 프로토콜 이름을 변수나 반환 타입 자리에 쓰는 순간 성격이 달라집니다.

```swift
let shapes: [Shape] = [Circle(), Square(), Triangle()]
```

이 배열에는 서로 다른 타입이 섞여 있습니다. 이걸 가능하게 하려고 컴파일러는 각 값을 상자에 담습니다. "Shape를 따르는 무언가"라고 적힌 상자, 실존 타입(existential type)입니다. 상자 안에 뭐가 들었는지는 런타임에만 알 수 있고, 메서드 호출도 상자를 열어 실제 타입의 구현을 찾아가는 간접 호출이 됩니다.

이 상자가 공짜가 아니라는 게 문제입니다. 크기가 제각각인 값들을 균일한 상자에 담아야 하니 상자 규격(existential container)이 따로 있고, 큰 값은 힙에 놓고 포인터만 담습니다. 호출은 witness table이라는 함수 목록표를 거치는 동적 디스패치가 되고, 컴파일러 최적화(인라이닝, 특수화)의 상당수가 막혀요. 기능적 제약도 있습니다. 상자 안의 실제 타입이 지워졌으니(type erasure), 두 Shape가 같은 타입인지 같은 질문에 답하기 어려워집니다.

그런데 예전 문법에서는 이 비용이 보이지 않았습니다. `func draw(shape: Shape)`라고 쓰면 상자가 만들어지는데, `func draw<S: Shape>(shape: S)`라고 쓰면 상자 없이 제네릭으로 동작해요. 겉보기에 비슷한 두 코드의 성능 특성이 완전히 다른데, 문법이 그 차이를 숨기고 있었던 거죠. Swift Evolution 제안 SE-0335가 any 키워드를 도입한 이유가 정확히 이겁니다. 상자가 생기는 자리에 상자라고 써 붙이자. 철학 1편에서 본 "비용을 숨기지 않는다"가 문법 개정으로 이어진 사례입니다.

## some — 상자 없이 숨기기

any가 무엇이든 담는 상자라면, some은 반대 방향의 도구입니다. `some Shape`는 구체 타입이 하나로 정해져 있는데 이름을 밝히지 않겠다는 뜻이에요. 그래서 불투명 타입(opaque type)이라고 부릅니다.

```swift
func makeShape() -> some Shape {
    Circle(radius: 10)  // 항상 Circle 하나의 타입만 반환
}
```

호출자는 Circle이라는 이름을 모르지만, 컴파일러는 압니다. 그래서 상자도, 간접 호출도 없어요. 정적 디스패치와 최적화가 전부 살아 있는, 사실상 제네릭과 같은 대접을 받습니다. 대가는 유연성입니다. some Shape 반환 함수는 모든 return 경로에서 같은 구체 타입을 돌려줘야 해요. 조건에 따라 Circle 또는 Square를 반환하는 건 컴파일 에러입니다.

SwiftUI의 `var body: some View`가 이 문법의 대표 사용처입니다. body가 실제로 반환하는 타입은 `VStack<TupleView<(Text, Image)>>` 같은 괴물인데, 이걸 시그니처에 쓸 수도 없고 쓰고 싶지도 않죠. some View는 이름만 감추고 구체 타입은 컴파일러가 아는 상태로 이 문제를 풉니다. 성능을 포기하지 않으면서요. Progressive Disclosure 편에서 "초보자가 몰라도 되는 복잡성"의 사례로 봤던 그 문법의 정체가 이겁니다.

파라미터 자리의 some도 알아두면 좋습니다. `func draw(shape: some Shape)`는 `func draw<S: Shape>(shape: S)`의 축약 표기입니다(SE-0341). 타입 파라미터 이름이 본문에서 필요 없을 때 제네릭을 가볍게 쓰는 문법이에요.

<figure>
  <img src="/assets/images/posts/a880d464-6c55-4a06-bf69-b6f45434a102/2.png" alt="상자에는 힙 할당과 witness table이라는 요금표가 붙습니다" loading="lazy">
  <figcaption>상자에는 힙 할당과 witness table이라는 요금표가 붙습니다</figcaption>
</figure>

## 선택 기준 — 기본은 some, any는 이유가 있을 때

두 키워드의 차이를 표로 압축하면 이렇게 됩니다. some은 컴파일 타임에 타입 하나가 확정(정적 디스패치, 최적화 가능, 타입 관계 유지), any는 런타임에 무엇이든 가능(동적 디스패치, 상자 비용, 타입 소거).

실무 기준은 명확합니다. 기본값은 some(또는 제네릭)이고, any는 여러 타입이 진짜로 섞여야 하는 이유가 있을 때만 씁니다.

any가 정당한 자리는 대략 세 곳입니다. 첫째, 이질적인 컬렉션. `[any Shape]`처럼 서로 다른 타입을 한 배열에 담는 건 상자 없이는 불가능합니다. 둘째, 타입이 런타임에 결정되는 저장 프로퍼티. 설정에 따라 다른 구현을 꽂는 `var strategy: any PaymentStrategy` 같은 자리요. 전략 패턴, 의존성 주입의 프로토콜 프로퍼티가 대부분 여기 해당합니다. 셋째, 반환 타입이 조건에 따라 달라지는 함수. some이 허용 안 하는 그 경우입니다.

바꿔 말하면, 함수 파라미터에서 이 프로토콜을 따르는 아무 타입을 받고 싶을 뿐이라면 some이 답입니다. 호출마다 타입은 하나로 정해지니까요. 실제로 Swift 팀의 가이드도 같은 방향입니다. 컬렉션에 섞거나 저장해야 할 때만 any로 승격하라는 것.

성능 차이는 과장할 필요도, 무시할 필요도 없습니다. UI 이벤트 몇 번 처리하는 코드에서 any의 비용은 무의미합니다. 하지만 초당 수만 번 도는 루프 안이라면 상자 비용과 막힌 최적화가 측정 가능한 차이를 만들어요. 늘 그렇듯 기준은 측정이고, 기본값을 some으로 두면 측정할 일 자체가 줄어듭니다.

## 에러 메시지 번역 — "any를 붙이세요"가 알려주는 것

이 구분을 알고 나면 그동안 외워서 넘겼던 컴파일러 메시지들이 번역됩니다.

"Use of protocol 'X' as a type must be written 'any X'" — 프로토콜을 타입 자리에 썼으니 상자가 생긴다는 사실을 문법으로 인정하라는 요구입니다. 기계적으로 any를 붙이기 전에, 이 자리가 정말 상자가 필요한 자리인지(some이나 제네릭으로 될 자리는 아닌지) 한 번 묻는 게 이 에러의 올바른 소비법이에요.

"Protocol 'X' can only be used as a generic constraint" — 예전 Swift에서 associatedtype이나 Self를 가진 프로토콜을 타입 자리에 쓰면 나오던 그 유명한 에러입니다. 상자에 담자니 연관 타입이 뭔지 몰라 상자 규격을 못 정하겠다는 뜻이었어요. 지금은 언어가 발전해서(SE-0309, primary associated types 등) 상당 부분 허용되지만, 이 이야기는 연관 타입 자체를 다뤄야 제대로 풀 수 있습니다. 바로 다음 편 주제입니다.

<figure>
  <img src="/assets/images/posts/a880d464-6c55-4a06-bf69-b6f45434a102/3.png" alt="기본은 some, any는 진짜 섞여야 할 때만" loading="lazy">
  <figcaption>기본은 some, any는 진짜 섞여야 할 때만</figcaption>
</figure>

## 정리

- 프로토콜을 타입 자리에 쓰면 실존 타입(상자)이 만들어지고, 동적 디스패치와 컨테이너 비용, 타입 소거가 따라옵니다. any는 그 상자에 붙은 정직한 이름표입니다.
- some은 반대로 구체 타입 하나가 정해져 있고 이름만 감춥니다. 상자가 없어 제네릭과 같은 성능이고, SwiftUI의 some View가 대표 사례입니다.
- 기본값은 some(제네릭), any는 이질적 컬렉션·런타임 결정 저장·조건부 반환처럼 여러 타입이 진짜 섞이는 자리에만 씁니다.
- 컴파일러의 any 요구는 "상자 비용을 인지하라"는 신호로 읽고, 무조건 붙이기 전에 some으로 될 자리인지 확인합니다.

다음 편은 예고대로 연관 타입(associatedtype)입니다. "generic constraint" 에러의 뿌리, 프로토콜이 타입 빈칸을 품는다는 것의 의미, 그리고 primary associated types까지 정리합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[Swift 철학 #4] SE-0296이 뭐길래? Swift 문법이 태어나는 절차, Swift Evolution 총정리](/Swift-%EC%B2%A0%ED%95%99-4-SE-0296%EC%9D%B4-%EB%AD%90%EA%B8%B8%EB%9E%98-Swift-%EB%AC%B8%EB%B2%95%EC%9D%B4-%ED%83%9C%EC%96%B4%EB%82%98%EB%8A%94-%EC%A0%88%EC%B0%A8-Swift-Evolution-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 중급 #4] Swift 연관 타입(associatedtype) 정복](/Swift-%EC%A4%91%EA%B8%89-4-Swift-%EC%97%B0%EA%B4%80-%ED%83%80%EC%9E%85associatedtype-%EC%A0%95%EB%B3%B5/)
- [[Swift 중급 #5] Swift 고차 함수 실전 정리, lazy 시퀀스까지](/Swift-%EC%A4%91%EA%B8%89-5-Swift-%EA%B3%A0%EC%B0%A8-%ED%95%A8%EC%88%98-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC-lazy-%EC%8B%9C%ED%80%80%EC%8A%A4%EA%B9%8C%EC%A7%80/)
<!-- /RELATED-POSTS -->
