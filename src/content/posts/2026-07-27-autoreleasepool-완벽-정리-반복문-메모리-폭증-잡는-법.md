---
title: "@autoreleasepool 완벽 정리 (반복문 메모리 폭증 잡는 법)"
description: "\"ARC 시대에 @autoreleasepool을 왜 아직도 쓰는 거예요?\""
header:
  og_image: /assets/images/posts/2bdb9495-dbc7-4607-8213-c51368c95086/1.jpg
tags:
  - autoreleasepool
  - autorelease
  - ObjectiveC
  - Swift
permalink: /autoreleasepool-완벽-정리-반복문-메모리-폭증-잡는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-27
---

"ARC 시대에 `@autoreleasepool`을 왜 아직도 쓰는 거예요?"

후배들에게 종종 받는 질문이에요. 분명 어딘가에서 본 키워드인데, 언제 왜 쓰는지 바로 답하기는 의외로 어렵습니다.

오늘은 `@autoreleasepool`이 뭔지부터 실전에서 언제 꺼내 쓰는지까지 풀어드릴게요.

<figure>
  <img src="/assets/images/posts/2bdb9495-dbc7-4607-8213-c51368c95086/1.jpg" alt="산처럼 치솟던 메모리, @autoreleasepool로 톱니 모양으로 잡습니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>산처럼 치솟던 메모리, @autoreleasepool로 톱니 모양으로 잡습니다</figcaption>
</figure>

결론부터 말씀드리면 이렇습니다.

> `@autoreleasepool`은 '나중에 해제하기로 예약된 객체들'을 내가 원하는 시점에 미리 비워버리는 블록입니다. 반복문 안에서 임시 객체가 쏟아질 때 메모리 폭증을 막는 게 대표 용도예요.

하나씩 짚어볼게요.

---

## 오토릴리즈 풀이 뭐길래?

배경 개념부터 잡고 가겠습니다.

Objective-C에는 예전부터 `autorelease`라는 장치가 있었어요. 객체를 "지금 말고 조금 이따 release 해줘"라고 예약해 두는 방식이죠.

이렇게 예약된 객체들이 줄 서서 기다리는 대기 명단이 바로 '오토릴리즈 풀(autorelease pool)'입니다.

그리고 풀이 비워지는(drain) 순간, 명단에 있던 객체들이 한꺼번에 release를 받아요.

그럼 이 풀은 언제 비워질까요?

iOS 앱에서는 메인 런 루프가 알아서 관리해 줍니다. 터치 이벤트 처리 → 화면 갱신, 이런 한 사이클이 끝날 때마다 풀을 싹 비워요.

그래서 평소에는 우리가 신경 쓸 일이 없는 겁니다.

---

## 문제는 반복문에서 터집니다

그런데 이 '사이클이 끝날 때마다'라는 조건이 발목을 잡는 상황이 있어요.

런 루프가 한 바퀴 도는 동안 임시 객체가 어마어마하게 쌓이는 경우입니다.

예를 들어 사진 수천 장을 한 반복문에서 처리한다고 해볼게요.

```objc
for (int i = 0; i < 5000; i++) {
    // 매번 큰 이미지 객체가 임시로 생성됩니다
    UIImage *image = [self loadAndResizeImage:i];
    [self saveThumbnail:image];
}
```

반복문이 도는 동안에는 런 루프가 풀을 비울 틈이 없어요.

그러니 해제 예약만 걸린 임시 객체들이 5천 장어치 고스란히 메모리에 쌓입니다.

메모리 그래프가 산처럼 치솟다가, 심하면 시스템이 앱을 강제 종료해 버려요.

<figure>
  <img src="/assets/images/posts/2bdb9495-dbc7-4607-8213-c51368c95086/2.jpg" alt="반복문이 도는 동안 메모리 그래프가 산처럼 치솟는 순간이에요" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>반복문이 도는 동안 메모리 그래프가 산처럼 치솟는 순간이에요</figcaption>
</figure>

---

## @autoreleasepool로 산을 깎는 법

해법은 간단합니다. 반복문 안에 내 전용 풀을 만들어서, 한 바퀴 돌 때마다 직접 비워주는 거예요.

```objc
for (int i = 0; i < 5000; i++) {
    @autoreleasepool {
        UIImage *image = [self loadAndResizeImage:i];
        [self saveThumbnail:image];
    } // 블록이 끝나는 순간 임시 객체들이 바로 해제됩니다
}
```

`@autoreleasepool` 블록이 닫히는 순간, 그 안에서 만들어진 임시 객체들이 즉시 정리돼요.

메모리가 5천 장어치 쌓였다가 한 번에 빠지는 대신, 한 장어치씩 쌓였다 빠졌다를 반복하는 거죠.

산 모양이던 메모리 그래프가 잔잔한 톱니 모양으로 바뀝니다.

---

## 스위프트에서는 이렇게 씁니다

"저는 스위프트만 쓰는데요?" 하실 수 있는데, 스위프트에도 똑같은 도구가 있습니다.

`autoreleasepool` 함수예요.

```swift
for i in 0..<5000 {
    autoreleasepool {
        let image = loadAndResizeImage(i)
        saveThumbnail(image)
    }
}
```

주의할 점이 하나 있어요.

순수 스위프트 객체는 대부분 오토릴리즈 풀을 거치지 않고 스코프가 끝나면 바로 해제됩니다.

이 도구가 진짜 힘을 발휘하는 건 `UIImage`, `Data(contentsOf:)`, `NSData` 같은 Objective-C 기반 파운데이션·UIKit API를 반복 호출할 때예요.

내부적으로 autorelease 객체를 만들어 돌려주는 API들이 여전히 많거든요.

<figure>
  <img src="/assets/images/posts/2bdb9495-dbc7-4607-8213-c51368c95086/3.jpg" alt="스위프트에서도 autoreleasepool 블록 하나면 그래프가 순해집니다" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>스위프트에서도 autoreleasepool 블록 하나면 그래프가 순해집니다</figcaption>
</figure>

---

## 이럴 때 꺼내 쓰세요

정리하면 `@autoreleasepool`이 필요한 순간은 이런 경우입니다.

- 반복문에서 이미지·파일·문자열 같은 큰 임시 객체를 대량 생성할 때
- 백그라운드 스레드에서 런 루프 없이 오래 도는 작업을 할 때
- 커맨드라인 도구처럼 런 루프 자체가 없는 환경에서 Objective-C 객체를 쓸 때

반대로 평소 UI 코드, 일반적인 비즈니스 로직에서는 굳이 쓸 필요 없어요. 메인 런 루프가 이미 잘 관리하고 있으니까요.

계측 없이 습관처럼 감싸는 것도 권하지 않습니다. Instruments나 Xcode 메모리 그래프에서 실제로 스파이크가 보일 때 꺼내 쓰는 게 순서예요.

---

## 자주 묻는 질문 (Q&A)

**Q. ARC가 알아서 해주는데 왜 제가 풀을 관리하나요?**

ARC(Automatic Reference Counting, 자동 참조 계수)는 retain·release를 대신 넣어줄 뿐, 오토릴리즈 풀이 언제 비워질지까지 바꿔주지는 않아요. 풀이 비워지는 '시점'을 앞당기는 건 여전히 개발자 몫입니다.

**Q. main 함수에 있는 @autoreleasepool은 뭔가요?**

Objective-C 프로젝트의 main.m을 열면 앱 전체가 `@autoreleasepool`로 감싸져 있는데, 이게 앱의 최상위 풀이에요. 이 안에서 런 루프가 돌면서 사이클마다 하위 풀을 비워줍니다.

**Q. 블록을 중첩해도 되나요?**

네, 풀은 스택처럼 쌓입니다. 안쪽 블록이 닫히면 안쪽 풀만 비워지고, 바깥 풀은 그대로 유지돼요.

<figure>
  <img src="/assets/images/posts/2bdb9495-dbc7-4607-8213-c51368c95086/4-1783848058907.png" alt="풀은 스택처럼 쌓이고 안쪽부터 비워집니다" width="552" height="1164" loading="lazy" decoding="async">
  <figcaption>풀은 스택처럼 쌓이고 안쪽부터 비워집니다</figcaption>
</figure>

---

짧게 정리하면, `@autoreleasepool`은 '해제 예약된 임시 객체를 내가 정한 타이밍에 비우는 블록'입니다.

반복문에서 메모리가 산처럼 치솟는 걸 Instruments로 확인했다면, 그 반복문 안쪽을 이 블록으로 감싸 보세요. 그래프가 순해지는 게 눈에 보일 겁니다.

MRC(Manual Reference Counting, 수동 참조 계수)에서 ARC로 넘어온 역사가 궁금하시다면 앞서 정리한 'Objective-C 메모리 관리 역사' 글도 같이 읽어보시길 추천드려요. 오늘도 즐거운 코딩 되세요!

---

## 참고 자료

- [Using Autorelease Pool Blocks (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/mmAutoreleasePools.html)
- [autoreleasepool(invoking:) (Apple Developer)](https://developer.apple.com/documentation/objectivec/autoreleasepool%28invoking:%29)

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 탄생 배경, 크리스 래트너는 왜 Objective-C를 버렸을까](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
<!-- /RELATED-POSTS -->
