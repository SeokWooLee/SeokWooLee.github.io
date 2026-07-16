---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "/clear vs /compact, Fully Explained: When to Wipe Your AI Agent's Context and When to Compress It"
lang: en
description: "The previous two posts covered the diagnosis. The context window is finite (Part 1), filling it up doesn't mean it's all being used, and performance…"
header:
  og_image: /assets/images/posts/dbbbbbf4-c659-46d5-8a59-05ef8e331a0d/1.png
tags:
  - ClaudeCode
  - AIAgents
  - ContextWindow
  - compact
  - clear
  - LLM
  - AIAutomation
  - DeveloperProductivity
  - PromptEngineering
  - AI
permalink: /en/clear-vs-compact-완전-정리-AI-에이전트-컨텍스트는-언제-비우고-언제-압축하나/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/clear-vs-compact-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8%EB%8A%94-%EC%96%B8%EC%A0%9C-%EB%B9%84%EC%9A%B0%EA%B3%A0-%EC%96%B8%EC%A0%9C-%EC%95%95%EC%B6%95%ED%95%98%EB%82%98/) · **English** · [日本語](/ja/clear-vs-compact-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8%EB%8A%94-%EC%96%B8%EC%A0%9C-%EB%B9%84%EC%9A%B0%EA%B3%A0-%EC%96%B8%EC%A0%9C-%EC%95%95%EC%B6%95%ED%95%98%EB%82%98/) · [中文](/zh/clear-vs-compact-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8%EB%8A%94-%EC%96%B8%EC%A0%9C-%EB%B9%84%EC%9A%B0%EA%B3%A0-%EC%96%B8%EC%A0%9C-%EC%95%95%EC%B6%95%ED%95%98%EB%82%98/)
{: .notice--info}

The previous two posts covered the diagnosis. The context window is finite (Part 1), filling it up doesn't mean it's all being used, and performance actually degrades the longer it gets (Part 2). So the prescription converges on one thing: you have to manage context. And the most basic tools that coding agents like Claude Code hand you for this are /clear and /compact.

Both commands share the goal of "reducing context." That's exactly why people either reach for whichever one is handy, or avoid both until a low-context warning pops up. But the two work in completely different ways under the hood, and using the wrong one for the situation either wipes out your entire working context or leaves you dragging around a messy one indefinitely. This post looks at exactly what each command does internally, then sets out criteria for when to use which.

<figure>
  <img src="/assets/images/posts/dbbbbbf4-c659-46d5-8a59-05ef8e331a0d/1.png" alt="One erases, one packs down tight — same tidying, different mechanics underneath">
  <figcaption>One erases, one packs down tight — same tidying, different mechanics underneath</figcaption>
</figure>

## /clear: erase the history, start from a blank slate

What /clear does is simple: it discards the entire conversation history up to that point. The model on the next turn starts with only the always-loaded material — the system prompt, files like CLAUDE.md — plus whatever new message you just typed. Recall the structure from Part 1: since resending the entire history every turn is what a "conversation" actually consists of, erasing the history means resetting the package that gets sent to the model.

What you lose is all conversational context; what you gain is a clean context. The "lost in the middle" effect from Part 2, along with the confusion caused by stale file versions and failed-attempt logs, all disappear along with the history. Your remaining token budget recovers to its maximum, and since less input gets resent every turn, responses get faster and cost goes down too.

That's why /clear belongs at task boundaries. Once you've fixed a bug and committed the fix, the next feature task has no need to know about the previous bug's stack trace or trial-and-error. If anything, mixing them in only causes harm. Simply cutting the thread with /clear at the end of every task prevents a good chunk of the quality degradation that shows up late in a session.

## /compact: swap the history for a summary

/compact takes a different approach. Instead of discarding the history, it has the model summarize the conversation so far and replaces the original history with that summary. A history running tens of thousands of tokens shrinks down to a summary of a few thousand, so your remaining budget recovers while the overall thread of the work survives.

The key point is that this is lossy compression. Summarizing is a process where the model picks out what it thinks "seems important," and you have no control over what survives. Concrete details — file paths, approaches you tried and abandoned, the exact wording of an error message — tend to get flattened out in the summarization process. The reason an agent right after a compact often re-reads a file it was just working on is that the summary alone doesn't tell it the precise current state.

Fortunately, you're not entirely without a lever. Claude Code's /compact lets you attach an instruction after it. Something like "/compact keep mainly the schema changes we finalized in this migration and the list of remaining files" lets you steer what the summary focuses on. You know best what matters, so even when you hand off the compression itself, you can still set the direction.

<figure>
  <img src="/assets/images/posts/dbbbbbf4-c659-46d5-8a59-05ef8e331a0d/2.png" alt="Between clear and compact there's a third path: write the state to a file and start fresh">
  <figcaption>Between clear and compact there's a third path: write the state to a file and start fresh</figcaption>
</figure>

## The deciding factor: is there context worth carrying forward?

The criterion boils down to a single question: does the agent on the next turn need to know the context accumulated so far?

- The task is done and the next task is unrelated → /clear. No need to overthink it — this is the default.
- The same task continues, but you're running low on budget → /compact. Just specify what to keep via the instruction.
- Same task, but the agent has started spinning its wheels → surprisingly, /clear is often the better call here. Context that's been contaminated by trial and error just gets its contamination concentrated when summarized. It's cleaner to have the agent write out the current state and next steps to a file, then /clear and restart from that file.

That third case is a hint. There's a third path between clear and compact: writing down whatever's worth saving from the context into a file. Have it say "summarize the decisions made so far and the remaining work into PLAN.md," then /clear, and when the new session reads PLAN.md, exactly the context you need carries over without the uncertainty of summarization. Unlike /compact, where you hand the summarizing off to the model, what you keep exists as a visible file, so you can verify and edit it too. This "externalization" pattern gets covered in more depth in Part 6, when we get to memory.

## Why you shouldn't just wait for auto-compact

Claude Code automatically runs a compact once your remaining budget hits a threshold. As a safety net it's excellent, but relying on it is a different matter.

When auto-compact fires is determined by your remaining token count — which means it's disconnected from the flow of your actual work. It can kick in at the worst possible moment: say, midway through a refactor, with five files mid-edit and tests broken. The summary produced at that point flattens an awkward, half-finished state, and the agent that follows carries forward a subtly skewed understanding as it continues the work. In effect, the context poisoning we saw in Part 2 happens through the summarization itself as the channel.

That's why more experienced users treat the remaining-budget indicator like a gauge to manage. They write the state out to a file at every logical checkpoint (a commit, tests passing, a decision finalized), tie things off once the remaining budget drops to 20-30%, and decide the timing of /clear or /compact themselves. Compression may be unavoidable, but you can still control when and how it happens.

<figure>
  <img src="/assets/images/posts/dbbbbbf4-c659-46d5-8a59-05ef8e331a0d/3.png" alt="Time your compression by work checkpoints, not by remaining budget">
  <figcaption>Time your compression by work checkpoints, not by remaining budget</figcaption>
</figure>

## Summary

- /clear deletes the history; /compact replaces it with a summary. The former discards context and fully restores your remaining budget; the latter keeps the thread of the context but loses detail.
- The default is /clear at every task boundary. Reach for /compact only when there's context worth carrying forward, and specify what to keep via the instruction.
- If the agent starts spinning its wheels, it's cleaner to have it write the state to a file instead of summarizing, then restart with /clear.
- Auto-compact is just a safety net — it's better to decide the timing of compression yourself, tied to your work checkpoints rather than to remaining budget.

That covers managing conversation history. But there's context that doesn't disappear even with /clear — it rides along on every single turn. That's the always-loaded region: the system prompt, CLAUDE.md, tool definitions, and the like. The next post covers how to design this fixed cost — the core question being what to put into CLAUDE.md, and what to leave out.
