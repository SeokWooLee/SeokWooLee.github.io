---
title: "Swift 미디에이터 패턴(Mediator Pattern) 완벽 정리 (객체 간 통신 중재자에게 맡기기)"
description: "iOS 앱을 조금 키워보신 분이라면 이런 순간을 만나셨을 거예요."
header:
  og_image: /assets/images/posts/6a92f532-28bb-415e-8858-12f39043fddb/1.png
tags:
  - 스위프트
  - Swift
  - 미디에이터패턴
  - 디자인패턴
permalink: /Swift-미디에이터-패턴Mediator-Pattern-완벽-정리-객체-간-통신-중재자에게-맡기기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

iOS 앱을 조금 키워보신 분이라면 이런 순간을 만나셨을 거예요.

화면 하나에 뷰가 대여섯 개인데, A 뷰가 바뀌면 B도 바꿔야 하고, B가 바뀌면 C도 손봐야 하는 상황이요.

어느새 뷰들끼리 서로를 직접 참조하면서 실타래처럼 얽혀버립니다.

이럴 때 정리해주는 게 바로 미디에이터 패턴입니다.

> Swift 미디에이터 패턴은 객체들이 서로를 직접 참조하지 않고, 오직 '중재자(Mediator)'하고만 대화하게 만들어 결합도를 낮추는 설계 패턴입니다.

이 글에서는 미디에이터 패턴이 정확히 뭔지, 언제 쓰면 좋은지, Swift로는 어떻게 짜는지까지 예제 코드와 함께 풀어드릴게요.

<figure>
  <img src="/assets/images/posts/6a92f532-28bb-415e-8858-12f39043fddb/1.png" alt="Swift 미디에이터 패턴, 결국 관제탑 하나 세우는 이야기예요">
  <figcaption>Swift 미디에이터 패턴, 결국 관제탑 하나 세우는 이야기예요</figcaption>
</figure>

---

## 미디에이터 패턴이 뭔가요?

한 문장으로 말하면 이렇습니다.

서로 통신해야 하는 객체들 사이에 '중재자'를 하나 두고, 모든 대화를 이 중재자를 거치게 만드는 방식이에요.

비유하자면 공항 관제탑입니다.

비행기끼리 서로 무전으로 "너 먼저 착륙해", "내가 먼저 갈게" 이러면 대형 사고가 나겠죠.

그래서 모든 비행기는 관제탑하고만 이야기합니다. 관제탑이 순서를 정리해주고요.

여기서 비행기가 우리 코드의 객체들이고, 관제탑이 바로 미디에이터입니다.

미디에이터 패턴이 해결하려는 핵심은 이거예요.

- **직접 참조 제거**: 객체 A가 객체 B, C, D를 일일이 알 필요가 없어짐
- **통신 로직 한 곳 집중**: 복잡한 상호작용 규칙이 중재자 한 곳에 모임
- **재사용성 향상**: 각 객체는 독립적이라 다른 화면에서도 갖다 쓰기 편함

---

## 언제 미디에이터 패턴을 써야 할까?

모든 상황에 좋은 건 아니에요. 저는 이런 신호가 보일 때 도입을 고민합니다.

객체들이 서로를 너무 많이 알고 있을 때, 그러니까 클래스 하나 열었더니 다른 객체 참조가 줄줄이 딸려 나올 때죠.

또 하나는 로직 하나 바꾸려는데 연결된 객체 여러 개를 동시에 손봐야 할 때예요.

대표적인 활용처를 정리하면 이렇습니다.

| 상황 | 예시 |
|------|------|
| 복잡한 화면 UI | 폼 입력값에 따라 여러 버튼·라벨이 연쇄 반응 |
| 컴포넌트 조율 | 채팅방 참여자 간 메시지 중계 |
| 워크플로우 제어 | 결제 단계별 뷰 상태 관리 |

반대로 객체가 두세 개뿐이고 관계가 단순하다면 굳이 안 쓰는 게 낫습니다.

괜히 중재자만 비대해지면서 '갓 오브젝트(God Object)'가 될 수 있거든요.

---

## Swift 미디에이터 패턴, 어떻게 구현하나요?

채팅방 예제로 가볼게요. 참여자들이 서로 직접 메시지를 보내는 게 아니라, 채팅방(중재자)을 통해 주고받는 구조입니다.

먼저 중재자가 지켜야 할 약속(프로토콜)과 참여자를 정의합니다.

```swift
// 중재자가 따라야 할 규칙
protocol ChatMediator {
    func send(_ message: String, from user: User)
    func add(_ user: User)
}
```

참여자는 중재자만 알고 있을 뿐, 다른 참여자를 직접 참조하지 않는다는 점이 핵심이에요.

```swift
class User {
    let name: String
    weak var mediator: ChatMediator?  // 순환 참조 방지

    init(name: String) { self.name = name }

    func send(_ text: String) {
        mediator?.send(text, from: self)  // 중재자에게 위임
    }
    func receive(_ text: String) {
        print("\(name) 받음: \(text)")
    }
}
```

마지막으로 중재자가 실제 전달 규칙을 담당합니다. 보낸 사람을 뺀 나머지에게만 메시지를 뿌리는 로직이죠.

```swift
class ChatRoom: ChatMediator {
    private var users: [User] = []
    func add(_ user: User) { users.append(user); user.mediator = self }
    func send(_ message: String, from user: User) {
        users.filter { $0 !== user }
             .forEach { $0.receive("[\(user.name)] \(message)") }
    }
}
```

이렇게 하면 유저가 아무리 늘어도 User 클래스는 손댈 필요가 없어요. 전달 규칙은 오직 ChatRoom만 알고 있으니까요.

<figure>
  <img src="/assets/images/posts/6a92f532-28bb-415e-8858-12f39043fddb/4-1783847822714.png" alt="다들 ChatRoom만 알고, 서로는 몰라요" loading="lazy">
  <figcaption>다들 ChatRoom만 알고, 서로는 몰라요</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/6a92f532-28bb-415e-8858-12f39043fddb/2.png" alt="예제 코드 그대로 켜놓고 따라 치면 감이 확 옵니다" loading="lazy">
  <figcaption>예제 코드 그대로 켜놓고 따라 치면 감이 확 옵니다</figcaption>
</figure>

---

## 미디에이터 vs 옵저버, 뭐가 다른가요?

이 둘을 헷갈려 하시는 분이 정말 많아요.

차이를 짧게 정리하면 이렇습니다.

| 구분 | 미디에이터 | 옵저버 |
|------|-----------|--------|
| 방향성 | 다대다 통신을 중앙 집중 | 일대다 알림(발행-구독) |
| 관계 | 객체들이 중재자를 통해 상호작용 | 관찰 대상이 관찰자에게 통보 |
| 초점 | 복잡한 상호 '조율' | 상태 변화 '전파' |

쉽게 말해 옵저버는 "나 바뀌었어!" 하고 일방적으로 알리는 쪽이고요.

미디에이터는 "이 상황에선 누가 뭘 해야 하지?"를 판단해 서로를 조율하는 쪽입니다.

Swift에서는 Combine이나 NotificationCenter가 옵저버 계열에 가깝고, 미디에이터는 보통 직접 구현하게 됩니다.

---

## 자주 묻는 질문 (Q&A)

**Q. 미디에이터가 너무 커지면 어쩌죠?**

로직이 몰리다 보니 중재자가 비대해지기 쉬워요. 이럴 땐 기능별로 중재자를 여러 개로 쪼개거나, 내부 로직을 별도 헬퍼로 분리하는 걸 권합니다.

**Q. weak를 꼭 써야 하나요?**

네, 참여자와 중재자가 서로를 강하게 참조하면 순환 참조로 메모리 누수가 생겨요. 위 예제처럼 한쪽을 weak로 잡아주세요.

**Q. SwiftUI에서도 쓸 수 있나요?**

가능합니다. ViewModel이 사실상 뷰들 사이의 미디에이터 역할을 하는 경우가 많아요. 여러 뷰의 상태를 한 ViewModel이 조율하는 구조로 자연스럽게 녹여낼 수 있습니다.

<figure>
  <img src="/assets/images/posts/6a92f532-28bb-415e-8858-12f39043fddb/3.png" alt="중재자 하나 그려놓고 관계 정리하니 머릿속이 개운해졌어요" loading="lazy">
  <figcaption>중재자 하나 그려놓고 관계 정리하니 머릿속이 개운해졌어요</figcaption>
</figure>

---

객체들이 서로 얽혀 손대기 무서워진 코드라면, 미디에이터 패턴을 한번 얹어보세요.

중재자 하나 세우는 것만으로 각 객체가 훨씬 가벼워지고, 나중에 기능 추가할 때 마음이 편해집니다.

오늘 예제 코드 그대로 작은 프로젝트에 적용해보시길 추천드려요. 직접 짜보면 감이 확 옵니다. 😊

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 빌더 패턴(Builder Pattern)으로 매개변수 8개 초기화 지옥 탈출하기](/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
- [[Swift 기초 #6] Swift 문자열은 왜 text[0]이 안 될까? 그래핌 클러스터(Grapheme Cluster) 총정리](/Swift-%EA%B8%B0%EC%B4%88-6-Swift-%EB%AC%B8%EC%9E%90%EC%97%B4%EC%9D%80-%EC%99%9C-text0%EC%9D%B4-%EC%95%88-%EB%90%A0%EA%B9%8C-%EA%B7%B8%EB%9E%98%ED%95%8C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0Grapheme-Cluster-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 비지터 패턴(Visitor Pattern), 더블 디스패치가 필요한 순간](/Swift-%EB%B9%84%EC%A7%80%ED%84%B0-%ED%8C%A8%ED%84%B4Visitor-Pattern-%EB%8D%94%EB%B8%94-%EB%94%94%EC%8A%A4%ED%8C%A8%EC%B9%98%EA%B0%80-%ED%95%84%EC%9A%94%ED%95%9C-%EC%88%9C%EA%B0%84/)
<!-- /RELATED-POSTS -->
