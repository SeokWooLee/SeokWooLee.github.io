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
description: "There's this weird feeling you get sometimes when you're coding — like writing complicated code is what makes you good at your job."
header:
  og_image: /assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/1.png
categories:
  - Software Engineering
tags:
  - KISS principle
  - software design
  - engineering principles
  - clean code
  - YAGNI
  - refactoring
  - code review
  - programming
  - software development
  - coding best practices
permalink: /en/KISS-원칙/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/KISS-%EC%9B%90%EC%B9%99/) · **English** · [日本語](/ja/KISS-%EC%9B%90%EC%B9%99/) · [中文](/zh/KISS-%EC%9B%90%EC%B9%99/)
{: .notice--info}

There's this weird feeling you get sometimes when you're coding — like writing complicated code is what makes you good at your job.

You throw in a bunch of design patterns, stack up abstraction layers, and pre-build interfaces "just in case we need to extend this later."

I did the same thing as a junior dev. But when I open that code back up years later, it's future-me who ends up suffering for it.

Today I want to talk about the principle that stands on the opposite side of all that: KISS.

<figure>
  <img src="/assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/1.png" alt="KISS — there's a reason people say keep it simple">
  <figcaption>KISS — there's a reason people say keep it simple</figcaption>
</figure>

Let's start with the conclusion: KISS stands for "Keep It Simple, Stupid."

It's a design philosophy that says systems work best not when you make them complex, but when you keep them simple.

---

## Where did the KISS principle come from?

This phrase didn't actually start out as a software term.

It's widely credited to Kelly Johnson, an aerospace engineer at Lockheed in the 1960s — the man who designed the famous U-2 and SR-71 Blackbird reconnaissance planes.

Here's what Kelly Johnson reportedly demanded of his team:

> Build a plane that an average mechanic can repair in combat conditions using only basic tools.

His point was that no matter how brilliant a design is, it's worthless if it can't be fixed out in the field.

That mindset eventually made its way into software. No matter how clever your code is, if your coworkers can't read it and fix it, it's not good code.

One side note: "Stupid" here isn't calling developers stupid — it's closer to "simple enough that even a fool could understand it."

---

## Moments when KISS breaks down in real code

It's easy to say, but what does it actually look like in real code? Let me walk through a few patterns I've seen a lot — and, honestly, committed myself.

**1. The one-liner that looks impressive**

```javascript
// This looks clever
const result = arr.reduce((a, c) => ({ ...a, [c.id]: c }), {});

// But this is way easier to read
const result = {};
for (const item of arr) {
  result[item.id] = item;
}
```

The code above is short, but anyone seeing it for the first time has to stare at it for a while. The code below, anyone can understand in three seconds flat.

**2. Extensibility nobody will ever use**

This is when you bring out the factory pattern and the strategy pattern just to build a single button. It comes from worrying "what if we need more button types later?" — but that "later" almost never arrives.

**3. The maze of conditionals**

An if inside an if inside another if. Your mental stack overflows after just three levels of nesting. Flattening this out with early returns alone can dramatically simplify the code.

<figure>
  <img src="/assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/2.png" alt="Complex code vs. simple code: the difference shows up six months later">
  <figcaption>Complex code vs. simple code: the difference shows up six months later</figcaption>
</figure>

---

## 3 practical criteria for keeping it KISS

So these are the three things I use as a checklist when I'm writing code.

| Criterion | Question |
|------|------|
| The explain test | Can I explain this code to the coworker next to me in under a minute? |
| The future test | Will I understand this immediately even six months from now? |
| The necessity test | Did I add this because I need it right now, or because I think I might need it someday? |

If even one of these comes back "no," I stop and think about whether there's a simpler way to do it.

The third one especially matters — it overlaps with the YAGNI principle (You Aren't Gonna Need It). KISS and YAGNI basically travel as a package deal.

---

## Simple isn't the same as sloppy

There's one misunderstanding I want to head off here.

KISS doesn't mean "write code without thinking." If anything, it's the opposite.

Making something complicated is easy — just bolt on whatever comes to mind. Making something simple is hard, because you have to fight hard over what to leave out.

There's a famous line from one of Pascal's letters:

> I have made this longer than usual because I have not had time to make it shorter.

The same is true of code. Simple code isn't the result of sloppy work — it's the result of effort spent stripping away complexity.

<figure>
  <img src="/assets/images/posts/fbd02f5b-4a32-4bc4-ba4e-2ebd4312a907/3.png" alt="Turns out simplicity is the result of cutting things away, not adding them">
  <figcaption>Turns out simplicity is the result of cutting things away, not adding them</figcaption>
</figure>

---

## Wrapping up

To sum up the KISS principle:

- Code spends far more time being read than being written. Write it simply, for the reader's sake.
- Don't build in extensibility you don't need right now. The scenario you're worried about turns out to be rare more often than you'd think.
- Simplicity isn't a sign of weak skill — it's evidence of skill.

These days, I think the comment I leave most often in code review is "could this be simpler?" Funny enough, that one question alone tends to cut down both bugs and review time.

Could the coworker sitting next to you understand your code in under a minute? Might be worth asking yourself that today.
