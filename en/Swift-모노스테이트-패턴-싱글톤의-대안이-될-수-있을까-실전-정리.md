---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift's Monostate Pattern: A Real Alternative to Singletons? (A Practical Rundown)"
lang: en
description: "For anyone who's wondered if singletons are really okay as-is"
header:
  og_image: /assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png
tags:
  - Swift
  - Monostate pattern
  - Singleton
  - iOS development
  - design patterns
  - Monostate
  - Singleton pattern
  - dependency injection
  - Swift programming
  - software architecture
permalink: /en/Swift-모노스테이트-패턴-싱글톤의-대안이-될-수-있을까-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [中文](/zh/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

For anyone who's wondered if singletons are really okay as-is

If you've done any iOS development, you've almost certainly used a singleton. I have too. Code like `SomeManager.shared` — every project I've worked on has had at least a few of these.

But at some point, that `.shared` started to feel a little uncomfortable. State gets tangled up during testing, and teammates end up reaching into it from all over the place, however they like.

That's when I came across the Monostate pattern. Today I want to share what Monostate actually is in Swift, and whether it can really serve as an alternative to singletons, based on my own hands-on experience.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png" alt="Singleton vs. Monostate — this one diagram sums it all up">
  <figcaption>Singleton vs. Monostate — this one diagram sums it all up</figcaption>
</figure>

Let me get straight to the conclusion first: Monostate is a pattern that lets you "share a single piece of state while still allowing multiple instances." It has the same goal as a singleton, but takes the exact opposite approach. That said, it's not a silver bullet — it depends on the situation. Let's break it down piece by piece below.

## So what exactly is the Monostate pattern?

The core idea of a singleton is "create exactly one instance." You block the initializer and force everyone to use a single `shared` instance.

Monostate is the opposite. You can create as many instances as you want. Instead, all the state (data) inside is shared as static.

In other words, whether you create object A or object B, they both point to the same underlying data. From the outside it looks like an ordinary object, but internally everything is wired to one shared source.

Here's a simple example in Swift.

```swift
struct Settings {
    private static var _volume = 50   // state shared as static
    var volume: Int {                 // used like an instance property,
        get { Settings._volume }
        set { Settings._volume = newValue }
    }
}
// different instances, but the state is one and the same
var a = Settings(); a.volume = 80
print(Settings().volume)  // 80
```

Even though you create a brand-new `Settings()`, volume still comes out as 80. Multiple instances, one shared state — that's Monostate in a nutshell.

---

## How is it different from a singleton?

The biggest difference shows up in the calling code.

With a singleton, whoever uses it always has to be conscious of `.shared` — thinking "oh right, this is a singleton." With Monostate, you just create it like a normal object with `Settings()`, so the caller doesn't need to know anything about the internal implementation.

Here's a summary table.

| Category | Singleton | Monostate |
|---|---|---|
| Number of instances | Exactly 1 | Any number |
| What's shared | The instance itself | State (static data) |
| Calling code | Explicit `.shared` | Like a regular object |
| Inheritance | Awkward | Relatively flexible |

Inheritance is especially interesting here. Subclassing a singleton is genuinely awkward, but Monostate is just a regular type, so it tends to be more flexible to extend.

---

## So can it actually replace singletons?

Honestly, sometimes yes, sometimes no.

Let's start with the upsides. The calling code stays cleaner, and you don't end up with a global access point like `.shared` scattered all over your codebase. Since the interface looks just like a regular object, there's less friction if you ever need to restructure things later.

> Monostate is a pattern that "hides global state." It looks convenient, but hidden global state is itself a double-edged sword.

And that's exactly where the problem lies. Because it looks like an ordinary object on the surface, a teammate might assume "oh, this is just a local object," create one, and only later realize the state is actually shared globally — which can be even more confusing than a singleton.

On top of that, since it's still static sharing under the hood, you have to worry about the same concurrency issues in multithreaded environments. On that front, it's no different from a singleton.

In my experience, in modern Swift I'd recommend reaching for Dependency Injection before Monostate. It's easier to test, and the dependencies are much clearer.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/2-1783803834678.png" alt="In a modern Swift project, DI is usually the first thing I reach for">
  <figcaption>In a modern Swift project, DI is usually the first thing I reach for</figcaption>
</figure>

---

## So when should you actually use it?

To sum up, here are the cases where it makes sense:

1. When you already have a ton of existing singleton code and want to phase it out gradually
2. When you want to keep the calling interface clean, like a regular object
3. When you need to work with global state that requires inheritance or extension

On the other hand, if you're starting a brand-new project from scratch, I'd say look at dependency injection or explicit state management before reaching for Monostate.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/3.png" alt="I keep patterns in my toolbox and pull them out when the situation fits">
  <figcaption>I keep patterns in my toolbox and pull them out when the situation fits</figcaption>
</figure>

---

In the end, Monostate isn't a "perfect upgrade over singletons" — it's just another option with a different character. Keep it in your toolbox and pull it out when the situation calls for it.

I hope today's post gives a small hint to anyone who's grown tired of overusing `.shared`. Rather than switching over blindly, I'd encourage you to take a moment to think about what actually fits your project. Good luck out there!
