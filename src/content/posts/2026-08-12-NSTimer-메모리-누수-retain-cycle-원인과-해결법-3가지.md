---
title: "NSTimer 메모리 누수, retain cycle 원인과 해결법 3가지"
description: "반복 NSTimer는 target을 강하게 참조해 invalidate() 전까지 뷰컨트롤러가 해제되지 않습니다. 순환 참조가 만들어지는 구조와 블록 기반 API, 생명주기 invalidate, weak proxy 세 해법을 정리했습니다."
header:
  og_image: /assets/images/posts/f7104ca4-7030-412c-a735-fd641940d025/nstimer-retain-cycle-1.jpg
categories:
  - iOS
  - Swift
tags:
  - NSTimer
  - Timer
  - retainCycle
  - 순환참조
permalink: /NSTimer-메모리-누수-retain-cycle-원인과-해결법-3가지/
toc: true
toc_sticky: true
last_modified_at: 2026-08-12
---

화면을 닫았는데 deinit이 호출되지 않는다면, 용의자 목록 맨 위에 올려야 할 게 하나 있습니다. 바로 NSTimer(Swift에선 Timer)입니다.

결론부터 말씀드릴게요.

> 반복 타이머는 target을 강하게 참조합니다.
>
> `invalidate()`를 부르기 전까지 그 뷰컨트롤러는 절대 해제되지 않습니다.

Effective Objective-C 2.0의 마지막 52번 항목이 통째로 이 문제를 다룰 만큼 고전적인 함정인데, Swift 시대에도 그대로 유효합니다.

<figure>
  <img src="/assets/images/posts/f7104ca4-7030-412c-a735-fd641940d025/nstimer-retain-cycle-1.jpg" alt="TIMER RETAIN CYCLE 텍스트와 사슬로 묶인 스톱워치·스마트폰 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>NSTimer retain cycle, 가위가 끊어야 할 고리는 하나입니다</figcaption>
</figure>

---

## 핵심 요약부터 (3가지)

1. `Timer.scheduledTimer(target:)`은 target을 **강한 참조**로 붙잡습니다.
2. 뷰컨트롤러가 타이머를 프로퍼티로 들고 있으면 **순환 참조**가 완성됩니다.
3. 해법은 세 가지 — **블록 기반 API + weak**, **deinit이 아닌 곳에서 invalidate**, **weak proxy 패턴**.

---

## 순환 참조가 만들어지는 구조

문제의 코드는 이렇게 생겼습니다.

```swift
class PollingViewController: UIViewController {
    var timer: Timer?

    override func viewDidLoad() {
        super.viewDidLoad()
        timer = Timer.scheduledTimer(
            timeInterval: 5.0,
            target: self,          // 타이머가 self를 강하게 붙잡음
            selector: #selector(refresh),
            userInfo: nil,
            repeats: true
        )
    }

    deinit {
        timer?.invalidate()        // 영원히 호출되지 않음
    }
}
```

참조 관계를 따라가 보면 이렇습니다.

- 뷰컨트롤러 → timer 프로퍼티로 타이머를 강하게 참조
- 타이머 → target인 self(뷰컨트롤러)를 강하게 참조
- 덤으로 RunLoop → 타이머를 강하게 참조

"deinit에서 invalidate하면 되지 않나?"가 함정의 핵심입니다. 타이머가 뷰컨트롤러를 붙잡고 있으니 참조 카운트가 0이 될 수 없고 deinit은 영원히 오지 않습니다. 화면을 pop해도 뒤에서 5초마다 refresh가 계속 도는 상태, 메모리 누수에 배터리 누수까지 겹칩니다.

<figure>
  <img src="/assets/images/posts/f7104ca4-7030-412c-a735-fd641940d025/nstimer-retain-cycle-2.png" alt="타이머와 뷰컨트롤러의 순환 참조를 weak proxy 구조로 바꾼 비교 다이어그램" width="1096" height="1484" loading="lazy" decoding="async">
  <figcaption>왼쪽 고리를 오른쪽 구조로 바꾸는 게 핵심입니다</figcaption>
</figure>

---

## 해법 1: 블록 기반 API (iOS 10+)

가장 깔끔한 현대적 해법입니다. target 방식 대신 클로저를 받고 캡처만 weak로 처리하면 됩니다.

```swift
timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
    self?.refresh()
}
```

타이머는 여전히 RunLoop에 붙잡혀 있지만 뷰컨트롤러를 강하게 참조하는 고리가 없습니다. 뷰컨트롤러가 해제되면 deinit에서 invalidate가 정상적으로 호출됩니다.

Effective Objective-C가 제안하는 카테고리 해법도 본질은 같습니다. iOS 10 이전엔 블록 기반 API가 없어서, NSTimer에 블록을 userInfo로 넘기는 카테고리를 직접 만들어 쓰라고 권했습니다.

## 해법 2: 생명주기에 맞춰 invalidate

deinit이 아니라 **화면이 사라지는 시점**에 정리하는 방법입니다.

```swift
override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    timer?.invalidate()
    timer = nil
}
```

invalidate를 호출하는 순간 타이머가 target에 대한 강한 참조를 놓기 때문에 순환이 끊어집니다. 다만 viewWillAppear에서 다시 만들어주는 짝 코드가 필요하고 화면 위에 다른 화면이 잠깐 덮였다 돌아오는 경우까지 고려해야 해서 관리 포인트가 늘어납니다.

## 해법 3: weak proxy 패턴

target을 꼭 넘겨야 하는 상황(iOS 9 지원, CADisplayLink 등)을 위한 고전 패턴입니다. 타이머와 뷰컨트롤러 사이에 **약한 참조만 가진 대리인**을 끼워 넣습니다.

```swift
final class WeakProxy: NSObject {
    weak var target: NSObjectProtocol?

    init(target: NSObjectProtocol) {
        self.target = target
        super.init()
    }

    override func forwardingTarget(for aSelector: Selector!) -> Any? {
        target
    }
}

timer = Timer.scheduledTimer(
    timeInterval: 5.0,
    target: WeakProxy(target: self),   // 타이머는 프록시만 강하게 참조
    selector: #selector(refresh),
    userInfo: nil,
    repeats: true
)
```

타이머가 강하게 붙잡는 건 프록시뿐이고 프록시는 뷰컨트롤러를 weak로만 바라봅니다. 뷰컨트롤러가 해제되면 프록시로 온 메시지는 forwardingTarget을 통해 nil로 흘러가 조용히 사라집니다. Objective-C 런타임의 메시지 포워딩을 순환 참조 해결에 응용한 사례입니다.

CADisplayLink는 아직도 target 방식만 제공하기 때문에, 이 패턴은 지금도 현역입니다.

<figure>
  <img src="/assets/images/posts/f7104ca4-7030-412c-a735-fd641940d025/nstimer-retain-cycle-3.jpg" alt="Xcode 메모리 그래프 디버거에 누수 경고 아이콘이 뜬 노트북 화면" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>화면 닫고 deinit 로그부터 확인해보세요</figcaption>
</figure>

---

## 마무리

- 반복 타이머 + target: self + 프로퍼티 보관 = 순환 참조 3종 세트입니다
- deinit에서 invalidate하겠다는 계획은 구조적으로 성립하지 않습니다
- 기본은 블록 기반 API + `[weak self]`, CADisplayLink처럼 target이 강제되는 API엔 weak proxy를 쓰세요
- 화면을 닫고 deinit 로그가 찍히는지 확인하는 습관이 이 문제를 가장 싸게 잡아냅니다

10년 넘은 책의 마지막 항목이 아직도 최신 코드리뷰에서 지적되는 걸 보면, 프레임워크는 바뀌어도 참조 관계의 원리는 그대로라는 생각이 듭니다.

---

## 참고 자료

- [Timer (Apple Developer)](https://developer.apple.com/documentation/foundation/timer)
