---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Constructor Injection vs. Property Injection vs. Method Injection: Which One Should You Use? (A Complete Guide to Swift DI)"
lang: en
description: "Anyone building iOS apps in Swift eventually runs into the same question."
header:
  og_image: /assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/1.png
tags:
  - SwiftDI
  - dependencyinjection
  - constructorinjection
  - propertyinjection
  - Swift
  - iOSdevelopment
  - learningSwift
  - appdevelopment
  - codinglearning
  - Swinject
permalink: /en/생성자-주입-vs-프로퍼티-주입-vs-메서드-주입-뭘-써야-할까-Swift-DI-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

🌐 [한국어](/%EC%83%9D%EC%84%B1%EC%9E%90-%EC%A3%BC%EC%9E%85-vs-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%A3%BC%EC%9E%85-vs-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A3%BC%EC%9E%85-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-Swift-DI-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/%EC%83%9D%EC%84%B1%EC%9E%90-%EC%A3%BC%EC%9E%85-vs-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%A3%BC%EC%9E%85-vs-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A3%BC%EC%9E%85-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-Swift-DI-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/%EC%83%9D%EC%84%B1%EC%9E%90-%EC%A3%BC%EC%9E%85-vs-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%A3%BC%EC%9E%85-vs-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A3%BC%EC%9E%85-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-Swift-DI-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

Anyone building iOS apps in Swift eventually runs into the same question.

"Which approach is actually the right way to do dependency injection?"

Let's get the conclusion out of the way first.

> Unless you have a specific reason not to, **constructor (init) injection** is the closest thing to a correct default.

Here's why that's true, and when the other two approaches actually make sense, based on real-world experience.

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/1.png" alt="Constructor, property, and method injection — the differences show up from the very first screen">
  <figcaption>Constructor, property, and method injection — the differences show up from the very first screen</figcaption>
</figure>

---

## The Three Injection Methods, in Brief

Before things get confusing, let's lay out the basic structure. In Swift, there are three main ways to inject dependencies.

1. **Constructor (init) injection** — dependencies are passed in as `init` parameters
2. **Property injection** — assigned to a `var` property later
3. **Method injection** — injected through a separate method

Here's the code for constructor injection, the most recommended approach.

```swift
final class OrderService {
    private let repo: MemberRepository // let guarantees immutability

    init(repo: MemberRepository) { // constructor (init) injection
        self.repo = repo
    }
}
```

Since this works with pure Swift syntax and no extra library, the code stays clean.

Property injection, on the other hand, is this short.

```swift
final class OrderService {
    var repo: MemberRepository! // looks convenient in one line, but…
}
```

At a glance, property injection looks like the simpler option. But that convenience comes back to bite you later.

---

## Why Is Property Injection Discouraged?

Let's start with what actually happens in practice.

Property injection is genuinely painful when writing tests. If you forget to inject a dependency after creating the object, you get a forced-unwrap crash — and just looking at the type gives you no way to know what needs to be filled in to make it complete.

With constructor injection, you can drop a mock object straight in with pure Swift code, like `OrderService(repo: mockRepo)`.

The second problem is that you can't use the `let` keyword.

Constructor injection lets you declare a property as `let`, so once it's injected, it becomes an immutable object that never changes.

Property injection, by contrast, requires `var`, which means the value can be changed at any time — leaving room for mistakes.

The third issue is circular references.

If A references B and B references A, property injection won't catch this until the app actually runs. It only blows up once you navigate to that particular screen.

Constructor injection surfaces the problem right at the moment the object is created — and if the design is genuinely circular, it won't even compile — so you catch the issue far earlier.

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/4-1783847681137.png" alt="Circular references — even the timing of the crash is different">
  <figcaption>Circular references — even the timing of the crash is different</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/2.png" alt="Back when I only used field injection, writing tests was always a hassle">
  <figcaption>Back when I only used field injection, writing tests was always a hassle</figcaption>
</figure>

---

## Comparison Table at a Glance

Explaining this in words gets confusing, so here's a table. (Reflecting Swift community recommendations as of 2026)

| Category | Constructor (init) Injection | Property Injection | Method Injection |
|------|------------|------------------|------------------|
| Immutability (let) | Possible ⭕ | Not possible ❌ | Not possible ❌ |
| Testability | High | Low | Moderate |
| Circular reference detection | Immediately at creation | Discovered late | Discovered late |
| Required vs. optional dependencies | Suited for required | Ambiguous | Suited for optional |
| Code conciseness | Moderate | Very concise | Moderate |

The pattern is clear just from the table.

Constructor injection wins out on most of these criteria. That's why DI library docs like Swinject and Factory recommend constructor injection as the default.

---

## So When Should You Use the Other Two?

This isn't to say you should use constructor injection exclusively. Each method has a place where it fits well.

**Method injection** works well for optional dependencies.

For dependencies that don't necessarily need to be present — nice to have if available, fine to skip if not — you can flexibly inject them through a method like `configure(with:)`.

**Property injection** still has a place, mainly for cases where you don't control the initialization timing yourself, like view controllers built from a storyboard.

In general application code, it's best to avoid it.

To sum up:

- Required dependencies → constructor injection
- Optional dependencies → method injection
- Property injection in general code → avoid

---

## Frequently Asked Questions

**Q. Does using a DI library like Factory make constructor injection more convenient?**

Yes. If you register how to create a dependency with Swinject or Factory, the container builds the object to pass into the constructor for you. Your code gets shorter while you keep all the benefits of `let` immutability.

**Q. What if a constructor ends up with too many parameters?**

That's not a problem with the injection method — it's a sign that the class is doing too much. Consider splitting responsibilities into separate classes first.

**Q. Do small projects really need a DI library?**

No. For a project with just a handful of screens, plain constructor injection passed directly through `init` is more than enough.

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/3.png" alt="When you're not sure which to pick, this order makes it easy">
  <figcaption>When you're not sure which to pick, this order makes it easy</figcaption>
</figure>

---

The simplicity of property injection is tempting at first, but once you start writing tests and collaborating with a team, you'll feel firsthand why constructor injection's advantages get emphasized so much.

If you're on the fence, start with constructor injection. It's a choice you'll be grateful for as your codebase grows.
