---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The History of Objective-C, Explained: The Language Steve Jobs Loved (Even the Origin of the NS Prefix)"
lang: en
description: "There's one language almost everyone runs into when they start learning iOS development. Unfamiliar syntax packed with square brackets, and mysterious prefix…"
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
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EC%97%AD%EC%82%AC/) · **English** · [日本語](/ja/Objective-C-%EC%97%AD%EC%82%AC/) · [中文](/zh/Objective-C-%EC%97%AD%EC%82%AC/)
{: .notice--info}

There's one language almost everyone runs into when they start learning iOS development. Unfamiliar syntax packed with square brackets, and mysterious prefixes like `NSString`.

That's Objective-C.

The first time I ran into this language in some legacy code, I remember thinking, "Where on earth did this syntax come from?" But once I learned its history, the code started to look completely different to me.

Let's start with the core fact: Objective-C is a language created in the early 1980s by grafting Smalltalk's object concepts onto the C language.

And that famous NS prefix? It comes from NeXTSTEP, the operating system of NeXT, the company Steve Jobs founded.

Here's what you'll take away from this post:

1. How Objective-C came to be (C + Smalltalk)
2. The origin of the NS prefix and the technical reason behind it
3. Its heyday alongside the iPhone
4. Why it's survived even into the Swift era

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="From 1983 to the iPhone, Objective-C's history connects in one unbroken line">
  <figcaption>From 1983 to the iPhone, Objective-C's history connects in one unbroken line</figcaption>
</figure>

---

## How exactly was Objective-C born?

Back in the early 1980s, there were two engineers named Brad Cox and Tom Love. They wanted two things at once.

- C: fast, but no object-oriented concepts
- Smalltalk: an elegant object-oriented language, but far too slow

Their answer was Objective-C. The principle was to layer a very thin object-oriented layer on top of C, while leaving C itself completely untouched.

> Objective-C is a strict superset of C.
>
> Every single piece of C code in the world is valid Objective-C code, without any modification.

Let me show you what that actually looks like with a short snippet of code.

```objc
// Plain C code — also valid Objective-C code as-is
int sum = 1 + 2;

// What Objective-C adds on top: Smalltalk-style message sending (the brackets)
NSString *text = [NSString stringWithFormat:@"Sum: %d", sum];
```

The top two lines are pure C syntax, and that one line with the brackets below is the entirety of what Objective-C newly added.

You could say its body came from C, while its soul — the object model and message passing — came from Smalltalk. That bracket syntax, `[receiver message]`, is precisely the legacy it inherited from Smalltalk.

Around the very same time as C++, using the exact same ingredients (C + object orientation), an entirely different dish was cooked up.

---

## So what does the NS prefix actually mean?

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="The true identity of the NS prefix traces back to these NeXT days">
  <figcaption>The true identity of the NS prefix traces back to these NeXT days</figcaption>
</figure>

In 1985, Steve Jobs was ousted from Apple, the very company he'd founded.

He went on to found a company called NeXT, and the official development language of that company's operating system, NeXTSTEP, was Objective-C.

The "NS" in `NSString` and `NSArray` is literally short for **NeXTSTEP**. Even in the code of the latest 2026 iPhone apps, the name of Jobs's late-1980s company is fossilized right there in the code.

But why bother with a prefix at all? There's a technical reason.

- Objective-C has no concept of namespaces
- Class names have to be globally unique, so identical names collide
- As a result, the convention arose of prepending a company or project's initials (Apple uses NS, AFNetworking uses AF)

Apple even issued official guidance stating, "Two-letter prefixes are reserved for Apple; third parties should use three letters." It's essentially a case of patching a hole in the language with a cultural convention.

For reference, Swift did away with the need for this convention once it introduced module-level namespaces. That's exactly why `String` and `Array`, without the NS, have become symbols of the Swift era.

---

## Its heyday alongside the iPhone

In 1996, Apple acquired NeXT for $400 million, and Jobs returned after 12 years away.

NeXTSTEP became the backbone of Mac OS X, and Objective-C became Apple's official language.

Then in 2008, the App Store opened. There was exactly one language you could use to build iPhone apps: Objective-C.

As developers around the world flooded in, a language that had been a niche player for over 20 years suddenly became the hottest language around.

By the TIOBE Index, a measure of language popularity, it was named "Language of the Year" twice, in 2012 and 2014, and at one point climbed all the way to third place, behind only C and Java.

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="In the App Store's early days, this was the language everyone built apps with">
  <figcaption>In the App Store's early days, this was the language everyone built apps with</figcaption>
</figure>

---

## Is Objective-C still used today?

When Apple unveiled Swift in 2014, it looked like Objective-C's era was coming to a close. And yet, more than a decade later, the language still hasn't died. There are three reasons for that.

1. **Apple's system frameworks**: The roots of UIKit and Foundation are still Objective-C, so even Swift code has to talk to them through bridging.
2. **Legacy codebases**: You can't rewrite a massive app with millions of lines of code overnight, so there's steady demand for developers who can maintain existing code.
3. **The runtime's dynamic nature**: Its runtime allows for swapping out methods on the fly (method swizzling), so analytics SDKs still lean on this runtime.

**Q. Should I learn Objective-C now, from scratch?**

There's almost no reason to start a new project in this language today. That said, if you work as an iOS developer dealing with an older codebase, being able to read it is a real asset.

**Q. Is knowing just Swift enough?**

For new development, Swift alone is plenty. That said, understanding where NS came from and why those brackets exist will help you understand Apple's frameworks far better.

---

## Wrapping up

Objective-C isn't a dead language — it's closer to a veteran preparing for retirement. It grew up outside Apple alongside Jobs, then came back with him to become the heart of the world's most valuable company.

Next time you spot `NSString` in some old code, try greeting it warmly. Those two letters carry 40 years of history.

**References**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)
