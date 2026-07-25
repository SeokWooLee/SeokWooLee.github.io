---
title: "SwiftUI 의존성 주입, EnvironmentObject에서 프로토콜 DI까지 (실전 정리)"
description: "SwiftUI로 앱을 키우다 보면 의존성 주입이라는 말만 들어도 괜히 어깨가 움츠러들기 쉬워요."
header:
  og_image: /assets/images/posts/f233fa1d-e3e7-4fa4-924c-e579389d1edb/1.png
tags:
  - SwiftUI
  - 의존성주입
  - EnvironmentObject
  - 프로토콜DI
permalink: /SwiftUI-의존성-주입-EnvironmentObject에서-프로토콜-DI까지-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-25
---

SwiftUI로 앱을 키우다 보면 의존성 주입이라는 말만 들어도 괜히 어깨가 움츠러들기 쉬워요.

EnvironmentObject 하나면 다 될 것 같지만, 앱이 조금만 커지면 여기저기서 삐걱대기 시작하죠.

이 글에서는 SwiftUI 의존성 주입을 EnvironmentObject에서 시작해 프로토콜 기반 DI(Dependency Injection)까지, 제가 정리한 순서 그대로 풀어볼게요.

> EnvironmentObject는 화면끼리 값을 나눠 쓰는 도구입니다. 진짜 갈아끼우기 쉬운 구조를 원한다면 서비스를 프로토콜로 추상화해서 주입하는 방식이 답이었습니다.

<figure>
  <img src="/assets/images/posts/f233fa1d-e3e7-4fa4-924c-e579389d1edb/1.png" alt="SwiftUI 의존성 주입, 이 그림 한 장이면 두 방식 차이가 정리됩니다">
  <figcaption>SwiftUI 의존성 주입, 이 그림 한 장이면 두 방식 차이가 정리됩니다</figcaption>
</figure>

---

## 의존성 주입이 대체 뭔가요?

의존성 주입을 어렵게 설명하는 글이 많은데, 저는 이렇게 설명합니다.

객체가 자기가 쓸 도구를 스스로 만들지 않고, 밖에서 건네받는 것.

예를 들어 ViewModel이 네트워크 서비스를 내부에서 직접 new 해버리면, 나중에 테스트할 때 진짜 서버를 때려야 합니다.

그런데 그 서비스를 밖에서 넣어주면, 테스트할 땐 가짜 서비스를 넣어주면 되는 거죠.

이게 전부입니다. 개념 자체는 정말 단순해요.

---

## EnvironmentObject부터 시작해봤어요

SwiftUI를 배우면 가장 먼저 만나는 게 EnvironmentObject입니다.

부모 뷰에서 하나 꽂아두면 자식 뷰 어디서든 꺼내 쓸 수 있어서 처음엔 정말 편했어요.

아래처럼 최상위에서 한 번 주입하면 자식 뷰에서 바로 꺼내 씁니다.

```swift
class UserStore: ObservableObject {
    @Published var name = ""
}
// 최상위에서 주입
ContentView().environmentObject(UserStore())
// 어느 자식 뷰에서든
@EnvironmentObject var store: UserStore
```

로그인 상태나 테마처럼 앱 전역에서 공유하는 값에는 이만한 게 없어요.

<figure>
  <img src="/assets/images/posts/f233fa1d-e3e7-4fa4-924c-e579389d1edb/2-1783804356060.png" alt="주입 하나 깜빡하면 컴파일은 조용하고 런타임에 죽습니다" loading="lazy">
  <figcaption>주입 하나 깜빡하면 컴파일은 조용하고 런타임에 죽습니다</figcaption>
</figure>

문제는 화면이 늘어나면서 생겼습니다. EnvironmentObject를 주입하는 걸 깜빡하면 런타임에 앱이 그냥 죽어버려요. 컴파일 때는 아무 말도 안 해주고요.

이건 어디까지나 뷰 계층에 묶인 도구라 뷰 바깥의 순수한 로직에서 쓰기엔 영 어색했습니다.

---

## 그래서 프로토콜 DI로 넘어갔습니다

여기서부터가 진짜입니다. 서비스를 구체 타입이 아니라 프로토콜로 정의해두는 거예요.

아래는 실제 구현과 테스트용 가짜 구현을 같은 프로토콜로 묶은 예시입니다.

```swift
protocol WeatherService {
    func fetch() async -> Int
}
struct RealWeather: WeatherService {
    func fetch() async -> Int { 23 }
}
struct MockWeather: WeatherService {
    func fetch() async -> Int { 999 } // 테스트용 고정값
}
```

ViewModel은 RealWeather를 모릅니다. 오직 WeatherService라는 약속만 알죠.

<figure>
  <img src="/assets/images/posts/f233fa1d-e3e7-4fa4-924c-e579389d1edb/4-1783847644575.png" alt="ViewModel 눈엔 프로토콜만 보여요" loading="lazy">
  <figcaption>ViewModel 눈엔 프로토콜만 보여요</figcaption>
</figure>

그래서 실제 앱에선 RealWeather를, 테스트에선 MockWeather를 넣어주면 코드를 한 줄도 안 바꾸고 동작을 바꿀 수 있어요.

저는 이 구조로 바꾸고 나서 테스트 코드 짜는 게 훨씬 편해졌습니다.

<figure>
  <img src="/assets/images/posts/f233fa1d-e3e7-4fa4-924c-e579389d1edb/3.png" alt="실전에선 RealWeather 자리에 MockWeather만 갈아끼우면 끝이에요" loading="lazy">
  <figcaption>실전에선 RealWeather 자리에 MockWeather만 갈아끼우면 끝이에요</figcaption>
</figure>

---

## EnvironmentObject랑 프로토콜 DI, 언제 뭘 쓰나요?

둘 중 하나만 고르는 게 아니라 역할이 다릅니다. 제가 쓰면서 잡은 기준을 표로 정리해봤어요.

| 구분 | EnvironmentObject | 프로토콜 DI |
|---|---|---|
| 주 목적 | 화면 간 상태 공유 | 로직 의존성 교체 |
| 뷰 계층 결합 | 강함 (뷰에 묶임) | 없음 (뷰와 무관) |
| 테스트 교체 | 어려움 | 아주 쉬움 |
| 주입 누락 시 | 런타임 크래시 | 컴파일 단계에서 방지 |

실무에서는 전역 상태는 EnvironmentObject로, 갈아끼워야 하는 서비스는 프로토콜 DI로 나눠 쓰는 조합이 제일 무난했어요.

---

## 마무리

지금 규모가 작다면 EnvironmentObject로 충분하지만 테스트를 진지하게 생각한다면 서비스는 프로토콜로 감싸두는 습관을 미리 들이시길 권해요. 나중의 내가 정말 고마워합니다.
