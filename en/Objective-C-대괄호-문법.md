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
description: "When I first started learning iOS and looked at Objective-C code, I'll be honest — I was a bit thrown off."
header:
  og_image: /assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png
categories:
  - iOS
tags:
  - ObjectiveC
  - Objective-C
  - iOS development
  - programming languages
  - message sending
  - Smalltalk
  - learning to code
  - coding for beginners
  - Apple development
  - coding basics
permalink: /en/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **English** · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [中文](/zh/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/)
{: .notice--info}

When I first started learning iOS and looked at Objective-C code, I'll be honest — I was a bit thrown off.

Brackets `[ ]` were everywhere. It clearly looked like some kind of function call, but it looked nothing like what I'd seen in other languages.

I kept wondering, "Why on earth was this designed this way?"

Here's the short answer: those brackets in Objective-C aren't "calling" a function — they're "sending a message" to an object. Once that one concept clicks, the once-unfamiliar brackets suddenly make sense.

Today I want to walk through, in a relaxed way, why these brackets look the way they do and where they came from. 😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C's bracket syntax — there's a reason it looks like this">
  <figcaption>Objective-C's bracket syntax — there's a reason it looks like this</figcaption>
</figure>

---

## Let's start with the key takeaways

First, here's what you'll get out of this post.

1. Objective-C brackets mean "send a message to an object"
2. This syntax was inherited from a language called Smalltalk
3. Once you know the `[object method]` structure, you can read most of it
4. Under the hood, it gets converted into a function called `objc_msgSend`

If you understand just these four points, today's goal is basically done.

---

## So what exactly is Objective-C's message-sending syntax?

In most other languages, calling a method looks like this:

`object.method()`

But Objective-C writes it like this:

```objc
// send the message bark to the dog object
[dog bark];

// send along a count argument as well
[dog barkTimes:3];
```

It looks unfamiliar, but the structure is simple.

`[receivingObject messageToSend]`

You open a bracket, put the object receiving the message on the left, and write the message being sent on the right.

So `[dog bark]` means something like, "Hey dog, bark for me."

I find it much easier to think of this as "talking to" the object rather than "calling a function."

When there are multiple arguments, it extends like this:

```objc
// the message name is split into two parts: setName: and age:
[person setName:@"Chulsoo" age:20];
```

Just think of it as one value attached per colon (:).

---

## Why do the brackets look like this?

> Objective-C's brackets are a trace left behind from layering Smalltalk's "message-sending" philosophy on top of the C language.

The story goes back to the early 1980s.

Two people, Brad Cox and Tom Love, created Objective-C.

At the time, they wanted to keep using C, which was popular back then, while adding object-oriented concepts on top of it.

Their role model for object orientation was Smalltalk.

Smalltalk's core philosophy was that "everything is an object, and objects communicate with each other through messages."

The problem was they had to fit this messaging concept in without breaking C's syntax.

So they took square brackets — barely used in C syntax at the time — and designated that space as the place where messages get sent.

Thanks to that, it could coexist with existing C code without any conflicts.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="Once the feeling of 'sending' a message sinks in, brackets get comfortable">
  <figcaption>Once the feeling of 'sending' a message sinks in, brackets get comfortable</figcaption>
</figure>

This language was later adopted by a company called NeXT, and when Apple acquired NeXT in 1996, it became the backbone of Mac and iPhone development.

The Cocoa framework we know today also came out of this.

So a single unfamiliar bracket carries this much history behind it.

---

## How is it different from dot (.) syntax?

If you look at Objective-C code these days, you'll also often see dot (.) syntax.

Like `dog.name`.

This can be confusing, so I organized the relationship between the two into a table.

| Category | Bracket syntax | Dot (.) syntax |
|------|------------|------------|
| Form | `[dog name]` | `dog.name` |
| Meaning | Message sending | Property access |
| Introduced | From the beginning | Since Objective-C 2.0 (2007) |
| Internal behavior | Executes a method | Effectively converted into a method call |

What's interesting is that dot syntax also ends up being converted into a bracket message internally.

In other words, when `dog.name` runs, it does the same thing as `[dog name]`.

Dot syntax is really just a more convenient-looking outer layer.

So I'd recommend beginners first understand that brackets are the real essence.

---

## What actually happens inside the brackets?

Let's go a bit deeper.

When you write `[dog bark]`, the compiler converts it into a function call to something called `objc_msgSend`.

```objc
// the code we write
[dog bark];

// internally, it roughly converts to this
objc_msgSend(dog, @selector(bark));
```

The first slot holds the object receiving the message, and the second slot holds the name tag (selector) of the method to run.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/4-1783847992119.png" alt="Different on the outside, but it all funnels into one place in the end">
  <figcaption>Different on the outside, but it all funnels into one place in the end</figcaption>
</figure>

This approach is flexible because it decides which method to run at runtime.

Thanks to that, Objective-C had strong dynamic capabilities — swapping or adding methods while the program was running.

Behind that bracket exterior, this kind of flexible structure was hiding.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="It felt awkward to me at first too, but after a few days it clicked">
  <figcaption>It felt awkward to me at first too, but after a few days it clicked</figcaption>
</figure>

---

## Let's wrap up with Q&A

**Q. Do I really need to memorize the brackets?**

Rather than memorizing, once you get a feel for the `[receivingObject messageToSend]` structure, it reads naturally.

**Q. I use Swift now — do I still need to know this?**

Older libraries and example code are still often written in Objective-C, so being able to read it helps a lot.

**Q. What if there are brackets inside brackets?**

That's a structure where the outer one receives the result of the inner one. Reading from the inside out will untangle it.

---

At first, the brackets looked to me like nothing more than a strange rule, but once I reframed them as "syntax for talking to an object," they felt much more familiar.

I find that the more unfamiliar a piece of syntax is, the more it sticks with you once you learn its roots.

I hope this post helps you get a little closer to Objective-C. Cheering you on! 🙌
