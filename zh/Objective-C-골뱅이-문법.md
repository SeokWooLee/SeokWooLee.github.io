---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 的 @ 符号语法，为什么全都以 @ 开头？（完全解析）"
lang: zh
description: "第一次打开 Objective-C 代码时，最先映入眼帘的东西之一，"
header:
  og_image: /assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png
categories:
  - iOS
tags:
  - Objective-C
  - Objective-C教程
  - at符号语法
  - at符号
  - 编程基础
  - iOS开发
  - C语言
  - NSString
  - 编程学习
  - 开发者
permalink: /zh/Objective-C-골뱅이-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · [English](/en/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · [日本語](/ja/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · **中文**
{: .notice--info}

第一次打开 Objective-C 代码时，最先映入眼帘的东西之一，

就是到处出现的 @ 符号。

@interface、@property，甚至连字符串都要写成 @"Hello" 这样。第一次看到可能会觉得：“这不会是打错了吧？”

但这个 @ 其实有非常明确的理由。

> Objective-C 的 @ 是给编译器发出的一个信号：“从这里开始，不是纯 C，而是 Objective-C 扩展语法。”

今天就来轻松聊聊，为什么 @interface、@property、@"字符串" 上都统一挂着这个 @，背后的原理是什么。

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png" alt="Objective-C 的 @ 符号语法，弄懂了其实规则只有一个">
  <figcaption>Objective-C 的 @ 符号语法，弄懂了其实规则只有一个</figcaption>
</figure>

---

## Objective-C 的 @ 到底是什么？

先说结论。

@ 是一个特殊符号，用来告诉编译器“这是 Objective-C 独有的语法”。

要理解这一点，得先了解 Objective-C 的出身。

Objective-C 并不是一门全新的语言，而是在 C 语言的基础上加上了面向对象特性的语言。

也就是说，它 100% 完整包含 C 语言本身，只是在此之上又加了类、消息等功能。

但这样一来就会出现一个问题。

对编译器来说，必须要区分清楚哪些是原本的 C 语法，哪些是新增的 Objective-C 语法。

而画出这条分界线的标记，正是 @。

---

## 为什么偏偏选了 @ 这个符号？

明明还有星号（*）、井号（#）等符号，为什么非要用 @ 呢？

答案出乎意料地实用。

因为在 C 语言标准语法里，@ 符号完全没有被用到。

我们来回想一下 C 语言里会用到哪些字符。

- 变量、函数名：英文字母、数字、下划线（_）
- 运算符：+、-、*、/、=、& 等
- 预处理指令：#（例如 #include）

这份清单里，任何地方都没有 @。

所以 Objective-C 的设计者就借用了 @。因为它是一个绝对不会跟现有 C 代码发生冲突的安全符号。

如果不用 @，而是直接把 interface 这个单词定为关键字，那些原本用 interface 作变量名的旧 C 代码就会全部报废。

而在前面加上 @，就从根源上杜绝了这种冲突。

打个比方，@ 就像是专门收纳 Objective-C 专属语法的一个抽屉把手。

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/2.png" alt="来自 C 语言的部分，和 Objective-C 加上去的部分，@ 就是这条分界线">
  <figcaption>来自 C 语言的部分，和 Objective-C 加上去的部分，@ 就是这条分界线</figcaption>
</figure>

---

## 为什么 @interface、@property、@"字符串" 都带 @

现在进入正题。来说说这三个看起来性质不同的东西，为什么都以 @ 开头。

先说结论：因为这三者都是“C 语言里没有、Objective-C 独有的功能”。

我们逐一来看。

**@interface** —— 用来开启类的骨架（声明）的指令。C 语言里根本没有“类”这个概念，所以必须用 @ 来标记。它的搭档 @implementation、@end 也是同样的道理。

**@property** —— 自动生成对象属性的功能。这也是纯 C 里没有的语法，所以要加 @。

**@"字符串"** —— 这个最有意思。只用引号写的 "Hello" 和 @"Hello"，其实是完全不同的东西。

用表格来对比一下。

| 区分 | "Hello" | @"Hello" |
|------|---------|----------|
| 本质 | C 风格字符数组 | NSString 对象 |
| 归属 | 原生 C 语法 | Objective-C 扩展 |
| 功能 | 单纯的字符排列 | 可使用 length 等方法 |

只要在引号前加上一个 @，它就从单纯的字符堆变成了“对象”。

所以才需要这个 @。可以理解成是一句指令：“把这个字符串做成 NSString 对象，而不是普通的 C 字符串。”

总结一下就是这样。

> 不管是 @interface、@property 还是 @"字符串"，它们全都是“C 语言里没有、只有 Objective-C 才有”的功能，所以才挂着同样的 @ 标记。

---

## 用代码一眼看懂

光说可能有点抽象，所以准备了一段简短的示例。

下面是一个简单的类声明，可以看看 @ 是如何把 Objective-C 语法包裹起来的。

```objectivec
@interface Person : NSObject   // 类声明开始（C 语言里没有的语法）
@property NSString *name;      // 自动生成属性
@end                           // 声明结束

NSString *greeting = @"你好"; // 引号前加 @ → NSString 对象
```

可以看到，凡是以 @ 开头的行，都是 Objective-C 新增的功能。

反过来，没有 @ 的部分，就是原封不动照搬自 C 语言的语法。

只要看有没有 @，就能一眼分辨出“啊，这是 Objective-C 扩展的部分”。

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/3.png" alt="光是留意 @，读代码就会顺畅很多">
  <figcaption>光是留意 @，读代码就会顺畅很多</figcaption>
</figure>

---

## 常见问题（Q&A）

**Q. @ 和预处理指令 # 是一回事吗？**

不是。#include 里的 # 是在编译之前就被处理掉的预处理指令。而 @ 则是由编译器直接解析的 Objective-C 编译器指令（directive），二者的角色并不相同。

**Q. @ 的种类除了这些还有很多吗？**

是的，相当多。像 @protocol、@selector、@try/@catch、@autoreleasepool 等等都有。在较新的语法里，甚至可以用 @[] 简单创建数组、用 @{} 创建字典、用 @42 创建数字对象。

**Q. Swift 里好像也有 @ 符号？**

没错，不过含义有些不同。Swift 的 @ 主要用于像 @State、@IBOutlet 这样的属性（attribute）标记。虽然根源类似，但用法上还是要区分开来看。

---

代码里到处挂着的这个 @ 符号，一开始可能会觉得陌生，但一旦明白它是“划分 C 与 Objective-C 的分界线”，反而会觉得它很贴心。

只要跟着 @ 走，就能一眼看出从哪里开始是面向对象的语法。阅读 Objective-C 代码时，只要记住这一个视角，就会轻松很多。祝大家编码愉快！
