---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C's @ Symbol: Why Does Everything Start With It? (A Complete Breakdown)"
lang: en
description: "Open up an Objective-C file for the first time, and one thing jumps out right away."
header:
  og_image: /assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png
categories:
  - iOS
tags:
  - Objective-C
  - Objective-C syntax
  - at symbol
  - "@ symbol"
  - programming basics
  - iOS development
  - C language
  - NSString
  - learn to code
  - developer tips
permalink: /en/Objective-C-골뱅이-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · **English** · [日本語](/ja/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · [中文](/zh/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/)
{: .notice--info}

Open up an Objective-C file for the first time, and one thing jumps out right away.

The @ symbol is everywhere.

@interface, @property, and even strings written as @"Hello". At first glance, it might look like a typo.

But there's a very clear reason behind that @.

> The @ in Objective-C is a signal to the compiler that says, "From here on, this isn't plain C — it's Objective-C's extended syntax."

Today, let's walk through why the same @ symbol shows up on @interface, @property, and @"strings" alike — and the logic behind it.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png" alt="Objective-C's @ symbol looks confusing, but there's really just one rule behind it">
  <figcaption>Objective-C's @ symbol looks confusing, but there's really just one rule behind it</figcaption>
</figure>

---

## What exactly is the @ in Objective-C?

Let's start with the core idea.

The @ is a special marker that tells the compiler, "This part is Objective-C-specific syntax."

To understand why, you need to know where Objective-C came from.

Objective-C isn't a brand-new language built from scratch. It's C with object-oriented features layered on top.

In other words, it includes 100% of standard C, with classes and messaging added on top of that foundation.

But that setup creates a problem.

The compiler needs a way to tell which parts are original C syntax and which parts are the newly added Objective-C syntax.

The @ symbol is exactly that dividing line.

---

## Why the @ symbol specifically?

There's also the asterisk (*) and the hash (#) — so why did they land on @?

The answer turns out to be pretty practical.

The @ symbol isn't used anywhere in standard C syntax.

Think about the characters C actually uses.

- Variable and function names: letters, digits, underscore (_)
- Operators: +, -, *, /, =, &, and so on
- Preprocessor directives: # (as in #include)

Nowhere on that list does @ show up.

That's exactly why the designers of Objective-C picked it up. It was a safe symbol that would never collide with existing C code.

If they had used a plain word like "interface" as a keyword instead, any existing C code that used "interface" as a variable name would have broken instantly.

By prefixing it with @, that kind of collision is ruled out from the start.

A simple way to think about it: @ works like a labeled drawer handle that collects all of Objective-C's own syntax in one place.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/2.png" alt="What comes from C and what Objective-C adds on top — the @ marks that boundary">
  <figcaption>What comes from C and what Objective-C adds on top — the @ marks that boundary</figcaption>
</figure>

---

## Why @interface, @property, and @"strings" all share the @

Now for the main event. Let's look at why these three, despite seeming so different from each other, all start with the same @.

The short answer: all three are "features that exist in Objective-C but not in C."

Let's go through them one at a time.

**@interface** — This is the directive that opens a class's declaration (its skeleton). Since C has no concept of a "class" at all, it needed the @ marker. Its counterparts, @implementation and @end, exist for the same reason.

**@property** — This feature auto-generates an object's properties for you. It's also syntax that doesn't exist in plain C, so it gets the @ too.

**@"string"** — This one's the most interesting. A plain quoted "Hello" and an @"Hello" are completely different things.

Here's a comparison:

| Category | "Hello" | @"Hello" |
|------|---------|----------|
| What it is | A C-style character array | An NSString object |
| Belongs to | Original C syntax | Objective-C extension |
| Capability | Just a sequence of characters | Supports methods like length |

Add a single @ in front of the quotation marks, and it transforms from a plain chunk of characters into an "object."

That's why the @ is needed there — it's essentially an instruction saying, "Don't treat this as a plain C string, make it an NSString object."

To sum it up:

> Whether it's @interface, @property, or @"string", they all carry the same @ marker because they're all features that exist only in Objective-C, not in C.

---

## Seeing it in code

This can feel a bit abstract when explained purely in words, so here's a short example.

Below is what a simple class declaration looks like. You can see exactly how the @ wraps around Objective-C syntax.

```objectivec
@interface Person : NSObject   // Start of class declaration (doesn't exist in C)
@property NSString *name;      // Auto-generated property
@end                           // End of declaration

NSString *greeting = @"Hello"; // @ before quotes → NSString object
```

As you can see, every line that starts with @ is a feature Objective-C added on top.

 Conversely, the parts without @ are plain C syntax carried over as-is.

Just by checking whether @ is present or not, you can instantly tell, "Ah, this is an Objective-C extension."

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/3.png" alt="Once your eyes catch the @, reading the code gets a lot easier">
  <figcaption>Once your eyes catch the @, reading the code gets a lot easier</figcaption>
</figure>

---

## Frequently Asked Questions (Q&A)

**Q. Is @ the same as the # preprocessor directive?**

No. The # in #include is a preprocessor directive handled before compilation even begins. The @, on the other hand, is an Objective-C compiler directive interpreted directly by the compiler itself — so they play different roles.

**Q. Are there other kinds of @ besides these?**

Yes, quite a few. There's @protocol, @selector, @try/@catch, @autoreleasepool, and more. In modern syntax, you can even use @ to quickly create an @[] array, an @{} dictionary, or an @42 number object.

**Q. Swift has @ too, right?**

That's right. Though the meaning is a bit different there. In Swift, @ is mainly used to mark attributes, as in @State or @IBOutlet. The roots are similar, but it's worth keeping the two usages distinct in your mind.

---

That @ scattered throughout the code might feel unfamiliar at first, but once you realize it marks "the boundary between C and Objective-C," it starts to feel like a welcome landmark instead.

Just by tracking the @ symbols, you can immediately spot where the object-oriented syntax begins. Keep this one perspective in mind next time you're reading Objective-C code, and it'll go a lot more smoothly. Happy coding!
