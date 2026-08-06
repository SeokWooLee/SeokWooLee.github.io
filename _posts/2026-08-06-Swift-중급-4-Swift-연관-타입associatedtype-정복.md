---
title: "[Swift 중급 #4] Swift 연관 타입(associatedtype) 정복"
description: "연관 타입(associatedtype)은 프로토콜에 뚫린 타입 빈칸입니다. 그 유명한 generic constraint 에러가 났던 이유와 SE-0309·SE-0346으로 제약이 풀린 과정, primary associated types 활용법을 정리했습니다."
header:
  og_image: /assets/images/posts/843650cf-8f58-411e-9ef4-14639a9f6490/swift-associatedtype-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - associatedtype
  - 연관타입
permalink: /Swift-중급-4-Swift-연관-타입associatedtype-정복/
toc: true
toc_sticky: true
last_modified_at: 2026-08-06
---

Swift 프로토콜을 쓰다 보면 언젠가 반드시 만나는 벽이 있습니다. Equatable을 변수 타입으로 쓰려는 순간, 혹은 Collection을 프로퍼티에 담으려는 순간 쏟아지는 연관 타입 관련 에러들이죠. 한때 악명 높았던 "Protocol can only be used as a generic constraint because it has Self or associated type requirements"가 그 대표입니다. 이 벽의 정체가 연관 타입(associatedtype)입니다.

중급 시리즈 4편입니다. 연관 타입이 뭔지, 왜 그 에러가 났었는지, 그리고 primary associated types까지 이어지는 언어의 진화를 정리합니다. 제네릭 편과 some·any 편을 읽고 오시면 재료가 다 준비된 셈입니다.

<figure>
  <img src="/assets/images/posts/843650cf-8f58-411e-9ef4-14639a9f6490/swift-associatedtype-1.jpg" alt="ASSOCIATED TYPES 텍스트와 ITEM 빈칸이 뚫린 프로토콜 청사진 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>연관 타입은 프로토콜에 뚫린 빈칸, 채택자가 채웁니다</figcaption>
</figure>

## 연관 타입이란 — 프로토콜에 뚫린 타입 빈칸

제네릭 편에서 `<T>`를 "타입을 나중에 채울 빈칸"이라고 정리했습니다. 연관 타입은 그 빈칸이 프로토콜에 뚫린 버전입니다.

컨테이너 프로토콜을 만든다고 해볼게요. 스택이든 큐든 "원소를 넣고 꺼내는" 공통 능력을 추상화하고 싶은데, 문제는 원소의 타입입니다. IntStack의 원소는 Int고 StringQueue의 원소는 String이니, 프로토콜 단계에서는 원소 타입을 확정할 수 없어요. 그래서 빈칸으로 선언합니다.

```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```

채택하는 타입이 빈칸을 채웁니다. IntStack은 Item을 Int로, StringQueue는 String으로요. 대부분의 경우 `typealias Item = Int`라고 명시할 필요도 없습니다. append의 파라미터 타입을 보고 컴파일러가 추론하거든요.

사실 이 개념은 새 게 아닙니다. 표준 라이브러리의 뼈대가 전부 연관 타입으로 짜여 있어요. Collection의 Element와 Index, IteratorProtocol의 Element, 그리고 제네릭 편 where 절에서 만났던 `C.Element`가 바로 이 빈칸을 가리키는 문법이었습니다. Equatable조차 연관 타입의 사촌인 Self 요구사항(`static func == (lhs: Self, rhs: Self) -> Bool`)이 있고요. 요컨대 연관 타입은 프로토콜 세계의 일급 시민이고, 피해서 지나갈 수 있는 개념이 아닙니다.

제네릭의 `<T>`와의 차이를 한 줄로 정리하면 이렇습니다. 제네릭 파라미터는 사용하는 쪽이 채우는 빈칸이고 연관 타입은 채택하는 쪽이 채우는 빈칸입니다. `Stack<Int>`는 쓰는 사람이 Int를 고르지만, Container의 Item은 IntStack이라는 타입이 스스로 결정해요.

## 그 에러의 이유 — 상자 규격을 정할 수 없다

이제 그 악명 높은 에러를 해부할 수 있습니다. 왜 연관 타입이 있으면 프로토콜을 타입 자리에 못 썼을까요.

some·any 편에서 프로토콜 타입 변수는 실존 타입, 즉 상자라고 했습니다. `var c: Container`라고 쓰는 건 "Container를 따르는 무언가가 담긴 상자"를 만들겠다는 뜻이에요. 그런데 이 상자에서 원소를 꺼내는 순간 문제가 생깁니다. `c[0]`의 타입이 뭘까요? Item인데, Item이 뭔지는 상자 안에 실제로 뭐가 들었는지에 따라 다릅니다. IntStack이면 Int고 StringQueue면 String이죠. 컴파일러는 상자만 보고는 이 질문에 답할 수 없습니다.

타입을 확정할 수 없는 표현식은 정적 타입 언어에서 허용될 수 없으니, 예전 Swift는 아예 입구에서 막았습니다. "이 프로토콜은 제약으로만 쓰라"는 게 그 에러의 실제 의미였어요. 제네릭 `<C: Container>`로 쓰면 호출 시점에 C가 확정되고 C.Item도 함께 확정되니 아무 문제가 없거든요. 에러 메시지가 불친절했을 뿐, "상자 대신 제네릭을 쓰라"는 정확한 처방이었던 셈입니다.

<figure>
  <img src="/assets/images/posts/843650cf-8f58-411e-9ef4-14639a9f6490/swift-associatedtype-2.jpg" alt="타입을 알 수 없는 상자를 검사하지 못하는 로봇과 제네릭 제약 도장 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>상자에서 꺼낸 Item의 타입을 알 수 없어 입구를 막았던 겁니다</figcaption>
</figure>

## 언어의 진화 — 빗장이 하나씩 풀린 역사

이 불편은 오래 악명을 떨쳤고, Swift는 몇 번의 제안으로 빗장을 풀어왔습니다.

**Swift 5.7, Swift Evolution 제안 SE-0309.** 연관 타입이 있는 프로토콜도 any로 쓸 수 있게 됐습니다. `var c: any Container`가 컴파일돼요. 대신 상자에서 꺼낸 Item은 "무슨 타입인지 모름"으로 취급되어 쓸 수 있는 일이 제한됩니다. 문이 열렸지만 안에서 할 수 있는 일이 적은 상태죠.

**같은 시기, SE-0346 primary associated types.** 진짜 게임 체인저는 이겁니다. 프로토콜 선언에 대표 연관 타입을 꺾쇠로 노출할 수 있게 됐어요.

```swift
protocol Container<Item> {
    associatedtype Item
    // ...
}

var numbers: any Container<Int>   // Item이 Int인 컨테이너 상자
func process(_ c: some Container<Int>)  // 제네릭에서도 간결하게
```

`any Container<Int>`는 "Item이 Int로 확정된 상자"입니다. 꺼낸 원소가 Int라는 걸 컴파일러가 아니, 상자의 활용도가 획기적으로 올라가요. 표준 라이브러리도 이 문법으로 재정비됐습니다. `any Collection<String>`, `some Sequence<Int>`처럼 쓸 수 있게 된 게 이때부터입니다.

이 진화의 방향을 읽어두면 좋습니다. "연관 타입 프로토콜은 타입으로 못 쓴다"는 절대 규칙이, "쓸 수 있되 확정 안 된 연관 타입만큼 능력이 줄어든다"는 정밀한 규칙으로 바뀐 거예요. 금지에서 비용 명시로, some·any 편에서 본 그 철학의 연장입니다.

## 실무 패턴 — 연관 타입과 함께 일하는 법

이론을 실무 장면으로 옮겨보겠습니다.

**설계할 때: 연관 타입은 "채택자마다 다른 타입이 하나로 정해지는" 자리에 씁니다.** Repository 프로토콜이 좋은 예입니다. `associatedtype Entity`를 두면 UserRepository는 User로, OrderRepository는 Order로 채우죠. 반면 채택자와 무관하게 쓰는 쪽이 타입을 고르는 자리라면 프로토콜의 연관 타입이 아니라 제네릭 함수·타입이 맞습니다.

**소비할 때: 기본은 제네릭 제약, 저장·혼합이 필요하면 primary associated type을 채운 any.** `func sync<R: Repository>(_ repo: R) where R.Entity == User`처럼 제약으로 쓰는 게 1순위, `var repos: [any Repository<User>]`처럼 담아야 할 때가 2순위입니다.

**막혔을 때: 타입 소거의 마지막 수단, AnyX 패턴.** primary associated type으로도 안 풀리는 복잡한 제약이 있다면, 표준 라이브러리의 AnySequence나 Combine의 AnyPublisher처럼 구체 타입으로 감싸 연관 타입을 숨기는 수동 타입 소거(type erasure) 기법이 남아 있습니다. 다만 SE-0346 이후로 직접 만들 일은 크게 줄었어요. AnyX 래퍼를 새로 짜기 전에 primary associated type으로 풀리는지 먼저 확인하는 게 요즘 순서입니다.

하나 더, Self 요구사항 이야기. `==` 같은 연산은 "같은 타입끼리"만 의미가 있어서 Self로 선언되는데, 이 때문에 `any Equatable` 상자 두 개는 직접 비교가 안 됩니다. 상자 안 타입이 서로 다를 수 있으니까요. 이런 자리는 상자를 포기하고 제네릭으로 푸는 게 정석입니다.

<figure>
  <img src="/assets/images/posts/843650cf-8f58-411e-9ef4-14639a9f6490/swift-associatedtype-3.jpg" alt="SE-0309와 SE-0346 단계로 빗장이 차례로 풀리는 관문 타임라인 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>SE-0309와 SE-0346이 빗장을 차례로 풀었습니다</figcaption>
</figure>

## 정리

- 연관 타입은 프로토콜에 뚫린 타입 빈칸이고, 채택하는 타입이 채웁니다(대부분 추론으로). Collection의 Element처럼 표준 라이브러리의 뼈대가 이걸로 짜여 있습니다.
- 옛 에러의 정체: 상자(실존 타입)에서 꺼낸 값의 연관 타입을 확정할 수 없어서 입구를 막았던 것입니다. 제네릭 제약으로 쓰면 원래부터 문제가 없었습니다.
- SE-0309가 any 사용을 열었고, SE-0346의 primary associated types(`any Container<Int>`)가 상자의 실용성을 살렸습니다.
- 실무 순서: 제네릭 제약이 1순위, primary associated type 채운 any가 2순위, 수동 타입 소거는 마지막 수단입니다.

다음 편은 손을 좀 풀어주는 주제입니다. map, filter, reduce, 그리고 compactMap과 flatMap의 차이까지, 고차 함수를 실무 기준으로 정리하고 lazy 시퀀스로 성능 이야기까지 잇습니다.

---

## 참고 자료

- [SE-0309: Unlock existentials for all protocols](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0309-unlock-existential-types-for-all-protocols.md)
- [SE-0346: Lightweight same-type requirements for primary associated types](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0346-light-weight-same-type-syntax.md)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[Swift 중급 #2] Swift 제네릭(Generics) 입문부터 활용까지, <T>가 중복과 위험을 동시에 없애는 법](/Swift-%EC%A4%91%EA%B8%89-2-Swift-%EC%A0%9C%EB%84%A4%EB%A6%ADGenerics-%EC%9E%85%EB%AC%B8%EB%B6%80%ED%84%B0-%ED%99%9C%EC%9A%A9%EA%B9%8C%EC%A7%80-T%EA%B0%80-%EC%A4%91%EB%B3%B5%EA%B3%BC-%EC%9C%84%ED%97%98%EC%9D%84-%EB%8F%99%EC%8B%9C%EC%97%90-%EC%97%86%EC%95%A0%EB%8A%94-%EB%B2%95/)
- [[Swift 중급 #1] Swift ARC 완전 정리, weak vs unowned는 수명 관계로 고릅니다](/Swift-%EC%A4%91%EA%B8%89-1-Swift-ARC-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-weak-vs-unowned%EB%8A%94-%EC%88%98%EB%AA%85-%EA%B4%80%EA%B3%84%EB%A1%9C-%EA%B3%A0%EB%A6%85%EB%8B%88%EB%8B%A4/)
- [[Swift 중급 #5] Swift 고차 함수 실전 정리, lazy 시퀀스까지](/Swift-%EC%A4%91%EA%B8%89-5-Swift-%EA%B3%A0%EC%B0%A8-%ED%95%A8%EC%88%98-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC-lazy-%EC%8B%9C%ED%80%80%EC%8A%A4%EA%B9%8C%EC%A7%80/)
<!-- /RELATED-POSTS -->
