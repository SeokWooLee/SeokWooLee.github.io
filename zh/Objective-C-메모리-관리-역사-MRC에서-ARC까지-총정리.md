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
description: "做 iOS 开发的过程中，总会遇到一个让人好奇的问题。"
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
  - 学编程
permalink: /zh/Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

做 iOS 开发的过程中，总会遇到一个让人好奇的问题。

"以前的 Objective-C 代码里，为什么写满了 `retain`、`release`？"

我自己也是从 Swift 入门的，后来打开旧代码时着实愣了一下。

今天就来给大家梳理一下 Objective-C 内存管理的历史，也就是从 MRC 到 ARC 是怎么一步步演变过来的。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="从 MRC 到 ARC，一图看懂 Objective-C 内存管理的演变">
  <figcaption>从 MRC 到 ARC，一图看懂 Objective-C 内存管理的演变</figcaption>
</figure>

先说结论：

> Objective-C 的内存管理，经历了从"开发者手动计数的时代（MRC）"到"编译器自动代劳的时代（ARC）"的转变。

中间还短暂尝试过垃圾回收（GC），但最终随着 2011 年 ARC 的出现，局面才彻底明朗。

下面我们按时间顺序一个个来看。

---

## 引用计数是什么？内存管理的基本概念

在正式进入历史之前，先抓住一个核心概念。

那就是"引用计数（reference count）"。

可以理解为每个对象身上都挂着一个数字，记录着"有多少人正抓着我不放"。

这个数字大于等于 1 时对象存活，变成 0 时就会从内存中释放。

所以抓住对象时数字加一（`retain`），放手时数字减一（`release`）。

这条简单的规则，就是 Objective-C 内存管理的根基。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="一个数字决定生死的引用计数流程">
  <figcaption>一个数字决定生死的引用计数流程</figcaption>
</figure>

---

## MRC 时代：开发者亲手计数的岁月

在 ARC 出现之前，也就是 MRC（Manual Retain Count）时代，这个数字是由人工手动管理的。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="写满 retain release 的老代码，我第一次看到也懵了">
  <figcaption>写满 retain release 的老代码，我第一次看到也懵了</figcaption>
</figure>

规则很明确，大家常用"NARC"这个说法来记忆：

- 通过 **N**ew、**A**lloc、**R**etain、**C**opy 创建的对象，由自己负责
- 负责的对象用完之后必须 `release`

实际代码大概是这样的：

```objc
// 创建对象后引用计数变为1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // 计数变为2
[obj release];  // 计数变为1
[obj release];  // 计数变为0 → 内存释放
```

问题就出在这里。

忘记调用 `release` 会导致内存泄漏，而释放得太早又会碰到已经消失的对象，导致 App 崩溃。

也就是所谓的"僵尸对象"崩溃。

因为要时刻在脑子里数清楚当前抓着的对象计数是多少，所以这真的是件很费神的事。

---

## autorelease："现在先别放，稍后再放"

MRC 时代还有一个棘手的情况。

那就是方法创建了新对象并将其返回给外部时。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"你好"];
    return msg; // 我 alloc 的，理应 release，可是……什么时候？
}
```

按规矩来说，alloc 的一方应该负责 `release`。

可是如果在 return 之前就 release，接收方还没用上对象就已经消失了。可如果不 release，又会造成泄漏。

为了解决这个两难困境而诞生的机制，就是 `autorelease`。

意思是"现在先别急着 release，稍后再帮我处理"，相当于预约了一下。

被标记为 autorelease 的对象，会被加入一个叫作"自动释放池（autorelease pool）"的待办名单，等到这个池子清空的那一刻（通常是 run loop 跑完一圈结束时），会统一被 release。

所以接收方就能安全地拿到对象并使用了。

像 `[NSString stringWithFormat:]` 这种不需要 alloc 就能直接拿来用的便捷构造方法，返回的全都是通过这种方式生成的对象。

顺带一提，这个自动释放池在 ARC 时代也以 `@autoreleasepool` 代码块的形式延续了下来。因为它是在循环中内存飙升时会拿出来用的实战工具，内容篇幅不小，所以我另开一篇专门整理了。

---

## 垃圾回收为什么会失败？

苹果其实也意识到了这种不便。

于是在 2007 年的 Mac OS X 10.5 Leopard 中，引入了类似 Java 那样自动清理内存的"垃圾回收（GC）"。

开发者不用再写 `retain`、`release`，看起来应该会很方便。

但结果并不理想。

GC 在后台运行时，会在难以预测的时刻让 App 出现短暂卡顿。尤其对性能和电池格外敏感的 iPhone 来说，这个负担相当大。

所以 GC 压根就没能引入 iOS。

最终就连 Mac 平台的 GC，也从 2012 年的 OS X 10.8 开始走上了废弃（deprecated）之路。

---

## ARC 的登场：由编译器代为计数

然后到了 2011 年，苹果拿出的解决方案正是 ARC（Automatic Reference Counting）。

它随 Xcode 4.2、iOS 5 以及 OS X 10.7 Lion 一同发布。

ARC 的思路相当巧妙。

> 引用计数的方式保持不变，只是把 `retain`、`release` 交给编译器而不是开发者来添加。

它不像 GC 那样在运行时另外派个"清洁工"巡视，而是在编译阶段就把释放代码自动插入到恰好需要的位置。

因此几乎不增加运行时性能负担，同时又实现了内存管理的自动化。

把这两个时代放到表格里对比一下：

| 分类 | MRC | ARC |
|------|-----|-----|
| 出现时间 | 早期 ~ 2011年 | 2011年（iOS 5） |
| retain/release | 手动编写 | 编译器自动插入 |
| autorelease | 手动调用 | 由编译器管理 |
| 内存泄漏风险 | 高 | 大幅降低 |
| 性能负担 | 无 | 几乎没有 |

不过 ARC 也并非万能。

互相持有对方的"循环引用"是它无法自动解决的，开发者仍需通过 `weak` 或 `unowned` 这类弱引用主动断开。

这个概念也原封不动地延续到了我们现在使用的 Swift 中。

---

## 常见问题 (Q&A)

**Q. 现在还有必要学 MRC 吗？**

在实际工作中，几乎不会再有机会用 MRC 重新写代码。不过在维护老旧库或者面试时可能会被问到相关概念，所以了解一下原理还是有好处的。

**Q. autorelease 在 ARC 下还会用到吗？**

虽然不需要自己去调用，但这个机制本身在 ARC 底层依然在运作。所以 `@autoreleasepool` 代码块至今仍是有效的工具。

**Q. Swift 也使用 ARC 吗？**

是的，Swift 同样基于 ARC。所以循环引用和 `weak` 的概念在 Swift 里同样重要。

---

简单总结一下，Objective-C 的内存管理经历了"手动计数的 MRC → 短暂的 GC 尝试 → 编译器自动计数的 ARC"这样的演进过程。

如今我们习以为常的自动内存管理，其实是在无数次崩溃与试错中不断打磨出来的成果。

希望这条脉络，能为正在学习 iOS 开发的朋友们提供一份小小的地图。祝大家今天也编码愉快！

---

## 参考资料

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
