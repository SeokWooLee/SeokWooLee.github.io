---
title: "Swift async await 비동기 코드 테스트하는 법"
description: "Swift 5.5 이상에서는 테스트 함수를 async로 선언하고 await로 결과를 기다린 뒤 검증하면 됩니다. 에러 검증, 오래된 콜백 API 테스트, expectation을 아직 써야 하는 경우까지 정리했습니다."
header:
  og_image: /assets/images/posts/519a8c08-5d97-4118-a4aa-648368253233/swift-async-await-testing-1.jpg
categories:
  - Swift
tags:
  - Swift
  - async await
  - 비동기테스트
  - XCTest
permalink: /Swift-async-await-비동기-코드-테스트하는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-08-06
---

async/await로 코드를 짜는 건 이제 손에 익었는데, 막상 테스트를 짜려니 막막했던 적 있으시죠?

`XCTestExpectation`에 `wait(for:)`를 붙여가며 콜백 지옥을 테스트하던 시절의 습관이 남아 있으면 특히 그렇습니다.

결론부터 말씀드릴게요. Swift 5.5 이상(Xcode 13+)이라면 **테스트 함수 자체를 `async`로 선언하고 `await`로 결과를 기다린 뒤 검증**하면 됩니다. expectation과 타임아웃을 쓰던 예전 방식은 대부분 필요 없어졌어요.

오늘은 제가 실무에서 정리한 async/await 테스트 방법을 처음부터 끝까지 풀어보겠습니다.

<figure>
  <img src="/assets/images/posts/519a8c08-5d97-4118-a4aa-648368253233/swift-async-await-testing-1.jpg" alt="XCTestExpectation과 async await 테스트 코드를 좌우로 대비한 썸네일" width="1200" height="800">
  <figcaption>Swift async await 테스트, 왼쪽과 오른쪽 코드 길이부터 확 다릅니다</figcaption>
</figure>

## 핵심 요약 먼저 정리할게요

바쁘신 분들을 위해 이 글의 핵심만 짚어드릴게요.

1. 테스트 메서드에 `async throws`를 붙이고 내부에서 `await` 호출
2. 에러 검증은 `do-catch` 또는 `XCTAssertThrowsError`의 async 버전 패턴 활용
3. 타임아웃이 꼭 필요한 경우에만 `expectation`을 병행
4. 오래된 콜백 API는 `withCheckedThrowingContinuation`으로 감싸서 테스트

---

## Swift async await 테스트, 어떻게 하나요?

가장 기본이 되는 형태부터 보겠습니다.

예전에는 비동기 결과를 기다리려고 expectation을 만들고 클로저 안에서 fulfill을 호출했어요. 코드가 길고 읽기도 어려웠죠.

지금은 훨씬 간결합니다.

```swift
// 테스트 함수에 async throws만 붙이면 끝
func test_사용자_불러오기() async throws {
    let service = UserService()
    let user = try await service.fetchUser(id: 1)
    XCTAssertEqual(user.name, "이석우")
}
```

위 코드에서 눈여겨볼 부분은 딱 두 가지예요.

함수 선언에 `async throws`가 붙었다는 점, 그리고 결과를 `try await`으로 기다린 뒤 평범하게 `XCTAssertEqual`로 검증한다는 점입니다.

> 테스트 함수 자체를 async로 만들면, 비동기 코드도 동기 코드처럼 위에서 아래로 읽힙니다.

저는 이 방식으로 바꾸고 나서 테스트 코드 줄 수가 절반 가까이 줄었어요.

<figure>
  <img src="/assets/images/posts/519a8c08-5d97-4118-a4aa-648368253233/swift-async-await-testing-2.jpg" alt="await 키워드가 강조된 Swift async 테스트 함수와 초록 체크 표시" width="1024" height="1024" loading="lazy">
  <figcaption>async 함수는 테스트도 async로 짜면 그걸로 끝입니다</figcaption>
</figure>

---

## 에러가 발생하는 경우는 어떻게 검증할까

비동기 함수가 에러를 던지는 상황도 자주 테스트하게 됩니다.

가장 직관적인 방법은 `do-catch`예요.

```swift
func test_없는_사용자_에러() async {
    let service = UserService()
    do {
        _ = try await service.fetchUser(id: -1)
        XCTFail("에러가 나야 정상입니다")
    } catch {
        XCTAssertTrue(error is UserError)
    }
}
```

성공 케이스에서 `XCTFail`을 넣어주는 게 포인트입니다.

에러가 안 나고 그냥 통과해버리면 테스트가 조용히 성공한 것처럼 보이거든요. 이걸 방지하는 안전장치라고 보시면 돼요.

참고로 동기 코드에서 쓰던 `XCTAssertThrowsError`는 기본적으로 async 함수를 직접 받지 못합니다. 그래서 위처럼 `do-catch`로 풀어 쓰는 방식을 저는 더 자주 씁니다.

---

## 오래된 콜백 API는 어떻게 테스트하나요?

모든 코드가 async로 마이그레이션 되어 있으면 좋겠지만, 현실은 그렇지 않죠.

아직 completion 핸들러로 결과를 넘겨주는 오래된 API가 프로젝트에 남아 있을 겁니다.

이럴 땐 `withCheckedThrowingContinuation`으로 감싸서 async 세계로 데려오면 됩니다.

```swift
func fetchLegacy() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        oldAPI { data, error in
            if let error { continuation.resume(throwing: error) }
            else { continuation.resume(returning: data!) }
        }
    }
}
```

한 번 감싸두면 테스트 쪽에서는 그냥 `try await fetchLegacy()`로 부르면 되니, 앞서 본 방식과 똑같아집니다.

주의할 점 하나. continuation은 반드시 딱 한 번만 `resume`해야 해요. 두 번 호출하면 크래시가 나고 아예 호출을 안 하면 테스트가 영원히 멈춥니다.

---

## expectation 방식과 async 방식, 언제 뭘 쓸까

둘을 비교해서 정리해봤습니다. (Xcode 13 이상, 2026년 기준)

| 항목 | expectation 방식 | async 테스트 방식 |
|------|------------------|-------------------|
| 코드 길이 | 길다 | 짧다 |
| 가독성 | 콜백 중첩 | 위→아래 순차 |
| 타임아웃 지정 | 쉬움 | 별도 처리 필요 |
| 권장 상황 | 알림·타이머 대기 | 대부분의 비동기 |

일반적인 async/await 함수 테스트라면 async 방식이 훨씬 편합니다.

다만 노티피케이션이 특정 시간 안에 오는지, 타이머가 제때 동작하는지처럼 **명시적 타임아웃**이 중요한 상황에서는 expectation을 병행하는 게 여전히 유효해요.

<figure>
  <img src="/assets/images/posts/519a8c08-5d97-4118-a4aa-648368253233/swift-async-await-testing-3.jpg" alt="Xcode 테스트 네비게이터에 Test Passed 초록 체크가 표시된 화면" width="1024" height="1024" loading="lazy">
  <figcaption>초록불 뜨는 순간이 제일 뿌듯하더라고요</figcaption>
</figure>

---

## 마무리하며

처음엔 낯설어도 테스트 함수에 `async throws` 한 번만 붙여보면, 왜 진작 안 바꿨나 싶으실 거예요.

오늘 정리한 네 가지 패턴만 손에 익혀두면 대부분의 비동기 테스트는 무리 없이 커버됩니다. 편하게 하나씩 적용해보세요, 응원할게요!
