---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C的nil和Java的null对比,为什么行为不一样"
lang: zh
description: "有一件事最让刚接触iOS的开发者感到困惑。"
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
  - 编程学习
permalink: /zh/Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-nil/) · [English](/en/Objective-C-nil/) · [日本語](/ja/Objective-C-nil/) · **中文**
{: .notice--info}

有一件事最让刚接触iOS的开发者感到困惑。

在Java或C++里,对nil(空)对象做任何操作,应用马上就会崩溃,也就是那个著名的NullPointerException。

但Objective-C给nil发消息却毫无反应,不崩溃也不报错。

第一次见到这种情况,很容易觉得"这不是bug吗",但其实这是语言层面有意为之的设计。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-C的nil消息不会抛异常,而是悄悄跳过">
  <figcaption>Objective-C的nil消息不会抛异常,而是悄悄跳过</figcaption>
</figure>

先说结论:在Objective-C中给nil发消息,不会发生任何事,只会返回0(或nil)。

这并不是对错误放任不管,而是语言层面刻意设置的一道安全阀。

今天就来聊聊这种行为为什么可行,以及该怎么看待它。

---

## 给nil发消息为什么不会崩溃?

关键在于Objective-C的消息传递方式。

当我们写下`[object doSomething]`这样的代码时,编译器会把它转换成`objc_msgSend(object, @selector(doSomething))`这样的函数调用。

这不是直接调用方法,而是一种运行时结构:"请把这条消息传给这个对象"。

而这个`objc_msgSend`函数,首先会检查接收消息的对象是不是nil。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/4-1783847973933.png" alt="objc_msgSend悄悄吞掉nil的那个瞬间">
  <figcaption>objc_msgSend悄悄吞掉nil的那个瞬间</figcaption>
</figure>

如果接收对象是nil呢?

> 它不会去查找方法,而是当场直接返回0,悄悄结束。

也就是说,nil相当于一个"会吞掉消息的存在"。反正发出去也到不了任何地方,自然也就不会崩溃。

```objc
// 如果receiver是nil,不会查找方法,直接返回0
NSString *name = nil;
NSUInteger len = [name length];  // 不崩溃,len == 0
```

---

## 这和NullPointerException有什么不同?

这是很多人容易混淆的地方,我整理成了表格。

| 区分 | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| 对null调用方法 | 忽略并返回0/nil | 抛出NullPointerException |
| 应用行为 | 不崩溃,继续运行 | 因异常而崩溃 |
| 处理主体 | 运行时(objc_msgSend) | JVM异常处理 |

Java在访问null引用的瞬间就会抛出异常,提示"没有这个对象"。

而Objective-C运行时则把nil当作一个正常的值来处理。

所以从Java转到Objective-C的开发者,往往会因为这个差异有一段时间感到不适应。

返回值也会随类型略有不同:对象类型返回nil,数值类型返回0,结构体则返回全部填充为0的值。

---

## 不崩溃就一定是好事吗?

老实说,这是一把双刃剑。

优点很明显:不用在代码各处堆满nil检查。

比如数组为空返回了nil,即便向它询问`count`,也只会得到0,流程不会中断。

但恰恰是这一点,也可能成为陷阱。

因为bug不会以崩溃的形式暴露出来,而是被悄悄掩盖了。

数据在界面上没有显示出来,排查很久之后往往会发现,是中间某个对象是nil,导致后续消息全部被忽略了。

要是崩溃了反而好查,可正因为它悄无声息地过去了,追查原因反而要花更长时间。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="亲自跑一下就能马上确认真的不会崩溃">
  <figcaption>亲自跑一下就能马上确认真的不会崩溃</figcaption>
</figure>

所以,养成区分"这个位置可以允许nil流过"还是"这个位置必须要有值"的习惯,就显得很重要。

---

## 实际开发中该怎么处理?

整理几条我常用的方法。

1. 在重要的分支处显式检查nil(`if (object == nil)`)
2. 对可能返回nil的方法,用注释或命名做出标记
3. 怀疑出现了意料之外的nil时,用`NSAssert`在开发阶段就把它拦下来

转到Swift之后,情况又不一样了。

Swift干脆用可选值(Optional)这个概念,把nil的可能性直接钉死在类型系统里。

可能为nil的值必须加上问号标记,解包使用时也被强制要求做安全处理。

可以说,Objective-C的"悄悄放过"到了Swift就变成了"提前暴露"。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="和Swift放在一起看,就能看出设计哲学的差异">
  <figcaption>和Swift放在一起看,就能看出设计哲学的差异</figcaption>
</figure>

---

Objective-C给nil发消息不会崩溃,这不是bug,而是一种设计哲学。

方便的同时,也会藏起一些悄无声息的bug,理解了"为什么不会崩溃"之后,反而能写出更扎实的代码。

如果你现在的iOS代码里遇到了原因不明的空白界面,不妨检查一下中间是不是有个nil悄悄溜了过去。相信会有帮助。
