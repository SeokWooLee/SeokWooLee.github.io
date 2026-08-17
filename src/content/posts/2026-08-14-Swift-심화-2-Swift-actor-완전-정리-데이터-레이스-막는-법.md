---
title: "[Swift 심화 #2] Swift actor 완전 정리, 데이터 레이스 막는 법"
description: "actor는 자기 상태를 스스로 지키는 네 번째 타입 종류입니다. 동시 접근을 줄 세워 데이터 레이스를 컴파일러가 잡는 문제로 바꾸는 원리와, 가장 유명한 함정인 재진입(reentrancy)까지 정리했습니다."
header:
  og_image: /assets/images/posts/d7809f68-f42a-4283-a270-2c25867c9087/swift-actor-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - actor
  - 액터
permalink: /Swift-심화-2-Swift-actor-완전-정리-데이터-레이스-막는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-08-14
---

Swift Concurrency 연작 2편의 주인공은 actor입니다. class도 struct도 아닌 네 번째 타입 종류가 언어에 추가된 건데요.

새 타입 종류가 필요했을 만큼 심각한 문제가 있었다는 뜻이기도 합니다. 그 문제, 데이터 레이스부터 정확히 짚고 시작할게요.

<figure>
  <img src="/assets/images/posts/d7809f68-f42a-4283-a270-2c25867c9087/swift-actor-1.jpg" alt="ACTOR 텍스트와 한 줄로 선 요청들이 통과하는 단일 관문 요새 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>actor는 상태 보호가 내장된 네 번째 타입 종류입니다</figcaption>
</figure>

## 데이터 레이스 — 가장 악질적인 버그의 조건

데이터 레이스(data race)는 조건이 명확합니다. 둘 이상의 스레드가 같은 메모리에 동시에 접근하고, 그중 하나 이상이 쓰기일 때.

이 조건이 성립하면 결과는 미정의 동작입니다. 값이 깨지거나, 크래시가 나거나, 아무 일 없이 지나가거나.

어느 쪽일지는 그날의 스케줄링 운에 달렸어요.

```swift
final class Counter {
    var value = 0
    func increment() { value += 1 }  // 읽기-더하기-쓰기, 3단계
}
// 두 스레드가 동시에 increment()를 부르면
// 1000번 호출해도 value가 1000이 아닐 수 있습니다
```

`value += 1`은 원자적이지 않습니다. 읽고, 더하고, 쓰는 세 단계 사이에 다른 스레드가 끼어들면 증가분이 증발해요.

이 버그가 악질인 이유는 재현이 안 되기 때문입니다. 타이밍이 맞아야만 터지니 테스트는 통과하고, 출시 후 간헐적 크래시 리포트로 돌아옵니다.

값 타입 편에서 "값 타입은 공유 자체가 없어 레이스의 전제가 사라진다"고 했던 게 이 문제였습니다. 남는 건 공유가 목적인 참조 타입들이고요.

전통 해법은 잠금이었습니다. 락, 세마포어, 직렬 DispatchQueue.

다 동작하지만 공통 약점이 있어요. 지키는 건 전적으로 개발자의 규율이라는 것.

락 잡는 걸 한 군데만 깜빡해도 끝이고, 컴파일러는 그 실수를 볼 수 없습니다.

어디서 많이 듣던 구도죠. nil 체크(옵셔널 편), 순환 참조(ARC 편)처럼, Swift는 "규율에 맡겨진 것"을 타입 시스템으로 끌어올리는 언어입니다.

데이터 레이스 차례가 된 겁니다.

## actor — 자기 상태를 지키는 타입

actor는 한 문장으로 "상태 보호가 내장된 참조 타입"입니다.

```swift
actor Counter {
    var value = 0
    func increment() { value += 1 }
}
```

class를 actor로 바꾸는 것만으로 얻는 보장은 이렇습니다. 이 타입의 저장 프로퍼티에는 한 번에 하나의 실행만 접근할 수 있다.

actor마다 직렬 실행기(serial executor)가 붙어서 메서드 호출들이 줄을 서서 하나씩 처리됩니다. increment의 3단계 사이에 다른 호출이 끼어들 수 없으니 레이스가 성립 자체를 못 해요.

핵심은 이걸 컴파일러가 강제한다는 점입니다. actor 밖에서 안의 상태나 메서드에 접근하는 코드는 await를 붙여야만 컴파일됩니다.

```swift
let counter = Counter()
await counter.increment()          // 밖에서는 await 필수
print(await counter.value)
```

await가 붙는 이유는 1편의 suspension 개념 그대로입니다. actor가 다른 일을 처리 중이면 내 요청은 줄을 서야 하고, 기다리는 동안 스레드를 붙잡지 않고 양보하는 거예요.

락처럼 스레드를 재우며 기다리는 게 아닙니다. 함수가 중단됐다가 차례가 오면 재개됩니다.

반대로 actor 내부 코드끼리는 await 없이 자유롭게 접근합니다. 이미 격리 안이니까요.

이 "안이냐 밖이냐"의 경계가 1편에서 소개한 격리(isolation)의 실체입니다.

@MainActor는 이 개념의 전역 버전입니다. "메인 스레드"라는 하나의 직렬 맥락을 전역 actor로 만들어둔 것이고, UI 상태를 지키는 격리로 쓰입니다.

원리는 커스텀 actor와 동일해요.

<figure>
  <img src="/assets/images/posts/d7809f68-f42a-4283-a270-2c25867c9087/swift-actor-2.jpg" alt="동시 접근으로 깨지는 크리스털과 줄 세워 안전해진 접근을 대비한 도식" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>동시 접근을 줄 세우면 레이스는 성립 자체를 못 합니다</figcaption>
</figure>

## reentrancy — actor의 가장 유명한 함정

여기까지만 들으면 actor가 만능 같지만 설계상 함정이 하나 있습니다. actor는 재진입(reentrant)을 허용합니다.

actor 메서드 안에서 await를 만나면, 그 메서드는 중단되고 actor는 비어 있는 상태가 됩니다. 그 사이에 다른 호출이 actor에 들어와 실행될 수 있어요.

재개된 원래 메서드가 돌아왔을 때, actor의 상태는 중단 전과 다를 수 있다는 뜻입니다.

```swift
actor ImageCache {
    var cache: [URL: Image] = [:]

    func image(for url: URL) async -> Image {
        if let cached = cache[url] { return cached }
        let image = await download(url)   // 중단 지점 — 이 사이에 다른 호출 진입 가능
        cache[url] = image                // 같은 URL이 이미 저장됐을 수도
        return image
    }
}
```

같은 URL로 두 요청이 거의 동시에 오면, 둘 다 캐시 미스를 보고 둘 다 다운로드합니다. 데이터가 깨지는 건 아니지만(그건 actor가 막습니다) 논리가 중복 실행되는 거죠.

중요한 규칙으로 정리하면 이렇습니다. actor는 저수준 데이터 레이스는 막지만, await를 사이에 둔 논리적 일관성은 지켜주지 않는다.

await 전후로 상태 가정이 유효한지 다시 확인하는 건 여전히 설계자의 몫입니다. 위 예시라면 "진행 중인 다운로드 Task를 캐시에 저장"하는 패턴으로 중복 실행을 막습니다.

왜 이런 설계일까요. 재진입을 금지하면 actor가 await 동안 문을 잠가야 하는데, 그러면 서로를 기다리는 actor 둘이 영원히 멈추는 교착(deadlock)이 가능해집니다.

Swift는 교착 없는 시스템을 택하고, 논리적 일관성은 개발자에게 남긴 거예요. 트레이드오프의 방향을 알아두면 함정이 예측 가능해집니다.

## 실무 배치 — 어디에 actor를 쓰나

actor가 어울리는 자리는 명확합니다. 여러 비동기 맥락이 공유하는 가변 상태의 소유자.

캐시, 커넥션 풀, 다운로드 관리자, 세션 저장소 같은 것들요. "이 상태를 누가 지키는가"의 답이 필요한 곳마다 actor가 후보입니다.

반대로 어울리지 않는 자리도 분명합니다. 첫째, 공유되지 않는 상태.

한 화면 안에서만 쓰는 뷰모델이라면 @MainActor 클래스가 맞습니다. 커스텀 actor로 만들면 UI 접근마다 불필요한 await만 늘어납니다.

둘째, 불변 데이터. 애초에 레이스가 없으니 struct나 let이면 충분해요. 값 타입 우선주의 그대로입니다.

셋째, 호출 빈도가 극단적으로 높은 핫패스. actor 경계를 넘는 호출은 직렬화 비용이 있으니, 초당 수십만 번 부르는 자리라면 설계를 다시 볼 신호입니다.

그리고 균형을 위해 하나 더. 단순한 원자적 카운터나 플래그 하나를 지키는 데는 actor가 과할 수 있습니다.

그런 자리는 Mutex(Swift 6의 Synchronization 모듈) 같은 저수준 도구가 더 가볍고 await도 필요 없어요. actor는 "지킬 상태와 그걸 다루는 로직이 한 덩어리"일 때 빛나는 도구입니다.

<figure>
  <img src="/assets/images/posts/d7809f68-f42a-4283-a270-2c25867c9087/swift-actor-3.jpg" alt="await 사이에 다른 호출이 들어와 상태를 바꾸는 재진입 상황 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>재진입: await 사이에 다른 호출이 들어와 상태를 바꿀 수 있습니다</figcaption>
</figure>

## 정리

- 데이터 레이스는 "동시 접근 + 하나 이상의 쓰기"로 성립하는 미정의 동작이고, 재현이 안 되어 가장 악질적입니다. 락은 동작하지만 규율에 의존합니다.
- actor는 상태 보호가 내장된 참조 타입입니다. 직렬 실행기가 접근을 줄 세우고, 밖에서의 접근에 await를 컴파일러가 강제합니다.
- @MainActor는 메인 스레드를 전역 actor로 만든 것으로, UI 격리의 표준입니다.
- actor는 재진입을 허용합니다. await 전후로 상태가 달라질 수 있으니, 저수준 레이스 방지와 별개로 논리적 일관성은 직접 지켜야 합니다.
- 자리는 "공유 가변 상태의 소유자"입니다. 비공유 상태·불변 데이터·극단적 핫패스에는 과한 도구입니다.

다음 편은 이 격리 체계의 마지막 조각, Sendable입니다. "격리 경계를 넘어도 안전한 타입"이 뭔지, 그리고 Swift 6의 strict concurrency가 기존 코드에 쏟아내는 경고들을 어떻게 읽어야 하는지 다룹니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [델리게이트(Delegate) vs 클로저(Closure), 콜백 선택 기준 3가지](/%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8Delegate-vs-%ED%81%B4%EB%A1%9C%EC%A0%80Closure-%EC%BD%9C%EB%B0%B1-%EC%84%A0%ED%83%9D-%EA%B8%B0%EC%A4%80-3%EA%B0%80%EC%A7%80/)
- [\[Swift 심화 #4\] 구조적 동시성, Task를 함부로 열면 안 되는 이유](/Swift-%EC%8B%AC%ED%99%94-4-%EA%B5%AC%EC%A1%B0%EC%A0%81-%EB%8F%99%EC%8B%9C%EC%84%B1-Task%EB%A5%BC-%ED%95%A8%EB%B6%80%EB%A1%9C-%EC%97%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
<!-- /RELATED-POSTS -->
