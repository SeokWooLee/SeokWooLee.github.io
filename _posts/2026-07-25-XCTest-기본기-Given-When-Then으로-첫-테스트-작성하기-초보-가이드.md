---
title: "XCTest 기본기, Given-When-Then으로 첫 테스트 작성하기 (초보 가이드)"
description: "iOS 개발을 하다 보면 \"테스트 코드 좀 짜야 하는데…\" 하면서 자꾸 미루게 되죠. 막상 XCTest를 열어보면 뭐부터 손대야 할지 감이 안 오거든요."
header:
  og_image: /assets/images/posts/4af8286d-4af3-486a-9e22-35244db897e1/1.png
tags:
  - XCTest
  - iOS테스트
  - GivenWhenThen
  - Swift테스트
permalink: /XCTest-기본기-Given-When-Then으로-첫-테스트-작성하기-초보-가이드/
toc: true
toc_sticky: true
last_modified_at: 2026-07-25
---

iOS 개발을 하다 보면 "테스트 코드 좀 짜야 하는데…" 하면서 자꾸 미루게 되죠. 막상 XCTest를 열어보면 뭐부터 손대야 할지 감이 안 오거든요.

결론부터 말씀드릴게요. 첫 테스트는 Given-When-Then 세 줄로 시작하면 됩니다. 준비하고, 실행하고, 검증한다. 이 순서만 몸에 익히면 나머지는 자연스럽게 따라와요.

오늘은 XCTest 기본기와 함께 이 패턴으로 진짜 첫 테스트를 써보는 과정을 같이 해볼게요.

<figure>
  <img src="/assets/images/posts/4af8286d-4af3-486a-9e22-35244db897e1/1.png" alt="XCTest 첫 테스트는 Given-When-Then 세 박자면 충분해요">
  <figcaption>XCTest 첫 테스트는 Given-When-Then 세 박자면 충분해요</figcaption>
</figure>

## XCTest가 대체 뭔가요?

XCTest는 애플이 Xcode에 기본으로 넣어둔 테스트 프레임워크예요. 따로 설치할 필요 없이 바로 씁니다.

프로젝트를 만들 때 "Include Tests"만 체크하면 테스트 타깃이 알아서 생겨요.

핵심만 짚고 갈게요.

- XCTestCase: 테스트를 담는 클래스. 이걸 상속받아서 시작합니다.
- test로 시작하는 메서드: 함수 이름이 test로 시작하면 Xcode가 알아서 테스트로 인식해요.
- XCTAssert 계열: 결과가 맞는지 검증하는 함수들입니다.

처음엔 이 세 가지만 알고 시작해도 충분해요.

실행은 간단해요. 테스트 메서드 왼쪽의 다이아몬드 버튼을 누르거나, 단축키 Command + U를 누르면 전체 테스트가 돌아갑니다.

---

## Given-When-Then이 뭐길래?

테스트 초보가 가장 헤매는 지점이 "그래서 코드를 어떤 순서로 쓰지?"예요.

Given-When-Then은 바로 그 순서를 정해주는 패턴입니다. 세 덩어리로 나눠서 생각하면 돼요.

- Given(준비): 테스트에 필요한 값과 상태를 만든다
- When(실행): 검증하고 싶은 동작을 딱 한 번 실행한다
- Then(검증): 결과가 기대한 것과 같은지 확인한다

일상 언어로 바꾸면 이래요. "장바구니에 사과 2개가 담겨 있을 때(Given), 결제 금액을 계산하면(When), 2000원이 나와야 한다(Then)."

> 준비하고, 실행하고, 검증한다. 이 세 박자가 Given-When-Then의 전부입니다.

이렇게 나눠 쓰면 나중에 테스트가 실패했을 때 어느 단계가 문제인지 바로 보여요. 준비가 잘못됐는지, 실행 결과가 틀렸는지 한눈에 잡힙니다.

<figure>
  <img src="/assets/images/posts/4af8286d-4af3-486a-9e22-35244db897e1/2.png" alt="초록불 하나 켜졌을 뿐인데 이상하게 뿌듯하더라고요" loading="lazy">
  <figcaption>초록불 하나 켜졌을 뿐인데 이상하게 뿌듯하더라고요</figcaption>
</figure>

---

## 첫 테스트, 진짜로 작성해볼게요

간단한 계산기를 예로 들어볼게요. 두 수를 더하는 add 함수가 있다고 가정합니다.

먼저 테스트할 대상 코드예요.

```swift
struct Calculator {
    func add(_ a: Int, _ b: Int) -> Int {
        return a + b
    }
}
```

이제 Given-When-Then 순서로 테스트를 써봅니다. 주석으로 세 단계를 표시해두면 훨씬 읽기 편해요.

```swift
func testAddTwoNumbers() {
    // Given: 계산기와 입력값 준비
    let calculator = Calculator()
    // When: 더하기 실행
    let result = calculator.add(2, 3)
    // Then: 결과 검증
    XCTAssertEqual(result, 5)
}
```

여기서 XCTAssertEqual은 두 값이 같은지 비교하는 함수예요. result가 5가 아니면 테스트가 빨간색으로 실패하고, 5가 맞으면 초록색으로 통과합니다.

처음 초록불이 켜졌을 때의 그 기분, 저는 아직도 기억나요. 별거 아닌데 묘하게 뿌듯하더라고요.

---

## 자주 쓰는 XCTAssert 정리

XCTAssertEqual 하나만 알아도 시작은 되지만, 상황별로 골라 쓰면 코드가 훨씬 깔끔해져요. 제가 자주 쓰는 것만 표로 정리했어요.

| 함수 | 언제 쓰나 |
|---|---|
| XCTAssertEqual(a, b) | 두 값이 같은지 |
| XCTAssertTrue(조건) | 조건이 참인지 |
| XCTAssertFalse(조건) | 조건이 거짓인지 |
| XCTAssertNil(값) | 값이 nil인지 |
| XCTAssertNotNil(값) | 값이 nil이 아닌지 |

실패했을 때 메시지를 남기고 싶으면 마지막 인자에 문자열을 넣으면 돼요. 예를 들어 XCTAssertEqual(result, 5, "덧셈 결과가 틀렸습니다") 이런 식이죠.

<figure>
  <img src="/assets/images/posts/4af8286d-4af3-486a-9e22-35244db897e1/3.png" alt="자주 쓰는 XCTAssert만 골라 두면 코드가 훨씬 깔끔해집니다" loading="lazy">
  <figcaption>자주 쓰는 XCTAssert만 골라 두면 코드가 훨씬 깔끔해집니다</figcaption>
</figure>

---

## 초보가 자주 묻는 것들

Q. 테스트 파일은 어디에 두나요?
A. 프로젝트의 Tests 폴더 안에 두면 됩니다. 테스트 타깃에 포함돼 있어야 실행돼요.

Q. When은 꼭 한 줄이어야 하나요?
A. 한 줄일 필요는 없어요. 다만 검증하려는 동작은 하나만 실행하는 게 좋습니다. 한 테스트가 한 가지만 검증해야 실패 원인이 명확해지거든요.

Q. 테스트 함수 이름은 어떻게 짓나요?
A. test로 시작하되, testAddTwoNumbers처럼 무엇을 검증하는지 드러나게 짓는 걸 추천해요.

---

오늘은 XCTest 기본기와 Given-When-Then 패턴으로 첫 테스트를 써봤어요. 준비하고, 실행하고, 검증한다. 이 세 박자만 기억하면 됩니다.

완벽한 테스트를 짜려고 부담 갖지 마시고, 오늘 add 함수 하나부터 초록불 켜보세요. 그 작은 성공이 다음 테스트를 부릅니다. 응원할게요!
