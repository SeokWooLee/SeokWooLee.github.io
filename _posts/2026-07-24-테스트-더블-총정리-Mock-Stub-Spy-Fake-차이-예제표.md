---
title: "테스트 더블 총정리, Mock Stub Spy Fake 차이 (예제·표)"
description: "테스트 코드를 짜다 보면 꼭 만나는 벽이 있습니다."
header:
  og_image: /assets/images/posts/6e567d2e-5b97-44ea-b7e9-101840863ff5/1.png
tags:
  - 테스트더블
  - TestDouble
  - Mock
  - Stub
permalink: /테스트-더블-총정리-Mock-Stub-Spy-Fake-차이-예제표/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

테스트 코드를 짜다 보면 꼭 만나는 벽이 있습니다.

"이건 Mock이야, Stub이야?" 하고 헷갈리는 순간이요.

다 그냥 "가짜 객체" 아닌가 싶다가도, 코드 리뷰에서 "그건 Mock이 아니라 Stub인데요"라는 말을 들으면 머릿속이 하얘지죠.

이 글에서는 테스트 더블 다섯 형제(Dummy, Stub, Spy, Mock, Fake)의 차이를 예제와 함께 깔끔하게 정리해 드릴게요.

<figure>
  <img src="/assets/images/posts/6e567d2e-5b97-44ea-b7e9-101840863ff5/1.png" alt="테스트 더블 다섯 형제, 이 그림 하나로 Mock Stub 차이가 정리됩니다">
  <figcaption>테스트 더블 다섯 형제, 이 그림 하나로 Mock Stub 차이가 정리됩니다</figcaption>
</figure>

먼저 결론부터 말씀드릴게요.

> 테스트 더블은 "무엇을 검증하느냐"로 갈립니다. 값을 돌려주면 Stub, 호출을 기록하면 Spy, 기대한 호출인지 판정하면 Mock, 진짜처럼 동작하면 Fake예요.

이 한 문장만 기억해도 절반은 끝난 겁니다.

---

## 테스트 더블이 대체 뭔가요?

테스트 더블(Test Double)은 영화의 "스턴트 대역(stunt double)"에서 나온 말이에요.

위험한 장면을 배우 대신 소화하는 대역처럼, 진짜 객체를 대신하는 가짜 객체를 통틀어 부르는 용어예요.

이 개념은 제라드 메자로스(Gerard Meszaros)가 쓴 『xUnit Test Patterns』(2007)에서 체계적으로 정리됐어요.

그러니까 Mock, Stub 이런 건 테스트 더블의 하위 종류인 거죠.

왜 쓰냐고요? 예를 들어 결제 로직을 테스트하는데 진짜 카드사 API를 호출할 순 없잖아요.

느리고, 돈 나가고, 네트워크 끊기면 테스트도 깨지고요.

그래서 진짜를 대신할 대역을 세워두는 겁니다.

---

## Mock Stub Spy Fake 차이, 한 표로 정리

말로 설명하면 계속 헷갈리니까 표부터 보고 가실게요.

| 종류 | 핵심 역할 | 검증 대상 |
|------|-----------|-----------|
| Dummy | 자리만 채움 | 검증 안 함 |
| Stub | 정해진 값을 돌려줌 | 상태(결과값) |
| Spy | 호출 내역을 기록 | 상태 + 호출 기록 |
| Mock | 기대한 호출인지 판정 | 행위(호출) |
| Fake | 가볍게 진짜처럼 동작 | 상태(결과값) |

여기서 가장 중요한 구분선은 딱 하나예요.

**상태 검증이냐, 행위 검증이냐.**

Stub과 Fake는 "결과가 이렇게 나왔는지"를 봅니다(상태 검증).

Mock은 "그 메서드가 진짜 호출됐는지"를 봅니다(행위 검증).

Spy는 그 중간에서 호출을 슬쩍 기록해두는 역할이고요.

---

## 코드로 보면 확 와닿습니다

말보다 코드가 빠르죠. 사용자 알림 기능을 예로 들어볼게요. Swift에서는 프로토콜을 채택한 테스트 더블을 직접 만들어 쓰는 게 관례입니다.

먼저 Stub입니다. 정해진 값만 돌려주는 대역이에요.

```swift
// getName이 항상 "홍길동"을 반환하도록 고정
final class UserRepositoryStub: UserRepository {
    func getName(id: Int) -> String { "홍길동" }
}

let service = GreetingService(repository: UserRepositoryStub())
// 테스트는 결과값(상태)이 맞는지만 확인
XCTAssertEqual(service.greet(id: 1), "홍길동")
```

다음은 Mock이에요. "이 메서드가 호출됐는가"를 검증합니다.

```swift
// 알림이 실제로 발송(호출)됐는지 검증
final class NotificationSenderMock: NotificationSender {
    var sendCallCount = 0
    func send(_ message: String) { sendCallCount += 1 }
}

let mockSender = NotificationSenderMock()
let service = UserService(sender: mockSender)
service.notifyUser(id: 1)
// 행위 검증: send가 정확히 1번 불렸는가
XCTAssertEqual(mockSender.sendCallCount, 1)
```

Stub은 반환값(결과)을 확인하고 Mock은 호출 횟수를 확인한다는 차이가 보이시나요?

이 관점 차이가 테스트 더블 이해의 핵심이에요.

<figure>
  <img src="/assets/images/posts/6e567d2e-5b97-44ea-b7e9-101840863ff5/2.png" alt="결국 assertEquals냐 verify냐, 코드로 보면 확 갈리더라고요" loading="lazy">
  <figcaption>결국 assertEquals냐 verify냐, 코드로 보면 확 갈리더라고요</figcaption>
</figure>

---

## 그럼 Spy랑 Fake는 언제 쓰나요?

**Spy**는 실제 객체를 감싸서 진짜 동작은 그대로 두되, 호출 내역만 몰래 기록하는 대역이에요.

"진짜 로직은 살리고 싶은데, 몇 번 불렸는지도 알고 싶을 때" 씁니다.

Swift에서는 실제 구현에 위임하면서 호출 인자와 횟수를 프로퍼티에 기록하는 Spy 클래스를 직접 만들어 쓰는 게 대표적이죠.

**Fake**는 진짜와 비슷하게 동작하지만 훨씬 가벼운 구현체예요.

가장 흔한 예가 실제 DB 대신 쓰는 인메모리 저장소나, `Dictionary`로 만든 가짜 리포지토리입니다.

동작은 진짜처럼 하지만 운영에 쓰기엔 부족한, 딱 테스트용 구현이라고 보시면 돼요.

정리하면 이렇게 나눠집니다.

1. 값만 필요해요 → **Stub**
2. 호출됐는지 검증해야 해요 → **Mock**
3. 진짜 동작 + 호출 기록 둘 다요 → **Spy**
4. 진짜처럼 굴러가는 가벼운 구현이 필요해요 → **Fake**

<figure>
  <img src="/assets/images/posts/6e567d2e-5b97-44ea-b7e9-101840863ff5/3.png" alt="고민될 땐 이 흐름도대로 값이냐 호출이냐만 따져보세요" loading="lazy">
  <figcaption>고민될 땐 이 흐름도대로 값이냐 호출이냐만 따져보세요</figcaption>
</figure>

---

## 자주 묻는 질문

**Q. Mock과 Stub, 실무에선 그냥 섞어 써도 되나요?**

사실 실무에선 하나의 수제 테스트 더블 클래스가 값 반환(Stub)과 호출 기록(Mock) 역할을 겸하는 경우가 많아서 경계가 흐릿해요. 다만 "값을 주려는 목적"인지 "호출을 검증하려는 목적"인지는 구분해서 써야 테스트 의도가 명확해져요.

**Q. Mock을 너무 많이 쓰면 안 좋다던데요?**

행위 검증을 남발하면 내부 구현이 조금만 바뀌어도 테스트가 우수수 깨져요. 그래서 가능하면 상태 검증(Stub·Fake) 위주로 가고, 꼭 필요한 협력 관계에만 Mock을 쓰는 걸 권합니다.

---

다섯 종류를 다 외우려고 하기보다는, "지금 나는 값을 원하나, 호출을 검증하나"만 스스로 물어보세요.

그 질문 하나면 어떤 대역을 세울지 자연스럽게 답이 나옵니다.

오늘 테스트 코드 짜다가 또 헷갈리면 이 글 다시 펼쳐보시고요. 여러분의 테스트가 한결 단단해지길 응원할게요!
