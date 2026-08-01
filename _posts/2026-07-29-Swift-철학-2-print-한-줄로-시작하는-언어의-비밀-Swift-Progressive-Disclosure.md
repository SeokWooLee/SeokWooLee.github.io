---
title: "[Swift 철학 #2] print 한 줄로 시작하는 언어의 비밀, Swift Progressive Disclosure"
description: "Swift에는 이상한 공존이 있습니다. 프로그래밍을 처음 배우는 사람이 Playgrounds에서 print(\"Hello\") 한 줄로 시작하는 언어인데, 같은 언어로 제네릭과 매크로가 뒤엉킨 표준 라이브러리가 짜여 있어요. 초등학생용 코딩 교육 앱(Swift…"
header:
  og_image: /assets/images/posts/290b697a-f011-4cb7-8331-0a439b666fcd/1.png
tags:
  - Swift
  - 스위프트
  - ProgressiveDisclosure
  - SwiftUI
permalink: /Swift-철학-2-print-한-줄로-시작하는-언어의-비밀-Swift-Progressive-Disclosure/
toc: true
toc_sticky: true
last_modified_at: 2026-07-29
---

Swift에는 이상한 공존이 있습니다. 프로그래밍을 처음 배우는 사람이 Playgrounds에서 `print("Hello")` 한 줄로 시작하는 언어인데, 같은 언어로 제네릭과 매크로가 뒤엉킨 표준 라이브러리가 짜여 있어요. 초등학생용 코딩 교육 앱(Swift Playgrounds)과 컴파일러 수준의 시스템 코드가 문법을 공유하는 셈입니다.

보통 언어는 둘 중 하나를 고릅니다. 배우기 쉽거나(파이썬 계열), 강력하거나(C++ 계열). Swift는 둘 다 갖겠다고 선언했고, 그걸 가능하게 만든 설계 원칙에 이름이 있습니다. 점진적 공개, Progressive Disclosure입니다.

이 글은 Swift 철학 시리즈 2편입니다. 1편에서 다룬 Safe·Fast·Expressive가 "무엇을 만들 것인가"의 철학이라면, Progressive Disclosure는 "그걸 어떤 순서로 보여줄 것인가"의 철학이에요.

<figure>
  <img src="/assets/images/posts/290b697a-f011-4cb7-8331-0a439b666fcd/1.png" alt="print 한 줄에서 제네릭까지, 계단은 필요할 때만 열립니다">
  <figcaption>print 한 줄에서 제네릭까지, 계단은 필요할 때만 열립니다</figcaption>
</figure>

## 점진적 공개란 — 필요할 때까지 숨긴다

Progressive Disclosure는 원래 UI 설계 용어입니다. 자주 쓰는 기능만 먼저 보여주고 고급 기능은 "더 보기" 뒤에 숨겨서 초보자를 압도하지 않는 기법이에요. 카메라 앱이 셔터 버튼만 크게 보여주고 ISO·셔터스피드는 프로 모드에 숨겨두는 것처럼요.

Swift 팀은 이 원칙을 언어 문법에 적용했습니다. 공식적으로 표방한 목표이기도 합니다. 크리스 래트너는 Swift를 두고 "복잡성을 점진적으로 공개하는(progressive disclosure of complexity) 언어"라고 여러 인터뷰에서 설명했어요. 지금도 Swift Evolution 제안서 리뷰에서 "이 문법이 progressive disclosure를 해치지 않는가"가 심사 기준으로 등장합니다.

원칙을 한 문장으로 줄이면 이렇습니다.

> 개념을 아직 배우지 않은 사람의 코드에, 그 개념이 등장하지 않아야 한다.

단순히 "쉬운 기능도 있다"가 아닙니다. 쉬운 코드를 쓰는 동안에는 어려운 개념이 시야에 아예 들어오지 않아야 한다는, 훨씬 강한 요구예요.

## Hello World 비교 — 등장인물 수 세기

이 원칙이 실제로 뭘 바꾸는지는 Hello World만 비교해도 보입니다.

```java
// Java (11 이전)
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

이 다섯 줄을 온전히 이해하려면 클래스, 접근 제어자, static, 메서드, 배열, 표준 출력 객체를 알아야 합니다. 첫날 배우는 코드에 등장인물이 여섯 명인 거죠. 교사가 할 수 있는 말은 "일단 외우세요, 나중에 설명할게요"뿐입니다.

```swift
// Swift
print("Hello, world!")
```

Swift는 한 줄입니다. 파일 최상위에 실행 코드를 그냥 쓸 수 있고 세미콜론도 import도 없어요. 등장인물은 함수 호출 하나. "일단 외우세요"가 필요 없습니다.

핵심은 이겁니다. Swift에도 클래스, 접근 제어자, static이 전부 있습니다. 다만 이 코드에 등장하지 않을 뿐이에요. 개념이 없는 게 아니라, 아직 필요 없는 사람 눈에 안 보이는 겁니다.

## 같은 기능의 여러 층 — 문법이 계단식으로 열린다

Swift 문법을 뜯어보면 같은 기능이 여러 난이도 층으로 겹쳐 있는 걸 발견하게 됩니다. 몇 가지 대표 사례를 볼게요.

**함수 → 클로저 → 축약 클로저.** 배열 정렬을 예로 들면, 처음에는 이름 있는 함수를 넘기는 것으로 충분합니다.

```swift
func byLength(_ a: String, _ b: String) -> Bool {
    a.count < b.count
}
names.sorted(by: byLength)
```

클로저를 배우면 인라인으로 쓸 수 있어요.

```swift
names.sorted(by: { a, b in a.count < b.count })
```

축약 문법까지 익히면 이렇게 줄어듭니다.

```swift
names.sorted { $0.count < $1.count }
```

세 코드는 완전히 같은 일을 합니다. 후행 클로저와 `$0`을 몰라도 정렬은 첫날부터 할 수 있고 알고 나면 더 간결하게 쓸 수 있어요. 새 층을 배우는 게 필수가 아니라 보상인 구조입니다.

**타입 추론 → 명시적 타입.** `let age = 30`으로 시작하고, 타입 표기는 필요해지는 순간(정밀도 지정, API 경계)에만 등장합니다. 처음부터 `let age: Int = 30`을 강요하지 않아요.

**자동 멤버와이즈 init → 커스텀 init.** struct는 초기화 코드를 안 써도 컴파일러가 만들어줍니다. 초기화 로직이 필요해질 때 비로소 init 문법을 배우면 됩니다.

**에러 무시 → try? → do-catch → 타입드 throws.** 에러 처리도 관심 수준에 따라 골라 탈 수 있는 계단이 놓여 있습니다.

<figure>
  <img src="/assets/images/posts/290b697a-f011-4cb7-8331-0a439b666fcd/2.png" alt="자주 쓰는 것만 보여주고 고급 기능은 뒤로, UI의 점진적 공개 원칙입니다" loading="lazy">
  <figcaption>자주 쓰는 것만 보여주고 고급 기능은 뒤로, UI의 점진적 공개 원칙입니다</figcaption>
</figure>

## 시야 밖의 복잡성 — 안 보이는 곳에서 일하는 것들

문법 계단보다 더 인상적인 건, 고급 기능이 초급 코드를 뒤에서 떠받치는 구조입니다.

`print("Hello")`의 그 print의 실제 선언은 이렇게 생겼습니다.

```swift
func print(
    _ items: Any...,
    separator: String = " ",
    terminator: String = "\n"
)
```

가변 인자, 기본값 매개변수, Any 타입. 초보자가 아직 모르는 개념 세 개가 선언에 들어 있지만, 호출하는 쪽에서는 하나도 몰라도 됩니다. 기본값 매개변수라는 고급 기능이 있기에 초급 사용법이 단순해질 수 있었던 거예요. 고급 기능이 복잡성을 더하는 게 아니라 흡수하는 방향으로 쓰인 겁니다.

문자열 보간(`"이름: \(name)"`)도 같은 구조입니다. 쓰는 사람에게는 첫 주에 배우는 기초 문법이지만, 그 밑에는 ExpressibleByStringInterpolation 프로토콜이라는 커스터마이징 계층이 통째로 숨어 있습니다. SwiftUI의 Text가 문자열 보간으로 이미지와 날짜 포매팅까지 받아내는 게 이 계층 덕분이에요. 99%의 사용자는 이 프로토콜의 존재를 모른 채 평생 잘 씁니다. 그 문을 여는 건 라이브러리 작성자뿐이에요.

SwiftUI는 이 원칙의 종합판입니다.

```swift
struct ContentView: View {
    var body: some View {
        Text("Hello")
    }
}
```

이 짧은 코드 밑에 opaque type(some), resultBuilder, 프로토콜 연관 타입이 깔려 있습니다. 전부 Swift에서 어렵기로 손꼽히는 기능들인데, UI를 처음 만드는 사람은 존재조차 모른 채 화면을 띄웁니다. "some View가 뭐예요?"라는 질문은 보통 몇 달 뒤에야 나오고 그때 배우면 됩니다.

## 반대편 사례 — 이 원칙이 없으면 생기는 일

원칙의 가치는 없는 언어와 비교할 때 선명해집니다.

C++를 배울 때는 첫 주부터 포인터, 참조, 복사 생성자 같은 메모리 개념이 문법 표면에 노출됩니다. 숨겨진 게 아니라 비켜갈 수 없는 관문이에요. Rust는 안전을 위해 소유권과 라이프타임을 모든 사용자에게 선불로 요구합니다. 훌륭한 설계지만, "첫 프로그램을 짜는 데 필요한 개념 수"라는 잣대에서는 정반대 극단에 있죠.

흥미로운 건 다른 언어들이 Swift와 같은 방향으로 이동해왔다는 점입니다. Java는 21에서 `void main()`만으로 실행되는 암시적 클래스를 도입했고(JEP 445, Java 개선 제안), C#은 톱레벨 문(top-level statements)을 추가했습니다. 둘 다 명분이 같아요. 초보자의 첫 코드에서 의식(ceremony)을 걷어내겠다는 겁니다. Swift가 2014년에 기본값으로 깔고 시작한 것을, 앞 세대 언어들이 십 년에 걸쳐 따라온 셈입니다.

<figure>
  <img src="/assets/images/posts/290b697a-f011-4cb7-8331-0a439b666fcd/3.png" alt="Text(&quot;Hello&quot;) 밑에는 resultBuilder와 opaque type이 잠겨 있습니다" loading="lazy">
  <figcaption>Text(&quot;Hello&quot;) 밑에는 resultBuilder와 opaque type이 잠겨 있습니다</figcaption>
</figure>

## 비판도 있다 — 계단이 무너지는 지점

공정하게 말하면, Swift가 이 원칙을 완벽하게 지켰다는 평가만 있는 건 아닙니다.

가장 큰 비판은 언어가 커지면서 중간 계단이 가팔라졌다는 겁니다. 입문은 쉬운데, 실무 코드나 라이브러리 코드로 넘어가는 순간 제네릭 제약, some과 any 구분, Sendable 표기가 한꺼번에 쏟아져요. 특히 Swift 6의 strict concurrency는 "동시성을 아직 안 배운 사람의 코드에 컴파일 에러를 띄운다"는 점에서 progressive disclosure와 정면충돌한다는 지적을 받았습니다. 크리스 래트너조차 Swift가 복잡해졌다는 취지의 발언을 한 적이 있고요.

Swift 팀도 이 긴장을 인지하고 있습니다. Swift 6.1 이후의 여러 제안(기본 액터 격리 옵션, 이름 없는 main 등)이 "동시성 개념을 만나기 전까지는 만나지 않게 하자"는 방향으로 정리되고 있는 게 그 증거입니다. 원칙이 완성된 상태가 아니라, 지금도 지키려고 싸우는 중인 가치에 가깝다고 보는 게 정확합니다.

## 실무자에게 주는 교훈 — API 설계의 잣대로

이 원칙이 언어 사용자에게만 해당하는 이야기는 아닙니다. 우리가 매일 만드는 함수와 모듈에 그대로 적용되는 설계 잣대예요.

**기본값 매개변수로 흔한 경우를 공짜로 만들기.** print의 separator처럼, 90%의 호출자가 신경 안 쓸 옵션은 기본값 뒤로 숨깁니다. 설정 객체를 통째로 요구하는 API와 비교해보세요.

**단순한 진입점 하나, 고급 오버로드는 뒤에.** URLSession이 좋은 예입니다. `data(from: url)` 한 줄로 시작할 수 있고, 델리게이트와 설정이 필요한 사람에게는 그 층이 따로 열려 있습니다.

**호출부에 낯선 개념이 새어 나오면 설계 신호.** 내 라이브러리를 쓰는 데 제네릭 시그니처를 읽어야 한다면, 흡수했어야 할 복잡성이 누출되고 있는 겁니다. print가 가변 인자를 쓰면서도 호출부를 단순하게 유지한 것처럼, 복잡성은 선언 쪽이 삼키는 게 맞습니다.

요약하면 이렇습니다. 좋은 API는 기능이 적은 API가 아니라, 배우지 않은 기능이 보이지 않는 API입니다.

## 정리

- Progressive Disclosure는 "아직 안 배운 개념이 코드에 등장하지 않게 한다"는 Swift의 공식 설계 원칙입니다.
- print 한 줄 Hello World, 타입 추론, 자동 init, 클로저 축약 계단이 전부 이 원칙의 산물입니다.
- 고급 기능(기본값 매개변수, resultBuilder, 문자열 보간 프로토콜)은 초급 코드의 복잡성을 흡수하는 방향으로 설계됐습니다.
- Swift 6 동시성처럼 원칙이 흔들린 지점도 있고, 언어 팀은 지금도 계단을 고치는 중입니다.
- 같은 잣대를 우리 API에 적용할 수 있습니다. 흔한 사용은 한 줄로, 복잡성은 선언 쪽이 흡수하도록.

다음 편은 세 번째 철학 이야기입니다. Swift 표준 라이브러리는 왜 거의 전부 struct로 만들어졌을까요. 값 타입 우선주의를 다룹니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[Swift 철학 #3] Swift는 왜 전부 struct일까? 값 타입 우선주의 총정리](/Swift-%EC%B2%A0%ED%95%99-3-Swift%EB%8A%94-%EC%99%9C-%EC%A0%84%EB%B6%80-struct%EC%9D%BC%EA%B9%8C-%EA%B0%92-%ED%83%80%EC%9E%85-%EC%9A%B0%EC%84%A0%EC%A3%BC%EC%9D%98-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 철학 #4] SE-0296이 뭐길래? Swift 문법이 태어나는 절차, Swift Evolution 총정리](/Swift-%EC%B2%A0%ED%95%99-4-SE-0296%EC%9D%B4-%EB%AD%90%EA%B8%B8%EB%9E%98-Swift-%EB%AC%B8%EB%B2%95%EC%9D%B4-%ED%83%9C%EC%96%B4%EB%82%98%EB%8A%94-%EC%A0%88%EC%B0%A8-Swift-Evolution-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
- [[Swift 중급 #1] Swift ARC 완전 정리, weak vs unowned는 수명 관계로 고릅니다](/Swift-%EC%A4%91%EA%B8%89-1-Swift-ARC-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-weak-vs-unowned%EB%8A%94-%EC%88%98%EB%AA%85-%EA%B4%80%EA%B3%84%EB%A1%9C-%EA%B3%A0%EB%A6%85%EB%8B%88%EB%8B%A4/)
<!-- /RELATED-POSTS -->
