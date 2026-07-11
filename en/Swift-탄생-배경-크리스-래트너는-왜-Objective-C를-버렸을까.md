---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why Chris Lattner Ditched Objective-C: The Origin Story of Swift"
lang: en
description: "If you've ever started learning iOS development, you've probably wondered at some point: \"Apple already had Objective-C working fine — why did they bother…"
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
  - optionals
  - learn to code
permalink: /en/Swift-탄생-배경-크리스-래트너는-왜-Objective-C를-버렸을까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · **English** · [日本語](/ja/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [中文](/zh/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
{: .notice--info}

If you've ever started learning iOS development, you've probably wondered at some point: "Apple already had Objective-C working fine — why did they bother building Swift from scratch?"

When I built my first app in Swift, I remember thinking the syntax was refreshingly clean. But once I started digging into the story behind it, I found it was actually a pretty fascinating tale.

Here's the short version: Swift is a language that **one engineer, Chris Lattner, started building almost entirely on his own, in secret, starting in 2010**. The goal was to fix, at the root, the safety problems in Objective-C — a language that had barely changed in over 30 years.

Today, let's take a relaxed look at how Swift actually came into being.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="Here's a snapshot of why Swift pushed out 30-year-old Objective-C">
  <figcaption>Here's a snapshot of why Swift pushed out 30-year-old Objective-C</figcaption>
</figure>

---

## When was Swift created, and by whom?

Development of Swift began in **July 2010**.

The person behind it was Chris Lattner. His name might not ring a bell, but if you're a developer, you're already using his work every single day.

He's the creator of **LLVM** and the **Clang** compiler — the core technologies underpinning Apple's entire developer toolchain.

In the early days, Swift really was Lattner's solo project. It's become something of a legend how he quietly refined the design in his spare time — after work, on weekends.

Around 2011, other engineers inside Apple began joining in, and it grew into a full-fledged team project.

Finally, it was unveiled to the world at **WWDC in June 2014**. Developers who were there that day still talk about how stunned everyone was — nobody had seen the announcement coming.

That September, it shipped officially alongside Xcode 6, making it available to everyone.

---

## Why did Chris Lattner want to replace Objective-C?

There's really one core reason.

> Objective-C was designed in the early 1980s, and it lacked modern safety mechanisms.

Put simply, Objective-C is "C with a messaging layer bolted on top." It inherited all of C's flexibility — but that flexibility came with real danger baked in.

The classic example is how it handles **nil (empty values)**.

In Objective-C, sending a message to a nil object doesn't crash your app. Nothing happens at all.

That sounds convenient at first glance, but it's actually a trap. Bugs caused by missing values quietly get buried — only to blow up somewhere completely unrelated, much later.

Having already spent years wrestling with Objective-C's memory-safety issues while building LLVM and Clang, Lattner reportedly arrived at this conclusion:

"Instead of endlessly patching an existing language, let's build a new one that prevents mistakes from happening in the first place."

The idea wasn't just to catch mistakes — it was to make certain mistakes structurally impossible.

---

## So what actually changed with Swift?

The single most iconic change Swift introduced is the concept of **Optionals**.

The idea was to force, at the syntax level, an explicit flag for "this value might be empty" — so developers are required to handle the case where a value doesn't exist.

The code below makes the philosophical difference between the two languages crystal clear.

First, here's Objective-C, which just lets nil slide by:

```objc
// What if name is nil? Nothing happens, it just silently passes through
NSString *name = [user fetchName];
NSUInteger len = [name length];  // Result is 0 — easy to miss the bug
```

Swift, by contrast, forces the developer to confront the possibility of a missing value head-on:

```swift
// name is of type String? — the type itself declares that a value may be absent
let name: String? = user.fetchName()
if let name = name {   // Safely unwrap and use only when a value exists
    print(name.count)
}
```

It's just a few lines of code, but it perfectly captures the difference between "letting mistakes slide" and "actively preventing them."

Beyond that, Swift also gained popularity thanks to type inference, concise syntax, and fast execution speed. For what it's worth, Swift wasn't just designed in reaction to Objective-C — it also drew on the best ideas from languages like Rust, Haskell, Python, and Ruby.

---

## What happened to Swift after that?

Swift established itself quickly after its unveiling.

Here's a quick rundown of the key milestones:

| Date | Event |
|------|------|
| July 2010 | Chris Lattner begins development |
| June 2014 | Officially announced at WWDC |
| September 2014 | Ships officially with Xcode 6 |
| December 2015 | Open-sourced under Apache 2.0 |
| January 2017 | Lattner leaves Apple for Tesla |

Interestingly, the very father of the language ended up leaving Apple in 2017. Ted Kremenek took over as the lead of the Swift project after that.

Even so, Swift has remained firmly established as the core language of Apple's ecosystem ever since. And once it went open source, it expanded its reach into Linux and server-side development as well.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="Even after Lattner left, Swift kept on growing">
  <figcaption>Even after Lattner left, Swift kept on growing</figcaption>
</figure>

---

What strikes me most is that a project one engineer quietly started on weekends went on to become a language used by developers all over the world for more than a decade.

Since Swift was born out of a single question — "why?" — once you know the backstory, every piece of its syntax starts to look different.

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="Once you know the backstory, even a single line of code reads differently">
  <figcaption>Once you know the backstory, even a single line of code reads differently</figcaption>
</figure>

If you're just getting started with Swift, understanding Optionals alone should give you a real sense of why the language was designed the way it was. I hope this post serves as a good first step in that direction.

---

## References

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_(programming_language))
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)
