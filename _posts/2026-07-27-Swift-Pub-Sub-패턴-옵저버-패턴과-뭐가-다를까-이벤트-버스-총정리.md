---
title: "Swift Pub-Sub 패턴, 옵저버 패턴과 뭐가 다를까 (이벤트 버스 총정리)"
description: "iOS 앱을 만들다 보면 한 번쯤 막히는 지점이 있어요."
header:
  og_image: /assets/images/posts/9ab7d5df-ebe8-4dc0-8981-d630c273aeb0/1.jpg
tags:
  - Swift
  - PubSub패턴
  - 옵저버패턴
  - 이벤트버스
permalink: /Swift-Pub-Sub-패턴-옵저버-패턴과-뭐가-다를까-이벤트-버스-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

iOS 앱을 만들다 보면 한 번쯤 막히는 지점이 있어요.

화면 A에서 일어난 일을 저 멀리 떨어진 화면 B가 알아야 하는데, 둘을 어떻게 연결하지? 하는 순간이죠.

델리게이트를 주렁주렁 넘기다 보면 코드가 스파게티처럼 엉키기 쉽습니다. 이럴 때 꺼낼 도구가 바로 Swift Pub-Sub 패턴과 이벤트 버스예요.

오늘은 Swift Pub-Sub 패턴이 옵저버 패턴과 뭐가 다른지, 이벤트 버스는 또 뭔지 헷갈리는 분들을 위해 직접 정리해드릴게요.

> 결론부터 말하면, 옵저버 패턴은 "주체가 구독자를 직접 알고 있는" 구조이고, Pub-Sub 패턴은 그 사이에 중개자(이벤트 버스)를 두어 서로를 모르게 만든 구조예요.

<figure>
  <img src="/assets/images/posts/9ab7d5df-ebe8-4dc0-8981-d630c273aeb0/1.jpg" alt="Swift Pub-Sub 패턴과 옵저버 패턴, 중개자 하나로 갈립니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Swift Pub-Sub 패턴과 옵저버 패턴, 중개자 하나로 갈립니다</figcaption>
</figure>

이 한 문장만 이해하면 나머지는 술술 풀립니다. 아래에서 코드와 함께 차근차근 볼게요.

---

## 옵저버 패턴부터 짚고 갈게요

옵저버 패턴은 "관찰 대상(Subject)"과 "관찰자(Observer)"가 직접 연결된 구조예요.

대상에 변화가 생기면 등록된 관찰자들에게 직접 알림을 보냅니다.

iOS를 하셨다면 이미 써보셨을 거예요. 대표적인 게 `NotificationCenter`, 그리고 Combine의 `@Published`, KVO(Key-Value Observing)입니다.

핵심은 이거예요. 관찰 대상이 자기 구독자 목록을 직접 들고 있다는 점.

```swift
// 관찰 대상이 구독자를 직접 관리
class Subject {
    private var observers: [Observer] = []
    func add(_ o: Observer) { observers.append(o) }
    func notify() { observers.forEach { $0.update() } }
}
```

구조가 단순하고 직관적이에요. 대상 하나에 관찰자 여럿이 붙는 1:N 관계에 잘 맞습니다.

다만 대상이 관찰자의 존재를 알아야 한다는 게 규모가 커지면 부담이 되기도 해요.

---

## Swift Pub-Sub 패턴은 뭐가 다른가요?

Pub-Sub 패턴(발행-구독 패턴)은 여기서 한 걸음 더 나갑니다.

발행자(Publisher)와 구독자(Subscriber) 사이에 **중개자**를 하나 끼워 넣어요. 이 중개자가 바로 이벤트 버스, 혹은 메시지 브로커예요.

발행자는 그냥 버스에 "이런 일이 일어났다"고 던지기만 합니다. 누가 받는지 몰라요.

구독자도 버스에 "이 이벤트 오면 알려줘"라고 등록만 해둡니다. 누가 보냈는지 몰라요.

둘이 서로를 전혀 모른다는 게 핵심이에요. 이걸 느슨한 결합(decoupling)이라고 부릅니다.

<figure>
  <img src="/assets/images/posts/9ab7d5df-ebe8-4dc0-8981-d630c273aeb0/4-1783847592705.png" alt="직접 연결 vs 버스를 낀 연결, 그림으로 보면 이래요" width="844" height="1422" loading="lazy" decoding="async">
  <figcaption>직접 연결 vs 버스를 낀 연결, 그림으로 보면 이래요</figcaption>
</figure>

```swift
// 이벤트 버스가 발행자와 구독자 사이를 중개
enum AppEvent { case userLoggedIn(id: String) }

final class EventBus {
    static let shared = EventBus()
    private var handlers: [(AppEvent) -> Void] = []
    func subscribe(_ h: @escaping (AppEvent) -> Void) { handlers.append(h) }
    func publish(_ e: AppEvent) { handlers.forEach { $0(e) } }
}
```

발행자는 `EventBus.shared.publish(.userLoggedIn(id: "123"))` 한 줄이면 끝이에요.

로그인 화면은 홈 화면의 존재조차 몰라도 되는 거죠.

<figure>
  <img src="/assets/images/posts/9ab7d5df-ebe8-4dc0-8981-d630c273aeb0/2.jpg" alt="EventBus 한 줄이면 발행 끝, 이렇게 단순해요" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>EventBus 한 줄이면 발행 끝, 이렇게 단순해요</figcaption>
</figure>

---

## 옵저버 vs Pub-Sub, 표로 한눈에 비교

말로만 들으면 비슷해 보이니, 차이를 표로 정리했어요.

| 구분 | 옵저버 패턴 | Pub-Sub 패턴 |
|------|------------|--------------|
| 중개자 | 없음 (직접 연결) | 있음 (이벤트 버스) |
| 결합도 | 대상이 구독자를 앎 | 서로 모름 (느슨) |
| 관계 | 주로 1:N | N:N 가능 |
| iOS 예시 | KVO, `@Published` | `NotificationCenter`, 이벤트 버스 |
| 적합한 상황 | 특정 객체 상태 관찰 | 멀리 떨어진 모듈 간 통신 |

재밌는 건, `NotificationCenter`는 사실 Pub-Sub에 가깝다는 점이에요.

이름은 "Notification"이지만 발행자와 구독자가 `NotificationCenter`라는 버스를 통해서만 만나거든요. 서로를 직접 참조하지 않죠.

그래서 "옵저버 패턴 = NotificationCenter"라고 외우면 살짝 어긋나요. 개념적으로는 Pub-Sub 쪽에 더 가깝습니다.

---

## 그럼 언제 뭘 써야 할까요?

제가 실무에서 세운 기준을 나눠볼게요.

한 객체의 상태 변화를 가까운 곳에서 지켜봐야 한다면 옵저버 계열이 편해요. Combine의 `@Published`나 SwiftUI의 `@Observable`이 딱이죠.

반대로 서로 멀리 떨어진 모듈끼리, 혹은 앱 전역에서 벌어지는 사건(로그인, 결제 완료, 네트워크 끊김)을 알려야 한다면 이벤트 버스가 훨씬 깔끔해요.

다만 이벤트 버스도 만능은 아니에요.

남발하면 "이 이벤트가 대체 어디서 오는 거지?" 하고 흐름을 추적하기 어려워지는 함정이 있어요. 결합을 풀어준 대가로 가시성을 조금 잃는 셈이죠.

그래서 저는 화면 안쪽 로직은 옵저버(Combine), 화면과 모듈을 넘나드는 굵직한 사건만 이벤트 버스로 처리하는 식으로 나눠 씁니다.

<figure>
  <img src="/assets/images/posts/9ab7d5df-ebe8-4dc0-8981-d630c273aeb0/3.jpg" alt="굵직한 사건만 버스로 몰아주면 흐름이 깔끔해집니다" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>굵직한 사건만 버스로 몰아주면 흐름이 깔끔해집니다</figcaption>
</figure>

**Q. Combine을 쓰면 이벤트 버스는 필요 없나요?**

아니에요. Combine의 `PassthroughSubject` 하나로 간단한 이벤트 버스를 직접 만들 수 있어요. 도구가 겹칠 뿐, 개념이 대체되는 건 아닙니다.

**Q. Pub-Sub이 항상 더 좋은 패턴인가요?**

그렇지 않아요. 결합을 풀 필요가 없는 가까운 관계라면 옵저버가 더 읽기 쉽고 디버깅도 편합니다.

---

옵저버 패턴은 직접 연결, Pub-Sub 패턴은 중개자를 낀 연결. 차이는 딱 이거예요.

둘은 경쟁 관계가 아니라 상황 따라 골라 쓰는 도구고요. 다음에 화면 하나 짤 때 이 둘이 서로를 얼마나 알아야 하는지부터 떠올려 보면, 어떤 패턴이 맞는지 금방 감이 올 거예요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 델리게이트(Delegate) vs 옵저버(Observer), 언제 뭘 써야 할까 비교 총정리](/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/)
- [Swift 옵저버 패턴(Observer Pattern), NotificationCenter부터 Combine까지](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
