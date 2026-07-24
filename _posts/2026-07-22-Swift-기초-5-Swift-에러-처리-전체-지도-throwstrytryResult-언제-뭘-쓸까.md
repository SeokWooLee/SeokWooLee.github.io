---
title: "[Swift 기초 #5] Swift 에러 처리 전체 지도, throws·try?·try!·Result 언제 뭘 쓸까"
description: "Swift 에러 처리를 배우다 보면 도구가 너무 많다는 인상을 받게 됩니다. throws와 do-catch, try에 붙는 물음표와 느낌표, 거기에 Result 타입까지. 어떤 API는 에러를 던지고, 어떤 API는 Result를 돌려주고, 어떤 코드는 그냥 try?로 뭉개고…"
header:
  og_image: /assets/images/posts/79164702-137a-40ab-b9c5-28127ec6c2df/1.png
tags:
  - Swift
  - 스위프트
  - 에러처리
  - throws
permalink: /Swift-기초-5-Swift-에러-처리-전체-지도-throwstrytryResult-언제-뭘-쓸까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-22
---

Swift 에러 처리를 배우다 보면 도구가 너무 많다는 인상을 받게 됩니다. throws와 do-catch, try에 붙는 물음표와 느낌표, 거기에 Result 타입까지. 어떤 API는 에러를 던지고, 어떤 API는 Result를 돌려주고, 어떤 코드는 그냥 try?로 뭉개고 지나갑니다. 뭐가 표준일까요.

사실 이 도구들은 경쟁 관계가 아니라 역할 분담 관계입니다. 기본은 throws고, try의 변형들은 "에러에 얼마나 관심 있는지"의 스펙트럼이고, Result는 에러를 값으로 들고 다녀야 할 때의 보완재예요. Swift 기초 시리즈 5편, 이번 글에서 이 지도를 그립니다.

<figure>
  <img src="/assets/images/posts/79164702-137a-40ab-b9c5-28127ec6c2df/1.png" alt="에러 처리 도구들은 경쟁이 아니라 역할 분담 관계입니다">
  <figcaption>에러 처리 도구들은 경쟁이 아니라 역할 분담 관계입니다</figcaption>
</figure>

## 기본기 — 에러도 타입, 던지기도 계약

Swift 에러 처리의 출발점은 두 가지 선언입니다. 에러는 Error 프로토콜을 채택한 타입으로 정의하고, 에러를 낼 수 있는 함수는 시그니처에 throws를 답니다.

```swift
enum PaymentError: Error {
    case insufficientBalance(needed: Int)
    case cardExpired
    case network(underlying: Error)
}

func pay(amount: Int) throws -> Receipt {
    guard balance >= amount else {
        throw PaymentError.insufficientBalance(needed: amount - balance)
    }
    // ...
}
```

에러 타입으로 enum이 애용되는 건 우연이 아닙니다. 옵셔널 편에서 본 것처럼 enum은 "경우의 수"를 표현하는 도구고, 실패 사유야말로 경우의 수니까요. 연관값으로 부족액 같은 맥락 정보까지 실을 수 있습니다.

더 중요한 건 throws가 시그니처에 있다는 사실입니다. 이 함수가 실패할 수 있다는 정보가 타입 시스템에 등록되는 거예요. 그래서 호출하는 쪽은 반드시 try를 써야 하고, try를 빼먹으면 컴파일 에러입니다. 예외가 어디서 터질지 모르는 언어들과 달리, Swift 코드는 실패 가능 지점이 전부 try로 표시되어 있습니다. 옵셔널이 "값 없음"을 타입으로 승격시켰듯, throws는 "실패 가능성"을 시그니처로 승격시킨 겁니다. 철학 1편의 안전 우선 원칙이 여기서도 반복되는 거죠.

받는 쪽의 기본형은 do-catch입니다.

```swift
do {
    let receipt = try pay(amount: 50_000)
    show(receipt)
} catch PaymentError.insufficientBalance(let needed) {
    showTopUp(needed: needed)
} catch {
    showError(error)  // 나머지 전부, error 변수 자동 제공
}
```

catch는 패턴 매칭입니다. 특정 케이스만 골라 잡고, 연관값을 꺼내고, 나머지는 마지막 catch로 받는 구조가 switch와 닮아 있어요. 에러가 enum이라는 사실과 맞물려 돌아가는 설계입니다.

## try의 세 얼굴 — 에러에 대한 관심의 스펙트럼

try에는 세 가지 표기가 있고, 각각 "에러를 어떻게 대할 것인가"의 선언입니다.

**try — 처리하거나 전달하겠다.** 기본형입니다. do-catch로 잡거나, 아니면 내 함수도 throws로 선언하고 에러를 위로 흘려보냅니다. 에러 전파는 명시적 코드 없이 자동인데, 이게 Swift 에러 처리의 숨은 강점입니다. 중간 계층 함수들은 throws만 달면 배관 역할을 공짜로 하고, 처리는 UI에 가까운 바깥 계층에서 한 번만 하면 됩니다.

**try? — 실패해도 상관없다, 값만 없으면 된다.** 에러를 옵셔널로 바꿉니다. 성공하면 값, 실패하면 nil이고 에러 정보는 버려져요. 캐시 읽기처럼 "안 되면 말고" 시나리오에 적합합니다. 위험한 건 습관적 try?입니다. 실패 사유가 필요한 자리에서 try?를 쓰면 디버깅 단서가 조용히 증발해요. "이 실패의 이유를 아무도 궁금해하지 않는가"에 그렇다고 답할 수 있을 때만 쓰는 게 기준입니다.

**try! — 실패는 프로그래머 버그다.** 실패하면 즉시 크래시입니다. 강제 언래핑 `!`와 정확히 같은 논리로, 앱 번들 내장 리소스 로딩처럼 "실패한다면 코드가 잘못된 것"인 자리에만 허용됩니다. 옵셔널 편에서 세운 기준이 그대로 적용돼요. nil이(여기서는 에러가) 정상 시나리오라면 절대 금지입니다.

<figure>
  <img src="/assets/images/posts/79164702-137a-40ab-b9c5-28127ec6c2df/2.png" alt="try 세 변형은 에러를 대하는 태도의 선언입니다" loading="lazy">
  <figcaption>try 세 변형은 에러를 대하는 태도의 선언입니다</figcaption>
</figure>

## Result — 에러를 값으로 들고 다니기

throws가 기본이라면 Result는 언제 쓸까요. Result는 성공 또는 실패를 담는 enum입니다.

```swift
enum Result<Success, Failure: Error> {
    case success(Success)
    case failure(Failure)
}
```

throws와의 결정적 차이는 시간과 장소입니다. throws는 호출 즉시 처리(혹은 전파)를 강제하는 제어 흐름이지만, Result는 평범한 값이라 저장하고 배열에 담고 나중에 처리할 수 있어요. 그래서 Result가 맞는 자리는 대략 세 가지입니다.

첫째, 완료 핸들러 기반 비동기 API. 클로저 편에서 본 completion 핸들러는 함수가 반환된 뒤 실행되므로 throws로 에러를 전달할 수 없습니다. `completion: (Result<Data, NetworkError>) -> Void`가 그 자리의 표준이었죠. 둘째, 결과를 모아야 할 때. 작업 10개를 돌리고 성공 7개, 실패 3개를 집계하려면 에러가 값이어야 합니다. 셋째, 실패 타입을 명시하고 싶을 때. Result의 Failure는 구체 타입이라, 어떤 에러가 오는지 시그니처에서 보입니다.

다만 방향성은 알아둘 필요가 있습니다. async/await가 표준이 된 뒤로 비동기 에러 전달은 `async throws`가 맡게 됐고, Result의 첫째 용도는 새 코드에서 줄어드는 중입니다. 셋째 용도도 Swift 6의 타입드 throws(`throws(PaymentError)`, SE-0413)가 흡수하고 있고요. 그래서 현재의 실무 기준은 이렇게 정리됩니다. 기본은 throws, Result는 "에러를 값으로 저장·집계·전달해야 하는" 특수 상황의 도구.

참고로 둘 사이 변환은 한 줄입니다. `Result { try pay(amount: 100) }`로 감싸고, `try result.get()`으로 풀어요. 경계에서 자유롭게 오갈 수 있으니 하나를 고집할 이유도 없습니다.

## 설계 감각 — 좋은 에러는 받는 쪽을 생각한다

문법 밖의 이야기를 조금 하겠습니다. 에러 처리 코드의 품질은 대체로 던지는 쪽의 설계에서 갈립니다.

**에러는 호출자가 다르게 행동할 수 있는 단위로 나눕니다.** 케이스를 세분화하는 기준은 "받는 쪽이 이 둘을 다르게 처리하는가"입니다. 잔액 부족과 카드 만료는 사용자 안내가 다르니 다른 케이스가 맞고, TCP 타임아웃과 DNS 실패는 앱이 똑같이 재시도할 거라면 network 하나로 묶는 게 맞아요. 처리 방법이 같은 에러를 열 갈래로 쪼개면 catch만 늘어납니다.

**던질까, 옵셔널로 돌려줄까의 기준도 같습니다.** "없음"이 예상 가능한 일상(딕셔너리 조회)이면 옵셔널, 뭔가 잘못된 것이고 사유가 필요하면 throws입니다. 사유가 하나뿐이고 뻔하다면 옵셔널로 충분한 경우가 많아요.

**사용자에게 보여줄 메시지는 에러 타입에 함께 설계합니다.** LocalizedError를 채택하면 에러 자신이 표시용 메시지를 들고 다니게 할 수 있는데, 이 부분은 별도 글에서 자세히 다뤘습니다.

<figure>
  <img src="/assets/images/posts/79164702-137a-40ab-b9c5-28127ec6c2df/3.png" alt="throws는 즉시 받아야 하는 공, Result는 상자에 담긴 값" loading="lazy">
  <figcaption>throws는 즉시 받아야 하는 공, Result는 상자에 담긴 값</figcaption>
</figure>

## 정리

- Swift 에러 처리의 뼈대는 Error 프로토콜(주로 enum) + throws 시그니처 + do-catch 패턴 매칭입니다. 실패 가능성이 타입 시스템에 등록되고, 실패 지점은 전부 try로 표시됩니다.
- try의 세 변형은 에러에 대한 태도 선언입니다. 처리·전파는 try, 사유가 안 궁금하면 try?, 실패가 곧 버그면 try!.
- 에러 전파는 자동입니다. 중간 계층은 throws만 달고 처리는 바깥에서 한 번.
- Result는 에러를 값으로 저장·집계해야 할 때의 도구고, 비동기 전달 용도는 async throws로, 타입 명시 용도는 타입드 throws로 세대교체 중입니다.
- 에러 케이스는 "호출자가 다르게 행동하는 단위"로 나누는 게 설계의 핵심입니다.

여기까지로 기초 시리즈의 제어 흐름 3부작(옵셔널, guard, 에러 처리)이 완성됐습니다. 다음 편은 조금 다른 결의 기초, Swift의 String이 다른 언어보다 유난히 어려운 이유입니다. "한글이 몇 글자냐"는 질문이 왜 간단하지 않은지부터 시작합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 브릿지 패턴, 서브클래스 폭발 막는 추상화 분리 (예제 총정리)](/Swift-%EB%B8%8C%EB%A6%BF%EC%A7%80-%ED%8C%A8%ED%84%B4-%EC%84%9C%EB%B8%8C%ED%81%B4%EB%9E%98%EC%8A%A4-%ED%8F%AD%EB%B0%9C-%EB%A7%89%EB%8A%94-%EC%B6%94%EC%83%81%ED%99%94-%EB%B6%84%EB%A6%AC-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 기초 #3] Swift 프로퍼티 총정리, 저장·연산·lazy·didSet 선택 기준 4가지](/Swift-%EA%B8%B0%EC%B4%88-3-Swift-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EC%A0%80%EC%9E%A5%EC%97%B0%EC%82%B0lazydidSet-%EC%84%A0%ED%83%9D-%EA%B8%B0%EC%A4%80-4%EA%B0%80%EC%A7%80/)
- [[Swift 기초 #6] Swift 문자열은 왜 text[0]이 안 될까? 그래핌 클러스터(Grapheme Cluster) 총정리](/Swift-%EA%B8%B0%EC%B4%88-6-Swift-%EB%AC%B8%EC%9E%90%EC%97%B4%EC%9D%80-%EC%99%9C-text0%EC%9D%B4-%EC%95%88-%EB%90%A0%EA%B9%8C-%EA%B7%B8%EB%9E%98%ED%95%8C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0Grapheme-Cluster-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
