---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The KISS Principle: What \"Keep Your Code Simple\" Really Means"
lang: en
description: "There are moments in development when it feels like writing complicated code is a sign you're good at your job."
header:
  og_image: /assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/1.png
categories:
  - Software Engineering
tags:
  - KISS principle
  - software design
  - development principles
  - clean code
  - YAGNI
  - refactoring
  - code review
  - programming
  - learning to code
  - coding
permalink: /en/KISS-원칙/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/KISS-%EC%9B%90%EC%B9%99/) · **English** · [日本語](/ja/KISS-%EC%9B%90%EC%B9%99/) · [中文](/zh/KISS-%EC%9B%90%EC%B9%99/)
{: .notice--info}

There are moments in development when it feels like writing complicated code is a sign you're good at your job.

You pile on design patterns, stack up abstraction layers, and lay down interfaces ahead of time just in case you "might need to extend this later."

But when you open that code again a few years down the road, it's your future self who ends up paying the price.

Today, let's talk about the principle standing on the opposite side of that: KISS.

<figure>
  <img src="/assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/1.png" alt="There's a reason KISS tells you to keep things simple">
  <figcaption>There's a reason KISS tells you to keep things simple</figcaption>
</figure>

To get straight to the point, KISS stands for "Keep It Simple, Stupid."

It's a design philosophy holding that systems work best not when they're made complex, but when they're kept simple.

---

## Where does the KISS principle come from?

This phrase wasn't originally a software term.

It's widely credited to Kelly Johnson, an aerospace engineer at Lockheed in the 1960s — the man who designed the famous U-2 and SR-71 Blackbird reconnaissance planes.

What Kelly Johnson reportedly demanded from his team was this:

> Build an aircraft that an average mechanic can repair in the field, in combat conditions, using only basic tools.

No matter how brilliant the design, it's useless if it can't be fixed on the ground.

That mindset carried over into software. No matter how clever your code is, if a teammate can't read it and fix it, it isn't good code.

For what it's worth, "Stupid" isn't calling developers stupid — it's closer to "simple enough that even a fool could understand it."

---

## Moments where KISS breaks down in code

It's easy to say in theory, but what does it actually look like in real code? Here are a few patterns I run into often.

**1. The one-liner that looks impressive**

```swift
// This looks clever
let result = arr.reduce([Int: Item]()) { $0.merging([$1.id: $1]) { _, new in new } }

// This is far easier to read
var result = [Int: Item]()
for item in arr {
    result[item.id] = item
}
```

The code above is short, but anyone seeing it for the first time has to stare at it for a while. The code below, anyone can understand in three seconds.

**2. Extensibility nobody ends up using**

This is when you bring in a factory pattern plus a strategy pattern just to build a single button. It usually comes from worrying "what if we need more button types later?" — but that "later" almost never arrives.

**3. A maze of conditionals**

An if inside an if inside another if. Even three levels of nesting is enough to blow past what your head can hold in its mental stack. Just flattening things out with early returns can make the code dramatically simpler.

<figure>
  <img src="/assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/2.png" alt="Complex code vs. simple code — the difference shows up six months later">
  <figcaption>Complex code vs. simple code — the difference shows up six months later</figcaption>
</figure>

---

## 3 practical standards for keeping KISS

So these are the three standards I use when I write code.

| Standard | Question |
|------|------|
| Explain test | Can I explain this code to the person sitting next to me in under a minute? |
| Future test | Will I still understand this immediately when I look at it again in six months? |
| Necessity test | Did I add this because I need it right now, or because I might use it someday? |

If even one of these comes back "no," I stop and think about whether there's a simpler way to do it.

The third one matters especially — it lines up with the YAGNI (You Aren't Gonna Need It) principle. KISS and YAGNI essentially travel as a pair.

---

## Simple is not the same as sloppy

There's one thing worth clearing up here.

KISS doesn't mean "write code without thinking." It's actually the opposite.

Making something complicated is easy — you just bolt on everything that comes to mind. Making something simple is hard, because you have to fight hard over what to leave out.

There's a famous line from one of Pascal's letters:

> I would have written a shorter letter, but I did not have the time.

The same is true of code. Simple code isn't the result of carelessness — it's the result of the effort it takes to strip complexity away.

<figure>
  <img src="/assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/3.png" alt="Turns out simplicity is the result of paring things down">
  <figcaption>Turns out simplicity is the result of paring things down</figcaption>
</figure>

---

## Wrapping up

To sum up the KISS principle:

- Code is read far more often than it's written. Write it simply, for the sake of whoever reads it.
- Don't build in extensibility you don't need right now. That worry turning into reality happens less often than you'd think.
- Simplicity isn't a sign of lacking skill — it's evidence of skill.

These days, I think the comment I leave most often in code review is "could this be simpler?" It's funny how just asking that one question tends to cut down both bugs and review time.

Could the person sitting next to you understand your code in under a minute? Might be worth asking yourself that today.
