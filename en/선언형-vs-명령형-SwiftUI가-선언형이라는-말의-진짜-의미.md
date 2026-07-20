---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Declarative vs. Imperative: What It Actually Means When SwiftUI Calls Itself Declarative"
lang: en
description: "The first line of SwiftUI's introduction always includes the phrase \"declarative framework.\" React calls itself declarative too. So does Jetpack Compose."
header:
  og_image: /assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/1.png
tags:
  - declarative programming
  - imperative programming
  - SwiftUI
  - UIKit
  - declarative vs imperative
  - functional programming
  - state management
  - iOS interview
  - swift development
  - cs fundamentals
permalink: /en/선언형-vs-명령형-SwiftUI가-선언형이라는-말의-진짜-의미/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · **English** · [日本語](/ja/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · [中文](/zh/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/)
{: .notice--info}

The first line of SwiftUI's introduction always includes the phrase "declarative framework." React calls itself declarative too. So does Jetpack Compose.

But ask someone "what does declarative actually mean?" and the answer gets fuzzy fast. "It means the code looks clean" isn't the right answer.

The line between declarative and imperative comes down to one sentence: **do you write the "How," or do you write the "What"?**

This piece uses that distinction as the baseline, walks through it with an everyday example, checks it against UIKit and SwiftUI code, and closes with the point that declarative isn't free.

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/1.png" alt="Taxi ride analogy comparing declarative and imperative programming">
  <figcaption>Give turn-by-turn directions yourself, that's imperative. Just name the destination, that's declarative.</figcaption>
</figure>

Here's the core summary.

1. Imperative: you spell out, step by step, the procedure for reaching a result — the How
2. Declarative: you describe what result you want, and leave the procedure to the system — the What
3. SQL, HTML, map/filter, and SwiftUI are all classic examples of declarative style
4. The essence of declarative UI: declare "when the state looks like this, the screen looks like this," and the framework handles updates as state changes

---

## Think of it like taking a taxi

Imperative is giving the driver turn-by-turn directions yourself. "Turn right, go straight for 300 meters, turn left at the light..." You dictate each step of the procedure, and the sum of those steps produces the result: arriving at your destination.

Declarative is saying "Take me to Gangnam Station." You state only the destination (What) and leave the route selection (How) to the driver and the navigation system.

Both get you there. The difference is **whether you own the procedure, or you only own the description of the result.**

---

## In code, the same task written two ways

Here's the same task — filter even numbers and square them — written both ways.

```swift
// Imperative: I dictate how to iterate and where to store results
var result: [Int] = []
for n in numbers {
    if n % 2 == 0 {
        result.append(n * n)
    }
}

// Declarative: describe only what you want
let result = numbers.filter { $0 % 2 == 0 }.map { $0 * $0 }
```

The imperative version exposes the "parts of the procedure" — the loop variable, the intermediate array, the order of operations. The declarative version leaves only the intent behind: "even numbers, squared." How the iteration actually happens is hidden inside filter and map.

You're probably already using more familiar forms of declarative code, too. SQL says "give me the rows matching this condition" without specifying how to walk an index, and HTML declares only structure — "heading here, paragraph here" — without spelling out the rendering procedure.

---

## The gap widens dramatically once you get to UI

Imperative UI (UIKit) writes the **procedure for changing** the screen.

```swift
// UIKit: every time state changes, I dictate the screen manipulation directly
func updateBadge(count: Int) {
    if count > 0 {
        badgeLabel.isHidden = false
        badgeLabel.text = "\(count)"
    } else {
        badgeLabel.isHidden = true
    }
}
```

The difficulty with this approach is that the developer has to continuously track "what state is the screen currently in." When there are multiple update paths, it's easy to miss one — and that's exactly how you get the classic bug where the data changed but the screen didn't.

Declarative UI (SwiftUI) declares **what the screen looks like for a given state.**

```swift
// SwiftUI: declare that when count looks like this, the screen looks like this
struct BadgeView: View {
    let count: Int
    var body: some View {
        if count > 0 {
            Text("\(count)").badgeStyle()
        }
    }
}
```

You never write how the screen should change when count changes. SwiftUI compares the previous declaration against the new one and updates only what needs updating. This turns the UI into "a function of state." Ownership of the update procedure has been handed to the framework, so there's no update code left to forget in the first place.

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/2.png" alt="Comparison diagram of UIKit imperative UI update code versus SwiftUI declarative view code" loading="lazy">
  <figcaption>Imperative means I write the update procedure myself; declarative means the framework computes the diff.</figcaption>
</figure>

---

## Declarative isn't free

To keep things balanced, it's worth looking at the other side too.

**The cost of hiding the procedure is frustration whenever you actually need that procedure.** An imperative request like "scroll to exactly this offset" ends up requiring a workaround in a declarative framework.

**Debugging has a different texture.** With imperative code, you can just follow the procedure. With declarative code, you have to trace the framework's own reasoning — questions like "why did this get re-rendered?" You don't get to be completely ignorant of the hidden How.

**Performance tuning eventually comes back to understanding the internals.** When a view in SwiftUI recomputes more than it should, solving it requires understanding how diffing and dependency tracking actually work under the hood.

So the accurate framing isn't "declarative is superior" — it's a **choice of abstraction level.** Hand off ownership of the procedure, and your code gets simpler and intent-focused, but fine-grained control and internal understanding remain as homework.

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/3.png" alt="Trade-off diagram showing declarative UI abstraction versus fine-grained procedural control" loading="lazy">
  <figcaption>The trade-off: hand off ownership of the procedure, and you give up fine-grained control in return.</figcaption>
</figure>

---

## Summary

- Imperative dictates the procedure (How) for reaching a result; declarative describes the desired result (What)
- SQL, HTML, and map/filter are declarative styles you're likely already using
- Imperative UI writes the procedure for changing the screen, which makes state-screen mismatch bugs easy to introduce
- Declarative UI declares "when state looks like this, the screen looks like this," and leaves updates to the framework (UI = a function of state)
- The cost of going declarative: fine-grained procedural control gets harder, and understanding the framework's internals eventually becomes necessary anyway
- At its core, this isn't about which is better — it's about who owns the procedure
