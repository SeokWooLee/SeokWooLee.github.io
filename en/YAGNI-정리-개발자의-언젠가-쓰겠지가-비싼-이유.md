---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The YAGNI Principle: Why a Developer's 'Might Need It Later' Is Expensive"
lang: en
description: "\"We might need this later, so should we build it in now?\""
header:
  og_image: /assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png
tags:
  - YAGNI principle
  - Extreme Programming
  - over-engineering
  - software development principles
  - KISS principle
  - Martin Fowler
  - software design
  - clean code
  - programming best practices
  - software engineering
permalink: /en/YAGNI-정리-개발자의-언젠가-쓰겠지가-비싼-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · **English** · [日本語](/ja/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [中文](/zh/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

"We might need this later, so should we build it in now?"

This temptation shows up constantly when you're building software. Pulling out config options ahead of time, laying groundwork for multi-language support before anyone's asked for it, adding tables so an admin panel can change things down the road.

YAGNI is the principle that answers this temptation with a flat "no." Along with KISS and DRY, it's one of the big three development principles.

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png" alt="&quot;We'll probably need it eventually&quot; almost never pans out">
  <figcaption>&quot;We'll probably need it eventually&quot; almost never pans out</figcaption>
</figure>

YAGNI stands for "You Aren't Gonna Need It."

It comes out of Extreme Programming (XP), where Kent Beck and Ron Jeffries and others in the XP camp used the phrase so often it hardened into a formal principle.

The core claim is simple.

> Implement a feature when you actually need it — not when you think you might need it.

---

## What's wrong with building it ahead of time?

The obvious pushback is: "Isn't it more convenient to have it ready?" The problem is that this prediction is wrong most of the time.

In his write-up on the subject, Martin Fowler breaks the cost of pre-built features into four categories.

| Cost | Description |
|------|------|
| Build cost | Time spent building something you don't use yet |
| Delay cost | The real feature that time should have gone into gets pushed back |
| Carrying cost | Even unused code drags along tests, refactors, and bug fixes |
| Repair cost | By the time you actually need it, requirements have shifted and it needs rework |

The last one stings the most. When "later" actually arrives, its requirements almost never match what you originally imagined. So you end up paying twice — once to build it early, and again to tear it apart and rebuild it to match reality.

---

## Where YAGNI quietly breaks down in practice

Everyone nods along when you explain this in the abstract. In practice, though, it sneaks in through moves like these.

**1. Pre-emptive parameters**

```swift
// Right now this only sends email notifications
func sendNotification(user: User, message: String, channel: String = "email",
                      retryCount: Int = 3, priority: String = "normal",
                      template: String? = nil) {
    // Code that only actually does anything when channel is "email"
}
```

Every call site is just `sendNotification(user: user, message: msg)`. The rest of the parameters were added "for when we add Slack notifications later" — and that Slack requirement never actually showed up.

**2. Pre-emptive protocols**

Defining a protocol when there's only one implementation. You build `UserService`, and alongside it you add a `UserServiceProtocol` — but until a second implementation actually shows up, that protocol is just decoration adding to your file count.

**3. "Wouldn't it be nice to make this configurable?"**

Out of fear of hardcoding, every value gets pushed into config files and admin screens. Meanwhile that setting never gets changed even once a year, and the more settings pile up, the more often you find yourself asking, "wait, what does changing this actually affect?"

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/2.png" alt="Even the options nobody touches still cost upkeep">
  <figcaption>Even the options nobody touches still cost upkeep</figcaption>
</figure>

---

## What YAGNI is not

To head off a common misreading, let's be clear about what YAGNI doesn't mean.

First, it's not an argument against design. Effort spent making code easy to change later — good names, small functions, tests — pays off right now, so it's not something YAGNI targets. If anything, code that's easy to change is exactly what lets you build a feature quickly once you actually need it.

Second, it's not an argument for deferring decisions that are hard to reverse. Things like your database choice or your public API shape are worth thinking through carefully up front, because they're expensive to change once set. What YAGNI targets is specifically "features you could easily add later, but are building now anyway."

---

## The test I use

When I'm tempted to build something ahead of time, I ask myself two questions.

> Is there actual evidence on the roadmap that this feature is needed — or is it just something I'm imagining?

> Would adding it later cost meaningfully more than building it now?

If the evidence is imaginary and adding it later wouldn't cost much more, I don't build it. That covers the vast majority of cases.

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/4-1783847956996.png" alt="Two questions are usually all it takes to decide">
  <figcaption>Two questions are usually all it takes to decide</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/3.png" alt="Building it the day you actually need it is soon enough">
  <figcaption>Building it the day you actually need it is soon enough</figcaption>
</figure>

---

## Wrapping up

Three things to take away from YAGNI.

- Build a feature when it's actually needed — not when it seems like it might be needed.
- Building ahead of time bills you four times over: build, delay, carrying, and repair costs.
- That said, good design habits and hard-to-reverse decisions aren't what YAGNI is targeting.

Put YAGNI next to KISS and DRY, and all three collapse into a single sentence: build what's needed today, keep it simple, and keep it in one place.

If there's a feature sitting dormant in your codebase that you built because you figured "we'll probably need this eventually," there's a good chance you'll be the one deleting it with your own hands two years from now.
