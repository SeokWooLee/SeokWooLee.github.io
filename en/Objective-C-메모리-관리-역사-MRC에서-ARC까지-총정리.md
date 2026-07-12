---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "A History of Objective-C Memory Management: From MRC to ARC"
lang: en
description: "If you spend any time doing iOS development, there's a question that eventually comes up."
header:
  og_image: /assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png
tags:
  - ObjectiveC
  - iOSDevelopment
  - ARC
  - MemoryManagement
  - retainrelease
  - MRC
  - AppleDeveloper
  - Programming
  - Swift
  - LearnToCode
permalink: /en/Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

If you spend any time doing iOS development, there's a question that eventually comes up.

"Why is old Objective-C code littered with `retain` and `release` calls everywhere?"

If you got your start with Swift, opening up some legacy code for the first time can be a bit of a shock.

Today, let's walk through the history of Objective-C memory management — how things evolved from MRC all the way to ARC.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="From MRC to ARC — the evolution of Objective-C memory management at a glance">
  <figcaption>From MRC to ARC — the evolution of Objective-C memory management at a glance</figcaption>
</figure>

Here's the core idea, up front:

> Objective-C memory management moved from an era where developers counted references by hand (MRC) to one where the compiler does the counting for you (ARC).

There was a brief experiment with garbage collection along the way, but the whole landscape settled once ARC arrived in 2011.

Let's go through each era one at a time.

---

## What Is Reference Counting? The Basic Concept Behind Memory Management

Before diving into the history, let's pin down one concept.

That's the "reference count."

Think of every object as carrying a number that tracks "how many things are currently holding on to me."

As long as that number is 1 or higher, the object stays alive. Once it hits 0, the object gets deallocated.

So when you hold on to an object, you bump the number up (`retain`), and when you let go, you bump it down (`release`).

This simple rule is the foundation of Objective-C memory management.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="How a single number decides an object's life and death: the reference count flow">
  <figcaption>How a single number decides an object's life and death: the reference count flow</figcaption>
</figure>

---

## The MRC Era: When Developers Counted by Hand

Before ARC — that is, during the MRC (Manual Retain Count) era — this number had to be managed by hand.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="Old code full of retain and release calls — a bit jarring the first time you see it">
  <figcaption>Old code full of retain and release calls — a bit jarring the first time you see it</figcaption>
</figure>

The rule was straightforward. Many developers memorized it as "NARC":

- If you created an object with **N**ew, **A**lloc, **R**etain, or **C**opy, you're responsible for it
- Once you're done with an object you're responsible for, you must call `release`

Here's what the code actually looked like:

```objc
// Creating an object gives it a reference count of 1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // count is now 2
[obj release];  // count is now 1
[obj release];  // count is now 0 → memory is deallocated
```

Here's where the trouble started.

Forget to call `release`, and memory leaks. Release too early, and you end up touching an object that's already gone — crashing the app.

This was the infamous "zombie object" crash.

Developers had to keep a running tally in their heads of exactly how many references were currently held — a genuinely nerve-wracking task.

---

## autorelease: "I'll Let Go of This Later, Not Right Now"

The MRC era had one more tricky situation.

It came up whenever a method created a new object and needed to hand it back to the caller.

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"Hello"];
    return msg; // I called alloc, so I need to release it... but when?
}
```

By the rules, whoever called alloc should call `release`.

But if you release before returning, the object disappears before the caller even gets to use it. And if you don't release at all, that's a leak.

`autorelease` was invented to solve exactly this dilemma.

It essentially says, "Don't release me right now — release me a little later."

An object marked with autorelease gets added to a waiting list called the "autorelease pool," and when that pool drains (typically at the end of a run loop cycle), all the objects in it get released at once.

That way, the caller could safely receive the object and use it.

Convenience constructors like `[NSString stringWithFormat:]`, which hand back an object without requiring an explicit alloc, all relied on this exact mechanism under the hood.

By the way, the autorelease pool didn't disappear with ARC — it lives on today as the `@autoreleasepool` block. It's a practical tool you reach for when memory usage spikes inside a loop, and there's enough to say about it that it deserves its own dedicated post.

---

## Why Did Garbage Collection Fail?

Apple was well aware of how cumbersome this all was.

So in 2007, with Mac OS X 10.5 Leopard, Apple introduced "Garbage Collection" (GC) — automatic memory cleanup, similar to what you'd find in Java.

It seemed like it would make life easier, since developers wouldn't have to write `retain` and `release` anymore.

But the results were underwhelming.

GC ran in the background and could cause the app to briefly stutter at unpredictable moments. That was especially costly on the iPhone, where performance and battery life were tightly constrained.

As a result, GC never made it into iOS at all.

Eventually, even GC on the Mac was deprecated starting with OS X 10.8 in 2012.

---

## Enter ARC: Letting the Compiler Do the Counting

Then, in 2011, Apple introduced the solution that stuck: ARC (Automatic Reference Counting).

It shipped alongside Xcode 4.2, iOS 5, and OS X 10.7 Lion.

The idea behind ARC was clever.

> Keep the reference-counting model as-is, but let the compiler insert the `retain` and `release` calls instead of the developer.

Unlike GC, there's no separate runtime process sweeping through memory. Instead, the deallocation code gets inserted automatically at exactly the right spots, at compile time.

The result: memory management became automated, with almost no runtime performance cost.

Here's a side-by-side comparison of the two eras:

| | MRC | ARC |
|------|-----|-----|
| Introduced | Early days ~ 2011 | 2011 (iOS 5) |
| retain/release | Written by hand | Inserted automatically by the compiler |
| autorelease | Called manually | Managed by the compiler |
| Risk of memory leaks | High | Much lower |
| Performance overhead | None | Practically none |

That said, ARC isn't a silver bullet.

It can't automatically resolve "retain cycles," where two objects hold strong references to each other — developers still need to break those manually using weak references like `weak` or `unowned`.

This exact concept carried straight over into the Swift we use today.

---

## Frequently Asked Questions (Q&A)

**Q. Do I still need to learn MRC today?**

In practice, you'll rarely if ever write new code using MRC. That said, it's worth understanding the underlying principles, since you might encounter it in older libraries or get asked about it in interviews.

**Q. Is autorelease still used under ARC?**

You won't call it directly, but the mechanism itself is still running under the hood, even with ARC. That's why the `@autoreleasepool` block remains a valid, useful tool today.

**Q. Does Swift also use ARC?**

Yes, Swift is built on ARC as well. That's why retain cycles and the `weak` concept are just as important in Swift.

---

To sum it up briefly: Objective-C memory management evolved from "MRC, where you counted by hand" through "a brief experiment with GC" to "ARC, where the compiler counts for you."

The automatic memory management we now take for granted was actually refined through countless crashes and trial and error along the way.

I hope this walkthrough serves as a small map for anyone studying iOS development. Happy coding!

---

## References

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
