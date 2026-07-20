---
title: "Swift 팩토리 메서드 패턴, init 대신 쓰는 이유 (실전 정리)"
description: "Swift로 앱을 만들다 보면 객체 생성하는 코드를 하루에도 수십 번은 쓰게 됩니다."
header:
  og_image: /assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png
tags:
  - Swift
  - 팩토리메서드패턴
  - iOS개발
  - 디자인패턴
  - 스위프트
  - init
  - 정적팩토리메서드
  - 객체지향
  - 코딩공부
  - 앱개발
permalink: /Swift-팩토리-메서드-패턴-init-대신-쓰는-이유-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

Swift로 앱을 만들다 보면 객체 생성하는 코드를 하루에도 수십 번은 쓰게 됩니다.

그런데 어느 순간, init 하나로는 답답한 상황이 자꾸 생기더라고요.

처음엔 무조건 init만 쓰다가, 프로젝트가 커지면서 팩토리 메서드 패턴을 찾게 되는 경우가 많죠.

이 글에서는 Swift 팩토리 메서드 패턴이 뭔지, 그리고 왜 init 대신 팩토리를 쓰는지를 실제 코드와 함께 풀어볼게요.

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png" alt="Swift 팩토리 메서드 패턴, init이랑 뭐가 다른지부터 짚고 갈게요">
  <figcaption>Swift 팩토리 메서드 패턴, init이랑 뭐가 다른지부터 짚고 갈게요</figcaption>
</figure>

## 팩토리 메서드 패턴, 한 줄로 말하면?

먼저 핵심 답부터 드릴게요.

> 팩토리 메서드는 객체 생성 로직을 init 밖의 별도 메서드로 빼서 이름을 붙이고 반환 타입을 자유롭게 고르는 방식입니다.

Swift에서는 보통 `static func`로 만드는 정적 팩토리 메서드를 가리킵니다.

init은 언어가 정해준 규칙 안에서만 움직여요.

이름을 못 붙이고, 항상 자기 타입의 인스턴스를 새로 만들어야 하죠.

팩토리 메서드는 이 제약을 풀어줍니다.

간단한 예시 하나 볼게요.

```swift
struct Color {
    let r, g, b: Double
    // 생성 의도를 이름으로 드러낸다
    static func rgb(_ r: Double, _ g: Double, _ b: Double) -> Color {
        Color(r: r, g: g, b: b)
    }
    static func gray(_ v: Double) -> Color {
        Color(r: v, g: v, b: v)
    }
}
```

`Color.gray(0.5)`처럼 부르면, 이게 회색을 만든다는 걸 코드만 봐도 알 수 있어요.

---

## init 대신 팩토리를 쓰는 이유는?

제가 직접 겪으면서 정리한 이유는 크게 네 가지였어요.

**첫째, 이름을 붙일 수 있습니다.**

init은 전부 이름이 같아서 파라미터로만 구분해야 해요.

같은 `Double` 두 개를 받는 생성자가 여러 개면 헷갈리기 딱 좋죠.

팩토리 메서드는 `from(hex:)`, `rgb(_:_:_:)`처럼 의도를 이름에 담습니다.

**둘째, 매번 새 인스턴스를 만들지 않아도 됩니다.**

init은 무조건 새 객체를 반환하지만, 팩토리는 캐시된 값이나 싱글턴을 돌려줄 수 있어요.

**셋째, 반환 타입을 유연하게 고를 수 있습니다.**

상황에 따라 하위 타입이나 다른 구현을 반환하는 게 가능하죠.

**넷째, 실패 처리를 더 명확하게 표현할 수 있어요.**

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/2.png" alt="static func 한 줄 붙이는 것만으로 코드가 확 읽기 편해집니다">
  <figcaption>static func 한 줄 붙이는 것만으로 코드가 확 읽기 편해집니다</figcaption>
</figure>

아래는 캐시를 활용하는 팩토리 예시입니다.

```swift
final class IconCache {
    private static var store: [String: Icon] = [:]
    // 같은 이름이면 이미 만든 아이콘을 재사용한다
    static func icon(named name: String) -> Icon {
        if let cached = store[name] { return cached }
        let icon = Icon(name: name)
        store[name] = icon
        return icon
    }
}
```

같은 아이콘을 여러 번 부를 때 메모리를 아낄 수 있어요.

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/4-1783847712458.png" alt="있으면 꺼내주고, 없으면 만들어서 채워둬요">
  <figcaption>있으면 꺼내주고, 없으면 만들어서 채워둬요</figcaption>
</figure>

---

## 그럼 init은 이제 안 써도 되나요?

아니요, 절대 그렇지 않습니다.

팩토리는 init을 대체하는 게 아니라 감싸는 도구예요.

팩토리 메서드 안에서도 결국 init을 호출해서 객체를 만듭니다.

단순한 값 타입이거나 생성 로직이 뻔하면 그냥 init이 낫습니다.

괜히 팩토리로 감싸면 코드만 길어지고 읽기 힘들어져요.

팩토리가 빛나는 순간은 따로 있어요.

- 생성 방법이 여러 가지라 이름으로 구분하고 싶을 때
- 캐싱, 풀링처럼 재사용이 필요할 때
- 복잡한 초기화 절차를 한 곳에 숨기고 싶을 때
- 프로토콜 타입으로 반환해 구현을 감추고 싶을 때

이 조건에 안 맞으면 init을 쓰는 게 정답입니다.

Swift 표준 라이브러리도 이렇게 나눠 써요.

`Array(repeating:count:)`는 init이지만, `UIColor.systemBlue` 같은 정적 프로퍼티도 사실 팩토리의 사촌 격이죠.

---

## 실무에서 판단하는 기준 정리

헷갈릴 때 제가 쓰는 기준을 표로 정리해봤어요.

| 상황 | 추천 |
| --- | --- |
| 단순 값 저장 | init |
| 생성 방식이 여러 개 | 팩토리 메서드 |
| 인스턴스 재사용·캐싱 | 팩토리 메서드 |
| 구현 숨기고 프로토콜 반환 | 팩토리 메서드 |
| 초기화가 한 줄로 끝남 | init |

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/3.png" alt="저는 헷갈릴 때마다 이 표를 떠올리면서 골라요">
  <figcaption>저는 헷갈릴 때마다 이 표를 떠올리면서 골라요</figcaption>
</figure>

정리하면, init은 '어떻게 만들지'를 다루고 팩토리는 '무엇을, 왜 만들지'를 다룹니다.

둘은 경쟁 관계가 아니라 역할이 다른 짝꿍이에요.

처음엔 init으로 시작하고, 생성 로직이 복잡해지는 순간 팩토리로 옮기는 흐름을 추천드려요.

오늘 소개한 기준만 기억해두셔도 코드가 한결 깔끔해질 겁니다. 즐거운 Swift 코딩 되세요!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 빌더 패턴으로 매개변수 8개 초기화 지옥 탈출하기 (실전 예제)](/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
- [Swift 프로토타입 패턴 완벽 정리 (NSCopying vs 값 타입 복사 차이)](/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/)
- [Swift 데코레이터 패턴, 상속 없이 기능 겹겹이 입히는 법 (예제·실전 총정리)](/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
