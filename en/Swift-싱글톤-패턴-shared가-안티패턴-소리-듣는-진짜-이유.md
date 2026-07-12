---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Real Reason Swift's Singleton Pattern Gets Called an Anti-Pattern"
lang: en
description: "If you've done any Swift development, you've almost certainly run into a singleton built with a single line: static let shared."
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
  - Swift architecture
  - app development
  - Swift developers
permalink: /en/Swift-싱글톤-패턴-shared가-안티패턴-소리-듣는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

If you've done any Swift development, you've almost certainly run into a singleton built with a single line: `static let shared`.

When I built my first iOS app, I plastered singletons everywhere — network manager, user session, cache manager, all of it.

It's just convenient. You call `Manager.shared` from anywhere and you're done.

But as the project grew, strange things started happening. Tests stopped working. I'd fix one screen and a bug would blow up somewhere completely unrelated.

That's when it first hit me: "Oh, there's a real reason singletons get called an anti-pattern."

In this post, I want to walk through exactly what the Swift singleton pattern is, why overusing it earns it anti-pattern status, and when it's still fine to use — all based on what I've actually run into.

To cut to the conclusion first: the singleton itself isn't the problem. The problem is "leaving state open to being changed from anywhere, by anything." Abuse `shared` without discipline, and you end up blocking tests, hiding dependencies, and even introducing concurrency bugs.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="Swift's singleton pattern — `shared` makes life easy, but the trap is just as big">
  <figcaption>Swift's singleton pattern — `shared` makes life easy, but the trap is just as big</figcaption>
</figure>

## So What Exactly Is the Swift Singleton Pattern?

A singleton is a design pattern that "guarantees exactly one instance exists across the entire app."

In Swift, you can write one in almost no code at all. That's both its charm and its trap.

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // The only one in the app
    private init() {}                     // Block external instantiation
    func request(_ url: URL) { /* ... */ }
}
```

`static let` guarantees Swift initializes it exactly once, thread-safely. So instance creation itself is safe without any extra locking.

Blocking external creation with `private init()` is also key. Leave that out and it's just a global object, not a true singleton.

Up to this point, it all looks clean. The trouble starts once you realize this can be called from literally anywhere.

---

## Why Does the `shared` Instance Get Called an Anti-Pattern?

Let me walk through the three most commonly cited reasons, in the order I personally ran into them.

First, testing turns into hell.

If you call `NetworkManager.shared` directly inside your code, there's no way to swap it out for a mock when you write tests.

Requests actually go out to the real server, or tests end up sharing state with each other — and suddenly just reordering tests changes the results.

Second, dependencies get hidden.

If a function quietly calls `UserSession.shared` internally, you can't tell what that function actually needs just by reading its signature.

This is genuinely scary when you're working with a team. You have to open up the whole implementation just to see what it depends on.

Third, there's the concurrency problem with global mutable state.

If a singleton holds internal properties and multiple threads read and write them at the same time, you get a data race.

Instance creation being safe doesn't mean mutating its internal state is safe too. Mix those two up and you'll run straight into a crash.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="My old code from the days I plastered `shared` everywhere. Looking back, it's terrifying.">
  <figcaption>My old code from the days I plastered `shared` everywhere. Looking back, it's terrifying.</figcaption>
</figure>

To sum it up:

> The real reason singletons get a bad rap isn't "because there's only one instance" — it's "because it can be pulled out and mutated from anywhere."

---

## So Should You Never Use Singletons?

No. I still use them in certain situations, even now.

Some things are naturally meant to have exactly one instance. Apple itself uses singletons in the standard library — think `UserDefaults.standard`, `FileManager.default`, `URLSession.shared`.

Here's a rule of thumb I find useful:

- Mostly read-only, rarely mutates state → a singleton is fine
- Genuinely needs to be the one and only instance app-wide → consider a singleton
- Needs to behave differently in tests → prefer dependency injection

The core idea is: don't call `shared` directly inside your code — have it injected from outside instead.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/3-1783847709763.png" alt="Default to `shared`, inject a mock for tests — that's the structure">
  <figcaption>Default to `shared`, inject a mock for tests — that's the structure</figcaption>
</figure>

Even if you're using the same singleton, restructuring it like this dramatically improves testability.

```swift
protocol Networking { func request(_ url: URL) }
extension NetworkManager: Networking {}

final class FeedViewModel {
    private let network: Networking
    init(network: Networking = .shared) {  // Default to the singleton, inject a mock for testing
        self.network = network
    }
}
```

Normally it defaults to the singleton, so it's convenient — and in tests, you can drop in a mock, so it's flexible too.

You're not throwing the singleton away. You're just changing how it gets called.

---

## The 3 Rules I Actually Follow in Practice

Lastly, let me share the rules I've settled on for myself on the job.

1. Don't build singletons whose mutable state gets changed from multiple places. If you need state, make ownership explicit.
2. Never call `shared` directly inside a function body — inject it through an initializer or parameter instead.
3. If a singleton has concurrent access, make it an actor or protect it with a serial queue.

Stick to just these three, and you'll rarely end up in a situation where "the singleton is rotting the project."

A singleton isn't a bad tool — it's a tool that's so easy to reach for that it's easy to abuse.

Before you scatter `shared` everywhere just because it's convenient, ask yourself once: "Can I actually test this later?" That one question can save you six months from now.
