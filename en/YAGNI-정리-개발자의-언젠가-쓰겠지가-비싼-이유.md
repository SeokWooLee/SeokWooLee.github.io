---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The YAGNI Principle: Why a Developer's 'I Might Need It Someday' Gets Expensive"
lang: en
description: "\"We might need this later, so should we build it in now?\""
header:
  og_image: /assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png
tags:
  - YAGNI
  - Extreme Programming
  - Over-engineering
  - Software Development Principles
  - KISS Principle
  - Martin Fowler
  - Software Design
  - Clean Code
  - Programming
  - Learning to Code
permalink: /en/YAGNI-정리-개발자의-언젠가-쓰겠지가-비싼-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

"We might need this later, so should we build it in now?"

This temptation shows up constantly when you're developing. You pull config options out preemptively, set up i18n structure just in case, and add tables to let admins change settings down the road.

I've been there too — I once built a feature I figured I'd "need someday." Two years later, I was the one who deleted that code. It had never been used, not once.

YAGNI, the topic for today, is the principle that says a flat "no" to exactly this temptation. Along with KISS and DRY, it's one of the big three development principles.

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png" alt="'I might need it someday' misses the mark more often than not">
  <figcaption>'I might need it someday' misses the mark more often than not</figcaption>
</figure>

YAGNI stands for "You Aren't Gonna Need It." It means "You probably won't need that, so don't bother."

The phrase comes out of Extreme Programming (XP), a software development methodology. People in the XP camp, like Kent Beck and Ron Jeffries, used it so often as a catchphrase that it hardened into a formal principle.

The core claim is simple:

> Implement a feature when you actually need it — not when you predict you might.

---

## What's wrong with building it early?

The obvious pushback is, "Wouldn't it be more convenient to have it ready in advance?" The problem is that this prediction is wrong most of the time.

In a piece Martin Fowler wrote on this topic, he breaks the cost of building something ahead of time into four categories.

| Cost | Description |
|------|------|
| Build cost | Time spent building something you're not using right now |
| Delay cost | The real feature that should've been built in that time gets pushed back |
| Carrying cost | Even unused code still drags along testing, refactoring, and bug fixes |
| Repair cost | When you actually need it, the requirements have shifted and you have to rework it anyway |

That last one stings the most. By the time "later" actually arrives, the requirements almost never match what you originally pictured. So you end up paying twice — once to build it early, and again to tear it apart and rebuild it.

---

## Where YAGNI quietly breaks down in practice

Everyone nods along when you explain this in the abstract. But in real projects, it sneaks in looking like this.

**1. Pre-emptively adding parameters**

```javascript
// Right now we only send email notifications
function sendNotification(user, message, channel = 'email',
  retryCount = 3, priority = 'normal', template = null) {
  // Code that only actually does anything when channel is 'email'
}
```

Every single call site is just `sendNotification(user, msg)`. The rest of the parameters were added "for when we add Slack notifications later" — and that Slack request never came.

**2. Setting up interfaces ahead of need**

This is when you create an interface even though there's only one implementation. You build `UserService`, and alongside it you build `IUserService` too — a pattern where that interface sits there as pure decoration, inflating your file count, until a second implementation actually shows up.

**3. "It'd be nice to make it configurable"**

This happens when you're so afraid of hardcoding that you push every value out into config files and admin screens. In practice, that setting never gets changed even once a year, and the more settings pile up, the more you're left asking, "Wait, what does changing this actually affect?"

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/2.png" alt="Even unused options still rack up a maintenance bill">
  <figcaption>Even unused options still rack up a maintenance bill</figcaption>
</figure>

---

## What YAGNI is not

To head off a common misreading, let me draw a clear line here. YAGNI does not mean these things.

First, it doesn't mean skipping design altogether. Effort spent making code easy to change later — good naming, small functions, tests — has value right now, so it's not something YAGNI targets. If anything, code that's easy to change is exactly what lets you build the feature quickly once it's "actually needed."

Second, it doesn't mean you should defer decisions that are hard to reverse. Things like choosing a database or finalizing a public API spec are worth thinking through carefully upfront, because once you commit, they're hard to change. What YAGNI targets is "features you could easily add later, but are building now anyway."

---

## The criteria I use

When I catch myself thinking "should I build this in now, just in case," I ask two questions.

> Is there actual evidence this feature is needed — on the roadmap — or is it just in my head?

> Would adding it later cost dramatically more than adding it now?

If the evidence is just my imagination, and adding it later wouldn't cost much more, I don't build it. Turns out most cases fall into exactly that bucket.

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/4-1783847956996.png" alt="Two questions are usually all it takes to decide">
  <figcaption>Two questions are usually all it takes to decide</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/3.png" alt="Building it the day you actually need it isn't too late">
  <figcaption>Building it the day you actually need it isn't too late</figcaption>
</figure>

---

## Wrapping up

There are three takeaways from the YAGNI principle.

- Build a feature when it's actually needed — not when it seems like it might be needed.
- Building something early bills you four times over: build, delay, carrying, and repair costs.
- That said, good design habits and decisions that are hard to reverse are not what YAGNI targets.

Put YAGNI alongside KISS and DRY, and all three principles collapse into a single sentence: build only what you need today, keep it simple, and put it in exactly one place.

If you've got a feature sitting there dormant, built on the assumption you'd "need it someday," you might end up being the one who deletes it with your own hands two years from now — just like I did.
