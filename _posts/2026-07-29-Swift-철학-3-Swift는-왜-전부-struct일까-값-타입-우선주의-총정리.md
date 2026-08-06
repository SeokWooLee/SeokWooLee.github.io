---
title: "[Swift 철학 #3] Swift는 왜 전부 struct일까? 값 타입 우선주의 총정리"
description: "Swift 표준 라이브러리를 열어보면 눈에 띄는 사실이 하나 있습니다. Int, Double, Bool 같은 기본 타입은 물론이고 String, Array, Dictionary, Set까지 전부 struct입니다. 다른 언어에서 당연히 클래스였던 것들이 Swift에서는 죄다 값…"
header:
  og_image: /assets/images/posts/c6e5417c-1bad-4913-bdff-974f972e1a73/1.jpg
tags:
  - Swift
  - 스위프트
  - struct
  - 값타입
permalink: /Swift-철학-3-Swift는-왜-전부-struct일까-값-타입-우선주의-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-29
---

Swift 표준 라이브러리를 열어보면 눈에 띄는 사실이 하나 있습니다. Int, Double, Bool 같은 기본 타입은 물론이고 String, Array, Dictionary, Set까지 전부 struct입니다. 다른 언어에서 당연히 클래스였던 것들이 Swift에서는 죄다 값 타입이에요. Java의 String은 클래스고, 파이썬은 모든 게 객체 참조인데 말이죠.

우연이 아닙니다. Swift는 설계 단계에서 "기본 선택지는 값 타입"이라는 방침을 정했고, WWDC 2015의 그 유명한 세션 "Protocol-Oriented Programming"과 "Building Better Apps with Value Types"에서 이를 공식 노선으로 선언했습니다. 이 글에서는 왜 Swift가 참조 대신 값을 기본값으로 삼았는지, 그 선택이 언어 전체에 어떤 파장을 만들었는지 정리합니다.

Swift 철학 시리즈 3편입니다. 클래스와 구조체의 문법 차이 자체는 별도 글에서 다뤘으니, 여기서는 "왜 그 차이를 만들었는가"라는 설계 의도에 집중할게요.

<figure>
  <img src="/assets/images/posts/c6e5417c-1bad-4913-bdff-974f972e1a73/1.jpg" alt="Swift의 기본 선택지는 struct, 클래스는 근거가 있을 때 씁니다" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Swift의 기본 선택지는 struct, 클래스는 근거가 있을 때 씁니다</figcaption>
</figure>

## 참조가 기본이던 세상의 고질병

값 타입 우선주의를 이해하려면 먼저 반대편, 참조 타입이 기본인 세상의 문제를 봐야 합니다.

참조 타입의 본질은 공유입니다. 변수를 복사해도 객체는 하나고 두 변수가 같은 객체를 가리켜요. 이 공유가 의도된 것이면 기능이지만 의도치 않은 것이면 버그의 온상이 됩니다. 고전적인 사고 패턴은 이렇습니다.

```swift
// 참조 타입(클래스)이라고 가정
let settings = defaultSettings
settings.fontSize = 20   // 기본 설정을 건드릴 생각은 없었는데
// defaultSettings.fontSize도 20이 됐다
```

복사한 줄 알았는데 공유하고 있었던 거죠. 이런 버그의 고약한 점은 증상과 원인이 멀리 떨어져 있다는 겁니다. 값이 이상해진 지점과 값을 망가뜨린 코드가 파일 몇 개를 건너 있어서 디버깅이 "이 객체를 참조하는 곳 전부 추적하기"가 됩니다.

Objective-C 개발자들은 이 문제를 잘 알아서 관습으로 방어해왔습니다. NSString 프로퍼티는 copy로 선언하고 NSArray는 가변 버전(NSMutableArray)과 불변 버전을 분리하고 방어적 복사(defensive copy)를 습관처럼 넣었죠. 전부 "참조가 기본이라 생기는 문제"를 개발자의 규율로 때우는 패치였습니다.

Swift 팀의 관점은 이랬습니다. 관습으로 매번 방어해야 하는 문제라면, 언어 기본값이 잘못된 것 아닌가?

## 값 타입이 지키는 것 — 지역 추론

값 타입의 핵심 성질은 복사하면 진짜 별개가 된다는 겁니다.

```swift
var a = [1, 2, 3]
var b = a
b.append(4)
// a는 여전히 [1, 2, 3]
```

이게 보장하는 건 단순한 편의가 아니라, 지역 추론(local reasoning)이라는 능력입니다. 함수에 배열을 넘겼을 때, 값 타입이면 "이 함수가 내 배열을 몰래 바꿀 가능성"을 걱정할 필요가 없어요. 내 변수의 상태는 내 코드 블록만 읽으면 완전히 파악됩니다. 참조 타입 세상에서는 "이 객체를 누가 들고 있고 언제 바꾸는가"를 프로그램 전체를 놓고 생각해야 했는데, 값 타입은 그 사고 범위를 눈앞의 함수 하나로 줄여줍니다.

1편에서 다룬 Safe 철학과 정확히 이어지는 지점입니다. 옵셔널이 "nil 깜빡함"을 컴파일 타임에 잡았듯, 값 타입은 "의도치 않은 공유"라는 버그 클래스를 타입 수준에서 제거합니다. let으로 선언한 struct는 진짜 불변이라는 점도 덤으로 따라옵니다. 클래스 인스턴스의 let은 "참조가 안 바뀐다"일 뿐 내용물은 바뀔 수 있거든요.

그리고 이 성질은 시간이 지나며 가치가 더 커졌습니다. 멀티스레드 환경에서 데이터 레이스는 "여러 스레드가 같은 메모리를 공유"할 때 생기는데, 값 타입은 애초에 공유가 안 되니 레이스의 전제가 사라집니다. Swift Concurrency가 스레드 경계를 넘을 수 있는 타입(Sendable)의 대표로 값 타입을 꼽는 건 자연스러운 귀결이에요. 2014년의 설계 결정이 2021년의 동시성 모델에서 회수된 셈입니다.

<figure>
  <img src="/assets/images/posts/c6e5417c-1bad-4913-bdff-974f972e1a73/2.jpg" alt="참조는 풍선 하나를 같이 잡는 것, 값은 각자 자기 풍선을 갖는 것" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>참조는 풍선 하나를 같이 잡는 것, 값은 각자 자기 풍선을 갖는 것</figcaption>
</figure>

## "복사가 비싸지 않나요" — Copy-on-Write라는 답

값 타입 우선주의에 대한 첫 반문은 늘 성능입니다. 원소 10만 개짜리 배열을 함수에 넘길 때마다 통째로 복사되면 감당이 안 되지 않느냐는 거죠.

Swift의 답이 Copy-on-Write(CoW)입니다. Array, Dictionary, Set, String 같은 표준 컬렉션은 대입 시점에는 내부 저장소를 공유하고, 어느 한쪽이 수정하는 순간에만 진짜 복사를 수행합니다. 의미론적으로는 완전한 값(수정이 서로에게 안 보임)이면서 비용은 참조 수준(읽기만 하면 복사 없음)인 구조예요.

```swift
var a = hugeArray   // 복사 안 일어남, 저장소 공유
let x = a[0]        // 여전히 복사 없음
a.append(1)         // 이 순간 처음으로 복사 발생
```

주의할 점은 CoW가 언어 기능이 아니라 라이브러리 구현 기법이라는 겁니다. 표준 컬렉션에는 들어 있지만 우리가 직접 만든 struct에 자동으로 붙는 게 아니에요. 큰 데이터를 품는 커스텀 값 타입이 필요하면 isKnownUniquelyReferenced로 직접 구현해야 합니다. 이 구현 디테일은 CoW를 다룬 별도 글에서 정리했습니다.

반대 방향의 성능 이점도 있습니다. 작은 struct는 힙 할당 없이 스택에 놓이고 참조 카운팅도 없어서, 클래스보다 오히려 쌉니다. CGPoint 같은 타입이 struct인 이유죠. 그러니 "값 타입은 느리다"는 직관은 Swift에서는 대체로 반대로 작동합니다.

## 상속 없이 사는 법 — 프로토콜과 조합

값 타입 우선주의의 대가가 하나 있습니다. struct는 상속이 안 됩니다. 참조 없이 부분 다형성(polymorphism)을 구현하기 어렵기 때문인데, 그럼 코드 재사용과 다형성은 어떻게 할까요.

Swift의 답이 프로토콜 지향 프로그래밍(POP)입니다. 공통 인터페이스는 프로토콜로 선언하고 공통 구현은 프로토콜 extension에 담고 타입은 여러 프로토콜을 채택해서 능력을 조합합니다. 상속이 "부모 하나에게 모든 걸 물려받는" 수직 구조라면, 프로토콜 채택은 "필요한 능력을 골라 끼우는" 수평 구조예요.

```swift
struct Player: Codable, Equatable, Comparable {
    let name: String
    let score: Int

    static func < (lhs: Self, rhs: Self) -> Bool {
        lhs.score < rhs.score
    }
}
```

이 struct는 아무것도 상속받지 않았지만 JSON 변환, 동등 비교, 정렬 능력을 갖습니다. 그것도 Codable과 Equatable은 컴파일러가 구현을 자동 합성해줘요. 값 타입 + 프로토콜 조합이 상속의 실용적 용도 대부분을 대체하는 겁니다.

그래서 값 타입 우선주의와 프로토콜 지향은 한 세트입니다. WWDC 2015에서 두 세션이 나란히 발표된 게 우연이 아니에요. "클래스 상속 대신 struct와 프로토콜"이 Swift가 제시한 기본 조합이고, 표준 라이브러리 전체가 이 방식으로 지어졌습니다. POP 자체는 별도 글에서 자세히 다뤘습니다.

<figure>
  <img src="/assets/images/posts/c6e5417c-1bad-4913-bdff-974f972e1a73/3.jpg" alt="Copy-on-Write, 읽을 땐 공유하고 쓰는 순간에만 복사합니다" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>Copy-on-Write, 읽을 땐 공유하고 쓰는 순간에만 복사합니다</figcaption>
</figure>

## 그래서 클래스는 언제 쓰나

값 타입 우선주의는 "클래스를 쓰지 말라"가 아닙니다. 정확한 명제는 "기본값이 struct고, 참조가 필요하다는 근거가 있을 때 클래스"입니다. 근거는 대략 세 가지입니다.

**정체성(identity)이 의미 있을 때.** 데이터베이스 커넥션, 화면의 뷰, 파일 핸들처럼 "값이 같아도 서로 다른 존재"인 것들은 참조가 자연스럽습니다. 커넥션 두 개의 설정이 같다고 같은 커넥션은 아니니까요.

**공유 자체가 목적일 때.** 여러 화면이 같은 상태를 봐야 하는 공유 모델, 앱 전역에서 하나여야 하는 매니저는 참조의 공유 성질이 기능입니다.

**수명 관리가 필요할 때.** deinit으로 리소스를 정리해야 하거나, Objective-C 프레임워크(UIKit 등)와 상호작용해야 하면 클래스입니다.

애플 공식 문서의 가이드도 같은 방향입니다. 기본은 struct와 enum을 쓰고 위 조건에 해당할 때 클래스를 선택하라는 것. 실제로 SwiftUI 시대의 앱 코드는 뷰(struct), 상태 데이터(struct), 그리고 소수의 참조 모델(@Observable 클래스)이라는 구도로 수렴하고 있습니다. 값이 기본이고 참조가 예외라는 철학이 UI 프레임워크 레벨까지 관철된 모습이에요.

## 정리

- Swift 표준 라이브러리가 거의 전부 struct인 건 설계 방침입니다. 기본 선택지는 값 타입이에요.
- 참조 기본 언어의 고질병, 의도치 않은 공유로 인한 원거리 버그를 타입 수준에서 제거하는 게 목적입니다.
- 값 타입은 지역 추론을 지켜주고, 이 성질은 Swift Concurrency의 Sendable에서 다시 회수됐습니다.
- 성능 반론에는 Copy-on-Write(표준 컬렉션)와 스택 할당(작은 struct)이 답입니다.
- 상속의 빈자리는 프로토콜 지향 프로그래밍이 채우며, 둘은 한 세트로 설계됐습니다.
- 클래스는 정체성·공유·수명 관리가 필요할 때 선택하는 도구로 자리가 재정의됐습니다.

여기까지 Swift 철학 시리즈로 안전(1편), 학습 곡선(2편), 값 타입(3편)을 봤습니다. 다음 편에서는 이 철학들이 실제로 언어에 반영되는 절차, Swift Evolution 프로세스를 다룹니다. 문법 하나가 SE-XXXX 번호를 달고 언어에 들어오기까지의 여정입니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[Swift 철학 #4] SE-0296이 뭐길래? Swift 문법이 태어나는 절차, Swift Evolution 총정리](/Swift-%EC%B2%A0%ED%95%99-4-SE-0296%EC%9D%B4-%EB%AD%90%EA%B8%B8%EB%9E%98-Swift-%EB%AC%B8%EB%B2%95%EC%9D%B4-%ED%83%9C%EC%96%B4%EB%82%98%EB%8A%94-%EC%A0%88%EC%B0%A8-Swift-Evolution-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 중급 #1] Swift ARC 완전 정리, weak vs unowned는 수명 관계로 고릅니다](/Swift-%EC%A4%91%EA%B8%89-1-Swift-ARC-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-weak-vs-unowned%EB%8A%94-%EC%88%98%EB%AA%85-%EA%B4%80%EA%B3%84%EB%A1%9C-%EA%B3%A0%EB%A6%85%EB%8B%88%EB%8B%A4/)
- [[Swift 중급 #2] Swift 제네릭(Generics) 입문부터 활용까지, <T>가 중복과 위험을 동시에 없애는 법](/Swift-%EC%A4%91%EA%B8%89-2-Swift-%EC%A0%9C%EB%84%A4%EB%A6%ADGenerics-%EC%9E%85%EB%AC%B8%EB%B6%80%ED%84%B0-%ED%99%9C%EC%9A%A9%EA%B9%8C%EC%A7%80-T%EA%B0%80-%EC%A4%91%EB%B3%B5%EA%B3%BC-%EC%9C%84%ED%97%98%EC%9D%84-%EB%8F%99%EC%8B%9C%EC%97%90-%EC%97%86%EC%95%A0%EB%8A%94-%EB%B2%95/)
<!-- /RELATED-POSTS -->
