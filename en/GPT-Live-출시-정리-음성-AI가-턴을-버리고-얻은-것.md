---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "GPT-Live Explained: What Voice AI Gains by Giving Up the 'Turn'"
lang: en
description: "OpenAI has released a new voice model called GPT-Live. If you had to pick the single most important line from the announcement, it's this: \"a full-duplex…"
header:
  og_image: /assets/images/posts/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/1.png
tags:
  - GPT-Live
  - OpenAI
  - voice AI
  - full duplex
  - ChatGPT
  - GPT-5.5
  - voice model
  - AI agent
  - voice interface
  - AI trends
permalink: /en/GPT-Live-출시-정리-음성-AI가-턴을-버리고-얻은-것/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/GPT-Live-%EC%B6%9C%EC%8B%9C-%EC%A0%95%EB%A6%AC-%EC%9D%8C%EC%84%B1-AI%EA%B0%80-%ED%84%B4%EC%9D%84-%EB%B2%84%EB%A6%AC%EA%B3%A0-%EC%96%BB%EC%9D%80-%EA%B2%83/) · **English** · [日本語](/ja/GPT-Live-%EC%B6%9C%EC%8B%9C-%EC%A0%95%EB%A6%AC-%EC%9D%8C%EC%84%B1-AI%EA%B0%80-%ED%84%B4%EC%9D%84-%EB%B2%84%EB%A6%AC%EA%B3%A0-%EC%96%BB%EC%9D%80-%EA%B2%83/)
{: .notice--info}

OpenAI has released a new voice model called GPT-Live. If you had to pick the single most important line from the announcement, it's this: "a full-duplex architecture that listens and speaks at the same time." Until now, no matter how fast voice AI got, it still worked like a walkie-talkie — one side had to finish talking before the other could start. GPT-Live turns that structure into a phone call instead. Let's walk through what's changed and why it matters, from an architecture point of view.

<figure>
  <img src="/assets/images/posts/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/1.png" alt="From walkie-talkie to phone call — GPT-Live listens and speaks at the same time">
  <figcaption>From walkie-talkie to phone call — GPT-Live listens and speaks at the same time</figcaption>
</figure>

First, let's take a quick look at what starting a new voice conversation looks like.

▶ GPT-Live voice conversation start screen (OpenAI official)
<video controls preload="metadata" style="max-width:100%;border-radius:8px" src="/generated/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/videos/6.mp4"></video>

## From cascaded, to turn-based, to full duplex

Voice AI architecture has gone through three stages.

The original ChatGPT voice conversation was cascaded. A speech-recognition model turned speech into text, a language model generated the reply, and a text-to-speech model converted it back into audio — a three-model relay. Talking to a frontier model by voice at all was novel at the time, but information leaked at every handoff between models, and responses were slow. There was also a structural limit: the nuance carried in someone's voice disappeared the moment it got converted into text.

The turn-based model, best represented by Advanced Voice Mode, merged all of that into a single model. Because it processed and generated speech directly, latency dropped and the delivery sounded more natural. But it still handled conversation turn by turn — waiting for the user to finish speaking before responding. The catch is that it judged "finished speaking" by silence. That's exactly where the awkward moments came from: it would cut in when someone paused to gather their thoughts, or mistake background noise for the end of a turn.

GPT-Live throws out the concept of a turn altogether. While generating a response, it keeps processing the user's input at the same time, deciding many times per second whether to speak, keep listening, pause, interrupt, or invoke a tool. That's what makes backchanneling possible — reacting with a quick "mm-hmm" or "right" while the other person is still talking — and it's also what makes real-time interpretation possible. This difference is easier to hear than to read about, so here are two demo videos OpenAI released.

▶ Natural conversation demo (OpenAI official)
<video controls preload="metadata" style="max-width:100%;border-radius:8px" src="/generated/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/videos/1.mp4"></video>

▶ Listening and speaking at once, real-time interpretation demo (OpenAI official)
<video controls preload="metadata" style="max-width:100%;border-radius:8px" src="/generated/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/videos/2.mp4"></video>

<figure>
  <img src="/assets/images/posts/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/2.png" alt="Instead of judging turns by silence, it processes listening and speaking simultaneously, with background delegation on top">
  <figcaption>Instead of judging turns by silence, it processes listening and speaking simultaneously, with background delegation on top</figcaption>
</figure>

## The second design choice: separating conversation from thinking

As notable as the full-duplex piece is the way GPT-Live splits up responsibilities. GPT-Live itself handles only the seamless back-and-forth of interaction, while questions that require search or deep reasoning get handed off to a frontier model running in the background. At launch, that role is filled by GPT-5.5, and OpenAI has said it will be swapped out as new frontier models arrive.

This design is smart for two reasons. One is the user experience: even while heavy work is running in the background, GPT-Live keeps the conversation going. Instead of dead silence while waiting for search results, the flow of conversation stays intact. The other is the upgrade path. Because the conversational layer and the thinking layer are separate, OpenAI can swap out just the back-end model to boost intelligence while leaving the voice experience untouched. It's the same idea as separating an orchestrator from workers in an agentic system.

The performance numbers back up this design. According to OpenAI, GPT-Live-1 outperformed Advanced Voice Mode across the board on GPQA (which evaluates expert-level scientific reasoning), BrowseComp (which evaluates agentic web search), and τ³-Voice Telecom (which evaluates multi-turn voice tasks in a telecom support setting). In 5-to-10-minute real-world usage comparisons, it was also preferred more on turn-taking, interruption handling, and conversational flow. You can see how background delegation actually plays out in the demo below.

▶ Smarter answers, background reasoning demo (OpenAI official)
<video controls preload="metadata" style="max-width:100%;border-radius:8px" src="/generated/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/videos/3.mp4"></video>

## What you can use now, and what's still missing

Here's how it's being rolled out. Two versions, GPT-Live-1 and GPT-Live-1 mini, are rolling out gradually to users worldwide on iOS, Android, and ChatGPT.com. Go, Plus, and Pro plans default to GPT-Live-1, while Free defaults to mini. You can also choose a reasoning level — Instant for fast responses, or Medium/High for deeper answers, which run GPT-5.5 Thinking in the background.

During a conversation, topics like weather, stocks, or sports are shown alongside visual cards, and search, memory, images, and file uploads all work directly within the voice conversation. OpenAI also says the model has gotten better at focusing on the user's voice amid background noise. Official demos are up for both of these features.

▶ Visual cards during conversation demo (OpenAI official)
<video controls preload="metadata" style="max-width:100%;border-radius:8px" src="/generated/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/videos/4.mp4"></video>

▶ Conversation amid background noise demo (OpenAI official)
<video controls preload="metadata" style="max-width:100%;border-radius:8px" src="/generated/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/videos/5.mp4"></video>

Safety measures have also been rebuilt for voice. Because voice conversations happen in real time, OpenAI added safeguards that work even while a response is being spoken, and conversations can be ended if the risk level is high enough. Self-harm-related conversations surface a crisis hotline, teen accounts let parents control whether voice conversations are enabled, and parents may be notified in high-risk situations. OpenAI also specified that only nine predefined voices are offered, so the system can't be used to mimic a real person's voice.

Some things aren't available yet. The developer API is "coming soon," and currently only accepts sign-ups for launch notifications. Voice conversation paired with video or screen sharing is also missing at launch — if you need that, you'll still have to use the existing voice mode. OpenAI also noted that language optimization is currently focused on major languages, so accents may sound off in some other languages.

<figure>
  <img src="/assets/images/posts/ea24c9c3-83f0-4177-b6e1-8e9a010e072d/3.png" alt="The moments when your hands aren't free are exactly where a voice interface belongs">
  <figcaption>The moments when your hands aren't free are exactly where a voice interface belongs</figcaption>
</figure>

## Summary

- GPT-Live is a full-duplex voice model that listens and speaks at the same time. The awkwardness of the old silence-based turn detection is now gone at the architectural level.
- It's a split design where GPT-Live handles the conversation and a background GPT-5.5 handles search and reasoning — a structure that lets the back-end intelligence keep improving while the conversational experience stays untouched.
- Rollout in ChatGPT is starting now, but the API isn't available yet. If you're a developer building a voice interface, it's worth reviewing your design against this architecture rather than a cascaded pipeline.

OpenAI says 150 million people talk to ChatGPT by voice every week. As voice shifts from being a secondary input method to becoming the default interface, doing away with the turn looks like it could be a bigger turning point than it first appears.
