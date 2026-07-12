---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The History of Objective-C Memory Management: From MRC to ARC"
lang: en
description: "If you spend enough time doing iOS development, there's a question that eventually crosses your mind."
header:
  og_image: /assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png
tags:
  - ObjectiveC
  - iOS development
  - ARC
  - memory management
  - retain release
  - MRC
  - Apple developer
  - programming
  - Swift
  - learn to code
permalink: /en/Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

If you spend enough time doing iOS development, there's a question that eventually crosses your mind.

"Why is old Objective-C code stuffed with `retain` and `release` calls everywhere?"

If you got your start with Swift, opening up some legacy code for the first time can be a genuinely puzzling experience.

Today, let's walk through the history of Objective-C memory management — how things evolved from MRC all the way to ARC.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="From MRC to ARC — the evolution of Objective-C memory management at a glance">
  <figcaption>From MRC to ARC — the evolution of Objective-C memory management at a glance</figcaption>
</figure>

Let's start with the core idea.

> Objective-C memory management moved from an era where developers counted references by hand (MRC) to an era where the compiler counts them for you (ARC).

There was also a brief experiment with garbage collection along the way, but it was ARC's arrival in 2011 that finally settled things.

Let's go through each era one by one.

---

## What Is Reference Counting? The Basic Concept Behind Memory Management

Before diving into the history, let's nail down one concept.

That's the "reference count."

Think of every object as carrying a number that tracks "how many things are currently holding onto me."

As long as that number is 1 or higher, the object stays alive. Once it hits 0, the object is deallocated from memory.

So when you take hold of an object, you increment the count (`retain`), and when you let go, you decrement it (`release`).

This simple rule is the root of all Objective-C memory management.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="Life and death hinging on a single number: the reference count in action">
  <figcaption>Life and death hinging on a single number: the reference count in action</figcaption>
</figure>

---

## The MRC Era: When Developers Counted by Hand

Before ARC — that is, during the MRC (Manual Retain Count) era — this number had to be managed by hand.

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="Old code littered with retain and release calls — it can throw you off the first time you see it">
  <figcaption>Old code littered with retain and release calls — it can throw you off the first time you see it</figcaption>
</figure>

The rule was clear, and it was often memorized with the mnemonic "NARC":

- If you create an object via **N**ew, **A**lloc, **R**etain, or **C**opy, you're responsible for it
- Once you're done with an object you're responsible for, you must `release` it

Here's what actual code looked like:

```objc
// Creating an object sets its reference count to 1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // count 2
[obj release];  // count 1
[obj release];  // count 0 → deallocated
```

The trouble started here.

Forget to call `release`, and memory leaks. Release too early, and you end up touching an object that's already gone, crashing the app.

This was the infamous "zombie object" crash.

Developers had to keep constant mental track of exactly how many references were currently held on any given object — a genuinely nerve-wracking task.

---

## autorelease: "I'll Let Go of It in a Moment, Not Right Now"

The MRC era had one more tricky situation to deal with.

It came up whenever a method created a new object and needed to hand it back to the caller.

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"Hello"];
    return msg; // I called alloc, so I need to release it... but when?
}
```

By the rules, whoever calls alloc should call `release`.

But if you release before returning, the object disappears before the caller even gets to use it. And if you don't release at all, that's a leak.

`autorelease` was invented to solve exactly this dilemma.

It essentially says, "Don't release this right now — release it a little later."

An object marked with autorelease gets added to a waiting list called the "autorelease pool," and when that pool drains (typically at the end of a run loop cycle), all the pending objects get released at once.

That meant the caller could safely receive and use the object.

Convenience constructors like `[NSString stringWithFormat:]`, which hand you an object without requiring an explicit alloc, were all built on top of this exact mechanism.

Worth noting: this autorelease pool didn't disappear in the ARC era — it lives on as the `@autoreleasepool` block. It's a practical tool you reach for when memory usage spikes inside loops, and there's enough to say about it that I've covered it in a separate post.

---

## Why Did Garbage Collection Fail?

Apple was well aware of how cumbersome this all was.

So in 2007, with Mac OS X 10.5 Leopard, they introduced garbage collection (GC) — automatic memory cleanup similar to what Java offers.

On paper, it sounded great: developers wouldn't need to write `retain` or `release` at all.

But the results fell short.

GC ran in the background and could pause the app unpredictably at inconvenient moments. That was a serious problem for the iPhone in particular, given how sensitive it is to performance and battery life.

As a result, GC never made it into iOS at all.

And eventually, even Mac GC was deprecated starting with OS X 10.8 in 2012.

---

## Enter ARC: Letting the Compiler Count for You

Then in 2011, Apple delivered its actual solution: ARC (Automatic Reference Counting).

It shipped alongside Xcode 4.2, iOS 5, and OS X 10.7 Lion.

ARC's idea was clever.

> Keep the reference counting mechanism as-is, but have the compiler insert the `retain` and `release` calls instead of the developer.

Unlike GC, there's no separate runtime process sweeping through memory. Instead, the necessary deallocation code gets inserted automatically at exactly the right spots, at compile time.

The result: memory management became automatic, with virtually no runtime performance cost.

Here's a side-by-side comparison of the two eras:

| | MRC | ARC |
|------|-----|-----|
| Introduced | Early days ~ 2011 | 2011 (iOS 5) |
| retain/release | Written manually | Inserted automatically by the compiler |
| autorelease | Called manually | Managed by the compiler |
| Memory leak risk | High | Much lower |
| Performance overhead | None | Virtually none |

That said, ARC isn't a silver bullet.

It can't automatically resolve "retain cycles," where two objects hold strong references to each other. Developers still need to break those cycles using weak references like `weak` or `unowned`.

And this exact concept carries straight through into the Swift we use today.

---

## Frequently Asked Questions (Q&A)

**Q. Do I still need to learn MRC today?**

In practice, you'll almost never write new code using MRC. But since older libraries still use it and interviewers sometimes ask about the underlying concepts, it's worth understanding the fundamentals.

**Q. Is autorelease still used under ARC?**

You won't call it directly, but the mechanism itself is still running under the hood in ARC. That's why the `@autoreleasepool` block remains a valid, useful tool today.

**Q. Does Swift also use ARC?**

Yes, Swift is built on ARC as well. That's why retain cycles and the `weak` keyword matter just as much in Swift.

---

To sum it up briefly: Objective-C memory management evolved from hand-counted MRC, through a brief experiment with GC, to compiler-counted ARC.

The automatic memory management we now take for granted was actually refined through countless crashes and trial and error.

I hope this history serves as a small map for anyone studying iOS development. Happy coding!

---

## References

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
