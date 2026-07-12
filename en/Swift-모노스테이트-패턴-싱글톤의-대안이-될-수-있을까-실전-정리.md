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
  - Dependency Injection
  - Swift programming
  - learning to code
permalink: /en/Swift-모노스테이트-패턴-싱글톤의-대안이-될-수-있을까-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [中文](/zh/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

For anyone who's wondered if singletons are really okay as-is

If you've done any iOS development, chances are you've used a singleton (Singleton) at some point. I certainly have. Code like `SomeManager.shared` — every project seems to have a handful of these.

But at some point, that `.shared` started to bug me. State gets tangled up during testing, and teammates end up accessing it however they please, from wherever they please.

That's when I came across the Monostate pattern. Today I want to share what Monostate actually is in Swift, and my own hands-on experience figuring out whether it can really replace the singleton.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png" alt="Singletons vs. Monostate — this one image sums it up">
  <figcaption>Singletons vs. Monostate — this one image sums it up</figcaption>
</figure>

Let me give you the conclusion up front: Monostate is a pattern that lets you "share one piece of state while still allowing multiple instances." It has the same goal as a singleton, but the approach is exactly the opposite. That said, it's not a cure-all — it depends on the situation. Let's break it down piece by piece below.

## So what exactly is the Monostate pattern?

The core idea of a singleton is "create exactly one instance." You block the initializer and force everyone to use a single `shared` instance.

Monostate flips that around. You can create as many instances as you like. Instead, all the state (data) inside is shared entirely through static properties.

In other words, whether you create object A or object B, they both point to the same underlying data. From the outside it looks like an ordinary object, but internally it's all wired together as one.

Here's what that looks like in simple Swift.

```swift
struct Settings {
    private static var _volume = 50   // state shared via static
    var volume: Int {                 // used like an instance property
        get { Settings._volume }
        set { Settings._volume = newValue }
    }
}
// Different instances, but the state is one and the same
var a = Settings(); a.volume = 80
print(Settings().volume)  // 80
```

Even if you create a brand-new `Settings()`, `volume` still comes out as 80. Multiple instances, one shared state — that's really all there is to Monostate.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/4-1783848112872.png" alt="Three instances, but they're all looking at the same state">
  <figcaption>Three instances, but they're all looking at the same state</figcaption>
</figure>

---

## How is this different from a singleton?

The biggest difference shows up on the calling side.

With a singleton, whoever uses it always has to be conscious of `.shared` — thinking, "oh right, this is a singleton." With Monostate, you just create it like a normal object with `Settings()`, so the caller doesn't even need to know about the internal implementation.

Here's a quick comparison table.

| Category | Singleton | Monostate |
|---|---|---|
| Number of instances | Exactly 1 | Any number |
| What's shared | The instance itself | The state (static data) |
| How it's used | Explicit `.shared` | Like a regular object |
| Inheritance | Tricky | Relatively flexible |

Inheritance in particular is interesting. Singletons are notoriously awkward to subclass, whereas Monostate is just a regular type, so extending it tends to be more flexible.

---

## So can it actually replace the singleton?

Honestly, sometimes yes, sometimes no.

Let's start with the upsides. The calling code stays cleaner, and you don't end up with a `.shared` global access point scattered all over the codebase. Since the interface looks exactly like a regular object, restructuring things down the line carries less risk too.

> Monostate is a pattern that "hides global state." It looks convenient, but hidden global state is a double-edged sword in itself.

And that's exactly where the problem lies. Because it looks like an ordinary object on the surface, a teammate might assume "this is probably just a local object," create one, and then discover — to their confusion — that the state is actually shared globally. That can be even more confusing than a singleton.

Also, because the state is shared via static properties, you have to worry about concurrency issues in multithreaded environments just as much as you would with a singleton. There's no difference there.

In my experience, for modern Swift projects, I'd recommend considering Dependency Injection before reaching for Monostate. It's easier to test and makes dependencies much clearer.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/2-1783803834678.png" alt="For a modern Swift project, DI is usually the first thing I reach for">
  <figcaption>For a modern Swift project, DI is usually the first thing I reach for</figcaption>
</figure>

---

## So when should you actually use it?

To sum up, here are the cases where it makes sense:

1. When you have a ton of existing singleton code and want to phase it out gradually
2. When you want to keep the caller-facing interface clean, like a regular object
3. When you need to work with global state that requires inheritance or extension

On the other hand, if you're starting a brand-new project from scratch, I'd suggest looking at Dependency Injection or explicit state management before Monostate.

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/3.png" alt="I keep patterns in my toolbox and pull out whichever fits the situation">
  <figcaption>I keep patterns in my toolbox and pull out whichever fits the situation</figcaption>
</figure>

---

In the end, Monostate isn't a "perfect upgrade over the singleton" — it's just another option with a different character. Keep it in your toolbox and pull it out when the situation calls for it.

I hope today's post gives a small bit of guidance to anyone who's grown tired of overusing `.shared`. Rather than jumping ship blindly, I'd encourage you to take a moment to think about what actually fits your project!
