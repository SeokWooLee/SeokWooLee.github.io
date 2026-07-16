---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why Use the Factory Method Pattern Instead of init in Swift (A Practical Breakdown)"
lang: en
description: "When building apps in Swift, you end up writing object-creation code dozens of times a day."
header:
  og_image: /assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png
tags:
  - Swift
  - Factory Method Pattern
  - iOS Development
  - Design Patterns
  - Swift Programming
  - init
  - Static Factory Method
  - Object-Oriented Programming
  - Coding Study
  - App Development
permalink: /en/Swift-팩토리-메서드-패턴-init-대신-쓰는-이유-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

🌐 [한국어](/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [中文](/zh/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

When building apps in Swift, you end up writing object-creation code dozens of times a day.

But at some point, relying on init alone starts feeling limiting.

Many developers start out using only init, then reach for the factory method pattern once a project grows larger.

In this post, we'll break down what the Swift factory method pattern actually is, and why you'd reach for a factory instead of init, with real code examples.

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png" alt="Let's start by pinning down how the Swift factory method pattern differs from init">
  <figcaption>Let's start by pinning down how the Swift factory method pattern differs from init</figcaption>
</figure>

## The Factory Method Pattern in One Line

Let's start with the core answer.

> A factory method pulls object-creation logic out of init into a separate, named method, giving you the freedom to choose the return type as well.

In Swift, this usually refers to a static factory method, typically written as a `static func`.

init only operates within rules the language hands you.

You can't give it a name, and it always has to produce a brand-new instance of its own type.

A factory method lifts that restriction.

Here's a simple example.

```swift
struct Color {
    let r, g, b: Double
    // Make the creation intent explicit through naming
    static func rgb(_ r: Double, _ g: Double, _ b: Double) -> Color {
        Color(r: r, g: g, b: b)
    }
    static func gray(_ v: Double) -> Color {
        Color(r: v, g: v, b: v)
    }
}
```

Calling `Color.gray(0.5)` makes it obvious from the code alone that this produces a gray color.

---

## Why Choose a Factory Over init?

There are roughly four reasons that come up in practice.

**First, you can give it a name.**

Every init shares the same name, so you can only tell them apart by their parameters.

When you have multiple initializers that each take two `Double`s, things get confusing fast.

A factory method can carry intent in its name, like `from(hex:)` or `rgb(_:_:_:)`.

**Second, you don't have to create a new instance every time.**

init always has to return a brand-new object, but a factory can return a cached value or a singleton instead.

**Third, you get flexibility in the return type.**

Depending on the situation, it can return a subtype or a different implementation entirely.

**Fourth, it lets you express failure handling more clearly.**

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/2.png" alt="Just adding one static func line makes the code so much easier to read">
  <figcaption>Just adding one static func line makes the code so much easier to read</figcaption>
</figure>

Here's an example of a factory that uses caching.

```swift
final class IconCache {
    private static var store: [String: Icon] = [:]
    // Reuse an already-created icon if one exists for this name
    static func icon(named name: String) -> Icon {
        if let cached = store[name] { return cached }
        let icon = Icon(name: name)
        store[name] = icon
        return icon
    }
}
```

This saves memory when the same icon gets requested multiple times.

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/4-1783847712458.png" alt="If it exists, hand it over — if not, make it and stock it">
  <figcaption>If it exists, hand it over — if not, make it and stock it</figcaption>
</figure>

---

## Does That Mean We Should Stop Using init?

Not at all.

A factory doesn't replace init — it wraps it.

Inside a factory method, you're still calling init to actually build the object.

For a simple value type or obvious creation logic, plain init is the better choice.

Wrapping everything in a factory needlessly just bloats the code and hurts readability.

A factory earns its keep in specific situations:

- When there are multiple ways to create something and you want to distinguish them by name
- When you need reuse, like caching or pooling
- When you want to hide a complex initialization process in one place
- When you want to return a protocol type and hide the concrete implementation

If none of these apply, init is the right call.

Even the Swift standard library splits things this way.

`Array(repeating:count:)` is an init, but a static property like `UIColor.systemBlue` is essentially a cousin of the factory approach.

---

## A Practical Rule of Thumb

Here's a quick table for when it's hard to decide.

| Situation | Recommendation |
| --- | --- |
| Simple value storage | init |
| Multiple ways to create it | Factory method |
| Instance reuse / caching | Factory method |
| Hiding implementation, returning a protocol | Factory method |
| Initialization fits in one line | init |

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/3.png" alt="This is the table I picture whenever I'm not sure which one to pick">
  <figcaption>This is the table I picture whenever I'm not sure which one to pick</figcaption>
</figure>

In short, init handles "how to build it," while a factory handles "what to build, and why."

They're not competitors — they're partners with different jobs.

A good approach is to start with init, and move to a factory once the creation logic gets more complex.

Keeping just these guidelines in mind will already make your code noticeably cleaner. Happy Swift coding!
