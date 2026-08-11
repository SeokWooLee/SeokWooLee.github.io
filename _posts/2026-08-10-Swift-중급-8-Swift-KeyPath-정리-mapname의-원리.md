---
title: "[Swift 중급 #8] Swift KeyPath 정리, map(\\.name)의 원리"
description: "\\.name은 map의 축약 문법이 아니라 KeyPath라는 독립 타입의 값입니다. 프로퍼티 접근을 값으로 만든다는 말의 뜻과 읽기 전용·값 타입 쓰기·참조 타입 쓰기 세 계층, 실무 활용처를 정리했습니다."
header:
  og_image: /assets/images/posts/ed14abe4-909b-4e97-9896-8e26955ce9e6/swift-keypath-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - KeyPath
  - 키패스
permalink: /Swift-중급-8-Swift-KeyPath-정리-mapname의-원리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-10
---

`users.map(\.name)`. 요즘 Swift 코드에서 흔히 보는 한 줄인데, 백슬래시로 시작하는 `\.name`의 정체를 물으면 "map의 축약 문법 아닌가요?"라는 답이 돌아오곤 합니다. 절반만 맞습니다. 저건 KeyPath라는 독립적인 타입의 값이고, map이 특별해서가 아니라 KeyPath가 함수 자리에 설 수 있게 된 덕분에 가능한 문법이에요.

중급 시리즈 마지막 8편입니다. KeyPath가 "프로퍼티 접근을 값으로 만든다"는 게 무슨 뜻인지, 세 가지 KeyPath 타입의 차이, 그리고 실무에서 진가가 드러나는 자리들을 정리합니다.

<figure>
  <img src="/assets/images/posts/ed14abe4-909b-4e97-9896-8e26955ce9e6/swift-keypath-1.jpg" alt="KEYPATH 텍스트와 USER 카드에서 NAME 필드로 향하는 경로 표지판 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>인스턴스에서 떼어낸 '프로퍼티로 가는 길'이 KeyPath입니다</figcaption>
</figure>

## KeyPath란 — 프로퍼티로 가는 길을 값으로 들다

클로저 편에서 함수를 값으로 다루는 것의 위력을 봤습니다. KeyPath는 그 아이디어를 프로퍼티 접근에 적용한 겁니다. `user.name`이라는 접근 동작에서 user를 떼어내고 ".name으로 가는 길"만 남겨 값으로 만든 것이 `\User.name`이에요.

```swift
let path = \User.name        // KeyPath<User, String>
let user = User(name: "Kim", age: 30)
let name = user[keyPath: path]   // "Kim"
```

타입 시그니처가 본질을 말해줍니다. `KeyPath<User, String>`은 "User에서 출발해 String에 도착하는 경로"입니다. 어느 인스턴스에도 아직 묶여 있지 않아서, 변수에 담고, 함수에 넘기고, 배열에 모아둘 수 있어요. 문자열 키("name")로 프로퍼티에 접근하는 동적 언어들과 결정적으로 다른 점은 타입 안전입니다. `\User.nmae` 같은 오타는 컴파일 에러고, 경로의 출발·도착 타입이 전부 컴파일 타임에 검증됩니다. Objective-C의 KVC(Key-Value Coding) 문자열 키가 하던 일을 타입 시스템 안으로 가져온 것, 철학 1편의 안전 우선이 여기서도 반복되는 셈이죠.

경로는 이어 쓸 수 있습니다. `\User.address.city`처럼 중첩 프로퍼티를 관통하고, `\User.name.count`처럼 표준 라이브러리 프로퍼티로도 이어집니다. appending(path:)로 두 경로를 런타임에 잇는 것도 되고요.

## 함수 자리에 서는 KeyPath — map(\.name)의 원리

`users.map(\.name)`이 컴파일되는 이유는 Swift Evolution 제안 SE-0249 덕분입니다. `(Root) -> Value` 함수를 기대하는 자리에 `KeyPath<Root, Value>`를 넘기면, 컴파일러가 `{ $0[keyPath: path] }` 클로저로 자동 변환해줘요. 그러니 아래 두 줄은 같은 코드입니다.

```swift
let names = users.map { $0.name }
let names = users.map(\.name)
```

어느 쪽이 나을까요. 단순 프로퍼티 추출이면 KeyPath 쪽이 낫다는 게 중론입니다. `{ $0.name }`은 "클로저를 읽고 → $0이 뭔지 파악하고 → 아 프로퍼티 하나 꺼내는구나"의 세 단계를 거치지만, `\.name`은 "name을 뽑는다"가 문법 그 자체니까요. 고차 함수 편에서 말한 의도의 선언이 한 단계 더 압축된 형태입니다. 반대로 변환 로직이 조금이라도 섞이면(`$0.name.uppercased() + "님"`) 클로저로 쓰는 게 맞습니다. KeyPath는 추출 전용이지 변환 도구가 아니에요.

이 자동 변환은 map만이 아니라 함수를 받는 모든 자리에서 작동합니다. `filter(\.isActive)`, `compactMap(\.thumbnail)`, `sorted(by:)`에 쓰는 KeyPathComparator, contains(where:)까지. 고차 함수 편의 레시피들이 KeyPath와 만나며 한 번 더 짧아집니다.

<figure>
  <img src="/assets/images/posts/ed14abe4-909b-4e97-9896-8e26955ce9e6/swift-keypath-2.jpg" alt="읽기 전용·값 타입 쓰기·참조 타입 쓰기로 나뉜 KeyPath 3계층 도식" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>읽기 전용·값 타입 쓰기·참조 대상 쓰기, 계층이 셋입니다</figcaption>
</figure>

## 세 가지 KeyPath — 읽기 전용이냐, 쓰기까지냐

KeyPath에는 계층이 있습니다. 경로가 어떤 접근을 허용하느냐에 따라 컴파일러가 다른 타입을 만들어요.

**KeyPath<Root, Value> — 읽기 전용.** let 프로퍼티나 읽기 전용 연산 프로퍼티로 가는 길입니다.

**WritableKeyPath<Root, Value> — 읽고 쓰기.** var 저장 프로퍼티(또는 setter 있는 연산 프로퍼티)로 가는 길이고, 값 타입의 프로퍼티를 경로로 수정할 수 있게 합니다.

**ReferenceWritableKeyPath<Root, Value> — 참조 대상에 쓰기.** 클래스 인스턴스의 var 프로퍼티로 가는 길입니다. let으로 잡은 참조여도 내용물은 바꿀 수 있다는 값·참조 의미론이 KeyPath 타입에도 반영된 거예요.

이 구분이 실무에서 의미를 갖는 순간은 "경로로 값을 바꾸는" 코드를 쓸 때입니다.

```swift
func update<T, V>(_ items: inout [T], path: WritableKeyPath<T, V>, to value: V) {
    for i in items.indices {
        items[i][keyPath: path] = value
    }
}

update(&cells, path: \.isSelected, to: false)   // 전체 선택 해제
```

읽기 전용 KeyPath를 넘기면 컴파일 에러가 됩니다. "이 함수는 그 프로퍼티를 수정한다"는 계약이 시그니처에 박혀 있는 것, 에러 처리 편의 throws가 실패 가능성을 시그니처에 새겼던 것과 같은 문법 철학입니다.

## 실무의 진짜 자리 — 설정과 로직의 분리

map 축약은 KeyPath의 입문이고, 진가는 "어떤 프로퍼티를 다룰지"를 데이터로 만드는 설계에서 나옵니다.

**정렬 기준의 외부화.** 테이블 정렬 UI를 만들 때, 컬럼마다 정렬 함수를 짜는 대신 KeyPathComparator 배열로 선언합니다. `[KeyPathComparator(\.name), KeyPathComparator(\.date, order: .reverse)]`처럼요. 사용자가 고른 컬럼에 따라 comparator만 바꿔 `items.sorted(using:)`에 넘기면, 정렬 로직은 한 줄로 고정되고 기준만 데이터로 움직입니다.

**폼 바인딩·검증 테이블.** "이 필드는 User의 이 프로퍼티에 대응한다"를 KeyPath로 선언해두면, 필드 순회·검증·저장이 테이블 주도(table-driven) 코드가 됩니다. 필드가 늘어도 로직은 안 늘어요.

**SwiftUI와 Observation의 기반.** `List(users, id: \.id)`의 id 파라미터가 KeyPath고, Observation 프레임워크가 "어떤 프로퍼티가 읽혔는지"를 추적하는 것도 KeyPath 기반입니다. 프레임워크가 "당신 타입의 어느 프로퍼티"를 알아야 하는 모든 자리에서 KeyPath가 표준 통화로 쓰여요.

공통 패턴이 보이시죠. 로직은 한 벌로 고정하고 어느 프로퍼티에 적용할지를 값으로 주입한다. 제네릭이 타입을 파라미터로 만들었듯, KeyPath는 프로퍼티 선택을 파라미터로 만듭니다. 전략 패턴의 초경량 버전이라고 봐도 좋습니다.

한 가지 주의점은 남용입니다. `\.self`나 다단계 경로가 뒤섞인 제네릭 API는 시그니처가 급격히 어려워집니다. Progressive Disclosure 편의 기준대로, 복잡성이 사용처로 새어 나오기 시작하면 평범한 클로저나 명시적 함수로 후퇴하는 게 맞아요.

<figure>
  <img src="/assets/images/posts/ed14abe4-909b-4e97-9896-8e26955ce9e6/swift-keypath-3.jpg" alt="정렬 기준 카드를 갈아끼우는 sorted using 기계 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>로직은 하나로 고정하고 어느 프로퍼티인지만 카드로 갈아끼웁니다</figcaption>
</figure>

## 정리

- KeyPath는 프로퍼티 접근 경로를 값으로 만든 타입입니다. `\User.name`은 `KeyPath<User, String>`이고, 오타·타입 불일치가 컴파일 타임에 잡힙니다.
- `map(\.name)`은 SE-0249의 자동 변환입니다. 단순 추출은 KeyPath, 변환이 섞이면 클로저로 씁니다.
- 계층이 셋입니다. 읽기 전용 KeyPath, 값 타입에 쓰는 WritableKeyPath, 참조 대상에 쓰는 ReferenceWritableKeyPath. 수정하는 함수는 Writable을 요구해 계약을 시그니처에 새깁니다.
- 진가는 프로퍼티 선택의 파라미터화입니다. 정렬 기준, 폼 바인딩, id 지정처럼 "로직은 하나, 대상 프로퍼티만 교체"가 필요한 자리의 표준 도구입니다.

이것으로 중급 시리즈 8편이 마무리됐습니다. 다음은 심화 시리즈, Swift Concurrency 연작으로 들어갑니다. 첫 편은 async/await가 콜백의 어떤 문제를 어떻게 풀었는지, 그리고 suspension이라는 개념의 정확한 의미입니다.

---

## 참고 자료

- [SE-0249: Key Path Expressions as Functions](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0249-key-path-literal-function-expressions.md)

<!-- RELATED-POSTS -->
## 이어서 읽기

- [프로토콜 지향 프로그래밍(POP), OOP 한계를 넘는 법](/%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-%EC%A7%80%ED%96%A5-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DPOP-OOP-%ED%95%9C%EA%B3%84%EB%A5%BC-%EB%84%98%EB%8A%94-%EB%B2%95/)
- [Swift DI 라이브러리 Factory 정리, Swinject와 뭐가 다를까](/Swift-DI-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-Factory-%EC%A0%95%EB%A6%AC-Swinject%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C/)
<!-- /RELATED-POSTS -->
