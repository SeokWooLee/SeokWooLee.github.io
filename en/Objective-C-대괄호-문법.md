---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why Does Objective-C's Bracket Syntax Look Like That? (The Secret Behind Message Sending)"
lang: en
description: "When you're starting out with iOS and open Objective-C code for the first time, it's easy to feel thrown off."
header:
  og_image: /assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png
categories:
  - iOS
tags:
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
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **English** · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [中文](/zh/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/)
{: .notice--info}

When you're starting out with iOS and open Objective-C code for the first time, it's easy to feel thrown off.

Everything's covered in square brackets `[ ]`. It looks like it's calling a function, but it looks nothing like other languages.

You can't help but wonder, "Why did they build it like this?"

Here's the short answer: in Objective-C, those brackets aren't "calling" a function — they're "sending a message" to an object. Once this one concept clicks, those unfamiliar brackets suddenly make sense.

Today, let's dig into why these brackets look the way they do, tracing it back to its roots. 😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C's bracket syntax — there's a reason it looks the way it does">
  <figcaption>Objective-C's bracket syntax — there's a reason it looks the way it does</figcaption>
</figure>

---

## Let's start with the key takeaways

Here's what you'll get out of this post.

1. Objective-C brackets mean "sending a message to an object"
2. This syntax was inherited from a language called Smalltalk
3. Once you understand the `[object method]` structure, most of it reads easily
4. Under the hood, it gets translated into a function called `objc_msgSend`

If you understand just these four points, you've already achieved today's goal.

---

## What exactly is Objective-C's message-sending syntax?

In most other languages, calling a method looks like this:

`object.method()`

But Objective-C writes it like this:

```objc
// send the message bark to the dog object
[dog bark];

// send count as an argument along with it
[dog barkTimes:3];
```

The look is unfamiliar, but the structure is simple.

`[receivingObject messageToSend]`

You open a bracket, put the object receiving the message on the left, and write the message to send on the right.

So `[dog bark]` means "Hey dog, go bark."

It's much easier to grasp if you think of it not as a "function call" but as "talking to" the object.

When there are multiple arguments, it extends like this:

```objc
// the message name is split into two parts: setName: and age:
[person setName:@"Chulsoo" age:20];
```

Just think of each colon (:) as attaching one value.

---

## Why do the brackets look like this?

> Objective-C's brackets are a trace left behind from layering Smalltalk's "message sending" philosophy on top of the C language.

The story goes back to the early 1980s.

Two people, Brad Cox and Tom Love, created Objective-C.

They wanted to keep using C, which was popular at the time, while adding object-oriented concepts to it.

Their role model for object orientation was Smalltalk.

Smalltalk's core philosophy was that "everything is an object, and objects communicate with each other through messages."

The problem was they had to fit this messaging concept in without breaking C's syntax.

So they took square brackets, which were barely used in C syntax, and designated that space as where messages get sent.

Thanks to that, it could mix with existing C code without any conflicts.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="Once the feel of 'sending' a message sinks in, brackets get easier">
  <figcaption>Once the feel of 'sending' a message sinks in, brackets get easier</figcaption>
</figure>

This language was later adopted by a company called NeXT, and when Apple acquired NeXT in 1996, it became the backbone of Mac and iPhone development.

The Cocoa framework we know today came out of this as well.

So that one unfamiliar pair of brackets carries this much history within it.

---

## How is it different from dot (.) syntax?

If you look at Objective-C code these days, you'll also often see dot (.) syntax.

Something like `dog.name`.

This can be confusing, so here's a table comparing the two.

| Category | Bracket syntax | Dot (.) syntax |
|------|------------|------------|
| Form | `[dog name]` | `dog.name` |
| Meaning | Message sending | Property access |
| Introduced | From the beginning | After Objective-C 2.0 (2007) |
| Under the hood | Executes a method | Effectively converted into a method |

What's interesting is that dot syntax also gets converted into a bracket message under the hood in the end.

In other words, when `dog.name` runs, it does the same thing as `[dog name]`.

Dot syntax is really just a coat put on top to make things easier on the eyes.

That's why I'd recommend beginners first understand that brackets are the essence of it.

---

## What actually happens inside those brackets?

Let's go a bit deeper.

When you write `[dog bark]`, the compiler converts it into a call to a function called `objc_msgSend`.

```objc
// the code we write
[dog bark];

// under the hood, it roughly converts to this
objc_msgSend(dog, @selector(bark));
```

The first slot holds the object receiving the message, and the second slot holds the name tag (selector) of the method to run.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/4-1783847992119.png" alt="Different on the surface, but it all funnels into one place in the end">
  <figcaption>Different on the surface, but it all funnels into one place in the end</figcaption>
</figure>

This approach is flexible because it decides which method to run at runtime.

Thanks to that, Objective-C had strong dynamic capabilities, letting you swap or add methods while the program was running.

Behind the appearance of those brackets was this flexible structure hiding underneath.

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="After a few days of using it, this syntax becomes second nature">
  <figcaption>After a few days of using it, this syntax becomes second nature</figcaption>
</figure>

---

## Let's wrap up with Q&A

**Q. Do I have to memorize the brackets?**

It's less about memorizing and more about getting a feel for the `[receivingObject messageToSend]` structure — once you do, it reads naturally.

**Q. I use Swift now, do I still need to know this?**

A lot of older libraries and sample code are still written in Objective-C, so being able to read it helps a lot.

**Q. What if there are brackets inside brackets?**

That's a structure where the outer one receives the result of the inner one. Reading from the inside out untangles it.

---

Brackets might look like some strange rule at first, but once you shift your thinking to "syntax for talking to an object," they become much friendlier.

The more unfamiliar a piece of syntax is, the more it tends to stick with you once you know its roots.

I hope this post helps you feel a little closer to Objective-C. Rooting for you! 🙌
