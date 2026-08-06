---
title: "OOP 다형성(Polymorphism) 완벽 정리, 오버라이딩부터 프로토콜까지 한 번에"
description: "OOP 다형성, 오버라이딩부터 프로토콜까지 한 번에 이해하려다 머리가 복잡해진 적 있으시죠?"
header:
  og_image: /assets/images/posts/b7eed0e0-d083-42b4-88a2-4a5e767ecb2c/1.jpg
tags:
  - OOP
  - 다형성
  - 오버라이딩
  - 프로토콜
permalink: /OOP-다형성Polymorphism-완벽-정리-오버라이딩부터-프로토콜까지-한-번에/
toc: true
toc_sticky: true
last_modified_at: 2026-08-01
---

OOP 다형성, 오버라이딩부터 프로토콜까지 한 번에 이해하려다 머리가 복잡해진 적 있으시죠?

오버로딩, 오버라이딩, 프로토콜이 다 비슷해 보여서 헷갈리기 쉽죠.

결론부터 말씀드릴게요. 다형성은 "같은 이름의 호출이 대상에 따라 다르게 동작하는 것"입니다. 오버라이딩은 이걸 상속으로 구현하고, 프로토콜은 규약으로 구현하는 방식이죠.

이 글 하나로 세 개념이 어떻게 얽히는지 잡히도록, 차근차근 풀어드릴게요.

<figure>
  <img src="/assets/images/posts/b7eed0e0-d083-42b4-88a2-4a5e767ecb2c/1.jpg" alt="같은 소리내() 하나로 세 결과가 나오는 게 다형성이에요" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>같은 소리내() 하나로 세 결과가 나오는 게 다형성이에요</figcaption>
</figure>

## 다형성이 대체 뭔가요?

다형성(Polymorphism)은 그리스어로 "여러(poly) 형태(morph)"라는 뜻이에요.

쉽게 말해 같은 메시지를 보내도 받는 객체마다 다르게 반응하는 성질입니다.

예를 들어 볼게요. "소리 내"라고 똑같이 시켜도 강아지는 멍멍, 고양이는 야옹 하죠.

호출하는 쪽은 그냥 `소리내()`만 부르면 됩니다. 실제로 뭘 낼지는 각 객체가 알아서 정하고요.

> 다형성의 핵심은 "부르는 쪽은 몰라도 된다"는 것입니다.
>
> 무엇이 오든 같은 코드로 다룰 수 있으니까요.

이 성질 덕분에 코드가 훨씬 유연해집니다. 새로운 동물이 추가돼도 호출 코드는 손댈 필요가 없거든요.

---

## 오버로딩과 오버라이딩, 뭐가 다를까?

이름이 비슷해서 제일 많이 헷갈리는 지점이에요.

**오버로딩(Overloading)**은 같은 이름의 함수를 매개변수만 다르게 여러 개 만드는 겁니다.

**오버라이딩(Overriding)**은 부모가 만든 함수를 자식이 다시 정의해 덮어쓰는 거고요.

말로만 들으면 어려우니 코드로 보여드릴게요.

```swift
class Animal {
    func sound() { print("...") }
}

class Dog: Animal {
    override func sound() { print("멍멍") }  // 오버라이딩
}

let a: Animal = Dog()
a.sound()
// 출력: 멍멍
```

여기서 재밌는 건 `a`의 타입이 `Animal`인데도 `Dog`의 소리가 난다는 점이에요.

이게 바로 런타임에 실제 객체를 보고 결정하는 다형성입니다.

<figure>
  <img src="/assets/images/posts/b7eed0e0-d083-42b4-88a2-4a5e767ecb2c/2.png" alt="부모 하나에 자식이 각자 다르게 재정의하는 구조입니다" width="528" height="636" loading="lazy" decoding="async">
  <figcaption>부모 하나에 자식이 각자 다르게 재정의하는 구조입니다</figcaption>
</figure>

오버로딩은 조금 결이 달라요. 컴파일 시점에 어떤 함수를 부를지 정해집니다.

```swift
func add(_ a: Int, _ b: Int) -> Int { a + b }
func add(_ a: String, _ b: String) -> String { a + b }

print(add(1, 2))       // 출력: 3
print(add("가", "나"))  // 출력: 가나
```

그래서 오버로딩을 정적 다형성, 오버라이딩을 동적 다형성이라고 부르기도 해요.

---

## 프로토콜은 왜 필요한가요?

상속만으로도 다형성은 되는데, 왜 프로토콜이 등장할까요?

상속은 "is-a" 관계라 부모가 하나여야 하는 제약이 있어요. 고양이가 동물이면서 동시에 다른 계층에 속하긴 어렵죠.

프로토콜은 "이 규약만 지키면 뭐든 된다"는 방식이라 훨씬 자유롭습니다.

```swift
protocol Soundable {
    func sound()
}

struct Cat: Soundable {
    func sound() { print("야옹") }
}

struct Car: Soundable {
    func sound() { print("빵빵") }
}

let things: [Soundable] = [Cat(), Car()]
things.forEach { $0.sound() }
// 출력: 야옹
// 출력: 빵빵
```

고양이와 자동차는 아무 상속 관계가 없어요. 그런데도 같은 배열에 담아 똑같이 다룰 수 있죠.

상속이라는 족보 없이도 다형성을 얻는 것, 이게 프로토콜의 힘입니다.

Swift 같은 언어가 상속보다 프로토콜을 앞세우는 이유이기도 해요.

<figure>
  <img src="/assets/images/posts/b7eed0e0-d083-42b4-88a2-4a5e767ecb2c/3.jpg" alt="직접 쳐보면서 protocol이랑 override 감을 잡았어요" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>직접 쳐보면서 protocol이랑 override 감을 잡았어요</figcaption>
</figure>

---

## 언제 상속을 쓰고 언제 프로토콜을 쓸까

제가 실무에서 판단하는 기준을 표로 정리해봤어요.

| 상황 | 판단 |
|------|------|
| 공통 코드를 물려주고 싶다 | 상속(오버라이딩) |
| 관계는 없지만 같은 동작을 보장하고 싶다 | 프로토콜 |
| 여러 성격을 동시에 부여하고 싶다 | 프로토콜 (다중 채택 가능) |
| 값 타입(struct)에 다형성을 주고 싶다 | 프로토콜 |

간단한 원칙 몇 가지만 기억하셔도 됩니다.

- 부모의 구현을 재사용할 게 많으면 상속
- "할 수 있는 능력"을 정의하고 싶으면 프로토콜
- 확장성이 고민되면 일단 프로토콜을 우선 고려

---

### 면접에서는 이렇게 물어봅니다

**Q. 오버로딩과 오버라이딩의 차이를 설명해보세요.**

오버로딩은 같은 이름에 매개변수를 다르게 정의하는 것으로 컴파일 시점에 결정됩니다. 오버라이딩은 상속받은 메서드를 자식이 재정의하는 것으로 런타임에 실제 객체를 보고 결정됩니다. 그래서 전자를 정적, 후자를 동적 다형성이라 부릅니다.

**Q. 상속 대신 프로토콜을 쓰면 뭐가 좋나요?**

상속은 부모가 하나로 제한되고 값 타입엔 쓸 수 없지만, 프로토콜은 여러 개를 동시에 채택할 수 있고 struct에도 적용됩니다. 관계가 없는 타입끼리도 같은 규약으로 묶어 다룰 수 있어 확장에 유리합니다.

---

다형성은 처음엔 추상적이지만, "부르는 쪽은 몰라도 된다"는 한 문장만 붙잡으면 나머지가 술술 풀려요.

오늘 배운 오버라이딩과 프로토콜, 직접 코드로 한 번씩 쳐보시면 확실히 손에 붙을 거예요. 응원할게요!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [오버로딩(Overloading) vs 오버라이딩(Overriding), 이름만 닮은 두 개념 확실히 구분하기 (Swift 예제)](/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/)
<!-- /RELATED-POSTS -->
