---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Origin Story of Swift: Why Chris Lattner Walked Away from Objective-C"
lang: en
description: "If you've ever started learning iOS development, you've probably asked yourself at some point: \"Objective-C was working just fine — why did Apple bother…"
header:
  og_image: /assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png
tags:
  - Swift
  - Swift programming language
  - Chris Lattner
  - Objective-C
  - iOS development
  - programming languages
  - Apple development
  - history of Swift
  - Swift optionals
  - learning to code
permalink: /en/Swift-탄생-배경-크리스-래트너는-왜-Objective-C를-버렸을까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · **English** · [日本語](/ja/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [中文](/zh/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
{: .notice--info}

If you've ever started learning iOS development, you've probably asked yourself at some point: "Objective-C was working just fine — why did Apple bother building Swift from scratch?"

When I built my first app in Swift, I remember thinking the syntax felt remarkably clean. But once I started digging into the story behind it, I found it was actually a pretty fascinating tale.

Here's the short version: Swift is **a language that one engineer, Chris Lattner, started building almost entirely alone and in secret back in 2010**. The goal was to fix, from the ground up, the safety problems in Objective-C — a language that had barely changed in over 30 years.

Today I want to walk through, in a casual way, how Swift actually came into being.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="Here's why Swift pushed out 30-year-old Objective-C, summed up in one image">
  <figcaption>Here's why Swift pushed out 30-year-old Objective-C, summed up in one image</figcaption>
</figure>

---

## When was Swift created, and by whom?

Work on Swift began in **July 2010**.

The person behind it was Chris Lattner. The name might not ring a bell, but if you're a developer, you've almost certainly used his work every single day.

He's the creator of **LLVM** and the **Clang** compiler — core technologies that underpin Apple's entire developer toolchain.

In the early days, this was reportedly a solo project. There's a well-known story that Lattner quietly refined the language's design in his spare time, after work and on weekends.

Around 2011, other engineers inside Apple began joining in, and it grew into a full-fledged team effort.

Finally, it was unveiled to the world at **WWDC in June 2014**. Developers who were in the room that day still talk about how stunned they were — nobody had seen the announcement coming.

That September, Swift shipped officially alongside Xcode 6, making it available to everyone.

---

## Why did Chris Lattner want to replace Objective-C?

There's really one core reason.

> Objective-C was designed in the early 1980s, and it lacked the safety mechanisms of a modern language.

Put simply, Objective-C is "C with message passing bolted on top." It inherited all of C's flexibility — but that flexibility came with real danger.

The clearest example is how it handles **nil (empty values)**.

In Objective-C, sending a message to a nil object doesn't crash the app. Nothing happens at all.

That might sound convenient, but it's actually a trap. Bugs caused by missing values get silently swallowed — only to blow up somewhere completely unrelated, much later.

Having spent years wrestling with Objective-C's memory-safety issues while building LLVM and Clang, Lattner reportedly arrived at a conclusion:

"Instead of patching an existing language over and over, let's build a new one that makes these mistakes impossible in the first place."

The idea wasn't just to catch mistakes — it was to make the mistake itself structurally impossible.

---

## So what actually changed with Swift?

The single most iconic change Swift introduced is the concept of **Optionals**.

It forces you, at the type-system level, to explicitly mark "this value might be empty" — so developers are required to handle the case where a value is missing.

The code below shows just how different the two languages' philosophies really are.

First, here's Objective-C simply shrugging off nil:

```objc
// If name is nil? Nothing happens, and it silently moves on
NSString *name = [user fetchName];
NSUInteger len = [name length];  // Result is 0 — easy to miss the bug
```

Swift, on the other hand, forces the developer to confront the possibility that a value might be missing:

```swift
// name is of type String? — the type itself signals it might have no value
let name: String? = user.fetchName()
if let name = name {   // Only used safely when a value actually exists
    print(name.count)
}
```

It's a small snippet, but it lays bare the difference between "letting mistakes slide" and "preventing mistakes outright."

Beyond that, Swift gained popularity thanks to type inference, concise syntax, and fast execution. Worth noting: Swift's design wasn't just informed by Objective-C — it also drew on the strengths of languages like Rust, Haskell, Python, and Ruby.

---

## What happened to Swift after that?

Swift found its footing quickly after its debut.

Here's a quick timeline of the major milestones:

| Date | Event |
|------|------|
| July 2010 | Chris Lattner begins development |
| June 2014 | Officially announced at WWDC |
| September 2014 | Ships officially with Xcode 6 |
| December 2015 | Open-sourced (Apache 2.0) |
| January 2017 | Lattner leaves Apple for Tesla |

Here's an interesting twist: the very father of the language, Lattner, left Apple in 2017. Leadership of the Swift project was then passed on to Ted Kremenek.

Despite that, Swift has remained firmly established as the central language of Apple's ecosystem ever since. And once it went open source, it expanded its reach to Linux and server-side development as well.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="Even after Lattner left, Swift kept right on growing">
  <figcaption>Even after Lattner left, Swift kept right on growing</figcaption>
</figure>

---

What struck me most is this: a project one engineer quietly started on a weekend went on to become a language used by developers worldwide for more than a decade.

Because Swift began with a single question — "why?" — once you know the backstory, every bit of its syntax starts to look different.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="Once you know the backstory, a single line of code reads completely differently">
  <figcaption>Once you know the backstory, a single line of code reads completely differently</figcaption>
</figure>

If you're just getting started with Swift, understanding Optionals alone should give you a real feel for why the language was designed the way it is. I hope this post gives you a good first step in that direction.

---

## References

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_%28programming_language%29)
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)
