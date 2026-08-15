---
title: "[Swift 심화 #3] Sendable과 Swift 6 동시성 에러 마이그레이션"
description: "Swift 6 모드를 켜면 쏟아지는 동시성 에러의 주인공은 Sendable입니다. 값이 격리 경계를 넘어도 되는지 묻는 이 프로토콜의 의미와, struct화·불변화·actor 승격 순으로 밟는 마이그레이션 처방을 정리했습니다."
header:
  og_image: /assets/images/posts/053e9ee5-0023-4c58-838f-c7d6d31cf70e/swift-sendable-strict-concurrency-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - Sendable
  - Swift6
permalink: /Swift-심화-3-Sendable과-Swift-6-동시성-에러-마이그레이션/
toc: true
toc_sticky: true
last_modified_at: 2026-08-15
---

Swift 6 모드를 켜본 팀이라면 그 순간을 기억할 겁니다. 멀쩡히 돌아가던 프로젝트에 동시성 에러가 수십, 수백 개 쏟아지는 광경이요.

에러 문구의 주인공은 대부분 하나입니다. Sendable.

Concurrency 연작 3편, 이 마지막 퍼즐 조각과 Swift 6의 strict concurrency를 정리합니다.

<figure>
  <img src="/assets/images/posts/053e9ee5-0023-4c58-838f-c7d6d31cf70e/swift-sendable-strict-concurrency-1.jpg" alt="SENDABLE 텍스트와 격리 구역 사이 국경에서 값 상자를 검사하는 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>격리 국경을 넘는 값에는 반입 검사가 필요합니다</figcaption>
</figure>

## Sendable이 묻는 질문 — 이 값, 경계를 넘어도 됩니까

actor 편에서 격리를 "직렬 실행 맥락"으로 정리했습니다. actor 안, MainActor 위, 그리고 어느 쪽도 아닌 협력 풀.

그런데 값들은 이 경계를 수시로 넘어다닙니다. actor 메서드의 인자로 들어가고, 반환값으로 나오고, Task 클로저에 캡처되죠.

여기서 위험이 생깁니다. 격리가 지키는 건 actor 자신의 상태인데, 경계를 넘은 값이 가변 참조 타입이면 어떨까요.

같은 인스턴스를 두 격리가 동시에 쥐게 되고, actor가 막아준 데이터 레이스가 반입된 물건을 통해 부활합니다. 국경 검문은 철저한데 반입 물품 검사가 없는 셈이에요.

Sendable이 그 검사 기준입니다. 프로토콜인데 요구 메서드가 없는 표식 프로토콜(marker protocol)이고, 의미는 하나입니다.

이 타입의 값은 격리 경계를 넘어 동시에 사용돼도 안전하다.

어떤 타입이 안전할까요. 직관 그대로입니다.

값 타입은 넘어갈 때 복사되니 안전합니다(저장 프로퍼티가 전부 Sendable이라면). Int, String, 그리고 Sendable 프로퍼티로만 이뤄진 struct와 enum이 여기 속합니다. 대부분 컴파일러가 자동으로 인정해줘요.

actor도 안전합니다. 자기 보호가 내장이니까요.

불변 클래스(final + let 프로퍼티만)도 안전합니다. 바꿀 수 없으면 레이스도 없으니까.

위험한 건 정확히 하나, 가변 상태가 있는 클래스입니다. 값 타입 우선주의 편에서 정리한 "공유 + 가변 = 위험"이라는 공식이 Sendable 판정 기준 그 자체인 거예요.

함수 타입에는 @Sendable 표기가 따로 있습니다. `Task { }`의 클로저가 대표적으로 @Sendable인데, 이 표시가 붙은 클로저는 non-Sendable 값을 캡처할 수 없습니다.

클로저 편에서 본 캡처가 격리 경계를 넘는 밀수 통로가 될 수 있어서, 언어가 통로 자체를 검사하는 겁니다.

## strict concurrency — 경고를 에러로, 규율을 검사로

Swift 6 이전에도 이 규칙들은 존재했지만 기본적으로 조용했습니다.

Swift 6 언어 모드의 핵심이 바로 이 검사를 전부 켜서 에러로 승격시킨 것, 이른바 strict concurrency입니다. 완전 검사(complete checking) 아래에서는 non-Sendable 값이 격리 경계를 넘는 모든 지점이 컴파일 에러가 돼요.

에러가 쏟아지는 이유는 코드가 갑자기 나빠져서가 아닙니다. 원래 있던 잠재적 레이스가 이제야 보이는 것뿐이에요.

옵셔널이 도입될 때 "nil일 수 있는 모든 곳"이 드러났던 것과 같은 종류의 사건입니다. 그때 nil 체크가 그랬듯, 지금은 동시성 가정이 타입 시스템으로 이관되는 과도기인 거죠.

다행히 컴파일러도 생각보다 똑똑해지고 있습니다. Swift 6에 들어간 지역 기반 격리 분석(Swift Evolution 제안 SE-0414, region-based isolation)이 그렇습니다.

non-Sendable 값이라도 "보낸 쪽이 다시 안 만지는 게 증명되면" 이동을 허용합니다.

소유권이 넘어간 값은 레이스를 만들 수 없으니까요. 덕분에 이론상 에러여야 할 코드 상당수가 실제로는 통과합니다.

sending 파라미터 표기도 같은 계보고요. 요컨대 방향은 "무조건 금지"에서 "안전이 증명되면 허용"으로 정밀해지는 중입니다.

<figure>
  <img src="/assets/images/posts/053e9ee5-0023-4c58-838f-c7d6d31cf70e/swift-sendable-strict-concurrency-2.jpg" alt="struct·actor·final let 클래스는 통과, 가변 클래스는 거부되는 검사 도식" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>위험한 건 정확히 하나, 가변 상태를 가진 클래스입니다</figcaption>
</figure>

## 마이그레이션 실전 — 에러 유형별 처방

쏟아지는 에러는 대부분 몇 가지 패턴으로 수렴합니다. 유형별 표준 처방을 정리할게요.

**유형 1. 내가 만든 모델이 non-Sendable.** 가장 흔하고 가장 건강한 에러입니다. 1순위 처방은 struct로 바꾸기.

참조 정체성이 필요 없는 데이터 모델이 class로 선언돼 있었다면, 이번이 값 타입으로 옮길 명분입니다.

class여야 한다면 final + let으로 불변화해서 Sendable을 채택합니다. 가변이어야 한다면 그 상태의 소유자가 필요하다는 뜻이니 actor 승격을 검토합니다.

**유형 2. 전역 변수·static var.** 프로퍼티 편에서 "static var는 사실상 전역 상태"라고 경고했던 그 자리들이 전부 에러가 됩니다.

진짜 전역이 필요하면 격리를 선언하는 게 처방입니다. UI 관련이면 @MainActor를 붙이고, 아니면 actor로 감싸거나 불변(let)으로 바꿉니다.

**유형 3. 델리게이트·콜백 클래스가 경계에 걸림.** UIKit 시절 API와 만나는 지점에서 많이 나옵니다.

해당 타입이 사실상 메인 스레드 전용이라면 @MainActor 선언이 정답인 경우가 대부분이에요. "이 클래스는 원래 메인에서만 썼다"는 암묵적 사실을 명시로 바꾸는 겁니다.

**유형 4. 정말 안전한데 컴파일러가 모르는 경우.** 내부에서 락으로 보호 중인 클래스, C 라이브러리 래퍼 같은 것들요.

이때의 탈출구가 `@unchecked Sendable`입니다. "안전은 내가 보증하니 검사를 끄라"는 선언인데, 이름의 unchecked가 경고하듯 이건 unsafe 계열 도구입니다.

철학 1편에서 본 명시적 탈출구 원칙 그대로, 보증의 근거(어떤 락이 뭘 지키는지)를 주석으로 남기고 최소 범위로 쓰는 게 규율입니다.

마이그레이션 편의를 위해 에러를 unchecked로 도배하기 시작하면, 검사를 끈 채 Swift 6 배지만 단 코드가 됩니다.

전략 면에서는 한 번에 전부 켜지 않아도 됩니다. 언어 모드는 모듈 단위로 선택할 수 있으니까요.

말단 모듈(의존이 적은 유틸리티·모델)부터 Swift 6 모드로 올리고, 앱 타깃을 마지막에 올리는 상향식이 정석으로 자리 잡았습니다.

Xcode의 upcoming feature 플래그로 검사 수준만 미리 올려 경고를 관찰하는 준비 단계도 유용하고요.

## 방향 읽기 — 왜 이 고생을 시키는가

마이그레이션의 고통이 실재하니, 이 비용의 명분도 정확히 알아둘 필요가 있습니다.

Swift 6가 사는 약속은 컴파일이 되면 데이터 레이스가 없다입니다. 재현 안 되는 간헐 크래시, 출시 후에만 터지는 타이밍 버그라는 분류 전체가 컴파일 타임에 소멸합니다.

메모리 안전(옵셔널, ARC — Automatic Reference Counting, 자동 참조 계수)이 걸어온 길과 같습니다. 동시성 안전이 "잘 짜면 되는 것"에서 "언어가 보장하는 것"으로 넘어가는 겁니다.

그리고 이 방향은 철학 시리즈에서 본 궤적의 연장입니다. 실수 가능한 규율을 타입으로 승격시키고, 비용이 드는 곳에 명시적 표기를 요구한다(@unchecked, sending). 그리고 과도기의 마찰은 점진적 채택(모듈 단위 언어 모드)으로 흡수한다.

Swift Evolution 편에서 봤던 그 절차들이 지금도 기본 격리 옵션 같은 완충 장치를 계속 추가하며 마찰을 줄여가는 중이고요. 지금 겪는 경고들은 그 전환의 중간 지점입니다.

<figure>
  <img src="/assets/images/posts/053e9ee5-0023-4c58-838f-c7d6d31cf70e/swift-sendable-strict-concurrency-3.jpg" alt="Swift 5에서 Swift 6 정상까지 이어지는 마이그레이션 단계 표지판 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>struct화→불변화→actor→MainActor, unchecked는 근거와 함께 최후에</figcaption>
</figure>

## 정리

- Sendable은 "격리 경계를 넘어 동시에 사용돼도 안전한 타입"의 표식입니다. 값 타입·actor·불변 클래스는 안전하고, 가변 클래스가 위험의 전부입니다.
- @Sendable 클로저는 캡처를 검사해, 클로저가 레이스의 밀수 통로가 되는 걸 막습니다.
- Swift 6 strict concurrency는 이 검사를 에러로 승격시킨 것입니다. 에러 폭탄은 코드가 나빠진 게 아니라 잠재 레이스가 드러난 것입니다.
- 처방 우선순위: struct화 → 불변화 → actor 승격 → 격리 선언(@MainActor) → 최후에 근거를 명시한 @unchecked Sendable.
- 마이그레이션은 말단 모듈부터 상향식으로, 언어 모드는 모듈 단위로 올립니다.

다음 편은 Concurrency 연작의 마무리, 구조적 동시성입니다. Task와 async let과 TaskGroup이 이루는 작업 트리, 그리고 취소(cancellation)가 그 트리를 타고 전파되는 방식을 다룹니다.

---

## 참고 자료

- [SE-0414: Region based Isolation](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0414-region-based-isolation.md)
- [Swift 6 마이그레이션 가이드 (swift.org)](https://www.swift.org/migration/documentation/migrationguide/)

<!-- RELATED-POSTS -->
## 이어서 읽기

### Swift 심화 시리즈

- 이전 편: [\[Swift 심화 #2\] Swift actor 완전 정리, 데이터 레이스 막는 법](/Swift-%EC%8B%AC%ED%99%94-2-Swift-actor-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%A0%88%EC%9D%B4%EC%8A%A4-%EB%A7%89%EB%8A%94-%EB%B2%95/)
- 이전 편: [\[Swift 심화 #1\] async/await 원리, 멈추는 건 스레드가 아닙니다](/Swift-%EC%8B%AC%ED%99%94-1-asyncawait-%EC%9B%90%EB%A6%AC-%EB%A9%88%EC%B6%94%EB%8A%94-%EA%B1%B4-%EC%8A%A4%EB%A0%88%EB%93%9C%EA%B0%80-%EC%95%84%EB%8B%99%EB%8B%88%EB%8B%A4/)

### 관련 주제

- [델리게이트(Delegate) vs 클로저(Closure), 콜백 선택 기준 3가지](/%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8Delegate-vs-%ED%81%B4%EB%A1%9C%EC%A0%80Closure-%EC%BD%9C%EB%B0%B1-%EC%84%A0%ED%83%9D-%EA%B8%B0%EC%A4%80-3%EA%B0%80%EC%A7%80/)
<!-- /RELATED-POSTS -->
