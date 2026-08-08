---
title: "[Swift 중급 #5] Swift 고차 함수 실전 정리, lazy 시퀀스까지"
description: "map·filter·compactMap·flatMap·reduce 다섯 함수의 구분은 클로저가 무엇을 반환하느냐로 갈립니다. for 루프와의 선택 기준, 체이닝이 만드는 중간 배열, lazy 시퀀스가 푸는 문제를 정리했습니다."
header:
  og_image: /assets/images/posts/ce6e6844-64dc-4e78-a2fc-3b8247084509/swift-higher-order-functions-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - 고차함수
  - map
permalink: /Swift-중급-5-Swift-고차-함수-실전-정리-lazy-시퀀스까지/
toc: true
toc_sticky: true
last_modified_at: 2026-08-06
---

map과 filter는 다들 씁니다. 문제는 그다음이에요. compactMap과 flatMap은 이름이 비슷해서 헷갈리고 reduce는 시그니처가 어려워서 피하게 되고, 체이닝을 길게 이어 쓰다 보면 "이거 배열을 몇 번이나 새로 만드는 거지?"라는 성능 불안이 스멀스멀 올라옵니다.

중급 시리즈 5편은 고차 함수 실전 정리입니다. 다섯 함수의 정확한 구분, for 루프와의 선택 기준, 그리고 lazy 시퀀스가 해결하는 문제까지 다룹니다. 클로저 편에서 다진 기초 위에 올리는 실무편이에요.

<figure>
  <img src="/assets/images/posts/ce6e6844-64dc-4e78-a2fc-3b8247084509/swift-higher-order-functions-1.jpg" alt="MAP·FILTER·REDUCE 등 다섯 기계가 늘어선 고차 함수 파이프라인 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>다섯 기계의 구분은 클로저가 무엇을 반환하는가입니다</figcaption>
</figure>

## 다섯 함수의 정확한 자리 — 시그니처가 말해주는 것

고차 함수(higher-order function)는 함수를 인자로 받는 함수입니다. 배열 처리 5인방의 구분은 클로저의 시그니처, 정확히는 "원소 하나가 무엇으로 변하는가"로 정리됩니다.

**map: 원소 → 새 원소. 개수 유지.** n개가 들어가면 n개가 나옵니다. 변환만 하고 걸러내지 않아요.

**filter: 원소 → Bool. 개수 감소 가능, 원소는 그대로.** 조건에 맞는 원소만 남기고 변환은 하지 않습니다.

**compactMap: 원소 → 옵셔널. nil을 버리고 벗겨서 반환.** map과 filter의 특수 조합입니다. 변환이 실패할 수 있는 작업에 씁니다.

```swift
let inputs = ["1", "2", "삼", "4"]
let numbers = inputs.compactMap { Int($0) }  // [1, 2, 4]
```

Int("삼")은 nil이고, compactMap이 그걸 걸러냅니다. `map { Int($0) }`이었다면 `[Int?]`가 나와서 옵셔널 처리가 사용처마다 반복됐을 거예요. "옵셔널을 경계에서 벗겨라"던 옵셔널 편의 원칙을 컬렉션 버전으로 구현한 게 compactMap인 셈입니다.

**flatMap: 원소 → 배열. 중첩을 한 겹 편다.** 원소 하나가 여러 개로 펼쳐질 때 씁니다. `sentences.flatMap { $0.split(separator: " ") }`처럼 문장 배열에서 단어 배열을 만들면, map이었다면 `[[단어]]`로 중첩됐을 결과가 한 겹 펴집니다. compactMap과의 구분은 이렇게 외우면 끝납니다. 클로저가 옵셔널을 반환하면 compactMap, 배열(시퀀스)을 반환하면 flatMap.

**reduce: 컬렉션 전체 → 값 하나.** 합계, 최댓값, 딕셔너리 만들기처럼 하나로 접는 모든 작업의 일반형입니다. `reduce(0, +)`가 합계고, 첫 인자가 시작값, 두 번째가 "지금까지 결과와 다음 원소를 합치는 법"입니다. 성능 팁 하나만 기억해두세요. 배열이나 딕셔너리를 누적할 때는 `reduce(into:)`를 씁니다. 일반 reduce는 매 단계 누적값을 복사하지만 into 버전은 하나를 계속 수정해서 대량 데이터에서 차이가 큽니다.

## for 루프 vs 고차 함수 — 가독성의 실체

"for 루프 대신 고차 함수를 쓰는 게 Swift답다"는 말이 반쯤 맞고 반쯤 위험합니다. 기준을 세워볼게요.

고차 함수의 진짜 이점은 짧아서가 아니라 의도가 선언되기 때문입니다. filter를 본 순간 읽는 사람은 "걸러내는구나, 원소는 안 바뀌겠구나"를 시그니처 수준에서 보장받습니다. for 루프는 본문을 다 읽어야 그 결론에 도달하고요. 철학 1편에서 본 표현력, "의도가 코드에 그대로 보이게"의 사례입니다.

그런데 이 이점은 각 단계가 단순할 때만 유지됩니다. 클로저 안에 조건문이 세 겹 들어가고 부수효과(외부 변수 수정, print)까지 섞이면, "filter니까 걸러내겠구나"라는 기대가 배신당하면서 오히려 for보다 읽기 어려워져요. 최소 놀람의 원칙 위반이죠. 판단 기준을 정리하면 이렇습니다.

- 변환·필터·집계의 단순 조합 → 고차 함수.
- 단계마다 복잡한 분기, 부수효과, 중간 탈출(break)이 필요 → for 루프. 특히 break에 해당하는 도구가 고차 함수엔 마땅치 않아서, "조건 만족하는 첫 원소에서 멈추기"는 `first(where:)`가 있지만 그 이상의 조기 종료 로직은 루프가 자연스럽습니다.
- 인덱스가 필요한 작업 → `enumerated()`를 쓴 고차 함수도 되지만, 복잡해지면 루프.

한 가지 안티패턴은 명확히 해둘게요. forEach 안에서 외부 배열에 append하는 코드입니다. `var result: [Int] = []; items.forEach { result.append($0 * 2) }`는 map 한 줄이 할 일을 수동으로 재구현하면서 가변 상태만 늘린 형태예요. forEach는 각 원소로 부수효과를 일으키는 자리(알림 보내기 등)에만 어울리고 무언가를 만들어내는 자리라면 map 계열이 맞습니다.

<figure>
  <img src="/assets/images/posts/ce6e6844-64dc-4e78-a2fc-3b8247084509/swift-higher-order-functions-2.jpg" alt="중간 배열이 쌓이는 체이닝과 한 알씩 통과하는 lazy 파이프를 대비한 도식" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>체이닝은 단계마다 중간 배열을 만들고, lazy는 한 알씩 통과시킵니다</figcaption>
</figure>

## 체이닝의 비용 — 중간 배열이라는 숨은 손님

고차 함수를 이어 붙이면 우아해 보이지만, 각 단계가 배열을 새로 만든다는 사실을 알아둬야 합니다.

```swift
let result = products
    .filter { $0.inStock }      // 중간 배열 1
    .map { $0.price }           // 중간 배열 2
    .prefix(5)                  // 최종
```

원소 100만 개라면 filter가 최대 100만 개짜리 배열을 만들고 map이 또 만듭니다. 앞의 5개만 필요한데도 전체를 두 번 순회하고 두 번 할당하는 거죠.

이 문제의 표준 해법이 lazy입니다. `products.lazy.filter{...}.map{...}.prefix(5)`처럼 lazy를 끼우면 파이프라인의 성격이 바뀝니다. 각 단계가 즉시 실행되어 배열을 만드는 대신, "무엇을 할지"만 기록된 지연 시퀀스가 만들어지고, 최종 소비 시점에 원소가 하나씩 전체 파이프라인을 통과해요. 다섯 개가 채워지는 순간 순회가 멈추니, 100만 개 중 앞쪽 일부만 건드리고 끝납니다. 중간 배열도 없고요.

그럼 항상 lazy를 쓰면 되지 않냐면, 그건 아닙니다. lazy는 결과를 저장하지 않으므로 같은 지연 시퀀스를 두 번 소비하면 계산도 두 번 됩니다. 클로저가 참조로 저장됐다가 나중에 실행되는 구조라 escaping 관련 제약이 생기기도 하고요. 기준은 단순하게 잡으면 됩니다. 데이터가 크고 일부만 소비할 때(prefix, first(where:) 조합) lazy가 빛나고, 전부 소비해서 배열로 저장할 거면 그냥 즉시 실행이 낫습니다. 그리고 이런 최적화는 프로퍼티 편의 lazy var처럼 "계산을 미루는 게 이득인가"라는 같은 질문의 컬렉션 버전이라는 걸 알아두면 개념이 하나로 묶여요.

## 실전 조합 레시피

자주 쓰는 조합 몇 개를 레시피로 남깁니다.

**딕셔너리 만들기.** `Dictionary(uniqueKeysWithValues: users.map { ($0.id, $0) })`로 ID 조회 테이블을 만듭니다. 키 중복 가능성이 있으면 `Dictionary(grouping: orders, by: { $0.customerID })`가 그룹핑 버전이고요.

**옵셔널 안전 통과.** 서버 응답의 문자열 ID 배열을 URL 배열로: `ids.compactMap { URL(string: $0) }`. 실패는 조용히 걸러지고 타입은 `[URL]`로 확정됩니다.

**정렬 조합.** `items.sorted { $0.priority > $1.priority }` 대신 KeyPath를 쓰는 `items.sorted(using: KeyPathComparator(\.priority, order: .reverse))`도 알아두면 좋습니다. KeyPath 이야기는 뒤에서 따로 다룰 예정입니다.

**집계.** 장바구니 총액은 `cart.reduce(0) { $0 + $1.price * Double($1.quantity) }`. 다만 단순 합계는 `cart.map(\.subtotal).reduce(0, +)`처럼 쪼개는 게 더 읽기 쉬울 때가 많습니다. reduce 클로저가 복잡해지면 쪼개라는 신호입니다.

<figure>
  <img src="/assets/images/posts/ce6e6844-64dc-4e78-a2fc-3b8247084509/swift-higher-order-functions-3.jpg" alt="고차 함수와 for 루프 갈림길 표지판을 읽는 개발자 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>단순 변환이면 고차 함수, 분기·부수효과·조기 종료면 루프</figcaption>
</figure>

## 정리

- 구분 기준은 클로저가 반환하는 것입니다. 새 원소면 map, Bool이면 filter, 옵셔널이면 compactMap, 배열이면 flatMap, 전체를 하나로 접으면 reduce(누적 컬렉션엔 reduce(into:)).
- 고차 함수의 이점은 의도의 선언입니다. 클로저가 복잡해지고 부수효과가 섞이면 그 이점이 사라지니 for 루프로 돌아갑니다.
- 체이닝은 단계마다 중간 배열을 만듭니다. 큰 데이터의 일부만 소비할 때는 lazy로 지연 파이프라인을 만들고, 전부 소비할 때는 즉시 실행을 유지합니다.
- forEach로 배열을 만들고 있다면 map 계열로 바꿀 자리입니다.

다음 편은 JSON과 씨름하는 모든 iOS 개발자의 주제, Codable 심화입니다. CodingKeys부터 중첩 구조, 날짜 전략, 그리고 "필드 하나 때문에 전체 디코딩이 실패하는" 문제의 처방까지 다룹니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [\[Swift 중급 #6\] Swift Codable 심화, 4대 지뢰 처방전](/Swift-%EC%A4%91%EA%B8%89-6-Swift-Codable-%EC%8B%AC%ED%99%94-4%EB%8C%80-%EC%A7%80%EB%A2%B0-%EC%B2%98%EB%B0%A9%EC%A0%84/)
<!-- /RELATED-POSTS -->
