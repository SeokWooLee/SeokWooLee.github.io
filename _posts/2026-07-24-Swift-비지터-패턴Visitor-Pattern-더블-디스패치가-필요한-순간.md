---
title: "Swift 비지터 패턴(Visitor Pattern), 더블 디스패치가 필요한 순간"
description: "iOS 개발하다 보면 도형이든 노드든, 종류가 여러 개인 객체에 연산을 계속 얹어야 하는 순간이 옵니다."
header:
  og_image: /assets/images/posts/71bc7c5b-09b5-42c0-ae36-619c1c3db22e/1.png
tags:
  - Swift
  - 비지터패턴
  - 디자인패턴
  - 더블디스패치
permalink: /Swift-비지터-패턴Visitor-Pattern-더블-디스패치가-필요한-순간/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

iOS 개발하다 보면 도형이든 노드든, 종류가 여러 개인 객체에 연산을 계속 얹어야 하는 순간이 옵니다.

흔히 `if let`, `as?`로 타입을 하나씩 까보는 코드를 짜게 되는데, 이런 코드는 종류가 늘 때마다 그 분기문을 또 열어야 합니다.

이 글은 바로 그럴 때 등장하는 **Swift 비지터 패턴**, 그리고 그 핵심인 더블 디스패치가 정확히 언제 필요한지 예제로 정리한 글입니다.

> Swift는 메서드를 고를 때 리시버(메시지를 받는 객체)의 동적 타입 하나만 봅니다.
>
> "어떤 도형인가"와 "어떤 연산인가", 두 축이 동시에 바뀌어야 할 때 이 단일 디스패치만으론 부족합니다. 이때 두 번의 호출로 두 타입을 모두 런타임에 결정하는 게 더블 디스패치예요.

<figure>
  <img src="/assets/images/posts/71bc7c5b-09b5-42c0-ae36-619c1c3db22e/1.png" alt="Swift 비지터 패턴, 결국 이 두 번의 호출 이야기입니다">
  <figcaption>Swift 비지터 패턴, 결국 이 두 번의 호출 이야기입니다</figcaption>
</figure>

---

## Swift의 메서드 디스패치, 왜 하나로는 부족할까?

Swift에서 `shape.draw()`를 부르면, `shape`의 실제 타입에 맞는 `draw()`가 실행됩니다.

여기까지는 단일 디스패치예요. 리시버 타입 **하나**로 메서드를 고르는 거죠.

문제는 연산이 여러 개일 때 생깁니다.

도형은 원·사각형·삼각형, 연산은 그리기·넓이계산·JSON내보내기. 이렇게 두 축이 곱해지면 조합이 확 늘어납니다.

그래서 흔히 이런 코드를 쓰게 돼요.

```swift
// 도형마다 연산이 늘 때 if-else가 계속 자라납니다
func export(_ shape: Shape) -> String {
    if let c = shape as? Circle { return drawCircle(c) }
    if let r = shape as? Rect   { return drawRect(r) }
    return "" // 새 도형이 생길 때마다 여기를 또 고쳐야 해요
}
```

새 도형이 하나 추가되면요? 이 함수를 열어서 분기를 또 끼워 넣어야 합니다.

연산이 다섯 개면 이런 함수가 다섯 군데 있는 셈이고요.

<figure>
  <img src="/assets/images/posts/71bc7c5b-09b5-42c0-ae36-619c1c3db22e/2.png" alt="if-else가 이만큼 쌓이면 저는 신호로 봐요" loading="lazy">
  <figcaption>if-else가 이만큼 쌓이면 저는 신호로 봐요</figcaption>
</figure>

---

## 더블 디스패치가 필요한 순간은 언제일까?

제가 세운 기준은 단순합니다.

**메서드가 실행될 동작이 두 개의 타입에 동시에 의존할 때**, 그때가 더블 디스패치가 필요한 순간이에요.

앞의 예시가 딱 그렇습니다. 실행할 코드가 "도형 타입 × 연산 타입" 둘 다에 따라 달라지잖아요.

Swift의 기본 디스패치는 리시버 타입 하나만 보기 때문에, 나머지 한 축은 결국 `as?` 같은 타입 검사로 손수 처리하게 됩니다.

이 수동 분기가 바로 냄새(code smell)예요.

더블 디스패치는 이 두 번째 타입 결정마저 언어의 오버로딩에 맡깁니다. 개발자가 직접 타입을 까보지 않게 되는 거죠.

반대로 연산이 딱 하나거나, 타입이 앞으로 늘 일이 없다면 굳이 이 패턴을 꺼낼 필요는 없습니다.

---

## Swift 비지터 패턴, 어떻게 구현하나요?

핵심은 호출을 두 번 나누는 겁니다. 그래서 이름도 더블 디스패치예요.

```swift
protocol Shape { func accept(_ v: Visitor) -> String }
struct Circle: Shape { func accept(_ v: Visitor) -> String { v.visit(self) } }
struct Rect: Shape   { func accept(_ v: Visitor) -> String { v.visit(self) } }

protocol Visitor {
    func visit(_ c: Circle) -> String   // 여기서 도형 타입이 결정됩니다
    func visit(_ r: Rect) -> String      // 오버로딩으로 연산이 결정되고요
}
```

흐름을 따라가 볼게요.

첫 번째 호출 `shape.accept(v)`에서 **도형의 실제 타입**이 정해집니다. `Circle`의 `accept`가 불리는지, `Rect`의 것이 불리는지 런타임이 골라주죠.

두 번째 호출 `v.visit(self)`에서 `self`의 정적 타입이 이미 `Circle`이나 `Rect`로 확정돼 있어요. 그래서 오버로딩된 `visit`이 올바르게 선택됩니다.

이 두 번의 호출이 겹치면서 두 타입이 모두 정확히 결정되는 겁니다.

<figure>
  <img src="/assets/images/posts/71bc7c5b-09b5-42c0-ae36-619c1c3db22e/4-1783847853866.png" alt="두 번의 호출이 겹치는 지점, 더블 디스패치" loading="lazy">
  <figcaption>두 번의 호출이 겹치는 지점, 더블 디스패치</figcaption>
</figure>

새 연산을 추가하고 싶으면요? `Visitor`를 채택한 구조체를 하나 새로 만들면 끝입니다. 기존 도형 코드는 한 줄도 안 건드려요.

---

## 비지터 패턴, 쓸까 말까? 장단점 비교

좋기만 한 패턴은 없죠. 트레이드오프를 짚고 가겠습니다.

| 구분 | 타입 분기(as? / switch) | 비지터 패턴 |
|------|------------------------|-------------|
| 새 연산 추가 | 곳곳의 분기문 수정 | 새 Visitor 하나 추가 |
| 새 타입 추가 | 분기 한 줄 추가 | 모든 Visitor 수정 필요 |
| 코드 가독성 | 분기 늘면 복잡 | 연산별로 깔끔히 분리 |
| 초기 작성 비용 | 낮음 | 상대적으로 높음 |

표에서 보이듯 비지터 패턴은 **연산이 자주 늘고 타입은 안정적일 때** 가장 빛납니다.

반대로 타입(도형)이 계속 추가되는 구조라면 오히려 손이 더 갑니다. 모든 Visitor를 다 고쳐야 하니까요.

<figure>
  <img src="/assets/images/posts/71bc7c5b-09b5-42c0-ae36-619c1c3db22e/3.png" alt="accept 하고 visit 하고, 딱 두 번이면 끝납니다" loading="lazy">
  <figcaption>accept 하고 visit 하고, 딱 두 번이면 끝납니다</figcaption>
</figure>

---

## 자주 묻는 질문 (Q&A)

**Q. Swift에는 제네릭이 있는데 그래도 비지터가 필요한가요?**

제네릭은 컴파일 타임에 타입이 정해질 때 강력해요. 하지만 `[Shape]` 배열처럼 런타임에 실제 타입이 섞여 있을 때는 여전히 더블 디스패치가 제 역할을 합니다.

**Q. enum과 switch로도 되지 않나요?**

됩니다. 타입이 고정적이라면 enum + switch가 오히려 간결해요. 비지터는 연산이 계속 늘어나는 상황에 더 어울립니다.

---

두 타입에 동시에 의존하는 동작을 만날 때가 바로 더블 디스패치, 그리고 Swift 비지터 패턴을 떠올릴 순간입니다.

지금 `as?` 분기가 자꾸 늘어나는 코드가 있다면, 오늘 예제를 참고해 한 번 리팩터링해 보세요. 훨씬 손볼 맛 나는 구조가 될 거예요 🙂

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 템플릿 메서드 패턴(Template Method), 프로토콜 extension으로 뼈대 잡기](/Swift-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4Template-Method-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-extension%EC%9C%BC%EB%A1%9C-%EB%BC%88%EB%8C%80-%EC%9E%A1%EA%B8%B0/)
- [Swift 미디에이터 패턴(Mediator Pattern) 완벽 정리 (객체 간 통신 중재자에게 맡기기)](/Swift-%EB%AF%B8%EB%94%94%EC%97%90%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4Mediator-Pattern-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EA%B0%9D%EC%B2%B4-%EA%B0%84-%ED%86%B5%EC%8B%A0-%EC%A4%91%EC%9E%AC%EC%9E%90%EC%97%90%EA%B2%8C-%EB%A7%A1%EA%B8%B0%EA%B8%B0/)
- [Swift 메멘토 패턴(Memento Pattern) 완벽 정리 (실행취소 구현 예제)](/Swift-%EB%A9%94%EB%A9%98%ED%86%A0-%ED%8C%A8%ED%84%B4Memento-Pattern-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EC%8B%A4%ED%96%89%EC%B7%A8%EC%86%8C-%EA%B5%AC%ED%98%84-%EC%98%88%EC%A0%9C/)
<!-- /RELATED-POSTS -->
