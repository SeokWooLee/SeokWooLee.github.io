---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C发展史全解析，乔布斯钟爱的语言故事（附NS前缀的由来）"
lang: zh
description: "开始学习iOS开发时，总会遇到一门语言。方括号一大堆的陌生语法，还有像NSString这样让人摸不着头脑的前缀。"
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
  - 编程历史
permalink: /zh/Objective-C-역사/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EC%97%AD%EC%82%AC/) · [English](/en/Objective-C-%EC%97%AD%EC%82%AC/) · [日本語](/ja/Objective-C-%EC%97%AD%EC%82%AC/) · **中文**
{: .notice--info}

开始学习iOS开发时，总会遇到一门语言。方括号一大堆的陌生语法，还有像`NSString`这样让人摸不着头脑的前缀。

没错，就是Objective-C。

在旧代码里第一次碰到这门语言，很容易冒出一个念头：“这语法到底是从哪冒出来的？”不过了解了它的历史之后，代码看起来就会完全不一样。

先说结论：Objective-C是在20世纪80年代初，在C语言的基础上加入Smalltalk的对象概念而诞生的语言。

而那个著名的NS前缀，来自史蒂夫·乔布斯创立的公司NeXT旗下的操作系统NeXTSTEP。

读完这篇文章，你会了解到：

1. Objective-C的诞生背景（C + Smalltalk）
2. NS前缀的由来与技术原因
3. 随iPhone而来的全盛时期
4. 在Swift时代依然存活的原因

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="从1983年到iPhone，Objective-C的历史一脉相承">
  <figcaption>从1983年到iPhone，Objective-C的历史一脉相承</figcaption>
</figure>

---

## Objective-C是怎么诞生的？

20世纪80年代初，有两位工程师，Brad Cox和Tom Love。他们想要的东西有两个：

- C语言：速度快，但没有面向对象的概念
- Smalltalk：优雅的面向对象语言，但速度太慢

于是他们给出的答案就是Objective-C。原则是在C语言之上叠加一层极薄的面向对象层，而C语言本身一点都不动。

> Objective-C是C语言严格意义上的超集（superset）。
>
> 世界上所有的C代码，无需任何修改，都同样是有效的Objective-C代码。

用一小段代码来直观展示一下实际样子。

```objc
// 普通的C代码 — 同样也是有效的Objective-C代码
int sum = 1 + 2;

// Objective-C叠加的部分：Smalltalk式的消息传递（方括号）
NSString *text = [NSString stringWithFormat:@"合计 %d", sum];
```

上面两行是原封不动的C语法，下面这行方括号才是Objective-C新增的全部内容。

可以说身体来自C，而灵魂（对象模型和消息传递）来自Smalltalk。方括号语法`[receiver message]`正是从Smalltalk继承来的遗产。

几乎在同一时期，用同样的原料（C + 面向对象），做出了一道完全不同的菜——这就是C++和Objective-C的关系。

---

## NS前缀究竟是什么意思？

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="NS前缀的真相，就藏在这段NeXT岁月里">
  <figcaption>NS前缀的真相，就藏在这段NeXT岁月里</figcaption>
</figure>

1985年，史蒂夫·乔布斯被自己创立的苹果公司赶了出去。

之后他创立了一家名为NeXT的公司，而这家公司的操作系统NeXTSTEP的官方开发语言，正是Objective-C。

`NSString`、`NSArray`中的NS，正是**NeXTSTEP的缩写**。就连2026年最新款iPhone应用代码里，都还像化石一样嵌着乔布斯在上世纪80年代末创办的那家公司的名字。

那为什么非要加上前缀呢？这背后有技术上的原因。

- Objective-C没有命名空间（namespace）
- 类名必须全局唯一，一旦重名就会冲突
- 于是形成了在前面加上公司或项目缩写的惯例（苹果用NS，AFNetworking用AF）

苹果甚至官方公告过：“两个字母的前缀由苹果保留，第三方请使用三个字母。”可以说是用文化弥补了语言本身的漏洞。

顺带一提，Swift出现了以模块为单位的命名空间之后，这种惯例就不再需要了。没有NS的`String`、`Array`，正是Swift时代的一个象征。

---

## 随iPhone而来的全盛时期

1996年，苹果以4亿美元收购了NeXT，乔布斯时隔12年重新回归。

NeXTSTEP成为了Mac OS X的骨架，Objective-C也随之成为苹果的官方语言。

随后2008年，App Store开放了。当时能开发iPhone应用的语言只有一个，就是Objective-C。

随着全球开发者蜂拥而至，这门二十多年来一直不温不火的语言，瞬间变成了最炙手可热的语言。

以语言人气指标TIOBE指数为准，它在2012年和2014年两次被评为“年度语言”，一度攀升到仅次于C和Java的第三位。

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="App Store刚起步那会儿，大家都用这门语言开发应用">
  <figcaption>App Store刚起步那会儿，大家都用这门语言开发应用</figcaption>
</figure>

---

## Objective-C现在还在用吗？

2014年苹果发布Swift的时候，Objective-C的时代似乎就要落幕了。然而十多年过去，这门语言依然没有消失。原因有三个：

1. **苹果系统框架**：UIKit、Foundation的根基至今仍是Objective-C，Swift代码也要通过桥接才能和它们对话。
2. **遗留代码库**：动辄数百万行代码的大型应用不可能一夜之间重写，因此维护类开发者的需求一直存在。
3. **运行时的动态特性**：可以在运行过程中替换方法的技术（方法调配，method swizzling）依然可用，不少分析类SDK仍然依赖这套运行时机制。

**Q. 现在有必要重新学习Objective-C吗？**

用这门语言从零开始新项目的情况已经很少见了。不过如果作为iOS开发者需要维护老旧代码库，具备能读懂它的能力会是很大的优势。

**Q. 只会Swift够用吗？**

新项目开发用Swift已经足够。不过如果了解NS从何而来、方括号为什么会存在，理解苹果框架时会顺畅很多。

---

## 结语

Objective-C与其说是一门“死语言”，不如说更像是一位准备退役的老将。它曾在乔布斯离开苹果的那段日子里，跟随他在苹果之外成长；后来又随乔布斯一同回归，成为了全球市值最高公司的核心。

下次在老代码里遇到`NSString`时，不妨用更亲切的眼光看看它。那短短两个字母里，藏着长达四十年的历史。

**参考资料**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)
