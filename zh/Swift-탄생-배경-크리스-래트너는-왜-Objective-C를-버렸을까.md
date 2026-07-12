---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift诞生的背景：Chris Lattner 为什么要抛弃 Objective-C"
lang: zh
description: "开始做 iOS 开发的人大概都会好奇一次：“苹果明明有用得好好的 Objective-C，为什么非要另外造一个 Swift？”"
header:
  og_image: /assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png
tags:
  - Swift
  - 斯威夫特
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

开始做 iOS 开发的人大概都会好奇一次：“苹果明明有用得好好的 Objective-C，为什么非要另外造一个 Swift？”

我自己用 Swift 写第一个 App 的时候，就觉得语法特别干净利落，后来深入了解了一下背后的故事，发现还挺有意思的。

先说结论：Swift 是**Chris Lattner 这位工程师从 2010 年开始几乎独自秘密打造的一门语言**。目的是从根本上解决 Objective-C 三十多年来几乎原封不动、始终存在的安全性问题。

今天就来轻松聊聊 Swift 是怎么诞生的。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="用一张图整理了 Swift 取代三十年老将 Objective-C 的原因">
  <figcaption>用一张图整理了 Swift 取代三十年老将 Objective-C 的原因</figcaption>
</figure>

---

## Swift 是什么时候、由谁开发的？

Swift 的开发始于**2010 年 7 月**。

主角是 Chris Lattner。这个名字可能有点陌生，但其实只要是开发者，早就在每天使用他的作品了。

他正是**LLVM**和**Clang**编译器的作者——支撑苹果开发工具底层的核心技术。

据说最初真的只是 Lattner 一个人的项目。据说他下班后、周末抽空默默打磨设计的故事，如今已广为流传。

从 2011 年前后开始，苹果内部其他工程师陆续加入，项目才逐渐扩大成正式的团队项目。

最终在**2014 年 6 月的 WWDC**上正式向世人公开。据说在场的开发者们都大吃一惊——这在当时是完全没人预料到的发布。

同年 9 月，Swift 随 Xcode 6 一同正式发布，从此人人都能使用。

---

## Chris Lattner 为什么要取代 Objective-C？

最主要的原因只有一个。

> Objective-C 是在 1980 年代初设计的语言，缺乏现代化的安全机制。

Objective-C 简单说就是“在 C 语言基础上加了消息传递功能”的结构。它完整继承了 C 的灵活性，而这种灵活性同时也意味着危险。

最典型的例子就是**nil（空值）处理**问题。

在 Objective-C 中，即使给 nil 对象发送消息，App 也不会崩溃，只是什么都不会发生。

乍一看很方便，但这恰恰是个陷阱。因为值缺失而产生的 bug 会被悄悄掩盖，等到日后才在意想不到的地方爆发出来。

Lattner 在开发 LLVM 和 Clang 的过程中，早已长期与 Objective-C 的内存安全问题较劲。据说他最终得出了这样的结论：

“与其不断修补现有语言，不如干脆重新做一门语言，从一开始就杜绝犯错的可能。”

这已经不只是“帮你抓错误”，而是想让错误本身根本无法发生。

---

## Swift 到底带来了哪些改变？

Swift 带来的变化中，最具代表性的就是**可选值（Optional）**这个概念。

它在语法层面强制标明“这个值有可能是空的”，让开发者必须处理值缺失的情况。

看看下面的代码，两种语言的设计理念差异一目了然。

先看 Objective-C，遇到 nil 也照样往下走。

```objc
// 如果 name 是 nil？什么都不会发生，悄悄地就过去了
NSString *name = [user fetchName];
NSUInteger len = [name length];  // 结果是 0，很容易漏掉 bug
```

而 Swift 会直接把“值可能不存在”这件事摆在开发者面前，逼你正视。

```swift
// name 是 String? 类型 —— 类型本身就表明它可能没有值
let name: String? = user.fetchName()
if let name = name {   // 只有确实有值时才安全使用
    print(name.count)
}
```

代码虽短，但“放任错误 vs. 阻止错误”的差异一览无遗。

除此之外，Swift 还兼顾了类型推断、简洁的语法和更快的执行速度，因此人气不断攀升。顺带一提，Swift 的设计不仅参考了 Objective-C，还借鉴了 Rust、Haskell、Python、Ruby 等多种语言的优点。

---

## Swift 之后怎么样了？

Swift 公布之后迅速站稳了脚跟。

简单梳理一下主要节点：

| 时间 | 事件 |
|------|------|
| 2010 年 7 月 | Chris Lattner 开始开发 |
| 2014 年 6 月 | 在 WWDC 上正式公布 |
| 2014 年 9 月 | 随 Xcode 6 正式发布 |
| 2015 年 12 月 | 开源发布（Apache 2.0） |
| 2017 年 1 月 | Lattner 离开苹果，跳槽特斯拉 |

有意思的是，作为语言之父的 Lattner 本人却在 2017 年离开了苹果。此后 Swift 项目的主导权由 Ted Kremenek 接手。

即便如此，Swift 至今依然牢牢占据着苹果生态系统核心语言的地位。随着开源，它的应用范围也扩展到了 Linux 和服务器端。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="Lattner 离开之后，Swift 依然在不断成长">
  <figcaption>Lattner 离开之后，Swift 依然在不断成长</figcaption>
</figure>

---

一个工程师在周末默默启动的项目，十几年后竟成了全世界开发者都在用的语言——这一点让我印象特别深刻。

因为它是从“为什么？”这一个问题出发的语言，了解了背景之后，再看 Swift 的每一处语法都会有不一样的感觉。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="了解了背景之后再看，一行代码都会读出不一样的味道">
  <figcaption>了解了背景之后再看，一行代码都会读出不一样的味道</figcaption>
</figure>

如果你刚开始学 Swift，只要真正理解了“可选值”这一个概念，大概就能体会到这门语言为什么会被设计成这样。希望今天这篇文章能成为你迈出的第一步。

---

## 参考资料

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_%28programming_language%29)
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)
