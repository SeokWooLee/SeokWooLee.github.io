---
title: "[Swift 중급 #7] 프로퍼티 래퍼 원리, @State가 마법이 아닌 이유"
description: "프로퍼티 래퍼는 SwiftUI 문법이 아니라 Swift 5.1에 SE-0258로 들어온 언어 기능입니다. 컴파일러가 @Clamped를 어떻게 번역하는지, wrappedValue와 projectedValue($)의 정체, 남용 경계를 정리했습니다."
header:
  og_image: /assets/images/posts/33440ae0-f781-4765-a6c7-694f65980263/swift-property-wrapper-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - 프로퍼티래퍼
  - propertyWrapper
permalink: /Swift-중급-7-프로퍼티-래퍼-원리-State가-마법이-아닌-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-08-09
---

SwiftUI를 쓰는 개발자는 하루에도 수십 번 @State와 @Published를 타이핑합니다. 그런데 이 골뱅이가 정확히 뭘 하는 물건인지 물으면 답이 갈려요. "SwiftUI 문법 아닌가요?"가 흔한 오해입니다. 아닙니다. 프로퍼티 래퍼(property wrapper)는 Swift 5.1에 Swift Evolution 제안 SE-0258로 들어온 언어 기능이고, SwiftUI는 그 기능의 유명한 고객일 뿐이에요.

중급 시리즈 7편입니다. 프로퍼티 래퍼의 동작 원리를 직접 만들어보며 이해하고, wrappedValue와 projectedValue($)의 정체, 그리고 남용을 피하는 기준까지 정리합니다.

<figure>
  <img src="/assets/images/posts/33440ae0-f781-4765-a6c7-694f65980263/swift-property-wrapper-1.jpg" alt="PROPERTY WRAPPERS 텍스트와 프로퍼티 상자를 감싸는 골뱅이 기계 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>반복되는 감싸기 로직에 이름을 붙여 재사용하는 게 래퍼입니다</figcaption>
</figure>

## 문제의식 — 프로퍼티마다 반복되는 감싸기 로직

프로퍼티 편에서 didSet으로 값 검증을 하는 패턴을 봤습니다. 그런데 같은 검증이 여러 프로퍼티에 필요하면 어떻게 될까요. 볼륨, 밝기, 진행률 전부 0...1 범위로 자르고 싶다면, didSet 세 벌을 복사하게 됩니다.

```swift
var volume: Double = 0.5 {
    didSet { volume = min(max(volume, 0), 1) }
}
var brightness: Double = 0.5 {
    didSet { brightness = min(max(brightness, 0), 1) }
}
// 같은 코드가 계속...
```

로직은 하나인데 프로퍼티마다 다시 쓰는 것, 제네릭 편에서 본 "중복이냐 안전이냐" 문제의 프로퍼티 버전입니다. 프로퍼티 래퍼는 이 감싸기 로직에 이름을 붙여 재사용하는 장치예요.

```swift
@propertyWrapper
struct Clamped {
    private var value: Double = 0
    var wrappedValue: Double {
        get { value }
        set { value = min(max(newValue, 0), 1) }
    }
}

struct Player {
    @Clamped var volume: Double
    @Clamped var brightness: Double
}
```

이제 `player.volume = 1.5`라고 대입해도 실제로는 1.0이 저장됩니다. 검증 로직은 Clamped 한 곳에만 있고요.

## 동작 원리 — 골뱅이가 하는 번역

@Clamped가 마법이 아니라는 걸 확인하려면 컴파일러의 번역 결과를 보면 됩니다. `@Clamped var volume: Double`은 대략 이렇게 펼쳐집니다.

```swift
private var _volume = Clamped()          // 실제 저장: 래퍼 인스턴스
var volume: Double {                     // 우리가 쓰는 이름: 연산 프로퍼티
    get { _volume.wrappedValue }
    set { _volume.wrappedValue = newValue }
}
```

핵심은 두 줄입니다. 진짜 저장되는 건 밑줄 붙은 래퍼 인스턴스고, 우리가 접근하는 이름은 래퍼의 wrappedValue로 가는 연산 프로퍼티예요. 프로퍼티 편에서 다진 저장·연산의 구분이 그대로 재료로 쓰이는 게 보이시죠. 래퍼는 결국 "저장 프로퍼티 + 연산 프로퍼티 + 반복 로직"을 타입 하나로 포장해 골뱅이로 배포하는 문법입니다.

이 번역을 알면 래퍼의 제약들도 자연스럽게 이해됩니다. 래퍼 붙은 프로퍼티가 사실 연산 프로퍼티니 didSet을 또 붙일 때 동작이 헷갈리는 것도, 로컬 변수나 연산 프로퍼티에 못 붙이던 제약(로컬은 Swift 5.5부터 허용)도 전부 "밑줄 저장소가 어디 생기느냐"의 문제였던 거예요.

<figure>
  <img src="/assets/images/posts/33440ae0-f781-4765-a6c7-694f65980263/swift-property-wrapper-2.jpg" alt="@Clamped 선언이 밑줄 저장소와 연산 프로퍼티로 번역되는 컴파일러 도식" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>@Clamped var volume은 밑줄 저장소와 연산 프로퍼티로 번역됩니다</figcaption>
</figure>

## projectedValue — 달러 기호의 정체

SwiftUI에서 `$text`처럼 달러를 붙여본 적이 있을 겁니다. 이것도 래퍼 기능입니다. 래퍼 타입에 projectedValue라는 프로퍼티를 선언하면, 컴파일러가 `$이름`이라는 세 번째 통로를 만들어줘요.

- `volume` → wrappedValue (값 자체)
- `_volume` → 래퍼 인스턴스 (선언한 타입 내부에서만 접근 가능)
- `$volume` → projectedValue (래퍼가 추가로 내어주는 무언가)

"추가로 내어주는 무언가"는 래퍼 설계자 마음입니다. SwiftUI의 @State는 $로 Binding(읽기·쓰기 통로)을 내어주고, Combine의 @Published는 Publisher(변경 스트림)를 내어줍니다. 같은 $ 문법인데 나오는 물건이 다른 이유가, 이게 언어 규칙이 아니라 각 래퍼의 설계 결정이기 때문이에요. 직접 만들 때도 마찬가지입니다. 위의 Clamped에 "잘린 값이었는지" 여부를 내어주는 projectedValue를 붙이면, `$volume`으로 "방금 대입이 범위를 벗어났었나"를 확인하는 API가 됩니다.

## 실전 레시피 — UserDefaults 래퍼로 배우는 설계

실무에서 가장 널리 쓰이는 자작 래퍼 패턴이 UserDefaults 접근입니다. 원리 확인을 겸해 만들어볼게요.

```swift
@propertyWrapper
struct UserDefault<T> {
    let key: String
    let defaultValue: T

    var wrappedValue: T {
        get { UserDefaults.standard.object(forKey: key) as? T ?? defaultValue }
        set { UserDefaults.standard.set(newValue, forKey: key) }
    }
}

enum Settings {
    @UserDefault(key: "hasSeenOnboarding", defaultValue: false)
    static var hasSeenOnboarding: Bool
}
```

키 문자열 오타, 캐스팅, 기본값 처리라는 반복 로직이 래퍼 안으로 들어가고, 사용처는 `Settings.hasSeenOnboarding = true` 한 줄이 됩니다. 제네릭 `<T>`와 init 파라미터(key, defaultValue)가 래퍼에도 그대로 적용된다는 것도 이 예제의 포인트입니다. 골뱅이 뒤의 괄호가 래퍼의 init 호출이에요.

이런 자리들이 래퍼의 홈그라운드입니다. 저장 위치를 바꾸는 것(UserDefaults, 키체인), 접근을 감싸는 것(스레드 락, 로깅), 값을 다듬는 것(범위 제한, 트리밍). 공통점은 "값의 의미와 무관한, 저장·접근의 기술적 관심사"라는 거예요. 관심사 분리 관점에서 보면, 래퍼는 프로퍼티 선언에서 기술적 관심사를 분리해내는 도구입니다.

## 남용 경계 — 골뱅이 뒤에 숨는 복잡성

래퍼의 위험은 정확히 그 강점에서 나옵니다. 대입 한 줄 뒤에 임의의 코드가 숨을 수 있다는 것. 최소 놀람의 원칙과 정면으로 긴장하는 기능이에요.

경계 기준 세 가지를 제안합니다. 첫째, 래퍼 안에서는 예측 가능한 일만 합니다. 값을 다듬고 저장 위치를 바꾸는 건 좋지만, 네트워크 요청이나 화면 전환처럼 무거운 부수효과가 대입 뒤에 숨으면 디버깅 지옥이 됩니다. 둘째, 팀이 아는 래퍼만 씁니다. @State처럼 생태계 표준이거나, 팀 코드베이스에 문서화된 래퍼는 자산이지만, 파일마다 새 골뱅이가 등장하면 코드 리뷰가 래퍼 정의 찾기 게임이 돼요. 셋째, 한 번만 쓰이는 로직은 그냥 didSet으로 둡니다. 래퍼는 재사용이 목적이니, 두 번째 사용처가 나타날 때 승격시키는 게 맞습니다. YAGNI(You Aren't Gonna Need It — 필요해질 때까지 만들지 말라) 원칙 그대로요.

마지막으로 최신 방향 하나. Swift와 SwiftUI가 매크로 기반으로 이동하면서, Observation 프레임워크의 @Observable처럼 래퍼가 아니라 매크로인 골뱅이도 생겼습니다. 골뱅이가 붙었다고 다 프로퍼티 래퍼는 아니게 된 거죠. 매크로가 뭐고 래퍼와 뭐가 다른지는 심화 시리즈에서 다룰 예정입니다.

<figure>
  <img src="/assets/images/posts/33440ae0-f781-4765-a6c7-694f65980263/swift-property-wrapper-3.jpg" alt="이름·밑줄·달러 세 개의 문이 달린 프로퍼티 금고 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>이름·밑줄·달러, 한 프로퍼티에 문이 세 개 생깁니다</figcaption>
</figure>

## 정리

- 프로퍼티 래퍼는 SwiftUI 전유물이 아니라 Swift 5.1의 언어 기능(SE-0258)으로, 프로퍼티마다 반복되는 감싸기 로직을 타입으로 묶어 재사용하는 장치입니다.
- 원리는 번역입니다. @Wrapper var x는 "밑줄 래퍼 인스턴스(저장) + x라는 연산 프로퍼티(통로)"로 펼쳐집니다.
- $x는 projectedValue라는 세 번째 통로고, 무엇을 내어줄지는 래퍼 설계자의 결정입니다(@State는 Binding, @Published는 Publisher).
- 어울리는 자리는 저장 위치 변경·접근 감싸기·값 다듬기 같은 기술적 관심사이고, 무거운 부수효과와 일회성 로직은 래퍼에 넣지 않습니다.

다음 편은 중급 시리즈 마지막, KeyPath입니다. `\.name`이라는 백슬래시 문법이 프로퍼티를 값으로 다루는 원리, 그리고 map(\.name)이 가능해진 배경을 정리합니다.

---

## 참고 자료

- [SE-0258: Property Wrappers](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0258-property-wrappers.md)

<!-- RELATED-POSTS -->
## 이어서 읽기

- [프로토콜 지향 프로그래밍(POP), OOP 한계를 넘는 법](/%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-%EC%A7%80%ED%96%A5-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DPOP-OOP-%ED%95%9C%EA%B3%84%EB%A5%BC-%EB%84%98%EB%8A%94-%EB%B2%95/)
- [Swift DI 라이브러리 Factory 정리, Swinject와 뭐가 다를까](/Swift-DI-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-Factory-%EC%A0%95%EB%A6%AC-Swinject%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C/)
- [\[Swift 심화 #2\] Swift actor 완전 정리, 데이터 레이스 막는 법](/Swift-%EC%8B%AC%ED%99%94-2-Swift-actor-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%A0%88%EC%9D%B4%EC%8A%A4-%EB%A7%89%EB%8A%94-%EB%B2%95/)
<!-- /RELATED-POSTS -->
