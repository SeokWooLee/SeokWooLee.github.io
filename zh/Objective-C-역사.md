---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C历史全解析，乔布斯钟爱的语言故事（连NS前缀的由来都讲清楚）"
lang: zh
description: "开始学习iOS开发，总会遇到一门绕不过去的语言。方括号一大堆的陌生语法，还有NSString这种莫名其妙的前缀。"
header:
  og_image: /assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png
categories:
  - iOS
tags:
  - ObjectiveC
  - Objective-C语言
  - 编程语言
  - iOS开发
  - 苹果
  - Swift
  - 史蒂夫·乔布斯
  - NS前缀
  - 编程学习
  - 编程语言历史
permalink: /zh/Objective-C-역사/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EC%97%AD%EC%82%AC/) · [English](/en/Objective-C-%EC%97%AD%EC%82%AC/) · [日本語](/ja/Objective-C-%EC%97%AD%EC%82%AC/) · **中文**
{: .notice--info}

开始学习iOS开发，总会遇到一门绕不过去的语言。方括号一大堆的陌生语法，还有`NSString`这种莫名其妙的前缀。

没错，就是Objective-C。

我第一次在遗留代码里碰到这门语言时，也是一脸懵：“这语法到底是从哪儿来的？”不过了解了它的历史之后，再看代码的感觉就完全不一样了。

先说结论：Objective-C是20世纪80年代初，在C语言基础上加入Smalltalk的对象概念而诞生的语言。

而那个著名的NS前缀，来自史蒂夫·乔布斯创办的公司NeXT旗下的操作系统NeXTSTEP。

这篇文章能帮你了解到：

1. Objective-C的诞生背景（C + Smalltalk）
2. NS前缀的由来及技术原因
3. 随iPhone一起到来的全盛期
4. 为什么在Swift时代依然存活

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="从1983年到iPhone，Objective-C的历史一脉相承">
  <figcaption>从1983年到iPhone，Objective-C的历史一脉相承</figcaption>
</figure>

---

## Objective-C是如何诞生的？

20世纪80年代初，有两位工程师——Brad Cox和Tom Love。他们想要的东西有两个：

- C语言：速度快，但没有面向对象的概念
- Smalltalk：优雅的面向对象语言，但速度太慢

于是他们给出的答案就是Objective-C。原则是：在C之上叠加一层极薄的面向对象层，同时对C语言本身丝毫不做改动。

> Objective-C是C语言严格意义上的超集（superset）。
>
> 世界上所有的C代码，无需任何修改，都是有效的Objective-C代码。

我用一小段代码给大家实际展示一下。

```objc
// 普通的C代码 —— 同时也是有效的Objective-C代码
int sum = 1 + 2;

// Objective-C叠加的部分：Smalltalk式的消息发送（方括号）
NSString *text = [NSString stringWithFormat:@"合计 %d", sum];
```

上面两行是原封不动的C语法，下面这一行方括号语句，就是Objective-C新增的全部内容。

可以说，它的身体来自C，而灵魂（对象模型和消息发送机制）来自Smalltalk。`[receiver message]`这种方括号语法，正是从Smalltalk继承来的遗产。

几乎在与C++同一时期，用同样的原料（C+面向对象），做出了一道完全不同的“菜”，大概就是这个意思。

---

## NS前缀到底是什么意思？

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="NS前缀的真身，就藏在这段NeXT岁月里">
  <figcaption>NS前缀的真身，就藏在这段NeXT岁月里</figcaption>
</figure>

1985年，史蒂夫·乔布斯被自己一手创办的苹果公司赶了出去。

随后他创立了一家名为NeXT的公司，而这家公司操作系统NeXTSTEP的官方开发语言，正是Objective-C。

`NSString`、`NSArray`里的NS，就是**NeXTSTEP的缩写**。就算到了2026年，最新的iPhone应用代码里，依然像化石一样嵌着乔布斯这家上世纪80年代末公司的名字。

那为什么非要加前缀不可呢？这里有技术上的原因。

- Objective-C没有命名空间（namespace）
- 类名必须在全局范围内唯一，一旦重名就会冲突
- 于是就形成了在类名前加上公司或项目缩写的惯例（苹果用NS，AFNetworking用AF）

苹果甚至还专门给出过官方说明：“双字母前缀留给苹果自己用，第三方请用三个字母。”可以说是用文化手段填补了语言本身的漏洞。

顺带一提，Swift因为有了以模块为单位的命名空间，这种惯例也就不再需要了。没有NS前缀的`String`、`Array`，正是Swift时代的一个标志。

---

## 随iPhone一起到来的全盛期

1996年，苹果以4亿美元收购NeXT，乔布斯时隔12年重新回归。

NeXTSTEP成了Mac OS X的骨架，Objective-C也随之成为苹果官方语言。

到了2008年，App Store开放。当时能用来开发iPhone应用的语言只有一个，那就是Objective-C。

全球开发者蜂拥而至，这门沉寂了二十多年的小众语言，一下子成了最炙手可热的语言。

按照语言人气指标TIOBE指数，它在2012年和2014年两度当选“年度语言”，一度冲到仅次于C和Java的第三位。

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="App Store刚开放那会儿，大家都在用这门语言做应用">
  <figcaption>App Store刚开放那会儿，大家都在用这门语言做应用</figcaption>
</figure>

---

## Objective-C现在还有人在用吗？

2014年苹果发布Swift之后，Objective-C的时代似乎就要落幕了。可十多年过去，这门语言依然没有消亡。原因有三个。

1. **苹果系统框架**：UIKit、Foundation的根基至今仍是Objective-C，Swift代码也要通过桥接才能与它们对话。
2. **遗留代码库**：动辄几百万行代码的大型应用，不可能一夜之间重写，所以维护类开发岗位的需求一直存在。
3. **运行时的动态特性**：这门语言支持在运行时替换方法（方法调配/method swizzling），所以不少分析类SDK至今仍依赖这套运行时机制。

**问：现在还有必要重新学Objective-C吗？**

用它从零启动新项目的情况已经很少见了。不过如果你是需要维护老旧代码库的iOS开发者，能看懂这门语言仍然是一件很有用的本领。

**问：只学Swift够不够？**

做新项目开发，Swift完全够用。不过如果你了解NS前缀从何而来、方括号语法为什么会存在，理解苹果的各种框架时会顺畅很多。

---

## 结语

Objective-C与其说是一门已经消亡的语言，不如说更像一位正准备退休的老将。它曾与乔布斯一起在苹果之外成长，又随乔布斯一起回归，成为了全球市值最高公司的心脏。

下次在老代码里再看到`NSString`，不妨换个心情，友善地看待它——这短短两个字母里，藏着一段长达40年的历史。

**参考资料**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)
