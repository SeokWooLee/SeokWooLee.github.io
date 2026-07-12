---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "如果只能选一个编程 AI？一位用了一年的用户的选择"
lang: zh
description: "最近在开发者社区里最常见的问题之一就是「Claude Code 和 Codex 到底该用哪个」。我 Claude 大概付费用了一年，Codex 也用了超过半年，每天都在用，最近推出的 Claude Fable 5 和 GPT-5.6 Sol 也都体验过了。其实在固定用这两个之前，我还用过 Cursor 和…"
header:
  og_image: /assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png
tags:
  - Claude
  - Codex
  - ClaudeCode
  - GPT-5.6
  - Fable5
  - AI编程
  - 开发者工具
  - AI智能体
  - Cursor
  - Kiro
permalink: /zh/코딩-AI-하나만-골라야-한다면-1년-실사용자의-선택/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · [English](/en/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · [日本語](/ja/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · **中文**
{: .notice--info}

# Claude 用了一年、Codex 用了六个月的开发者的结论

最近在开发者社区里最常见的问题之一就是「Claude Code 和 Codex 到底该用哪个」。我 Claude 大概付费用了一年，Codex 也用了超过半年，每天都在用，最近推出的 Claude Fable 5 和 GPT-5.6 Sol 也都体验过了。其实在固定用这两个之前，我还用过 Cursor 和 Kiro。Cursor 一开始真的很好用，但因为 Claude 实在太好用，就自然而然转过去了；Kiro 也是不错的工具，但毕竟不是主流，技能、插件这类生态不够完善，而且最后在 Kiro 里用的其实也是 Claude 的模型，就没必要非得绕这一圈了。所以这篇文章想把我自己的实际体感，加上社区问卷、基准测试、GitHub issue 之类的客观资料一起整理一下。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png" alt="2026年编程AI两强，Claude与Codex对比">
  <figcaption>2026年编程AI两强，Claude与Codex对比</figcaption>
</figure>

## 我感受到的两个智能体的性格差异

一句话概括的话是这样的：**Claude 整体上给人一种全能型资深开发者的感觉，Codex 则是话不多但很靠谱的同事。**

Claude Code 相对来说又快又准。它读懂代码库的直觉、把握上下文的能力都不错,就算指令下得比较模糊，也能很好地领会意图。不过它偶尔会出错，就是那种自信满满地往前推进、却漏掉细节的资深范儿。而且因为用的人多，技能、插件这类周边生态很丰富也是不容忽视的优点——搜索一下需要的工作流，往往已经有人做好了。

Codex 写代码没有 Claude 那么快、那么爽快。但它准。经过长时间思考才给出的结果，漏洞比较少。

有意思的是，这不只是我一个人的感受。在一份超过 500 人参与的 Reddit 问卷里，日常使用方面 65% 的人更喜欢 Codex，但在盲测代码评审中，反而有 67% 的人认为 Claude 的代码更干净利落。海外社区里也常见「Claude 擅长精细编辑，Codex 擅长大范围重构」「Codex 慢，但在复杂任务上更彻底」这样的评价，跟我的体感几乎一致。

## Claude Fable 5：之前的遗憾几乎都解决了

2026 年 6 月发布的 Claude Fable 5，我个人相当满意。之前 Claude 让人有点遗憾的地方——也就是「快是快，但偶尔会出错」——基本上都解决了。

数据上也能看出来。Fable 5 在 SWE-bench Verified 上拿到 95%，在 SWE-bench Pro 上拿到 80.3%。此前最顶尖的 Opus 4.8 在 SWE-bench Pro 上的分数是 69.2%，也就是说提升了 11 个百分点以上。在难度更高的 FrontierCode Diamond 上，Fable 5 拿到 29.3%，是 Opus（13.4%）的两倍多。Stripe 表示，他们用 Fable 5 在一天之内完成了一次 5000 万行 Ruby 代码库的迁移，而如果靠人工，这项工作至少要花两个月。当然，这些基准测试都是基于 Anthropic 自家的脚手架跑出来的，并非中立测试环境，也有人对此提出批评，所以与其纠结具体数值，不如把它当作一种趋势来看。

## GPT-5.6 Sol：致命的小瑕疵是 token 问题，但整体依然优秀

OpenAI 在 7 月 9 日发布的 GPT-5.6 Sol 同样是一款非常出色的模型。在 Artificial Analysis 的 Coding Agent Index 上，它以 80 分刷新了纪录。但发布后不久，「用量额度消耗速度快得离谱」的反馈就大量涌现。我自己也遇到过，实际深挖下去，确实能找到不少具体的线索。

- 在 Codex 仓库的 GitHub issue #32250 中，一位 Pro 订阅用户用 GPT-5.6 Sol Medium 执行了一个很短的任务，结果 5 小时额度的剩余量从 87% 直接掉到 76%，一次性就消耗了 11 个百分点。之后即使是不涉及任何工具调用的简单后续提问，每次也会再消耗约 1 个百分点。这个用户之前用的 GPT-5.5 xhigh 消耗速度都没有这么快。
- 在 issue #31860 中，有人确认 Codex 应用把 Sol 规格里的 1.05M token 上下文，直接截断到只用了 372K，也就是标称值的 35%。上下文一旦达到 90%，就会触发提前压缩（compaction），有人推测这种再处理过程可能进一步加速了 token 的消耗。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/2.png" alt="一次短任务就消耗掉11个百分点的用量额度">
  <figcaption>一次短任务就消耗掉11个百分点的用量额度</figcaption>
</figure>

最终 OpenAI 也承认「把最高算力设置做得太容易被启用了，却没有充分说明其影响」，并在 24 小时内两次重置了 rate limit。据 OpenAI 相关人员解释，5.6 Sol 的 Medium 档位和 5.5 的 Medium 档位并不是同一个量级，默认值其实是 Sol Low，xhigh 应该只用在真正棘手的问题上。换句话说，与其说是模型本身在每个 token 上效率低下，不如说这是「高算力设置被当成默认值使用」的 UX 问题，叠加了应用端的 bug。实际上 OpenAI 也表示，Sol 的 max reasoning 模式相比竞品模型，输出 token 减少了 54%。

虽然是个致命的小瑕疵，但模型本身依然非常出色。只要理解并正确设置，输出结果的准确度依旧是顶级水准。

## 现在没必要非死守 Claude 不可了

几个月前还有一种「写代码就该用 Claude」的氛围。现在我不这么觉得了。两个都太好用了。在 Terminal-Bench 2.1 上，Codex CLI 组合以 83.4% 排第一；在 SWE-bench Pro 上，则是 Fable 5 以 80.3% 领先。每个基准测试的第一名都不一样，已经进入这样一个时代了。

所以我的结论是，两个都用才是最好的。不过如果非要只选一个，我会选 Codex。因为我已经在频繁使用 ChatGPT 了，而且连图像生成都能靠同一份订阅解决。这不是单看编程智能体本身做的选择，而是从整个订阅的综合效用来看的结果。

## 最终大家或许都会两个一起用

这里我还想补充一个视角。最近各家模型的 token 用量在急剧增长。有分析指出，相比一般的聊天机器人用法，智能体式 AI 的 token 消耗量最多能达到 1000 倍，Forbes 和 TechCrunch 都把这种现象称为「Tokenpocalypse」，并报道称订阅额度比预期消耗得更快的用户正在急剧增加。实际上在社区里，大家额外订阅 Codex 最主要的原因就是「Claude 的额度消耗太快」。

如果我们已经进入了「一份订阅的额度不够用」的时代，那最终大家或许都会自然而然地走向同时使用两份订阅的形态。

## 两个智能体一起用，效果也更好

两个都用，并不只是为了解决额度问题。实际做 AI 编排就会发现，比起把两个相同的智能体拼在一起，让不同的智能体互相配合，效果反而更好。

这一点也有研究支持。X-MAS 研究（arXiv 2505.16997）指出，在多智能体系统中，如果按角色配置不同的 LLM，准确率相比同质组合可提升 8%~47%；另一项研究（arXiv 2602.03794）也得出结论：2 个多样化的智能体，效果能媲美甚至超过 16 个同质智能体。

在我的经验里，效果最好的组合是这样的：**让 Claude 干活，再让 Codex 检查它的成果。** 由又快又果断的资深工程师产出成果，再由谨慎细致的评审来把关。正因为两者性格不同，才能很好地互相补上对方的盲区。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/3.png" alt="Claude负责编写、Codex负责把关的协作模式">
  <figcaption>Claude负责编写、Codex负责把关的协作模式</figcaption>
</figure>

## 总结

- Claude 是又快又准的资深型风格，Codex 是慢但准的风格。社区的评价也是一致的。
- Fable 5 解决了 Claude 之前的遗憾（偶尔出错），GPT-5.6 Sol 尽管有 token 问题，整体依然非常出色。
- 现在没必要非死守 Claude 不可了。两个都是顶级水准，两个都用才是最好的。
- 如果只能选一个，我会选 Codex。因为算上 ChatGPT 和图像生成，整份订阅的综合效用更高。
- 从 token 消耗量暴增的趋势来看，最终大家或许都会走向两个一起用的形态。
- 编排的答案是异质组合。Claude 负责产出、Codex 负责把关，这个组合效果最好。

## 参考资料

- [GPT-5.6 Sol 用量急剧消耗问题（openai/codex #32250）](https://github.com/openai/codex/issues/32250)
- [Codex 应用的 Sol 上下文上限问题（openai/codex #31860）](https://github.com/openai/codex/issues/31860)
- [Claude Fable 5 & Mythos 5 基准测试分析（Vellum）](https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained)
- [Claude Code vs OpenAI Codex 对比（Composio）](https://composio.dev/content/claude-code-vs-openai-codex)
- [Codex vs Claude Code 对比（Builder.io）](https://www.builder.io/blog/codex-vs-claude-code)
- [X-MAS：异质 LLM 多智能体研究（arXiv 2505.16997）](https://arxiv.org/abs/2505.16997)
- [智能体多样性扩展研究（arXiv 2602.03794）](https://arxiv.org/abs/2602.03794)
- [AI token 消耗加速报道（Forbes，2026.4）](https://www.forbes.com/sites/ronschmelzer/2026/04/10/running-out-of-ai-tokens-faster-than-ever-heres-why/)
- [token 账单来袭的时代（TechCrunch，2026.6）](https://techcrunch.com/2026/06/05/the-token-bill-comes-due-inside-the-industry-scramble-to-manage-ais-runaway-costs/)
