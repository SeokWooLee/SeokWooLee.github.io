---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift Closures, Fully Explained: Why Capturing, [weak self], and @escaping Are One and the Same"
lang: en
description: "In Swift code, closures are like air — you can't avoid them. Sort conditions, network completion handlers, button actions, even SwiftUI's body: passing…"
header:
  og_image: /assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/1.png
tags:
  - Swift
  - closures
  - Swift closures
  - capture list
  - weak self
  - escaping
  - retain cycle
  - iOS development
  - memory management
  - learn to code
permalink: /en/Swift-클로저-완전-정리-캡처weak-selfescaping이-한-몸인-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

In Swift code, closures are like air — you can't avoid them. Sort conditions, network completion handlers, button actions, even SwiftUI's body: passing around a block of curly braces happens dozens of times a day. And yet, ask someone to explain exactly what it means for a closure to "capture" a value, why we use `[weak self]`, or why `@escaping` gets attached, and the words often don't come.

These three questions are actually one and the same. Once you understand how a closure grabs onto surrounding values (capturing), everything else follows in a chain: why closures are reference types, why retain cycles happen, and why the escaping marker is necessary. This is the second installment of the Swift fundamentals series, and this post walks through that chain of reasoning step by step.

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/1.png" alt="The essence of a closure isn't the code block — it's capturing the variables around it">
  <figcaption>The essence of a closure isn't the code block — it's capturing the variables around it</figcaption>
</figure>

## What Is a Closure — The Defining Trait Isn't the Name, It's "Grabbing"

Let's get the syntax out of the way first, with the bare minimum. A closure is syntax that treats a block of executable code as a value. You can store it in a variable, pass it as an argument, and return it.

```swift
let add: (Int, Int) -> Int = { a, b in a + b }
add(2, 3) // 5
```

In fact, a function declared with `func` is really just a named closure. In Swift, functions and closures belong to the same family — the `{ }` syntax is simply a version you create on the spot, without a name.

But the name "closure" doesn't come from "code block." It comes from a different property: the fact that it closes over surrounding variables.

```swift
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counter = makeCounter()
counter() // 1
counter() // 2
counter() // 3
```

Something strange is happening here. `count` is a local variable of `makeCounter`, so it should disappear once the function returns — yet it keeps growing every time you call the returned closure. The closure captured the variable `count`, which lives outside its own body, and kept it alive even after the function ended. This is the essence of a closure, and everything else in this post is a derivative of that one fact about capturing.

## What Capturing Actually Means — A Reference, Not a Copy

Swift's default capture method is by reference. Rather than copying the value away, the closure maintains a live connection to the variable itself. That's why you get results like this:

```swift
var multiplier = 2
let times = { (n: Int) in n * multiplier }

times(10)      // 20
multiplier = 3
times(10)      // 30 — the closure sees the changed value
```

What gets used here isn't the `multiplier` (2) at the time the closure was created, but the `multiplier` (3) at the time it's executed. A closure doesn't carry a snapshot of a variable — it carries the variable itself.

If you want to freeze the value as of the moment the closure is created, you use a capture list.

```swift
let times = { [multiplier] (n: Int) in n * multiplier }

times(10)      // 20
multiplier = 3
times(10)      // 20 — frozen at 2, the value at creation time
```

A variable written inside the square brackets is copied at the moment the closure is created and locked in as a constant inside the closure. To sum it up: the default is capture by reference (a live connection), and a capture list gives you capture by value (a snapshot at creation time). This distinction has to be settled before we can even talk about `[weak self]`.

And it's precisely because of this capture storage that closures are reference types. Captured variables have to share their lifetime with the closure, so they get stored on the heap — and copying a closure value just adds one more reference sharing that same storage. That's why closures behave like classes in a struct-centric language like Swift. If the distinction between value types and reference types feels unfamiliar, it's worth reading the earlier post on Swift's value-type-first philosophy before continuing.

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/2.png" alt="Default capture is a live connection; a capture list is a snapshot at creation time">
  <figcaption>Default capture is a live connection; a capture list is a snapshot at creation time</figcaption>
</figure>

## Retain Cycles and [weak self] — The Classic Accident Capturing Creates

The price of reference capturing is the retain cycle, and the setup is always the same.

```swift
class ProfileViewModel {
    var onUpdate: (() -> Void)?
    var name = ""

    func bind() {
        onUpdate = {
            print("Name: \(self.name)")
        }
    }
}
```

The view model strongly owns the closure through its `onUpdate` property. But that closure captures `self` — the view model — by reference. So the ownership chain closes: view model → closure → view model. In the world of ARC, the two now hold onto each other and neither is ever released. The view model leaks even after the screen is dismissed.

The fix is the second use case for capture lists. `[weak self]` is an instruction to capture `self` as a weak reference. The closure still holds onto `self`, but doesn't own it, so the chain is broken. In exchange, since `self` might be deallocated first, `self` becomes optional inside the closure, and you typically start with `guard let self else { return }`. This is the same early-exit pattern we saw in the optionals post, showing up again here.

```swift
onUpdate = { [weak self] in
    guard let self else { return }
    print("Name: \(self.name)")
}
```

What matters is that `[weak self]` isn't a universal prefix you slap on everything. A retain cycle requires this exact condition: "self owns the closure, and the closure captures self." Without that condition, weak isn't needed either. For example, a closure passed to `DispatchQueue.main.asyncAfter` gets discarded by the system once it runs, so `self` just stays alive a bit longer — that's not a leak. Instead of reflexively adding `weak`, the accurate habit is to ask "who owns this closure, and for how long?" A famous case with an unusual ownership structure — NSTimer — is covered in a separate post.

## @escaping — When a Closure Outlives the Function

Here's the last piece of the puzzle. Closures passed as function parameters sometimes carry `@escaping`.

```swift
func fetchUser(completion: @escaping (User) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, _ in
        let user = parse(data)
        completion(user)   // Runs long after the function has already returned
    }.resume()
}
```

The distinguishing criterion is timing of execution. A closure that runs to completion and is discarded entirely before the function returns is non-escaping (the default). One that gets stored in a property or handed off to an asynchronous task — and so might run after the function has returned — is escaping: a closure that escapes the function.

Why is this distinction enforced? Because whether a closure escapes changes the math for both the compiler and the developer. A non-escaping closure is guaranteed to live only for the duration of the function call, so the compiler can optimize how captures are stored, and there's fundamentally no risk of a retain cycle. That's why you don't need to worry about `self` in a closure passed to `map` or `filter`. An escaping closure, on the other hand, means the closure gets stored somewhere and lives longer — making it a candidate that needs the retain-cycle scrutiny we just covered. The `@escaping` marker is essentially an API-level warning label: "this closure survives longer than you'd expect, so watch your captures."

For reference, escaping closures in the completion-handler style are becoming less common in new code as async/await has taken over, but understanding them precisely still matters for reading and bridging existing APIs.

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/3.png" alt="Weak breaks the loop where two things are holding onto each other">
  <figcaption>Weak breaks the loop where two things are holding onto each other</figcaption>
</figure>

## Three Rules of Thumb to Internalize

Boiled down to practical guidance, the theory compresses into three rules.

**First, when you see a closure, ask about its lifetime first.** Does this closure get consumed and finish inside the function (non-escaping), or does it get stored somewhere and live on (escaping)? That single question determines how much attention capturing deserves.

**Second, use `weak` by judgment, not by reflex.** Use `[weak self]` where an ownership loop actually closes — a handler stored in a property, a delegate-style callback — and skip it for one-off executions where no such loop exists. When the call is unclear, the right habit is to confirm with Instruments' Leaks tool or a `deinit` log.

**Third, use capture lists to document intent.** If you want to freeze a value, use `[value]`; if you don't want ownership, use `[weak self]`. Before it's a performance mechanism, a capture list is documentation that spells out, in code, exactly how this closure connects to the outside world.

## Summary

- The essence of a closure isn't the code block — it's capturing: the trait of closing over surrounding variables and extending their lifetime.
- The default capture is by reference, not by copy, so a closure sees the value at the time it runs; a capture list `[x]` locks it to the value at the time it was created.
- Because captured storage has to be shared, closures are reference types.
- When a closure owned by `self` captures `self`, you get a retain cycle, and `[weak self]` plus `guard let self` is the standard fix — but if there's no ownership loop, `weak` isn't needed either.
- `@escaping` is a warning label meaning "this closure outlives the function," flagging the spots where capture review is required.

In the next installment, we'll cover stored properties versus computed properties, `lazy`, and property observers — the choices hidden inside a single line of variable declaration.
