---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why Does Objective-C's Bracket Syntax Look Like That? (The Secret of Message Sending)"
lang: en
description: "When you start learning iOS development and look at Objective-C code for the first time, it's easy to feel thrown off."
header:
  og_image: /assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png
categories:
  - iOS
tags:
  - ObjectiveC
  - Objective-C
  - iOSDevelopment
  - ProgrammingLanguages
  - MessageSending
  - Smalltalk
  - LearnToCode
  - CodingForBeginners
  - AppleDevelopment
  - CodingBasics
permalink: /en/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **English** · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [中文](/zh/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/)
{: .notice--info}

When you start learning iOS development and look at Objective-C code for the first time, it's easy to feel thrown off.

The code is covered in square brackets `[ ]`. It looks like it's calling functions, but the shape is so different from other languages.

It naturally leaves you wondering, "Why on earth was this designed this way?"

To cut to the answer: Objective-C's square brackets don't "call" a function — they're syntax for "sending a message" to an object. Once you grasp this single concept, those unfamiliar brackets suddenly start making sense.

Today, let's take a relaxed look at why these brackets look the way they do, tracing them back to their roots. 😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C's bracket syntax — there's a reason it looks this way">
  <figcaption>Objective-C's bracket syntax — there's a reason it looks this way</figcaption>
</figure>

---

## Let's Start With the Key Takeaways

First, here's what you'll get out of this post.

1. Objective-C's brackets mean "send a message to an object"
2. This syntax was inherited from a language called Smalltalk
3. Once you know the `[object method]` structure, you can read most of it
4. Under the hood, it gets converted into a function call called `objc_msgSend`

If you understand these four points, you've achieved today's goal.

---

## What Exactly Is Objective-C's Message-Sending Syntax?

In most other languages, you'd call a method like this:

`object.method()`

But Objective-C writes it like this:

```objc
// send the message bark to the dog object
[dog bark];

// send the count value along as an argument too
[dog barkTimes:3];
```

The look is unfamiliar, but the structure is simple.

`[receivingObject messageToSend]`

You open a bracket, put the object that will receive the message on the left, and write the message to send on the right.

So `[dog bark]` means "hey dog, go bark."

Thinking of this as "talking to something" rather than a "function call" makes it much easier to follow.

When there are multiple arguments, it extends like this:

```objc
// the message name is split into two pieces: setName: and age:
[person setName:@"Chulsoo" age:20];
```

You can think of it as one value attaching to each colon (:).

---

## Why Do the Brackets Look Like This?

> Objective-C's brackets are a trace left behind from layering Smalltalk's "message-sending" philosophy on top of the C language.

The story goes back to the early 1980s.

Two people, Brad Cox and Tom Love, created Objective-C.

They wanted to keep using C, which was popular at the time, while adding object-oriented concepts on top of it.

The role model for that object orientation was Smalltalk.

Smalltalk's core philosophy was that "everything is an object, and objects communicate with each other by sending messages."

The problem was they needed to introduce this messaging concept without breaking C's syntax.

So they took square brackets — barely used in C syntax at the time — and designated that space as the place for sending messages.

Thanks to this, it could be mixed with existing C code without any conflicts.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="Once the feel of 'sending' a message clicks, the brackets get comfortable">
  <figcaption>Once the feel of 'sending' a message clicks, the brackets get comfortable</figcaption>
</figure>

This language was later adopted by a company called NeXT, and when Apple acquired NeXT in 1996, it became the backbone of Mac and iPhone development.

The Cocoa framework we know today also came from this lineage.

So this one unfamiliar bracket carries a surprisingly long history.

---

## How Is It Different From Dot (.) Syntax?

If you look at Objective-C code these days, you'll often see dot (.) syntax too.

Something like `dog.name`.

This can be confusing, so here's a table comparing the two.

| Category | Bracket Syntax | Dot (.) Syntax |
|------|------------|------------|
| Form | `[dog name]` | `dog.name` |
| Meaning | Message sending | Property access |
| Introduced | From the beginning | Since Objective-C 2.0 (2007) |
| Internal behavior | Method execution | Effectively converted into a method |

What's interesting is that dot syntax also ultimately gets converted into a bracket message internally.

In other words, when `dog.name` runs, it does the same thing as `[dog name]`.

Dot syntax is just a more visually convenient outer layer.

That's why I'd recommend beginners first understand that brackets are the real essence.

---

## What Actually Happens Inside the Brackets?

Let's go a bit deeper.

When you write `[dog bark]`, the compiler converts it into a function call called `objc_msgSend`.

```objc
// the code we write
[dog bark];

// internally, it's roughly converted into this
objc_msgSend(dog, @selector(bark));
```

The first slot holds the object receiving the message, and the second slot holds the name tag (selector) of the method to execute.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/4-1783847992119.png" alt="Different on the outside, but it all funnels into one place">
  <figcaption>Different on the outside, but it all funnels into one place</figcaption>
</figure>

This approach is flexible because it decides which method to run at runtime.

Thanks to this, Objective-C had strong dynamic capabilities, letting you change or add methods while the program was running.

Behind the outer appearance of brackets, this kind of flexible structure was hiding.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="It felt awkward at first, but it clicks after a few days of use">
  <figcaption>It felt awkward at first, but it clicks after a few days of use</figcaption>
</figure>

---

## Let's Wrap Up With Q&A

**Q. Do I have to memorize the brackets?**

Rather than memorizing, once you get a feel for the single structure `[receivingObject messageToSend]`, it reads naturally.

**Q. I use Swift now — do I still need to know this?**

Older libraries and sample code are still often written in Objective-C, so being able to read it is a big help.

**Q. What if there are brackets inside brackets?**

It's a structure where the outer bracket receives the result of the inner one. Reading from the inside out will untangle it.

---

Brackets might seem like a strange rule at first, but once you shift your thinking to "syntax for talking to an object," they become much friendlier.

The more unfamiliar a piece of syntax is, the longer it tends to stick with you once you know its roots.

I hope this post helps you get a little more comfortable with Objective-C. Rooting for you! 🙌
