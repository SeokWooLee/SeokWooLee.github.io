---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C 的 nil 和 Java 的 null 有什么不同，为什么表现不一样"
lang: zh
description: "刚开始接触 iOS 开发的时候，最让我摸不着头脑的就是这件事。"
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - ObjectiveC
  - nil
  - iOS开发
  - NullPointerException
  - objc_msgSend
  - Swift可选值
  - 编程
  - 运行时
  - 开发学习
  - 编码
permalink: /zh/Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-nil/) · [English](/en/Objective-C-nil/) · [日本語](/ja/Objective-C-nil/) · **中文**
{: .notice--info}

刚开始接触 iOS 开发的时候，最让我摸不着头脑的就是这件事。

在 Java 或 C++ 里，只要对 nil（空）对象做点什么，程序马上就崩溃了吧。就是那个大名鼎鼎的 NullPointerException。

可是 Objective-C 里，就算给 nil 发消息，也是安安静静的。既不崩溃，也不报错。

一开始我还以为“这不是个 bug 吗”，后来才知道，这其实是语言层面故意设计成这样的。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-C 的 nil 消息会悄悄放行，而不是抛出异常">
  <figcaption>Objective-C 的 nil 消息会悄悄放行，而不是抛出异常</figcaption>
</figure>

先说结论：在 Objective-C 里给 nil 发消息，什么都不会发生，只会老老实实返回一个 0（或者 nil）。

这并不是对错误的放任，而是语言层面刻意打造的一道安全阀。

今天就来聊聊为什么会有这样的行为，以及我们该怎么看待它。

---

## 为什么给 nil 发消息不会崩溃？

关键就在 Objective-C 的消息发送机制上。

我们写 `[object doSomething]` 这样的代码时，编译器会把它转换成 `objc_msgSend(object, @selector(doSomething))` 这样一个函数调用。

这不是直接调用方法，而是在运行时“拜托”一句：“麻烦把这条消息传给这个对象。”

而这个 `objc_msgSend` 函数，一上来就会先检查接收消息的对象是不是 nil。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/4-1783847973933.png" alt="objc_msgSend 悄悄吞掉 nil 的那个瞬间">
  <figcaption>objc_msgSend 悄悄吞掉 nil 的那个瞬间</figcaption>
</figure>

如果接收对象是 nil 呢？

> 它不会去查找方法，而是当场直接返回 0，安静地结束。

也就是说，nil 就像一个“把消息吞掉的存在”。反正发出去也到不了任何地方，自然也就没有崩溃这回事了。

```objc
// receiver 为 nil 时不会查找方法，直接返回 0
NSString *name = nil;
NSUInteger len = [name length];  // 不会崩溃，len == 0
```

---

## 这跟 NullPointerException 到底有什么不一样？

这一点很多人容易搞混，我整理成表格来说明。

| 项目 | Objective-C（nil） | Java（null） |
|------|-------------------|-------------|
| 对 null 调用方法 | 忽略并返回 0/nil | 抛出 NullPointerException |
| 应用运行状态 | 不崩溃，继续执行 | 因异常而崩溃 |
| 处理主体 | 运行时（objc_msgSend） | JVM 异常处理机制 |

Java 一旦访问 null 引用，就会立刻抛出异常，告诉你“这个对象根本不存在”。

而 Objective-C 的运行时则把 nil 当作一个正常的值来处理。

所以很多从 Java 转到 Objective-C 的开发者，一开始都会因为这个差异感到别扭好一阵子。

返回值也会根据类型略有不同：对象类型返回 nil，数值类型返回 0，结构体则返回一个全部填充为 0 的值。

---

## 不崩溃就一定是好事吗？

老实说，这是一把双刃剑。

优点确实很明显：不用在代码里到处堆砌 nil 判断。

比如说，数组为空导致返回了 nil，这时候你去问它的 `count`，得到的也只是 0，流程不会因此中断。

但恰恰是这一点，也会变成陷阱。

因为 bug 不会以崩溃的形式暴露出来，而是被悄悄地埋掉了。

我以前也遇到过数据死活显示不出来的情况，折腾了好久才发现，原来中间某个对象是 nil，导致后面所有消息都被悄悄忽略了。

要是真崩溃了，反而能很快定位问题，但因为一切都安静地过去了，排查原因反而花了更久的时间。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="亲自运行一下，很快就能确认真的不会崩溃">
  <figcaption>亲自运行一下，很快就能确认真的不会崩溃</figcaption>
</figure>

所以，开发者养成习惯去区分“这里允许 nil 流过”还是“这里必须有值”，就显得格外重要。

---

## 实际开发中该怎么处理比较好？

分享几个我自己常用的方法。

1. 在重要的分支逻辑中，显式检查 nil（`if (object == nil)`）
2. 对可能返回 nil 的方法，用注释或命名方式提前标注出来
3. 如果怀疑出现了意料之外的 nil，用 `NSAssert` 在开发阶段提前拦截

特别是到了 Swift，情况又不一样了。

Swift 干脆用可选值（Optional）这个概念，把 nil 的可能性直接钉死在了类型系统里。

可能为 nil 的值必须加上问号来标注，解包使用时也强制要求安全处理。

可以说，Objective-C 的“悄悄放行”，到了 Swift 变成了“提前摊开来讲”。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="和 Swift 放在一起看，设计理念的差异一目了然">
  <figcaption>和 Swift 放在一起看，设计理念的差异一目了然</figcaption>
</figure>

---

Objective-C 对 nil 消息不崩溃，不是 bug，而是一种设计理念。

方便的同时，也难免藏着一些安静的 bug；一旦理解了“为什么不会崩溃”，反而能写出更扎实的代码。

如果你现在正对着 iOS 代码里一片莫名其妙的空白界面发愁，不妨看看中间是不是悄悄溜过了一个 nil。相信一定会有帮助。
