---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Prompt Caching, Fully Explained: Why Your AI Agent's API Bill Can Drop to a Tenth"
lang: en
description: "The final piece of this series is about money. If you've ever run an agent through an API, you've probably noticed something odd on the bill. Input token…"
header:
  og_image: /assets/images/posts/80775323-baa4-47ad-bc90-fa3cce66546c/1.png
tags:
  - prompt caching
  - LLM
  - API costs
  - KV cache
  - AI agents
  - context window
  - Claude Code
  - Anthropic
  - AI automation
  - developer productivity
permalink: /en/프롬프트-캐시-완전-정리-AI-에이전트-API-비용이-10분의-1이-되는-원리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-18
---

🌐 [한국어](/%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8-%EC%BA%90%EC%8B%9C-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-API-%EB%B9%84%EC%9A%A9%EC%9D%B4-10%EB%B6%84%EC%9D%98-1%EC%9D%B4-%EB%90%98%EB%8A%94-%EC%9B%90%EB%A6%AC/) · **English** · [日本語](/ja/%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8-%EC%BA%90%EC%8B%9C-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-API-%EB%B9%84%EC%9A%A9%EC%9D%B4-10%EB%B6%84%EC%9D%98-1%EC%9D%B4-%EB%90%98%EB%8A%94-%EC%9B%90%EB%A6%AC/) · [中文](/zh/%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8-%EC%BA%90%EC%8B%9C-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-API-%EB%B9%84%EC%9A%A9%EC%9D%B4-10%EB%B6%84%EC%9D%98-1%EC%9D%B4-%EB%90%98%EB%8A%94-%EC%9B%90%EB%A6%AC/)
{: .notice--info}

The final piece of this series is about money. If you've ever run an agent through an API, you've probably noticed something odd on the bill. Input token charges dwarf output charges. Given the structure we covered in Part 1, that's exactly what you'd expect. Every single turn resends everything from the system prompt through the entire conversation history, so in a 50-turn agent session, the same system prompt effectively gets billed 50 times over.

The mechanism that cuts down this repeated cost is prompt caching. Used well, it can drop input costs to a tenth of the original and speed up responses too — but there's a catch. You have to structure your context in a way the cache actually likes. This piece looks at how that works, and at the easy-to-miss mistakes that quietly wipe out your cache hits.

<figure>
  <img src="/assets/images/posts/80775323-baa4-47ad-bc90-fa3cce66546c/1.png" alt="The same prefix never gets recomputed — but the moment you cut into the front of it, that's game over">
  <figcaption>The same prefix never gets recomputed — but the moment you cut into the front of it, that's game over</figcaption>
</figure>

## The Same Prefix Never Gets Recomputed

We already covered half of this mechanism in Part 1. When a model processes input, each token produces intermediate attention results, which pile up in GPU memory as the KV cache. Prompt caching is the feature that keeps this KV cache around even after a request finishes, so that when the next request's input starts with the same content, that entire segment's computation gets reused wholesale instead of redone.

See how well this fits an agent conversation. The input for turn 10 is "system prompt + turns 1–9 + new message." The input for turn 11 is "system prompt + turns 1–10 + new message." The front portion is exactly identical. With caching, the server can pull the already-computed result up through turn 10 and only compute the newly appended tail.

Billing follows the same structure. Under Anthropic's API, input tokens read from cache are billed at just 10% of the standard rate. There's a 25% surcharge on tokens newly written to cache, but in an agent pattern where you write once and read many times, that surcharge gets offset quickly. Over a session running hundreds of turns, whether or not caching is active can mean a multi-fold difference in cost. Processing time also skips the cached portion, so the delay before the first token appears drops noticeably.

## One Condition: The Prefix Can't Change by Even a Single Character

There's no free lunch here. The condition for cache reuse is prefix matching. Caching only applies up to the point where the identical segment from the very start of the input continues unbroken; from the first point where content diverges, everything after gets recomputed from scratch.

Part 1 also explains why this rule exists. In attention, each token's KV values depend on every token before it. If even one earlier token changes, the computed results for every token after it change too, so the cache becomes unusable. That's why touching the earlier part of your context is so much more costly.

So the principle for cache-friendly context boils down to one sentence: put the stable stuff first, the variable stuff last, and treat history as append-only — never edit it.

<figure>
  <img src="/assets/images/posts/80775323-baa4-47ad-bc90-fa3cce66546c/2.png" alt="Append-only builds hits. Touch the prefix, and everything from that point gets recomputed in full">
  <figcaption>Append-only builds hits. Touch the prefix, and everything from that point gets recomputed in full</figcaption>
</figure>

## The Careless Mistakes That Wipe Out Your Cache

The principle is simple, but there are surprisingly many subtle ways to break it.

The first is variable values baked into the system prompt. What happens if you embed the current timestamp down to the second inside the system prompt? The very front of the context changes on every single request, so your cache hit rate drops to zero. If you must include something like that, keep it coarse — at the day level — or place it toward the back of the context instead. Session IDs and random values are the same kind of landmine.

The second is changing tool definitions. Tool schemas usually sit at the very top of the context, so adding or removing a tool mid-session invalidates the cache for everything that follows. Part 4 recommended cleaning up your MCP servers — from a caching standpoint, here's one more reason for that. Clean them up before the session starts, and leave them alone once it's running.

The third is editing history mid-session. Some people try to save context space by modifying earlier turns or deleting old ones, but that breaks the prefix, and the cache is gone from that point forward. It's easy to end up spending more on recomputing the whole session than you saved by trimming a few thousand tokens — a classic case of penny-wise, pound-foolish. If you need to remove something from history, it's better to close things off at a natural breakpoint and clear the whole thing at once.

Lastly, /compact from Part 3 looks different through a caching lens. Compaction replaces the entire history with a new summary, so the cache resets completely. Later turns do build a fresh cache on top of the now-shorter history, so it pays off in the long run — but it's worth internalizing that compact isn't free cleanup; it's an event that comes with a cache-rebuilding cost. That's often exactly why running /clear at natural breakpoints beats frequent compacting, cost-wise as well.

<figure>
  <img src="/assets/images/posts/80775323-baa4-47ad-bc90-fa3cce66546c/3.png" alt="Whether caching is on or off can swing your bill by a multiple">
  <figcaption>Whether caching is on or off can swing your bill by a multiple</figcaption>
</figure>

## Series Wrap-Up: Seven Instincts for Handling Context

Here's the throughline from all seven parts, folded down to one line each.

1. The context window is finite, and that limit comes from the physics of attention computation and the KV cache.
2. Getting information in doesn't mean it gets used well. Length itself degrades quality.
3. /clear should be your default at task boundaries; reach for /compact with explicit instructions only when continuity actually matters.
4. The system prompt, CLAUDE.md, and tool definitions are fixed overhead. Keep them short, and keep only what's always true.
5. When a task has a heavy process but a light conclusion, isolate it inside a subagent's context.
6. Externalize knowledge that needs to outlive a session — plan files, memory, and RAG for anything large.
7. Context has to be built append-only for caching to survive. Stable stuff first, variable stuff last.

If you had to compress all of it into one idea, it'd be this: context isn't a capability of the model — it's a budget the user designs. That instinct will still hold even in an era of million-token windows. The bigger the window gets, the more the skill of choosing what goes into it will be what actually separates good performance from bad.
