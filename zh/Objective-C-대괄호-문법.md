---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 的方括号语法,为什么会长这样?(消息发送的秘密)"
lang: zh
description: "刚开始学习 iOS 的时候,第一次看到 Objective-C 代码很容易懵。"
header:
  og_image: /assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png
categories:
  - iOS
tags:
  - ObjectiveC
  - iOS开发
  - 编程语言
  - 消息发送
  - Smalltalk
  - 编程学习
  - 入门开发
  - 苹果开发
  - 编程基础
  - Objective-C语法
permalink: /zh/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [English](/en/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **中文**
{: .notice--info}

刚开始学习 iOS 的时候,第一次看到 Objective-C 代码很容易懵。

满屏都是方括号 `[ ]`。看起来像是函数调用,但和其他语言的写法实在太不一样了。

难免会好奇:"这到底是为什么要设计成这样?"

先说结论:Objective-C 的方括号不是在"调用"函数,而是在向对象"发送消息"的语法。只要抓住这一个概念,原本陌生的方括号一下子就变得容易理解了。

今天就来轻松聊聊这个方括号为什么长成这样,从它的根源说起。😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C 的方括号语法,这个样子是有原因的">
  <figcaption>Objective-C 的方括号语法,这个样子是有原因的</figcaption>
</figure>

---

## 先看核心要点

先整理一下这篇文章能带给你的内容。

1. Objective-C 的方括号意味着"向对象发送消息"
2. 这套语法继承自一门叫 Smalltalk 的语言
3. 只要掌握 `[对象 方法]` 这个结构,大部分代码都能读懂
4. 在底层,它会被转换成一个叫 `objc_msgSend` 的函数来执行

只要理解了这四点,今天的目标就算达成了。

---

## Objective-C 的消息发送语法,到底是什么?

在其他语言里调用方法,通常是这样写的:

`object.method()`

但 Objective-C 是这样写的:

```objc
// 向 dog 对象发送 bark 这条消息
[dog bark];

// 同时把 count 值作为参数传过去
[dog barkTimes:3];
```

外观虽然陌生,结构却很简单。

`[接收对象 发送的消息]`

打开方括号,左边写接收消息的对象,右边写要发送的消息。

所以 `[dog bark]` 的意思就是"dog啊,叫一声吧"。

与其把这理解成"函数调用",不如理解成"跟对象说话",这样会顺畅很多。

参数多的时候,写法会像这样展开:

```objc
// 消息名 setName:age: 被拆成了两段
[person setName:@"哲洙" age:20];
```

可以理解为每个冒号(:)后面都挂着一个值。

---

## 方括号为什么会长成这样?

> Objective-C 的方括号,是把 Smalltalk 语言的"消息发送"哲学嫁接到 C 语言之上留下的痕迹。

故事要追溯到 20 世纪 80 年代初。

Brad Cox 和 Tom Love 两个人创造了 Objective-C。

他们想沿用当时流行的 C 语言,同时在此基础上加入面向对象的概念。

而那个面向对象的范本,正是 Smalltalk。

Smalltalk 的核心理念是:"万物皆对象,对象之间通过消息互相交流。"

问题在于,他们需要在不破坏 C 语法的前提下,把这套消息概念塞进去。

于是他们借用了在 C 语法里几乎用不到的方括号,把这个符号内部定为发送消息的空间。

这样一来,即便和现有的 C 代码混在一起,也不会冲突,能够清楚区分开。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="习惯了&quot;发送&quot;消息的感觉,方括号就会顺眼起来">
  <figcaption>习惯了&quot;发送&quot;消息的感觉,方括号就会顺眼起来</figcaption>
</figure>

后来这门语言被 NeXT 公司采用,1996 年苹果收购 NeXT 之后,它成了 Mac 和 iPhone 开发的骨架。

我们熟悉的 Cocoa 框架,也是由此而来。

一个看似陌生的方括号,背后竟然藏着这么长的一段历史。

---

## 和点(.)语法有什么不同?

如今看 Objective-C 代码,也会经常看到点(.)语法。

比如 `dog.name` 这样的写法。

这两者很容易搞混,我把它们的关系整理成了下表。

| 区分 | 方括号语法 | 点(.)语法 |
|------|------------|------------|
| 形式 | `[dog name]` | `dog.name` |
| 含义 | 消息发送 | 属性访问 |
| 出现时期 | 从早期就存在 | Objective-C 2.0(2007年)之后 |
| 内部运作 | 执行方法 | 实际上会转换成方法 |

有意思的是,点语法在底层最终也会转换成方括号消息。

也就是说,`dog.name` 在执行时和 `[dog name]` 做的是同一件事。

点语法只不过是为了看起来更方便而套上的一层外衣。

所以我建议初学者先理解方括号才是本质。

---

## 方括号内部到底发生了什么?

再深入一点看看。

写下 `[dog bark]` 之后,编译器会把它转换成一个叫 `objc_msgSend` 的函数调用。

```objc
// 我们写的代码
[dog bark];

// 在内部大致会被转换成这样
objc_msgSend(dog, @selector(bark));
```

第一个位置放接收消息的对象,第二个位置放要执行的方法名标签(selector)。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/4-1783847992119.png" alt="外表各不相同,最终却都汇聚到同一处">
  <figcaption>外表各不相同,最终却都汇聚到同一处</figcaption>
</figure>

这种方式可以在运行时才决定要执行哪个方法,因此非常灵活。

正因如此,Objective-C 在运行过程中动态替换或添加方法的能力很强。

方括号这层外表之下,隐藏的正是这样一套灵活的结构。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="一开始也觉得别扭,但用几天就上手了">
  <figcaption>一开始也觉得别扭,但用几天就上手了</figcaption>
</figure>

---

## 用问答来做个整理

**Q. 一定要把方括号背下来吗?**

与其说是背,不如说只要抓住 `[接收对象 发送的消息]` 这个结构的感觉,自然而然就能读懂了。

**Q. 现在都用 Swift 了,还有必要了解吗?**

很多老旧的库或示例代码依然是用 Objective-C 写的,能读懂的话会有很大帮助。

**Q. 方括号里面还嵌着方括号怎么办?**

那是内层结果被外层再次接收的结构。从里往外读就能理清楚。

---

方括号本来看起来像是一条奇怪的规则,但只要换个念头,把它当成"跟对象说话的语法",一下子就会变得亲切许多。

越是陌生的语法,了解了它的根源之后,反而记得更牢。

希望今天这篇文章能成为你和 Objective-C 更熟悉一点的契机。加油! 🙌
