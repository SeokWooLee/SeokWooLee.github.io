---
title: "[Swift 중급 #2] Swift 제네릭(Generics) 입문부터 활용까지, <T>가 중복과 위험을 동시에 없애는 법"
description: "Swift 코드에서 꺾쇠괄호 <T>를 처음 만나면 눈이 한 번 멈춥니다. 함수 이름 옆에 웬 대문자 알파벳이 붙어 있고, 문서를 열면 func map<T>( transform: (Element) -> T) -> [T] 같은 시그니처가 기다리고 있죠. 제네릭은 Swift 중급의…"
header:
  og_image: /assets/images/posts/7d69dc2a-8c58-4422-956e-940173ebaf99/1.png
tags:
  - Swift
  - 스위프트
  - 제네릭
  - Generics
permalink: /Swift-중급-2-Swift-제네릭Generics-입문부터-활용까지-T가-중복과-위험을-동시에-없애는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-08-02
---

Swift 코드에서 꺾쇠괄호 `<T>`를 처음 만나면 눈이 한 번 멈춥니다. 함수 이름 옆에 웬 대문자 알파벳이 붙어 있고, 문서를 열면 `func map<T>(_ transform: (Element) -> T) -> [T]` 같은 시그니처가 기다리고 있죠. 제네릭은 Swift 중급의 관문입니다. 표준 라이브러리의 거의 모든 것(Array, Dictionary, Optional까지)이 제네릭으로 만들어져 있어서, 이걸 넘어야 라이브러리 코드가 읽히기 시작해요.

중급 시리즈 2편입니다. 제네릭이 어떤 문제를 푸는지, 제약(constraint)과 where 절은 언제 필요한지, 그리고 성능은 어떻게 되는지까지 정리합니다.

<figure>
  <img src="/assets/images/posts/7d69dc2a-8c58-4422-956e-940173ebaf99/1.png" alt="T는 타입을 나중에 채우는 빈칸, 코드는 한 벌이면 됩니다">
  <figcaption>T는 타입을 나중에 채우는 빈칸, 코드는 한 벌이면 됩니다</figcaption>
</figure>

## 제네릭이 푸는 문제 — 중복이냐 타입 안전이냐의 양자택일 거부

제네릭이 없는 세상에서 "두 값을 바꾸는 함수"를 만들어보면 문제가 바로 드러납니다.

Int용을 만들면 String에서 못 씁니다. 타입별로 복사하면 같은 코드가 늘어나고요. 그래서 떠오르는 대안이 "아무 타입이나 받는 상자", Swift로 치면 Any입니다. 그런데 Any를 쓰는 순간 타입 정보가 사라집니다. 꺼낼 때마다 캐스팅해야 하고, Int를 넣고 String으로 꺼내는 실수가 컴파일을 통과해 런타임 크래시가 됩니다.

정리하면 선택지가 "중복은 없지만 위험한 Any"와 "안전하지만 중복인 타입별 복사"뿐이었던 거예요. 제네릭은 이 양자택일을 거부합니다.

```swift
func swapValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}
```

`<T>`는 "타입을 나중에 채울 빈칸"의 선언입니다. 호출하는 순간 T가 구체 타입으로 확정되고, 컴파일러는 그 확정된 타입으로 전체를 검사해요. `swapValues(&intA, &strB)`처럼 타입이 어긋나는 호출은 컴파일 에러입니다. 코드는 한 벌인데 타입 검사는 타입별로 이뤄지는 것, 이게 제네릭의 본질입니다.

타입에도 똑같이 적용됩니다. `struct Stack<Element>`라고 선언하면 `Stack<Int>`와 `Stack<String>`은 서로 다른 타입이 되고, Int 스택에 문자열을 넣는 실수는 컴파일러가 막습니다. Array가 정확히 이 구조고, Optional 역시 옵셔널 편에서 봤듯 `enum Optional<Wrapped>`라는 제네릭 enum이었죠. 이미 제네릭을 매일 쓰고 있었던 셈입니다.

## 제약 — "아무 타입"에서 "이런 능력이 있는 타입"으로

빈칸 T의 기본 상태는 아무 타입입니다. 그런데 아무 타입이라는 건 아무것도 못 한다는 뜻이기도 해요. T에 대해 컴파일러가 아는 게 없으니, 비교도 출력도 덧셈도 안 됩니다.

```swift
func largest<T>(_ items: [T]) -> T? {
    items.max(by: <)  // 컴파일 에러 — T가 비교 가능하다는 보장이 없음
}
```

여기서 제약이 등장합니다. `<T: Comparable>`이라고 쓰면 "T는 Comparable을 채택한 타입만 올 수 있다"는 조건이 붙고, 그 순간 T에 대해 <를 쓸 수 있게 됩니다.

```swift
func largest<T: Comparable>(_ items: [T]) -> T? {
    items.max()
}
```

제약은 손해가 아니라 거래입니다. 받을 수 있는 타입의 폭을 좁히는 대신, 그 타입으로 할 수 있는 일이 늘어나요. 프로토콜 편에서 다룬 "능력의 조합" 개념이 제네릭과 만나는 지점이 바로 여기입니다. 제약에 쓰이는 게 프로토콜이니까요.

조건이 복잡해지면 where 절로 씁니다. 자리만 다를 뿐 의미는 같은데, 타입 파라미터의 연관 타입에 조건을 걸 때는 where가 필수가 됩니다.

```swift
// Element가 Equatable인 컬렉션끼리만 비교
func allEqual<C: Collection>(_ items: C) -> Bool where C.Element: Equatable {
    guard let first = items.first else { return true }
    return items.allSatisfy { $0 == first }
}
```

`C.Element`처럼 컬렉션이 품는 원소 타입을 가리키는 게 연관 타입(associated type)인데, 이건 다음다음 편에서 본격적으로 다룰 주제라 여기서는 where 절이 그 조건을 거는 자리라는 것만 잡아두면 됩니다.

실무 감각 하나를 덧붙이면, 제약은 필요한 만큼만 거는 게 좋습니다. Comparable이면 충분한 함수에 Hashable까지 요구하면 쓸 수 있는 타입만 줄어들어요. 함수 본문이 실제로 사용하는 능력이 제약의 정확한 목록입니다.

<figure>
  <img src="/assets/images/posts/7d69dc2a-8c58-4422-956e-940173ebaf99/2.png" alt="제약은 문을 좁히는 대신 안에서 할 수 있는 일을 늘립니다" loading="lazy">
  <figcaption>제약은 문을 좁히는 대신 안에서 할 수 있는 일을 늘립니다</figcaption>
</figure>

## 성능 이야기 — 추상화의 비용을 컴파일러가 지운다

"제네릭은 느리지 않나"라는 질문에는 Swift의 대표 최적화로 답할 수 있습니다. 특수화(specialization)입니다.

원리상 제네릭 함수는 어떤 타입이 올지 모르니, 타입 정보를 런타임에 들고 다니며 간접적으로 동작해야 합니다. 하지만 컴파일러가 호출 지점을 볼 수 있으면, `swapValues<Int>` 전용 버전을 아예 따로 찍어냅니다. 손으로 Int 버전을 쓴 것과 같은 기계어가 나오는 거예요. 제네릭이라는 추상화를 썼다고 런타임 비용을 내는 게 아니라, 컴파일러가 추상화를 벗겨서 구체 코드로 만들어주는 겁니다. 철학 1편에서 말한 비용 없는 추상화의 대표 사례입니다.

같은 모듈 안에서는 이 최적화가 잘 작동하고 모듈 경계를 넘으면 제한이 생깁니다(라이브러리 배포 형태에 따라 달라집니다). 일상 코드에서 성능 걱정으로 제네릭을 피할 이유는 없다는 게 실무 결론이고, 진짜 병목은 측정으로 찾는 게 맞습니다. 조기 최적화 이야기는 별도 글에서 다뤘죠.

여기서 자연스러운 질문이 하나 나옵니다. "프로토콜 타입으로 받으면(`items: [Comparable]` 같은) 제네릭이랑 뭐가 다른데?" 좋은 질문이고 그게 바로 다음 편 주제입니다. 제네릭은 컴파일 타임에 타입이 확정되는 정적 다형성이고, 프로토콜 타입(existential)은 런타임에 타입이 뒤섞이는 동적 다형성이에요. Swift가 some과 any라는 키워드로 이 둘을 명시하게 만든 이유까지, 다음 편에서 잇습니다.

## 언제 제네릭을 만들까 — 실무 판단 기준

제네릭을 읽는 것과 직접 설계하는 건 다른 차원이라, 만드는 쪽 기준을 정리합니다.

**같은 로직이 타입만 바꿔 두 번째로 등장할 때가 신호입니다.** 처음부터 "언젠가 다른 타입도 올 거야"라며 제네릭으로 시작하는 건 대부분 과설계입니다. YAGNI(You Aren't Gonna Need It — 필요해질 때까지 만들지 말라) 원칙 그대로예요. 구체 타입으로 시작하고 실제 중복이 생기는 순간 일반화하는 게 순서입니다.

**도메인 개념보다는 구조·알고리즘에 잘 맞습니다.** 캐시, 페이지네이션 응답, 스택 같은 내용물과 무관한 구조가 제네릭의 홈그라운드입니다. `APIResponse<User>`, `Cache<ImageKey, UIImage>`처럼요. 반대로 특정 도메인 로직(주문 결제 등)을 억지로 제네릭화하면 시그니처만 어려워집니다.

**시그니처의 복잡도가 사용처의 이득을 넘으면 후퇴 신호입니다.** 타입 파라미터가 서너 개 붙고 where 절이 세 줄이 되면, 호출하는 동료가 읽을 수 있는지 자문해볼 때입니다. Progressive Disclosure 편에서 본 원칙이 여기도 적용돼요. 복잡성은 선언 쪽이 흡수해야지, 사용 쪽으로 새어 나가면 안 됩니다.

<figure>
  <img src="/assets/images/posts/7d69dc2a-8c58-4422-956e-940173ebaf99/3.png" alt="특수화가 추상화를 벗겨 손으로 쓴 코드와 같은 기계어를 만듭니다" loading="lazy">
  <figcaption>특수화가 추상화를 벗겨 손으로 쓴 코드와 같은 기계어를 만듭니다</figcaption>
</figure>

## 정리

- 제네릭은 중복 없는 재사용과 타입 안전의 양자택일을 거부하는 장치입니다. 코드는 한 벌, 타입 검사는 타입별로 이뤄집니다.
- `<T>`는 타입 빈칸 선언이고, 제약(`T: Comparable`, where 절)은 빈칸을 좁히는 대신 할 수 있는 일을 늘리는 거래입니다.
- 특수화 덕분에 제네릭은 대부분 손으로 쓴 구체 코드와 같은 성능을 냅니다.
- 설계 기준: 두 번째 중복이 나타날 때 일반화하고, 구조·알고리즘에 쓰고, 시그니처 복잡도가 이득을 넘으면 멈춥니다.

다음 편은 제네릭의 형제이자 최근 Swift에서 가장 자주 헷갈리는 문법, some과 any입니다. `some View`의 정체와 existential의 비용까지 파봅니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[Swift 철학 #3] Swift는 왜 전부 struct일까? 값 타입 우선주의 총정리](/Swift-%EC%B2%A0%ED%95%99-3-Swift%EB%8A%94-%EC%99%9C-%EC%A0%84%EB%B6%80-struct%EC%9D%BC%EA%B9%8C-%EA%B0%92-%ED%83%80%EC%9E%85-%EC%9A%B0%EC%84%A0%EC%A3%BC%EC%9D%98-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 중급 #3] Swift some vs any 완전 정리, some View의 정체와 existential의 비용](/Swift-%EC%A4%91%EA%B8%89-3-Swift-some-vs-any-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-some-View%EC%9D%98-%EC%A0%95%EC%B2%B4%EC%99%80-existential%EC%9D%98-%EB%B9%84%EC%9A%A9/)
- [[Swift 중급 #4] Swift 연관 타입(associatedtype) 정복](/Swift-%EC%A4%91%EA%B8%89-4-Swift-%EC%97%B0%EA%B4%80-%ED%83%80%EC%9E%85associatedtype-%EC%A0%95%EB%B3%B5/)
<!-- /RELATED-POSTS -->
