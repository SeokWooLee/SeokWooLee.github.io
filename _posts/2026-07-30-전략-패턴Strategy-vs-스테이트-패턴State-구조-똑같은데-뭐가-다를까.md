---
title: "전략 패턴(Strategy) vs 스테이트 패턴(State), 구조 똑같은데 뭐가 다를까"
description: "디자인 패턴을 공부하다 보면 꼭 한 번은 벽에 부딪히는 지점이 있어요."
header:
  og_image: /assets/images/posts/9e51832d-c42e-412d-b5ff-bb9e9e4895ff/1.jpg
tags:
  - 전략패턴
  - 스테이트패턴
  - 디자인패턴
  - GoF
permalink: /전략-패턴Strategy-vs-스테이트-패턴State-구조-똑같은데-뭐가-다를까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-30
---

디자인 패턴을 공부하다 보면 꼭 한 번은 벽에 부딪히는 지점이 있어요.

바로 전략 패턴과 스테이트 패턴입니다.

UML(Unified Modeling Language, 통합 모델링 언어) 다이어그램을 나란히 놓고 보면 거의 복사-붙여넣기 수준으로 똑같거든요. 인터페이스 하나 두고, 그 구현체를 여러 개 만들고, 컨텍스트가 그걸 들고 있고요.

"이거 그냥 이름만 다른 거 아냐?" 싶으실 만도 합니다.

먼저 결론부터 말씀드릴게요. 두 패턴을 가르는 핵심은 구조가 아니라 의도입니다. 전략 패턴은 밖에서 알고리즘을 갈아 끼우는 것이고, 스테이트 패턴은 안에서 상태가 스스로 다음 상태로 넘어가는 것이에요.

이 한 줄만 붙잡고 아래 내용을 읽으시면 다시는 헷갈리지 않으실 거예요.

<figure>
  <img src="/assets/images/posts/9e51832d-c42e-412d-b5ff-bb9e9e4895ff/1.jpg" alt="전략 패턴 vs 스테이트 패턴, 딱 이 그림 하나로 끝납니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>전략 패턴 vs 스테이트 패턴, 딱 이 그림 하나로 끝납니다</figcaption>
</figure>

## 구조가 왜 이렇게 똑같을까요?

두 패턴 다 GoF(Gang of Four) 디자인 패턴 책에 나오는 행동 패턴입니다.

둘 다 똑같은 재료를 씁니다. 공통 인터페이스, 그걸 구현한 여러 클래스, 그리고 이들을 들고 있는 컨텍스트요.

그래서 코드만 딱 보면 정말 구분이 안 돼요.

전략 패턴을 코드로 보면 이렇습니다.

```swift
protocol PaymentStrategy {
    func pay(_ amount: Int)
}

struct CardPayment: PaymentStrategy {
    func pay(_ amount: Int) { print("카드로 \(amount)원 결제") }
}

struct KakaoPay: PaymentStrategy {
    func pay(_ amount: Int) { print("카카오페이로 \(amount)원 결제") }
}

final class Checkout {
    var strategy: PaymentStrategy
    init(strategy: PaymentStrategy) { self.strategy = strategy }
    func pay(_ amount: Int) { strategy.pay(amount) }
}

let checkout = Checkout(strategy: CardPayment())
checkout.pay(10000)
checkout.strategy = KakaoPay()  // 밖에서 갈아 끼움
checkout.pay(5000)
// 출력:
// 카드로 10000원 결제
// 카카오페이로 5000원 결제
```

여기서 눈여겨보실 부분은 strategy를 갈아 끼우는 주체입니다. 바로 바깥의 클라이언트 코드예요.

결제 수단을 카드에서 카카오페이로 바꾼 건 개발자, 즉 밖에 있는 누군가죠.

전략 자신은 다음에 뭐가 올지 전혀 몰라요. 관심도 없고요.

---

## 그럼 스테이트 패턴은 뭐가 다른가요?

스테이트 패턴은 상태 전환을 상태 스스로가 결정합니다.

신호등을 생각해 보세요. 빨간불은 다음이 초록불이라는 걸 알고, 초록불은 다음이 노란불이라는 걸 알아요.

즉, 다음 상태로 넘어가는 규칙이 각 상태 안에 들어 있습니다.

<figure>
  <img src="/assets/images/posts/9e51832d-c42e-412d-b5ff-bb9e9e4895ff/2.png" alt="상태가 스스로 다음으로 넘어가는 흐름, 이게 스테이트의 정체예요" width="308" height="696" loading="lazy" decoding="async">
  <figcaption>상태가 스스로 다음으로 넘어가는 흐름, 이게 스테이트의 정체예요</figcaption>
</figure>

```swift
protocol TrafficState {
    func next(_ light: TrafficLight)
}

final class Red: TrafficState {
    func next(_ light: TrafficLight) {
        print("빨강 → 초록")
        light.state = Green()  // 상태가 스스로 다음을 지정
    }
}

final class Green: TrafficState {
    func next(_ light: TrafficLight) {
        print("초록 → 노랑")
        light.state = Yellow()
    }
}

final class Yellow: TrafficState {
    func next(_ light: TrafficLight) {
        print("노랑 → 빨강")
        light.state = Red()
    }
}

final class TrafficLight {
    var state: TrafficState = Red()
    func change() { state.next(self) }
}

let light = TrafficLight()
light.change()
light.change()
light.change()
// 출력:
// 빨강 → 초록
// 초록 → 노랑
// 노랑 → 빨강
```

차이가 보이시나요?

전략 패턴에서는 밖에서 `checkout.strategy = KakaoPay()`처럼 직접 갈아 끼웠습니다.

스테이트 패턴에서는 `light.state = Green()`을 상태 클래스 자기 자신이 하고 있어요. 클라이언트는 그냥 change()만 부를 뿐이고요.

바로 이 지점이 핵심입니다.

> 전략은 밖에서 갈아 끼우고, 상태는 안에서 스스로 넘어갑니다.

---

## 세 가지로 정리하는 결정적 차이

말로만 하면 또 헷갈리니까 표로 정리해 볼게요.

| 구분 | 전략 패턴 | 스테이트 패턴 |
|---|---|---|
| 의도 | 알고리즘을 교체 | 상태에 따라 행동을 바꿈 |
| 전환 주체 | 바깥 클라이언트 | 상태 객체 자신 |
| 객체 간 관계 | 서로 모름 (독립) | 서로 알고 참조함 |
| 생애주기 | 보통 한 번 정하면 유지 | 실행 중 계속 바뀜 |

특히 두 번째, 세 번째 줄을 기억해 주세요.

전략들은 서로의 존재를 몰라요. 카드 결제가 카카오페이를 알 필요가 없죠.

반면 상태들은 서로를 알아야 합니다. 빨간불이 초록불 객체를 직접 만들어 넘겨주니까요.

이 "서로 아느냐 모르느냐"가 코드에서 두 패턴을 구분하는 가장 확실한 단서예요.

<figure>
  <img src="/assets/images/posts/9e51832d-c42e-412d-b5ff-bb9e9e4895ff/3.jpg" alt="두 코드 나란히 놓고 보면 '누가 바꾸나'가 눈에 들어와요" width="1200" height="1200" loading="lazy" decoding="async">
  <figcaption>두 코드 나란히 놓고 보면 '누가 바꾸나'가 눈에 들어와요</figcaption>
</figure>

---

## 언제 쓰고 언제 피해야 할까요?

제가 실무에서 판단하는 기준을 정리하면 이렇습니다.

| 상황 | 판단 |
|---|---|
| 같은 일을 하는 방법만 여러 개일 때 (정렬, 결제, 압축) | 전략 패턴 |
| 객체가 상황에 따라 다르게 행동하고 그 상황이 바뀔 때 | 스테이트 패턴 |
| 전환 규칙이 복잡한 if-else 뭉치일 때 | 스테이트 패턴으로 풀기 |
| 그냥 함수 하나 넘기면 될 만큼 단순할 때 | 둘 다 과함, 클로저로 |

주의할 점도 있어요.

상태가 2~3개뿐이고 전환도 단순하다면, 굳이 패턴을 끌어오지 말고 enum과 switch로 충분한 경우가 많습니다.

패턴은 복잡함을 다스리는 도구지, 단순한 코드에 격식을 입히는 장식이 아니거든요.

### 면접에서는 이렇게 물어봅니다

**Q. 전략 패턴과 스테이트 패턴은 구조가 같은데 어떻게 구분하나요?**

구조는 거의 같지만 의도가 다릅니다. 전략은 알고리즘을 외부에서 교체하려는 목적이고, 상태는 내부 상태에 따라 행동을 바꾸려는 목적이에요. 결정적으로 전환의 주체가 다른데, 전략은 클라이언트가, 상태는 상태 객체 자신이 다음으로 넘어갑니다.

**Q. 스테이트 패턴에서 상태끼리 서로를 참조하는데 문제가 되지 않나요?**

상태 간 결합이 생기는 건 맞습니다. 그래서 전환 로직을 상태 안에 두는 대신, 컨텍스트나 별도의 전이 테이블로 빼서 결합을 낮추기도 해요. 상태가 많아지고 전환이 얽히면 상태 머신 라이브러리를 쓰는 것도 방법입니다.

---

다이어그램이 똑같아 보여도 겁먹지 마세요. "전환을 누가 하느냐"만 물어보면 답이 바로 나옵니다.

밖에서 갈아 끼우면 전략, 안에서 스스로 넘어가면 상태. 이 한 문장만 챙겨 가셔도 오늘 글은 성공입니다. 다음에 또 헷갈리는 패턴으로 찾아올게요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [디자인 패턴 왜 필요할까, 그리고 왜 맹신하면 안 될까 (실무 기준 정리)](/%EB%94%94%EC%9E%90%EC%9D%B8-%ED%8C%A8%ED%84%B4-%EC%99%9C-%ED%95%84%EC%9A%94%ED%95%A0%EA%B9%8C-%EA%B7%B8%EB%A6%AC%EA%B3%A0-%EC%99%9C-%EB%A7%B9%EC%8B%A0%ED%95%98%EB%A9%B4-%EC%95%88-%EB%90%A0%EA%B9%8C-%EC%8B%A4%EB%AC%B4-%EA%B8%B0%EC%A4%80-%EC%A0%95%EB%A6%AC/)
- [Swift 전략 패턴(Strategy Pattern), 프로토콜·클로저로 알고리즘 갈아끼우기](/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/)
- [전략 vs 템플릿 메서드 vs 커맨드(Strategy·Template Method·Command), 알고리즘 교체 3형제 총정리](/%EC%A0%84%EB%9E%B5-vs-%ED%85%9C%ED%94%8C%EB%A6%BF-%EB%A9%94%EC%84%9C%EB%93%9C-vs-%EC%BB%A4%EB%A7%A8%EB%93%9CStrategyTemplate-MethodCommand-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B5%90%EC%B2%B4-3%ED%98%95%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
