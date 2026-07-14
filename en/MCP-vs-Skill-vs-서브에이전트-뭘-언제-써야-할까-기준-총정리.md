---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "MCP vs. Skill vs. Subagent: When to Use Which (A Complete Guide)"
lang: en
description: "There are more ways than ever to extend an AI coding tool these days. You attach tools with MCP, register procedures with Skills, and delegate tasks to…"
header:
  og_image: /assets/images/posts/1bb00db5-c156-4575-854c-7218ac263b2c/1.png
tags:
  - MCP
  - Skill
  - Subagent
  - ClaudeCode
  - AIAgent
  - AIAutomation
  - LLM
  - DeveloperAI
permalink: /en/MCP-vs-Skill-vs-서브에이전트-뭘-언제-써야-할까-기준-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/MCP-vs-Skill-vs-%EC%84%9C%EB%B8%8C%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%AD%98-%EC%96%B8%EC%A0%9C-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-%EA%B8%B0%EC%A4%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **English** · [日本語](/ja/MCP-vs-Skill-vs-%EC%84%9C%EB%B8%8C%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%AD%98-%EC%96%B8%EC%A0%9C-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-%EA%B8%B0%EC%A4%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [中文](/zh/MCP-vs-Skill-vs-%EC%84%9C%EB%B8%8C%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%AD%98-%EC%96%B8%EC%A0%9C-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-%EA%B8%B0%EC%A4%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

There are more ways than ever to extend an AI coding tool these days. You attach tools with MCP, register procedures with Skills, and delegate tasks to subagents.

The problem is that all three come labeled as "extending the model's capabilities," which makes it genuinely confusing to figure out which one you actually need.

Here's the one-line rule to start with: MCP is a hand, a Skill is a manual, and a subagent is a coworker.

This post breaks down what each of the three actually extends, what criteria to use when choosing between them, and what the picture looks like when you combine them.

<figure>
  <img src="/assets/images/posts/1bb00db5-c156-4575-854c-7218ac263b2c/1.png" alt="Hand, manual, coworker — three different layers of extension">
  <figcaption>Hand, manual, coworker — three different layers of extension</figcaption>
</figure>

Let's start with the key takeaways.

1. MCP extends what the model can *do* (access to tools and data)
2. Skills extend what the model *knows* (task procedures and domain knowledge)
3. Subagents extend *who* does the work (an execution unit with its own separate context)
4. These three aren't competing options — they're meant to be combined. It's natural for a subagent to read a Skill while using MCP tools

---

## What Each of the Three Actually Extends

Let's compare them in a table first, then go through each one.

| Category | MCP | Skill | Subagent |
| --- | --- | --- | --- |
| What it extends | Capability (tools/data) | Knowledge (procedures/know-how) | Execution unit |
| What it actually is | Protocol/server process | A folder of markdown | Separate context session |
| Analogy | Hand | Manual | Coworker |

MCP is a channel that reaches out from the model to systems in the outside world. It makes things possible that the model simply can't do on its own — querying a database, calling an internal company API, controlling a browser. The defining trait is that there's a separate server process where the actual code runs.

A Skill doesn't grant new capabilities — it makes things the model can already do easier to do well. It's knowledge about "how" — release note formatting, review checklists, internal documentation conventions — packaged into a file. In practice, it's just markdown.

A subagent is another model instance with its own independent context window. You can hand off tasks like exploration or research without polluting your main conversation history. Even if you have it dig through a huge pile of files, only the conclusions come back into your main context.

---

## Three Questions to Figure Out What You Need

When you're not sure which to pick, ask these three questions in order.

First: is this something the model physically cannot do right now? If access itself is impossible — like querying an internal database — the answer is MCP. No amount of knowledge will conjure a hand that doesn't exist.

Second: can the model already do it, but you find yourself explaining the method every single time? That's a Skill. Any prompt you find yourself repeating is a Skill candidate.

Third: is the task large enough that it's polluting your context? If research or exploration results are turning your conversation into clutter, it's time to isolate that work in a subagent.

> Flip it around and the rule becomes: no access → MCP, no know-how → Skill, no (or insufficient) context → subagent.

<figure>
  <img src="/assets/images/posts/1bb00db5-c156-4575-854c-7218ac263b2c/2.png" alt="Just ask these three questions in order and the choice makes itself">
  <figcaption>Just ask these three questions in order and the choice makes itself</figcaption>
</figure>

---

## In Practice, You Combine All Three

These three aren't an either-or choice. In fact, most well-built automations end up looking like this.

Take automated code review as an example: you define a reviewer subagent (the execution unit), have it follow your team's review checklist Skill (the method), and have it leave PR comments through a GitHub MCP server (the capability).

Notice these roles aren't overlapping — they're operating at different layers. Each one answers a different question: who / how / with what.

<figure>
  <img src="/assets/images/posts/1bb00db5-c156-4575-854c-7218ac263b2c/3.png" alt="Designing a combined system starts with splitting the three layers out on a whiteboard">
  <figcaption>Designing a combined system starts with splitting the three layers out on a whiteboard</figcaption>
</figure>

---

## Two Common Mistakes

Once you can see the boundaries clearly, the anti-patterns become obvious too.

One is building an MCP server for something a Skill would have handled just fine. "Apply our commit message convention," for instance, is a knowledge problem — a few lines of markdown solves it. Writing a server for that is way more trouble than it's worth, since a server comes with ongoing maintenance costs and security review overhead.

The other is handling everything in a single main session. If you do large-scale codebase exploration directly in your main session, the file dumps eat up your context, leaving no room left for the actual implementation work. The right approach is to delegate exploration to a subagent and have your main session only receive the conclusions.

---

## Wrapping Up

To sum it up: no capability → MCP, no know-how → Skill, no hands on deck → subagent.

We've covered MCP and Skills in more depth in separate posts, so I'd recommend using the framework from this post to first figure out which layer the automation you're building actually belongs to.
