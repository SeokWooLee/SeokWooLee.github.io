---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 内存管理简史：从 MRC 到 ARC 全面梳理"
lang: zh
description: "做 iOS 开发的朋友大概都会有这样一个疑问："
header:
  og_image: /assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png
tags:
  - ObjectiveC
  - iOS开发
  - ARC
  - 内存管理
  - retainrelease
  - MRC
  - 苹果开发者
  - 编程
  - Swift
  - 编程学习
permalink: /zh/Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

做 iOS 开发的朋友大概都会有这样一个疑问：

"以前的 Objective-C 代码里，为什么写满了 `retain`、`release`？"

我也是从 Swift 入门的，后来打开旧代码的时候着实愣了一下。

今天就来给大家梳理一下 Objective-C 内存管理的历史，也就是从 MRC 到 ARC 是怎么一步步走过来的。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="从 MRC 到 ARC，一图看懂 Objective-C 内存管理的演进">
  <figcaption>从 MRC 到 ARC，一图看懂 Objective-C 内存管理的演进</figcaption>
</figure>

先说结论：

> Objective-C 的内存管理，是从"开发者自己数数的时代（MRC）"走向了"编译器代劳数数的时代（ARC）"。

中间还短暂尝试过垃圾回收，但最终在 2011 年随着 ARC 的登场，整个格局被彻底重塑。

下面就按时间线一段段来看。

---

## 引用计数是什么？内存管理的基本概念

在正式进入历史之前，先抓住一个核心概念——

就是"引用计数（reference count）"。

可以理解成每个对象身上都挂着一个数字，记录着"现在有多少人正抓着我"。

这个数字大于等于 1，对象就还活着；一旦变成 0，就会从内存中被释放。

所以抓住对象的时候要把数字加一（`retain`），放手的时候要减一（`release`）。

这条简单的规则，就是 Objective-C 内存管理的根基。

---

## MRC 时代：开发者亲手数数的日子

在 ARC 出现之前，也就是 MRC（Manual Retain Count，手动引用计数）时代，这个数字全靠人工管理。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="满屏 retain release 的老代码，我第一次看到也是一脸懵">
  <figcaption>满屏 retain release 的老代码，我第一次看到也是一脸懵</figcaption>
</figure>

规则很明确，大家通常用"NARC"这个词来记忆：

- 通过 **N**ew、**A**lloc、**R**etain、**C**opy 创建的对象，由自己负责
- 负责的对象用完之后必须 `release`

实际代码大概长这样：

```objc
// 创建对象后，引用计数变为 1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // 计数变为 2
[obj release];  // 计数变为 1
[obj release];  // 计数变为 0 → 内存被释放
```

问题就出在这里。

忘记 `release` 会导致内存泄漏；而释放得太早，又会碰到已经消失的对象，导致 App 崩溃。

也就是所谓的"僵尸对象"崩溃。

因为要一直在脑子里盘算当前抓着的对象计数是多少，这活儿确实让人操碎了心。

---

## autorelease："现在先别释放，晚点再放手"

MRC 时代还有一个更棘手的情况——

就是方法创建了一个新对象、然后要把它返回出去的时候。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"你好"];
    return msg; // 我 alloc 出来的，理应 release……但什么时候释放？
}
```

按规则来说，谁 alloc 谁就该 `release`。

可是如果在 return 之前就 release，对象还没被调用方用上就已经消失了。可要是不释放，那就变成了泄漏。

为了解决这个两难局面，才出现了 `autorelease`。

意思是："现在先别急着 release，稍后再帮我处理。"

挂上 autorelease 的对象，会被登记进一份叫"自动释放池（autorelease pool）"的等待名单，等到这个池子被清空的那一刻（通常是 run loop 跑完一圈结束的时候），才会一并收到 release。

这样一来，调用方就能安全地接过对象来使用了。

像 `[NSString stringWithFormat:]` 这类不需要 alloc、直接拿来就能用的便利构造方法，返回的全都是用这种方式创建出来的对象。

顺便一提，这个自动释放池到了 ARC 时代依然以 `@autoreleasepool` 代码块的形式存活了下来。它是循环里内存暴涨时能派上用场的实战工具，这部分内容篇幅不小，我另外整理成了一篇单独讲。

---

## 垃圾回收为什么失败了？

苹果自己也意识到了这种不便。

于是 2007 年，在 Mac OS X 10.5 Leopard 上引入了类似 Java 那样能自动清理内存的"垃圾回收（GC）"机制。

开发者不用再写 `retain`、`release`，听起来应该会很轻松。

但结果并不理想。

GC 在后台运行时，会在难以预测的时刻让 App 出现短暂卡顿。更关键的是，对性能和电量都很敏感的 iPhone 根本承受不起这样的负担。

所以 GC 压根就没能被引入 iOS。

最终连 Mac 上的 GC 也从 2012 年的 OS X 10.8 开始走上了被弃用（deprecated）的道路。

---

## ARC 的登场：编译器代劳数数

到了 2011 年，苹果给出的解决方案就是 ARC（Automatic Reference Counting，自动引用计数）。

它随 Xcode 4.2、iOS 5、OS X 10.7 Lion 一同发布。

ARC 的思路非常巧妙：

> 引用计数的方式不变，只是把 `retain`、`release` 从开发者手里交给编译器去自动插入。

它不像 GC 那样在运行时另外跑一个"清洁工"，而是在编译阶段，就在恰好需要的位置自动插入释放代码。

这样一来，几乎不增加运行时性能负担，同时又实现了内存管理的自动化。

把两个时代放到表格里对比一下：

| 项目 | MRC | ARC |
|------|-----|-----|
| 出现时间 | 早期 ~ 2011 年 | 2011 年（iOS 5） |
| retain/release | 手动编写 | 编译器自动插入 |
| autorelease | 手动调用 | 编译器管理 |
| 内存泄漏风险 | 高 | 大幅降低 |
| 性能负担 | 无 | 几乎没有 |

不过 ARC 也并非万能。

对象之间互相持有对方形成的"循环引用"，ARC 是没法自动解开的，需要开发者用 `weak` 或 `unowned` 这类弱引用手动切断。

这个概念也原封不动地延续到了我们现在使用的 Swift 里。

---

## 常见问答（Q&A）

**Q. 现在还有必要学 MRC 吗？**

在实际工作中，几乎不会再用 MRC 从零写代码了。不过一些老库或者面试时可能会被问到相关概念，了解一下原理还是有好处的。

**Q. autorelease 在 ARC 下还会用到吗？**

虽然不会再手动调用，但这个机制本身在 ARC 底层依然在运作。所以 `@autoreleasepool` 代码块到现在仍然是个有效的工具。

**Q. Swift 也用 ARC 吗？**

是的，Swift 同样基于 ARC。所以循环引用和 `weak` 的概念在 Swift 里同样重要。

---

简单总结一下，Objective-C 的内存管理是这样演进的：手动数数的 MRC → 短暂的 GC 实验 → 编译器代劳数数的 ARC。

如今大家习以为常的自动内存管理，其实是在无数次崩溃和试错之上打磨出来的成果。

希望这条脉络能给正在学习 iOS 开发的朋友们提供一份小小的地图。祝大家今天也能愉快地写代码！

---

## 参考资料

- [Transitioning to ARC Release Notes（Apple Developer）](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management（Apple Developer）](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
