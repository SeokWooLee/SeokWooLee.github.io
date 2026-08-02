---
title: "OOP 추상화(Abstraction)와 캡슐화(Encapsulation), 매번 헷갈렸다면 이 글로 끝내세요"
description: "객체지향(OOP)을 공부하다 보면 꼭 만나는 벽이 있습니다."
header:
  og_image: /assets/images/posts/1147e4b5-35a3-4f3a-8a2a-05758f3d1ee8/1.png
tags:
  - OOP
  - 객체지향
  - 추상화
  - 캡슐화
permalink: /OOP-추상화Abstraction와-캡슐화Encapsulation-매번-헷갈렸다면-이-글로-끝내세요/
toc: true
toc_sticky: true
last_modified_at: 2026-08-02
---

# 추상화와 캡슐화, 매번 헷갈리셨죠? 이 글로 정리해 드릴게요

객체지향(OOP)을 공부하다 보면 꼭 만나는 벽이 있습니다.

바로 추상화와 캡슐화입니다.

두 개념은 거의 같은 말처럼 들리기 쉽습니다. 면접에서 "추상화와 캡슐화의 차이가 뭔가요?"라는 질문을 받으면 얼버무리기 쉬운 주제죠.

결론부터 말씀드릴게요.

> 추상화는 "무엇을 보여줄까"를 정하는 설계 관점이고, 캡슐화는 "어떻게 숨길까"를 정하는 구현 관점입니다.

이 한 문장만 잡고 가도 절반은 끝났습니다. 나머지는 예시로 확실히 굳혀 볼게요.

<figure>
  <img src="/assets/images/posts/1147e4b5-35a3-4f3a-8a2a-05758f3d1ee8/1.png" alt="추상화와 캡슐화, 한 장으로 보면 헷갈릴 일이 없어요">
  <figcaption>추상화와 캡슐화, 한 장으로 보면 헷갈릴 일이 없어요</figcaption>
</figure>

## 추상화란 무엇일까요?

추상화(Abstraction)는 복잡한 내부를 감추고 꼭 필요한 본질만 뽑아내 보여주는 것입니다.

자동차를 생각해보세요. 우리는 운전할 때 엔진이 연료를 어떻게 폭발시키는지 몰라도 됩니다.

핸들, 페달, 기어. 이 인터페이스만 알면 운전이 가능하죠.

즉 운전자에게 무엇을 노출할지 고민하는 게 추상화입니다.

코드로 보면 이렇게 표현할 수 있어요.

```swift
protocol Coffee {
    func brew()
}

struct Americano: Coffee {
    func brew() {
        print("아메리카노를 내립니다")
    }
}

let menu: Coffee = Americano()
menu.brew()
// 출력: 아메리카노를 내립니다
```

사용하는 쪽은 `brew()`라는 본질만 압니다. 원두를 어떻게 갈고 물을 몇 도로 맞추는지는 관심 밖이죠.

이게 바로 추상화입니다.

---

## 캡슐화란 무엇일까요?

캡슐화(Encapsulation)는 데이터와 그 데이터를 다루는 기능을 하나로 묶고 외부의 직접 접근을 막는 것입니다.

핵심은 숨김과 보호입니다.

은행 계좌를 떠올려보세요. 잔액을 외부에서 마음대로 바꿀 수 있으면 큰일 나겠죠.

그래서 잔액은 숨기고 입금·출금 같은 정해진 통로로만 바꾸게 만듭니다.

```swift
class Account {
    private var balance = 0

    func deposit(_ amount: Int) {
        guard amount > 0 else { return }
        balance += amount
    }

    func getBalance() -> Int {
        return balance
    }
}

let acc = Account()
acc.deposit(1000)
print(acc.getBalance())
// 출력: 1000
```

`balance`를 `private`으로 막았습니다. 외부에서는 `deposit`이라는 정해진 문으로만 값을 바꿀 수 있어요.

이렇게 내부를 감추고 접근을 통제하는 것이 캡슐화입니다.

---

## 그래서 둘의 결정적 차이는?

정리하면 이렇습니다.

| 구분 | 추상화 | 캡슐화 |
| --- | --- | --- |
| 목적 | 복잡함을 숨겨 본질만 노출 | 데이터를 숨겨 보호 |
| 관점 | 설계 관점 (무엇을) | 구현 관점 (어떻게) |
| 질문 | "무엇을 보여줄까?" | "어떻게 숨길까?" |
| 수단 | 인터페이스, 추상클래스 | 접근제어자 (private 등) |

가장 헷갈리는 지점을 짚어드릴게요.

둘 다 숨긴다는 말이 나와서 헷갈리는 겁니다.

하지만 숨기는 대상이 다릅니다.

추상화는 복잡한 과정(로직)을 숨겨서 사용을 단순하게 만듭니다. 반대로 캡슐화는 데이터(상태)를 숨겨서 안전하게 보호하죠.

<figure>
  <img src="/assets/images/posts/1147e4b5-35a3-4f3a-8a2a-05758f3d1ee8/2.png" alt="커피 프로토콜과 계좌 클래스, 관계로 그려보니 딱 정리됩니다" loading="lazy">
  <figcaption>커피 프로토콜과 계좌 클래스, 관계로 그려보니 딱 정리됩니다</figcaption>
</figure>

---

## 언제 무엇을 신경 써야 할까요?

실무에서는 둘을 따로 쓰는 게 아니라 같이 씁니다. 다만 초점이 다를 뿐이에요.

- 새 기능의 인터페이스를 설계할 때 → 추상화에 집중
- 클래스 내부 상태의 무결성을 지켜야 할 때 → 캡슐화에 집중
- 협업 시 남에게 노출할 API를 고민할 때 → 추상화
- 버그 없이 값을 안전하게 관리할 때 → 캡슐화

<figure>
  <img src="/assets/images/posts/1147e4b5-35a3-4f3a-8a2a-05758f3d1ee8/3.png" alt="코드 짤 때 이 문장 하나만 붙여놔도 감이 달라져요" loading="lazy">
  <figcaption>코드 짤 때 이 문장 하나만 붙여놔도 감이 달라져요</figcaption>
</figure>

### 면접에서는 이렇게 물어봅니다

Q. 추상화와 캡슐화의 차이를 설명해보세요.

핵심은 관점의 차이입니다. 추상화는 불필요한 세부를 감추고 본질만 드러내는 설계 개념이고, 캡슐화는 데이터를 숨기고 접근을 제한하는 구현 개념이라고 답하면 됩니다. 추상화는 인터페이스로, 캡슐화는 접근제어자로 실현된다고 덧붙이면 좋습니다.

Q. 캡슐화가 왜 필요한가요?

객체의 상태를 외부가 직접 바꾸면 데이터 무결성이 깨지기 쉽습니다. 정해진 메서드로만 상태를 변경하게 하면 검증 로직을 한곳에 모을 수 있고 유지보수와 디버깅이 쉬워진다고 설명하면 됩니다.

---

두 개념은 반대가 아니라 짝꿍입니다. 오늘 예시로 감이 잡히셨다면, 다음 코드를 짤 때 "지금 나는 무엇을 보여주고, 무엇을 숨기고 있나?"를 한 번만 떠올려보세요. OOP가 훨씬 선명해질 거예요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [OOP 캡슐화(Encapsulation), Swift 접근 제어자로 배우는 정보 은닉 (private·internal 총정리)](/OOP-%EC%BA%A1%EC%8A%90%ED%99%94Encapsulation-Swift-%EC%A0%91%EA%B7%BC-%EC%A0%9C%EC%96%B4%EC%9E%90%EB%A1%9C-%EB%B0%B0%EC%9A%B0%EB%8A%94-%EC%A0%95%EB%B3%B4-%EC%9D%80%EB%8B%89-privateinternal-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [객체지향 프로그래밍(OOP)이란? 절차지향과 뭐가 다를까](/%EA%B0%9D%EC%B2%B4%EC%A7%80%ED%96%A5-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DOOP%EC%9D%B4%EB%9E%80-%EC%A0%88%EC%B0%A8%EC%A7%80%ED%96%A5%EA%B3%BC-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C/)
- [컴포지션(Composition) vs 상속(Inheritance), "상속 쓰지 말라"는 말의 진짜 의미](/%EC%BB%B4%ED%8F%AC%EC%A7%80%EC%85%98-vs-%EC%83%81%EC%86%8D-%EC%83%81%EC%86%8D-%EC%93%B0%EC%A7%80-%EB%A7%90%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8-%EC%B4%88%EB%B3%B4-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
