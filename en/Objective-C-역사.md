---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The History of Objective-C: The Language Steve Jobs Loved (and Where the NS Prefix Really Comes From)"
lang: en
description: "There's one language every iOS developer runs into sooner or later. Unfamiliar syntax packed with brackets, mysterious prefixes like NSString."
header:
  og_image: /assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png
categories:
  - iOS
tags:
  - Objective-C
  - Objective-C history
  - programming languages
  - iOS development
  - Apple
  - Swift
  - Steve Jobs
  - NS prefix
  - learn to code
  - coding history
permalink: /en/Objective-C-역사/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EC%97%AD%EC%82%AC/) · **English** · [日本語](/ja/Objective-C-%EC%97%AD%EC%82%AC/) · [中文](/zh/Objective-C-%EC%97%AD%EC%82%AC/)
{: .notice--info}

There's one language every iOS developer runs into sooner or later. Unfamiliar syntax packed with brackets, mysterious prefixes like `NSString`.

That's Objective-C.

When you first encounter it in legacy code, it's easy to wonder, "Where on earth did this syntax come from?" Once you know its history, though, the code looks completely different.

Let's start with the essentials: Objective-C was created in the early 1980s by grafting Smalltalk's object concepts onto the C language.

And that famous NS prefix? It comes from NeXTSTEP, the operating system built by NeXT, the company Steve Jobs founded.

Here's what you'll take away from this post:

1. How Objective-C came to be (C + Smalltalk)
2. Where the NS prefix comes from, and the technical reason behind it
3. Its golden age alongside the iPhone
4. Why it's still alive in the Swift era

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="From 1983 to the iPhone, Objective-C's history unfolds in a single line">
  <figcaption>From 1983 to the iPhone, Objective-C's history unfolds in a single line</figcaption>
</figure>

---

## How was Objective-C born?

In the early 1980s, two engineers named Brad Cox and Tom Love wanted two things at once.

- C: fast, but with no concept of object orientation
- Smalltalk: an elegant object-oriented language, but far too slow

Their answer was Objective-C: layer a very thin object-oriented skin on top of C, while leaving C itself completely untouched.

> Objective-C is a strict superset of C.
>
> Every piece of C code in the world is, without modification, valid Objective-C code.

Let me show you what that actually looks like with a short snippet.

```objc
// Ordinary C code — also valid Objective-C code as-is
int sum = 1 + 2;

// What Objective-C adds on top: Smalltalk-style message sending (the brackets)
NSString *text = [NSString stringWithFormat:@"Sum: %d", sum];
```

The first two lines are plain C syntax; the single bracketed line below is the entirety of what Objective-C bolted on.

You could say the body came from C, while the soul — the object model and message passing — came from Smalltalk. That bracket syntax, `[receiver message]`, is a direct inheritance from Smalltalk.

Think of it this way: around the same time as C++, using the exact same ingredients (C plus object orientation), an entirely different dish came out of the kitchen.

---

## So what does the NS prefix actually stand for?

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="The identity of the NS prefix traces back to this NeXT era">
  <figcaption>The identity of the NS prefix traces back to this NeXT era</figcaption>
</figure>

In 1985, Steve Jobs was pushed out of Apple, the company he himself had founded.

He went on to found a company called NeXT, and the official development language for its operating system, NeXTSTEP, was none other than Objective-C.

The NS in `NSString` and `NSArray` is simply short for **NeXTSTEP**. Even in the latest 2026 iPhone app code, the name of Jobs's late-1980s company is still fossilized right there in the source.

But why bother with a prefix at all? There's a technical reason.

- Objective-C has no namespaces
- Class names must be globally unique, so identical names collide
- This gave rise to the convention of prefixing class names with company or project initials (Apple uses NS, AFNetworking uses AF)

Apple even issued an official guideline: "two-letter prefixes are reserved for Apple; third parties should use three letters." It's essentially a case of patching a hole in the language with a cultural convention.

For reference, Swift introduced module-level namespaces, which made this convention unnecessary. That's exactly why `String` and `Array`, without the NS, became emblematic of the Swift era.

---

## The golden age that arrived with the iPhone

In 1996, Apple acquired NeXT for $400 million, and Jobs returned to the company twelve years after being ousted.

NeXTSTEP became the backbone of Mac OS X, and Objective-C became Apple's official language.

Then, in 2008, the App Store opened. There was exactly one language you could use to build an iPhone app: Objective-C.

As developers around the world flocked to it, a language that had been a minor player for over twenty years suddenly became the hottest one around.

By the TIOBE Index, a widely used measure of language popularity, it was named "Language of the Year" twice, in 2012 and 2014, and at one point climbed as high as third place, behind only C and Java.

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="In the App Store's early days, this was the language everyone built apps with">
  <figcaption>In the App Store's early days, this was the language everyone built apps with</figcaption>
</figure>

---

## Is Objective-C still used today?

When Apple unveiled Swift in 2014, it looked like Objective-C's era was drawing to a close. And yet, more than a decade later, the language is still very much alive. There are three reasons why.

1. **Apple's system frameworks**: UIKit and Foundation are still rooted in Objective-C at their core, so even Swift code talks to them through bridging.
2. **Legacy codebases**: You can't rewrite an app with millions of lines of code overnight, so there's steady demand for developers who can maintain it.
3. **The runtime's dynamic nature**: Techniques like method swizzling — swapping out methods at runtime — are still possible, which is why many analytics SDKs continue to rely on this runtime.

**Q. Should I learn Objective-C today?**

You'll rarely start a brand-new project in this language. That said, if you work as an iOS developer on older codebases, being able to read it is a real asset.

**Q. Is knowing Swift enough on its own?**

For new development, Swift is plenty. But knowing where NS came from and why the brackets exist will make Apple's frameworks click into place far more easily.

---

## Wrapping up

Objective-C isn't a dead language — it's more like a veteran preparing for retirement. It grew up outside Apple alongside Jobs, then came back with him to become the heart of the world's most valuable company.

So the next time you spot `NSString` in an old codebase, greet it warmly. Those two letters carry forty years of history.

**References**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)
