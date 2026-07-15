---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "macOS 终端应用 6 款横评，iTerm2、Ghostty、Warp 到底该用哪个"
lang: zh
description: "如果你是用 Mac 的开发者，一天里开得最久的应用，大概就是终端了吧。不过令人意外的是，很多人几年下来一直只用系统自带的终端。"
header:
  og_image: /assets/images/posts/0061ee63-be63-4d68-9110-d28fa0f5e067/1.png
tags:
  - Mac终端
  - iTerm2
  - Ghostty
  - Warp
  - Alacritty
  - Kitty
  - 开发者工具
  - macOS
  - 终端推荐
  - 开发环境
permalink: /zh/macOS-터미널-앱-6종-비교-iTerm2GhosttyWarp-뭘-써야-할까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/macOS-%ED%84%B0%EB%AF%B8%EB%84%90-%EC%95%B1-6%EC%A2%85-%EB%B9%84%EA%B5%90-iTerm2GhosttyWarp-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C/) · [English](/en/macOS-%ED%84%B0%EB%AF%B8%EB%84%90-%EC%95%B1-6%EC%A2%85-%EB%B9%84%EA%B5%90-iTerm2GhosttyWarp-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C/) · [日本語](/ja/macOS-%ED%84%B0%EB%AF%B8%EB%84%90-%EC%95%B1-6%EC%A2%85-%EB%B9%84%EA%B5%90-iTerm2GhosttyWarp-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C/) · **中文**
{: .notice--info}

如果你是用 Mac 的开发者，一天里开得最久的应用，大概就是终端了吧。不过令人意外的是，很多人几年下来一直只用系统自带的终端。

我自己是从系统自带的 Terminal.app 换到了 iTerm2，最近则定居在 Ghostty。这中间 Warp、Alacritty、Kitty 也都各自尝试过一轮。

先说结论。

> 对大多数开发者来说，iTerm2 或 Ghostty 就够用了。想体验 AI 功能就选 Warp，想以 tmux 为核心走极简路线就选 Alacritty。

这篇文章会梳理 macOS 上六款代表性终端应用的性格差异，以及"我该选哪个"这个问题，基于我自己的实际使用经验给出判断标准。

<figure>
  <img src="/assets/images/posts/0061ee63-be63-4d68-9110-d28fa0f5e067/1.png" alt="macOS 六大代表性终端，从理念上就各不相同">
  <figcaption>macOS 六大代表性终端，从理念上就各不相同</figcaption>
</figure>

---

## 六款终端，性格各不相同

可能有人觉得终端应用都差不多，但真正用起来会发现它们的取向差别不小。

**Terminal.app** 是 macOS 自带的那款终端。

无需安装，轻量且稳定，但功能也仅止于必要程度。

**iTerm2** 是 Mac 终端领域的老牌强者。

分屏、强大的搜索、tmux 集成、触发器（trigger）等功能多到超乎想象。虽是免费开源软件，完成度却不输商业应用。

**Warp** 是用 Rust 打造的新一代终端。

命令与输出以"块"（block）为单位组织，还可以用自然语言向 AI 询问命令。与其说是终端，不如说更像是一款"长得像终端的生产力应用"。

**Ghostty** 是由 HashiCorp 创始人 Mitchell Hashimoto 打造、于 2024 年底发布 1.0 版本的终端。

用 Zig 编写，在 macOS 上采用原生 UI（SwiftUI/AppKit），既快速又有 Mac 应用该有的质感。

**Alacritty** 是标榜"最快终端"的极简主义代表。

把所有资源都押在 GPU 加速上，代价是既没有标签页也没有分屏功能。它的理念就是让你搭配 tmux 使用。

**Kitty** 和 Alacritty 一样基于 GPU 加速，但功能丰富得多。

它自创了一套在终端里显示图片的协议，还有名为 kittens 的扩展系统。

---

## 一表看懂对比

| 终端 | 价格 | GPU 加速 | 标签/分屏 | 特点 |
|--------|------|----------|---------|------|
| Terminal.app | 系统自带 | 有限 | 仅标签页 | 无需安装，最轻量 |
| iTerm2 | 免费 | 支持 | 全支持 | 功能最全，tmux 集成 |
| Warp | 免费+付费 | 支持 | 全支持 | 内置 AI，块状 UI |
| Ghostty | 免费 | Metal | 全支持 | 原生 UI，速度快 |
| Alacritty | 免费 | 支持 | 无 | 极致极简 |
| Kitty | 免费 | 支持 | 全支持 | 图片显示，可扩展 |

表格上看起来都差不多，但实际使用体验其实相当不同。

---

## 速度差异，真的能感觉出来吗？

老实说，在日常使用场景下，速度差异很难察觉。

就敲个 ls、看看 git status 这种程度，Terminal.app 也完全不会让人觉得卡顿。

差异出现在大量输出的场景里。比如刷出几万行日志、或者构建输出像瀑布一样倾泻而下时，带 GPU 加速的终端（Ghostty、Alacritty、Kitty）不会掉帧，画面能顺畅跟上。

相反，Warp 因为功能多，内存占用也相对较高。如果是配置较低的 Mac，这一点需要留意。

<figure>
  <img src="/assets/images/posts/0061ee63-be63-4d68-9110-d28fa0f5e067/2.png" alt="有没有 GPU 加速，在大量输出时体验差别很大">
  <figcaption>有没有 GPU 加速，在大量输出时体验差别很大</figcaption>
</figure>

---

## Warp 的 AI，好用吗？

Warp 最大的卖点就是 AI。

哪怕你用中文打"帮我杀掉占用 3000 端口的进程"，它也能转换成命令，出错时还能帮你分析原因。命令记不清的时候确实很方便。

不过有两点想说明一下。

第一，AI 请求次数有限制，用得多就需要付费套餐。

第二，现在很多人已经习惯在终端里直接跑 Claude Code 这类 AI 编程工具，终端自带的 AI 也就没有以前那么关键了。我自己最后还是回到了"终端就该又快又安静"这个立场。

---

## 那到底该用哪个？

按场景来梳理一下。

**偶尔才用终端 → Terminal.app**

没必要特意换。系统自带的就够用了。

**喜欢功能多、想要经过验证的选择 → iTerm2**

打磨了十多年的稳定性和功能依然是最强的。对第一次想换终端的人来说，是最保险的选择。

**想借助 AI 学习使用终端 → Warp**

对不熟悉命令的初级开发者尤其友好。

**想要一个快速、干净的新一代终端 → Ghostty**

这也是我最终定居于此的原因，几行配置就能搞定的简洁感和原生质感很有吸引力。

**以 tmux 为中心走极简路线 → Alacritty 或 Kitty**

如果你的理念是"终端只是渲染器，其余全交给 tmux"，这两款就是正确答案。

---

## 写在最后

终端是开发者一整天都要盯着的工具，值得花点时间认真挑选一次。

好在除了 Warp 的付费套餐之外，其他都是免费的，可以毫无负担地一个个装来试试，选出最顺手的那款。

顺便预告一下：最近专门为并行跑多个 Claude Code 之类 AI 代理而设计的新一代终端（比如 cmux、Orca 等）正在快速崛起。这类产品的定位和上面几款差别挺大，我打算单独写一篇来介绍。

你们现在用的是哪款终端？欢迎在评论区分享一下推荐理由。
