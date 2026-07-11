---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "YAGNI, Why a Developer's 'I Might Need It Someday' Gets Expensive"
lang: en
description: "\"We might need this later, so should we just build it in now?\""
header:
  og_image: /assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png
tags:
  - YAGNI
  - Extreme Programming
  - over-engineering
  - software design principles
  - KISS principle
  - Martin Fowler
  - software architecture
  - clean code
  - programming
  - software development
permalink: /en/YAGNI-정리-개발자의-언젠가-쓰겠지가-비싼-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

"We might need this later, so should we just build it in now?"

This temptation shows up constantly when you're developing. You pull config options out preemptively, set up i18n structure just in case, and even create tables in advance so admins can change things later.

I've been there myself — I once built a feature thinking "I'll probably need this someday." Two years later, I was the one who deleted that code. It had never been used, not once.

YAGNI, the topic for today, is the principle that answers this temptation with a flat "no." Along with KISS and DRY, it's one of the big three development principles.

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png" alt="&quot;I'll probably need this someday&quot; is usually wrong">
  <figcaption>&quot;I'll probably need this someday&quot; is usually wrong</figcaption>
</figure>

YAGNI stands for "You Aren't Gonna Need It." It means exactly what it sounds like: "You're probably not going to need that."

The phrase comes from Extreme Programming (XP), a software development methodology. People in the XP camp, like Kent Beck and Ron Jeffries, used it so often as a catchphrase that it eventually solidified into a formal principle.

The core claim is simple:

> Implement a feature when you actually need it — not when you think you might need it.

---

## So what's wrong with building it early?

The obvious pushback is: "Isn't it more convenient to have it ready in advance?" The problem is that this prediction turns out to be wrong most of the time.

In a piece Martin Fowler wrote on this topic, he breaks the cost of pre-built features into four categories.

| Cost | Description |
|------|------|
| Build cost | Time spent building a feature you're not using right now |
| Delay cost | The real feature that should've been built in that time gets pushed back |
| Carrying cost | Even unused code still needs testing, refactoring, and bug fixes |
| Repair cost | By the time you actually need it, the requirements have changed and you have to rework it anyway |

That last one stings the most. When "later" actually arrives, its requirements almost never match what you originally pictured. So you end up paying double — the cost of building it early, plus the cost of tearing it apart to fit the real need.

---

## Where YAGNI breaks down in practice

Everybody nods along when you explain this in theory. In practice, though, it sneaks in through scenes like these.

**1. Pre-adding parameters "just in case"**

```javascript
// Right now we only send email notifications, but...
function sendNotification(user, message, channel = 'email',
  retryCount = 3, priority = 'normal', template = null) {
  // Code that only actually runs when channel is 'email'
}
```

Every single call site just does `sendNotification(user, msg)`. The rest of the parameters were added "for when we add Slack notifications later" — and the Slack notification requirement never actually showed up.

**2. Laying down interfaces ahead of time**

This is when you create an interface even though there's only one implementation. The classic pattern is building `IUserService` alongside a single `UserService` class. Until a second implementation actually shows up, that interface is just decoration adding to your file count.

**3. "Wouldn't it be nice to make this configurable?"**

This happens when fear of hardcoding leads to pulling every single value out into config files and admin screens. In reality, that setting never gets changed even once a year, and the more settings pile up, the more you're left asking, "Wait, what does changing this actually affect?"

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/2.png" alt="Even unused options rack up maintenance costs">
  <figcaption>Even unused options rack up maintenance costs</figcaption>
</figure>

---

## What YAGNI is NOT

To avoid misunderstandings, let me draw some clear lines. YAGNI does not mean the following.

First, it doesn't mean you shouldn't design at all. Effort put into making code easy to change later — good naming, small functions, tests — has value right now, so it's not something YAGNI targets. In fact, the easier your code is to modify, the faster you can build the feature when the need for it actually arrives.

Second, it doesn't mean you should postpone decisions that are hard to reverse. Things like choosing a database or finalizing a public API spec are hard to change once set, so thinking them through in advance is the right call. What YAGNI targets is "features you could easily add later, but are building preemptively anyway."

---

## The criteria I use

When I catch myself thinking "should I just build this in now?", I ask myself two questions.

> Is the evidence that I'll need this feature sitting on the roadmap, or just in my imagination?

> Would adding it later actually cost significantly more than adding it now?

If the evidence is just imagination, and adding it later wouldn't cost much more, I don't build it. And it turns out most cases fall into exactly this bucket.

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/3.png" alt="Building it the day you actually need it is never too late">
  <figcaption>Building it the day you actually need it is never too late</figcaption>
</figure>

---

## Wrapping up

Here are the three things worth taking away from the YAGNI principle.

- Build a feature when you actually need it — not when you think you might need it.
- Features built ahead of time bill you four times over: build, delay, carrying, and repair costs.
- That said, good design habits and hard-to-reverse decisions are not what YAGNI is targeting.

Put YAGNI alongside KISS and DRY, and all three principles collapse into a single sentence: build what you need today, keep it simple, and keep it in one place.

If there's a feature sitting dormant somewhere in your codebase that you built thinking "I'll probably need this someday," you might be the one deleting it with your own hands two years from now — just like I was.
