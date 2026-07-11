---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why Does Everything in Objective-C Start with an @ Sign? (A Complete Breakdown)"
lang: en
description: "The first time you open up Objective-C code, one thing immediately catches your eye."
header:
  og_image: /assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png
categories:
  - iOS
tags:
  - Objective-C
  - at sign syntax
  - atSymbol
  - programming basics
  - iOS development
  - C language
  - NSString
  - learn to code
  - developer tips
  - Objective-C syntax
permalink: /en/Objective-C-골뱅이-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · **English** · [日本語](/ja/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · [中文](/zh/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/)
{: .notice--info}

The first time you open up Objective-C code, one thing immediately catches your eye.

It's the at signs (@) scattered everywhere.

@interface, @property, and even strings are written like @"Hello". The first time I saw it, I thought, "Wait, is that a typo?"

But it turns out there's a very clear reason behind this @.

> The @ in Objective-C is a signal to the compiler that says, "From here on, this isn't plain C anymore — it's Objective-C's extended syntax."

Today, I want to walk you through why the same @ shows up in @interface, @property, and @"strings" alike, and explain the logic behind it in a simple way.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png" alt="Objective-C's @ syntax — once you get it, there's really just one rule">
  <figcaption>Objective-C's @ syntax — once you get it, there's really just one rule</figcaption>
</figure>

---

## So What Exactly Is the @ in Objective-C?

Let's get straight to the point.

The @ is a special symbol that tells the compiler, "This is syntax unique to Objective-C."

To understand this, you need to know where Objective-C came from.

Objective-C isn't a completely new language. It's the C language with object-oriented features layered on top.

In other words, it includes 100% of the C language as-is, with additional features like classes and messaging bolted on.

But this creates a problem.

From the compiler's perspective, it needs to distinguish between what's original C syntax and what's newly added Objective-C syntax.

And the @ is exactly the marker that draws that dividing line.

---

## Why the At Sign (@) Specifically?

This was the part that intrigued me the most too. There's the asterisk (*), there's the hash (#) — so why @ of all things?

The answer turns out to be surprisingly practical.

The @ symbol simply isn't used anywhere in standard C syntax.

Let's think about the characters C actually uses.

- Variable/function names: letters, numbers, underscore (_)
- Operators: +, -, *, /, =, &, and so on
- Preprocessor: # (e.g., #include)

The @ symbol doesn't appear anywhere on this list.

So the creators of Objective-C picked it up and put it to use. It was a safe symbol that would never clash with existing C code.

If they had used the plain word "interface" as a keyword instead of @interface, every piece of existing C code that used a variable named "interface" would have broken.

By prefixing it with @, that kind of collision is ruled out entirely.

To put it simply, @ is like a drawer handle that gathers up all of Objective-C's exclusive syntax in one place.

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/2.png" alt="What came from C and what Objective-C bolted on — @ is the dividing line">
  <figcaption>What came from C and what Objective-C bolted on — @ is the dividing line</figcaption>
</figure>

---

## Why @interface, @property, and @"strings" All Share the Same @

Now for the main event. Let's look at why these three, which seem so different in nature, all start with the same @.

The short answer: all three are "features that exist only in Objective-C, not in C."

Let's go through them one at a time.

**@interface** — This is the directive that opens up a class's skeleton (declaration). Since C has no concept of a "class" at all, it had to be marked with @. Its counterparts, @implementation and @end, follow the same logic.

**@property** — This is a feature that automatically generates an object's attributes. This, too, is syntax that doesn't exist in plain C, so it gets the @.

**@"string"** — This is the most interesting one. A plain quoted string like "Hello" and @"Hello" are completely different things.

Let's compare them in a table.

| Category | "Hello" | @"Hello" |
|------|---------|----------|
| Identity | C-style character array | NSString object |
| Belongs to | Original C syntax | Objective-C extension |
| Capability | Just a sequence of characters | Can use methods like length |

Just by adding a single @ in front of the quotation marks, a plain chunk of characters transforms into an "object."

That's exactly why the @ is needed. It's essentially an instruction saying, "Don't treat this string as a plain C string — make it an NSString object."

To sum it up:

> Whether it's @interface, @property, or @"string", they all carry the same @ marker because they're all "features that exist in Objective-C but not in C."

---

## Seeing It in Code at a Glance

Explaining this in words alone can feel a bit abstract, so here's a short example.

Below is what a simple class declaration looks like. You can see how @ wraps around Objective-C syntax.

```objectivec
@interface Person : NSObject   // Start of class declaration (syntax that doesn't exist in C)
@property NSString *name;      // Auto-generated property
@end                           // End of declaration

NSString *greeting = @"Hello"; // @ before quotes → NSString object
```

As you can see, every line starting with @ is a feature Objective-C newly added.

Conversely, the parts without @ are syntax carried over directly from C.

So just by checking whether @ is present or not, you can instantly tell, "Ah, this is an Objective-C extension."

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/3.png" alt="Once your eyes catch the @, reading the code gets a whole lot easier">
  <figcaption>Once your eyes catch the @, reading the code gets a whole lot easier</figcaption>
</figure>

---

## Frequently Asked Questions (Q&A)

**Q. Is @ the same as the preprocessor's #?**

No, it's not. The # in #include is a preprocessor directive that gets processed before compilation. The @, on the other hand, is an Objective-C compiler directive that the compiler itself interprets directly, so their roles are different.

**Q. Are there other kinds of @ besides these?**

Yes, quite a few. There's @protocol, @selector, @try/@catch, @autoreleasepool, and more. With modern syntax, you can even easily create an @[] array, an @{} dictionary, or an @42 number object using @.

**Q. Doesn't Swift also have @?**

That's right. Though the meaning is a bit different. In Swift, @ is mainly used to mark attributes, like @State or @IBOutlet. The roots are similar, but it's best to think of their uses as distinct.

---

At first, having an at sign attached to everything in the code felt unfamiliar and a bit awkward. But once I realized it's "the boundary line separating C from Objective-C," I actually came to appreciate it.

Just by following the @ signs, you can immediately spot where the object-oriented syntax begins. Keep this one perspective in mind when reading Objective-C code, and things will get a lot easier. Happy coding, everyone!
