---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 的方括号语法,为什么会是这个样子?(消息传递的秘密)"
lang: zh
description: "刚开始学习 iOS 开发、第一次看到 Objective-C 代码时,很容易感到手足无措。"
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
  - 入门开发
  - 苹果开发
  - 编码基础
  - Objective-C教程
permalink: /zh/Objective-C-대괄호-문법/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [English](/en/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · [日本語](/ja/Objective-C-%EB%8C%80%EA%B4%84%ED%98%B8-%EB%AC%B8%EB%B2%95/) · **中文**
{: .notice--info}

刚开始学习 iOS 开发、第一次看到 Objective-C 代码时,很容易感到手足无措。

满眼都是方括号 `[ ]`。看起来像是函数调用,但和其他语言的写法差别实在太大了。

难免会让人产生这样的疑问:“为什么要设计成这样?”

先说结论:Objective-C 的方括号并不是在“调用”函数,而是在向对象“发送消息”的语法。只要抓住这一个概念,原本陌生的方括号一下子就变得容易理解了。

今天就来轻松聊聊这个方括号为什么长成这样,从它的根源说起。😊

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/1-1783736148634.png" alt="Objective-C 的方括号语法,这个样子是有原因的">
  <figcaption>Objective-C 的方括号语法,这个样子是有原因的</figcaption>
</figure>

---

## 先划重点

先把这篇文章能带给你的内容整理一下。

1. Objective-C 的方括号意味着“向对象发送消息”
2. 这个语法继承自一门叫 Smalltalk 的语言
3. 只要掌握 `[对象 方法]` 这个结构,大部分代码都能读懂
4. 在底层会被转换成一个叫 `objc_msgSend` 的函数来执行

只要理解这四点,今天的目标就算达成了。

---

## Objective-C 的消息传递语法,到底是什么?

在大多数其他语言里,调用方法通常是这样写的。

`object.method()`

但 Objective-C 是这样写的。

```objc
// 向 dog 对象发送 bark 消息
[dog bark];

// 同时把 count 值作为参数一起发送
[dog barkTimes:3];
```

写法虽然陌生,结构却很简单。

`[接收对象 发送的消息]`

打开方括号,左边放接收消息的对象,右边写要发送的消息。

所以 `[dog bark]` 的意思就是“dog啊,汪一声吧”。

把它理解成“打招呼”而不是“函数调用”,会顺畅很多。

当参数有多个时,写法会像这样延展开来。

```objc
// 消息名被拆成 setName: 和 age: 两段
[person setName:@"철수" age:20];
```

可以理解为每个冒号(:)后面都跟着一个值。

---

## 方括号为什么会长成这样?

> Objective-C 的方括号,是把 Smalltalk 语言的“消息传递”哲学嫁接到 C 语言之上时留下的痕迹。

故事要追溯到 20 世纪 80 年代初。

布拉德·考克斯(Brad Cox)和汤姆·洛夫(Tom Love)两个人创造了 Objective-C。

他们想在当时流行的 C 语言基础上原样保留其语法,同时加入面向对象的概念。

而这个面向对象的样板,正是 Smalltalk。

Smalltalk 的核心哲学是“万物皆对象,对象之间通过消息互相通信”。

问题在于,他们需要在不破坏 C 语法的前提下,把这种消息概念塞进去。

于是他们借用了 C 语法里几乎不用的方括号,把这个空间定义为发送消息的地方。

这样一来,方括号语法就能和原有的 C 代码混用而不产生冲突。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/2.png" alt="习惯了“发送”消息的感觉,方括号就会变得顺手">
  <figcaption>习惯了“发送”消息的感觉,方括号就会变得顺手</figcaption>
</figure>

后来这门语言被 NeXT 公司采用,1996 年苹果收购 NeXT 之后,它成了 Mac 和 iPhone 开发的骨架。

我们熟知的 Cocoa 框架,也正是由此而来。

一个看似陌生的方括号里,竟然藏着这么长的一段历史。

---

## 和点(.)语法有什么区别?

如今再看 Objective-C 代码,也经常能看到点(.)语法。

比如 `dog.name` 这样的写法。

所以很容易让人混淆,下面把两者的关系整理成一张表。

| 区分 | 方括号语法 | 点(.)语法 |
|------|------------|------------|
| 形态 | `[dog name]` | `dog.name` |
| 含义 | 消息传递 | 属性访问 |
| 出现时期 | 从早期就有 | Objective-C 2.0(2007年)之后 |
| 内部动作 | 执行方法 | 实际上会转换成方法调用 |

有意思的是,点语法在底层最终也会被转换成方括号消息。

也就是说,`dog.name` 在执行时其实和 `[dog name]` 做的是同一件事。

点语法只不过是为了看起来更方便而套上的一层外衣。

所以对初学者来说,我建议先理解“方括号才是本质”这件事。

---

## 方括号里到底发生了什么?

我们再深入一点看看。

当你写下 `[dog bark]` 时,编译器会把它转换成一次 `objc_msgSend` 函数调用。

```objc
// 我们写的代码
[dog bark];

// 底层大致会被转换成这样
objc_msgSend(dog, @selector(bark));
```

第一个位置放接收消息的对象,第二个位置放要执行的方法名标签(selector)。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/4-1783847992119.png" alt="外表虽然不同,最终都会汇到同一个地方">
  <figcaption>外表虽然不同,最终都会汇到同一个地方</figcaption>
</figure>

这种方式是在运行时才决定要执行哪个方法,因而非常灵活。

正因如此,Objective-C 在运行过程中替换或添加方法的动态能力很强。

方括号这层外表之下,隐藏的正是这样一套灵活的结构。

<figure>
  <img src="/assets/images/posts/814948f6-67d4-44f6-8d1d-b751c4a65b42/3.png" alt="用不了几天,这套语法就会变得得心应手">
  <figcaption>用不了几天,这套语法就会变得得心应手</figcaption>
</figure>

---

## 用 Q&A 来梳理一下

**Q. 一定要死记硬背方括号语法吗?**

与其说是背下来,不如说只要抓住 `[接收对象 发送的消息]` 这个结构的感觉,自然就能读懂了。

**Q. 现在都用 Swift 了,还有必要了解吗?**

很多年代久远的库和示例代码仍然是用 Objective-C 写的,如果能读懂,会有很大帮助。

**Q. 如果方括号里面还嵌套着方括号呢?**

这是内层结果被外层再次接收的结构。从里往外读,就能理清楚。

---

方括号本来看起来像是一条奇怪的规则,但只要把想法换成“这是在向对象打招呼的语法”,一下子就会觉得亲切许多。

越是陌生的语法,了解了它的根源之后,反而越容易记得住。

希望今天这篇文章,能成为你和 Objective-C 更亲近一步的契机。加油! 🙌
