---
title: "SOLID 원칙 실무편 (하) ISP·DIP, 의존성 주입이 존재하는 이유"
description: "지난 편에서 SOLID의 앞 세 글자, SRP·OCP·LSP를 다뤘는데요. 오늘은 나머지 두 글자를 마저 정리합니다."
header:
  og_image: /assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png
tags:
  - SOLID원칙
  - ISP
  - DIP
  - 의존성주입
  - 의존성역전
  - 인터페이스분리
  - 객체지향
  - 스프링
  - NestJS
  - 클린코드
permalink: /SOLID-원칙-실무편-하-ISPDIP-의존성-주입이-존재하는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 **한국어** · [English](/en/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

지난 편에서 SOLID의 앞 세 글자, SRP·OCP·LSP를 다뤘는데요. 오늘은 나머지 두 글자를 마저 정리합니다.

ISP(인터페이스 분리 원칙)와 DIP(의존성 역전 원칙)예요.

특히 DIP는 Swinject든 Factory든 Swift에서 DI 라이브러리를 쓰다 보면 반드시 마주치는 '의존성 주입(DI)'의 이론적 뿌리입니다. 이번 편을 읽고 나면 그 라이브러리들이 왜 그렇게 생겼는지 보이실 거예요.

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png" alt="이번엔 뒤의 두 글자, ISP와 DIP 차례입니다">
  <figcaption>이번엔 뒤의 두 글자, ISP와 DIP 차례입니다</figcaption>
</figure>

---

## ISP: 인터페이스 분리 원칙

정의부터 볼게요.

> 클라이언트는 자신이 사용하지 않는 메서드에 의존하도록 강요받아서는 안 된다.

말이 어려운데, 사고 현장을 보면 바로 이해됩니다. 복합기 프로토콜을 하나 만들었다고 해볼게요.

```swift
protocol Machine {
    func print(_ doc: Document)
    func scan(_ doc: Document)
    func fax(_ doc: Document)
}

// 구형 프린터는 인쇄만 되는데...
class OldPrinter: Machine {
    func print(_ doc: Document) { /* 정상 동작 */ }
    func scan(_ doc: Document) { fatalError("스캔 안 됨") }  // 억지 구현
    func fax(_ doc: Document) { fatalError("팩스 안 됨") }   // 억지 구현
}
```

인쇄만 하는 프린터한테 스캔과 팩스까지 구현하라고 강요하는 상황이에요. 결국 예외를 던지는 가짜 메서드가 생기는데, 이거 지난 편에서 본 LSP 위반이기도 합니다. 뚱뚱한 인터페이스는 이렇게 원칙 두 개를 연쇄로 깨뜨려요.

처방은 간단합니다. 인터페이스를 역할 단위로 쪼개는 거예요.

```swift
protocol Printer { func print(_ doc: Document) }
protocol Scanner { func scan(_ doc: Document) }
protocol Fax { func fax(_ doc: Document) }

class OldPrinter: Printer { ... }                      // 인쇄만
class MultiFunction: Printer, Scanner, Fax { ... }     // 다 되는 복합기
```

각자 할 수 있는 것만 약속합니다. 실전에서는 이런 낌새로 나타납니다. 프로토콜을 채택하는데 "이 메서드는 우리랑 상관없는데..." 싶은 빈 구현이 생긴다면, 그 프로토콜은 쪼갤 때가 된 겁니다.

---

## DIP: 의존성 역전 원칙

이름 때문에 오해가 많은 원칙입니다. 정의는 두 줄이에요.

> 상위 모듈은 하위 모듈에 의존해서는 안 된다. 둘 다 추상화에 의존해야 한다.

> 추상화는 세부사항에 의존해서는 안 된다. 세부사항이 추상화에 의존해야 한다.

코드로 볼게요. 주문 서비스가 이메일 발송 라이브러리를 직접 쓰는 상황입니다.

```swift
// 상위 모듈(비즈니스 로직)이 하위 모듈(구현 세부사항)에 직접 의존
import SendGrid

class OrderService {
    private let mailer = SendGridClient(apiKey: apiKey)

    func completeOrder(_ order: Order) {
        // 주문 처리...
        mailer.send(to: order.email, message: "주문 완료")  // SendGrid에 묶임
    }
}
```

이 구조의 문제는 두 가지예요. SendGrid를 다른 서비스로 바꾸려면 비즈니스 로직을 열어야 하고 테스트할 때마다 진짜 메일이 날아갑니다.

DIP를 적용하면 화살표 방향이 바뀝니다.

```swift
// 추상화는 상위 모듈(주문 도메인)이 정의
protocol NotificationSender {
    func send(to: String, message: String) async throws
}

class OrderService {
    private let sender: NotificationSender

    init(sender: NotificationSender) {  // 추상화에만 의존
        self.sender = sender
    }

    func completeOrder(_ order: Order) async throws {
        try await sender.send(to: order.email, message: "주문 완료")
    }
}

// 세부사항(SendGrid)이 추상화를 따라감
class SendGridSender: NotificationSender { ... }
class SlackSender: NotificationSender { ... }
class FakeSender: NotificationSender { ... }  // 테스트용
```

원래는 "주문 서비스 → SendGrid"로 향하던 의존성이, 이제 "주문 서비스 → 프로토콜 ← SendGrid"가 됐어요. 세부사항이 도메인을 향해 고개를 숙이는 모양새라 '역전'이라고 부릅니다.

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/4-1783847948960.png" alt="화살표 방향이 뒤집히는 지점이 DIP의 전부예요">
  <figcaption>화살표 방향이 뒤집히는 지점이 DIP의 전부예요</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/2.png" alt="화살표 방향이 바뀌는 게 '역전'의 정체예요">
  <figcaption>화살표 방향이 바뀌는 게 '역전'의 정체예요</figcaption>
</figure>

---

## 그래서 DI 프레임워크가 있는 겁니다

여기서 자연스러운 질문이 나옵니다. "그럼 `SendGridSender()`는 누가 만들어주나요?"

이 조립을 대신 해주는 게 바로 의존성 주입(DI) 컨테이너예요. Swift 진영의 Swinject나 Factory 같은 DI 라이브러리가 하는 일이 정확히 이겁니다. 클래스들은 프로토콜만 바라보게 두고 실제 구현체를 꽂아주는 일은 라이브러리가 담당하는 거죠.

DIP는 원칙(방향)이고, DI는 그걸 실현하는 기법(도구)입니다. 이 구분만 잡아도 면접 답변이 한 급 올라가요.

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/3.png" alt="구현체는 꽂았다 뺐다, 조립은 프레임워크 몫입니다">
  <figcaption>구현체는 꽂았다 뺐다, 조립은 프레임워크 몫입니다</figcaption>
</figure>

---

## SOLID 전체 정리

두 편에 걸친 SOLID, 다섯 줄로 압축하면 이렇습니다.

| 원칙 | 한 줄 요약 |
|------|-----------|
| SRP | 바꿔달라는 사람이 다르면 코드도 분리해라 |
| OCP | 자주 바뀌는 곳은 수정 대신 추가로 대응해라 |
| LSP | 자식은 부모의 약속을 깨지 마라 |
| ISP | 쓰지도 않을 메서드를 구현하게 강요하지 마라 |
| DIP | 비즈니스 로직이 세부사항에 매달리게 하지 마라 |

다섯 개 전부 결국 한 방향을 가리킵니다. 변경의 파급 범위를 줄여라.

다만 이 원칙들을 모든 코드에 기계적으로 적용하면 오히려 KISS와 YAGNI를 깨게 됩니다. 원칙은 변경이 실제로 자주 일어나는 곳에 골라서 쓰는 도구예요. 이 균형 감각이 진짜 실력이라고 생각합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [SOLID 다섯 글자, 외우지 말고 이해하기 (SRP·OCP·LSP)](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/)
- [디미터의 법칙, 메서드 체이닝이 나쁜 코드가 되는 순간 (기준·예시)](/%EB%94%94%EB%AF%B8%ED%84%B0%EC%9D%98-%EB%B2%95%EC%B9%99-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%B2%B4%EC%9D%B4%EB%8B%9D%EC%9D%B4-%EB%82%98%EC%81%9C-%EC%BD%94%EB%93%9C%EA%B0%80-%EB%90%98%EB%8A%94-%EC%88%9C%EA%B0%84-%EA%B8%B0%EC%A4%80%EC%98%88%EC%8B%9C/)
<!-- /RELATED-POSTS -->
