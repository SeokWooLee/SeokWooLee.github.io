---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C的方括号语法，为什么长这样？（消息传递的秘密）"
lang: zh
description: "刚开始学iOS的时候，第一次看到Objective-C代码，说实话我有点懵。"
header:
  og_image: /assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png
categories:
  - iOS
tags:
  - ObjectiveC
  - iOS开发
  - 编程语言
  - 消息传递
  - Smalltalk
  - 编程学习
  - 开发入门
  - 苹果开发
  - 编程基础
  - 代码语法
permalink: /zh/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [English](/en/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **中文**
{: .notice--info}

刚开始学iOS的时候，第一次看到Objective-C代码，说实话我有点懵。

满屏都是方括号`[ ]`。看起来像是在调用函数，但和其他语言的写法差太多了。

"这到底是为什么要设计成这样？"这个疑问一直萦绕在我脑子里。

先说结论：Objective-C的方括号并不是在"调用"函数，而是在向对象"发送消息"的语法。只要抓住这一个概念，原本陌生的方括号一下子就变得清晰了。

今天就来轻松聊聊这个方括号到底是怎么来的，从它的根源说起。😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C的方括号语法，这个样子都是有原因的">
  <figcaption>Objective-C的方括号语法，这个样子都是有原因的</figcaption>
</figure>

---

## 先划重点

先把这篇文章能带给你的收获整理一下。

1. Objective-C的方括号意味着"向对象发送消息"
2. 这套语法是从Smalltalk这门语言继承来的
3. 只要掌握`[对象 方法]`这个结构，大部分代码都能读懂
4. 在底层，它会被转换成一个叫`objc_msgSend`的函数来执行

只要理解这四点，今天的目标就算达成了。

---

## Objective-C的消息传递语法，到底是什么？

在大多数其他语言里，调用方法通常是这样写的。

`object.method()`

但Objective-C是这样写的。

```objc
// 向dog对象发送bark这条消息
[dog bark];

// 把count值作为参数一起传过去
[dog barkTimes:3];
```

虽然长得陌生，但结构其实很简单。

`[接收对象 要发送的消息]`

打开方括号，左边放接收消息的对象，右边写要发送的消息。

所以`[dog bark]`的意思就是"dog，你叫一声吧"。

我觉得与其把它理解成"调用函数"，不如理解成"跟对象搭话"，这样反而更容易接受。

参数多的时候，会像这样往后延伸。

```objc
// 消息名被拆成setName:age:两段
[person setName:@"哲洙" age:20];
```

可以理解为每个冒号（:）后面都跟着一个值。

---

## 方括号为什么长这样？

> Objective-C的方括号，是把Smalltalk语言"消息传递"的理念叠加到C语言之上后留下的痕迹。

这个故事要追溯到20世纪80年代初。

布拉德·考克斯（Brad Cox）和汤姆·洛夫（Tom Love）这两个人创造了Objective-C。

他们想沿用当时流行的C语言，同时在此基础上加入面向对象的理念。

而这种面向对象思路的范本，正是Smalltalk。

Smalltalk的核心理念是"万物皆对象，对象之间通过消息互相交流"。

问题在于，他们必须在不破坏C语法的前提下，把这种消息的概念塞进去。

于是他们借用了在C语法中几乎不怎么用到的方括号，把这个空间定义为发送消息的地方。

这样一来，即便和已有的C代码混在一起，也不会产生冲突，能够清晰区分。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="习惯了&quot;发送&quot;消息的感觉，方括号就会变得顺手">
  <figcaption>习惯了&quot;发送&quot;消息的感觉，方括号就会变得顺手</figcaption>
</figure>

后来这门语言被NeXT公司采用，1996年苹果收购NeXT之后，它就成了Mac和iPhone开发的骨架。

我们熟知的Cocoa框架，也是由此诞生的。

一个看似陌生的方括号，背后竟藏着这么长的一段历史。

---

## 和点（.）语法有什么区别？

现在再看Objective-C代码，也经常能看到点（.）语法。

比如`dog.name`这样的写法。

所以很容易搞混，我把两者的关系整理成了一张表。

| 对比项 | 方括号语法 | 点（.）语法 |
|------|------------|------------|
| 形式 | `[dog name]` | `dog.name` |
| 含义 | 消息传递 | 属性访问 |
| 出现时期 | 从最初就有 | Objective-C 2.0（2007年）之后 |
| 内部机制 | 执行方法 | 实际上会转换成方法 |

有意思的是，点语法在底层最终也会转换成方括号消息。

也就是说，`dog.name`在执行时，做的事情其实和`[dog name]`一样。

点语法不过是为了方便阅读而套上的一层外衣。

所以我建议初学者先理解方括号才是本质。

---

## 方括号内部实际上发生了什么？

我们再深入一点看看。

写下`[dog bark]`时，编译器会把它转换成一个叫`objc_msgSend`的函数调用。

```objc
// 我们写的代码
[dog bark];

// 内部大致会被转换成这样
objc_msgSend(dog, @selector(bark));
```

第一个位置放接收消息的对象，第二个位置放要执行的方法的名称标签（选择器）。

这种方式在运行时才决定要执行哪个方法，因此非常灵活。

正因如此，Objective-C在运行过程中动态替换或添加方法的能力很强。

方括号这层外表之下，其实隐藏着这样一套灵活的结构。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="我一开始也觉得别扭，但用了几天就上手了">
  <figcaption>我一开始也觉得别扭，但用了几天就上手了</figcaption>
</figure>

---

## 用问答来总结一下

**Q. 方括号一定要死记硬背吗？**

与其说是死记硬背，不如说只要抓住`[接收对象 要发送的消息]`这个结构的感觉，自然就能读懂了。

**Q. 现在都用Swift了，还有必要了解吗？**

很多老旧的库或示例代码依然是用Objective-C写的，如果能读懂，会有很大帮助。

**Q. 方括号里面又嵌套了方括号怎么办？**

这是内层结果被外层再次接收的结构。从内往外读就能理清楚。

---

一开始我也觉得方括号只是个奇怪的规则，但转念把它想成"跟对象搭话的语法"之后，一下子就觉得亲切多了。

越是陌生的语法，了解了它的根源之后，反而更容易长久记住。

希望今天这篇文章，能成为你和Objective-C更熟悉一点的契机。为你加油！🙌
