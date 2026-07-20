---
title: "Swift 프록시 패턴 완전정복, lazy 뒤에 숨은 대리인 객체 (예제 총정리)"
description: "iOS 개발을 하다 보면 lazy var 한 줄을 참 자주 쓰게 됩니다."
header:
  og_image: /assets/images/posts/af69e889-ff48-46ae-9eed-468cddbd75aa/1.png
tags:
  - Swift
  - 프록시패턴
  - 디자인패턴
  - iOS개발
permalink: /Swift-프록시-패턴-완전정복-lazy-뒤에-숨은-대리인-객체-예제-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

iOS 개발을 하다 보면 `lazy var` 한 줄을 참 자주 쓰게 됩니다.

저도 그랬어요. 무거운 객체 초기화를 뒤로 미룰 때 습관처럼 붙였죠.

그러다 문득 궁금해졌습니다. 이 `lazy`라는 게 사실은 디자인 패턴 교과서에 나오는 그 프록시 패턴이랑 똑같은 거 아닌가?

결론부터 말씀드릴게요.

> `lazy`는 "진짜 객체가 필요해지는 순간까지 생성을 대신 막아주는" 가상 프록시(Virtual Proxy)의 언어 내장 버전입니다.

오늘은 Swift 프록시 패턴이 무엇인지, 또 그 개념이 `lazy` 키워드 뒤에 어떻게 숨어 있는지 제가 직접 코드를 만져보며 이해한 순서대로 풀어드릴게요.

<figure>
  <img src="/assets/images/posts/af69e889-ff48-46ae-9eed-468cddbd75aa/1.png" alt="Swift 프록시 패턴과 lazy, 결국 같은 이야기라는 걸 그림 하나로 정리해봤어요">
  <figcaption>Swift 프록시 패턴과 lazy, 결국 같은 이야기라는 걸 그림 하나로 정리해봤어요</figcaption>
</figure>

**핵심 요약 먼저 짚고 갈게요.**

1. 프록시 패턴은 진짜 객체 앞에 "대리인"을 세워 접근을 통제하는 구조 패턴입니다.
2. `lazy`는 그중 생성을 미루는 가상 프록시와 목적이 같습니다.
3. 다만 `lazy`는 접근 제어·로깅 같은 기능은 못 하고, 오직 지연 생성만 담당해요.
4. 로깅·권한 체크가 필요하면 직접 프록시 객체를 만들어야 합니다.

---

## Swift 프록시 패턴이 대체 뭔가요?

프록시(Proxy)는 우리말로 대리인입니다.

실제 일을 하는 객체 앞에 똑같은 얼굴(같은 인터페이스)을 한 대리인을 세워두는 거예요.

외부에서는 진짜 객체를 부르는 줄 알지만, 사실은 대리인을 거칩니다.

대리인은 요청을 그냥 넘기기도 하고 중간에서 뭔가를 더 하기도 해요. 접근 권한을 확인하거나, 호출을 기록하거나, 진짜 객체 생성을 미루는 식으로요.

대표적인 쓰임새는 세 가지입니다.

- **가상 프록시**: 무거운 객체 생성을 실제로 쓸 때까지 미룸
- **보호 프록시**: 권한 없는 접근을 막음
- **로깅 프록시**: 호출 내역을 기록

오늘 주인공은 첫 번째, 가상 프록시예요. `lazy`와 정확히 닿는 지점이거든요.

---

## lazy 뒤에 숨은 대리인 객체의 정체

고화질 이미지를 다루는 상황을 떠올려 볼게요.

이미지 로딩은 무겁습니다. 화면에 보이지도 않는데 미리 다 불러오면 메모리가 아깝죠.

그래서 "진짜 필요할 때 로딩하자"는 발상이 나옵니다. 이게 가상 프록시의 핵심이에요.

먼저 프록시 패턴으로 직접 구현하면 이렇게 됩니다.

```swift
protocol Image { func display() }

// 대리인: 진짜 객체 생성을 필요할 때까지 미룬다
final class ImageProxy: Image {
    private let filename: String
    private var real: RealImage?          // 아직 안 만듦
    init(_ filename: String) { self.filename = filename }
    func display() {
        if real == nil { real = RealImage(filename) }  // 이 순간 생성
        real?.display()
    }
}
```

`display()`를 처음 부르는 순간에야 `RealImage`가 만들어집니다.

그전까지 `ImageProxy`는 파일 이름만 들고 얌전히 기다려요. 딱 대리인의 일이죠.

그런데 Swift에는 이 패턴이 문법에 녹아 있습니다. 바로 `lazy`예요.

<figure>
  <img src="/assets/images/posts/af69e889-ff48-46ae-9eed-468cddbd75aa/4-1783848054266.png" alt="대리인이 진짜 객체를 대신 붙잡고 있는 순간" loading="lazy">
  <figcaption>대리인이 진짜 객체를 대신 붙잡고 있는 순간</figcaption>
</figure>

```swift
final class Gallery {
    // 이 프로퍼티에 처음 접근할 때 딱 한 번 생성된다
    lazy var cover: RealImage = RealImage("cover.png")
}

let g = Gallery()   // 아직 RealImage 안 만들어짐
g.cover.display()   // 여기서 비로소 생성
```

`Gallery()`를 만든 시점엔 `RealImage`가 없습니다.

`g.cover`에 처음 손을 대는 순간 생성돼요. 위의 `ImageProxy`가 하던 지연 생성을 컴파일러가 대신 만들어주는 셈입니다.

---

## 그럼 lazy만 있으면 프록시 패턴은 필요 없나요?

제가 처음 들었던 의문도 이거였어요.

답은 "아니요"입니다.

`lazy`가 대신해 주는 건 오직 지연 생성 하나뿐이에요.

접근을 막거나, 호출을 기록하거나, 조건에 따라 다른 객체를 돌려주는 일은 못 합니다.

둘의 차이를 표로 정리해 봤어요.

| 항목 | lazy 프로퍼티 | 직접 만든 프록시 |
|---|---|---|
| 지연 생성 | 가능 | 가능 |
| 접근 권한 체크 | 불가 | 가능 |
| 호출 로깅·캐싱 | 불가 | 가능 |
| 코드량 | 한 줄 | 클래스 하나 |
| 재사용성 | 그 프로퍼티 한정 | 여러 곳에서 재사용 |

그래서 기준은 단순합니다.

순수하게 "생성만 미루면 되는" 상황이면 `lazy` 한 줄이 정답이에요. 굳이 클래스를 만들 필요가 없죠.

반면 권한 확인, 로깅, 원격 호출 감싸기처럼 중간에 끼어들 일이 있다면 프록시 객체를 직접 세워야 합니다.

<figure>
  <img src="/assets/images/posts/af69e889-ff48-46ae-9eed-468cddbd75aa/2.png" alt="무거운 초기화를 미룰 때 저는 늘 이 한 줄부터 떠올립니다" loading="lazy">
  <figcaption>무거운 초기화를 미룰 때 저는 늘 이 한 줄부터 떠올립니다</figcaption>
</figure>

한 가지 주의점도 있어요.

`lazy`는 스레드 안전을 보장하지 않습니다.

여러 스레드가 동시에 처음 접근하면 초기화가 두 번 일어날 수 있어요. 멀티스레드 환경이라면 이 부분은 직접 프록시로 감싸 동기화를 챙기는 편이 안전합니다.

---

## 자주 나오는 질문 정리

**Q. lazy와 계산 프로퍼티(computed property)는 뭐가 다른가요?**

`lazy`는 처음 한 번만 계산하고 값을 저장해 둡니다. 계산 프로퍼티는 접근할 때마다 매번 다시 계산해요. 무거운 초기화를 한 번만 하고 싶다면 `lazy`가 맞습니다.

**Q. lazy는 왜 var로만 선언되나요?**

초기화 시점이 나중이라, 값이 정해지기 전의 인스턴스가 잠깐 존재하기 때문이에요. `let`은 그걸 허용하지 않아서 `lazy let`은 문법상 불가능합니다.

<figure>
  <img src="/assets/images/posts/af69e889-ff48-46ae-9eed-468cddbd75aa/3.png" alt="직접 대리인 클래스를 세워보면 lazy가 뭘 대신해줬는지 확 와닿아요" loading="lazy">
  <figcaption>직접 대리인 클래스를 세워보면 lazy가 뭘 대신해줬는지 확 와닿아요</figcaption>
</figure>

---

정리하면, `lazy`는 프록시 패턴의 가상 프록시를 언어가 미리 포장해 둔 선물 같은 존재예요.

한 줄로 끝날 일에 굳이 대리인 클래스를 만들 필요는 없지만 그 한 줄 뒤에 어떤 개념이 숨어 있는지 알고 쓰면 코드를 보는 눈이 확실히 달라집니다.

오늘부터 `lazy var`를 쓸 때 "아, 지금 대리인 하나 세우는 거지" 하고 떠올려 보세요. 패턴이 훨씬 가깝게 느껴지실 거예요.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 데코레이터 패턴, 상속 없이 기능 겹겹이 입히는 법 (예제·실전 총정리)](/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [Swift 프로토타입 패턴 완벽 정리 (NSCopying vs 값 타입 복사 차이)](/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/)
- [Swift 추상 팩토리 패턴, 관련 객체 통째로 갈아끼우는 법 (예제 코드)](/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/)
<!-- /RELATED-POSTS -->
