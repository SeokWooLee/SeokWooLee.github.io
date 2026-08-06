---
title: "Swift Testing 프레임워크, XCTest 대체하는 새 표준 (한눈 정리)"
description: "iOS 개발하면서 테스트 코드 짜다 보면 XCTest에 슬슬 답답함을 느끼는 순간이 옵니다."
header:
  og_image: /assets/images/posts/e3d318b8-6a7b-429c-bc9c-d07cde5d73cb/1.jpg
tags:
  - SwiftTesting
  - XCTest
  - iOS개발
  - 스위프트
permalink: /Swift-Testing-프레임워크-XCTest-대체하는-새-표준-한눈-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-03
---

iOS 개발하면서 테스트 코드 짜다 보면 XCTest에 슬슬 답답함을 느끼는 순간이 옵니다.

저도 그랬어요. func test로 시작하는 함수 이름, XCTAssertEqual 같은 장황한 어서션, 실패했을 때 뭐가 문제인지 한눈에 안 들어오는 메시지까지요.

그러던 차에 애플이 WWDC 2024에서 Swift Testing이라는 새 프레임워크를 발표했습니다.

결론부터 말씀드리면, Swift Testing은 XCTest를 대체할 애플 공식 새 표준이 맞습니다. @Test 매크로와 #expect 하나로 훨씬 간결하게 테스트를 쓸 수 있고 Xcode 16부터 기본 내장됐어요.

이 글에서는 Swift Testing이 뭔지, XCTest와 뭐가 다른지, 지금 당장 써도 되는지까지 제가 직접 써본 경험으로 정리해드릴게요.

<figure>
  <img src="/assets/images/posts/e3d318b8-6a7b-429c-bc9c-d07cde5d73cb/1.jpg" alt="XCTest에서 Swift Testing으로, 첫 화면부터 코드가 이렇게 달라집니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>XCTest에서 Swift Testing으로, 첫 화면부터 코드가 이렇게 달라집니다</figcaption>
</figure>

## Swift Testing이 뭔가요?

Swift Testing은 애플이 2024년 WWDC에서 공개한 오픈소스 테스트 프레임워크입니다.

Swift 언어의 최신 기능인 매크로를 적극 활용해서 만들어졌어요.

기존 XCTest가 Objective-C 시절 뿌리를 가지고 있다면, Swift Testing은 처음부터 Swift답게 설계됐다는 게 가장 큰 차이입니다.

Xcode 16부터는 별도 설치 없이 기본으로 들어있습니다. 스위프트 패키지에서도 바로 쓸 수 있고요.

가장 눈에 띄는 건 문법입니다. 테스트 함수 이름을 test로 시작할 필요가 없어졌어요.

대신 함수 위에 @Test를 붙이면 그게 테스트가 됩니다.

```swift
import Testing

@Test func 장바구니_합계가_맞는지() {
    let cart = Cart(items: [1000, 2000])
    #expect(cart.total == 3000)  // 실패하면 실제 값까지 보여줌
}
```

위 코드처럼 #expect 안에 그냥 평범한 비교식을 넣으면 됩니다. XCTAssertEqual, XCTAssertTrue를 외울 필요가 없어요.

---

## XCTest와 뭐가 다를까?

제가 직접 옮겨보면서 느낀 핵심 차이를 표로 정리했습니다. (2026년 기준)

| 항목 | XCTest | Swift Testing |
| --- | --- | --- |
| 테스트 선언 | func test로 시작 | @Test 매크로 |
| 어서션 | XCTAssertEqual 등 여러 개 | #expect 하나로 통일 |
| 실패 메시지 | 값이 잘 안 보임 | 실제 값 자동 표시 |
| 반복 테스트 | 직접 for문 작성 | 파라미터라이즈드 기본 지원 |
| 병렬 실행 | 제한적 | 기본으로 병렬 실행 |

특히 저를 감동시킨 건 파라미터라이즈드 테스트입니다.

같은 로직을 값만 바꿔 여러 번 검증할 때, 예전엔 for문을 돌리거나 함수를 복붙했잖아요.

Swift Testing에서는 @Test에 인자 목록만 넘기면 알아서 각각 실행해줍니다.

> 실패한 케이스가 정확히 어떤 값이었는지도 딱 짚어줘요.

## 지금 바로 써도 될까요?

네, 저는 신규 프로젝트라면 지금 바로 도입하시길 추천드립니다.

Xcode 16 이상, Swift 6 환경이라면 설정이랄 것도 거의 없어요.

다만 알아두실 점이 있습니다. Swift Testing과 XCTest는 한 프로젝트에서 공존할 수 있습니다.

기존 XCTest 코드를 하루아침에 다 갈아엎을 필요가 없다는 뜻이에요.

새로 짜는 테스트만 Swift Testing으로 쓰고, 기존 건 천천히 옮겨가면 됩니다.

<figure>
  <img src="/assets/images/posts/e3d318b8-6a7b-429c-bc9c-d07cde5d73cb/2-1783804226061.jpg" alt="새 테스트부터 하나씩 옮겨도 충분합니다" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>새 테스트부터 하나씩 옮겨도 충분합니다</figcaption>
</figure>

한 가지 주의할 점은 UI 테스트입니다. 화면을 자동으로 조작하는 XCUITest 계열은 아직 XCTest 영역에 남아 있어요.

그래서 당분간은 유닛 테스트는 Swift Testing, UI 테스트는 XCTest 이런 식의 조합이 현실적입니다.

---

## 옮길 때 알아두면 좋은 것들

실제로 마이그레이션하면서 유용했던 팁 몇 가지를 짚어볼게요.

먼저 setUp, tearDown 대신 init과 deinit을 씁니다. Swift Testing은 테스트마다 인스턴스를 새로 만들거든요.

그래서 테스트끼리 상태가 섞이는 실수가 확 줄어듭니다.

값이 반드시 있어야 다음 단계로 넘어가는 경우엔 #expect 대신 #require를 씁니다.

#require는 조건이 안 맞으면 그 자리에서 테스트를 멈춰줘요.

<figure>
  <img src="/assets/images/posts/e3d318b8-6a7b-429c-bc9c-d07cde5d73cb/3.jpg" alt="초록불 뜨는 거 보면 @Test 이거 은근 중독됩니다" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>초록불 뜨는 거 보면 @Test 이거 은근 중독됩니다</figcaption>
</figure>

태그(Tag) 기능도 유용합니다. 관련 테스트끼리 묶어서 한 번에 돌리거나 걸러낼 수 있어요.

에러가 잘 던져지는지 확인할 땐 #expect(throws:)를 쓰면 됩니다.

## 마무리

Swift Testing은 이제 막 나온 실험 기능이 아니라, 애플이 밀고 있는 다음 표준입니다.

당장 모든 걸 바꿀 필요는 없지만 새 테스트부터 하나씩 써보시면 그 편함에 금방 익숙해지실 거예요.

iOS 테스트 코드에 답답함을 느끼셨다면, 오늘 딱 한 개만 @Test로 옮겨보시길 응원합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 정적 팩토리 메서드(Static Factory Method), init 대신 static func make 쓰는 이유](/Swift-%EC%A0%95%EC%A0%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9CStatic-Factory-Method-init-%EB%8C%80%EC%8B%A0-static-func-make-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
