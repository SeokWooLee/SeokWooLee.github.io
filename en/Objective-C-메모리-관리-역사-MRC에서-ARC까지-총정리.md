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
description: "If you've spent any time doing iOS development, there's a question that probably crosses your mind at some point."
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

If you've spent any time doing iOS development, there's a question that probably crosses your mind at some point.

"Why is old Objective-C code packed with `retain` and `release` calls everywhere?"

I remember being pretty thrown off myself when I opened up some old code after starting out with Swift.

Today I want to walk through the history of Objective-C memory management — how things evolved from MRC all the way to ARC.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="From MRC to ARC — the whole flow of Objective-C memory management at a glance">
  <figcaption>From MRC to ARC — the whole flow of Objective-C memory management at a glance</figcaption>
</figure>

Let's start with the core takeaway.

> Objective-C's memory management moved from an era where developers manually counted references (MRC) to one where the compiler counts for you (ARC).

There was also a brief experiment with garbage collection along the way, but the matter was ultimately settled in 2011 when ARC arrived.

Let's go through this era by era below.

---

## What Is Reference Counting? The Basic Concept Behind Memory Management

Before diving into the history, let's pin down just one concept.

That's "reference count."

Think of it as every object carrying a number that tracks "how many things are currently holding onto me."

As long as that number is 1 or higher, the object stays alive. Once it hits 0, the object gets deallocated.

So the rule is: increment the count when you hold onto an object (`retain`), and decrement it when you let go (`release`).

This simple rule is the root of Objective-C's memory management.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="How a single number decides whether an object lives or dies: the reference count flow">
  <figcaption>How a single number decides whether an object lives or dies: the reference count flow</figcaption>
</figure>

---

## The MRC Era: When Developers Counted by Hand

Before ARC — that is, during the MRC (Manual Retain Count) era — this number was managed by hand, by actual people.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="Old code full of retain and release calls — I was pretty thrown off at first too">
  <figcaption>Old code full of retain and release calls — I was pretty thrown off at first too</figcaption>
</figure>

The rules were clear. People often memorized them with the acronym "NARC."

- If you create an object with **N**ew, **A**lloc, **R**etain, or **C**opy, you're responsible for it
- Any object you're responsible for must be `release`d once you're done with it

Here's what actual code looked like:

```objc
// Creating an object sets its reference count to 1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // count 2
[obj release];  // count 1
[obj release];  // count 0 → deallocated
```

This is where the trouble started.

Forget a `release` and you get a memory leak. Release too early and you end up touching an object that's already gone — and the app crashes.

That's the infamous "zombie object" crash.

You had to keep a running tally in your head of how many things were currently holding a given object — genuinely nerve-wracking work.

---

## autorelease: "I'll Let Go of This Later, Not Right Now"

There was one more tricky situation in the MRC era.

It came up whenever a method created a new object and needed to hand it back to the caller.

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"Hello"];
    return msg; // I alloc'd it, so I need to release it... but when?
}
```

By the rules, whoever called alloc should call `release`.

But if you release it before returning, the object disappears before the caller even gets to use it. And if you don't release it at all, that's a leak.

`autorelease` was invented to solve exactly this dilemma.

It basically says, "Don't release this right now — release it a little later."

An object marked with autorelease gets added to a waiting list called the "autorelease pool," and when the pool gets drained (typically at the end of a run loop cycle), all the objects in it get released at once.

That way, the caller can safely receive the object and use it.

Convenience constructors like `[NSString stringWithFormat:]`, which hand you a ready-to-use object without an explicit alloc, all returned objects built this exact way.

By the way, this autorelease pool lives on even in the ARC era, under the name `@autoreleasepool` blocks. It's a practical tool you reach for when memory usage spikes inside a loop — there's enough to say about it that I've written up a separate post just on that topic.

---

## Why Did Garbage Collection Fail?

Apple was well aware of how painful this was.

So in 2007, with Mac OS X 10.5 Leopard, they introduced "garbage collection" (GC) — automatic memory cleanup, similar to Java.

It seemed like it would be a relief, since developers wouldn't need to write `retain` and `release` anymore.

But the results weren't great.

GC ran in the background and could cause the app to briefly stall at unpredictable moments. That was especially costly for the iPhone, where performance and battery life were critical.

Because of that, GC never made it into iOS at all.

And eventually, even GC on the Mac got deprecated starting with OS X 10.8 in 2012.

---

## Enter ARC: Letting the Compiler Count for You

Then in 2011, Apple came up with the solution: ARC (Automatic Reference Counting).

It was announced alongside Xcode 4.2, iOS 5, and OS X 10.7 Lion.

The idea behind ARC was clever.

> Keep reference counting itself as the mechanism, but have the compiler insert `retain` and `release` calls instead of the developer.

Unlike GC, there's no separate cleanup process running at runtime — instead, deallocation code is automatically inserted exactly where it's needed, at compile time.

Thanks to that, memory management became automated with almost no runtime performance cost.

Here's a table comparing the two eras:

| Category | MRC | ARC |
|------|-----|-----|
| Introduced | Early days ~ 2011 | 2011 (iOS 5) |
| retain/release | Written manually | Inserted automatically by the compiler |
| autorelease | Called manually | Managed by the compiler |
| Memory leak risk | High | Much lower |
| Performance cost | None | Negligible |

That said, ARC isn't a silver bullet.

It can't automatically resolve "retain cycles," where objects hold onto each other. Developers still have to break those manually using weak references like `weak` or `unowned`.

And this same concept carries straight through into the Swift we use today.

---

## FAQ

**Q. Do I still need to learn MRC today?**

In practice, you'll rarely write new code in MRC style. That said, it's worth understanding the underlying principles, since you might run into older libraries or get asked about it in interviews.

**Q. Is autorelease still used under ARC?**

You won't call it directly, but the mechanism itself is still running under the hood in ARC. That's why `@autoreleasepool` blocks are still a valid tool today.

**Q. Does Swift use ARC too?**

Yes, Swift is also built on ARC. That's why retain cycles and the `weak` concept matter just as much in Swift.

---

To sum it up briefly: Objective-C's memory management evolved from "hand-counted MRC" → "a brief GC experiment" → "compiler-counted ARC."

The automatic memory management we take for granted today was actually refined through countless crashes and trial and error.

I hope this overview serves as a small map for anyone studying iOS development. Happy coding!

---

## References

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
