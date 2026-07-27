---
title: "Swift 정적 팩토리 메서드(Static Factory Method), init 대신 static func make 쓰는 이유"
description: "iOS 개발을 하다 보면 남의 코드에서 init(...) 대신 static func make(...) 같은 걸 만나고 갸웃했던 적 있으실 거예요."
header:
  og_image: /assets/images/posts/2f046b04-15c9-4d73-b0dd-0d5c474e974f/1.png
tags:
  - Swift
  - 정적팩토리메서드
  - iOS개발
  - 스위프트
permalink: /Swift-정적-팩토리-메서드Static-Factory-Method-init-대신-static-func-make-쓰는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

iOS 개발을 하다 보면 남의 코드에서 `init(...)` 대신 `static func make(...)` 같은 걸 만나고 갸웃했던 적 있으실 거예요.

먼저 결론부터 말씀드릴게요.

> Swift 정적 팩토리 메서드는 생성 과정에 이름을 붙이고, 반환 타입을 유연하게 바꾸고, 객체 재사용까지 제어할 수 있어서 init만으로는 답답할 때 꺼내 쓰는 카드입니다.

오늘은 init 대신 static func make를 쓰는 이유를 실무 관점에서 하나씩 풀어볼게요.

<figure>
  <img src="/assets/images/posts/2f046b04-15c9-4d73-b0dd-0d5c474e974f/1.png" alt="Swift 정적 팩토리 메서드, init이랑 나란히 놓고 보면 차이가 보여요">
  <figcaption>Swift 정적 팩토리 메서드, init이랑 나란히 놓고 보면 차이가 보여요</figcaption>
</figure>

---

## 정적 팩토리 메서드가 대체 뭔가요?

말은 거창한데 개념은 단순해요.

객체를 만들어 돌려주는 `static` 메서드예요. 생성자를 직접 부르는 대신, 생성을 감싼 함수를 하나 두는 거죠.

아래처럼 생겼어요.

```swift
struct Button {
    let title: String
    let style: Style

    // init을 감싼 정적 팩토리 메서드
    static func makePrimary(title: String) -> Button {
        Button(title: title, style: .primary)
    }
}
```

호출부는 `Button.makePrimary(title: "확인")` 이렇게 돼요.

`Button(title:style:)`를 직접 부르는 것과 결과는 같아요. 다만 "어떤 버튼을 만드는지"가 이름에 드러나죠.

이 작은 차이가 실무에선 꽤 크게 작용합니다.

---

## init 대신 make를 쓰는 이유 4가지

제가 실제로 체감한 장점을 꼽아 볼게요.

**1. 이름으로 의도를 드러낼 수 있어요**

생성자는 이름이 전부 `init`으로 똑같아요. 파라미터 조합으로만 구분되죠.

그래서 비슷한 init이 여러 개면 헷갈립니다. `make(fromJSON:)`, `make(withDefaults:)`처럼 이름을 붙이면 호출부만 봐도 뭘 만드는지 읽혀요.

**2. 매번 새 객체를 안 만들어도 돼요**

init은 호출할 때마다 무조건 새 인스턴스를 만듭니다.

반면 팩토리 메서드는 캐시된 객체나 이미 있는 싱글턴을 돌려줄 수 있어요. `Bool`의 참·거짓처럼 값이 정해진 경우엔 재사용이 훨씬 이득이죠.

**3. 반환 타입을 유연하게 바꿀 수 있어요**

이게 개인적으로 제일 강력하다고 느낀 부분이에요.

팩토리 메서드는 선언된 타입의 하위 타입이나 프로토콜 구현체를 돌려줄 수 있습니다. 호출하는 쪽은 구체 타입을 몰라도 되고요.

```swift
protocol Shape { func area() -> Double }

enum ShapeFactory {
    // 조건에 따라 다른 구현체를 반환
    static func make(sides: Int) -> Shape {
        sides == 4 ? Square() : Triangle()
    }
}
```

`make(sides:)`의 반환 타입은 `Shape` 하나지만, 실제로는 상황에 맞는 구현체가 나와요.

<figure>
  <img src="/assets/images/posts/2f046b04-15c9-4d73-b0dd-0d5c474e974f/4-1783847599785.png" alt="겉보기엔 Shape 하나, 속은 상황 따라 다른 타입" loading="lazy">
  <figcaption>겉보기엔 Shape 하나, 속은 상황 따라 다른 타입</figcaption>
</figure>

**4. 실패를 부드럽게 처리할 수 있어요**

`init?`이나 `throws`로도 되지만, 팩토리 메서드는 반환값 자체를 옵셔널로 두거나 `Result`로 감싸기 편해요. 생성 로직이 복잡할 때 흐름이 깔끔해집니다.

<figure>
  <img src="/assets/images/posts/2f046b04-15c9-4d73-b0dd-0d5c474e974f/2.png" alt="make 한 줄 넣었을 뿐인데 호출부가 확 읽히더라고요" loading="lazy">
  <figcaption>make 한 줄 넣었을 뿐인데 호출부가 확 읽히더라고요</figcaption>
</figure>

---

## init이랑 뭐가 다를까? 한눈에 비교

헷갈리실 것 같아 표로 정리했어요.

| 구분 | init (생성자) | static func make (정적 팩토리) |
|---|---|---|
| 이름 | 항상 init 고정 | 자유롭게 지정 |
| 새 인스턴스 | 매번 강제 생성 | 재사용·캐싱 가능 |
| 반환 타입 | 자기 타입만 | 하위 타입·프로토콜 가능 |
| 실패 처리 | init? / throws | 옵셔널·Result 등 자유 |
| 단점 | 이름 구분 불가 | 서브클래싱 제약, 발견성 낮음 |

단점도 솔직하게 짚고 갈게요.

팩토리 메서드만 있고 public init이 없으면, 그 타입은 상속으로 확장하기 어려워요.

또 생성자는 자동완성에서 바로 뜨지만, `make`는 이름을 알아야 찾기 쉬워서 발견성이 조금 떨어집니다. 그래서 `make`, `create`, `from` 같은 관례적인 이름을 쓰는 걸 추천해요.

---

## 그래서 언제 쓰면 되나요?

제가 실무에서 나눠 쓰는 기준은 이래요.

1. 단순히 저장 프로퍼티만 채우면 될 때 → 그냥 `init`
2. 생성 방식이 여러 갈래라 이름으로 구분하고 싶을 때 → `make`
3. 조건에 따라 다른 타입을 돌려줘야 할 때 → `make`
4. 객체를 재사용하거나 캐싱하고 싶을 때 → `make`

<figure>
  <img src="/assets/images/posts/2f046b04-15c9-4d73-b0dd-0d5c474e974f/3.png" alt="저는 이 기준표 하나로 둘 중 뭘 쓸지 정합니다" loading="lazy">
  <figcaption>저는 이 기준표 하나로 둘 중 뭘 쓸지 정합니다</figcaption>
</figure>

정리하면, 생성이 "그냥 값 채우기"를 넘어 하나의 결정 과정이 될 때 팩토리 메서드가 빛을 발해요.

반대로 모든 생성을 make로 감싸면 오히려 코드가 장황해집니다. 필요할 때만 골라 쓰는 게 핵심이에요.

처음엔 낯설게 느껴지실 수 있는데, 한 번 의도가 잡히면 코드 읽는 맛이 달라집니다. 다음에 비슷한 상황을 만나면 make를 한번 시도해 보세요. 분명 도움이 되실 거예요 🙂

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 탄생 배경, 크리스 래트너는 왜 Objective-C를 버렸을까](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
- [Swift 모노스테이트 패턴(Monostate Pattern), 싱글톤의 대안이 될 수 있을까](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Swift 델리게이트(Delegate) vs 옵저버(Observer), 언제 뭘 써야 할까 비교 총정리](/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/)
<!-- /RELATED-POSTS -->
