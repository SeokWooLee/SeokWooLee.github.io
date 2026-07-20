---
title: "Objective-C 골뱅이(@) 문법, 왜 전부 @로 시작할까? (완벽 정리)"
description: "Objective-C 코드를 처음 열어보면 제일 먼저 눈에 걸리는 게 있어요."
header:
  og_image: /assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png
categories:
  - iOS
tags:
  - Objective-C
  - 오브젝티브C
  - 프로그래밍기초
  - iOS개발
permalink: /Objective-C-골뱅이-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

Objective-C 코드를 처음 열어보면 제일 먼저 눈에 걸리는 게 있어요.

바로 여기저기 붙어 있는 골뱅이(@)입니다.

@interface, @property, 심지어 문자열까지 @"Hello" 이렇게 쓰는데요. 처음 보면 "이거 오타 아니야?" 싶을 수 있어요.

그런데 이 @에는 아주 명확한 이유가 있습니다.

> Objective-C의 @는 컴파일러에게 "여기서부터는 순수 C가 아니라 Objective-C 확장 문법이에요"라고 알려주는 신호예요.

오늘은 왜 이 골뱅이가 @interface에도, @property에도, @"문자열"에도 똑같이 붙는지, 그 원리를 편하게 풀어드릴게요.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png" alt="Objective-C 골뱅이(@) 문법, 알고 보면 규칙은 하나예요">
  <figcaption>Objective-C 골뱅이(@) 문법, 알고 보면 규칙은 하나예요</figcaption>
</figure>

---

## Objective-C @는 도대체 뭔가요?

핵심부터 말씀드릴게요.

@는 "이건 Objective-C만의 문법이다"라고 컴파일러에게 표시하는 특별한 기호예요.

이걸 이해하려면 Objective-C의 태생을 알아야 해요.

Objective-C는 완전히 새로운 언어가 아니에요. C언어 위에 객체지향 기능을 얹은 언어입니다.

즉 C언어를 100% 그대로 포함하면서 거기에 클래스나 메시지 같은 기능만 추가로 붙인 구조예요.

그런데 여기서 문제가 하나 생깁니다.

컴파일러 입장에서 어디까지가 원래 C 문법이고 어디부터가 새로 추가한 Objective-C 문법인지 구분을 해야 하거든요.

그 구분선을 그어주는 표시가 바로 @였던 거죠.

---

## 왜 하필 골뱅이(@) 기호였을까?

별표(*)도 있고 샵(#)도 있는데 왜 굳이 @였을까요?

답은 의외로 실용적이에요.

C언어 표준 문법에서 @ 기호는 아무 데도 안 쓰이거든요.

C에서 쓰는 글자를 한번 떠올려 볼게요.

- 변수·함수 이름: 영문자, 숫자, 밑줄(_)
- 연산자: +, -, *, /, =, & 등
- 전처리기: # (예: #include)

이 목록 어디에도 @는 없어요.

그래서 Objective-C를 만든 사람들이 @를 가져다 쓴 거예요. 기존 C 코드와 절대 충돌하지 않는 안전한 기호였으니까요.

만약 @ 대신 그냥 interface라는 단어를 키워드로 썼다면, interface라는 이름의 변수를 쓰던 기존 C 코드가 몽땅 깨졌을 거예요.

@를 앞에 붙이니 그런 충돌이 원천 차단됩니다.

쉽게 비유하면, @는 Objective-C 전용 문법들을 모아두는 별도의 서랍 손잡이 같은 거예요.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/2.png" alt="C에서 온 것과 Objective-C가 얹은 것, @가 그 경계선입니다">
  <figcaption>C에서 온 것과 Objective-C가 얹은 것, @가 그 경계선입니다</figcaption>
</figure>

---

## @interface·@property·@"문자열"이 전부 @인 이유

이제 본론이에요. 성격이 달라 보이는 이 셋이 왜 똑같이 @로 시작하는지 짚어드릴게요.

결론부터 말하면, 세 가지 모두 "C에는 없는 Objective-C만의 기능"이라서 그래요.

하나씩 볼게요.

**@interface** — 클래스의 뼈대(선언)를 여는 지시어예요. C에는 클래스라는 개념 자체가 없으니 @로 표시해야 했죠. 짝꿍인 @implementation, @end도 같은 이유예요.

**@property** — 객체의 속성을 자동으로 만들어주는 기능이에요. 이것도 순수 C에는 없는 문법이라 @가 붙습니다.

**@"문자열"** — 이게 제일 재밌어요. 따옴표만 쓴 "Hello"와 @"Hello"는 완전히 다른 물건이거든요.

표로 비교해 볼게요.

| 구분 | "Hello" | @"Hello" |
|------|---------|----------|
| 정체 | C 스타일 문자 배열 | NSString 객체 |
| 소속 | 원래 C 문법 | Objective-C 확장 |
| 기능 | 단순 글자 나열 | length 등 메서드 사용 가능 |

따옴표 앞에 @ 하나만 붙이면, 단순한 글자 덩어리가 아니라 "객체"로 바뀌어요.

그래서 @가 필요한 거예요. "이 문자열은 그냥 C 문자열이 아니라 NSString 객체로 만들어줘"라는 주문인 셈이죠.

정리하면 이렇습니다.

> @interface든 @property든 @"문자열"이든, 전부 "C에는 없고 Objective-C에만 있는 기능"이라서 같은 @ 표시를 달고 있는 거예요.

---

## 코드로 한눈에 보기

말로만 들으면 좀 추상적일 수 있어서, 짧은 예시를 준비했어요.

아래는 간단한 클래스 선언 모습이에요. @가 어떻게 Objective-C 문법을 감싸는지 보시면 됩니다.

```objectivec
@interface Person : NSObject   // 클래스 선언 시작 (C엔 없는 문법)
@property NSString *name;      // 속성 자동 생성
@end                           // 선언 끝

NSString *greeting = @"안녕하세요"; // 따옴표 앞 @ → NSString 객체
```

보시면 @로 시작하는 줄은 전부 Objective-C가 새로 더한 기능이에요.

반대로 @가 없는 부분은 C언어에서 그대로 가져온 문법이고요.

이렇게 @ 유무만 봐도 "아, 이건 Objective-C 확장이구나" 하고 눈으로 바로 구분이 됩니다.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/3.png" alt="@만 눈에 들어와도 코드 읽기가 한결 수월해집니다">
  <figcaption>@만 눈에 들어와도 코드 읽기가 한결 수월해집니다</figcaption>
</figure>

---

## 자주 묻는 질문 (Q&A)

**Q. @는 전처리기 #과 같은 건가요?**

아니에요. #include의 #은 컴파일 전에 처리되는 전처리기 지시어예요. 반면 @는 컴파일러가 직접 해석하는 Objective-C 컴파일러 지시어(directive)라서 역할이 다릅니다.

**Q. @ 종류가 이것 말고도 많나요?**

네, 꽤 있어요. @protocol, @selector, @try/@catch, @autoreleasepool처럼 다양해요. 최신 문법에선 @[] 배열, @{} 딕셔너리, @42 숫자 객체까지 @로 간단히 만들 수 있습니다.

**Q. 스위프트(Swift)에도 @가 있던데요?**

맞아요. 다만 의미가 조금 달라요. Swift의 @는 @State, @IBOutlet처럼 주로 속성(어트리뷰트) 표시에 쓰여요. 뿌리는 비슷하지만 쓰임새는 구분해서 보시면 됩니다.

---

코드마다 붙은 골뱅이가 낯설게 느껴질 수 있지만, "C와 Objective-C를 나누는 경계선"이라는 걸 알고 나면 오히려 반갑게 보여요.

@만 따라가도 어디부터가 객체지향 문법인지 딱 보이니까요. Objective-C 코드 읽으실 때 이 관점 하나만 기억하시면 훨씬 수월하실 거예요. 오늘도 즐거운 코딩 되세요!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Objective-C 메모리 관리 역사: MRC에서 ARC까지 총정리](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Objective-C 역사 총정리, 잡스가 사랑한 언어 이야기 (NS 접두어 유래까지)](/Objective-C-%EC%97%AD%EC%82%AC/)
- [Objective-C id 타입 완전정복 (동적 타이핑·덕 타이핑 총정리)](/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
