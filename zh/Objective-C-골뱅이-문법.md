---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 的@符号语法，为什么全都以@开头？（完全整理）"
lang: zh
description: "第一次打开 Objective-C 代码时，最先映入眼帘的东西大概就是这个。"
header:
  og_image: /assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png
categories:
  - iOS
tags:
  - Objective-C
  - at符号语法
  - 编程基础
  - iOS开发
  - C语言
  - NSString
  - 编程学习
  - 开发者
  - 苹果开发
  - Objective-C语法
permalink: /zh/Objective-C-골뱅이-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · [English](/en/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · [日本語](/ja/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/) · **中文**
{: .notice--info}

第一次打开 Objective-C 代码时，最先映入眼帘的东西大概就是这个。

没错，就是到处出现的@符号。

@interface、@property，甚至连字符串都写成 @"Hello" 这样。我一开始也纳闷：“这不是打错了吗？”

但这个@其实有非常明确的理由。

> Objective-C 的@是在向编译器发出信号：“从这里开始，不是纯 C，而是 Objective-C 的扩展语法。”

今天就来轻松聊聊，为什么@interface、@property、@"字符串" 都统一带着这个符号，背后的原理是什么。

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/1-1783736148635.png" alt="Objective-C 的@符号语法，其实规则只有一条">
  <figcaption>Objective-C 的@符号语法，其实规则只有一条</figcaption>
</figure>

---

## Objective-C 的@到底是什么？

先说结论。

@是向编译器标示“这是 Objective-C 独有语法”的特殊符号。

要理解这一点，得先了解 Objective-C 的出身。

Objective-C 并不是一门全新的语言。它是在 C 语言基础上，加上了面向对象功能而形成的语言。

也就是说，它百分之百保留了 C 语言，只是在此之上又添加了类、消息等新功能。

但这样一来就出现了一个问题。

对编译器来说，必须要区分清楚：哪些是原本的 C 语法，哪些是新加入的 Objective-C 语法。

而画出这条分界线的标记，正是@。

---

## 为什么偏偏选中了@符号？

这一点我也很好奇。明明还有星号（*）、井号（#）这些符号，为什么偏偏是@呢？

答案出乎意料地实际。

在 C 语言的标准语法中，@这个符号完全没有被使用过。

我们回顾一下 C 语言用到的字符。

- 变量·函数名：英文字母、数字、下划线（_）
- 运算符：+、-、*、/、=、& 等
- 预处理指令：#（例如 #include）

这份清单里，哪儿都找不到@。

所以 Objective-C 的设计者们就把@拿来用了。因为它是一个绝不会与现有 C 代码发生冲突的安全符号。

如果不用@，而是直接把 interface 这个单词当作关键字，那么原本用 interface 作变量名的 C 代码就全都会崩溃。

在前面加上@，就从根本上杜绝了这种冲突。

打个比方，@就像是专门存放 Objective-C 专属语法的那个抽屉的把手。

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/2.png" alt="来自 C 的部分，和 Objective-C 新增的部分，@就是那条分界线">
  <figcaption>来自 C 的部分，和 Objective-C 新增的部分，@就是那条分界线</figcaption>
</figure>

---

## @interface、@property、@"字符串"为什么都用@

现在进入正题。来说说这三个看起来性质不同的东西，为什么都统一以@开头。

先说结论：因为这三者都是“C 语言里没有、Objective-C 独有的功能”。

逐个来看。

**@interface** — 用来开启类的骨架（声明）的指令。C 语言里根本没有“类”这个概念，所以必须用@来标示。它的搭档@implementation、@end 也是同样的道理。

**@property** — 自动生成对象属性的功能。这也是纯 C 语言中没有的语法，所以要带上@。

**@"字符串"** — 这个最有意思。只用引号写的 "Hello" 和 @"Hello" 完全是两种不同的东西。

用表格比较一下。

| 区分 | "Hello" | @"Hello" |
|------|---------|----------|
| 本质 | C 风格字符数组 | NSString 对象 |
| 所属 | 原本的 C 语法 | Objective-C 扩展 |
| 功能 | 单纯的字符排列 | 可使用 length 等方法 |

在引号前面只加一个@，单纯的字符堆叠就摇身一变成了“对象”。

这就是为什么需要@。它相当于一句指令：“这个字符串别当成普通的 C 字符串，把它做成 NSString 对象。”

总结一下就是这样。

> 无论是@interface、@property，还是@"字符串"，都是“C 语言里没有、只有 Objective-C 才有的功能”，所以才都挂着同一个@标记。

---

## 用代码一眼看懂

光靠文字讲可能有点抽象，所以准备了一个简短的示例。

下面是一个简单的类声明示意。可以看看@是如何把 Objective-C 语法包裹起来的。

```objectivec
@interface Person : NSObject   // 类声明开始（C语言中没有的语法）
@property NSString *name;      // 自动生成属性
@end                           // 声明结束

NSString *greeting = @"안녕하세요"; // 引号前加@ → 变成NSString对象
```

可以看到，以@开头的那几行，全都是 Objective-C 新增的功能。

反过来，没有@的部分，则是原封不动从 C 语言继承过来的语法。

这样一来，光看有没有@，就能一眼分辨出“啊，这是 Objective-C 的扩展”。

<figure>
  <img src="/assets/images/posts/cf7051a5-d2b2-4767-b509-eaf6b196539c/3.png" alt="只要盯住@，读代码也会轻松不少">
  <figcaption>只要盯住@，读代码也会轻松不少</figcaption>
</figure>

---

## 常见问题（Q&A）

**Q. @和预处理指令#是一回事吗？**

不是的。#include 里的#是在编译之前就会被处理的预处理指令。而@则是由编译器直接解析的 Objective-C 编译器指令（directive），两者角色不同。

**Q. 除此之外，@的种类还有很多吗？**

是的，相当多。像@protocol、@selector、@try/@catch、@autoreleasepool 等都很常见。在较新的语法中，甚至可以用@[]创建数组、@{}创建字典、@42创建数字对象，都非常简洁。

**Q. Swift 里也有@，是吗？**

没错。不过含义略有不同。Swift 的@主要用于属性（attribute）标注，比如@State、@IBOutlet。虽然根源相似，但用法还是要区分开来看。

---

一开始每段代码上都挂着的这个@符号，让我觉得既陌生又别扭，但后来明白了它是“划分 C 和 Objective-C 的分界线”之后，反而觉得挺亲切的。

只要跟着@走，就能一眼看出哪里开始是面向对象的语法。阅读 Objective-C 代码时，只要记住这一点，会轻松很多。祝大家今天也编码愉快！
