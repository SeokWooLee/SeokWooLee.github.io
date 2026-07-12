---
title: "Swift 커스텀 에러 메시지 정의, LocalizedError 완벽 정리 (예제 포함)"
description: "Swift로 앱을 만들다 보면 do-catch로 에러를 잡았는데, 정작 화면에 띄울 메시지가 영 시원찮았던 경험 있으실 거예요."
header:
  og_image: /assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png
categories:
  - iOS
tags:
  - Swift
  - LocalizedError
  - errorDescription
  - iOS개발
  - 에러처리
  - SwiftUI
  - 커스텀에러
  - 앱개발
permalink: /error-description/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 **한국어** · [English](/en/error-description/) · [日本語](/ja/error-description/) · [中文](/zh/error-description/)
{: .notice--info}

Swift로 앱을 만들다 보면 `do-catch`로 에러를 잡았는데, 정작 화면에 띄울 메시지가 영 시원찮았던 경험 있으실 거예요.

저도 처음엔 `error.localizedDescription`을 그대로 썼다가 "The operation couldn't be completed…" 같은 정체불명의 문구를 사용자에게 보여준 적이 있습니다. 😅

결론부터 말씀드릴게요.

> Swift에서 사용자에게 보여줄 커스텀 에러 메시지를 정의하려면, `Error`가 아니라 `LocalizedError` 프로토콜을 채택하고 `errorDescription` 프로퍼티를 구현하면 됩니다.

오늘은 이 방법을 예제와 함께 하나씩 풀어볼게요.

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="Error 대신 LocalizedError를 쓰면 커스텀 에러 메시지가 이렇게 달라집니다">
  <figcaption>Error 대신 LocalizedError를 쓰면 커스텀 에러 메시지가 이렇게 달라집니다</figcaption>
</figure>

---

## 왜 그냥 Error로는 부족할까요?

많은 분들이 이렇게 에러를 정의하실 거예요.

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

이렇게만 해두고 `error.localizedDescription`을 출력하면, 우리가 기대한 "비밀번호가 틀렸습니다"가 아니라 시스템이 만든 밋밋한 기본 문구가 나옵니다.

`Error` 프로토콜 자체에는 사람이 읽을 메시지를 정의하는 자리가 없기 때문이에요.

그래서 등장하는 게 바로 `LocalizedError`입니다.

---

## Swift 커스텀 에러 메시지, 어떻게 정의하나요?

방법은 간단해요. `LocalizedError`를 채택하고 `errorDescription`을 구현하면 됩니다.

아래는 로그인 에러에 사용자용 메시지를 붙인 예제입니다.

```swift
extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidPassword:
            return "비밀번호가 올바르지 않습니다."
        case .userNotFound:
            return "존재하지 않는 사용자입니다."
        }
    }
}
```

이제 `error.localizedDescription`을 호출하면 우리가 정해둔 문구가 그대로 나옵니다.

포인트는 `errorDescription`의 반환 타입이 `String?`, 즉 옵셔널이라는 거예요.

여기서 `nil`을 반환하면 다시 시스템 기본 메시지로 돌아가 버립니다. 그래서 모든 케이스에 값을 채워주는 게 중요해요.

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="케이스마다 문자열을 채워주는 게 포인트예요">
  <figcaption>케이스마다 문자열을 채워주는 게 포인트예요</figcaption>
</figure>

---

## errorDescription 말고 더 있나요? (failureReason·recoverySuggestion)

네, `LocalizedError`에는 선택적으로 구현할 수 있는 프로퍼티가 더 있어요.

역할을 표로 정리하면 이렇습니다.

| 프로퍼티 | 역할 | 예시 문구 |
|---|---|---|
| `errorDescription` | 무엇이 잘못됐는지 | "로그인에 실패했습니다." |
| `failureReason` | 왜 발생했는지 | "비밀번호가 5회 틀렸습니다." |
| `recoverySuggestion` | 어떻게 해결할지 | "잠시 후 다시 시도해 주세요." |

특히 `recoverySuggestion`은 사용자에게 다음 행동을 안내할 때 유용합니다.

실제로 SwiftUI의 `Alert`나 AppKit 환경에서는 이 값들을 자동으로 읽어 화면에 배치해 주기도 해요.

저는 사용자 대면 에러라면 최소한 `errorDescription`과 `recoverySuggestion` 두 개는 챙겨두는 편입니다.

---

## 개발용 로그와 사용자 메시지를 헷갈리지 마세요

한 가지만 덧붙일게요.

디버깅 로그에 찍고 싶은 개발자용 설명은 `CustomStringConvertible`(즉 `description`)로,

사용자에게 보여줄 번역된 메시지는 `LocalizedError`로 나누는 걸 추천해요.

둘의 목적이 다르니까요. 하나는 나를 위한 것이고, 다른 하나는 사용자를 위한 것이죠.

이렇게 역할을 분리해두면 나중에 다국어 대응을 할 때도 `NSLocalizedString`을 얹기 훨씬 수월합니다.

---

오늘 내용을 한 줄로 줄이면, "사용자에게 보여줄 에러라면 `LocalizedError`의 `errorDescription`부터 채우자"입니다.

작은 습관 하나로 사용자 경험이 확 달라지니, 다음 프로젝트에서 꼭 한번 적용해 보세요. 응원할게요! 🙌

---

## 참고 자료

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 싱글톤 패턴, shared가 안티패턴 소리 듣는 진짜 이유](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
