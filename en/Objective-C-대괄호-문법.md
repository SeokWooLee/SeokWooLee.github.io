---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why Does Objective-C's Bracket Syntax Look Like That? (The Secret of Message Passing)"
lang: en
description: "When I first started learning iOS and looked at Objective-C code, I'll admit I was a bit thrown off."
header:
  og_image: /assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png
categories:
  - iOS
tags:
  - ObjectiveC
  - Objective-C
  - iOSDevelopment
  - ProgrammingLanguages
  - MessagePassing
  - Smalltalk
  - LearnToCode
  - CodingForBeginners
  - AppleDevelopment
  - CodingBasics
permalink: /en/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **English** · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [中文](/zh/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/)
{: .notice--info}

When I first started learning iOS and looked at Objective-C code, I'll admit I was a bit thrown off.

Brackets `[ ]` everywhere. It seemed to be some kind of function call, but it looked nothing like any other language I'd seen.

I kept wondering, "Why on earth was this designed this way?"

Here's the short answer: Objective-C's brackets don't "call" a function — they "send a message" to an object. Once you grasp that one concept, those unfamiliar brackets suddenly click into place.

Today I want to walk through, in a relaxed way, why these brackets look the way they do, starting from their roots. 😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C's bracket syntax — there's a real reason it looks this way">
  <figcaption>Objective-C's bracket syntax — there's a real reason it looks this way</figcaption>
</figure>

---

## Let's start with the key takeaways

First, here's what you'll get out of this post.

1. Objective-C brackets mean "send a message to an object"
2. This syntax was inherited from a language called Smalltalk
3. Once you know the `[object method]` structure, you can read most of it
4. Under the hood, it gets translated into a function call named `objc_msgSend`

If you understand these four points, you've already hit today's goal.

---

## What exactly is Objective-C's message-passing syntax?

In most other languages, you call a method like this:

`object.method()`

But Objective-C writes it like this:

```objc
// Send the message "bark" to the dog object
[dog bark];

// Send a count value along as an argument
[dog barkTimes:3];
```

The look is unfamiliar, but the structure is simple.

`[receivingObject messageToSend]`

You open a bracket, put the object receiving the message on the left, and write the message to send on the right.

So `[dog bark]` means "Hey dog, bark for me."

I found it much easier once I stopped thinking of this as a "function call" and started thinking of it as "talking to something."

When there are multiple arguments, it extends like this:

```objc
// The message name is split into two parts: setName: and age:
[person setName:@"Chulsoo" age:20];
```

Just think of it as one value attached to each colon (:).

---

## Why do the brackets look like this?

> Objective-C's brackets are a trace of grafting Smalltalk's "message passing" philosophy onto the C language.

The story goes back to the early 1980s.

Two people, Brad Cox and Tom Love, created Objective-C.

They wanted to keep using C, which was popular at the time, while adding object-oriented concepts on top of it.

Their role model for object orientation was Smalltalk.

Smalltalk's core philosophy was that "everything is an object, and objects communicate with each other by sending messages."

The challenge was fitting this message concept in without breaking C's existing syntax.

So they took square brackets — barely used in C syntax at the time — and designated that space as the place where messages get sent.

Thanks to that, it could be mixed with existing C code without any conflicts.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="Once you get the feel of 'sending' a message, the brackets stop being scary">
  <figcaption>Once you get the feel of 'sending' a message, the brackets stop being scary</figcaption>
</figure>

This language was later adopted by a company called NeXT, and when Apple acquired NeXT in 1996, it became the backbone of Mac and iPhone development.

The Cocoa framework we know today also came out of this lineage.

So that one unfamiliar bracket carries this much history behind it.

---

## How is it different from dot (.) syntax?

If you look at Objective-C code these days, you'll often see dot (.) syntax too.

Something like `dog.name`.

This can be confusing, so I put together a table comparing the two.

| Category | Bracket syntax | Dot (.) syntax |
|------|------------|------------|
| Form | `[dog name]` | `dog.name` |
| Meaning | Message passing | Property access |
| Introduced | From the very beginning | After Objective-C 2.0 (2007) |
| Internal behavior | Executes a method | Effectively converted into a method call |

The interesting part is that dot syntax also gets converted into a bracket message internally.

In other words, when `dog.name` runs, it does the exact same thing as `[dog name]`.

Dot syntax is basically just a nicer-looking coat draped over the same thing.

That's why I recommend beginners first understand that brackets are the real essence.

---

## What actually happens inside those brackets?

Let's go a little deeper.

When you write `[dog bark]`, the compiler converts it into a function call named `objc_msgSend`.

```objc
// The code we wrote
[dog bark];

// Internally, it's roughly converted to this
objc_msgSend(dog, @selector(bark));
```

The first slot holds the object receiving the message, and the second slot holds the name tag (selector) of the method to execute.

This approach decides which method to run at runtime, which makes it flexible.

Thanks to this, Objective-C had strong dynamic capabilities — swapping or adding methods while the program was running.

Behind that bracket exterior, this kind of flexible structure was hiding all along.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="It felt awkward to me at first too, but it grew on me after a few days">
  <figcaption>It felt awkward to me at first too, but it grew on me after a few days</figcaption>
</figure>

---

## Let's wrap up with Q&A

**Q. Do I have to memorize the bracket syntax?**

Rather than memorizing it, once you get a feel for the `[receivingObject messageToSend]` structure, it reads naturally on its own.

**Q. I use Swift now — do I still need to know this?**

Older libraries and sample code are still written in Objective-C, so being able to read it helps a lot.

**Q. What if there are brackets inside brackets?**

That's a structure where the outer bracket receives the result of the inner one. Read it from the inside out and it makes sense.

---

At first, the brackets looked like just a strange rule to me too, but once I reframed it as "syntax for talking to an object," it felt a lot more familiar.

The more unfamiliar a piece of syntax is, the more it tends to stick with you once you know its roots.

I hope this post helps you get a little closer to Objective-C. Rooting for you! 🙌
