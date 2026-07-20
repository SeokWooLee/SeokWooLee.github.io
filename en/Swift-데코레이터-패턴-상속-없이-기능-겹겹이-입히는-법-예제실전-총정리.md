---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift Decorator Pattern: Layering Features Without Inheritance (Examples & Practical Guide)"
lang: en
description: "There's a moment every iOS developer runs into: you want to keep the base functionality untouched and just bolt on logging, or just add caching, but the…"
header:
  og_image: /assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/1.png
tags:
  - Swift
  - decorator pattern
  - design patterns
  - iOS development
  - Swift programming
  - object-oriented programming
  - protocol-oriented programming
  - learn to code
  - SwiftUI
  - developer blog
permalink: /en/Swift-데코레이터-패턴-상속-없이-기능-겹겹이-입히는-법-예제실전-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

There's a moment every iOS developer runs into: you want to keep the base functionality untouched and just bolt on logging, or just add caching, but the moment you reach for subclassing to do it, your inheritance tree turns into a mess before you know it.

Keep adding features to a network client one by one, and you'll easily end up with a class named something like `CachingLoggingRetryingClient`.

Today I want to walk through the **Swift decorator pattern**, which solves exactly this problem — a way to layer features on like an onion, without touching inheritance at all.

> The decorator pattern wraps an original object with another object conforming to the same protocol, letting you add features one layer at a time without ever touching the original code.

Here's the short version:

1. Define the shared behavior as a **protocol** first
2. A decorator conforms to that same protocol, while **holding an instance** of that same protocol type inside it
3. It does its own job (logging, caching, etc.) and **delegates** the rest to the object it holds
4. Wrap as many times as you need, and the features stack up

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/1.png" alt="The Swift decorator pattern — layering features on like this, no inheritance needed">
  <figcaption>The Swift decorator pattern — layering features on like this, no inheritance needed</figcaption>
</figure>

---

## What Is the Decorator Pattern? How Is It Different From Inheritance?

Inheritance expresses "is a kind of." A subclass inherits everything from its parent.

The problem is combinations. If you try to build a logged client, a cached client, and a client with both using inheritance, you end up with a separate class for every combination.

A decorator expresses "wraps."

Because the wrapper and the wrapped object share the **same interface**, they're indistinguishable from the outside. So no matter how many layers you stack, the calling code never changes.

In short: with inheritance, the relationship is fixed at compile time. With decorators, you assemble things freely at runtime.

---

## Implementing the Swift Decorator Pattern in Code

Let's build a `DataLoader` that fetches data, as an example. First, the protocol everyone will conform to.

```swift
protocol DataLoader {
    func load(id: String) -> Data?
}

// The base implementation that does the actual work
struct NetworkLoader: DataLoader {
    func load(id: String) -> Data? {
        print("Requesting \(id) from the network")
        return Data("payload-\(id)".utf8)
    }
}
```

So far, this is just an ordinary protocol and implementation.

Now here's the key part. A decorator conforms to `DataLoader`, while holding another `DataLoader` inside it.

```swift
// A decorator that adds logging
struct LoggingLoader: DataLoader {
    let wrapped: DataLoader   // the object being wrapped

    func load(id: String) -> Data? {
        print("[LOG] load started: \(id)")
        let result = wrapped.load(id: id)  // delegate the actual work
        print("[LOG] load finished: \(id)")
        return result
    }
}
```

`LoggingLoader` only does its own job (printing logs) and hands off the actual loading to `wrapped`.

Thanks to this structure, you never have to care what's being wrapped inside. All that matters is that it's a `DataLoader`.

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/2-1783772343669.png" alt="Each layer does its own job, then delegates the rest to the object inside it" loading="lazy">
  <figcaption>Each layer does its own job, then delegates the rest to the object inside it</figcaption>
</figure>

---

## Stacking Features on Top of Each Other

Now let's build one more decorator for caching, and actually stack them for real this time.

```swift
final class CachingLoader: DataLoader {
    let wrapped: DataLoader
    private var cache: [String: Data] = [:]

    init(wrapping loader: DataLoader) { self.wrapped = loader }

    func load(id: String) -> Data? {
        if let hit = cache[id] { return hit }        // return immediately if cached
        let data = wrapped.load(id: id)              // otherwise delegate
        cache[id] = data
        return data
    }
}
```

Now comes the part that's the real payoff of the decorator pattern: assembling everything.

```swift
let loader = LoggingLoader(
    wrapped: CachingLoader(wrapping: NetworkLoader())
)
```

Just read it from the inside out. We wrapped the network loader with caching, then wrapped that with logging.

When a call comes in, it flows through in this order: log → check cache → (if missing) hit the network.

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/4-1783847764924.png" alt="The more layers you wrap, the more layers a call passes through" loading="lazy">
  <figcaption>The more layers you wrap, the more layers a call passes through</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/3.png" alt="Here it is stacked from the inside out: network, then caching, then logging" loading="lazy">
  <figcaption>Here it is stacked from the inside out: network, then caching, then logging</figcaption>
</figure>

If you want to change the order, all you have to do is change the order you wrap things in. You don't touch a single line of `NetworkLoader` or `CachingLoader`.

And if you don't need a feature, you just drop that layer — that's it.

---

## Inheritance vs. Decorator: When to Use Which

Neither one is always the right answer. Here's how the situations break down.

| Situation | Recommendation |
|---|---|
| A clear "is a kind of" relationship | Inheritance |
| Freely combining/detaching features | Decorator |
| Toggling features on and off at runtime | Decorator |
| Can't touch the original code | Decorator |
| Many possible combinations | Decorator |

Decorators fit especially well for **non-essential add-on behavior** like logging, caching, retries, or adding auth headers.

On the other hand, forcing decorators where they don't fit adds more wrapping layers, which means a deeper call stack when debugging — that's a real downside worth keeping in mind.

---

## Two Common Questions

**Q. Should I use a struct or a class?**

If the decorator needs to hold state directly (like a cache store), a class is more convenient. If it's purely delegating, a struct is enough. That's why, in the example above, only the caching one was made a class.

**Q. Does stacking more layers hurt performance?**

Since each call passes through one more layer, there is a tiny bit of overhead. But compared to network or disk I/O, it's negligible — for most apps, it's not something you need to worry about.

---

In the end, the decorator pattern comes down to defining a single protocol and creating an object that "holds an instance of that same protocol" and delegates to it.

Next time you catch yourself digging through an inheritance tree just to bolt on one more feature, think about wrapping it in one more layer instead. Your code will get a lot lighter. I'd recommend dropping today's example straight into a playground and trying it yourself 🙂
