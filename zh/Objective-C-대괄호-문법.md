---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 的方括号语法,为什么会长成这样?(消息发送的秘密)"
lang: zh
description: "刚开始学 iOS 的时候,第一次看到 Objective-C 代码,说实话我有点懵。"
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
  - 开发入门
  - 苹果开发
  - 编程基础
  - OC语法
permalink: /zh/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [English](/en/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **中文**
{: .notice--info}

刚开始学 iOS 的时候,第一次看到 Objective-C 代码,说实话我有点懵。

满屏都是方括号 `[ ]`。看起来像是在调用函数,但和其他语言的写法差太多了。

"这到底是为什么要设计成这样?"这个疑问一直萦绕在我心里。

先说结论:Objective-C 的方括号不是在"调用"函数,而是在给对象"发送消息"的语法。只要抓住这一个概念,原本陌生的方括号一下子就变得亲切起来了。

今天就来轻松聊聊这个方括号为什么长成这样,从它的根源说起。😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C 的方括号语法,这个样子是有原因的">
  <figcaption>Objective-C 的方括号语法,这个样子是有原因的</figcaption>
</figure>

---

## 先划一下重点

先把这篇文章能带给你的收获整理一下。

1. Objective-C 的方括号意思是"给对象发送消息"
2. 这套语法继承自一门叫 Smalltalk 的语言
3. 只要掌握 `[对象 方法]` 这个结构,大部分代码都能读懂
4. 在底层,它会被转换成一个叫 `objc_msgSend` 的函数来执行

只要理解这四点,今天的目标就算达成了。

---

## Objective-C 消息发送语法,到底是什么?

在其他语言里调用方法,通常是这样写的:

`object.method()`

但 Objective-C 是这样写的:

```objc
// 给 dog 对象发送 bark 这条消息
[dog bark];

// 把 count 值作为参数一起发送
[dog barkTimes:3];
```

样子虽然陌生,结构却很简单:

`[接收对象 发送的消息]`

打开方括号,左边放接收消息的对象,右边写要发送的消息。

所以 `[dog bark]` 的意思就是"dog 啊,叫一声吧"。

我把它理解成"打招呼"而不是"函数调用",这样理解起来轻松多了。

参数多的时候,写法会像这样往后延伸:

```objc
// 消息名被拆成 setName: age: 两段
[person setName:@"哲洙" age:20];
```

可以理解为每个冒号(:)后面都跟着一个值。

---

## 方括号为什么会长成这样?

> Objective-C 的方括号,是把 Smalltalk 语言"消息发送"的哲学嫁接到 C 语言之上留下的痕迹。

这段故事要追溯到上世纪 80 年代初。

布拉德·考克斯(Brad Cox)和汤姆·洛夫(Tom Love)这两个人创造了 Objective-C。

他们想沿用当时流行的 C 语言,同时在其中加入面向对象的概念。

而这个面向对象的榜样,正是 Smalltalk。

Smalltalk 的核心哲学是"万物皆对象,对象之间通过互相发送消息来交流"。

问题在于,他们需要在不破坏 C 语法的前提下,把这个消息概念塞进去。

于是他们借用了 C 语法里几乎不怎么用的方括号,把这个空间定义为发送消息的地方。

多亏如此,即使和原有的 C 代码混在一起,也不会产生冲突,能够清楚区分开来。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="习惯了&quot;发送&quot;消息的感觉,方括号就顺眼多了">
  <figcaption>习惯了&quot;发送&quot;消息的感觉,方括号就顺眼多了</figcaption>
</figure>

后来这门语言被 NeXT 公司采用,苹果在 1996 年收购 NeXT 之后,它就成了 Mac 和 iPhone 开发的骨架。

我们熟知的 Cocoa 框架,也是由此而来。

一个看似陌生的方括号里,竟然藏着这么长的一段历史。

---

## 和点(.)语法有什么不同?

现在看 Objective-C 代码,也经常能看到点(.)语法。

比如 `dog.name` 这样的写法。

所以很容易混淆,我把两者的关系整理成了一张表。

| 区分 | 方括号语法 | 点(.)语法 |
|------|------------|------------|
| 形式 | `[dog name]` | `dog.name` |
| 含义 | 消息发送 | 属性访问 |
| 出现时间 | 从早期就有 | Objective-C 2.0(2007年)之后 |
| 内部运作 | 执行方法 | 实际上会转换成方法调用 |

有意思的是,点语法最终在内部也会转换成方括号消息。

也就是说,`dog.name` 在执行时,做的事情和 `[dog name]` 是一样的。

点语法只不过是为了方便阅读而套上的一件"外衣"。

所以我建议初学者先理解方括号才是本质。

---

## 方括号里到底发生了什么?

再往深处走一点。

写下 `[dog bark]` 时,编译器会把它转换成一个叫 `objc_msgSend` 的函数调用。

```objc
// 我们写的代码
[dog bark];

// 在底层大致会被转换成这样
objc_msgSend(dog, @selector(bark));
```

第一个位置放的是接收消息的对象,第二个位置放的是要执行的方法名(选择器)。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/4-1783847992119.png" alt="外表不同,最终都殊途同归">
  <figcaption>外表不同,最终都殊途同归</figcaption>
</figure>

这种方式在运行时才决定要执行哪个方法,因此非常灵活。

多亏如此,Objective-C 在运行过程中动态替换或添加方法的能力非常强。

方括号这层外表背后,其实藏着这样一套灵活的结构。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="我一开始也觉得别扭,用了几天就顺手了">
  <figcaption>我一开始也觉得别扭,用了几天就顺手了</figcaption>
</figure>

---

## 用问答整理一下

**Q. 方括号一定要背下来吗?**

与其说是背,不如说只要抓住 `[接收对象 发送的消息]` 这个结构的感觉,自然而然就能读懂了。

**Q. 现在都用 Swift 了,还有必要了解吗?**

很多历史悠久的库和示例代码依然是用 Objective-C 写的,能读懂的话会有很大帮助。

**Q. 方括号里面又嵌套着方括号怎么办?**

这是内层结果被外层再次接收的结构。从里往外读就能理清楚。

---

一开始我也觉得方括号只是个奇怪的规则,但把想法换成"这是在跟对象打招呼的语法"之后,一下子就亲切多了。

越是陌生的语法,了解了它的根源之后,反而越容易记住。

希望今天这篇文章,能成为你和 Objective-C 更加熟络起来的契机。为你加油!🙌
