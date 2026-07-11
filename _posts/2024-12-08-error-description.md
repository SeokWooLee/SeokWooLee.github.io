---
title: "Swift 커스텀 에러 메세지 정의하기 - LocalizedError와 errorDescription"
description: "Swift에서 커스텀 에러 메세지를 정의하려면 Error의 localizedDescription 대신 LocalizedError 프로토콜의 errorDescription을 구현해야 합니다. 그 이유와 예제 코드를 소개합니다."
header:
  og_image: "https://github.com/user-attachments/assets/89f0101e-ff74-4b1b-9596-b0991e688435"
categories:
  - iOS
tags:
  - Swift
  - iOS
  - Error
  - LocalizedError
permalink: /error-description/
toc: true
toc_sticky: true
last_modified_at: 2024-12-08
---

개발을 하다보면 커스텀한 에러를 정의해야하는 경우가 종종 발생합니다.

이때, 커스텀한 에러 메세지까지 정의해야하는 경우 처리할 수 있는 방법에 대해서 공유드립니다.

**결론부터 말하면, `Error` 프로토콜의 `localizedDescription`을 직접 구현하는 대신 `LocalizedError` 프로토콜을 채택하고 `errorDescription`을 구현해야 합니다.** 그 이유를 아래에서 설명합니다.

## Error

### 정의

<img width="949" alt="Swift Error 프로토콜 정의 - Apple 공식 문서" src="https://github.com/user-attachments/assets/89f0101e-ff74-4b1b-9596-b0991e688435">

Swift의 `Error`는 프로토콜로 정의되어 있습니다.\
즉, 커스텀 에러를 정의하려면 `Error` 프로토콜을 준수하는 구현체를 생성해야 합니다.

### 인터페이스

<img width="444" alt="Error 프로토콜의 localizedDescription 인터페이스" src="https://github.com/user-attachments/assets/a57a059e-a6b8-407b-8c6b-f8381b4a7a94">

에러 메세지는 `localizedDescription`이라는 인터페이스로 정의되어 있습니다.

### 위 내용을 토대로 개발한다면?

`Error` 프로토콜을 준수하고 `localizedDescription`에서 원하는 문자열을 리턴하도록 작업하면 어떻게 될까요?

#### 예시

```swift
import Foundation

enum SomeError: Error {
    case someCase
    
    var localizedDescription: String {
        "Some Localized Description"
    }
}

/*
1. SomeError 타입을 직접적으로 알고 있는 상태에서는 원하는대로 동작합니다.
*/

let someError: SomeError = .someCase
print(someError.localizedDescription)
// Some Localized Description

// ------------------------------------

/*
2. 추상화 된 Error 타입을 알고 있는 상태에서는 에러가 발생합니다.
*/

let error: Error = SomeError.someCase
print(error.localizedDescription)
// The operation couldn’t be completed. (__lldb_expr_5.SomeError error 0.)
```

잘 될 것으로 예상했지만 **추상화 된 `Error` 타입을 이용하게 되면 원하는대로 동작하지 않습니다** 😨

#### 해결 방안

이러한 문제를 해결하기 위해서는 `LocalizedError`라는 것을 이용해야 합니다.

## LocalizedError

### 정의

<img width="878" alt="LocalizedError 프로토콜 정의 - Apple 공식 문서" src="https://github.com/user-attachments/assets/e6b29190-54d2-4948-9226-190731016028">

<img width="217" alt="LocalizedError는 Error 프로토콜을 상속" src="https://github.com/user-attachments/assets/48543821-d184-42c3-a804-0953b92ef026">

`LocalizedError`는 `Error`를 상속 받아 지역화 된 메세지를 제공하기 위해 특화된 에러 프로토콜입니다.

### 인터페이스

<img width="369" alt="LocalizedError 프로토콜의 errorDescription 등 인터페이스 목록" src="https://github.com/user-attachments/assets/9523911f-80fc-4e4e-854b-a7a7a561bd79">

여러 인터페이스가 존재하는데 에러 메세지에 필요한 인터페이스인 `errorDescription: String?`을 구현하면 추상화 된 `Error` 타입으로 `localizedDescription`에 접근할 때 발생했던 이슈를 해결할 수 있습니다.

### 예시

```swift
import Foundation

enum SomeError: LocalizedError {
    case someCase
    
    var errorDescription: String? {
        "Some Localized Description"
    }
}

/*
1. SomeError 타입을 직접적으로 알고 있는 상태에서 원하는대로 동작합니다.
*/

let someError: SomeError = .someCase
print(someError.localizedDescription)
// Some Localized Description

// ------------------------------------

/*
2. 추상화 된 Error 타입을 알고 있는 상태에서도 원하는대로 동작합니다.
*/

let error: Error = SomeError.someCase
print(error.localizedDescription)
// Some Localized Description
```

구체화 된 에러 타입과 추상화 된 에러 타입 모두 동일하게 원하는대로 동작하는 것을 확인했습니다 💯

## 결론

커스텀한 에러를 구현할 때 커스텀한 에러 메세지를 정의하고 싶다면 `LocalizedError` 프로토콜을 준수하고 `errorDescription: String?`에 커스텀한 에러 메세지를 정의한 구현체를 생성하면 됩니다.

## 관련 링크
- [Error - Apple Developer Documentation](https://developer.apple.com/documentation/swift/error)
- [LocalizedError - Apple Developer Documentation](https://developer.apple.com/documentation/foundation/localizederror)
