---
title: "[Swift 중급 #1] Swift ARC 완전 정리, weak vs unowned는 수명 관계로 고릅니다"
description: "클로저 편에서 [weak self]로 순환 참조를 끊는 법을 다뤘을 때, 한 가지 질문을 미뤄뒀습니다. weak 말고 unowned도 있던데, 뭐가 다르고 언제 쓰는 걸까요. 이 질문에 답하려면 그 아래 층, ARC가 실제로 어떻게 돌아가는지부터 봐야 합니다."
header:
  og_image: /assets/images/posts/dea74de0-7d82-4c90-b8e1-e7be2bdaf005/1.png
tags:
  - Swift
  - 스위프트
  - ARC
  - weak
permalink: /Swift-중급-1-Swift-ARC-완전-정리-weak-vs-unowned는-수명-관계로-고릅니다/
toc: true
toc_sticky: true
last_modified_at: 2026-08-01
---

클로저 편에서 [weak self]로 순환 참조를 끊는 법을 다뤘을 때, 한 가지 질문을 미뤄뒀습니다. weak 말고 unowned도 있던데, 뭐가 다르고 언제 쓰는 걸까요. 이 질문에 답하려면 그 아래 층, ARC가 실제로 어떻게 돌아가는지부터 봐야 합니다.

Swift 중급 시리즈 1편입니다. ARC의 동작 원리, strong·weak·unowned 세 참조의 정확한 차이, 그리고 "weak vs unowned"를 고르는 실무 기준까지 정리합니다. Objective-C 시절 MRC(Manual Reference Counting, 수동 참조 계수)에서 ARC로 넘어온 역사는 별도 글에서 다뤘으니, 여기서는 Swift 관점의 현재에 집중할게요.

<figure>
  <img src="/assets/images/posts/dea74de0-7d82-4c90-b8e1-e7be2bdaf005/1.png" alt="ARC는 런타임 청소부가 아니라 컴파일러의 장부 정리입니다">
  <figcaption>ARC는 런타임 청소부가 아니라 컴파일러의 장부 정리입니다</figcaption>
</figure>

## ARC의 정체 — 런타임 청소부가 아니라 컴파일러의 장부 정리

ARC(Automatic Reference Counting)를 "Swift의 가비지 컬렉터"로 알고 있는 경우가 많은데, 동작 방식이 근본적으로 다릅니다.

가비지 컬렉션(GC)은 런타임에 별도 시스템이 주기적으로 돌면서 "아무도 안 쓰는 객체"를 찾아 청소합니다. 반면 ARC는 컴파일 시점에 결판이 납니다. 컴파일러가 코드 흐름을 분석해서, 참조가 생기는 지점에 retain(카운트 +1), 참조가 끝나는 지점에 release(카운트 -1) 호출을 끼워 넣어요. 카운트가 0이 되는 순간 즉시 deinit이 불리고 메모리가 해제됩니다.

이 차이에서 중요한 성질 두 개가 나옵니다. 첫째, 해제 시점이 결정적(deterministic)입니다. GC처럼 "언젠가 청소되겠지"가 아니라, 마지막 참조가 사라지는 바로 그 줄에서 해제돼요. deinit에 리소스 정리를 맡길 수 있는 근거입니다. 둘째, 프로그램을 멈추는 청소 단계가 없습니다. 철학 1편에서 본 "안전을 위해 성능을 포기하지 않는다"의 실제 사례죠.

공짜는 아닙니다. 참조 카운트 증감은 스레드 안전해야 해서 원자적 연산으로 수행되고 이게 참조 타입의 숨은 비용입니다. Swift가 struct를 기본값으로 미는 이유 중 하나가 여기 있어요. 값 타입은 이 장부 정리 자체가 없으니까요. 그리고 결정적으로, ARC는 순환을 못 풉니다. GC는 "루트에서 도달 불가능한 객체 그룹"을 찾아내 순환이어도 청소하지만 ARC는 서로가 서로를 세고 있는 한 카운트가 0이 될 수 없습니다. 순환 참조가 프로그래머의 책임으로 남는 구조적 이유입니다.

## 세 가지 참조 — 소유의 언어

ARC 세계에서 참조는 "이 객체를 살려두는 데 내가 책임이 있는가"에 따라 세 종류로 나뉩니다.

**strong(기본값)은 소유입니다.** 카운트를 올리고 내가 잡고 있는 한 객체는 살아 있습니다. 아무 표시 없이 선언한 모든 참조가 strong이에요.

**weak는 소유하지 않는 관찰입니다.** 카운트를 올리지 않아서 나머지 strong 참조가 다 사라지면 객체는 해제됩니다. 그 순간 weak 참조는 런타임이 자동으로 nil로 바꿔줘요. 그래서 weak 변수는 반드시 옵셔널이고 var여야 합니다. "언제든 nil이 될 수 있는 값"이라는 사실이 옵셔널 편에서 본 대로 타입에 새겨지는 겁니다.

**unowned도 소유하지 않는 참조인데, nil 처리를 포기한 버전입니다.** 카운트를 안 올리는 건 weak와 같지만 대상이 해제된 뒤 접근하면 nil이 아니라 즉시 크래시합니다. 대신 옵셔널이 아니라서 언래핑 없이 쓸 수 있어요.

정리하면 이렇게 됩니다. strong은 "네가 살아 있게 하겠다", weak는 "네가 없어질 수 있음을 안다", unowned는 "네가 나보다 오래 산다고 확신한다".

<figure>
  <img src="/assets/images/posts/dea74de0-7d82-4c90-b8e1-e7be2bdaf005/2.png" alt="strong은 소유, weak는 nil을 아는 관찰, unowned는 확신의 직시" loading="lazy">
  <figcaption>strong은 소유, weak는 nil을 아는 관찰, unowned는 확신의 직시</figcaption>
</figure>

## weak vs unowned — 선택 기준은 수명 관계

그럼 언제 weak고 언제 unowned일까요. 문법 차이가 아니라 두 객체의 수명 관계가 기준입니다.

**상대가 나보다 먼저 사라질 수 있으면 weak.** 델리게이트가 교과서 사례입니다. 뷰가 델리게이트(보통 뷰컨트롤러)를 참조할 때, 뷰컨트롤러가 먼저 해제되는 시나리오는 얼마든지 정상입니다. 그래서 델리게이트 프로퍼티는 관례적으로 `weak var delegate`고, 사용할 때 옵셔널 체이닝(`delegate?.didFinish()`)으로 "없으면 무시"를 표현합니다. nil이 정상 상태인 관계인 거죠.

**상대가 나와 같거나 더 오래 사는 게 구조적으로 보장되면 unowned.** 교과서 사례는 신용카드와 고객입니다. 카드는 고객 없이 존재할 수 없고 카드가 살아 있는 동안 고객은 반드시 살아 있습니다. `unowned let customer`가 정확한 표현이에요. 옵셔널이 아니니 쓸 때마다 언래핑하는 소음이 없고 let으로 선언할 수 있어 불변성도 지켜집니다.

이 기준을 강제 언래핑 `!`의 기준과 겹쳐 보면 일관성이 보입니다. unowned는 참조 버전의 `!`입니다. "여기서 nil이면 그건 내 설계가 깨진 것"이라는 선언이고, 그 확신이 틀렸을 때 조용한 오동작 대신 크래시로 즉시 알려줍니다. 확신이 없으면 weak를 쓰면 됩니다. 실제로 실무의 대세는 "애매하면 weak"입니다. weak의 비용(옵셔널 처리, 약간의 런타임 오버헤드)이 크래시 리스크보다 싸니까요. unowned는 수명 보장이 코드 구조에서 명백히 읽히는 자리에만 아껴 쓰는 도구로 생각하는 게 안전합니다.

클로저 캡처에서도 같은 기준이 적용됩니다. `[weak self]`가 기본 선택인 이유는 클로저가 실행될 시점에 self가 살아 있다는 보장이 대부분 없기 때문이에요. 반면 클로저와 self의 수명이 묶여 있는 경우, 예컨대 lazy 프로퍼티의 즉시 실행 클로저에서 self를 캡처할 때는 unowned가 정당화됩니다. 프로퍼티가 살아 있다는 건 self가 살아 있다는 뜻이니까요.

## 도구로 확인하기 — 감이 아니라 계측

순환 참조는 코드 리뷰로 다 잡히지 않습니다. 확인 도구 세 가지를 알아두면 "아마 괜찮겠지"가 "확인했다"로 바뀝니다.

**deinit 로그가 가장 싼 도구입니다.** 화면을 닫았는데 뷰모델의 deinit이 안 찍히면 어딘가 누수입니다. 개발 중 의심 가는 클래스에 print 한 줄 넣는 습관만으로 대부분의 순환이 조기 발견돼요.

**Xcode의 Memory Graph Debugger는 순환을 그림으로 보여줍니다.** 실행 중 디버그 바의 메모리 그래프 버튼을 누르면 현재 힙의 객체와 참조 관계가 그래프로 나오고 해제됐어야 할 객체가 남아 있으면 누가 붙잡고 있는지 화살표로 추적할 수 있습니다. 누수 의심 객체가 보라색 느낌표로 표시되는 것도 힌트고요.

**Instruments의 Leaks 템플릿은 시간 축 계측입니다.** 화면을 열고 닫기를 반복하며 메모리가 계단식으로 자라는지 보는 식으로, 릴리스 전 정기 점검에 적합합니다.

참고로 순환의 단골 용의자는 정해져 있습니다. 프로퍼티로 저장되는 클로저(클로저 편), 델리게이트를 strong으로 선언한 실수, NotificationCenter나 타이머류의 등록 해제 누락(NSTimer 편). 새 코드를 리뷰할 때 이 세 자리만 봐도 순환의 대부분을 커버합니다.

<figure>
  <img src="/assets/images/posts/dea74de0-7d82-4c90-b8e1-e7be2bdaf005/3.png" alt="감이 아니라 계측으로, deinit 로그·메모리 그래프·Leaks" loading="lazy">
  <figcaption>감이 아니라 계측으로, deinit 로그·메모리 그래프·Leaks</figcaption>
</figure>

## 정리

- ARC는 런타임 청소부가 아니라 컴파일 타임에 retain/release를 삽입하는 방식입니다. 해제가 결정적이고 GC 일시 정지가 없는 대신, 순환을 스스로 못 풉니다.
- 참조는 소유의 언어입니다. strong은 소유, weak는 nil 가능성을 아는 비소유, unowned는 상대가 더 오래 산다는 확신의 비소유입니다.
- 선택 기준은 수명 관계입니다. 상대가 먼저 사라질 수 있으면 weak, 구조적으로 더 오래 살면 unowned, 애매하면 weak.
- unowned는 참조 버전의 강제 언래핑입니다. 확신이 코드에서 읽히는 자리에만 씁니다.
- deinit 로그, Memory Graph Debugger, Instruments Leaks로 감이 아니라 계측으로 확인합니다.

다음 편은 중급 시리즈 2편, 제네릭입니다. 꺾쇠괄호 안의 T가 어떻게 타입 안전과 코드 재사용을 동시에 잡는지, where 절이 언제 필요한지 정리합니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[Swift 철학 #2] print 한 줄로 시작하는 언어의 비밀, Swift Progressive Disclosure](/Swift-%EC%B2%A0%ED%95%99-2-print-%ED%95%9C-%EC%A4%84%EB%A1%9C-%EC%8B%9C%EC%9E%91%ED%95%98%EB%8A%94-%EC%96%B8%EC%96%B4%EC%9D%98-%EB%B9%84%EB%B0%80-Swift-Progressive-Disclosure/)
- [[Swift 중급 #2] Swift 제네릭(Generics) 입문부터 활용까지, <T>가 중복과 위험을 동시에 없애는 법](/Swift-%EC%A4%91%EA%B8%89-2-Swift-%EC%A0%9C%EB%84%A4%EB%A6%ADGenerics-%EC%9E%85%EB%AC%B8%EB%B6%80%ED%84%B0-%ED%99%9C%EC%9A%A9%EA%B9%8C%EC%A7%80-T%EA%B0%80-%EC%A4%91%EB%B3%B5%EA%B3%BC-%EC%9C%84%ED%97%98%EC%9D%84-%EB%8F%99%EC%8B%9C%EC%97%90-%EC%97%86%EC%95%A0%EB%8A%94-%EB%B2%95/)
- [[Swift 중급 #3] Swift some vs any 완전 정리, some View의 정체와 existential의 비용](/Swift-%EC%A4%91%EA%B8%89-3-Swift-some-vs-any-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-some-View%EC%9D%98-%EC%A0%95%EC%B2%B4%EC%99%80-existential%EC%9D%98-%EB%B9%84%EC%9A%A9/)
<!-- /RELATED-POSTS -->
