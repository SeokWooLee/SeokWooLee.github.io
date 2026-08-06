---
title: "팩토리 메서드(Factory Method) vs 추상 팩토리(Abstract Factory) 차이, 면접 단골 질문 한 번에 정리"
description: "디자인 패턴 공부하다 보면 꼭 한 번은 막히는 구간이 있어요."
header:
  og_image: /assets/images/posts/97abc5f6-5b4d-42f9-81d2-848ee5f5da72/1.jpg
tags:
  - 팩토리메서드
  - 추상팩토리
  - 디자인패턴
  - 생성패턴
permalink: /팩토리-메서드Factory-Method-vs-추상-팩토리Abstract-Factory-차이-면접-단골-질문-한-번에-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-02
---

디자인 패턴 공부하다 보면 꼭 한 번은 막히는 구간이 있어요.

바로 팩토리 메서드 vs 추상 팩토리입니다. 이름도 비슷하고 둘 다 "객체를 대신 만들어준다"는 점까지 똑같아서 헷갈리기 딱 좋거든요.

면접 단골 질문이기도 해서, 이번 글에 한 번에 정리해 뒀습니다.

핵심부터 짚고 갈게요. 팩토리 메서드는 객체 하나를 어떤 클래스로 만들지를 서브클래스에 맡기는 패턴이고, 추상 팩토리는 서로 관련된 객체 여러 개(제품군)를 통째로 만들어주는 패턴입니다.

한 개냐 한 세트냐, 이게 가장 큰 차이예요.

<figure>
  <img src="/assets/images/posts/97abc5f6-5b4d-42f9-81d2-848ee5f5da72/1.jpg" alt="결국 하나를 만드느냐 세트를 만드느냐, 여기서 갈립니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>결국 하나를 만드느냐 세트를 만드느냐, 여기서 갈립니다</figcaption>
</figure>

## 팩토리 메서드가 뭔가요?

팩토리 메서드는 객체를 생성하는 책임을 상위 클래스가 아니라 서브클래스에 넘기는 패턴이에요.

상위 클래스는 버튼을 만든다 정도만 정해두고, 어떤 버튼을 만들지는 자식이 결정합니다.

코드로 보면 훨씬 빨리 이해돼요.

```swift
protocol Button { func render() }

class Dialog {
    // 팩토리 메서드: 서브클래스가 무엇을 만들지 결정한다
    func createButton() -> Button { fatalError("서브클래스에서 구현") }

    func render() {
        let button = createButton()
        button.render()
    }
}

class IOSDialog: Dialog {
    override func createButton() -> Button { IOSButton() }
}
```

Dialog는 자기가 어떤 버튼을 쓰는지 몰라도 됩니다. 새 플랫폼이 생기면 서브클래스만 하나 더 만들면 끝이에요.

핵심은 상속이에요. 서브클래싱으로 생성 지점을 갈아끼우는 구조입니다.

---

## 추상 팩토리는 뭐가 다른가요?

추상 팩토리는 관련된 객체들을 한 세트로 묶어서 만들어주는 패턴이에요.

버튼 하나가 아니라 버튼, 체크박스, 스크롤바처럼 같이 다녀야 하는 객체들을 한꺼번에 책임집니다.

```swift
protocol GUIFactory {
    func createButton() -> Button
    func createCheckbox() -> Checkbox
}

class IOSFactory: GUIFactory {
    func createButton() -> Button { IOSButton() }
    func createCheckbox() -> Checkbox { IOSCheckbox() }
}

class MacFactory: GUIFactory {
    func createButton() -> Button { MacButton() }
    func createCheckbox() -> Checkbox { MacCheckbox() }
}
```

여기서 중요한 건 일관성이에요. iOS 팩토리를 쓰면 버튼도 체크박스도 전부 iOS 스타일로 나옵니다. iOS 버튼에 맥 체크박스가 섞이는 사고가 안 생겨요.

추상 팩토리는 보통 팩토리 객체를 밖에서 주입받아 씁니다. 상속이 아니라 합성으로 동작하는 거죠.

<figure>
  <img src="/assets/images/posts/97abc5f6-5b4d-42f9-81d2-848ee5f5da72/2.png" alt="iOS든 맥이든 팩토리만 갈아끼우면 세트가 통째로 바뀌어요" width="1200" height="945" loading="lazy" decoding="async">
  <figcaption>iOS든 맥이든 팩토리만 갈아끼우면 세트가 통째로 바뀌어요</figcaption>
</figure>

> 팩토리 메서드는 "무엇을 만들까"를 상속으로 풀고,
>
> 추상 팩토리는 "어떤 세트를 만들까"를 합성으로 풉니다.

---

## 한눈에 보는 차이 비교

말로 풀면 계속 헷갈리니까 표로 정리했어요.

| 구분 | 팩토리 메서드 | 추상 팩토리 |
| --- | --- | --- |
| 목적 | 객체 하나 생성 위임 | 관련 객체군 생성 |
| 기반 | 상속(서브클래싱) | 합성(구성) |
| 만드는 것 | 제품 1종류 | 여러 제품(제품군) |
| 확장 방법 | 새 서브클래스 추가 | 새 팩토리 추가 |
| 흔한 예 | createButton() | GUIFactory 전체 |

재밌는 점은 추상 팩토리 내부가 사실 팩토리 메서드로 채워지는 경우가 많다는 거예요. 둘은 경쟁 관계라기보다 규모가 다른 사이라고 보는 게 맞아요.

---

## 언제 쓰고 언제 피해야 할까

실무에서 판단 기준은 생각보다 단순해요.

- 만들 객체가 한 종류뿐이면 팩토리 메서드로 충분합니다. 굳이 팩토리 인터페이스까지 만들면 과설계예요.
- 함께 움직여야 하는 객체가 두 종류 이상이면 추상 팩토리를 고려하세요.
- 제품군이 앞으로도 안 늘어날 것 같으면 그냥 조건 분기가 나을 때도 많아요.

| 상황 | 판단 |
| --- | --- |
| 생성할 제품이 하나 | 팩토리 메서드 |
| 제품이 세트로 묶여 다님 | 추상 팩토리 |
| 제품군이 자주 늘어남 | 추상 팩토리 |
| 분기 2~3개로 끝남 | 패턴 없이 단순 분기 |

패턴은 목적이 아니라 도구예요. 안 늘어날 코드에 미리 추상화를 깔면 읽기만 어려워집니다.

<figure>
  <img src="/assets/images/posts/97abc5f6-5b4d-42f9-81d2-848ee5f5da72/3-1783845909824.jpg" alt="패턴은 도구일 뿐이라, 필요해질 때 꺼내 써도 늦지 않습니다" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>패턴은 도구일 뿐이라, 필요해질 때 꺼내 써도 늦지 않습니다</figcaption>
</figure>

### 면접에서는 이렇게 물어봅니다

Q. 팩토리 메서드와 추상 팩토리의 차이를 설명해 주세요.
A. 팩토리 메서드는 객체 하나의 생성을 서브클래스에 위임하는 상속 기반 패턴입니다. 추상 팩토리는 서로 관련된 객체군을 일관되게 생성하는 합성 기반 패턴이고요. 만드는 대상이 한 개냐 한 세트냐가 핵심 차이입니다.

Q. 추상 팩토리 안에서 팩토리 메서드가 쓰이나요?
A. 네, 자주 그렇습니다. 추상 팩토리의 각 생성 메서드가 내부적으로 팩토리 메서드 형태로 구현되는 경우가 많습니다. 둘은 대립 개념이 아니라 다루는 범위가 다른 패턴이라고 보시면 됩니다.

두 패턴, 이제 이름만 봐도 "아, 하나냐 세트냐" 하고 떠오르시면 성공이에요. 면접 전에 이 글 한 번만 다시 훑어보시면 든든할 겁니다.
