---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift Singleton Pattern: The Real Reason `shared` Gets Called an Anti-Pattern"
lang: en
description: "If you've spent any time writing Swift, you've run into the singleton created with a single line of static let shared more times than you can count."
header:
  og_image: /assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png
tags:
  - Swift
  - singleton pattern
  - iOS development
  - design patterns
  - dependency injection
  - anti-pattern
  - shared instance
  - Swift development
  - app development
  - Swift developers
permalink: /en/Swift-싱글톤-패턴-shared가-안티패턴-소리-듣는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

If you've spent any time writing Swift, you've run into the singleton created with a single line of `static let shared` more times than you can count.

When building an iOS app for the first time, it's easy to slap a singleton on everything — the network manager, the user session, cache management, all of it.

It's just convenient. You can call `Manager.shared` from anywhere and be done with it.

But as the project grows, strange things start happening. Tests stop working. You fix one screen and a bug explodes somewhere completely unrelated.

There's a reason singletons get called an anti-pattern.

In this post, we'll look at exactly what the Swift singleton pattern is, why overusing it earns it anti-pattern status, and when it's still fine to use — all from a practical, real-world perspective.

To cut to the conclusion: the singleton itself isn't the problem. The real issue is "leaving state open to be changed from anywhere, by anything." That's what causes tests to break, dependencies to hide, and concurrency issues to creep in when `shared` gets used carelessly.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="The Swift singleton pattern — `shared` makes things convenient, but the trap is just as big">
  <figcaption>The Swift singleton pattern — `shared` makes things convenient, but the trap is just as big</figcaption>
</figure>

## So What Exactly Is the Swift Singleton Pattern?

A singleton is a design pattern that "guarantees exactly one instance exists across the entire app."

In Swift, you can write one in almost no code at all. That's both its charm and its trap.

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // Only one instance in the app
    private init() {}                     // Blocks external instantiation
    func request(_ url: URL) { /* ... */ }
}
```

`static let` guarantees Swift initializes it exactly once, in a thread-safe way. So the instance creation itself is safe without any extra locking.

Blocking external creation with `private init()` is just as crucial. Without it, you just have a global object — not a real singleton.

Up to this point, it looks perfectly clean. The problem starts once you realize this can be called from literally anywhere.

---

## Why Does `shared` Get Branded an Anti-Pattern?

Let me walk through the three most commonly cited reasons, in the order they tend to bite you.

First, testing turns into a nightmare.

If `NetworkManager.shared` is called directly inside your code, there's no way to swap it out for a mock object during tests.

Requests end up hitting the real server, or tests end up sharing state with each other, so just changing the run order changes the results.

Second, dependencies get hidden.

If a function is secretly using `UserSession.shared` internally, there's no way to tell what that function actually needs just by looking at its signature.

This is genuinely scary when collaborating with others. You have to open up the entire implementation just to see what depends on what.

Third, there's the concurrency problem with global mutable state.

If a singleton holds properties internally and multiple threads read and write to it at the same time, you get a data race.

Instance creation being safe doesn't mean mutating the state inside it is safe too. Mix these two up, and you'll run straight into a crash.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="My code from the days I plastered `shared` everywhere — looking back at it now is a little terrifying">
  <figcaption>My code from the days I plastered `shared` everywhere — looking back at it now is a little terrifying</figcaption>
</figure>

To sum it up:

> The real reason singletons get criticized isn't that "only one exists" — it's that "it can be pulled out and mutated from anywhere."

---

## So Does That Mean You Should Never Use Singletons?

No. There are still situations where they make sense.

Some things are naturally singular by design. Apple itself uses singletons in the standard library — `UserDefaults.standard`, `FileManager.default`, `URLSession.shared`, for example.

Here's a simple way to decide:

- Mostly read-only, barely ever mutates state → a singleton is fine
- Genuinely needs to be the one and only instance app-wide → worth considering a singleton
- Needs to behave differently under test → prefer dependency injection

The key idea is: "don't call `shared` directly inside your code — have it injected from the outside."

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/3-1783847709763.png" alt="Keep `shared` as the default, and inject a fake for testing">
  <figcaption>Keep `shared` as the default, and inject a fake for testing</figcaption>
</figure>

Even if you keep using the same singleton, restructuring it like this dramatically improves testability.

```swift
protocol Networking { func request(_ url: URL) }
extension NetworkManager: Networking {}

final class FeedViewModel {
    private let network: Networking
    init(network: Networking = .shared) {  // Default is the singleton, tests inject a mock
        self.network = network
    }
}
```

During normal use, the default falls back to the singleton, so it's still convenient. During testing, you can plug in a fake object, so it's flexible too.

You're not throwing the singleton away — you're just changing how it gets called.

---

## Three Rules I Follow in Practice

Lastly, let me share the standards I hold myself to on the job.

1. Don't create singletons whose mutable state gets changed from multiple places. If state is needed, make its ownership clear.
2. Don't call `shared` directly inside a function — inject it through an initializer or parameter instead.
3. For singletons with concurrent access, wrap them in an actor or protect them with a serial queue.

Stick to just these three, and you'll rarely end up in a situation where "the singleton rotted the whole project."

A singleton isn't a bad tool — it's a tool that's so easy to reach for that it's easy to overuse.

Before scattering `shared` everywhere just because it's convenient, ask yourself just once: "Can I actually test this later?" That one question can save you six months from now.
