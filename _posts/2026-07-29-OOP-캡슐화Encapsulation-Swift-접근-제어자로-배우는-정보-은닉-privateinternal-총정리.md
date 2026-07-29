---
title: "OOP 캡슐화(Encapsulation), Swift 접근 제어자로 배우는 정보 은닉 (private·internal 총정리)"
description: "OOP 공부하다 보면 캡슐화라는 말은 백번쯤 듣는데, 막상 \"그래서 코드로 어떻게 하는 건데?\" 물으면 말문이 막히는 순간이 있어요. 개념은 알겠는데 손이 안 나가는 거죠."
header:
  og_image: /assets/images/posts/e7ceee75-4206-43b3-82b8-3480f093c330/1.png
tags:
  - OOP
  - 캡슐화
  - Swift
  - 접근제어자
permalink: /OOP-캡슐화Encapsulation-Swift-접근-제어자로-배우는-정보-은닉-privateinternal-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-29
---

OOP 공부하다 보면 캡슐화라는 말은 백번쯤 듣는데, 막상 "그래서 코드로 어떻게 하는 건데?" 물으면 말문이 막히는 순간이 있어요. 개념은 알겠는데 손이 안 나가는 거죠.

결론부터 말씀드리면, 캡슐화는 "객체 내부 데이터를 밖에서 함부로 못 만지게 감추고, 정해진 통로로만 접근하게 하는 것"이고, Swift에서는 이걸 **접근 제어자(access modifier)**로 구현합니다.

오늘은 private, internal 같은 접근 제어자 5단계를 실제 코드로 하나씩 보면서, 정보 은닉이 왜 코드를 지켜주는지 같이 정리해볼게요.

<figure>
  <img src="/assets/images/posts/e7ceee75-4206-43b3-82b8-3480f093c330/1.png" alt="private부터 open까지, Swift 접근 제어자 5단계를 한 장에 정리했어요">
  <figcaption>private부터 open까지, Swift 접근 제어자 5단계를 한 장에 정리했어요</figcaption>
</figure>

## 캡슐화가 정확히 뭔가요?

캡슐화(Encapsulation)는 OOP 4대 특징 중 하나예요.

한 문장으로 줄이면 이렇습니다.

> 데이터와 그 데이터를 다루는 기능을 하나로 묶고, 내부는 감추고 필요한 부분만 밖으로 열어두는 것.

왜 감춰야 할까요?

은행 계좌를 떠올려보면 쉬워요. 통장 잔액을 아무나 직접 숫자로 바꿀 수 있으면 큰일이잖아요.

입금과 출금이라는 정해진 절차를 거쳐야 하고 그 안에서 "잔액보다 많이 못 뽑는다" 같은 규칙이 지켜져야 하죠.

이렇게 내부 값을 직접 못 건드리게 막고 검증된 통로만 여는 것을 **정보 은닉(Information Hiding)**이라고 부릅니다.

캡슐화가 큰 개념이라면, 정보 은닉은 그걸 실현하는 핵심 원칙이에요.

---

## Swift 접근 제어자 5단계 한눈에 비교

Swift는 접근 범위를 5단계로 나눕니다. 좁은 순서대로 정리해봤어요.

(2026년 기준 Swift 최신 문법 기준입니다.)

| 접근 제어자 | 접근 가능 범위 | 주로 쓰는 곳 |
|---|---|---|
| `private` | 선언한 그 중괄호 블록 안 | 진짜 감추고 싶은 내부 상태 |
| `fileprivate` | 같은 소스 파일 전체 | 한 파일 안 협력 타입끼리 |
| `internal` | 같은 모듈(앱/프레임워크) 전체 | 기본값, 대부분의 코드 |
| `public` | 다른 모듈에서도 사용 | 라이브러리 외부 공개 API |
| `open` | 다른 모듈에서 상속·재정의까지 | 프레임워크 확장 지점 |

여기서 꼭 기억할 점 하나.

아무것도 안 붙이면 `internal`이 기본값이에요.

그래서 평소에 접근 제어자를 안 적어도 같은 앱 안에서는 잘 돌아갔던 거죠.

`public`과 `open`의 차이도 헷갈리기 쉬운데, `open`만 다른 모듈에서 **상속과 오버라이드**가 됩니다. `public`은 쓸 수는 있어도 상속은 막혀요.

<figure>
  <img src="/assets/images/posts/e7ceee75-4206-43b3-82b8-3480f093c330/2.png" alt="private 하나 붙였을 뿐인데 코드가 훨씬 든든해집니다" loading="lazy">
  <figcaption>private 하나 붙였을 뿐인데 코드가 훨씬 든든해집니다</figcaption>
</figure>

---

## private로 진짜 정보 은닉 해보기

말로만 하면 안 와닿으니까 계좌 예제를 코드로 봅시다.

먼저 캡슐화가 안 된 나쁜 예부터요.

```swift
class BadAccount {
    var balance: Int = 0   // 밖에서 아무나 수정 가능
}

let acc = BadAccount()
acc.balance = -99999      // 말도 안 되는 값도 그냥 들어감
print(acc.balance)
// 출력: -99999
```

잔액이 마이너스 9만이라니, 규칙이 통째로 무너졌어요.

이제 `private`로 내부 상태를 감추고, 입출금 통로만 열어보겠습니다.

```swift
class Account {
    private var balance: Int = 0        // 외부 접근 차단

    func deposit(_ amount: Int) {
        guard amount > 0 else { return }
        balance += amount
    }

    func withdraw(_ amount: Int) -> Bool {
        guard amount > 0, balance >= amount else { return false }
        balance -= amount
        return true
    }

    var currentBalance: Int { balance }  // 읽기만 허용
}

let myAccount = Account()
myAccount.deposit(10000)
print(myAccount.withdraw(30000))  // 잔액 부족
// 출력: false
```

이제 `balance`를 밖에서 직접 건드릴 수 없어요.

`myAccount.balance = -99999` 같은 코드는 아예 컴파일 에러가 납니다.

돈이 오가는 건 오직 `deposit`과 `withdraw`를 통해서만 가능하고 그 안에 검증 규칙이 딱 박혀 있죠.

이게 정보 은닉의 힘이에요. 규칙을 어기는 코드를 애초에 못 쓰게 막아주는 거죠.

---

## private(set) — 읽기는 열고 쓰기만 막기

조금 더 실전으로 가볼게요.

"밖에서 값을 읽는 건 괜찮은데, 바꾸는 것만 막고 싶다"는 경우가 정말 많아요.

이럴 때 위에서처럼 계산 프로퍼티를 따로 만들 수도 있지만, Swift에는 더 깔끔한 방법이 있습니다.

```swift
class ScoreBoard {
    private(set) var score: Int = 0   // 읽기 public, 쓰기 private

    func addPoint() {
        score += 10
    }
}

let board = ScoreBoard()
board.addPoint()
print(board.score)   // 읽기는 자유
// 출력: 10
// board.score = 999  // 이 줄은 컴파일 에러
```

`private(set)`을 붙이면 읽기는 열려 있고 쓰기 권한만 내부로 좁혀집니다.

점수는 오직 `addPoint()`로만 오르게 되니, 게임 로직 밖에서 점수를 조작하는 사고를 막을 수 있어요.

저는 이 문법을 즐겨 씁니다. 굳이 계산 프로퍼티를 안 만들어도 되니까요.

<figure>
  <img src="/assets/images/posts/e7ceee75-4206-43b3-82b8-3480f093c330/3.png" alt="밖에서는 입출금 통로로만 접근, 잔액은 안쪽에 꽁꽁 감춰둡니다" loading="lazy">
  <figcaption>밖에서는 입출금 통로로만 접근, 잔액은 안쪽에 꽁꽁 감춰둡니다</figcaption>
</figure>

---

## 언제 어떤 제어자를 쓸까?

실무에서 헷갈릴 때 기준으로 삼으면 좋은 것들만 추려봤어요.

- **일단 `private`부터** 시작하세요. 필요할 때 범위를 넓히는 게, 열어놨다가 좁히는 것보다 안전해요.
- **기본값 `internal`**은 앱 하나 만들 땐 대부분 잘 맞습니다. 굳이 다 적을 필요 없어요.
- **`public`·`open`**은 남이 쓸 라이브러리나 프레임워크를 만들 때만 고민하면 됩니다.
- **상속까지 열어줄 때만 `open`.** 아니면 `public`으로 충분해요.

| 상황 | 판단 |
|---|---|
| 내부에서만 쓰는 상태 변수 | `private` |
| 밖에서 읽기만 시키고 싶다 | `private(set)` |
| 같은 앱 안에서 자유롭게 | `internal` (기본값) |
| 라이브러리로 외부 공개 | `public` |
| 외부에서 상속·재정의 허용 | `open` |

한 가지만 기억하세요. 접근 범위는 **최소한으로** 여는 게 항상 정답에 가깝습니다.

---

### 면접에서는 이렇게 물어봅니다

**Q. 캡슐화와 정보 은닉의 차이가 뭔가요?**

캡슐화는 데이터와 메서드를 하나의 객체로 묶는 설계 개념이고 정보 은닉은 그중 내부 구현을 외부로부터 감추는 원칙이에요. 캡슐화가 더 큰 그릇이고, 정보 은닉은 그 안에서 접근 제어자로 실현된다고 답하면 깔끔합니다.

**Q. Swift에서 public과 open의 차이는요?**

둘 다 다른 모듈에서 접근할 수 있지만 `open`만 외부 모듈에서 상속과 메서드 재정의가 허용됩니다. `public` 클래스는 외부에서 사용은 되지만 상속은 막혀 있어요. 프레임워크 확장 지점을 열어줄 때만 `open`을 쓴다고 덧붙이면 좋아요.

---

접근 제어자는 문법 몇 개라 외우면 끝처럼 보이지만 사실 "이 값을 누가 건드려도 되는가"를 설계하는 사고 훈련이에요.

오늘 본 계좌 예제 하나만 직접 타이핑해보셔도 감이 확 올 거예요. 작은 프로젝트에서 `private`부터 붙여보시길 추천드려요!
