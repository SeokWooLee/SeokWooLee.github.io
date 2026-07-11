---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Real Reason Swift's `shared` Singleton Gets Called an Anti-Pattern"
lang: en
description: "If you've done any Swift development, you've almost certainly run into a singleton built with a single line: static let shared."
header:
  og_image: /assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png
tags:
  - Swift
  - Singleton Pattern
  - iOS Development
  - Design Patterns
  - Dependency Injection
  - Anti-Pattern
  - shared
  - Swift Concurrency
  - App Development
  - Swift Developer
permalink: /en/Swift-싱글톤-패턴-shared가-안티패턴-소리-듣는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

If you've done any Swift development, you've almost certainly run into a singleton built with a single line: `static let shared`.

When I built my first iOS app, I plastered singletons everywhere — network manager, user session, cache management, all of it.

It's just convenient. You can call `Manager.shared` from anywhere.

But as the project grew, weird things started happening. Tests broke. I'd fix one screen and a bug would blow up somewhere completely unrelated.

That's when it hit me: there's a reason singletons get called an anti-pattern.

In this post, I want to walk through what the Swift singleton pattern actually is, why overusing it earns it that anti-pattern reputation, and when it's still fine to use — all based on real experience.

The short version: singletons themselves aren't the problem. The problem is the pattern of "leaving state open so it can be mutated from literally anywhere." Abuse `shared` without discipline, and you end up with tests you can't write, dependencies that hide in plain sight, and concurrency bugs on top of it all.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="The Swift singleton pattern — `shared` makes life easy, but the trap is just as big">
  <figcaption>The Swift singleton pattern — `shared` makes life easy, but the trap is just as big</figcaption>
</figure>

## So What Exactly Is the Swift Singleton Pattern?

A singleton is a design pattern that guarantees exactly one instance of a type exists across the entire app.

In Swift, you can write one in almost no code at all. That's both the appeal and the trap.

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // The one and only instance in the app
    private init() {}                     // Blocks external instantiation
    func request(_ url: URL) { /* ... */ }
}
```

`static let` guarantees Swift initializes it exactly once, in a thread-safe way. So instance creation itself is safe without any extra locking.

`private init()` is just as essential — it stops anyone from creating a new instance from outside. Drop that line and you don't really have a singleton anymore, just a global object.

Up to this point, it all looks pretty clean. The trouble starts because you can call it from anywhere.

---

## Why Does `shared` Get Called an Anti-Pattern?

Here are the three reasons I hear most, in the order I personally ran into them.

First, testing becomes a nightmare.

If your code calls `NetworkManager.shared` directly, there's no way to swap it out for a mock during tests.

Requests fire off to a real server, or tests end up sharing state with each other — so just changing the order they run in changes the results.

Second, dependencies get hidden.

If a function quietly reaches for `UserSession.shared` internally, you can't tell what that function actually needs just by looking at its signature.

This becomes genuinely scary when you're working with a team. You have to open up the implementation to see what it depends on.

Third, there's the concurrency problem with global mutable state.

If a singleton holds properties internally and multiple threads read and write to them at the same time, you get a data race.

Safe instance creation doesn't mean safe state mutation inside that instance — those are two different things, and mixing them up is how you end up staring at a crash.

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="My code back when I plastered `shared` everywhere. Looking at it now makes me wince.">
  <figcaption>My code back when I plastered `shared` everywhere. Looking at it now makes me wince.</figcaption>
</figure>

To sum it up:

> Singletons don't get a bad rap because "only one exists." It's because they can be pulled out and mutated from anywhere, by anyone.

---

## So Does That Mean You Should Never Use Singletons?

No. I still use them in certain situations.

Some things are naturally meant to have exactly one instance. Apple itself uses singletons throughout the standard library — think `UserDefaults.standard`, `FileManager.default`, `URLSession.shared`.

Here's a rule of thumb I find useful:

- Mostly read-only, rarely mutated state → a singleton is fine
- Genuinely needs to be one instance across the whole app → worth considering
- Needs to behave differently under test → prefer dependency injection

The key idea is: don't call `shared` directly inside your code — have it injected from outside instead.

Even when you're still using the same singleton, making this one change dramatically improves testability.

```swift
protocol Networking { func request(_ url: URL) }
extension NetworkManager: Networking {}

final class FeedViewModel {
    private let network: Networking
    init(network: Networking = .shared) {  // Defaults to the singleton, but a mock can be injected for tests
        self.network = network
    }
}
```

Day to day, it's convenient because it defaults to the singleton. But for testing, it's flexible because you can pass in a mock.

You're not throwing the singleton away — you're just changing how it gets called.

---

## Three Rules I Follow in Practice

Lastly, here are the ground rules I've set for myself on the job.

1. Never build a singleton whose mutable state gets changed from multiple places. If state is needed, its owner should be crystal clear.
2. Never call `shared` directly inside a function — inject it through an initializer or parameter instead.
3. If a singleton faces concurrent access, wrap it in an actor or guard it with a serial queue.

Follow just these three, and you'll rarely end up in a situation where "the singleton is rotting the whole project."

A singleton isn't a bad tool — it's a tool that's so easy to reach for that it gets abused.

Before you scatter `shared` everywhere just because it's convenient, ask yourself one question: "Can I actually test this later?" That single question will save you six months from now.
