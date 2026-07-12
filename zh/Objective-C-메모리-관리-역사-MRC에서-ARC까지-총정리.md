---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 内存管理简史:从MRC到ARC全面梳理"
lang: zh
description: "做iOS开发的时候,总会有那么一个瞬间让人好奇:"
header:
  og_image: /assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png
tags:
  - Objective-C
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
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

做iOS开发的时候,总会有那么一个瞬间让人好奇:

"以前的Objective-C代码里,为什么写满了`retain`、`release`?"

如果你是从Swift入门的,打开老代码的那一刻多半会愣一下。

今天就来把Objective-C内存管理的历史梳理一遍——从MRC到ARC,这条路究竟是怎么走过来的。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="从MRC到ARC,一图看懂Objective-C内存管理的演变">
  <figcaption>从MRC到ARC,一图看懂Objective-C内存管理的演变</figcaption>
</figure>

先说结论:

> Objective-C的内存管理,经历了从"开发者手动计数的时代(MRC)"到"编译器代为计数的时代(ARC)"的转变。

中间还短暂尝试过垃圾回收,但最终在2011年随着ARC的登场,局面才算尘埃落定。

下面就按时间线一段段拆开来看。

---

## 引用计数到底是什么?内存管理的基本概念

在正式进入历史之前,先抓住一个核心概念——

就是"引用计数(reference count)"。

可以把它想象成每个对象身上都挂着一个数字,记录着"有多少人正抓着我不放"。

这个数字大于等于1,对象就还活着;一旦归零,就会从内存中被释放。

所以,抓住对象时数字加一(`retain`),放手时数字减一(`release`)。

这条简单的规则,正是Objective-C内存管理的根基。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="一个数字决定生死的引用计数流程">
  <figcaption>一个数字决定生死的引用计数流程</figcaption>
</figure>

---

## MRC时代:开发者亲手数数的年代

在ARC出现之前,也就是MRC(Manual Retain Count)时代,这个数字是靠人手动管理的。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="写满retain release的老代码,第一次见到多少都会愣一下">
  <figcaption>写满retain release的老代码,第一次见到多少都会愣一下</figcaption>
</figure>

规则很明确,常常被简记为一句口诀'NARC':

- 通过**N**ew、**A**lloc、**R**etain、**C**opy创建的对象,由你负责
- 负责的对象用完之后必须`release`

实际代码大概长这样:

```objc
// 创建对象后,引用计数变为1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // 计数变为2
[obj release];  // 计数变为1
[obj release];  // 计数变为0 → 内存释放
```

问题就出在这里。

忘记调用`release`,内存就会泄漏;而释放得太早,又会去操作已经消失的对象,导致应用崩溃。

这就是所谓的"僵尸对象"崩溃。

因为要时刻在脑子里盘算当前抓着的对象计数是多少,这确实是一件极其耗神的工作。

---

## autorelease:"现在先别放,等一下再放"

MRC时代还有一个棘手的场景。

就是当方法创建了一个新对象并把它返回出去的时候。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"你好"];
    return msg; // 我alloc了它,理应release……但什么时候release?
}
```

按规则来说,谁alloc谁就该`release`。

可是如果在return之前就release,对方还没来得及用,对象就已经消失了;可要是不release,又会造成内存泄漏。

为了解开这个两难局面,`autorelease`应运而生。

它的意思是:"先别急着release,稍后再帮你处理。"

被标记为autorelease的对象会被放进一份叫做"自动释放池(autorelease pool)"的等待名单,等到池子被清空的那一刻(通常是运行循环走完一圈结束时)才会统一release。

因此接收方可以安全地拿到并使用这个对象。

像`[NSString stringWithFormat:]`这类不用alloc、直接拿来就用的便利构造方法,返回的全都是用这种方式创建的对象。

顺带一提,这套自动释放池机制在ARC时代也以`@autoreleasepool`代码块的形式保留了下来。它是循环中内存暴涨时可以拿出来用的实战工具,内容篇幅不小,我另外单独整理了一篇文章。

---

## 垃圾回收为什么失败了?

苹果其实也意识到了这种不便。

于是在2007年的Mac OS X 10.5 Leopard中,引入了类似Java那样能自动清理内存的"垃圾回收(GC)"。

开发者不用再写`retain`、`release`,听起来会方便不少。

但结果并不理想。

GC在后台运行,会在难以预测的时刻让应用出现短暂卡顿。更重要的是,这对性能和电池都很敏感的iPhone来说负担太大。

所以GC根本没能被引入iOS。

最终,Mac上的GC也从2012年的OS X 10.8开始走向弃用(deprecated)。

---

## ARC登场:编译器代为计数

到了2011年,苹果拿出的解决方案就是ARC(Automatic Reference Counting)。

它随Xcode 4.2、iOS 5以及OS X 10.7 Lion一同发布。

ARC的思路相当聪明。

> 引用计数的机制照旧保留,只是把`retain`、`release`的插入工作,从开发者手里交给编译器。

它不像GC那样在运行时另外派一个"清洁工"巡视,而是在编译阶段就把释放代码精准地插入到需要的位置。

这样一来,几乎没有运行时性能负担,内存管理却实现了自动化。

把两个时代放到表格里对比一下:

| 分类 | MRC | ARC |
|------|-----|-----|
| 出现时间 | 初期 ~ 2011年 | 2011年(iOS 5) |
| retain/release | 手动编写 | 编译器自动插入 |
| autorelease | 手动调用 | 由编译器管理 |
| 内存泄漏风险 | 较高 | 大幅降低 |
| 性能负担 | 无 | 几乎没有 |

不过ARC也并非万能。

互相持有对方的"循环引用"是它无法自动解开的,需要开发者用`weak`或`unowned`这类弱引用手动切断。

这个概念也原封不动地延续到了我们现在使用的Swift之中。

---

## 常见问题(Q&A)

**Q. 现在还有必要学MRC吗?**

实际工作中几乎不会再用MRC重新写代码。不过在阅读老旧的库,或是面试被问到相关概念时都可能用上,所以了解一下原理还是有好处的。

**Q. autorelease在ARC下还会用到吗?**

虽然不需要手动调用,但这套机制本身在ARC底层依然在运作。所以`@autoreleasepool`代码块至今仍是一个有效的工具。

**Q. Swift也用ARC吗?**

是的,Swift同样基于ARC。所以循环引用和`weak`的概念在Swift里同样重要。

---

简单总结一下,Objective-C的内存管理经历了"手动计数的MRC → 短暂的GC试验 → 编译器代劳的ARC"这样一条演进路线。

如今我们习以为常的自动内存管理,其实是在无数次崩溃与试错之上一点点打磨出来的成果。

希望这条脉络能给正在学习iOS开发的读者一份小小的指引。祝大家编码愉快!

---

## 参考资料

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
