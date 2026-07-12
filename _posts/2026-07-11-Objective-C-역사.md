---
title: "Objective-C 역사 총정리, 잡스가 사랑한 언어 이야기 (NS 접두어 유래까지)"
description: "iOS 개발 공부를 시작하면 꼭 한 번 마주치는 언어가 있어요. 대괄호가 잔뜩 들어간 낯선 문법, NSString 같은 알 수 없는 접두어."
header:
  og_image: /assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png
categories:
  - iOS
tags:
  - ObjectiveC
  - 오브젝티브C
  - 프로그래밍언어
  - iOS개발
  - 애플
  - Swift
  - 스티브잡스
  - NS접두어
  - 개발공부
  - 코딩역사
permalink: /Objective-C-역사/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 **한국어** · [English](/en/Objective-C-%EC%97%AD%EC%82%AC/) · [日本語](/ja/Objective-C-%EC%97%AD%EC%82%AC/) · [中文](/zh/Objective-C-%EC%97%AD%EC%82%AC/)
{: .notice--info}

iOS 개발 공부를 시작하면 꼭 한 번 마주치는 언어가 있어요. 대괄호가 잔뜩 들어간 낯선 문법, `NSString` 같은 알 수 없는 접두어.

바로 Objective-C인데요.

저도 처음 레거시 코드에서 이 언어를 만났을 때 "이건 대체 어디서 온 문법이지?" 싶었거든요. 그런데 역사를 알고 나니 코드가 다르게 보이더라고요.

먼저 핵심부터 말씀드리면, Objective-C는 1980년대 초 C 언어에 Smalltalk의 객체 개념을 얹어 만든 언어예요.

그리고 그 유명한 NS 접두어는 스티브 잡스가 세운 회사 NeXT의 운영체제 NeXTSTEP에서 온 거고요.

이 글에서 얻어가실 내용은 이렇습니다.

1. Objective-C의 탄생 배경 (C + Smalltalk)
2. NS 접두어의 유래와 기술적 이유
3. 아이폰과 함께 온 전성기
4. Swift 시대에도 살아남은 이유

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="1983년부터 아이폰까지, Objective-C 역사가 한 줄로 이어집니다">
  <figcaption>1983년부터 아이폰까지, Objective-C 역사가 한 줄로 이어집니다</figcaption>
</figure>

---

## Objective-C는 어떻게 태어났을까요?

1980년대 초, Brad Cox와 Tom Love라는 두 엔지니어가 있었어요. 이들이 원한 건 두 가지였습니다.

- C 언어: 빠르지만 객체지향 개념이 없음
- Smalltalk: 우아한 객체지향 언어지만 너무 느림

그래서 내놓은 답이 Objective-C예요. C 위에 아주 얇은 객체지향 레이어를 얹되, C는 하나도 건드리지 않는다는 원칙이었죠.

> Objective-C는 C의 엄격한 superset(상위집합)입니다.
>
> 세상의 모든 C 코드는 수정 없이 그대로 유효한 Objective-C 코드예요.

실제로 어떤 모습인지 짧은 코드로 보여드릴게요.

```objc
// 평범한 C 코드 — 그대로 유효한 Objective-C 코드이기도 합니다
int sum = 1 + 2;

// Objective-C가 얹은 것: Smalltalk식 메시지 전송 (대괄호)
NSString *text = [NSString stringWithFormat:@"합계 %d", sum];
```

위쪽 두 줄은 C 문법 그대로이고, 아래 대괄호 한 줄이 Objective-C가 새로 얹은 전부예요.

몸은 C에서, 영혼(객체 모델과 메시지 전송)은 Smalltalk에서 온 셈이에요. 대괄호 문법 `[receiver message]`가 바로 Smalltalk에서 가져온 유산이고요.

C++과 거의 같은 시기에, 같은 재료(C + 객체지향)로 완전히 다른 요리를 만든 거라고 보시면 됩니다.

---

## NS 접두어는 무슨 뜻일까요?

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="NS 접두어의 정체는 이 NeXT 시절에 있었어요">
  <figcaption>NS 접두어의 정체는 이 NeXT 시절에 있었어요</figcaption>
</figure>

1985년 스티브 잡스는 자신이 세운 애플에서 쫓겨나요.

그리고 NeXT라는 회사를 세우는데, 이 회사 운영체제 NeXTSTEP의 공식 개발 언어가 바로 Objective-C였습니다.

`NSString`, `NSArray`의 NS는 바로 이 **NeXTSTEP의 약자**예요. 2026년 최신 아이폰 앱 코드에도 1980년대 말 잡스의 회사 이름이 화석처럼 박혀 있는 거죠.

그런데 왜 굳이 접두어를 붙였을까요? 기술적인 이유가 있어요.

- Objective-C에는 네임스페이스(namespace)가 없음
- 클래스 이름이 전역에서 유일해야 해서, 같은 이름이 만나면 충돌
- 그래서 회사·프로젝트 이니셜을 붙이는 관례가 생김 (애플은 NS, AFNetworking은 AF)

애플은 "2글자 접두어는 애플 예약, 서드파티는 3글자를 쓰라"고 공식 안내까지 했어요. 언어의 구멍을 문화로 메운 사례인 셈이에요.

참고로 Swift는 모듈 단위 네임스페이스가 생기면서 이 관례가 필요 없어졌어요. NS 없는 `String`, `Array`가 Swift 시대의 상징이 된 이유입니다.

---

## 아이폰과 함께 온 전성기

1996년, 애플이 NeXT를 4억 달러에 인수하면서 잡스가 12년 만에 복귀해요.

NeXTSTEP은 Mac OS X의 뼈대가 됐고, Objective-C는 애플 공식 언어가 됩니다.

그리고 2008년 앱스토어가 열렸어요. 아이폰 앱을 만들 수 있는 언어는 단 하나, Objective-C뿐이었죠.

전 세계 개발자가 몰려들면서 20년 넘게 마이너였던 이 언어는 순식간에 가장 뜨거운 언어가 돼요.

언어 인기 지표인 TIOBE 인덱스 기준으로 2012년과 2014년 두 차례 '올해의 언어'로 뽑혔고, 한때 C와 Java 다음인 3위까지 올랐습니다.

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="앱스토어 초창기엔 다들 이 언어로 앱을 만들었죠">
  <figcaption>앱스토어 초창기엔 다들 이 언어로 앱을 만들었죠</figcaption>
</figure>

---

## Objective-C는 지금도 쓰일까요?

2014년 애플이 Swift를 발표하면서 Objective-C의 시대는 저무는 듯했어요. 그런데 10년이 넘게 지난 지금도 이 언어는 죽지 않았습니다. 이유는 세 가지예요.

1. **애플 시스템 프레임워크**: UIKit, Foundation의 뿌리가 여전히 Objective-C라서 Swift 코드도 브리징으로 이들과 대화해요.
2. **레거시 코드베이스**: 수백만 줄짜리 대형 앱을 하루아침에 다시 쓸 수는 없어서 유지보수 개발자 수요가 꾸준합니다.
3. **런타임의 동적 특성**: 실행 중에 메서드를 바꿔치기하는 기법(메서드 스위즐링)이 가능해서 분석 SDK들이 여전히 이 런타임에 기대요.

**Q. 지금 Objective-C를 새로 배워야 하나요?**

새 프로젝트를 이 언어로 시작할 일은 거의 없어요. 다만 iOS 개발자로 오래된 코드베이스를 다루신다면 읽을 줄 아는 정도는 큰 무기가 됩니다.

**Q. Swift만 알아도 되나요?**

신규 개발은 Swift로 충분해요. 다만 NS가 어디서 왔는지, 대괄호가 왜 생겼는지 알면 애플 프레임워크가 훨씬 잘 이해되실 거예요.

---

## 마무리

Objective-C는 죽은 언어가 아니라 은퇴를 준비하는 베테랑에 가까워요. 잡스와 함께 애플 밖에서 컸다가, 잡스와 함께 돌아와 세계에서 가장 비싼 회사의 심장이 된 언어니까요.

오래된 코드에서 `NSString`을 만나면 이제 반갑게 봐주세요. 그 두 글자에 40년 역사가 담겨 있답니다.

**참고 자료**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 모노스테이트 패턴, 싱글톤의 대안이 될 수 있을까 (실전 정리)](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Objective-C nil vs Java null 비교, 왜 다르게 동작할까](/Objective-C-nil/)
- [Objective-C 대괄호 문법, 왜 이렇게 생겼을까? (메시지 전송의 비밀)](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/)
<!-- /RELATED-POSTS -->
