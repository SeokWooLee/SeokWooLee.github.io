---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C内存管理简史：从MRC到ARC全面梳理"
lang: zh
description: "做iOS开发的朋友大概都好奇过一件事。"
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
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

做iOS开发的朋友大概都好奇过一件事。

"以前的Objective-C代码里,为什么到处都是`retain`、`release`?"

如果你是从Swift入门的,打开老代码的那一刻多半会愣一下。

今天就来梳理一下Objective-C内存管理的历史,也就是从MRC到ARC是怎么一路走过来的。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="从MRC到ARC,一图看懂Objective-C内存管理的演变">
  <figcaption>从MRC到ARC,一图看懂Objective-C内存管理的演变</figcaption>
</figure>

先说结论。

> Objective-C的内存管理,是从"开发者自己数数的时代(MRC)"走到了"编译器代劳数数的时代(ARC)"。

中间还短暂尝试过垃圾回收,但最终在2011年随着ARC的登场,局面才算彻底定型。

下面按时间顺序一段段来看。

---

## 引用计数是什么?内存管理的基本概念

在正式讲历史之前,先弄清楚一个概念就够了。

那就是"引用计数(reference count)"。

可以理解为,每个对象身上都挂着一个数字,记录"有多少人正抓着我不放"。

这个数字只要大于等于1,对象就活着;一旦归零,就会从内存中被释放。

所以抓住对象时数字加一(`retain`),放手时数字减一(`release`)。

这个简单的规则,就是Objective-C内存管理的根基。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="一个数字决定生死的引用计数流程">
  <figcaption>一个数字决定生死的引用计数流程</figcaption>
</figure>

---

## MRC时代:开发者亲手数数的日子

在ARC之前,也就是MRC(Manual Retain Count)时代,这个数字要靠人手动管理。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="满屏retain release的老代码,第一次看到难免懵一下">
  <figcaption>满屏retain release的老代码,第一次看到难免懵一下</figcaption>
</figure>

规则很明确,大家常用"NARC"这个说法来记忆。

- 通过**N**ew、**A**lloc、**R**etain、**C**opy创建的对象,由自己负责
- 负责的对象用完之后必须`release`

实际代码大概长这样。

```objc
// 创建对象后,引用计数变为1
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // 计数变为2
[obj release];  // 计数变为1
[obj release];  // 计数变为0 → 内存被释放
```

问题就出在这里。

忘记`release`会导致内存泄漏,而释放得太早又会导致操作已经消失的对象,进而使App崩溃。

也就是所谓的"僵尸对象"崩溃。

因为要一直在脑子里记着当前对象的引用计数是多少,这真是件让人神经紧绷的活儿。

---

## autorelease:"现在先不放,过一会儿再放"

MRC时代还有一个让人头疼的场景。

就是方法创建了一个新对象,并把它返回给外部调用者的时候。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"你好"];
    return msg; // 我alloc了它,理应release……但什么时候release?
}
```

按规则,谁alloc谁就该`release`。

可如果在return之前就release了,调用方还没来得及用,对象就已经消失了。可要是不release,又会造成泄漏。

为了解决这个两难局面,`autorelease`应运而生。

意思是"现在先别急着release,过一会儿再帮我release"。

被标记为autorelease的对象,会被登记进一个叫"自动释放池(autorelease pool)"的等待名单,等到这个池子被清空的那一刻(通常是run loop转完一圈结束时),会统一执行release。

这样一来,调用方就能安全地接过对象来使用了。

像`[NSString stringWithFormat:]`这类不需要alloc、直接拿来就用的便捷构造方法,返回的全都是通过这种方式创建的对象。

顺带一提,这个自动释放池在ARC时代也以`@autoreleasepool`代码块的形式延续了下来。它是在循环中内存飙升时会用到的实战工具,内容比较多,我已经单独写了一篇来梳理这个话题。

---

## 垃圾回收为什么失败了?

苹果其实也意识到了这种不便。

所以在2007年的Mac OS X 10.5 Leopard中,引入了像Java那样自动清理内存的"垃圾回收(GC)"机制。

开发者不用再写`retain`、`release`,看起来应该会很方便。

但结果并不理想。

GC在后台运行时,会在难以预测的时刻让App出现短暂卡顿。对性能和电池格外敏感的iPhone来说,这个负担尤其沉重。

所以GC根本没能被引入iOS。

最终,连Mac版的GC也从2012年的OS X 10.8开始被逐步弃用(deprecated)。

---

## ARC登场:交给编译器代劳数数

到了2011年,苹果给出的解决方案就是ARC(Automatic Reference Counting)。

它随Xcode 4.2、iOS 5以及OS X 10.7 Lion一同发布。

ARC的思路相当巧妙。

> 引用计数的机制照旧保留,但`retain`、`release`不再由开发者手写,而是交给编译器自动插入。

它不像GC那样在运行时另外安排一个"清洁工"到处巡视,而是在编译阶段,把释放代码精准地插入到需要的位置。

因此,几乎不增加运行时性能负担的同时,内存管理却实现了自动化。

把两个时代整理成表格对比一下就是这样。

| 分类 | MRC | ARC |
|------|-----|-----|
| 出现时间 | 早期 ~ 2011年 | 2011年(iOS 5) |
| retain/release | 手动编写 | 编译器自动插入 |
| autorelease | 手动调用 | 由编译器管理 |
| 内存泄漏风险 | 高 | 大幅降低 |
| 性能负担 | 无 | 几乎没有 |

不过ARC也并非万能。

彼此互相强引用的"循环引用"问题,它没办法自动解开,还是需要开发者用`weak`或`unowned`这类弱引用手动切断。

这个概念也原封不动地延续到了我们现在使用的Swift当中。

---

## 常见问题(Q&A)

**Q. 现在还有必要学MRC吗?**

实际工作中几乎不会再有人用MRC重新写代码了。不过在阅读老旧的库,或者面试被问到相关概念时可能会用到,所以了解一下原理还是有好处的。

**Q. autorelease在ARC中还会用到吗?**

虽然不需要自己去调用,但这套机制本身在ARC底层依然在运作。所以`@autoreleasepool`代码块到现在依然是个有效的工具。

**Q. Swift也用ARC吗?**

是的,Swift同样是基于ARC。因此循环引用和`weak`这些概念在Swift中同样重要。

---

简单总结一下,Objective-C的内存管理经历了"手动数数的MRC → 短暂的GC尝试 → 编译器代劳数数的ARC"这样的演变过程。

如今我们习以为常的自动内存管理,其实是在无数次崩溃和试错之上打磨出来的成果。

希望这条脉络能给学习iOS开发的朋友们提供一点小小的指引。祝大家编码愉快!

---

## 参考资料

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
