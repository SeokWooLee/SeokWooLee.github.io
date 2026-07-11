---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift诞生背后的故事：Chris Lattner为什么要抛弃Objective-C"
lang: zh
description: "只要开始做iOS开发，几乎每个人都会好奇一次：\"苹果明明用得好好的Objective-C，为什么非要另起炉灶做Swift？\""
header:
  og_image: /assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png
tags:
  - Swift
  - Swift教程
  - ChrisLattner
  - ObjectiveC
  - iOS开发
  - 编程语言
  - 苹果开发
  - Swift诞生背景
  - 可选值Optional
  - 编程学习
permalink: /zh/Swift-탄생-배경-크리스-래트너는-왜-Objective-C를-버렸을까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [English](/en/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [日本語](/ja/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · **中文**
{: .notice--info}

只要开始做iOS开发，几乎每个人都会好奇一次："苹果明明用得好好的Objective-C，为什么非要另起炉灶做Swift？"

我自己也是在用Swift写第一个App的时候，觉得语法特别干净利落，后来深挖了一下背后的故事，发现还挺有意思的。

先说结论：Swift是**由一位叫Chris Lattner的工程师，从2010年开始几乎一个人秘密开发出来的语言**。目的是从根本上解决Objective-C三十多年来几乎原地踏步的安全性问题。

今天就来轻松聊聊Swift到底是怎么诞生的。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="Swift为什么能取代用了三十年的Objective-C，用一张图梳理了一下">
  <figcaption>Swift为什么能取代用了三十年的Objective-C，用一张图梳理了一下</figcaption>
</figure>

---

## Swift是什么时候、由谁开发的？

Swift的开发始于**2010年7月**。

主角是Chris Lattner。这个名字听起来可能有点陌生，但其实只要是开发者，早就每天都在用他的作品了。

他正是**LLVM**和**Clang**编译器的创建者——这些都是支撑苹果开发工具底层的核心技术。

据说最初这纯粹是Lattner一个人的项目。他下班后、周末抽空默默打磨设计方案的故事，如今已经广为流传。

从2011年前后开始，苹果内部其他工程师陆续加入，项目才正式发展成一个团队项目。

最终，Swift在**2014年6月的WWDC**上正式亮相。据说当时在场的开发者都大吃一惊，这个反应至今仍被人津津乐道——因为完全没人料到会有这样的发布。

同年9月，Swift随Xcode 6正式发布，任何人都可以使用了。

---

## Chris Lattner为什么要取代Objective-C？

最主要的原因只有一个。

> Objective-C是在1980年代初设计的语言，缺乏现代化的安全保障机制。

简单来说，Objective-C的结构就是"在C语言基础上加了消息传递功能"。它完整继承了C语言的灵活性，而这种灵活性本身也是一种危险。

最典型的例子就是**nil（空值）处理**问题。

在Objective-C里，即使给nil对象发送消息，App也不会崩溃，只是什么都不会发生。

乍看之下很方便，但这恰恰是个陷阱：因为值缺失而产生的bug会被悄无声息地掩盖掉，等到日后在莫名其妙的地方才会爆发出来。

Lattner在开发LLVM和Clang的过程中，长期与Objective-C的内存安全性问题较劲，最终得出了这样的结论：

"与其一直给现有语言打补丁，不如干脆重新设计一门从一开始就不允许犯错的语言。"

这已经不只是帮你捕捉错误了，而是要从根本上让错误本身不可能发生。

---

## Swift到底带来了哪些改变？

Swift带来的变化中，最具代表性的就是**可选值（Optional）**概念。

它把"这个值有可能为空"这件事，在语法层面就强制标注出来，逼着开发者必须去处理值可能为空的情况。

看看下面这段代码，两种语言的设计哲学差异一目了然。

先看Objective-C，即使是nil也能照样跑下去：

```objc
// 如果name是nil会怎样？什么都不会发生，静悄悄地就过去了
NSString *name = [user fetchName];
NSUInteger len = [name length];  // 结果是0，很容易漏掉bug
```

而Swift则会直接把"值可能不存在"这件事摆在开发者面前：

```swift
// name是String?类型 —— 类型本身就表明这个值可能不存在
let name: String? = user.fetchName()
if let name = name {   // 只有在值存在时才安全地使用
    print(name.count)
}
```

虽然代码不长，但"放任错误"和"阻止错误"之间的区别一览无余。

除此之外，Swift还兼顾了类型推断、简洁的语法以及快速的运行速度，因此广受欢迎。顺带一提，Swift的设计不仅参考了Objective-C，还借鉴了Rust、Haskell、Python、Ruby等多种语言的优点。

---

## Swift之后又经历了怎样的发展？

Swift发布之后迅速站稳了脚跟。

简单梳理一下主要节点：

| 时间 | 事件 |
|------|------|
| 2010年7月 | Chris Lattner开始开发 |
| 2014年6月 | 在WWDC上正式发布 |
| 2014年9月 | 随Xcode 6正式对外发布 |
| 2015年12月 | 开源（Apache 2.0协议） |
| 2017年1月 | Lattner离开苹果，加入特斯拉 |

有意思的是，作为这门语言的"亲生父亲"，Lattner本人却在2017年离开了苹果。此后Swift项目的负责人由Ted Kremenek接手。

尽管如此，Swift至今依然稳稳占据着苹果生态系统核心语言的地位，开源之后应用范围也扩展到了Linux和服务器端。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="Lattner离开之后，Swift依然在不断成长">
  <figcaption>Lattner离开之后，Swift依然在不断成长</figcaption>
</figure>

---

一个工程师在周末悄悄开始的项目，十几年后竟成了全世界开发者都在用的语言，这一点让我印象深刻。

正因为这门语言是从一个"为什么"的疑问出发的，了解了背景之后，再看Swift的每一处语法都会有不一样的感受。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="了解了背景之后再看，同一行代码读起来感觉都不一样了">
  <figcaption>了解了背景之后再看，同一行代码读起来感觉都不一样了</figcaption>
</figure>

如果你刚开始学Swift，光是把"可选值"这一个概念真正搞懂，大概就能体会到这门语言为什么会被设计成这样。希望今天这篇文章能成为你迈出的第一步。

---

## 参考资料

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_(programming_language))
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)
