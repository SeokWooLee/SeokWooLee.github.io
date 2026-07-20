---
title: "Objective-C 메모리 관리 역사: MRC에서 ARC까지 총정리"
description: "iOS 개발을 하다 보면 한 번쯤 궁금해지는 게 있어요."
header:
  og_image: /assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png
tags:
  - ObjectiveC
  - iOS개발
  - ARC
  - 프로그래밍
permalink: /Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

iOS 개발을 하다 보면 한 번쯤 궁금해지는 게 있어요.

"예전 Objective-C 코드에는 왜 `retain`, `release`가 잔뜩 적혀 있을까?"

스위프트로 입문하신 분이라면 옛날 코드를 열어보고 한 번쯤 당황하셨을 법한 풍경이죠.

오늘은 Objective-C 메모리 관리의 역사, 그러니까 MRC에서 ARC까지 어떻게 흘러왔는지 정리해 드릴게요.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="MRC에서 ARC까지, Objective-C 메모리 관리 흐름을 한눈에">
  <figcaption>MRC에서 ARC까지, Objective-C 메모리 관리 흐름을 한눈에</figcaption>
</figure>

먼저 핵심부터 말씀드리면 이렇습니다.

> Objective-C의 메모리 관리는 '개발자가 직접 세던 시대(MRC)'에서 '컴파일러가 대신 세주는 시대(ARC)'로 넘어왔습니다.

중간에 가비지 컬렉션이라는 실험도 잠깐 있었지만 결국 2011년 ARC가 등장하며 판이 정리됐어요.

아래에서 시대별로 하나씩 짚어볼게요.

---

## 참조 카운팅이 뭐길래? 메모리 관리의 기본 개념

본격적인 역사에 앞서 딱 한 가지 개념만 잡고 가겠습니다.

바로 '참조 카운트(reference count)'예요.

객체 하나마다 '나를 붙잡고 있는 사람이 몇 명인지' 세는 숫자가 붙어 있다고 생각하시면 됩니다.

이 숫자가 1 이상이면 살아 있고, 0이 되면 메모리에서 해제돼요.

그래서 객체를 붙잡을 땐 숫자를 올리고(`retain`), 놓아줄 땐 내리는(`release`) 방식이죠.

이 단순한 규칙이 Objective-C 메모리 관리의 뿌리입니다.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="숫자 하나로 생사가 갈리는 참조 카운트 흐름">
  <figcaption>숫자 하나로 생사가 갈리는 참조 카운트 흐름</figcaption>
</figure>

---

## MRC 시대: 개발자가 직접 숫자를 세던 시절

ARC 이전, 그러니까 MRC(Manual Retain Count) 시대에는 이 숫자를 사람이 손으로 관리했어요.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="retain release가 잔뜩 적힌 옛날 코드, 처음 보면 당황스럽죠">
  <figcaption>retain release가 잔뜩 적힌 옛날 코드, 처음 보면 당황스럽죠</figcaption>
</figure>

규칙은 명확했습니다. 흔히 'NARC'라는 말로 외우곤 했죠.

- **N**ew, **A**lloc, **R**etain, **C**opy로 만든 객체는 내가 책임진다
- 책임진 객체는 다 쓰면 반드시 `release` 한다

실제 코드는 이런 모습이었어요.

```objc
// 객체를 만들면 참조 카운트가 1이 됩니다
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // 카운트 2
[obj release];  // 카운트 1
[obj release];  // 카운트 0 → 메모리 해제
```

문제는 여기서 발생했습니다.

`release`를 깜빡하면 메모리가 새고(누수), 너무 일찍 해제하면 이미 사라진 객체를 건드려서 앱이 죽었어요.

이른바 '좀비 객체' 크래시죠.

지금 붙잡은 객체 카운트가 몇인지 머릿속으로 계속 세야 했으니 정말 신경 쓰이는 작업이었죠.

---

## autorelease: "지금 말고 조금 이따 놓아줄게"

MRC 시대에는 한 가지 곤란한 상황이 더 있었어요.

바로 메서드가 새 객체를 만들어서 밖으로 돌려줄 때입니다.

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"안녕하세요"];
    return msg; // 내가 alloc 했으니 release 해야 하는데... 언제?
}
```

규칙대로라면 alloc 한 쪽이 `release`를 해야 하죠.

그런데 return 하기 전에 release를 해버리면, 받는 쪽이 쓰기도 전에 객체가 사라집니다. 그렇다고 안 하자니 누수고요.

이 딜레마를 풀려고 나온 장치가 `autorelease`예요.

"지금 당장 말고, 조금 이따가 release 해줘"라고 예약을 걸어두는 겁니다.

autorelease가 걸린 객체는 '오토릴리즈 풀(autorelease pool)'이라는 대기 명단에 올라가고 풀이 비워지는 시점(보통 런 루프가 한 바퀴 돌고 끝날 때)에 한꺼번에 release를 받아요.

그래서 받는 쪽은 객체를 안전하게 넘겨받아 쓸 수 있었죠.

`[NSString stringWithFormat:]`처럼 alloc 없이 바로 받아 쓰는 편의 생성자들이 전부 이 방식으로 만들어진 객체를 돌려줬습니다.

참고로 이 오토릴리즈 풀은 ARC 시대에도 `@autoreleasepool` 블록이라는 이름으로 살아남았는데요. 반복문에서 메모리가 치솟을 때 꺼내 쓰는 실전 도구라서 이 이야기는 분량이 꽤 있어 따로 한 편으로 정리했습니다.

---

## 가비지 컬렉션은 왜 실패했을까?

애플도 이 불편함을 알고 있었어요.

그래서 2007년 Mac OS X 10.5 레퍼드에서 자바처럼 자동으로 메모리를 청소하는 '가비지 컬렉션(GC)'을 도입했습니다.

개발자가 `retain`, `release`를 안 써도 되니 편할 것 같았죠.

하지만 결과는 신통치 않았습니다.

GC가 백그라운드에서 돌면서 예측하기 어려운 순간에 앱이 잠깐 멈칫하는 문제가 있었어요. 무엇보다 성능과 배터리에 민감한 iPhone에는 부담이 컸습니다.

그러니 iOS에는 아예 도입되지 못했습니다.

결국 맥용 GC도 2012년 OS X 10.8부터 사용 중단(deprecated) 수순을 밟았어요.

---

## ARC의 등장: 컴파일러가 대신 세주다

그리고 2011년, 애플이 내놓은 해법이 바로 ARC(Automatic Reference Counting)입니다.

Xcode 4.2와 iOS 5, OS X 10.7 라이언과 함께 공개됐어요.

ARC의 발상은 영리했습니다.

> 참조 카운팅 방식은 그대로 두되, `retain`·`release`를 개발자가 아니라 컴파일러가 알아서 넣어주자.

GC처럼 런타임에 따로 청소부가 도는 게 아니라, 컴파일 시점에 딱 필요한 자리에 해제 코드가 자동으로 들어가는 방식이에요.

덕분에 런타임 성능 부담은 거의 없으면서 메모리 관리는 자동화됐습니다.

두 시대를 표로 비교하면 이렇게 정리됩니다.

| 구분 | MRC | ARC |
|------|-----|-----|
| 등장 시점 | 초기 ~ 2011년 | 2011년(iOS 5) |
| retain/release | 직접 작성 | 컴파일러 자동 삽입 |
| autorelease | 직접 호출 | 컴파일러가 관리 |
| 메모리 누수 위험 | 높음 | 크게 낮음 |
| 성능 부담 | 없음 | 거의 없음 |

다만 ARC라고 만능은 아니에요.

서로가 서로를 붙잡는 '순환 참조'는 자동으로 못 풀기 때문에, `weak`나 `unowned` 같은 약한 참조로 개발자가 끊어줘야 합니다.

이 개념은 지금 우리가 쓰는 스위프트로도 그대로 이어졌어요.

---

## 자주 묻는 질문 (Q&A)

**Q. 지금도 MRC를 배워야 하나요?**

실무에서 새로 MRC로 코드를 짤 일은 거의 없어요. 다만 오래된 라이브러리나 면접에서 개념을 물어볼 수 있으니 원리 정도는 알아두면 좋습니다.

**Q. autorelease는 ARC에서도 쓰이나요?**

직접 호출할 일은 없지만 메커니즘 자체는 ARC 아래에서 여전히 돌아가고 있어요. 그래서 `@autoreleasepool` 블록이 지금도 유효한 도구입니다.

**Q. 스위프트도 ARC를 쓰나요?**

네, 스위프트도 ARC 기반입니다. 그래서 순환 참조와 `weak` 개념이 스위프트에서도 똑같이 중요해요.

---

짧게 정리하면, Objective-C 메모리 관리는 '손으로 세던 MRC → 잠깐의 GC 실험 → 컴파일러가 세주는 ARC'로 발전해 왔습니다.

지금은 당연하게 쓰는 자동 메모리 관리도, 사실은 수많은 크래시와 시행착오 위에서 다듬어진 결과예요.

iOS 개발 공부하시는 분들께 이 흐름이 작은 지도가 되었으면 합니다. 오늘도 즐거운 코딩 되세요!

---

## 참고 자료

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Objective-C nil vs Java null 비교, 왜 다르게 동작할까](/Objective-C-nil/)
- [Swift 클래스와 구조체 차이 총정리 (값 타입·참조 타입)](/Swift-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EC%B0%A8%EC%9D%B4-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EA%B0%92-%ED%83%80%EC%9E%85%EC%B0%B8%EC%A1%B0-%ED%83%80%EC%9E%85/)
- [바이브 코딩, 코드 안 읽고 개발하면 생기는 일과 해결책 3가지](/%EB%B0%94%EC%9D%B4%EB%B8%8C-%EC%BD%94%EB%94%A9-%EC%BD%94%EB%93%9C-%EC%95%88-%EC%9D%BD%EA%B3%A0-%EA%B0%9C%EB%B0%9C%ED%95%98%EB%A9%B4-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%9D%BC%EA%B3%BC-%ED%95%B4%EA%B2%B0%EC%B1%85-3%EA%B0%80%EC%A7%80/)
<!-- /RELATED-POSTS -->
