---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "What Is an AI Context Window, Really? Why Agents Forget Your Instructions (Tokens, Attention, and the KV Cache)"
lang: en
description: "If you've used a coding agent like Claude Code, you've probably seen a warning at the bottom of the screen like \"Context left until auto-compact: 8%.\" You'd…"
header:
  og_image: /assets/images/posts/04ff8585-2d8d-44f7-87e9-2a975fd9176a/1.png
tags:
  - AI agents
  - context window
  - LLM
  - tokens
  - attention
  - KV cache
  - Claude Code
  - AI
  - developer learning
  - artificial intelligence
permalink: /en/AI-컨텍스트-윈도우의-정체-에이전트는-왜-지시를-까먹을까-토큰어텐션KV-캐시/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/AI-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%9C%88%EB%8F%84%EC%9A%B0%EC%9D%98-%EC%A0%95%EC%B2%B4-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8%EB%8A%94-%EC%99%9C-%EC%A7%80%EC%8B%9C%EB%A5%BC-%EA%B9%8C%EB%A8%B9%EC%9D%84%EA%B9%8C-%ED%86%A0%ED%81%B0%EC%96%B4%ED%85%90%EC%85%98KV-%EC%BA%90%EC%8B%9C/) · **English** · [日本語](/ja/AI-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%9C%88%EB%8F%84%EC%9A%B0%EC%9D%98-%EC%A0%95%EC%B2%B4-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8%EB%8A%94-%EC%99%9C-%EC%A7%80%EC%8B%9C%EB%A5%BC-%EA%B9%8C%EB%A8%B9%EC%9D%84%EA%B9%8C-%ED%86%A0%ED%81%B0%EC%96%B4%ED%85%90%EC%85%98KV-%EC%BA%90%EC%8B%9C/) · [中文](/zh/AI-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%9C%88%EB%8F%84%EC%9A%B0%EC%9D%98-%EC%A0%95%EC%B2%B4-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8%EB%8A%94-%EC%99%9C-%EC%A7%80%EC%8B%9C%EB%A5%BC-%EA%B9%8C%EB%A8%B9%EC%9D%84%EA%B9%8C-%ED%86%A0%ED%81%B0%EC%96%B4%ED%85%90%EC%85%98KV-%EC%BA%90%EC%8B%9C/)
{: .notice--info}

If you've used a coding agent like Claude Code, you've probably seen a warning at the bottom of the screen like "Context left until auto-compact: 8%." You'd never see that in a regular chat-based AI. And yet surprisingly few people can explain why that number shrinks, or what happens once it hits zero. If you told an agent at the start of a session "don't touch the tests," and an hour later it's casually editing test files anyway, odds are that number is exactly why.

This post is part one of a series digging into AI agent context, from first principles to practical use. Practical questions like when to use /compact versus /clear, or why we split work across subagents, all rest on one underlying constraint: the context window is finite. So this first installment starts at the very bottom. We'll unpack exactly what a context window is and why it can't just be made arbitrarily large, using three keys: tokens, attention, and the KV cache.

<figure>
  <img src="/assets/images/posts/04ff8585-2d8d-44f7-87e9-2a975fd9176a/1.png" alt="That remaining-context warning on the agent screen — let's find out what it actually means">
  <figcaption>That remaining-context warning on the agent screen — let's find out what it actually means</figcaption>
</figure>

## Tokens: How AI Counts Text

The unit of a context window isn't characters or words — it's tokens. An LLM can't read text as a whole; it consumes a sequence of pieces chopped up by a tokenizer. The chopping follows a BPE (Byte Pair Encoding)-family algorithm, and the underlying idea is simple: character combinations that appear together frequently in the training data get merged into a single unit. Common combinations like "the" or "ing" in English become a single token, while rare words get split into several pieces.

Here's a fact that matters a lot for non-English speakers: since tokenizer training data skews overwhelmingly English, the same content typically costs roughly 1.5 to 2 times more tokens in languages like Korean than it does in English. That's why a spec sheet advertising "200K token context window" — which sounds like two full novels' worth of English text — feels a lot smaller in practice once you're feeding it non-English documents.

Given that token accounting, the context window is simply "the maximum amount a model can read at once." The system prompt, the conversation history, any attached documents, and even the response the model is currently generating all have to fit within that limit.

## Why Agents Burn Through Context So Much Faster

There's a more fundamental fact about LLMs worth knowing first: the model is stateless. Once it processes a request, it doesn't store anything anywhere. As far as the model is concerned, not just yesterday's conversation but even the previous turn never happened.

So how does a conversation stay coherent? The answer is almost anticlimactically simple: the app resends the entire history — from the system prompt all the way to the present — every single turn. When the model writes its tenth reply, it isn't "remembering" the nine turns before it; it just read the whole thing again from scratch, moments ago.

In a chat-based AI, that history is just typed messages and model replies, so it accumulates slowly. Agents are a different story. Every turn an agent takes comes bundled with tool calls. Read one file, and its entire contents land in the context. Run a test suite, and hundreds of lines of failure logs pile in. Run a search, and every result gets appended too. A user might type a single line — "fix the bug" — and if the agent responds by reading ten files and running three builds, that one turn alone can burn tens of thousands of tokens. That's exactly why coding agent UIs show a remaining-context indicator: consumption that would take days in a chat interface can happen in an hour or two inside an agent.

<figure>
  <img src="/assets/images/posts/04ff8585-2d8d-44f7-87e9-2a975fd9176a/2.png" alt="A single turn's worth of tool calls can pile up tens of thousands of tokens, and the whole thing gets resent every turn">
  <figcaption>A single turn's worth of tool calls can pile up tens of thousands of tokens, and the whole thing gets resent every turn</figcaption>
</figure>

Once the limit is reached, the app has to discard something. It trims the oldest turns or compresses them into a summary — and if an instruction from early in the session, like "don't touch the tests," gets pushed out in that process, the model starts its next turn having never made that promise at all. It's not that its memory got worse; there was never any memory to begin with, it's just that the instruction fell outside the range it's currently reading.

## Reason One It's Finite: Attention's Quadratic Cost

So why not just make the window 100 million tokens? Attention — the core operation inside a transformer — is what stands in the way.

Attention is the mechanism that, when processing a new token, computes how relevant that token is to every single token that came before it. That's exactly what lets a model connect a variable named `user` in your code to its declaration 3,000 lines earlier. It's the secret behind an LLM's apparent grasp of context — and simultaneously the root of its cost.

Because every token looks at every other token, the computation scales with the square of the length. Make the context 10 times longer, and attention computation jumps 100-fold. Optimizations like sparse attention, sliding windows, and FlashAttention have stacked up enough to get us models with million-token contexts, but the core truth remains: the ability to reference the full context comes attached to a cost that grows steeply with length.

## Reason Two It's Finite: The KV Cache's Memory Bill

Compute isn't the only problem. Memory brings its own separate bill, in the form of something called the KV cache (Key-Value cache).

When a model generates a response one token at a time, recomputing the entire context from scratch at every step would be wildly wasteful. So instead, it stashes the intermediate attention results (Key and Value vectors) it computed for each token in GPU memory and reuses them — that's the KV cache. The catch is that this cache accumulates separately for every layer and every attention head, and it grows in direct proportion to context length.

To put a number on it: even after applying a memory-saving technique like GQA, a roughly 70-billion-parameter open-source model still uses about 300KB of KV cache per token. Fill a 128,000-token context, and the cache alone runs to roughly 40GB — on top of the model weights, that's enough to occupy an entire high-end GPU's memory by itself. That's why expanding a context window isn't a matter of flipping a software setting; it's a matter of hardware and money.

That cost flows straight through to what you pay. LLM APIs bill in proportion to input token count, and combined with the fact that the entire history gets resent every turn, that fully explains why long sessions get both slower and more expensive as they drag on.

<figure>
  <img src="/assets/images/posts/04ff8585-2d8d-44f7-87e9-2a975fd9176a/3.png" alt="A stateless model's &quot;memory&quot; is really just re-reading everything from scratch each turn — the longer it gets, the slower and pricier it gets">
  <figcaption>A stateless model's &quot;memory&quot; is really just re-reading everything from scratch each turn — the longer it gets, the slower and pricier it gets</figcaption>
</figure>

## Summary

- A context window is the maximum number of tokens a model can read at once. Korean (and similar languages) use 1.5 to 2 times more tokens than English for the same content, so don't take the spec number at face value.
- LLMs are stateless. What looks like conversational memory is actually the entire history being re-read every single turn, and since agents pile on tool-call results too, their context fills up far faster than a chat's does.
- The window is finite because attention computation scales with the square of the length, and the KV cache occupies GPU memory in direct proportion to length. Context is both a capability and a cost.

In the next installment, we'll take apart a common assumption — that bigger context is always better. In reality, multiple studies have shown that model performance actually degrades as context grows longer. We'll cover "lost in the middle," context rot, and why the number on the spec sheet and the effective usable capacity are two very different things.
