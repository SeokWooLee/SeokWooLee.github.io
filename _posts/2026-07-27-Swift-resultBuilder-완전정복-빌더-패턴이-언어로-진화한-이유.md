---
title: "Swift resultBuilder 완전정복, 빌더 패턴이 언어로 진화한 이유"
description: "SwiftUI를 처음 봤을 때 이런 생각 안 드셨나요?"
header:
  og_image: /assets/images/posts/06b754be-10d0-4f89-84dd-7e37c4a55d03/1.png
tags:
  - Swift
  - resultBuilder
  - 빌더패턴
  - SwiftUI
permalink: /Swift-resultBuilder-완전정복-빌더-패턴이-언어로-진화한-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

# Swift resultBuilder 완전정복, 빌더 패턴이 언어 문법으로 진화하기까지

SwiftUI를 처음 봤을 때 이런 생각 안 드셨나요?

"아니, `VStack { Text("A"); Text("B") }` 이 중괄호 안에 어떻게 여러 뷰를 그냥 나열만 해도 되는 거지?"

처음 보면 정말 마법 같죠. 세미콜론도, 콤마도, `return`도 없는데 알아서 조립이 되니까요.

그 마법의 정체가 바로 오늘 이야기할 **Swift resultBuilder**입니다.

결론부터 말씀드리면, resultBuilder는 우리가 디자인 패턴으로 손수 만들던 **빌더 패턴을 컴파일러가 대신 짜주도록 언어 차원으로 끌어올린 기능**이에요. 객체를 단계적으로 조립하는 그 반복 코드를, 중괄호 블록 문법 하나로 대체한 겁니다.

<figure>
  <img src="/assets/images/posts/06b754be-10d0-4f89-84dd-7e37c4a55d03/1.png" alt="손으로 짜던 빌더 패턴이 resultBuilder로 넘어가는 그림, 이 한 장이 핵심이에요">
  <figcaption>손으로 짜던 빌더 패턴이 resultBuilder로 넘어가는 그림, 이 한 장이 핵심이에요</figcaption>
</figure>

---

## 빌더 패턴이 뭐였길래?

먼저 기존 빌더 패턴을 잠깐 떠올려볼게요.

빌더 패턴은 복잡한 객체를 한 번에 만들지 않고, 부품을 하나씩 붙여가며 완성하는 방식이에요.

```swift
let request = URLRequestBuilder()
    .setURL("https://naver.com")
    .setMethod("GET")
    .addHeader("Accept", "application/json")
    .build()
```

이렇게 메서드를 체이닝하면서 조립하죠.

읽기는 편한데 단점이 있어요. `Builder` 클래스를 매번 손으로 만들어야 하고, `build()`를 깜빡하면 객체가 완성이 안 됩니다.

즉, 조립 로직을 **개발자가 직접 관리**해야 했던 거예요.

resultBuilder는 바로 이 지점을 컴파일러에게 넘깁니다.

---

## resultBuilder는 어떻게 동작하나요?

핵심 아이디어는 간단해요.

> 중괄호 블록 안에 나열한 값들을 컴파일러가 정해진 규칙 함수에 하나씩 넣어 최종 결과 하나로 합쳐줍니다.

그 규칙 함수가 바로 `buildBlock` 같은 정적 메서드들이에요.

예를 들어 문자열을 모으는 아주 단순한 빌더를 만들어볼게요.

```swift
@resultBuilder
struct StringBuilder {
    static func buildBlock(_ parts: String...) -> String {
        parts.joined(separator: " ")
    }
}

@StringBuilder
func greeting() -> String {
    "안녕하세요"
    "resultBuilder"
    "입니다"
}
// 결과: "안녕하세요 resultBuilder 입니다"
```

`greeting()` 함수 안을 보면 문자열을 그냥 세 줄 나열만 했죠?

컴파일러가 이 세 줄을 `buildBlock("안녕하세요", "resultBuilder", "입니다")` 호출로 바꿔치기해준 겁니다.

<figure>
  <img src="/assets/images/posts/06b754be-10d0-4f89-84dd-7e37c4a55d03/4-1783847558179.png" alt="블록 나열이 buildBlock 호출로 바뀌는 순간" loading="lazy">
  <figcaption>블록 나열이 buildBlock 호출로 바뀌는 순간</figcaption>
</figure>

우리가 손으로 짜던 조립 코드를, 문법이 대신 써준 셈이에요.

---

## 조건문이랑 반복문은 어떻게 처리되나요?

블록 안에서 `if`나 `for`를 쓰고 싶을 때가 있잖아요. SwiftUI에서도 자주 하고요.

이때를 위해 resultBuilder에는 추가 규칙 메서드가 준비돼 있어요.

주요 메서드를 표로 정리해봤어요.

| 메서드 | 언제 호출되나 |
| --- | --- |
| `buildBlock` | 블록 안 여러 값을 하나로 합칠 때 |
| `buildOptional` | `if`만 있고 `else`가 없을 때 |
| `buildEither(first:)` / `buildEither(second:)` | `if-else` 분기를 처리할 때 |
| `buildArray` | `for` 반복 결과를 모을 때 |
| `buildExpression` | 각 줄의 표현식을 먼저 변환할 때 |

이 메서드들을 얼마나 구현하느냐에 따라, 그 빌더 안에서 어떤 문법을 허용할지가 정해져요.

`buildOptional`을 안 만들면 블록 안에서 `if`를 못 쓰는 식이죠.

그래서 SwiftUI의 `@ViewBuilder`는 이 메서드들을 거의 다 구현해두고 있어요. 그 덕에 뷰 블록 안에서 조건문도 반복문도 자연스럽게 쓸 수 있는 거고요.

<figure>
  <img src="/assets/images/posts/06b754be-10d0-4f89-84dd-7e37c4a55d03/2.png" alt="@ViewBuilder는 규칙 메서드를 거의 다 구현해둬서 이게 가능한 거예요" loading="lazy">
  <figcaption>@ViewBuilder는 규칙 메서드를 거의 다 구현해둬서 이게 가능한 거예요</figcaption>
</figure>

---

## 직접 써보니 좋았던 점과 주의할 점

제가 작은 HTML 생성기나 테스트 데이터 구성에 resultBuilder를 써봤는데요.

가장 좋았던 건 **호출부가 선언적으로 예뻐진다**는 점이었어요. 조립 과정이 안 보이니까 읽는 사람은 "무엇을 만들지"에만 집중하게 되더라고요.

다만 주의할 점도 분명히 있었어요.

1. 컴파일 에러 메시지가 불친절할 때가 많아요. 블록 안에서 타입이 안 맞으면 엉뚱한 위치를 가리키곤 합니다.
2. 남용하면 오히려 독이에요. 단순한 배열 하나 만들 거면 그냥 배열 리터럴이 낫습니다.
3. 디버깅할 때 실제로 어떤 `build...` 메서드가 불렸는지 추적이 어려워요.

그래서 저는 **DSL(Domain-Specific Language, 도메인 특화 언어)처럼 반복적으로 조립되는 구조**일 때만 쓰는 걸 추천드려요. SwiftUI, 서버 라우팅 정의, 쿼리 빌더처럼요.

한 가지 팁으로, iOS 개발 실무에서는 대부분 직접 `@resultBuilder`를 만들 일보다 `@ViewBuilder`를 이해하고 잘 쓰는 게 먼저예요.

<figure>
  <img src="/assets/images/posts/06b754be-10d0-4f89-84dd-7e37c4a55d03/3.png" alt="눈으로만 읽지 말고 오늘 이 예제 꼭 한 번 쳐보세요" loading="lazy">
  <figcaption>눈으로만 읽지 말고 오늘 이 예제 꼭 한 번 쳐보세요</figcaption>
</figure>

---

## 마무리하며

정리하면, resultBuilder는 우리가 손으로 짜던 빌더 패턴을 언어가 흡수해버린 진화형이에요.

중괄호 안에 나열만 하면 컴파일러가 조립해준다는 감각만 잡으면, SwiftUI가 왜 그렇게 생겼는지도 자연스럽게 이해되실 거예요.

오늘 예제 코드를 직접 한 번 타이핑해보세요. 눈으로 읽는 것보다 훨씬 빨리 손에 붙거든요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 빌더 패턴(Builder Pattern)으로 매개변수 8개 초기화 지옥 탈출하기](/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
<!-- /RELATED-POSTS -->
