---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Designing AI Agent Memory: The Art of Keeping Things Out of Context (Plan Files, Memory, RAG)"
lang: en
description: "If you've followed the series this far, you've probably spotted the common pattern: minimize what stays inside the context window. Part 3's \"write state to…"
header:
  og_image: /assets/images/posts/9c901582-b6d3-47a4-a582-ff7c6393053d/1.png
tags:
  - AI agent
  - agent memory
  - RAG
  - embeddings
  - context window
  - Claude Code
  - LLM
  - AI automation
  - knowledge management
  - AI
permalink: /en/AI-에이전트-메모리-설계-컨텍스트-밖에-두는-기술-계획-파일메모리RAG/
toc: true
toc_sticky: true
last_modified_at: 2026-07-18
---

🌐 [한국어](/AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%84%A4%EA%B3%84-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EB%B0%96%EC%97%90-%EB%91%90%EB%8A%94-%EA%B8%B0%EC%88%A0-%EA%B3%84%ED%9A%8D-%ED%8C%8C%EC%9D%BC%EB%A9%94%EB%AA%A8%EB%A6%ACRAG/) · **English** · [日本語](/ja/AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%84%A4%EA%B3%84-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EB%B0%96%EC%97%90-%EB%91%90%EB%8A%94-%EA%B8%B0%EC%88%A0-%EA%B3%84%ED%9A%8D-%ED%8C%8C%EC%9D%BC%EB%A9%94%EB%AA%A8%EB%A6%ACRAG/)
{: .notice--info}

If you've followed the series this far, you've probably spotted the common pattern: minimize what stays inside the context window. Part 3's "write state to a file before /clear," Part 4's "pointers only, not the body," and Part 5's "process goes to the subagent, only the conclusion comes back to the main thread" all point the same direction. What we haven't properly covered yet, though, is where all that information actually lands once it's pushed out of context.

That destination is this episode's topic. Where and how do you store knowledge that needs to outlive the session? Think of it this way: the context window is a workbench, and the file system is a warehouse. The workbench is small, expensive, and gets cleared the moment the session ends. The warehouse is large, cheap, and persists. Good agent operation ultimately comes down to designing the logistics between the workbench and the warehouse.

<figure>
  <img src="/assets/images/posts/9c901582-b6d3-47a4-a582-ff7c6393053d/1.png" alt="The workbench is small and expensive, the warehouse is large and cheap. Good operation is really just logistics design between the two.">
  <figcaption>The workbench is small and expensive, the warehouse is large and cheap. Good operation is really just logistics design between the two.</figcaption>
</figure>

## Plan Files: The Lifeline of Long-Running Tasks

The most basic form of externalization is the plan file. At the start of a task, have the agent write out its goal, the decisions already locked in, and the remaining steps into a file like PLAN.md, then keep updating it as work progresses.

This single file solves several problems at once. First, it survives session resets. Whether context fills up and you run /clear, or you close the laptop and open a fresh session the next day, having the agent read the plan file lets work continue seamlessly. Unlike the uncertain summarization of auto-compact we saw in Part 3, this is an accurate record whose contents you control directly.

There's a side benefit too. If the agent keeps updating and re-reading the plan file at every step, the overall goal keeps reappearing near the recent end of the context. As we saw in Part 2, a model's attention skews heavily toward the tail end of the context — and this exploits that property in reverse, keeping "what am I doing right now" continuously in view. This is exactly the remedy for the problem where an agent given a task with dozens of steps forgets the original goal partway through and wanders off track. In practice, agent products designed for long-running tasks commonly keep a to-do list as a file and rewrite it constantly.

## Memory: Knowledge That Accumulates Across Sessions

While a plan file extends the lifespan of a single task, memory accumulates knowledge across an entire project. Claude Code and other agents support a memory-directory feature, and the underlying idea is modest: write down each learned fact in its own file, keep only a summary index loaded at all times, and read the full body only when a relevant task needs it. Part 4's pointer principle applies here too.

What matters here is the bar for what gets saved. Write down anything and everything, and memory quickly turns into a junk drawer. The bar that clears is "information that can't be derived from anywhere else." Code structure fails that bar — you can just read the code. Past commit history fails too — git already remembers that. But operational rules like "this project's dev server must always be started from the main worktree," preferences like "the user wants a formal-tone writing style," and environment-specific traps discovered only after a lot of trial and error — none of that is recorded anywhere else, which is exactly why it's worth writing to memory.

You also need to plan for stale memory. A fact written six months ago isn't guaranteed to still be true. The rules for reading and writing memory should include "if a referenced memory conflicts with reality, update or delete it" — otherwise a wrong memory can loop back as the context poisoning we discussed in Part 2.

<figure>
  <img src="/assets/images/posts/9c901582-b6d3-47a4-a582-ff7c6393053d/2.png" alt="Push it down, and only bring it back up when you need it. The shared principle behind plan files, memory, and RAG.">
  <figcaption>Push it down, and only bring it back up when you need it. The shared principle behind plan files, memory, and RAG.</figcaption>
</figure>

## RAG: When the Warehouse Is the Size of a Library

Plan files and memory operate at the scale of dozens of files. But what if the warehouse is the size of a library — thousands of pages of internal wiki, tens of thousands of papers, hundreds of thousands of customer support tickets? You know the information you need is in there somewhere, but you can't possibly load all of it into context.

The technique for this situation is RAG (Retrieval-Augmented Generation). When a query comes in, you first search the warehouse for relevant fragments, then load only the fragments you found into context to generate an answer. Search here typically relies on a technique called embedding: by converting text into coordinates in a semantic space, a query like "refund policy" and a document titled "payment cancellation policy" end up close together in that space even though they share no keywords — which is exactly what lets the search find them despite the different wording.

For a while, RAG was treated as the only real answer for handling long documents, but there's been an interesting twist on the coding-agent side. It turns out that an agent with access to tools can find the code it needs quite well just by repeatedly running grep and browsing files, without any embedding search at all. So the practical consensus these days is hybrid: for code with precise identifiers, an agent's direct exploration wins out; for piles of natural-language documents with inconsistent wording, embedding search wins out. Either way, the underlying principle stays the same — don't load everything, load only what's relevant at query time.

<figure>
  <img src="/assets/images/posts/9c901582-b6d3-47a4-a582-ff7c6393053d/3.png" alt="Records that survive past the session are the lifeline of any long-running task.">
  <figcaption>Records that survive past the session are the lifeline of any long-running task.</figcaption>
</figure>

## Summary

- Context is the workbench, files are the warehouse. The basic skill is routing knowledge that needs to survive past the session into files, not into context.
- A plan file keeps long tasks alive across session resets, and by repeatedly surfacing the goal near the recent end of context, it prevents the agent from drifting off track.
- Memory should hold only information that can't be derived elsewhere, keep just the index loaded at all times, and manage stale entries through update/delete rules.
- When the warehouse is truly huge, use RAG to load only the relevant fragments at query time. Code favors direct exploration; piles of natural-language text favor embedding search.

One episode remains in this series. Up to now, we've managed context for the sake of quality — the final piece is about money. It covers how prompt caching works, where the same context can cost several times more or less in API fees depending on how it's built up, and why you shouldn't casually touch the front portion of your context.
