---
title: "Swift 인터프리터 패턴(Interpreter Pattern), 미니 언어 해석기 직접 만들기"
description: "디자인 패턴 책을 펼치면 늘 마지막쯤에 등장하는 게 인터프리터 패턴이에요. \"이게 대체 언제 쓰이나\" 싶어서 대충 넘기기 쉬운 패턴이죠."
header:
  og_image: /assets/images/posts/0a1bed82-22f7-4dfc-ac5d-6ca5f79e3a35/1.png
tags:
  - Swift
  - 인터프리터패턴
  - 디자인패턴
  - iOS개발
permalink: /Swift-인터프리터-패턴Interpreter-Pattern-미니-언어-해석기-직접-만들기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-25
---

디자인 패턴 책을 펼치면 늘 마지막쯤에 등장하는 게 인터프리터 패턴이에요. "이게 대체 언제 쓰이나" 싶어서 대충 넘기기 쉬운 패턴이죠.

그런데 계산기 앱을 만들다가 문자열 수식을 직접 계산해야 하는 순간이 오더라고요. 그때 인터프리터 패턴이 딱 맞아떨어졌습니다.

이 글에서는 Swift로 아주 작은 언어 해석기, 그러니까 미니 인터프리터를 직접 만들어봅니다. `1 + 2 * 3` 같은 수식을 읽어서 숫자 7을 뱉어내는 것까지가 목표예요.

결론부터 말하면 이렇습니다.

> 인터프리터 패턴은 문법 규칙 하나하나를 클래스(또는 열거형)로 바꿔서, 트리 구조로 조립한 뒤 재귀로 훑어 결과를 얻는 방식입니다.

말은 어렵지만 코드로 보면 생각보다 단순해요. 함께 만들어봅시다.

<figure>
  <img src="/assets/images/posts/0a1bed82-22f7-4dfc-ac5d-6ca5f79e3a35/1.png" alt="수식 하나가 숫자 7이 되기까지, 인터프리터 패턴이 하는 일이에요">
  <figcaption>수식 하나가 숫자 7이 되기까지, 인터프리터 패턴이 하는 일이에요</figcaption>
</figure>

## 인터프리터 패턴이 뭔가요?

인터프리터 패턴은 "나만의 작은 언어"를 만들고 그 언어를 해석하는 규칙을 코드로 표현하는 방법이에요.

여기서 말하는 언어는 거창한 게 아닙니다. 수식, 검색 필터 조건, 게임의 규칙 스크립트처럼 정해진 문법을 가진 작은 표현이면 다 해당돼요.

핵심 아이디어는 딱 하나입니다.

문법의 각 요소를 객체로 만들고, 그 객체들이 자기 자신을 해석하는 `interpret()` 메서드를 갖게 하는 거예요.

예를 들어 `1 + 2`라는 수식을 생각해볼게요. 여기엔 숫자 `1`, 숫자 `2`, 그리고 더하기 연산 `+`가 있습니다.

숫자는 "나는 그냥 내 값을 돌려줄게"라고 해석하고, 더하기는 "왼쪽을 해석하고 오른쪽을 해석해서 둘을 더할게"라고 해석해요.

이렇게 작은 규칙들이 모여 트리를 이루고 맨 위에서 한 번 해석을 호출하면 아래로 쭉 내려가며 계산이 끝납니다.

---

## Swift로 표현식 트리 설계하기

Swift에서는 열거형(enum)이 이 패턴과 정말 잘 어울려요. 재귀 열거형을 쓰면 트리 구조를 아주 깔끔하게 표현할 수 있거든요.

저는 처음엔 프로토콜과 클래스로 만들었는데, enum으로 바꾸니 코드가 절반으로 줄더라고요.

먼저 표현식을 나타내는 열거형을 정의합니다. 숫자 하나, 그리고 두 표현식을 더하거나 곱하는 경우로 나눴어요.

이 열거형은 스스로를 다시 품는 재귀 구조라서 `indirect` 키워드를 붙여야 합니다.

```swift
indirect enum Expr {
    case number(Double)        // 숫자 리터럴
    case add(Expr, Expr)       // 덧셈
    case multiply(Expr, Expr)  // 곱셈
}
```

이제 이 트리를 해석하는 함수를 만듭니다. 각 경우를 재귀로 처리하는 게 인터프리터 패턴의 핵심이에요.

다음 함수는 표현식을 받아 실제 숫자 값을 계산해 돌려줍니다.

```swift
func interpret(_ expr: Expr) -> Double {
    switch expr {
    case .number(let value):
        return value
    case .add(let l, let r):
        return interpret(l) + interpret(r)
    case .multiply(let l, let r):
        return interpret(l) * interpret(r)
    }
}
```

여기까지 오면 `1 + 2 * 3`을 트리로 조립해서 계산할 수 있어요.

`.add(.number(1), .multiply(.number(2), .number(3)))`처럼 손으로 트리를 만들어 `interpret`에 넣으면 결과 7이 나옵니다.

<figure>
  <img src="/assets/images/posts/0a1bed82-22f7-4dfc-ac5d-6ca5f79e3a35/4-1783847801677.png" alt="곱셈이 먼저 묶여야 순서가 맞아요" loading="lazy">
  <figcaption>곱셈이 먼저 묶여야 순서가 맞아요</figcaption>
</figure>

---

## 문자열 수식은 어떻게 트리로 바꾸나요?

여기서 한 가지 의문이 들 거예요. 사용자는 트리가 아니라 `"1 + 2 * 3"` 같은 문자열을 입력하잖아요.

이 문자열을 트리로 바꾸는 과정을 파싱(parsing)이라고 부릅니다. 그리고 이 일을 하는 코드를 파서라고 해요.

정석대로 하면 파서는 두 단계로 나뉩니다.

1. 렉서(lexer): 문자열을 토큰 단위로 쪼갠다 (예: `1`, `+`, `2`)
2. 파서(parser): 토큰을 문법 규칙에 따라 트리로 조립한다

이 두 단계를 제대로 구현하면 글이 너무 길어지니 여기서는 개념만 짚고 넘어갈게요.

핵심은 이겁니다. 인터프리터 패턴 자체는 트리를 해석하는 부분만 담당해요. 문자열을 트리로 바꾸는 파싱은 별개의 일입니다.

그래서 저는 학습 단계에서는 파서를 잠시 건너뛰고 트리를 손으로 만들어 해석기부터 완성하는 걸 추천해요. 그래야 패턴의 본질이 눈에 들어옵니다.

<figure>
  <img src="/assets/images/posts/0a1bed82-22f7-4dfc-ac5d-6ca5f79e3a35/2.png" alt="코드는 화면에, 트리는 노트에. 이렇게 그려보면 확 와닿더라고요" loading="lazy">
  <figcaption>코드는 화면에, 트리는 노트에. 이렇게 그려보면 확 와닿더라고요</figcaption>
</figure>

---

## 실제로 어디에 쓰이나요?

솔직히 말하면 인터프리터 패턴을 직접 밑바닥부터 구현할 일은 자주 없어요. 복잡한 언어라면 이미 잘 만들어진 파서 라이브러리를 쓰는 게 훨씬 낫거든요.

그래도 이 패턴을 이해하면 얻는 게 많습니다.

- 정규식 엔진이 내부에서 어떻게 동작하는지 감이 잡혀요
- SwiftUI의 선언형 문법이 왜 트리 구조인지 이해가 됩니다
- 검색 필터나 수식 계산 같은 작은 DSL(Domain-Specific Language, 도메인 특화 언어)을 만들 때 바로 응용할 수 있어요

특히 간단한 계산기, 조건 필터, 게임 스크립트처럼 문법이 단순하고 범위가 좁을 때는 직접 만드는 게 오히려 깔끔합니다.

저는 이 패턴을 익히고 나서 SwiftUI의 뷰 구조가 완전히 다르게 보였어요. 뷰 하나하나가 결국 해석되는 트리의 노드였던 거죠.

<figure>
  <img src="/assets/images/posts/0a1bed82-22f7-4dfc-ac5d-6ca5f79e3a35/3.png" alt="이 패턴을 알고 나니 SwiftUI 뷰가 다르게 보였어요" loading="lazy">
  <figcaption>이 패턴을 알고 나니 SwiftUI 뷰가 다르게 보였어요</figcaption>
</figure>

---

## 정리하며

오늘은 Swift로 미니 언어 해석기를 만들며 인터프리터 패턴을 살펴봤어요.

재귀 열거형으로 표현식 트리를 만들고 `interpret` 함수로 재귀 해석하는 것. 이 두 가지가 전부입니다.

처음엔 낯설어도 직접 `1 + 2 * 3`을 계산해보면 "아, 이거였구나" 하는 순간이 옵니다. 오늘 배운 코드를 꼭 한 번 직접 타이핑해보시길 응원할게요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 전략 패턴(Strategy Pattern), 프로토콜·클로저로 알고리즘 갈아끼우기](/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/)
- [Swift 모노스테이트 패턴(Monostate Pattern), 싱글톤의 대안이 될 수 있을까](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Swift 델리게이트(Delegate) vs 옵저버(Observer), 언제 뭘 써야 할까 비교 총정리](/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/)
<!-- /RELATED-POSTS -->
