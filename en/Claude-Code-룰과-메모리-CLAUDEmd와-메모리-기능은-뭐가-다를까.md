---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Claude Code Rules vs. Memory: What's the Difference Between CLAUDE.md and the Memory Feature?"
lang: en
description: "Once you start using Claude Code on real projects, two distinct needs emerge: \"follow this rule every single time\" and \"remember what we figured out last time.\""
header:
  og_image: /assets/images/posts/e995a696-1130-4ad3-a96c-b5484bea5794/1.png
tags:
  - ClaudeCode
  - CLAUDE.md
  - memory feature
  - AI agents
  - context engineering
  - developer productivity
  - LLM
  - AI automation
permalink: /en/Claude-Code-룰과-메모리-CLAUDEmd와-메모리-기능은-뭐가-다를까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/Claude-Code-%EB%A3%B0%EA%B3%BC-%EB%A9%94%EB%AA%A8%EB%A6%AC-CLAUDEmd%EC%99%80-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B8%B0%EB%8A%A5%EC%9D%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C/) · **English** · [日本語](/ja/Claude-Code-%EB%A3%B0%EA%B3%BC-%EB%A9%94%EB%AA%A8%EB%A6%AC-CLAUDEmd%EC%99%80-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B8%B0%EB%8A%A5%EC%9D%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C/)
{: .notice--info}

Once you start using Claude Code on real projects, two distinct needs emerge: "follow this rule every single time" and "remember what we figured out last time."

The rule file, CLAUDE.md, handles the first. The memory feature handles the second. Both are "instructions that persist beyond a session," which makes them easy to mix up, but they differ in who manages them and what kind of content they hold.

This post breaks down CLAUDE.md's hierarchical structure, how the memory feature actually works, and the criteria for deciding what goes where.

<figure>
  <img src="/assets/images/posts/e995a696-1130-4ad3-a96c-b5484bea5794/1.png" alt="Rules flow down from above, memory builds up from below — the directions are different">
  <figcaption>Rules flow down from above, memory builds up from below — the directions are different</figcaption>
</figure>

Let's start with the key takeaways.

1. CLAUDE.md is a rule file that loads automatically every session, split into global and project-level tiers
2. Memory is a feature where Claude records and recalls facts it learns while working, stored per project in dedicated folders
3. Rules a human decides go in CLAUDE.md; experience an agent accumulates goes into memory
4. Both consume context, so keep them lean by asking "is this always needed?"

---

## CLAUDE.md: Location Determines Scope

CLAUDE.md is a markdown file that gets loaded wholesale into the prompt at the start of every session. It holds "rules that must always hold true" — coding conventions, things that are forbidden, project background.

Even files with the same name apply at different scopes depending on where they live.

| Location | Scope | Shared |
| --- | --- | --- |
| ~/.claude/CLAUDE.md | All projects | Personal only |
| project/CLAUDE.md | That project | Shared via git |
| subfolder/CLAUDE.md | When working in that folder | Shared via git |

Put personal preferences unrelated to any specific project (commit style, response language) in the global file, and repo-specific rules in the project file. When the two tiers conflict, it's safer to explicitly state that the more specific one — the project rule — takes precedence.

If a file gets too long, you can split it up by importing other documents with `@path/file.md`. That said, imported documents still end up loaded into context all the same, so this is better thought of as a convenience for organization rather than a way to save space.

---

## Memory: Notes the Agent Writes for Itself

If CLAUDE.md is a top-down set of rules a human writes, memory runs in the opposite direction. Claude records facts it learns while working into files inside a per-project memory folder, then pulls them back out in later sessions.

The mechanism is simple. Each memory is one file, and a one-line summary of it gets added to an index file (MEMORY.md). At the start of a session, only the index loads into context — the body of an individual memory gets read only when relevant work comes up.

<figure>
  <img src="/assets/images/posts/e995a696-1130-4ad3-a96c-b5484bea5794/2.png" alt="Rules load wholesale every session; memory loads just the index, with the body read only when needed">
  <figcaption>Rules load wholesale every session; memory loads just the index, with the body read only when needed</figcaption>
</figure>

The texture of what gets recorded also differs from rules. Things like "this DB needs a type check after batching" or "the dev server only reflects changes when started from this worktree" — facts that aren't written down anywhere but that you only learn by hitting them. It's essentially experiential knowledge accumulating at the stage before a human codifies it into an actual rule.

You can also send a message starting with `#` mid-conversation to directly say "remember this." In that case Claude either asks which file to save it to or classifies it on its own.

---

## The Criteria for Deciding Where Something Goes

When the roles of the two seem to overlap, three questions settle it.

First: who decided this? If it's a rule the team or you personally set, it goes in CLAUDE.md. If it's a fact discovered while working, it goes into memory.

Second: does breaking it cause a real problem? Rules where a violation is itself an incident (don't commit secret keys, deployment procedures) absolutely belong in CLAUDE.md. Memory isn't a guaranteed enforcement mechanism — it's closer to a reference note, since its recall isn't guaranteed.

Third: is this already knowable from the code or docs? As a rule, anything you can figure out just by reading the repository shouldn't go in either place. It only wastes context, and it turns into false information the moment the code changes.

<figure>
  <img src="/assets/images/posts/e995a696-1130-4ad3-a96c-b5484bea5794/3.png" alt="An editor's rule file and a handwritten notebook — that's exactly the relationship here">
  <figcaption>An editor's rule file and a handwritten notebook — that's exactly the relationship here</figcaption>
</figure>

---

## Two Things to Maintain in Practice

First, clean house regularly. CLAUDE.md tends to only accumulate rules and never shed them. Rules that are no longer valid, or one-off instructions that were only ever needed once, should be deleted the moment you notice them — otherwise you waste context every single session. The same goes for memory: when the code changes and an entry is no longer true, it's better to delete it than to leave it sitting there.

Second, keep rules short and assertive. Short, direct statements like "do X" or "never do Y" get followed far more reliably than hedged phrasing like "it would be good to do X if possible." Attaching a single example line noticeably improves compliance.

---

## Wrapping Up

CLAUDE.md is the constitution; memory is the work log. Immutable rules a human sets flow down from above, while experience gained on the ground accumulates from below.

Once you start managing these two separately, you'll find yourself repeating the same explanations far less often each session, and repeating past sessions' mistakes far less often too.
