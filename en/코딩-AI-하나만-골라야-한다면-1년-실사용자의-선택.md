---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "If You Had to Pick Just One Coding AI? A 1-Year User's Verdict"
lang: en
description: "One of the most common questions floating around dev communities lately is \"Should I use Claude Code or Codex?\" I've been paying for and using Claude daily…"
header:
  og_image: /assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png
tags:
  - Claude
  - Codex
  - ClaudeCode
  - GPT-5.6
  - Fable5
  - AI coding
  - developer tools
  - AI agents
  - Cursor
  - Kiro
permalink: /en/코딩-AI-하나만-골라야-한다면-1년-실사용자의-선택/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · **English** · [日本語](/ja/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · [中文](/zh/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/)
{: .notice--info}

# The Verdict After a Year on Claude, Six Months on Codex

One of the most common questions floating around dev communities lately is "Should I use Claude Code or Codex?" I've been paying for and using Claude daily for about a year, and Codex for over six months, and I've also gotten my hands on the recently released Claude Fable 5 and GPT-5.6 Sol. Before I settled on these two, I actually went through Cursor and Kiro as well. Cursor was genuinely great at first, but I naturally drifted over to Claude because it was just that good. Kiro is a decent tool, but since it's fairly niche, its ecosystem of skills and plugins isn't well developed, and you end up using Claude models inside Kiro anyway — so there was no real reason to keep using it as a middleman. So in this post, I want to lay out the differences I've noticed firsthand, alongside objective data from community surveys, benchmarks, and GitHub issues.

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png" alt="The two giants of coding AI in 2026: Claude vs. Codex">
  <figcaption>The two giants of coding AI in 2026: Claude vs. Codex</figcaption>
</figure>

## The Personality Difference Between the Two Agents, As I See It

In one line: **Claude feels like an all-around capable senior developer, while Codex feels like a quieter but more precise colleague.**

Claude Code is relatively fast and accurate. It has a good sense for grasping a codebase and reading context, so it picks up on intent well even with vague instructions. That said, it occasionally makes mistakes — the classic senior-dev pattern of pushing forward confidently and missing a detail here and there. And since so many people use it, its surrounding ecosystem of skills and plugins is rich — that's a advantage that shouldn't be underestimated. Search for whatever workflow you need, and chances are someone's already built it.

Codex doesn't crank out code as fast or as boldly as Claude. But it's precise. It mulls things over longer, and what it produces has fewer gaps.

What's interesting is that this isn't just my own impression. In a Reddit survey with over 500 respondents, 65% preferred Codex for everyday use — yet in blind code reviews, 67% rated Claude's code as cleaner. Overseas communities echo this too: comments like "Claude is stronger at precise edits, Codex is stronger at broad refactoring" and "Codex is slower but more thorough on complex tasks" are common. That lines up almost exactly with what I've experienced.

## Claude Fable 5: It Resolved Just About Every Complaint I Had

Claude Fable 5, released in June 2026, has been genuinely satisfying for me personally. The one gripe I had with Claude — "fast, but occasionally sloppy" — has largely been resolved.

The numbers back this up too. Fable 5 scored 95% on SWE-bench Verified and 80.3% on SWE-bench Pro. The previous top model, Opus 4.8, scored 69.2% on SWE-bench Pro — so that's an improvement of over 11 percentage points. On the notoriously difficult FrontierCode Diamond, it hit 29.3%, more than double Opus's 13.4%. Stripe reported completing a 50-million-line Ruby codebase migration with Fable 5 in a single day — a job that would have taken over two months by hand. Of course, these benchmarks run on Anthropic's own scaffolding rather than a neutral harness, so there's criticism to consider there — it's best to read them as a trend rather than take the raw numbers at face value.

## GPT-5.6 Sol: A Fatal Flaw in the Token Department, Yet Still Excellent

GPT-5.6 Sol, which OpenAI shipped on July 9th, is also a genuinely excellent model. It set a new record with a score of 80 on Artificial Analysis's Coding Agent Index. But almost immediately after launch, reports started pouring in that "usage limits are burning through at an insane rate." I ran into this myself, and digging into it turns up some pretty concrete evidence.

- In GitHub Issue #32250 on the Codex repo, a Pro subscriber reported that a single short task on GPT-5.6 Sol Medium dropped their 5-hour usage limit from 87% to 76% — 11 percentage points gone in one shot. After that, even minor follow-up questions with no tool calls involved were shaving off roughly 1 percentage point each. It burned through faster than GPT-5.5 xhigh, which the same user had been running.
- Issue #31860 confirmed that the Codex app was truncating Sol's context to 372K tokens — just 35% of its stated 1.05M-token spec. Once context hits 90%, early compaction kicks in, and there's speculation that this reprocessing step further accelerated token consumption.

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/2.png" alt="11 percentage points of usage limit gone in a single short task">
  <figcaption>11 percentage points of usage limit gone in a single short task</figcaption>
</figure>

In the end, OpenAI admitted that it "made the highest compute setting too easy to reach without adequately communicating the impact," and reset the rate limits twice within 24 hours. According to an OpenAI representative's explanation, 5.6 Sol's Medium tier isn't equivalent to 5.5's Medium tier, the default is actually Sol Low, and xhigh is meant to be reserved for genuinely hard problems. In other words, this looks less like the model itself being inefficient per token, and more like a UX issue — where a high-compute setting ended up being used as if it were the default — compounded by an app-side bug. OpenAI has in fact claimed that Sol's max reasoning setting cuts output tokens by 54% compared to competing models.

It was a genuinely fatal flaw, but even so, the model itself is excellent. Once you understand the settings and use them accordingly, the accuracy of the output is still top-tier.

## There's No Longer Any Real Need to Insist on Claude

Just a few months ago, there was a general sense that "Claude is the only real choice for coding." I don't think that's true anymore. Both are excellent. On Terminal-Bench 2.1, the Codex CLI combo takes first place at 83.4%; on SWE-bench Pro, Fable 5 leads at 80.3%. We're now in an era where the top spot shifts depending on which benchmark you look at.

So my conclusion is that using both is the best approach. But if I had to pick just one, I'd go with Codex — because I already use ChatGPT frequently, and a single subscription covers image generation as well. That's not a verdict based purely on the coding agent itself, but on the overall value of the whole subscription.

## Won't Everyone End Up Using Both Anyway?

There's one more angle I want to add here. Token usage across recent models has been climbing dramatically. Some analyses suggest agentic AI can consume up to 1,000 times the tokens of typical chatbot usage, and Forbes and TechCrunch have both dubbed this phenomenon the "Tokenpocalypse," reporting a surge in users burning through their subscription limits faster than expected. In fact, within the community, the number one reason people cite for paying for Codex on top of Claude is "Claude's limits run out too fast."

If we're entering an era where a single subscription's limits just aren't enough, it seems likely that everyone will naturally converge on running two subscriptions in parallel.

## Using Both Agents Together Actually Performs Better, Too

Using both isn't purely about hitting usage limits, either. When you experiment with AI orchestration, pairing two different agents together consistently outperforms pairing two instances of the same agent.

There's research backing this up as well. The X-MAS study (arXiv 2505.16997) reports that assigning different LLMs to different roles in a multi-agent system improves accuracy by 8–47% over homogeneous combinations, and another study (arXiv 2602.03794) found that two diverse agents can match or outperform sixteen homogeneous ones.

The combination that has worked best in my own experience is this: **have Claude do the work, and have Codex check the results.** It's a structure where a careful, precise reviewer catches what a fast, bold senior developer might miss. Because their personalities differ, they're good at catching each other's blind spots.

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/3.png" alt="The workflow where Claude builds and Codex reviews">
  <figcaption>The workflow where Claude builds and Codex reviews</figcaption>
</figure>

## Summary

- Claude is fast and accurate in a senior-dev sort of way; Codex is slower but precise. Community assessments back this up.
- Fable 5 resolved Claude's main weakness (occasional mistakes), and GPT-5.6 Sol is excellent despite its token issues.
- There's no longer any real reason to insist on Claude specifically. Both are top-tier, and using both is the best approach.
- If I had to pick just one, I'd go with Codex — because of the overall subscription value, which includes ChatGPT and image generation.
- Given how fast token consumption is climbing, it seems likely everyone will end up using both eventually.
- For orchestration, a heterogeneous pairing is the answer. Claude building and Codex reviewing worked best for me.

## References

- [GPT-5.6 Sol usage limit burn-through issue (openai/codex #32250)](https://github.com/openai/codex/issues/32250)
- [Codex app's Sol context cap issue (openai/codex #31860)](https://github.com/openai/codex/issues/31860)
- [Claude Fable 5 & Mythos 5 benchmarks explained (Vellum)](https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained)
- [Claude Code vs OpenAI Codex comparison (Composio)](https://composio.dev/content/claude-code-vs-openai-codex)
- [Codex vs Claude Code comparison (Builder.io)](https://www.builder.io/blog/codex-vs-claude-code)
- [X-MAS: heterogeneous LLM multi-agent research (arXiv 2505.16997)](https://arxiv.org/abs/2505.16997)
- [Agent diversity scaling study (arXiv 2602.03794)](https://arxiv.org/abs/2602.03794)
- [AI token burn-through acceleration report (Forbes, April 2026)](https://www.forbes.com/sites/ronschmelzer/2026/04/10/running-out-of-ai-tokens-faster-than-ever-heres-why/)
- [The era of the token bill coming due (TechCrunch, June 2026)](https://techcrunch.com/2026/06/05/the-token-bill-comes-due-inside-the-industry-scramble-to-manage-ais-runaway-costs/)
