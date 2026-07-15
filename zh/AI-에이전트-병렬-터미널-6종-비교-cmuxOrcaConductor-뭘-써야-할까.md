---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "AI 智能体并行终端 6 款横评,cmux、Orca、Conductor 到底该选哪个"
lang: zh
description: "上次对比 macOS 六款终端时,我曾预告过\"AI 智能体时代的终端会另外写一篇介绍\",今天这篇就是后续篇。"
header:
  og_image: /assets/images/posts/04324d6d-3911-4cb4-9fd9-b427587c8da7/1.png
tags:
  - AI智能体
  - cmux
  - Orca
  - Conductor
  - ClaudeCode
  - git worktree
  - 并行智能体
  - 开发者工具
  - 终端推荐
  - 开发环境
permalink: /zh/AI-에이전트-병렬-터미널-6종-비교-cmuxOrcaConductor-뭘-써야-할까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%B3%91%EB%A0%AC-%ED%84%B0%EB%AF%B8%EB%84%90-6%EC%A2%85-%EB%B9%84%EA%B5%90-cmuxOrcaConductor-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C/) · [日本語](/ja/AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%B3%91%EB%A0%AC-%ED%84%B0%EB%AF%B8%EB%84%90-6%EC%A2%85-%EB%B9%84%EA%B5%90-cmuxOrcaConductor-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C/) · **中文**
{: .notice--info}

上次对比 macOS 六款终端时,我曾预告过"AI 智能体时代的终端会另外写一篇介绍",今天这篇就是后续篇。

写上一篇的时候,挑选终端的标准还是速度、功能、做工这类东西。可没过半年,整个局面就完全变了。随着在终端里跑 Claude Code、Codex 这类编程智能体成了日常操作,"能同时并行跑多少个智能体、跑起来有多顺手"如今已经成了选终端的核心标准。

先说结论。

> 我从 Ghostty 经由 cmux,最终转到了 Orca。光是 cmux 的纵向标签页和通知功能,就已经让并行作业顺畅了不少,但从头到尾都是为多智能体并行工作流设计的 Orca,最终还是成了我的落脚点。不过看个人偏好,cmux、Conductor、Claude Squad 也都是相当不错的选择。

这篇文章会以 2026 年 7 月为节点,对比并行智能体时代的 6 款终端/编排工具,并整理一下我为什么最终定居在 Orca。

<figure>
  <img src="/assets/images/posts/04324d6d-3911-4cb4-9fd9-b427587c8da7/1.png" alt="同时指挥多个 AI 智能体并行工作的开发流程">
  <figcaption>同时指挥多个 AI 智能体并行工作的开发流程</figcaption>
</figure>

---

## 为什么需要"并行智能体"终端?

用过编程智能体的人很快就会发现一件事:智能体干活的时候,人在等。

一个智能体重构代码要花 5 分钟、10 分钟,开发者只能干瞪着屏幕。于是自然而然就有了"反正在等,不如让另一个智能体去干别的活"这个想法,这就是并行智能体工作流的由来。

问题是,想在普通终端里做到这件事,阻碍还真不少。

第一,如果两个智能体在同一个仓库里同时改文件,就会互相覆盖对方的工作。所以得用 git worktree 把工作空间隔离开,但创建分支、挂载 worktree、安装依赖这些流程,每次都得手动来一遍。

第二,要是 5 个标签页里塞了 5 个智能体,根本没法知道哪个跑完了、哪个在等待批准,只能一个个点开标签页去确认。

今天要介绍的这些工具,全都是为了解决这两个问题而生的。

---

## 六款工具,思路各不相同

**cmux** 是 Manaflow(YC S24)打造的 macOS 原生终端。

它把 Ghostty 的渲染引擎(libghostty)当作库引入,用 Swift 和 AppKit 写成。纵向标签侧边栏里,每个标签的 git 分支、PR 编号与状态、工作目录、正在使用的端口、通知徽标一目了然。智能体一跑完,通知环就会亮起来,可以做到睡前给 10 个智能体分派任务,早上只看有徽标的标签页这种用法。它是 GPL 开源项目,GitHub star 已经过 2 万。目前最大的限制是只支持 macOS。

**Orca** 是 stably.ai 打造的开源 ADE(Agent Development Environment,智能体开发环境)。

与其说是终端,不如说更接近"智能体舰队管理工具"。注册项目后,它会自动完成 worktree 的创建、隔离与清理,可以让 Claude Code、Codex、OpenCode、Pi 等 25 种以上的智能体各自在自己的 worktree 里运行。里面还内置了 WebGL 终端、基于 VS Code 的编辑器,以及每个 worktree 专属的内置浏览器。还有 iOS、Android 应用,出门在外也能查看智能体状态、继续下达指令。它是 MIT 许可,同时支持 macOS、Windows、Linux。

**Conductor** 是 Melty Labs(YC S24)打造的免费 Mac 应用。

它专注于让 Claude Code、Codex、Cursor 各自在隔离的 worktree 里运行,再由人来审核变更并合并的流程。一些细节做得很到位:创建 worktree 时只复制 git 追踪的文件,避免 node_modules 重复;有自动快照生成的检查点可以回滚;还有把同一个提示词同时发给 Claude 和 Codex 进行对比的多模型模式。订阅直接用自己原有的账号就行。

**Claude Squad** 是为不想离开终端的人准备的 TUI。

它在内部把 tmux 和 git worktree 组合起来,每个槽位跑不同的智能体(Claude Code、Codex、OpenCode、Aider 等),在同一个屏幕里来回切换。如果想不靠 GUI、纯用键盘管理并行智能体,这个就是答案。

**Vibe Kanban** 走的是"智能体看板"这个独特路线。

把卡片拖到 In Progress,智能体就会在自己的分支上接手那项任务。不过开发方 Bloop 已在 2026 年 4 月停止了这个项目,现在由社区以开源形式维护。要引入的话,这一点得考虑进去。

**Warp** 在上一篇里是以"内置 AI 的终端"介绍的,但这段时间公司方向完全变了。

现在它自称是 ADE 而非终端,源码也已开放(MIT、AGPL 双许可)。从 2026 年 4 月起,它把 Claude Code、Codex、Gemini CLI、OpenCode 当作一等公民集成进来,而不是普通的 shell 进程,每个智能体都带状态徽标的纵向标签页。还有一个叫 Oz 的云端编排器,可以跑远程智能体。

<figure>
  <img src="/assets/images/posts/04324d6d-3911-4cb4-9fd9-b427587c8da7/2.png" alt="并行智能体工具六款一览">
  <figcaption>并行智能体工具六款一览</figcaption>
</figure>

---

## 一览对比表

| 工具 | 形态 | 许可 | 平台 | 移动端 | 特点 |
|------|------|----------|--------|--------|------|
| cmux | 原生终端 | GPL 开源 | macOS | iOS 测试版(付费早鸟) | libghostty,纵向标签+通知 |
| Orca | ADE | MIT 开源 | macOS·Win·Linux | iOS·Android 免费 | worktree 自动化,编排功能 |
| Conductor | Mac 应用 | 免费(闭源) | macOS | 无 | 检查点,多模型 |
| Claude Squad | TUI | 开源 | 跨平台 | 无 | tmux+worktree,键盘优先 |
| Vibe Kanban | 看板 | Apache | 跨平台 | 无 | 任务导向,社区维护 |
| Warp | ADE | MIT·AGPL | macOS·Win·Linux | 经由云端 | Oz 云端智能体 |

这些工具全都是"自带订阅(BYO)"模式,工具本身几乎不需要额外花钱。

---

## 我为什么转到了 Orca

上一篇说过我落脚在了 Ghostty,后来先转到了 cmux,最终定居在 Orca。cmux 保留了 Ghostty 的渲染质感,又加上了纵向标签和通知功能,作为并行作业的入门再合适不过。不过用着用着就发现,从 worktree 管理到移动端查看,自己需要的是一个能把整个并行智能体工作流整体接住的工具,这就是我转向 Orca 的原因。

**不需要再操心 worktree。**

注册项目后,连既有的 worktree 都会自动识别,开始新任务时只要给个名字,从创建分支到执行安装脚本全都自动完成。"管理 worktree"这件事从脑子里消失,比想象中带来的轻松要大得多。

**移动应用在实战中真的好用。**

智能体跑完会推送到手机上,可以当场查看 diff、发出后续指令。下班路上留几句审阅意见,到家的时候改动往往已经反映完了。iOS 版在 App Store 免费下载,Android 版以 APK 形式分发。

**可以让智能体之间协作。**

CLI 内置了编排功能,可以创建任务分配给智能体,让智能体之间互相传递消息,并在需要人工批准的节点设置关卡。还有定时执行(automations)功能,"每天早上检查依赖更新"这类重复性工作可以直接交给智能体。

**给智能体更多的"手脚"。**

每个 worktree 都配有内置浏览器,智能体可以直接查看前端改动效果,点击 UI 元素就能把该元素的 HTML、CSS、截图带入提示词。基于 macOS 无障碍 API 的电脑操作(computer use)、iOS 模拟器操控,也都通过 CLI 打通了。对做 App 开发的人来说,这一点尤其令人满意。

**diff 审阅和订阅管理也都能在里面搞定。**

可以在 diff 的某一行加 Markdown 评论、汇总后回传给智能体的审阅流程;也可以注册多个 Claude、Codex 账号并切换使用,追踪用量和额度上限。

当然它不是万能的。如果想要 cmux 那种原生应用特有的轻盈感,基于 Electron 的 Orca 可能会显得偏重,功能多也意味着上手要花点时间。

<figure>
  <img src="/assets/images/posts/04324d6d-3911-4cb4-9fd9-b427587c8da7/3.png" alt="桌面端 worktree 与移动应用无缝衔接的 Orca 工作流">
  <figcaption>桌面端 worktree 与移动应用无缝衔接的 Orca 工作流</figcaption>
</figure>

---

## 那么到底该用哪个?

按情况整理一下。

**想要 macOS 上轻量快速的原生体验 → cmux**

如果想保留终端本身的操作质感,只是想在上面加个并行智能体功能,这个最合适。原样继承 Ghostty 的设置,对上一篇的读者来说也很有吸引力。我在转到 Orca 之前也用了一段时间 cmux,作为从 Ghostty 迈出的第一步,再合适不过了。

**想要从 worktree 到移动端都一体化的环境 → Orca**

如果打算把并行智能体作业不当成"偶尔的实验",而是当成"默认的工作方式",这个完成度最高。也是我最终落脚于此的原因。

**想要审阅、合并流程干净利落的 Mac 应用 → Conductor**

如果重心放在"人工仔细审阅智能体产出再合并"这个流程上,是个不错的选择。

**想完全不用 GUI、留在终端里搞定一切 → Claude Squad**

适合熟悉 tmux、习惯以键盘为中心工作的人。

**想按任务单位来管理工作 → Vibe Kanban**

如果看板式思维已经刻进了习惯里,值得一试,但要记得它现在是社区维护模式。

**想在云端跑智能体 → Warp**

如果计划把作业从本地机器扩展到远程、后台智能体,拥有 Oz 的 Warp 走在前面。

---

## 写在最后

上一篇里我说过"终端最重要的是快和安静",半年后不得不承认,这个标准已经变了。随着智能体成为开发工作流的中心,终端正在从一个"画文字的应用"进化成指挥智能体舰队的"指挥塔"。

好在今天介绍的这些工具全都是免费或开源的,大可以放心地一个个装来试试,挑出适合自己工作流的那款。

大家都把智能体并行跑到过几个?欢迎在评论区分享你在用的工具。
