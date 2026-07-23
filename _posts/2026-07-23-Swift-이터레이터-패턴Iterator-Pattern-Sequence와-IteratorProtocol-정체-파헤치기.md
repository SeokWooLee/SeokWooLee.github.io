---
title: "Swift 이터레이터 패턴(Iterator Pattern), Sequence와 IteratorProtocol 정체 파헤치기"
description: "Swift로 앱을 만들다 보면 for item in array 같은 반복문을 하루에도 수십 번 씁니다. 워낙 자연스럽게 쓰다 보니, 커스텀 타입을 for-in으로 돌리려다 컴파일 에러를 만나고 나서야 궁금해지곤 하죠. \"이 반복문, 대체 안에서 무슨 일이 벌어지는 거지?\""
header:
  og_image: /assets/images/posts/c0379f37-683f-44c9-8731-ac1841d866e1/1.png
tags:
  - Swift
  - iOS개발
  - 이터레이터패턴
  - Sequence
permalink: /Swift-이터레이터-패턴Iterator-Pattern-Sequence와-IteratorProtocol-정체-파헤치기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-23
---

Swift로 앱을 만들다 보면 `for item in array` 같은 반복문을 하루에도 수십 번 씁니다. 워낙 자연스럽게 쓰다 보니, 커스텀 타입을 for-in으로 돌리려다 컴파일 에러를 만나고 나서야 궁금해지곤 하죠. "이 반복문, 대체 안에서 무슨 일이 벌어지는 거지?"

결론부터 말씀드리면, Swift의 for-in 반복은 `Sequence`와 `IteratorProtocol`이라는 두 프로토콜의 합작품입니다. Sequence는 "나는 반복 가능해"라고 선언하는 쪽이고, IteratorProtocol은 "다음 값 하나를 꺼내줄게"라며 실제로 값을 뽑아내는 쪽이에요.

이 글에서는 두 프로토콜의 역할이 어떻게 나뉘는지, for-in이 내부에서 어떻게 풀리는지, 직접 커스텀 시퀀스를 만드는 방법까지 정리해 보겠습니다. 이터레이터 패턴이 어렵게 느껴졌던 분이라면 끝까지 읽어보세요.

<figure>
  <img src="/assets/images/posts/c0379f37-683f-44c9-8731-ac1841d866e1/1.png" alt="Swift 이터레이터 패턴, 딱 이 그림 하나로 역할이 갈립니다">
  <figcaption>Swift 이터레이터 패턴, 딱 이 그림 하나로 역할이 갈립니다</figcaption>
</figure>

## Sequence와 IteratorProtocol, 뭐가 다른가요?

가장 헷갈리는 지점부터 짚고 갈게요. 둘 다 반복이랑 관련 있는데 역할이 분명히 다릅니다.

IteratorProtocol은 딱 하나의 요구사항만 있어요. `mutating func next() -> Element?`입니다. 호출할 때마다 다음 요소를 하나씩 돌려주고, 더 이상 줄 게 없으면 nil을 반환합니다.

즉 이터레이터는 "상태를 들고 다니는 커서"예요. 지금 어디까지 읽었는지 기억하고 있다가 next()가 불릴 때마다 한 칸씩 전진합니다.

Sequence는 조금 더 높은 층위입니다. `makeIterator()` 메서드로 이터레이터를 만들어 넘겨주는 역할이에요. "나를 반복하고 싶으면 이 이터레이터를 써"라고 알려주는 셈입니다.

정리하면 이렇습니다.

- IteratorProtocol: 값을 하나씩 꺼내는 커서. next()가 핵심.
- Sequence: 그 커서를 만들어주는 공장. makeIterator()가 핵심.

배열, 딕셔너리, Set, 문자열, Range... Swift 표준 라이브러리의 반복 가능한 타입은 전부 Sequence를 따릅니다.

---

## for-in은 내부에서 어떻게 풀릴까?

여기가 이 글의 핵심입니다. 우리가 무심코 쓰는 for-in은 사실 문법 설탕(syntactic sugar)이에요.

아래 코드는 우리가 평소 쓰는 반복문입니다.

```swift
for number in [1, 2, 3] {
    print(number)
}
```

컴파일러는 이 코드를 대략 아래 형태로 바꿔서 처리합니다. makeIterator()로 이터레이터를 만들고, next()가 nil을 줄 때까지 while 루프를 도는 거죠.

```swift
var iterator = [1, 2, 3].makeIterator()
while let number = iterator.next() {
    print(number)  // 1, 2, 3 순서로 출력
}
```

> for-in은 마법이 아닙니다. 결국 makeIterator()와 next() 두 개의 조합일 뿐이에요.

<figure>
  <img src="/assets/images/posts/c0379f37-683f-44c9-8731-ac1841d866e1/4-1783847806116.png" alt="결국 이 두 호출이 전부였네요" loading="lazy">
  <figcaption>결국 이 두 호출이 전부였네요</figcaption>
</figure>

이 구조를 알고 나면 왜 Sequence만 채택한 타입이 for-in에 바로 들어가는지 자연스럽게 이해됩니다. for-in에 필요한 건 makeIterator() 하나뿐이거든요.

---

## 커스텀 시퀀스는 어떻게 만드나요?

직접 만들어보면 확실히 감이 옵니다. 피보나치 수열을 무한히 만들어내는 시퀀스를 예로 들어볼게요.

작은 타입 하나에서 Sequence와 IteratorProtocol을 동시에 채택하는 게 가장 간단합니다. 이렇게 하면 makeIterator()의 기본 구현이 자기 자신을 복사해서 돌려줍니다.

```swift
struct Fibonacci: Sequence, IteratorProtocol {
    var current = 0
    var nextValue = 1
    mutating func next() -> Int? {
        defer { (current, nextValue) = (nextValue, current + nextValue) }
        return current
    }
}
```

next()가 하는 일은 단순합니다. 지금 값을 돌려주기 직전에 defer로 다음 상태를 미리 계산해 두는 거예요.

이제 이 타입은 for-in에 그대로 들어갑니다. 무한 수열이니 반복 횟수는 직접 제한해야겠죠.

```swift
for n in Fibonacci().prefix(8) {
    print(n)  // 0 1 1 2 3 5 8 13
}
```

<figure>
  <img src="/assets/images/posts/c0379f37-683f-44c9-8731-ac1841d866e1/2.png" alt="직접 Fibonacci 타입 짜서 for-in에 넣어봤어요" loading="lazy">
  <figcaption>직접 Fibonacci 타입 짜서 for-in에 넣어봤어요</figcaption>
</figure>

prefix, map, filter 같은 메서드를 공짜로 쓸 수 있다는 점도 중요합니다. Sequence를 채택하는 순간 이런 표준 연산이 프로토콜 익스텐션으로 딸려 오거든요. 직접 구현할 필요가 없어요.

---

## 자주 나오는 궁금증 Q&A

Q. Sequence만 채택하면 되나요, IteratorProtocol도 꼭 필요한가요?
A. for-in을 돌리려면 결국 이터레이터가 있어야 합니다. 다만 위 예시처럼 한 타입이 둘 다 채택하면 makeIterator()를 따로 안 짜도 됩니다. 반복 상태와 컬렉션을 분리하고 싶으면 이터레이터를 별도 struct로 빼면 됩니다.

Q. 한 번 for-in을 돌린 시퀀스를 또 돌리면 어떻게 되나요?
A. 배열 같은 값 타입은 매번 새 이터레이터를 만들어서 여러 번 안전하게 돌릴 수 있습니다. 반면 네트워크 스트림처럼 소비되면 사라지는 시퀀스는 한 번만 돌 수 있으니 주의해야 합니다.

Q. Collection이랑은 뭐가 다른가요?
A. Collection은 Sequence를 상속한 상위 개념입니다. 인덱스로 여러 번 접근하고, count를 세고, 순서를 보장하는 등 더 많은 걸 요구합니다. 단순히 값을 한 방향으로 훑기만 하면 Sequence로 충분합니다.

<figure>
  <img src="/assets/images/posts/c0379f37-683f-44c9-8731-ac1841d866e1/3.png" alt="Sequence, Iterator, Collection 관계를 그려두니 한눈에 정리되더라고요" loading="lazy">
  <figcaption>Sequence, Iterator, Collection 관계를 그려두니 한눈에 정리되더라고요</figcaption>
</figure>

---

for-in 한 줄 뒤에 Sequence와 IteratorProtocol이라는 깔끔한 역할 분담이 숨어 있었던 셈입니다. 커서 역할의 이터레이터, 공장 역할의 시퀀스. 이 둘을 구분하는 순간 커스텀 반복 타입 만들기가 훨씬 편해집니다.

다음에 for-in을 쓸 때 "지금 next()가 불리고 있구나" 하고 한 번쯤 떠올려 보세요. 피보나치 시퀀스부터 직접 만들어 보길 권합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 책임 연쇄 패턴(Chain of Responsibility), UIResponder 체인 동작 원리 완전 정리](/Swift-%EC%B1%85%EC%9E%84-%EC%97%B0%EC%87%84-%ED%8C%A8%ED%84%B4Chain-of-Responsibility-UIResponder-%EC%B2%B4%EC%9D%B8-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Swift 플라이웨이트 패턴(Flyweight Pattern), 객체 공유로 메모리 아끼는 법](/Swift-%ED%94%8C%EB%9D%BC%EC%9D%B4%EC%9B%A8%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EA%B0%9D%EC%B2%B4-%EA%B3%B5%EC%9C%A0%EB%A1%9C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%95%84%EB%81%BC%EB%8A%94-%EB%B2%95/)
- [Swift 스테이트 패턴(State Pattern)으로 if문 지옥 탈출하기](/Swift-%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-if%EB%AC%B8-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%83%81%ED%83%9C-%EA%B0%9D%EC%B2%B4-%EC%A0%95%EB%A6%AC%EB%B2%95/)
<!-- /RELATED-POSTS -->
