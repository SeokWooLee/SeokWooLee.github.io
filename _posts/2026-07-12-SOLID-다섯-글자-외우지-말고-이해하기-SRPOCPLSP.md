---
title: "SOLID 다섯 글자, 외우지 말고 이해하기 (SRP·OCP·LSP)"
description: "면접에서 \"SOLID 원칙 설명해보세요\"라는 질문, 다들 한 번쯤 받아보셨을 거예요."
header:
  og_image: /assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png
tags:
  - SOLID원칙
  - SRP
  - OCP
  - LSP
  - 객체지향
  - 단일책임원칙
  - 리스코프치환
  - 개발원칙
  - 클린코드
  - 프로그래밍
permalink: /SOLID-다섯-글자-외우지-말고-이해하기-SRPOCPLSP/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

면접에서 "SOLID 원칙 설명해보세요"라는 질문, 다들 한 번쯤 받아보셨을 거예요.

그런데 솔직히 말하면, 다섯 개를 줄줄 외워서 대답은 해도 "그래서 내 코드에 어떻게 쓰는 건데?"까지 이어지는 경우는 드물더라고요.

그래서 이번에는 SOLID를 교과서 정의가 아니라 실무 장면으로 풀어보려고 해요. 분량이 있어서 두 편으로 나눕니다. 오늘은 앞의 세 글자, SRP·OCP·LSP입니다.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="다섯 글자 중 오늘은 앞의 셋부터 갑니다">
  <figcaption>다섯 글자 중 오늘은 앞의 셋부터 갑니다</figcaption>
</figure>

SOLID는 로버트 마틴(엉클 밥)이 정리한 객체지향 설계 5원칙의 머리글자입니다.

- **S**RP — 단일 책임 원칙
- **O**CP — 개방-폐쇄 원칙
- **L**SP — 리스코프 치환 원칙
- **I**SP — 인터페이스 분리 원칙
- **D**IP — 의존성 역전 원칙

다섯 개가 각각 다른 얘기를 하는 것 같지만, 관통하는 메시지는 하나예요. 변경이 일어났을 때 고쳐야 할 코드의 범위를 줄이자는 겁니다.

---

## SRP — 단일 책임 원칙

교과서 정의는 "클래스는 단 하나의 책임만 가져야 한다"인데, 엉클 밥 본인이 나중에 더 좋은 표현으로 고쳐 말했어요.

> 모듈은 단 하나의 액터에 대해서만 책임져야 한다.

여기서 액터는 그 코드의 변경을 요구하는 사람(부서)이에요. 예를 들어 이런 클래스가 있다고 해볼게요.

```swift
class Employee {
    func calculatePay() { ... }   // 회계팀이 바꿔달라고 함
    func reportHours() { ... }    // 인사팀이 바꿔달라고 함
    func save() { ... }           // 개발팀(DBA)이 바꿔달라고 함
}
```

세 메서드의 주인이 전부 다릅니다. 회계팀 요구로 `calculatePay`를 고치다가 공용 로직을 건드리면, 인사팀 리포트가 조용히 틀어져요. 실제로 이런 사고가 나면 원인 찾기도 어렵습니다.

SRP는 이걸 "바꿔달라는 사람이 다르면 코드도 분리해라"로 정리해줍니다. 급여 계산, 근무 리포트, 저장을 각각 다른 클래스로 나누면 회계팀 요구가 인사팀 기능을 건드릴 일이 없어져요.

---

## OCP — 개방-폐쇄 원칙

정의는 "확장에는 열려 있고, 수정에는 닫혀 있어야 한다"입니다. 처음 들으면 선문답 같은데, 코드로 보면 명확해요.

```swift
// 결제 수단이 늘 때마다 이 함수를 수정해야 한다면
func pay(method: String, amount: Int) {
    if method == "card" { ... }
    else if method == "kakaopay" { ... }
    else if method == "naverpay" { ... }
    // 새 결제수단 = 새 else if = 기존 코드 수정
}
```

이 구조에서는 토스페이를 추가하려면 잘 돌아가던 함수를 열어서 수정해야 합니다. 수정할 때마다 기존 결제수단이 깨질 위험을 감수하는 거죠.

```swift
// 새 결제수단을 '추가'만 하면 되는 구조
let payments: [String: Payment] = [
    "card": CardPayment(),
    "kakaopay": KakaoPayment(),
    "naverpay": NaverPayment(),
    // 토스페이 추가 = 새 클래스 등록 한 줄
]

func pay(method: String, amount: Int) {
    payments[method]?.process(amount: amount)
}
```

기존 코드는 안 건드리고(수정에 닫힘), 새 클래스를 추가하는 것만으로 기능이 늘어납니다(확장에 열림). 자주 바뀌는 지점에만 이 구조를 깔아두는 게 요령이에요. 모든 코드에 깔면 지난 편에서 말한 YAGNI 위반이 됩니다.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="토스페이 추가는 클래스 하나 얹는 걸로 끝">
  <figcaption>토스페이 추가는 클래스 하나 얹는 걸로 끝</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="수정 대신 추가로 대응하는 게 OCP예요">
  <figcaption>수정 대신 추가로 대응하는 게 OCP예요</figcaption>
</figure>

---

## LSP — 리스코프 치환 원칙

이름이 제일 무섭게 생겼지만, 뜻은 간단합니다.

> 자식 클래스는 부모 클래스가 쓰이는 자리에 그대로 들어가도 프로그램이 깨지지 않아야 한다.

유명한 반례가 직사각형-정사각형 문제예요. "정사각형은 직사각형이다"라는 수학 상식대로 상속을 시키면 이런 일이 벌어집니다.

```swift
class Rectangle {
    var width = 0
    var height = 0
    func setWidth(_ w: Int) { width = w }
    func setHeight(_ h: Int) { height = h }
}

class Square: Rectangle {
    override func setWidth(_ w: Int) { width = w; height = w }  // 정사각형이니까
    override func setHeight(_ h: Int) { width = h; height = h }
}

// 직사각형을 기대하는 코드
func test(_ rect: Rectangle) {
    rect.setWidth(5)
    rect.setHeight(4)
    print(rect.width * rect.height) // 20을 기대하지만 Square면 16
}
```

Square를 넣는 순간 "너비 5, 높이 4면 넓이 20"이라는 당연한 기대가 깨집니다. is-a 관계가 성립해 보여도, 행동의 약속이 깨지면 상속하면 안 된다는 게 LSP예요.

실무 신호는 이겁니다. 자식 클래스에서 부모 메서드를 오버라이드해서 예외를 던지거나 빈 구현으로 두고 있다면, 그 상속은 LSP 위반일 가능성이 높습니다.

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="정사각형은 직사각형 자리에 못 들어가더라고요">
  <figcaption>정사각형은 직사각형 자리에 못 들어가더라고요</figcaption>
</figure>

---

## 상편을 닫으며

오늘 다룬 세 원칙, 한 줄씩만 남겨볼게요.

- **SRP** — 바꿔달라는 사람이 다르면 코드도 분리해라.
- **OCP** — 자주 바뀌는 지점은 수정 대신 추가로 대응할 수 있게 만들어라.
- **LSP** — 자식은 부모의 약속을 깨지 마라. 깨야 한다면 상속이 잘못된 거다.

다음 편에서 나머지 두 글자, ISP(인터페이스 분리)와 DIP(의존성 역전)를 다룰게요. 특히 DIP는 요즘 프레임워크들이 왜 다 의존성 주입을 쓰는지와 바로 연결되는 얘기라 재미있을 겁니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [KISS 원칙, 코드를 단순하게 짜라는 말의 진짜 의미](/KISS-%EC%9B%90%EC%B9%99/)
- [디미터의 법칙, 메서드 체이닝이 나쁜 코드가 되는 순간 (기준·예시)](/%EB%94%94%EB%AF%B8%ED%84%B0%EC%9D%98-%EB%B2%95%EC%B9%99-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%B2%B4%EC%9D%B4%EB%8B%9D%EC%9D%B4-%EB%82%98%EC%81%9C-%EC%BD%94%EB%93%9C%EA%B0%80-%EB%90%98%EB%8A%94-%EC%88%9C%EA%B0%84-%EA%B8%B0%EC%A4%80%EC%98%88%EC%8B%9C/)
- [SOLID 원칙 실무편 (하) ISP·DIP, 의존성 주입이 존재하는 이유](/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
