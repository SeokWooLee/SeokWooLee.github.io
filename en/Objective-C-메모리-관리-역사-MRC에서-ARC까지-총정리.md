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
description: "If you've spent any time doing iOS development, there's a question that eventually comes up."
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
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

If you've spent any time doing iOS development, there's a question that eventually comes up.

"Why is old Objective-C code littered with `retain` and `release` calls?"

I remember being pretty thrown off myself when I opened up some legacy code after starting out with Swift.

Today I want to walk through the history of Objective-C memory management — how things evolved from MRC all the way to ARC.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="From MRC to ARC — the evolution of Objective-C memory management at a glance">
  <figcaption>From MRC to ARC — the evolution of Objective-C memory management at a glance</figcaption>
</figure>

Let's start with the core idea.

> Objective-C memory management moved from an era where developers counted references by hand (MRC) to an era where the compiler counts them for you (ARC).

There was also a brief experiment with garbage collection along the way, but the matter was ultimately settled in 2011 when ARC arrived.

Let's go through it era by era.

---

## What Is Reference Counting, Anyway? The Basic Concept Behind Memory Management

Before diving into the history, let's pin down just one concept.

That's "reference count."

Think of every object as having a number attached to it that tracks "how many things are currently holding onto me."

As long as that number is 1 or higher, the object stays alive. Once it hits 0, the object gets deallocated.

So when you take hold of an object, you bump the number up (`retain`), and when you let go, you bump it down (`release`).

This simple rule is the root of all Objective-C memory management.

---

## The MRC Era: When Developers Counted by Hand

Before ARC — that is, in the MRC (Manual Retain Count) era — this number was managed entirely by hand.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="Old code full of retain and release calls — it threw me off the first time too">
  <figcaption>Old code full of retain and release calls — it threw me off the first time too</figcaption>
</figure>

The rule was clear-cut, and people often memorized it with the acronym "NARC."

- If you created an object with **N**ew, **A**lloc, **R**etain, or **C**opy, you own it
- Once you're done with an object you own, you must `release` it

Here's what actual code looked like:

```objc
// Creating an object gives it a reference count of 1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // count 2
[obj release];  // count 1
[obj release];  // count 0 → deallocated
```

The problem was obvious.

Forget a `release` and you got a memory leak. Release too early and you'd touch an object that was already gone, crashing the app.

The infamous "zombie object" crash.

You had to constantly track in your head how many things were holding onto a given object at any moment — genuinely nerve-wracking work.

---

## autorelease: "I'll Let Go of This a Little Later, Not Right Now"

The MRC era had one more tricky situation.

It came up whenever a method created a new object and had to hand it back to the caller.

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"Hello"];
    return msg; // I allocated it, so I need to release it... but when?
}
```

By the rules, whoever called alloc should call `release`.

But if you release before returning, the object disappears before the caller even gets to use it. And if you don't release at all, that's a leak.

`autorelease` was invented to solve exactly this dilemma.

It essentially says, "Don't release this right now — release it a little later."

An object marked with autorelease gets added to a waiting list called the "autorelease pool," and when that pool drains (typically at the end of a run loop cycle), all those objects get released at once.

That way, the caller could safely receive and use the object.

Convenience constructors like `[NSString stringWithFormat:]`, which hand you an object without you calling alloc yourself, all returned objects created this exact way.

By the way, this autorelease pool survived into the ARC era too, under the name of `@autoreleasepool` blocks. It's a practical tool people reach for when memory usage spikes inside a loop — there's enough to say about it that I've written up a separate post just on that topic.

---

## Why Did Garbage Collection Fail?

Apple was well aware of how painful this was.

So in 2007, with Mac OS X 10.5 Leopard, they introduced "Garbage Collection" (GC) — automatic memory cleanup, similar to what Java does.

It seemed like it would be convenient: developers wouldn't need to write `retain` and `release` at all.

But the results weren't great.

GC ran in the background and caused the app to briefly hang at unpredictable moments. And on the iPhone, where performance and battery life were critical, that overhead was a real burden.

So GC never made it into iOS at all.

Even on the Mac, GC was eventually deprecated starting with OS X 10.8 in 2012.

---

## Enter ARC: The Compiler Does the Counting for You

Then in 2011, Apple came up with the solution: ARC (Automatic Reference Counting).

It was announced alongside Xcode 4.2, iOS 5, and OS X 10.7 Lion.

The idea behind ARC was clever.

> Keep the reference-counting approach, but have the compiler insert `retain` and `release` calls automatically instead of the developer.

Unlike GC, there's no separate cleanup process running at runtime. Instead, deallocation code gets automatically inserted exactly where it's needed, at compile time.

That meant memory management became automated with almost no runtime performance cost.

Here's a comparison of the two eras:

| | MRC | ARC |
|------|-----|-----|
| Introduced | Early days ~ 2011 | 2011 (iOS 5) |
| retain/release | Written by hand | Inserted automatically by the compiler |
| autorelease | Called manually | Managed by the compiler |
| Memory leak risk | High | Much lower |
| Performance overhead | None | Nearly none |

That said, ARC isn't a silver bullet.

It can't automatically resolve "retain cycles," where two objects hold strong references to each other. Developers still need to break those cycles using weak references like `weak` or `unowned`.

This exact concept carried straight over into the Swift we use today.

---

## FAQ

**Q. Do I still need to learn MRC today?**

In practice, you'll rarely, if ever, write new code using MRC. But it's still worth understanding the underlying principles, since you might encounter old libraries or get asked about the concept in interviews.

**Q. Is autorelease still used under ARC?**

You won't call it directly, but the mechanism itself is still running under the hood in ARC. That's why `@autoreleasepool` blocks are still a valid, useful tool today.

**Q. Does Swift use ARC too?**

Yes, Swift is also built on ARC. That's why retain cycles and the `weak` concept matter just as much in Swift.

---

To sum it up briefly: Objective-C memory management evolved from "MRC, where you counted by hand" through "a brief experiment with GC" to "ARC, where the compiler counts for you."

The automatic memory management we now take for granted is actually the result of countless crashes and trial and error along the way.

I hope this overview serves as a small map for anyone studying iOS development. Happy coding!

---

## References

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
