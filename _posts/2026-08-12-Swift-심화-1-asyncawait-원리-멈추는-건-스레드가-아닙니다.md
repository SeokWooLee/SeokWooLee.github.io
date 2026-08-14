---
title: "[Swift 심화 #1] async/await 원리, 멈추는 건 스레드가 아닙니다"
description: "await에서 멈추는 것은 스레드가 아니라 함수입니다. 함수가 상태를 힙에 저장하고 스레드를 협력형 풀에 반납하는 suspension의 정확한 의미와, 순차 await가 병렬 실행이 아닌 이유를 정리했습니다."
header:
  og_image: /assets/images/posts/17c93232-c3fd-4d3b-867a-e93af7bc893f/swift-async-await-suspension-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - asyncawait
  - 동시성
permalink: /Swift-심화-1-asyncawait-원리-멈추는-건-스레드가-아닙니다/
toc: true
toc_sticky: true
last_modified_at: 2026-08-12
---

에러 처리 편과 클로저 편에서 여러 번 "async/await 이후로는"이라는 단서를 달았습니다. 이제 그 본편입니다.

심화 시리즈의 문을 여는 Swift Concurrency 연작 1편입니다. async/await가 정확히 무엇을 해결했고, 어떤 원리로 동작하는지부터 시작합니다.

문법 자체는 하루면 익힙니다. 함수에 async를 붙이고 호출에 await를 붙이고.

어려운 건 그다음이에요. "await에서 스레드가 멈추나요?", "async 함수는 어느 스레드에서 돌아요?" 같은 질문들이요.

여기에 답이 서지 않으면, 동시성 코드는 계속 주문 외우기로 남습니다.

이 글의 목표는 그 두 질문에 정확히 답하는 겁니다.

<figure>
  <img src="/assets/images/posts/17c93232-c3fd-4d3b-867a-e93af7bc893f/swift-async-await-suspension-1.jpg" alt="ASYNC AWAIT 텍스트와 콜백 계단이 직선 코드로 펴지는 대비 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>콜백 계단을 눕혀 컴파일러의 시야를 되찾은 게 async/await입니다</figcaption>
</figure>

## 콜백의 진짜 문제 — 들여쓰기가 아니라 컴파일러의 실명

async/await 이전의 비동기는 클로저 편에서 본 completion 핸들러였습니다.

문제로 흔히 "콜백 지옥"의 들여쓰기가 꼽히지만, 그건 증상이고 병의 뿌리는 따로 있습니다. 컴파일러가 흐름을 보지 못한다는 것.

```swift
func loadProfile(completion: @escaping (Result<Profile, Error>) -> Void) {
    fetchUser { result in
        switch result {
        case .success(let user):
            fetchAvatar(user.avatarURL) { avatarResult in
                // completion 호출을 깜빡하면? 컴파일러는 모릅니다
            }
        case .failure(let error):
            completion(.failure(error))
        }
    }
}
```

이 코드에서 completion을 어떤 경로에서 빼먹거나 두 번 부르거나, 엉뚱한 스레드에서 불러도 컴파일러는 아무 말이 없습니다.

반환이라는 언어의 기본 개념을 클로저 호출이라는 관습으로 대체한 결과입니다. 언어가 보장해주던 것들(모든 경로가 값을 반환한다, 에러는 전파된다)이 전부 개발자의 규율로 넘어간 거예요.

async/await는 비동기를 다시 언어의 관할로 가져옵니다.

```swift
func loadProfile() async throws -> Profile {
    let user = try await fetchUser()
    let avatar = try await fetchAvatar(user.avatarURL)
    return Profile(user: user, avatar: avatar)
}
```

반환은 return이고 에러는 throws입니다. 모든 경로가 값을 내거나 던진다는 걸 컴파일러가 다시 검사해줘요.

에러 처리 편에서 정리한 do-catch·전파 규칙도 비동기에서 그대로 작동합니다. 문법 설탕이 아니라 잃어버렸던 컴파일러의 시력을 되찾은 겁니다.

## suspension의 정확한 의미 — 멈추는 건 함수지 스레드가 아니다

첫 번째 질문. await에서 스레드가 멈출까요?

안 멈춥니다. 멈추는 건 함수고, 스레드는 풀려나 다른 일을 하러 갑니다.

이 구분이 Swift Concurrency 전체에서 가장 중요한 문장입니다.

await 지점에서 벌어지는 일을 순서대로 보면 이렇습니다. 함수가 자신의 진행 상태(지역 변수, 어디까지 실행했는지)를 스택이 아닌 힙에 저장하고, 점유하던 스레드를 반납합니다.

이걸 suspension(중단)이라고 해요. 기다리던 작업이 끝나면, 저장해둔 상태를 이어받아 실행이 재개(resume)됩니다.

재개될 때 아까 그 스레드라는 보장은 없습니다. 같은 함수의 앞줄과 뒷줄이 다른 스레드에서 실행될 수 있어요.

이 설계 덕분에 Swift의 동시성 런타임은 협력형 스레드 풀(cooperative thread pool)로 돌아갑니다. 스레드를 CPU 코어 수 정도만 만들어두고, 함수들이 await마다 스레드를 서로 양보하는 구조입니다.

스레드 수백 개를 만들고 재우던(blocking) GCD(Grand Central Dispatch) 시절과 대비되는 지점이에요. 스레드가 잠들지 않으니 스레드 폭발도, 컨텍스트 스위칭 낭비도 구조적으로 줄어듭니다.

여기서 실무 규칙 하나가 바로 도출됩니다. 협력 풀의 스레드에서는 블로킹하면 안 됩니다.

세마포어로 대기하거나 sleep을 부르면, 양보를 전제로 설계된 풀의 스레드 하나가 통째로 잠들어요. 코어가 4개면 스레드도 4개 안팎인데, 그중 하나가 잠들면 시스템 전체의 4분의 1이 멈추는 셈입니다.

"await는 양보, block은 금지"가 협력 풀의 제1규칙입니다.

<figure>
  <img src="/assets/images/posts/17c93232-c3fd-4d3b-867a-e93af7bc893f/swift-async-await-suspension-2.jpg" alt="await 정류장에서 상태를 가방에 싸고 스레드를 반납하는 함수 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>await에서 함수는 짐을 싸고, 스레드는 반납되어 다른 일을 합니다</figcaption>
</figure>

## 어느 스레드에서 도는가 — 스레드가 아니라 격리를 묻는다

두 번째 질문. async 함수는 어느 스레드에서 돌까요?

Swift Concurrency의 답은 "그 질문을 버리라"입니다. 스레드는 런타임이 관리하는 자원이고, 개발자가 지정하는 건 격리(isolation), 즉 "이 코드가 어느 직렬 실행 맥락에 속하는가"입니다.

대표 격리가 MainActor입니다. `@MainActor` 표시가 붙은 함수·타입은 메인 스레드에서 실행되는 게 보장돼요.

UI 갱신 코드에 `DispatchQueue.main.async`를 감으로 뿌리던 시절과 다릅니다. "이건 메인에서만"이라는 요구가 타입 시스템에 선언되고 컴파일러가 검사합니다.

UIViewController와 SwiftUI View는 이미 @MainActor로 선언되어 있습니다. 뷰 코드 안에서는 자동으로 메인 격리를 받고요.

반대로 아무 격리 표시가 없는 async 함수는 특정 액터에 속하지 않고(nonisolated), 협력 풀 어딘가에서 실행됩니다.

무거운 계산을 메인에서 떼어내고 싶다면 "백그라운드 스레드로 보내는" 코드를 쓸 일이 아닙니다. 그 작업이 MainActor 격리에 속하지 않게 선언하는 게 Swift식 사고입니다.

필요하면 Task로 새 비동기 맥락을 열고요(Task의 구조적 사용법은 이 연작 4편에서 다룹니다).

기존 콜백 API와의 다리도 언어가 제공합니다. withCheckedThrowingContinuation으로 콜백 API를 async 함수로 감쌀 수 있어요.

continuation의 resume을 정확히 한 번 부르는 게 계약이고, "Checked" 버전은 그 계약 위반을 런타임이 감지해줍니다. 레거시 SDK를 안고 사는 실무에서 가장 먼저 손에 익혀둘 브리징 도구입니다.

## 순차 await의 함정 — 동시성은 공짜가 아니다

위의 loadProfile 코드에는 사실 성능 함정이 하나 있습니다. fetchUser와 무관한 다른 요청이라면 어떨까요.

```swift
// 순차: 아바타는 배너가 끝나야 시작됨 (총 2초)
let avatar = try await fetchAvatar()   // 1초
let banner = try await fetchBanner()   // 1초
```

await는 "여기서 기다린다"는 뜻이라, 이렇게 쓰면 두 요청이 직렬로 늘어섭니다. 서로 의존이 없는 작업이라면 async let으로 동시에 출발시키는 게 맞습니다.

```swift
// 동시: 두 요청이 같이 달림 (총 1초)
async let avatar = fetchAvatar()
async let banner = fetchBanner()
let profile = try await Profile(avatar: avatar, banner: banner)
```

async/await가 자동으로 병렬화해주는 게 아닙니다. 순차와 동시를 고르는 건 여전히 설계자의 일이라는 걸 보여주는 예예요.

다만 그 선택이 콜백 조합이 아니라 문법 한 줄 차이가 됐다는 게 발전이죠. async let과 TaskGroup의 체계적인 사용법은 구조적 동시성 편에서 제대로 다룹니다.

<figure>
  <img src="/assets/images/posts/17c93232-c3fd-4d3b-867a-e93af7bc893f/swift-async-await-suspension-3.jpg" alt="순차 await 2초와 async let 1초를 대비한 타이밍 다이어그램" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>await는 자동 병렬화가 아닙니다, 독립 작업은 async let으로</figcaption>
</figure>

## 정리

- 콜백의 진짜 문제는 들여쓰기가 아니라 컴파일러의 실명이었습니다. async/await는 반환·에러 전파를 언어의 관할로 되돌려 컴파일러의 검사를 복원합니다.
- await에서 멈추는 건 함수지 스레드가 아닙니다. 함수 상태는 힙에 저장되고 스레드는 반납되며, 재개 시 같은 스레드라는 보장이 없습니다.
- 런타임은 협력형 스레드 풀입니다. 그래서 협력 풀 안에서의 블로킹(세마포어, sleep)은 금지입니다.
- "어느 스레드"가 아니라 "어느 격리"를 묻습니다. UI는 @MainActor 선언으로 보장받고, 콜백 API는 continuation으로 감쌉니다.
- await는 자동 병렬화가 아닙니다. 독립 작업은 async let으로 동시 출발시킵니다.

다음 편은 이 연작의 핵심, actor입니다. 데이터 레이스가 정확히 뭔지, actor가 어떻게 그걸 컴파일 타임 개념으로 끌어올리는지, 그리고 악명 높은 reentrancy 함정까지 다룹니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [델리게이트(Delegate) vs 클로저(Closure), 콜백 선택 기준 3가지](/%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8Delegate-vs-%ED%81%B4%EB%A1%9C%EC%A0%80Closure-%EC%BD%9C%EB%B0%B1-%EC%84%A0%ED%83%9D-%EA%B8%B0%EC%A4%80-3%EA%B0%80%EC%A7%80/)
<!-- /RELATED-POSTS -->
