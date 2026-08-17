---
title: "Swift enum 상태 기계(FSM) 만들기, 스테이트 패턴 없이 상태 관리하는 법"
description: "iOS 앱 만들다 보면 꼭 마주치는 순간이 있어요. 화면 하나에 로딩 중, 성공, 실패, 빈 데이터 상태가 뒤섞이는 순간이요."
header:
  og_image: /assets/images/posts/032e19e2-54a8-4ad8-9b72-e807217e9344/1.jpg
tags:
  - Swift
  - iOS개발
  - enum
  - 상태기계
permalink: /Swift-enum-상태-기계FSM-만들기-스테이트-패턴-없이-상태-관리하는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-29
---

iOS 앱 만들다 보면 꼭 마주치는 순간이 있어요. 화면 하나에 로딩 중, 성공, 실패, 빈 데이터 상태가 뒤섞이는 순간이요.

`isLoading`, `hasError`, `isEmpty` 같은 Bool 변수를 잔뜩 만들어 관리하다 보면, 변수가 늘어날수록 지옥이 됩니다.

로딩 중인데 에러도 true인 상태. 논리적으로 말이 안 되는데 코드상으로는 얼마든지 만들어질 수 있는 조합이죠.

결론부터 말씀드릴게요. 이런 상황은 **스테이트 패턴(State Pattern) 없이 Swift enum 하나로 상태 기계(FSM)를 만들면** 훨씬 깔끔하게 정리됩니다.

오늘은 Bool 지옥에서 빠져나오는 방법을, 코드와 함께 풀어볼게요.

<figure>
  <img src="/assets/images/posts/032e19e2-54a8-4ad8-9b72-e807217e9344/1.jpg" alt="Bool 여러 개로 관리하다 지치면 Swift enum FSM 하나가 답입니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Bool 여러 개로 관리하다 지치면 Swift enum FSM 하나가 답입니다</figcaption>
</figure>

---

## 상태 기계(FSM)가 뭔가요?

어렵게 생각하지 않으셔도 됩니다.

상태 기계, FSM(Finite State Machine)은 "지금 있을 수 있는 상태의 개수가 정해져 있고, 정해진 규칙대로만 상태가 바뀐다"는 개념이에요.

신호등을 떠올리면 쉬워요.

> 초록 → 노랑 → 빨강. 이 순서로만 바뀌고, 초록에서 바로 빨강으로 건너뛰지 않습니다.

앱 화면도 똑같아요. `로딩` → `성공` 또는 `로딩` → `실패`로 가지, `성공`이면서 동시에 `로딩`인 상태는 존재하면 안 되죠.

그런데 Bool 변수 여러 개로 관리하면 이 "존재하면 안 되는 상태"가 코드상으로 만들어질 수 있어요.

바로 이 지점을 enum이 막아줍니다.

---

## Swift enum으로 상태 기계 만드는 법

Swift의 enum은 단순 상수 나열이 아니에요.

각 case가 값(associated value)을 품을 수 있다는 게 핵심입니다. 그래서 enum 하나에 상태와 데이터를 같이 담을 수 있죠.

화면 상태를 이렇게 정의해봤어요.

```swift
enum LoadState {
    case idle              // 아직 아무것도 안 함
    case loading           // 불러오는 중
    case loaded([Item])    // 성공, 데이터까지 함께
    case failed(Error)     // 실패, 에러까지 함께
}
```

보시면 `loaded`는 아이템 배열을, `failed`는 에러를 함께 들고 있어요.

성공했으면 반드시 데이터가 있고 실패했으면 반드시 에러가 있는 구조죠. 데이터 없는 성공 같은 이상한 상태가 아예 만들어질 수 없어요.

뷰에서는 이 상태 하나만 보고 화면을 그리면 됩니다.

```swift
switch state {
case .idle:    EmptyView()
case .loading: ProgressView()
case .loaded(let items): ItemList(items)
case .failed(let error): ErrorView(error)
}
```

`switch`가 모든 case를 강제로 다루게 하니까, 나중에 상태를 하나 추가해도 컴파일러가 "여기 처리 안 했다"고 바로 잡아줘요.

이게 진짜 큰 장점이에요. 상태 누락을 사람이 아니라 컴파일러가 잡아주니까요.

<figure>
  <img src="/assets/images/posts/032e19e2-54a8-4ad8-9b72-e807217e9344/2.jpg" alt="성공엔 데이터, 실패엔 에러까지 한 번에 담기는 게 핵심이에요" width="1200" height="1200" loading="lazy" decoding="async">
  <figcaption>성공엔 데이터, 실패엔 에러까지 한 번에 담기는 게 핵심이에요</figcaption>
</figure>

---

## 스테이트 패턴 없이도 괜찮을까요?

객체지향 교과서를 보면 상태 관리는 보통 스테이트 패턴으로 배웁니다.

상태마다 클래스를 하나씩 만들어 프로토콜로 묶고, 전환 로직을 각 클래스에 넣는 방식이죠.

솔직히 말씀드리면, 화면 상태 관리 정도에는 이게 과할 때가 많아요.

두 방식을 간단히 비교해봤어요. (2026년, 제 실무 경험 기준입니다)

| 항목 | enum FSM | 스테이트 패턴 |
|------|----------|--------------|
| 파일/타입 수 | enum 1개 | 상태 수만큼 클래스 |
| 상태 누락 방지 | switch 강제로 컴파일러가 잡음 | 사람이 직접 챙겨야 함 |
| 데이터 동봉 | associated value로 자연스럽게 | 프로퍼티로 따로 관리 |
| 적합한 규모 | 상태 3~7개 수준 | 상태별 로직이 매우 복잡할 때 |

상태 개수가 적당하고 상태별 로직이 그리 무겁지 않다면 enum FSM이 훨씬 가볍고 안전해요.

반대로 상태마다 수십 줄짜리 복잡한 동작이 붙는다면, 그때는 스테이트 패턴이나 별도 객체 분리를 고민해볼 만합니다.

무조건 한쪽이 정답은 아니라는 거죠.

---

## 상태 전환은 어떻게 관리하나요?

enum만 만들어두면 아무 상태로나 마구 바뀔 수 있는 거 아니냐고 물으실 수 있어요.

좋은 질문이에요. 그래서 저는 전환 규칙을 함수 하나에 모아둡니다.

```swift
mutating func fetch() {
    guard case .idle = self else { return } // idle일 때만 시작
    self = .loading
}
```

`guard case`로 "지금 idle일 때만 로딩으로 넘어가라"고 못 박아둔 거예요.

이렇게 전환 조건을 한곳에 두면 신호등처럼 정해진 길로만 상태가 흐르게 됩니다.

덕분에 나중에 코드를 다시 봐도 "이 상태는 어디서 어디로 갈 수 있지?"가 한눈에 들어와요.

<figure>
  <img src="/assets/images/posts/032e19e2-54a8-4ad8-9b72-e807217e9344/4-1783847575354.png" alt="정해진 길로만 흐르는 상태들, 이렇게 생겼어요" width="376" height="776" loading="lazy" decoding="async">
  <figcaption>정해진 길로만 흐르는 상태들, 이렇게 생겼어요</figcaption>
</figure>

**Q. 상태가 5개가 넘어가면요?**

그래도 enum은 여전히 잘 버팁니다. 다만 전환 규칙이 복잡해지면 전환 함수를 상태별로 잘게 나눠 정리하는 걸 추천해요.

**Q. SwiftUI랑 잘 맞나요?**

아주 잘 맞아요. enum 상태를 `@State`나 `@Published`로 두고 `switch`로 뷰를 그리면, 상태와 화면이 딱 붙어서 움직입니다.

---

처음엔 Bool 몇 개면 충분해 보이지만, 상태가 얽히기 시작하면 결국 enum FSM으로 돌아오게 됩니다.

지금 화면 상태 관리로 골치 아프시다면, 오늘 본 enum 하나부터 슬쩍 바꿔보세요. 생각보다 금방 편해지실 거예요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 정적 팩토리 메서드(Static Factory Method), init 대신 static func make 쓰는 이유](/Swift-%EC%A0%95%EC%A0%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9CStatic-Factory-Method-init-%EB%8C%80%EC%8B%A0-static-func-make-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
- [Swift 인터프리터 패턴(Interpreter Pattern), 미니 언어 해석기 직접 만들기](/Swift-%EC%9D%B8%ED%84%B0%ED%94%84%EB%A6%AC%ED%84%B0-%ED%8C%A8%ED%84%B4Interpreter-Pattern-%EB%AF%B8%EB%8B%88-%EC%96%B8%EC%96%B4-%ED%95%B4%EC%84%9D%EA%B8%B0-%EC%A7%81%EC%A0%91-%EB%A7%8C%EB%93%A4%EA%B8%B0/)
- [Swift Service Locator 패턴, DI의 대안일까 안티패턴일까 (실무 정리)](/Swift-Service-Locator-%ED%8C%A8%ED%84%B4-DI%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%BC%EA%B9%8C-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4%EC%9D%BC%EA%B9%8C-%EC%8B%A4%EB%AC%B4-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
