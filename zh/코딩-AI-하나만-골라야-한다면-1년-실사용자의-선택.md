---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "如果只能选一个编程AI？一年实际使用者的选择"
lang: zh
description: "最近在开发者社区里最常见的问题之一就是「Claude Code和Codex到底该用哪个？」。我自己Claude用了将近1年，Codex也付费使用超过6个月了，最近推出的Claude Fable 5和GPT-5.6…"
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

# 用了1年Claude、6个月Codex的开发者的结论

最近在开发者社区里最常见的问题之一就是「Claude Code和Codex到底该用哪个？」。我自己Claude用了将近1年，Codex也付费使用超过6个月了，最近推出的Claude Fable 5和GPT-5.6 Sol也都体验过。其实在固定使用这两款之前，我还用过Cursor和Kiro。Cursor一开始真的很不错，但因为Claude实在太好用了，就自然而然转过去了；Kiro也是个不错的工具，但毕竟是小众产品，Skill、插件之类的生态还不够完善，而且最后在Kiro里用的其实也是Claude的模型，所以没必要非得绕这一圈。所以这篇文章，我想结合自己的实际感受，再整理一些社区问卷、基准测试、GitHub issue等客观资料，跟大家分享一下。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png" alt="2026年编程AI双雄，Claude与Codex对比">
  <figcaption>2026年编程AI双雄，Claude与Codex对比</figcaption>
</figure>

## 我感受到的两个智能体的性格差异

一句话概括就是：**Claude给人的感觉像是全能型的资深开发者，Codex则是话不多但很靠谱的同事。**

Claude Code相对又快又准。它把握代码库的直觉和读懂上下文的能力都很强，就算指令下得比较模糊，也能很好地抓住意图。不过它偶尔也会出错，就是那种自信满满地往前冲、结果漏掉了某个细节的资深工程师风格。而且因为用的人多，Skill、插件这类周边生态也很丰富，这一点优势不容忽视——只要搜索需要的工作流，通常都能找到别人已经做好的。

Codex写代码不像Claude那样又快又痛快。但它更准确，经过长时间推敲后给出的结果漏洞更少。

有意思的是，这并不只是我个人的感受。在一项超过500人参与的Reddit问卷调查中，日常使用有65%的人更偏好Codex，但在盲测代码评审中，却有67%的人认为Claude写的代码更整洁。海外社区里也常能看到「Claude更擅长精细编辑，Codex更擅长大范围重构」「Codex虽然慢，但在复杂任务上更彻底」这样的评价，跟我的体感几乎一致。

## Claude Fable 5：之前的不足几乎都被解决了

2026年6月发布的Claude Fable 5，个人真的很满意。之前Claude的短板——也就是「快是快，但偶尔会出错」这一点，已经基本解决了。

数据也能佐证这一点。Fable 5在SWE-bench Verified上拿到95%，在SWE-bench Pro上拿到80.3%。此前最顶尖的Opus 4.8在SWE-bench Pro上的分数是69.2%，也就是说提升了超过11个百分点。在难度更高的FrontierCode Diamond上，Fable 5拿到29.3%，是Opus（13.4%）的两倍多。Stripe方面透露，他们用Fable 5一天之内就完成了一个5000万行Ruby代码库的迁移，若靠人工完成至少要2个月以上。当然，这些基准测试都是基于Anthropic自家的脚手架，并非中立的测试环境，也有人对此提出批评，所以比起具体数值，更应该把它看作一种趋势。

## GPT-5.6 Sol：致命的token问题，但依然出色

OpenAI在7月9日发布的GPT-5.6 Sol同样是一款非常出色的模型。它在Artificial Analysis的Coding Agent Index上拿到80分，创下新纪录。但发布后不久，就陆续有用户反映「用量额度消耗得快到离谱」。我自己也遇到过，实际深挖下去，确实有不少具体的证据。

- 在Codex仓库的GitHub issue #32250中，有位Pro订阅用户用GPT-5.6 Sol Medium做了一个很短的任务，结果5小时额度余量一下从87%掉到76%，一次性蒸发了11个百分点。之后即使是不涉及任何工具调用的琐碎追问，每次也会消耗约1个百分点。这个用户消耗额度的速度，甚至比之前用GPT-5.5 xhigh时还要快。
- 在issue #31860中确认了一个问题：Codex应用把Sol标称的1.05M token上下文，实际只用到了372K，仅为规格的35%。当上下文用量达到90%时会触发提前压缩（compaction），这个重新处理的过程也可能进一步加剧了token消耗。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/2.png" alt="一次短任务就消耗掉11%的额度">
  <figcaption>一次短任务就消耗掉11%的额度</figcaption>
</figure>

最终OpenAI也承认「把最高算力档位设得太容易触发，却没有把影响讲清楚」，并在24小时内两次重置了用量限制。据OpenAI相关人员解释，5.6 Sol的Medium档位和5.5的Medium并不是同一等级，默认档位其实是Sol Low，xhigh只应该用在真正棘手的问题上。也就是说，与其说模型本身在每个token上效率低下，不如说这是「高算力档位被当作默认设置来用」的UX问题叠加应用端bug所致。事实上OpenAI方面主张，Sol在max reasoning模式下的输出token相比竞品模型减少了54%。

虽然这是个致命的瑕疵，但模型本身依然非常出色。只要理解清楚各档位的设置再去用，结果的准确度仍然是顶级水平。

## 现在没必要非得死守Claude不可

几个月前，「写代码就是要用Claude」的氛围还很浓。但现在我不这么认为了，两者都相当出色。在Terminal-Bench 2.1上，Codex CLI组合以83.4%拿下第一；而在SWE-bench Pro上，Fable 5以80.3%领先。现在是每个基准测试冠军都不一样的时代了。

所以我的结论是：两个都用才是最好的选择。不过如果非要只选一个的话，我会选Codex。因为我本来就经常用ChatGPT，而且图像生成这类功能也能通过同一个订阅解决。这不是单纯只看编程智能体本身来做选择，而是从整体订阅的效用角度来考虑的。

## 最终大家或许都会两个都用

这里我还想补充一个视角：最近各模型的token使用量正在急剧增长。有分析指出，智能体式AI（Agentic AI）相比一般的聊天机器人使用，token消耗量最多可达1000倍；Forbes和TechCrunch把这种现象称为「Tokenpocalypse（token末日）」，报道称订阅额度比预期更快耗尽的用户正在急剧增加。实际上，在社区里，大家额外付费订阅Codex最主要的原因就是「Claude的额度消耗太快了」。

如果一个订阅的额度已经不够用了，那最终大概所有人都会自然而然地走向同时使用两个订阅的模式吧。

## 两个智能体一起用，效果也更好

两个都用并不只是为了解决额度问题。实际做过AI编排（orchestration）就会发现，比起把两个相同的智能体接在一起，让不同的智能体互相协作，效果反而更好。

这一点也有研究支持。X-MAS研究（arXiv 2505.16997）指出，在多智能体系统中，如果按角色配置不同的LLM，准确率相比同质组合能提升8~47%；另一项研究（arXiv 2602.03794）则显示，2个多样化的智能体组合，效果可以媲美甚至超过16个同质智能体的组合。

就我个人经验来说，效果最好的组合是这样的：**让Claude去干活，让Codex来检查它的成果。** 这是一种由又快又果断的资深工程师产出成果、再由谨慎细致的审核者来把关的结构。正因为两者性格不同，才能很好地互相补上对方的盲区。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/3.png" alt="Claude负责编写，Codex负责审核的协作结构">
  <figcaption>Claude负责编写，Codex负责审核的协作结构</figcaption>
</figure>

## 总结

- Claude是又快又准的资深工程师风格，Codex是慢但精准的风格，社区的评价也是如此。
- Fable 5解决了Claude原本的不足（偶尔出错），GPT-5.6 Sol尽管有token问题，但依然非常出色。
- 现在没必要非得死守Claude不可。两者都是顶级水平，两个都用才是最好的选择。
- 如果非要只选一个，我会选Codex，因为订阅本身就包含了ChatGPT和图像生成的效用。
- 看token消耗量暴增的趋势，最终大概所有人都会走向两个都用的模式吧。
- 编排（orchestration）的答案是异构组合。由Claude来做、Codex来审核的组合效果最好。

参考资料：openai/codex GitHub issue #32250、#31860，Vellum基准测试分析，Composio、Builder.io、MindStudio对比评测，arXiv 2505.16997（X-MAS）、2602.03794，Forbes（2026年4月）、TechCrunch（2026年6月）关于token成本的报道。
