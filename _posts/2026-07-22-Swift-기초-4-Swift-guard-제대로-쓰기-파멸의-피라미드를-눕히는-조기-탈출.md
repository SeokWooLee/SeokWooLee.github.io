---
title: "[Swift 기초 #4] Swift guard 제대로 쓰기, 파멸의 피라미드를 눕히는 조기 탈출"
description: "코드 리뷰에서 자주 오가는 지적 중 하나가 \"이거 guard로 바꾸죠\"입니다. if로도 똑같이 동작하는 코드인데 왜 굳이 바꾸자는 걸까요. 취향 문제 같지만, 사실 guard는 Swift가 언어 차원에서 특정 코드 스타일을 밀어주기 위해 만든 문법입니다. 조기 탈출(early…"
header:
  og_image: /assets/images/posts/eb18b3e1-ed72-4816-890a-2865806e1441/1.png
tags:
  - Swift
  - 스위프트
  - guard
  - guardlet
permalink: /Swift-기초-4-Swift-guard-제대로-쓰기-파멸의-피라미드를-눕히는-조기-탈출/
toc: true
toc_sticky: true
last_modified_at: 2026-07-22
---

코드 리뷰에서 자주 오가는 지적 중 하나가 "이거 guard로 바꾸죠"입니다. if로도 똑같이 동작하는 코드인데 왜 굳이 바꾸자는 걸까요. 취향 문제 같지만, 사실 guard는 Swift가 언어 차원에서 특정 코드 스타일을 밀어주기 위해 만든 문법입니다. 조기 탈출(early exit), 그리고 왼쪽 정렬된 행복 경로(happy path)라는 스타일이에요.

Swift 기초 시리즈 4편입니다. 옵셔널 편에서 guard let을 언래핑 도구로 잠깐 소개했는데, 이번에는 guard 자체를 파봅니다. if와 뭐가 다른지, 컴파일러가 뭘 보장해주는지, 그리고 언제 guard가 아니라 if가 맞는지까지.

<figure>
  <img src="/assets/images/posts/eb18b3e1-ed72-4816-890a-2865806e1441/1.png" alt="피라미드를 눕혀 평평한 행복 경로로 만드는 게 guard입니다">
  <figcaption>피라미드를 눕혀 평평한 행복 경로로 만드는 게 guard입니다</figcaption>
</figure>

## 문제의 풍경 — 파멸의 피라미드

guard가 없던 시절의 코드를 먼저 보겠습니다. 회원 가입 처리 함수라고 하면, 검사할 게 많습니다. 입력이 nil이 아닌지, 형식이 맞는지, 약관에 동의했는지.

```swift
func signUp(email: String?, password: String?, agreed: Bool) {
    if let email = email {
        if isValidEmail(email) {
            if let password = password {
                if password.count >= 8 {
                    if agreed {
                        // 진짜 하고 싶었던 일
                        createAccount(email, password)
                    } else {
                        showError("약관 동의가 필요합니다")
                    }
                } else {
                    showError("비밀번호가 짧습니다")
                }
            } else {
                showError("비밀번호를 입력하세요")
            }
        } else {
            showError("이메일 형식이 아닙니다")
        }
    } else {
        showError("이메일을 입력하세요")
    }
}
```

들여쓰기가 다섯 겹입니다. 이런 모양을 파멸의 피라미드(pyramid of doom)라고 부르는데, 모양만 흉한 게 아니라 실질적인 독해 비용이 있습니다. 함수의 본론(createAccount)이 가장 깊은 곳에 파묻혀 있고, 각 검사의 실패 처리(else)는 해당 조건에서 화면상 멀리 떨어져 있어요. "비밀번호가 짧으면 어떻게 되지?"에 답하려면 눈으로 괄호 짝을 맞춰가며 스크롤해야 합니다.

## guard의 답 — 실패를 먼저, 본론은 평지에

같은 함수를 guard로 다시 쓰면 이렇게 됩니다.

```swift
func signUp(email: String?, password: String?, agreed: Bool) {
    guard let email, isValidEmail(email) else {
        return showError("이메일을 확인하세요")
    }
    guard let password, password.count >= 8 else {
        return showError("비밀번호를 확인하세요 (8자 이상)")
    }
    guard agreed else {
        return showError("약관 동의가 필요합니다")
    }

    createAccount(email, password)
}
```

구조가 뒤집혔습니다. 각 조건과 그 실패 처리가 한 덩어리로 붙어 있고 모든 검문을 통과한 본론은 들여쓰기 없이 함수 바닥에 평평하게 놓입니다. 읽는 사람의 시선은 위에서 아래로 한 번만 흐르면 돼요. "전제 조건들, 그리고 본론"이라는 함수의 논리 구조가 코드의 시각 구조와 일치하게 된 겁니다.

이 스타일의 이점을 흔히 행복 경로의 왼쪽 정렬이라고 부릅니다. 정상 흐름은 항상 들여쓰기 0단에 있고 예외 상황만 블록 안으로 들어간다는 규칙이죠. 함수가 길어져도 "왼쪽 끝만 따라 읽으면 정상 시나리오가 보인다"는 일관성이 생깁니다.

<figure>
  <img src="/assets/images/posts/eb18b3e1-ed72-4816-890a-2865806e1441/2.png" alt="검문소를 통과하면 본론은 들여쓰기 없는 평지에 놓입니다" loading="lazy">
  <figcaption>검문소를 통과하면 본론은 들여쓰기 없는 평지에 놓입니다</figcaption>
</figure>

## if와의 진짜 차이 — 컴파일러가 강제하는 두 가지

"if로도 조기 탈출을 할 수 있지 않나?"라는 질문이 나올 차례입니다. 맞아요. `if email == nil { return }`처럼 쓰면 됩니다. 하지만 guard는 if의 뒤집기 그 이상으로, 컴파일러가 강제하는 보장이 두 가지 있습니다.

**첫째, else 블록은 반드시 스코프를 벗어나야 합니다.** guard의 else 안에서는 return, throw, continue, break, fatalError 중 하나로 현재 스코프를 탈출해야 하고, 안 하면 컴파일 에러입니다. if 문으로 검사를 짜면 "조건 확인만 하고 return을 깜빡"하는 실수가 가능하지만 guard에서는 그 실수가 컴파일 타임에 잡혀요. "이 지점을 통과했다면 조건이 참이다"라는 문장이 관습이 아니라 보장이 되는 겁니다.

**둘째, 언래핑된 값이 guard 아래 전체에서 살아 있습니다.** if let의 바인딩은 if 블록 안에서만 유효하지만 guard let의 바인딩은 guard 문 이후의 나머지 스코프 전체에서 씁니다. 검문소를 통과시킨 값을 함수 끝까지 들고 가는 구조라, "언래핑 따로, 사용 따로"의 어색함이 없습니다.

이 두 보장이 합쳐지면 guard는 문서 역할을 하게 됩니다. 함수 첫머리의 guard 뭉치는 "이 함수의 전제 조건 목록"을 선언하는 자리예요. 시그니처만으로 부족한 계약을 본문 첫 줄에서 읽을 수 있게 됩니다.

## guard가 아니라 if가 맞는 자리

그럼 모든 if를 guard로 바꿔야 할까요. 아닙니다. 구분 기준은 명확해요. guard는 "이게 아니면 더 진행할 수 없다"는 전제 조건에 쓰고, if는 "이 경우엔 이렇게, 저 경우엔 저렇게"라는 분기에 씁니다.

```swift
// if가 맞는 자리 — 두 경로 모두 정상 흐름
if user.isPremium {
    showPremiumBadge()
} else {
    showUpgradeButton()
}
```

프리미엄이 아닌 게 실패가 아니잖아요. 두 갈래 모두 계속 진행되는 정상 시나리오면 if입니다. 이걸 guard로 쓰면 오히려 "프리미엄이 아니면 비정상"이라는 잘못된 신호를 줍니다.

반대로 점검 항목이 실패 시 함수를 끝내는 종류라면, 개수가 하나여도 guard가 맞습니다. 문법 선택이 곧 의미 전달인 셈이죠. 읽는 사람은 guard를 보는 순간 "아, 전제 조건이구나"를, if를 보는 순간 "분기구나"를 기대하니까, 그 기대에 맞춰주는 게 가독성의 실체입니다.

한 가지 안티패턴도 짚어둡니다. guard else 블록에 로직을 채우는 경우인데, else 안에서 복구 시도, 상태 변경, 긴 처리를 하기 시작하면 guard의 "실패는 짧게 끝낸다"는 약속이 깨집니다. else 블록이 세 줄을 넘어가면 설계를 다시 보라는 신호로 삼는 게 좋아요. 실패 처리가 그만큼 복잡하다면 그건 전제 조건이 아니라 별도의 분기이거나, 에러를 던져 호출자에게 넘길 일입니다.

<figure>
  <img src="/assets/images/posts/eb18b3e1-ed72-4816-890a-2865806e1441/3.png" alt="전제 조건이면 guard, 둘 다 정상 경로면 if" loading="lazy">
  <figcaption>전제 조건이면 guard, 둘 다 정상 경로면 if</figcaption>
</figure>

## 반복문과 비동기 코드에서의 guard

guard는 함수 밖에서도 씁니다. 반복문 안에서는 continue와 짝을 이뤄 "이번 항목은 건너뛰기"를 표현합니다.

```swift
for item in items {
    guard item.isValid else { continue }
    guard let url = item.downloadURL else { continue }
    process(url)
}
```

필터링 조건이 여럿일 때 for 본문이 평평하게 유지되는 게 장점입니다. 물론 조건이 단순하면 `for item in items where item.isValid`나 compactMap이 더 간결할 수 있어요. where절 한 개로 끝나면 where, 언래핑이 섞이고 조건이 여러 단계면 guard가 편합니다.

비동기 코드에서는 클로저 편에서 본 [weak self]와의 조합이 사실상 관용구입니다.

```swift
fetchData { [weak self] data in
    guard let self else { return }
    self.update(with: data)
}
```

"self가 이미 해제됐다면 아무것도 하지 않는다"는 전제 조건을 첫 줄에서 처리하고 나머지 코드는 self가 확보된 평지에서 진행하는 구조입니다. guard의 조기 탈출 철학이 메모리 관리와 만나는 지점이에요.

## 정리

- guard는 조기 탈출을 언어 차원에서 지원하는 문법으로, 파멸의 피라미드를 "전제 조건 나열 + 평평한 본론" 구조로 뒤집습니다.
- if와의 차이는 컴파일러 보장입니다. else는 반드시 스코프를 탈출해야 하고, 바인딩은 이후 스코프 전체에서 유효합니다.
- 선택 기준: 실패하면 진행 불가인 전제 조건은 guard, 양쪽 다 정상인 분기는 if. 문법 선택 자체가 의미 전달입니다.
- else 블록이 길어지면 guard를 잘못 쓰고 있다는 신호입니다. 실패 처리가 복잡하면 분기나 에러 던지기로 풀어야 합니다.

마지막 문장에서 "에러를 던진다"는 말이 나왔죠. 다음 편이 바로 그 이야기입니다. throws, do-catch, try의 세 변형, 그리고 Result까지, Swift 에러 처리의 전체 지도를 그립니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 데코레이터 패턴, 상속 없이 기능 겹겹이 입히는 법 (예제·실전 총정리)](/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 기초 #5] Swift 에러 처리 전체 지도, throws·try?·try!·Result 언제 뭘 쓸까](/Swift-%EA%B8%B0%EC%B4%88-5-Swift-%EC%97%90%EB%9F%AC-%EC%B2%98%EB%A6%AC-%EC%A0%84%EC%B2%B4-%EC%A7%80%EB%8F%84-throwstrytryResult-%EC%96%B8%EC%A0%9C-%EB%AD%98-%EC%93%B8%EA%B9%8C/)
- [[Swift 기초 #6] Swift 문자열은 왜 text[0]이 안 될까? 그래핌 클러스터(Grapheme Cluster) 총정리](/Swift-%EA%B8%B0%EC%B4%88-6-Swift-%EB%AC%B8%EC%9E%90%EC%97%B4%EC%9D%80-%EC%99%9C-text0%EC%9D%B4-%EC%95%88-%EB%90%A0%EA%B9%8C-%EA%B7%B8%EB%9E%98%ED%95%8C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0Grapheme-Cluster-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
