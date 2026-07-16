---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Why CLAUDE.md Should Stay Short: Designing Your AI Agent's Always-Loaded Context"
lang: en
description: "Part 3 covered how to clear conversation history with /clear. But if you check your remaining context right after running /clear, it's not back to 100%.…"
header:
  og_image: /assets/images/posts/5c28e3e8-171c-46b9-a58c-3251910b2fe3/1.png
tags:
  - CLAUDEmd
  - ClaudeCode
  - AIagents
  - systemprompt
  - MCP
  - contextwindow
  - LLM
  - AIautomation
  - promptengineering
  - devproductivity
permalink: /en/CLAUDEmd는-왜-짧아야-할까-AI-에이전트-상시-로드-컨텍스트-설계법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/CLAUDEmd%EB%8A%94-%EC%99%9C-%EC%A7%A7%EC%95%84%EC%95%BC-%ED%95%A0%EA%B9%8C-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%83%81%EC%8B%9C-%EB%A1%9C%EB%93%9C-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%84%A4%EA%B3%84%EB%B2%95/) · **English** · [日本語](/ja/CLAUDEmd%EB%8A%94-%EC%99%9C-%EC%A7%A7%EC%95%84%EC%95%BC-%ED%95%A0%EA%B9%8C-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%83%81%EC%8B%9C-%EB%A1%9C%EB%93%9C-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%84%A4%EA%B3%84%EB%B2%95/) · [中文](/zh/CLAUDEmd%EB%8A%94-%EC%99%9C-%EC%A7%A7%EC%95%84%EC%95%BC-%ED%95%A0%EA%B9%8C-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%83%81%EC%8B%9C-%EB%A1%9C%EB%93%9C-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%84%A4%EA%B3%84%EB%B2%95/)
{: .notice--info}

Part 3 covered how to clear conversation history with /clear. But if you check your remaining context right after running /clear, it's not back to 100%. Type /context in Claude Code and you'll see why. The system prompt, tool definitions, CLAUDE.md, and tools registered by MCP servers are already eating up tens of thousands of tokens — before the conversation even starts.

This installment is about that "always-loaded context." If conversation history is a variable cost, this is a fixed cost. It rides along on every single turn, doesn't disappear with /clear, and occupies a slice of the model's attention for the entire session. If the fixed-cost layer is poorly designed, every session starts out already in the red — which is exactly why it needs fixing before you even get to managing the conversation.

<figure>
  <img src="/assets/images/posts/5c28e3e8-171c-46b9-a58c-3251910b2fe3/1.png" alt="The fixed cost you carry on every turn — if the backpack's too heavy, every session starts out at a loss">
  <figcaption>The fixed cost you carry on every turn — if the backpack's too heavy, every session starts out at a loss</figcaption>
</figure>

## What's Already Loaded Before the Session Even Starts

An agent's context window doesn't start as a blank page. Before the first user input arrives, several layers are already stacked on top of each other.

At the very bottom sits the system prompt — the baseline instructions planted by the agent harness (the runtime environment, like Claude Code), covering things like tool-use rules and response formatting, typically running into the thousands of tokens. This is territory users can't touch.

On top of that come the tool definitions. For the model to use a tool, it needs to know that tool's name, description, and parameter schema, and all of that gets fed into the context as text. With just the default tools, the load isn't too bad — but the picture changes once you start connecting MCP servers. It's common for a single server to register dozens of tools, so connecting even a handful of servers can burn tens of thousands of tokens on tool definitions alone. Tools you'll never touch make the round trip on every single turn.

Last comes project instruction files like CLAUDE.md. Global settings, project settings, even subdirectory settings all get loaded automatically — and this is the one layer users can actually design themselves.

## The Rule for CLAUDE.md: Keep Only What's Always True, and Keep It Short

There's really just one test for what belongs in CLAUDE.md: is this always true for every task in this project? Since this file rides along on every turn, for every task, anything that applies to some tasks but not others isn't earning its keep.

Build and test commands, the broad shape of the codebase, the handful of rules that must never be broken — these clear the bar. Detailed specs for a specific feature, full library usage docs, records of past work — these belong to a specific task and don't clear it.

There's a paradox around length. It feels like writing more instructions should mean better compliance, but in practice it's close to the opposite. As we saw in Part 2, longer context thins out the attention any single item gets, and in a instruction file running hundreds of lines, the rules that actually matter get lost in the middle. Write 50 rules and all 50 tend to get followed hazily; write 10 and those 10 tend to get followed sharply. If an agent keeps breaking the rules in your CLAUDE.md, trimming the file is likely the right move before adding more rules.

<figure>
  <img src="/assets/images/posts/5c28e3e8-171c-46b9-a58c-3251910b2fe3/2.png" alt="Of the three always-loaded layers, CLAUDE.md is the only one you get to design yourself">
  <figcaption>Of the three always-loaded layers, CLAUDE.md is the only one you get to design yourself</figcaption>
</figure>

## Don't Load the Whole Thing — Load a Pointer to It

So where should the information that didn't clear the bar go — the detailed docs you only need occasionally? The answer: keep it out of context, and just tell the agent where to find it.

Instead of pasting the full database migration procedure into CLAUDE.md, write one line: "See docs/migration.md for the migration procedure." The agent reads that file only when it's actually doing migration work. The detail loads into context only for the sessions that need it, while unrelated sessions pay just the cost of a one-line pointer.

Claude Code's skills systematize this same idea. A skill is a procedure document for a specific task — normally only its name and a one-line description sit in context, and the full body loads only when that task kicks off. Instead of keeping a "deployment procedure" permanently resident in CLAUDE.md, turning it into a skill saves those tokens on the 99% of turns where you're not deploying.

Tools are worth pruning too. If you've got MCP servers connected but unused, simply turning them off removes tens of thousands of tokens of fixed cost. More harnesses are starting to support lazy loading — keeping only a tool's name in context by default and loading the full schema only when needed — but the direction is the same either way. Instead of always loading everything, load what you need, when you need it.

<figure>
  <img src="/assets/images/posts/5c28e3e8-171c-46b9-a58c-3251910b2fe3/3.png" alt="Keep only the handful of always-true rules on the wall; leave the detailed manual on the shelf and pull it out when you need it">
  <figcaption>Keep only the handful of always-true rules on the wall; leave the detailed manual on the shelf and pull it out when you need it</figcaption>
</figure>

## A Routine for Auditing Fixed Costs

Always-loaded context is easy to let balloon without noticing — it's the same cost every session, so there's nothing to compare it against. That's exactly why it's worth checking on deliberately from time to time.

In Claude Code, /context breaks down exactly where your current context is going — by system prompt, tools, MCP, and memory files, with token counts for each. If you spot something lopsided, like tool definitions outweighing the conversation itself, start by pruning MCP servers. Open CLAUDE.md every quarter or so and cut lines using one test: has this line actually helped in the past month? Instruction files only ever grow if left alone, so pruning has to be a routine, not a one-off, if you want to keep the file short.

## Summary

- The system prompt, tool definitions, and CLAUDE.md are fixed costs carried on every turn. They don't disappear with /clear, so they need to be designed before you even get to managing conversations.
- The test for CLAUDE.md is: is this always true for every task? The longer it gets, the hazier each individual rule becomes — so if rules aren't being followed, shrinking the file comes before adding more rules.
- Keep pointers to detailed docs instead of the full text, split out repeated procedures as skills, and turn off unused MCP servers. The principle is: load what you need, only when you need it.

Do this much, and a single session's context gets pretty clean. But no matter how carefully you trim, there comes a point where one big task simply won't fit in one session. The next installment covers the structural solution for that: subagents. We'll look at how the isolation pattern — delegating exploration to a separate context and bringing back only the conclusion — protects your context.
