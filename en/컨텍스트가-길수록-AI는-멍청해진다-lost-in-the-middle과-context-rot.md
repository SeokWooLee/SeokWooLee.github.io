---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "The Longer the Context, the Dumber the AI Gets: Lost in the Middle and Context Rot"
lang: en
description: "In Part 1, we looked at why the context window is finite. But given today's model specs, you might think: with 1-million-token models already out there, why…"
header:
  og_image: /assets/images/posts/2441c21a-97a2-413d-93be-21c88b2120cb/1.png
tags:
  - AI agents
  - context window
  - LLM
  - lost in the middle
  - context rot
  - Claude Code
  - AI
  - artificial intelligence
  - learning to code
  - prompt engineering
permalink: /en/컨텍스트가-길수록-AI는-멍청해진다-lost-in-the-middle과-context-rot/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8%EA%B0%80-%EA%B8%B8%EC%88%98%EB%A1%9D-AI%EB%8A%94-%EB%A9%8D%EC%B2%AD%ED%95%B4%EC%A7%84%EB%8B%A4-lost-in-the-middle%EA%B3%BC-context-rot/) · **English** · [日本語](/ja/%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8%EA%B0%80-%EA%B8%B8%EC%88%98%EB%A1%9D-AI%EB%8A%94-%EB%A9%8D%EC%B2%AD%ED%95%B4%EC%A7%84%EB%8B%A4-lost-in-the-middle%EA%B3%BC-context-rot/)
{: .notice--info}

In Part 1, we looked at why the context window is finite. But given today's model specs, you might think: with 1-million-token models already out there, why not just dump the entire codebase or document set in at once? What's there to conserve?

That assumption is exactly what this installment sets out to break. Whether something "fits" in the context window and whether the model actually "uses" it well are two completely different questions. Multiple studies have confirmed that model performance degrades as context grows longer, and anyone who's run an agent for an extended session has felt it firsthand — answers get scattered as the session drags on, and there are those moments where the agent tries to fix a bug it already fixed.

<figure>
  <img src="/assets/images/posts/2441c21a-97a2-413d-93be-21c88b2120cb/1.png" alt="Both ends of the context get read well, the middle gets buried — why recall traces a U-shaped curve">
  <figcaption>Both ends of the context get read well, the middle gets buried — why recall traces a U-shaped curve</figcaption>
</figure>

## Lost in the Middle: What's in the Middle Doesn't Get Read

The 2023 Stanford paper "Lost in the Middle" is one of the most frequently cited results in this space. The researchers planted the correct document at various positions within a long context and measured how well models could retrieve it. Accuracy traced a U-shaped curve: information at the very beginning and very end of the context was retrieved well, but recall for information buried in the middle dropped sharply. In severe cases, performance with the answer placed in the middle was actually worse than not providing any document at all.

It's true that the model "reads" all 20 documents. It just doesn't pay attention to them evenly. The same pattern shows up in attention weights that you'd see in a person skimming the introduction and conclusion of a thick report closely while just glancing over the body.

The "needle in a haystack" test scores that show up so often in model launch materials tend to obscure this problem. That test is a simple retrieval task — plant one sentence in a long text and see if the model can find it — and most recent models score close to perfect on it. The catch is that real-world tasks aren't simple retrieval. Once you switch to a task that requires connecting and reasoning across information scattered in multiple places, the same models' scores slide as the context grows longer.

## Context Rot: Length Itself Erodes Performance

In 2025, the vector database company Chroma published a technical report that coined the term "context rot" for this phenomenon. They tested 18 major models, keeping task difficulty constant while only increasing input length, and found performance declined consistently as the input got longer — even well within the model's stated context window limit.

The cause layers up in several ways. First, there's a structural limitation in attention itself. Attention weights work like a fixed budget that sums to a constant, so as the number of tokens grows, the share allocated to any single token gets thinner. The more irrelevant content gets mixed in, the more the truly important signal gets buried. Second, there's a training distribution problem. Most of the text a model trains on consists of short documents, so an input running to hundreds of thousands of tokens is, from the model's perspective, an unfamiliar situation it barely encountered during training. Being able to process that length per the spec doesn't guarantee reasoning quality holds up at that length.

That's why, in practice, you need a sense of "effective context." Even if the spec says 200,000 tokens, it's safer to assume the range where quality holds up for complex reasoning tasks is much shorter than that. The spec number means "you can feed in this much without an error," not "you can feed in this much and the model stays sharp."

<figure>
  <img src="/assets/images/posts/2441c21a-97a2-413d-93be-21c88b2120cb/2.png" alt="The spec is just an upper bound; the attention budget gets sliced thinner as tokens pile up">
  <figcaption>The spec is just an upper bound; the attention budget gets sliced thinner as tokens pile up</figcaption>
</figure>

## An Agent's Context Isn't Just Long — It's Messy

For agents, the problem gets a notch worse. As we saw in Part 1, an agent's context accumulates tool call results, and that accumulation isn't just long — it's often self-contradictory.

Consider a typical scenario. An agent reads a file to fix a bug, edits it, then reads it again. Now the context holds both the pre-edit and post-edit versions of the same file side by side. The failed test log and the passing test log are sitting there together too. There's no guarantee which version the model references when it makes its next judgment call. This is exactly where you get the model looking at the stale version, declaring "there's still a bug here," and restarting a fix that's already done.

These failure patterns even have names. Context poisoning is when bad information (say, a summary tainted by hallucination) enters the context and contaminates every judgment downstream in a chain reaction. Context distraction is when the accumulated history grows so long that the model gets pulled toward repeating past patterns rather than following the new instruction. Context confusion is when similar-but-different information gets mixed in and causes mix-ups. And context clash is when contradictory pieces of information collide outright. You may not know the names, but the symptoms will be familiar — an agent late in a session repeating the same mistake, or doing the very thing it was told not to do, almost always traces back to one of these four.

<figure>
  <img src="/assets/images/posts/2441c21a-97a2-413d-93be-21c88b2120cb/3.png" alt="The main culprits behind quality decay late in a session — four ways context can fail">
  <figcaption>The main culprits behind quality decay late in a session — four ways context can fail</figcaption>
</figure>

## Signals That Quality Is Degrading

In a long session, watch for these signs that a context problem is at play:

- Re-raising a problem that's already solved, or reading the same file over and over
- Starting to violate rules set early in the session (coding conventions, files not to touch)
- Answers growing bloated, drifting toward a topic from way earlier instead of the immediately preceding question
- Ignoring information you just gave it in favor of stale information sitting somewhere else in the context

What matters here is that this isn't the model getting "tired." The model is a stateless machine that reads everything from scratch on every turn. What's changed isn't the model — it's the state of the context it has to read. A long, messy, contradictory context goes in, and degraded output quality comes out.

## Summary

- Fitting into the context window doesn't mean it gets used well. Both lost in the middle — where recall of mid-context information drops — and context rot — where length itself erodes performance — are phenomena confirmed by research.
- The spec number is an upper bound, not a quality guarantee. The more complex the reasoning a task demands, the more you should assume the effective context is far shorter than the spec.
- An agent's context accumulates the debris of tool calls, contradictions included. The four failure patterns — poisoning, distraction, confusion, and clash — are the main culprits behind quality degradation late in a session.

With the diagnosis done, the next installment moves to treatment. We'll start with the most basic tools: /clear and /compact. Both "empty out the context," but they work on completely different principles, and using either one wrong can wipe out the working context you actually needed. We'll set up criteria for when to clear and when to compact.
