---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "What Is MCP? From Connecting to Security Pitfalls"
lang: en
description: "If you've spent time with ChatGPT or Claude, you've probably hit a wall at some point. The model is smart, but it can't see your database, and it can't read…"
header:
  og_image: /assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/1.png
tags:
  - MCP
  - ModelContextProtocol
  - AIagents
  - Claude
  - LLM
  - AItoolintegration
  - AIfordevelopers
  - AIautomation
permalink: /en/MCP-서버란-연결-방법부터-보안-주의점까지/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/MCP-%EC%84%9C%EB%B2%84%EB%9E%80-%EC%97%B0%EA%B2%B0-%EB%B0%A9%EB%B2%95%EB%B6%80%ED%84%B0-%EB%B3%B4%EC%95%88-%EC%A3%BC%EC%9D%98%EC%A0%90%EA%B9%8C%EC%A7%80/) · **English** · [日本語](/ja/MCP-%EC%84%9C%EB%B2%84%EB%9E%80-%EC%97%B0%EA%B2%B0-%EB%B0%A9%EB%B2%95%EB%B6%80%ED%84%B0-%EB%B3%B4%EC%95%88-%EC%A3%BC%EC%9D%98%EC%A0%90%EA%B9%8C%EC%A7%80/) · [中文](/zh/MCP-%EC%84%9C%EB%B2%84%EB%9E%80-%EC%97%B0%EA%B2%B0-%EB%B0%A9%EB%B2%95%EB%B6%80%ED%84%B0-%EB%B3%B4%EC%95%88-%EC%A3%BC%EC%9D%98%EC%A0%90%EA%B9%8C%EC%A7%80/)
{: .notice--info}

If you've spent time with ChatGPT or Claude, you've probably hit a wall at some point. The model is smart, but it can't see your database, and it can't read your internal wiki.

So people started wiring APIs directly into these models. But every model and every tool has its own way of connecting, so the moment you add more combinations, the integration code grows exponentially.

MCP (Model Context Protocol) is a standard built to solve exactly this problem. In one sentence: it's a common spec for plugging external tools and data into AI models. People often call it "the USB-C of AI."

This post covers exactly what problem MCP solves, how integration work changes before and after adopting it, its internal architecture, how it differs from function calling, and a handful of standout servers you can plug in right now.

<figure>
  <img src="/assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/1.png" alt="MCP unifies all those mismatched cables into a single standard">
  <figcaption>MCP unifies all those mismatched cables into a single standard</figcaption>
</figure>

Here's the quick summary before we dive in.

1. MCP is an open standard protocol for connecting AI to external tools (released by Anthropic in November 2024)
2. What used to take hundreds of lines of custom integration code now takes just a few lines of config with an MCP server
3. It doesn't replace function calling — it's a layer on top that standardizes and makes tools reusable
4. With OpenAI and Google also adopting it, it's become a de facto industry standard, and the server ecosystem is growing fast

---

## The Problem MCP Solves: M×N Integration Hell

Let's start with what things looked like before MCP.

If you had M AI apps and wanted to connect N tools, you needed M×N pieces of integration code. A GitHub integration for Claude, a separate one for ChatGPT, another for Cursor — all built independently.

MCP inserts a standard spec between the two sides. Tool builders write an MCP server once, and AI app builders implement an MCP client once. That's it. M×N collapses into M+N.

> Think back to the days before USB-C, when every device came with its own charging cable. MCP is what standardized that cable spec.

But a formula like "M+N" doesn't really make the difference tangible. Building the same feature both ways makes the gap obvious.

---

## Same Feature, Before and After

Let's say you're building "an AI that looks up GitHub issues and answers questions about them."

Before MCP, all of this fell on you:

1. Define the tool schema: write a JSON schema by hand describing that `list_issues` takes `owner`, `repo`, and `state`
2. Write the actual calling code: a GitHub REST API client, token management, pagination handling
3. Build the execution loop: round-trip code where the model calls a tool, gets the result back, and hands it back to the model
4. Repeat all of the above for every app: one build for the Claude integration, another for the internal chatbot

Just looking up issues meant hundreds of lines including boilerplate, and steps 1–3 repeated every time you added a tool.

With MCP, it ends here:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

The schema definitions, API calling code, auth handling, and error handling are all already baked into the server. All you do is register the server, then say "summarize the recent bug issues in this repo."

| Item | Direct Integration | Using an MCP Server |
| --- | --- | --- |
| Code to write | Hundreds of lines: schema + calls + loop | 5 lines of config |
| Auth/error handling | Build it yourself | Built into the server |
| Adding another AI app | Start from scratch | Reuse the same server |
| Adding a new tool | Edit code and redeploy | Just update the server |

That last row matters most. Even when new features get added to the server, your own code doesn't change at all — that's the real power of standardization.

---

## Under the Hood: Host, Client, Server

MCP has three players.

| Component | Role | Example |
| --- | --- | --- |
| Host | The AI app the user interacts with | Claude Desktop, Cursor |
| Client | Talks 1:1 with a server, inside the host | Built into the host |
| Server | A program that exposes tools/data | GitHub server, DB server |

One host can spin up multiple clients, and each client connects to exactly one server. Communication runs on JSON-RPC 2.0, using stdio for local processes and streaming HTTP for remote connections.

<figure>
  <img src="/assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/2.png" alt="A client inside the host connects 1:1 with a server">
  <figcaption>A client inside the host connects 1:1 with a server</figcaption>
</figure>

What a server exposes falls into three categories:

- Tools: functions the model calls. Actions like "create an issue" or "run a query"
- Resources: data the model reads. Read-only material like file contents or a DB schema
- Prompts: prompt templates the server has pre-built

The key is that the tool list is queried at runtime. When a client connects to a server, it asks "what can you do?" and the server returns its list of tools and their schemas. That's exactly why "the server can update while my code stays the same" is possible.

---

## So How Is This Different From Function Calling?

At this point you might be thinking, "wait, didn't function calling already handle this?"

They operate at different layers. Function calling is a protocol for talking to the model — it's the agreement that says "hey model, here are some functions, respond in the calling format if you need one." How those functions are actually implemented and where they come from is entirely up to the developer.

MCP is a protocol for distributing and reusing those functions. It packages a tool's implementation, auth, and documentation into something called a server, so any AI app can plug it in and use it.

> If function calling is "the syntax for calling a function," MCP is "an ecosystem of libraries full of functions." In fact, an MCP client uses function calling internally under the hood. It's not a replacement relationship — it's a layered one.

So the question "function calling vs. MCP, which should I use?" doesn't really make sense. If you just need a couple of functions for a single app, implementing function calling directly is enough. If you want to reuse tools across multiple apps or use tools someone else already built, MCP is the right call.

---

## Notable Servers Worth Connecting Right Now

The ecosystem is growing fast, and servers already exist for most tools you'd want. Here are five that have gotten a particularly good reception.

| Server | What It Does |
| --- | --- |
| Playwright | Lets the AI control a browser directly — clicking, typing, screenshots |
| Figma | Reads design mockups and turns them into frontend code |
| Notion | Searches and organizes docs/meeting notes, creates pages |
| GitHub | Looks up and creates issues/PRs, searches code |
| Supabase (Postgres) | Query your DB in natural language, inspect the schema |

If I had to pick just one, it'd be Playwright. Connect it and try saying "go to this site, fill out the signup form, and take a screenshot." Watching the AI actually open a browser, click, and type makes it obvious why connecting tools is such a game-changer — no further explanation needed. It's immediately useful for automating E2E tests or repetitive web tasks.

Figma is also a huge deal if you're a frontend developer. The work of manually translating a mockup into markup turns into simply telling an AI that can read the mockup directly, "turn this frame into a React component."

<figure>
  <img src="/assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/3.png" alt="A few lines in a config file and you're connected">
  <figcaption>A few lines in a config file and you're connected</figcaption>
</figure>

---

## Caveats and Limitations

MCP isn't a silver bullet. Here are the pain points that actually come up in practice.

First, security. An MCP server is a channel that grants the model execution privileges, so connecting an untrusted server can leak data through prompt injection. It's safer to stick to official registries or verified servers only.

There's also a context cost. The more servers you attach, the more tool definitions eat into the context window — creating the paradox that the model's performance can actually degrade. As with the table above, it's better to only attach what you actually need right now.

---

## Wrapping Up

MCP isn't a technology that makes the model "smarter" — it standardizes "how far the model's reach can extend." What used to take hundreds of lines of direct integration now takes a few lines of config, and an ecosystem has emerged where you can plug in tools someone else built and just use them. Those two things are the essence of it.

In the next post, I'll cover how Claude Code's Skills and subagents — which often get compared to MCP — each play a different role.
