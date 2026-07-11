---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C nil 与 Java null 的区别，为什么表现不一样"
lang: zh
description: "作为开发者第一次接触 iOS 时，最让我懵的就是这个。"
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - ObjectiveC
  - nil
  - iOS开发
  - NullPointerException
  - objcmsgSend
  - Swift可选值
  - 编程
  - 运行时
  - 开发学习
  - 编程语言
permalink: /zh/Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-nil/) · [English](/en/Objective-C-nil/) · [日本語](/ja/Objective-C-nil/) · **中文**
{: .notice--info}

作为开发者第一次接触 iOS 时，最让我懵的就是这个。

在 Java 或 C++ 里，只要对 nil（空）对象做点什么，应用马上就崩了吧。就是那个赫赫有名的 NullPointerException。

可是 Objective-C 里，就算给 nil 发消息，也是静悄悄的。不崩溃，也不报错。

一开始我还以为“这不是 bug 吗？”，后来才发现原来是语言故意这么设计的。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-C 的 nil 消息不会抛异常，而是悄悄跳过">
  <figcaption>Objective-C 的 nil 消息不会抛异常，而是悄悄跳过</figcaption>
</figure>

先说结论：在 Objective-C 中给 nil 发消息，什么都不会发生，只是老老实实返回 0（或 nil）。

这并不是放任错误不管，而是语言层面刻意做出的一道安全阀。

今天就来聊聊为什么会有这种行为，以及我们该怎么理解它。

---

## 为什么给 nil 发消息不会崩？

关键在于 Objective-C 的消息发送机制。

我们写 `[object doSomething]` 这样的代码时，编译器会把它转成 `objc_msgSend(object, @selector(doSomething))` 这样一次函数调用。

这不是直接调用方法，而是一种“麻烦运行时把这条消息转达给这个对象”的结构。

而这个 `objc_msgSend` 函数，一开始就会检查接收消息的对象是不是 nil。

如果接收者是 nil 呢？

> 不会去找方法，而是当场直接返回 0，安安静静地结束。

也就是说，nil 相当于一个“吞掉消息的存在”。反正发出去也到不了任何地方，自然也就没有崩溃这回事了。

```objc
// 如果 receiver 是 nil，就不会去找方法，直接返回 0
NSString *name = nil;
NSUInteger len = [name length];  // 不会崩溃，len == 0
```

---

## 这和 NullPointerException 有什么不同？

这一点很多人会搞混，我整理成表格来看。

| 区分 | Objective-C（nil） | Java（null） |
|------|-------------------|-------------|
| 对 null 调用方法 | 忽略并返回 0/nil | 抛出 NullPointerException |
| 应用表现 | 不崩溃，继续运行 | 因异常而崩溃 |
| 处理主体 | 运行时（objc_msgSend） | JVM 异常处理 |

Java 一旦访问 null 引用，就会“哪有这种对象？”地立刻抛出异常。

而 Objective-C 的运行时把 nil 当作一个正常的值来对待。

所以 Java 开发者转来 Objective-C 时，往往会因为这个差异别扭好一阵子。

返回值也会因类型而略有不同。对象类型返回 nil，数字类型返回 0，结构体则返回填充为 0 的值。

---

## 不崩溃就一定是好事吗？

老实说，这是把双刃剑。

优点确实很明显。不用到处铺满 nil 判断代码。

比如数组为空返回了 nil，即使对它问 `count`，也只会得到 0，流程不会中断。

但恰恰是这一点，也可能变成陷阱。

因为 bug 不会以崩溃的方式暴露出来，而是被悄悄埋没。

我以前也遇到过数据死活不显示在屏幕上、折腾了好久的情况，后来才发现是中间某个对象是 nil，导致后面的消息全被无声无息地吞掉了。

要是当场崩溃了，反倒能很快找到问题，可正因为它悄无声息地过去了，排查原因反而花了更长时间。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="亲自跑一下就能很快确认它真的不会崩溃">
  <figcaption>亲自跑一下就能很快确认它真的不会崩溃</figcaption>
</figure>

所以养成区分“这里可以让 nil 流过去”还是“这里必须有值”的习惯，对开发者来说很重要。

---

## 实战中该怎么处理？

我把自己常用的几个方法整理一下。

1. 在关键分支处显式检查 nil（`if (object == nil)`）
2. 对可能返回 nil 的方法，用注释或命名标注出来
3. 怀疑出现了意料之外的 nil 时，用 `NSAssert` 在开发阶段先拦下来

尤其是换到 Swift 之后，情况又不一样了。

Swift 干脆用可选值（Optional）这个概念，把 nil 的可能性钉死在类型系统里。

可能为 nil 的值必须加上问号标出来，解包使用时也强制要求做安全处理。

可以说，Swift 把 Objective-C 那种“悄悄放过去”的做法，换成了“提前摆出来”。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="和 Swift 放在一起对比，就能看出设计理念的差异">
  <figcaption>和 Swift 放在一起对比，就能看出设计理念的差异</figcaption>
</figure>

---

Objective-C 在给 nil 发消息时不崩溃，不是 bug，而是一种设计哲学。

方便的同时也会把静默的 bug 藏起来，一旦理解了“为什么不崩”，反而能写出更扎实的代码。

如果你现在的 iOS 代码里正遇到莫名其妙的空白页面，不妨看看中间是不是悄悄溜过去了一个 nil。相信一定会有帮助。
