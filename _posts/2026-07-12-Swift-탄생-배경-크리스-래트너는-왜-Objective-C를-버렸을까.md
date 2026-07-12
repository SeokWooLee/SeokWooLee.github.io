---
title: "Swift 탄생 배경, 크리스 래트너는 왜 Objective-C를 버렸을까"
description: "iOS 개발을 시작하면 누구나 한 번쯤 궁금해합니다. \"애플은 잘 쓰던 Objective-C 놔두고 왜 굳이 Swift를 새로 만들었을까?\" 하고요."
header:
  og_image: /assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png
tags:
  - Swift
  - 스위프트
  - 크리스래트너
  - ObjectiveC
  - iOS개발
  - 프로그래밍언어
  - 애플개발
  - Swift탄생배경
  - 옵셔널
  - 개발공부
permalink: /Swift-탄생-배경-크리스-래트너는-왜-Objective-C를-버렸을까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 **한국어** · [English](/en/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [日本語](/ja/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [中文](/zh/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
{: .notice--info}

iOS 개발을 시작하면 누구나 한 번쯤 궁금해합니다. "애플은 잘 쓰던 Objective-C 놔두고 왜 굳이 Swift를 새로 만들었을까?" 하고요.

저도 Swift로 첫 앱을 만들면서 문법이 참 깔끔하다 싶었는데, 그 뒤에 어떤 이야기가 있는지 파고들다 보니 꽤 재미있는 사연이 있더라고요.

결론부터 말씀드리면, Swift는 **크리스 래트너(Chris Lattner)라는 한 엔지니어가 2010년부터 거의 혼자 비밀리에 만들기 시작한 언어**입니다. 30년 넘게 거의 그대로였던 Objective-C의 안전성 문제를 근본부터 뜯어고치기 위해서였죠.

오늘은 이 Swift가 어떻게 세상에 나왔는지, 그 배경을 편하게 풀어보겠습니다.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="30년 묵은 Objective-C를 Swift가 밀어낸 이유, 한 장으로 정리해봤어요">
  <figcaption>30년 묵은 Objective-C를 Swift가 밀어낸 이유, 한 장으로 정리해봤어요</figcaption>
</figure>

---

## Swift는 언제, 누가 만들었나요?

Swift 개발은 **2010년 7월**에 시작됐습니다.

주인공은 크리스 래트너. 이 사람 이름이 낯설 수 있는데, 사실 개발자라면 이미 그의 작품을 매일 쓰고 있습니다.

바로 **LLVM**과 **Clang** 컴파일러를 만든 사람이거든요. 애플의 개발 도구 밑바닥을 떠받치는 핵심 기술들이죠.

초기에는 정말 래트너 혼자만의 프로젝트였다고 합니다. 그가 퇴근 후, 주말에 짬을 내 조용히 설계를 다듬었다는 이야기가 유명해요.

2011년 무렵부터 애플 내부의 다른 엔지니어들이 합류하면서 본격적인 팀 프로젝트로 커졌습니다.

그리고 마침내 **2014년 6월 WWDC**에서 세상에 공개됐죠. 그날 현장에 있던 개발자들이 깜짝 놀랐다는 반응이 지금도 회자됩니다. 아무도 예상하지 못한 발표였거든요.

같은 해 9월, Xcode 6와 함께 정식 배포되면서 누구나 쓸 수 있게 됐습니다.

---

## 크리스 래트너는 왜 Objective-C를 대체했을까?

가장 큰 이유는 딱 하나예요.

> Objective-C는 1980년대 초에 설계된 언어라 현대적인 안전장치가 부족했습니다.

Objective-C는 쉽게 말하면 'C 언어에 메시지 전달 기능을 얹은' 구조입니다. C의 유연함을 그대로 물려받았는데, 그 유연함이 곧 위험함이기도 했어요.

대표적인 게 **nil(빈 값) 처리** 문제입니다.

Objective-C에서는 nil 객체에 메시지를 보내도 앱이 안 죽어요. 그냥 아무 일도 안 일어납니다.

언뜻 편해 보이지만 이게 함정입니다. 값이 없어서 생긴 버그가 조용히 묻혀버리니까요. 나중에 엉뚱한 곳에서 터지는 겁니다.

래트너는 이미 LLVM과 Clang을 만들며 Objective-C의 메모리 안전성을 붙들고 오랫동안 씨름했습니다. 그러다 이런 결론에 도달했다고 해요.

"기존 언어를 계속 땜질할 게 아니라, 애초에 실수를 못 하게 막는 언어를 새로 만들자."

실수를 잡아주는 걸 넘어 아예 실수 자체가 불가능하게 만들겠다는 발상이었죠.

---

## Swift는 뭐가 어떻게 달라졌나요?

Swift가 가져온 변화 중 가장 상징적인 게 바로 **옵셔널(Optional)** 개념입니다.

"이 값은 비어 있을 수도 있다"는 걸 문법 차원에서 강제로 표시하게 만든 거예요. 개발자가 값이 없는 상황을 반드시 처리하도록요.

아래 코드를 보면 두 언어의 철학 차이가 확 드러납니다.

먼저 Objective-C는 nil이어도 그냥 넘어갑니다.

```objc
// name이 nil이면? 아무 일도 안 일어나고 조용히 넘어감
NSString *name = [user fetchName];
NSUInteger len = [name length];  // 결과는 0, 버그를 놓치기 쉬움
```

반면 Swift는 값이 없을 가능성을 개발자에게 대놓고 물어봅니다.

```swift
// name은 String? 타입 — 값이 없을 수 있음을 타입이 명시
let name: String? = user.fetchName()
if let name = name {   // 값이 있을 때만 안전하게 사용
    print(name.count)
}
```

짧은 코드지만 '실수를 방치하느냐 vs 실수를 막느냐'의 차이가 그대로 보이죠.

이 외에도 Swift는 타입 추론, 간결한 문법, 빠른 실행 속도까지 챙기면서 인기를 얻었습니다. 참고로 Swift는 Objective-C뿐 아니라 Rust, Haskell, Python, Ruby 등 여러 언어의 좋은 점을 참고해 설계됐다고 해요.

---

## Swift는 그 뒤로 어떻게 됐을까?

Swift는 발표 이후 빠르게 자리를 잡았습니다.

주요 흐름을 간단히 정리하면 이렇습니다.

| 시점 | 사건 |
|------|------|
| 2010년 7월 | 크리스 래트너, 개발 시작 |
| 2014년 6월 | WWDC에서 공식 발표 |
| 2014년 9월 | Xcode 6와 함께 정식 배포 |
| 2015년 12월 | 오픈소스로 공개 (Apache 2.0) |
| 2017년 1월 | 래트너, 애플을 떠나 테슬라로 이직 |

흥미로운 건, 정작 언어의 아버지인 래트너는 2017년 애플을 떠났다는 점입니다. 이후 Swift 프로젝트 리드는 테드 크레메넥이 이어받았죠.

그럼에도 Swift는 지금까지 애플 생태계의 중심 언어로 굳건히 자리 잡고 있습니다. 오픈소스가 되면서 리눅스, 서버 사이드로도 영역을 넓혔고요.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="래트너가 떠난 뒤에도 Swift는 계속 자라고 있어요">
  <figcaption>래트너가 떠난 뒤에도 Swift는 계속 자라고 있어요</figcaption>
</figure>

---

한 엔지니어가 주말에 조용히 시작한 프로젝트가, 10년 넘게 전 세계 개발자들이 쓰는 언어가 됐다는 사실이 저는 참 인상 깊었습니다.

"왜?"라는 질문 하나에서 출발한 언어라, 배경을 알고 나면 Swift 문법 하나하나가 다르게 보이더라고요.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="배경을 알고 다시 보면 코드 한 줄이 다르게 읽힙니다">
  <figcaption>배경을 알고 다시 보면 코드 한 줄이 다르게 읽힙니다</figcaption>
</figure>

Swift를 이제 막 시작하셨다면, 옵셔널 하나만 제대로 이해해도 이 언어가 왜 이렇게 설계됐는지 감이 오실 거예요. 오늘 글이 그 첫 단추가 되면 좋겠습니다.

---

## 참고 자료

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_%28programming_language%29)
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Objective-C 메모리 관리 역사: MRC에서 ARC까지 총정리](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Objective-C nil vs Java null 비교, 왜 다르게 동작할까](/Objective-C-nil/)
- [Objective-C 대괄호 문법, 왜 이렇게 생겼을까? (메시지 전송의 비밀)](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/)
<!-- /RELATED-POSTS -->
