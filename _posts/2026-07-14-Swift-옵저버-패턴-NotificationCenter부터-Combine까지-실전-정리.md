---
title: "Swift 옵저버 패턴, NotificationCenter부터 Combine까지 (실전 정리)"
description: "iOS 앱 만들다 보면 이런 순간이 꼭 옵니다. A 화면에서 뭔가 바뀌었는데, 저 멀리 떨어진 B 화면도 같이 갱신돼야 하는 상황이요."
header:
  og_image: /assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png
tags:
  - Swift
  - 옵저버패턴
  - NotificationCenter
  - Combine
  - iOS개발
  - 스위프트
  - 반응형프로그래밍
  - 디자인패턴
  - iOS앱개발
permalink: /Swift-옵저버-패턴-NotificationCenter부터-Combine까지-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 **한국어** · [English](/en/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [中文](/zh/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

iOS 앱 만들다 보면 이런 순간이 꼭 옵니다. A 화면에서 뭔가 바뀌었는데, 저 멀리 떨어진 B 화면도 같이 갱신돼야 하는 상황이요.

화면끼리 델리게이트로 억지로 연결하다 보면 코드가 스파게티처럼 엉키기 쉽습니다.

이럴 때 쓰는 게 바로 옵저버 패턴입니다. 결론부터 말씀드리면, Swift에서는 NotificationCenter로 시작해서 Combine으로 넘어가는 흐름이 가장 자연스럽습니다.

이 글에서는 옵저버 패턴이 뭔지부터, NotificationCenter 사용법, 그리고 요즘 많이 쓰는 Combine까지 실제 코드와 함께 정리해드릴게요.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png" alt="Swift 옵저버 패턴, 왼쪽에서 오른쪽으로 넘어가는 흐름이 이 글 핵심이에요">
  <figcaption>Swift 옵저버 패턴, 왼쪽에서 오른쪽으로 넘어가는 흐름이 이 글 핵심이에요</figcaption>
</figure>

## 옵저버 패턴이 뭔가요?

옵저버 패턴은 "어떤 대상의 상태가 바뀌면, 그걸 지켜보던 객체들에게 자동으로 알려주는" 구조예요.

유튜브 구독을 떠올리면 쉽습니다. 채널(발행자)이 영상을 올리면, 구독자(관찰자)들에게 알림이 가잖아요.

핵심은 발행자와 관찰자가 서로를 직접 몰라도 된다는 점입니다.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/4-1783847822056.png" alt="발행자와 관찰자는 서로를 모른 채 알림만 주고받아요">
  <figcaption>발행자와 관찰자는 서로를 모른 채 알림만 주고받아요</figcaption>
</figure>

채널은 구독자가 몇 명인지, 누군지 신경 쓰지 않아요. 그냥 "영상 올렸다"만 외치면 됩니다.

이렇게 느슨하게 연결되면 코드끼리 덜 엉키고 나중에 수정하기도 훨씬 편해집니다.

---

## NotificationCenter 어떻게 쓰나요?

NotificationCenter는 애플이 기본으로 제공하는 옵저버 패턴 도구예요. 별도 라이브러리 없이 바로 쓸 수 있습니다.

먼저 알림 이름을 정의하고, 발행하는 쪽 코드입니다.

```swift
// 알림 이름 정의
extension Notification.Name {
    static let didLogin = Notification.Name("didLogin")
}

// 로그인 성공 시 알림 발행
NotificationCenter.default.post(name: .didLogin, object: nil)
```

받는 쪽에서는 이렇게 관찰자를 등록합니다.

```swift
// 알림 구독
NotificationCenter.default.addObserver(
    self, selector: #selector(handleLogin),
    name: .didLogin, object: nil
)
```

주의할 점이 하나 있어요. 옛날 방식(addObserver + selector)은 화면이 사라질 때 removeObserver를 해주지 않으면 문제가 생길 수 있습니다.

다만 iOS 9 이상에서는 자동으로 정리되는 부분이 많아졌으니, 블록 기반 API를 쓸 땐 반환된 토큰 관리에 신경 쓰면 됩니다.

---

## Combine으로 넘어가면 뭐가 좋을까?

Combine은 애플이 2019년에 발표한 반응형 프로그래밍 프레임워크예요. iOS 13부터 쓸 수 있습니다.

NotificationCenter도 Combine의 Publisher로 변환할 수 있어서 기존 코드와 자연스럽게 섞입니다.

```swift
// NotificationCenter를 Combine 방식으로
let token = NotificationCenter.default
    .publisher(for: .didLogin)
    .sink { _ in
        print("로그인 감지!")
    }
```

Combine의 진짜 장점은 데이터 흐름을 이어 붙일 수 있다는 거예요.

map, filter 같은 연산자로 값을 가공하고 여러 이벤트를 합치는 것도 가능합니다.

그리고 sink가 반환하는 구독(AnyCancellable)을 변수에 담아두면, 그 변수가 사라질 때 구독도 알아서 취소됩니다. 메모리 관리가 한결 편해지는 거죠.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/2.png" alt="저는 이렇게 코드 켜놓고 손으로 직접 짜보면서 감을 잡았어요">
  <figcaption>저는 이렇게 코드 켜놓고 손으로 직접 짜보면서 감을 잡았어요</figcaption>
</figure>

---

## 그래서 뭘 써야 하나요?

상황에 따라 다릅니다. 아래 표로 정리해봤어요.

| 항목 | NotificationCenter | Combine |
|------|-------------------|---------|
| 도입 시기 | 오래된 기본 API | iOS 13+ |
| 학습 난이도 | 낮음 | 중간 이상 |
| 값 가공 | 어려움 | map/filter로 자유롭게 |
| 메모리 관리 | 직접 신경 | 구독 담아두면 자동 |

간단한 알림 한두 개면 NotificationCenter로 충분합니다.

반대로 데이터 흐름이 복잡하거나, 여러 이벤트를 조합해야 한다면 Combine이 훨씬 깔끔해요.

> 처음이라면 NotificationCenter로 개념을 익히고, 익숙해지면 Combine으로 넘어가세요.

물론 요즘은 SwiftUI와 async/await가 대세라, 신규 프로젝트라면 이 둘도 함께 고려해보시길 권합니다.

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/3.png" alt="알림 하나 딱 떴을 때 다른 화면까지 같이 갱신되면 그렇게 뿌듯하더라고요">
  <figcaption>알림 하나 딱 떴을 때 다른 화면까지 같이 갱신되면 그렇게 뿌듯하더라고요</figcaption>
</figure>

---

## 마무리

오늘은 Swift 옵저버 패턴을 NotificationCenter부터 Combine까지 훑어봤어요.

처음부터 완벽하게 이해하려 하지 마시고, 작은 알림 하나 직접 만들어보는 것부터 시작해보세요. 손으로 짜보면 훨씬 빨리 감이 옵니다. 응원할게요!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 델리게이트 패턴, 옵저버와 뭐가 다를까 (1:1 통신의 정석)](/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/)
- [Swift 어댑터 패턴, 레거시 API를 프로토콜로 감싸는 법 (실전 예제)](/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
- [Swift 팩토리 메서드 패턴, init 대신 쓰는 이유 (실전 정리)](/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
