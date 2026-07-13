---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "彻底搞懂DRY原则：比代码重复更可怕的是错误的抽象"
lang: zh
description: "做代码审查的时候，经常会遇到这样一个场景。"
header:
  og_image: /assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/1.png
tags:
  - DRY原则
  - 代码重复
  - 重构
  - 程序员修炼之道
  - 整洁代码
  - 抽象
  - 开发原则
  - 软件设计
  - 编程
  - 开发学习
permalink: /zh/DRY-원칙-제대로-알기-코드-중복보다-무서운-건-잘못된-추상화/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/DRY-%EC%9B%90%EC%B9%99-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0-%EC%BD%94%EB%93%9C-%EC%A4%91%EB%B3%B5%EB%B3%B4%EB%8B%A4-%EB%AC%B4%EC%84%9C%EC%9A%B4-%EA%B1%B4-%EC%9E%98%EB%AA%BB%EB%90%9C-%EC%B6%94%EC%83%81%ED%99%94/) · [English](/en/DRY-%EC%9B%90%EC%B9%99-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0-%EC%BD%94%EB%93%9C-%EC%A4%91%EB%B3%B5%EB%B3%B4%EB%8B%A4-%EB%AC%B4%EC%84%9C%EC%9A%B4-%EA%B1%B4-%EC%9E%98%EB%AA%BB%EB%90%9C-%EC%B6%94%EC%83%81%ED%99%94/) · [日本語](/ja/DRY-%EC%9B%90%EC%B9%99-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EC%95%8C%EA%B8%B0-%EC%BD%94%EB%93%9C-%EC%A4%91%EB%B3%B5%EB%B3%B4%EB%8B%A4-%EB%AC%B4%EC%84%9C%EC%9A%B4-%EA%B1%B4-%EC%9E%98%EB%AA%BB%EB%90%9C-%EC%B6%94%EC%83%81%ED%99%94/) · **中文**
{: .notice--info}

做代码审查的时候，经常会遇到这样一个场景。

为了修改一个功能去搜索代码，结果发现几乎一模一样的代码出现在三个地方。只改了一处，剩下两处就成了遗留的bug。

今天要聊的正是直面这个问题的原则——DRY。它和上次讲过的KISS原则可以说是一对形影不离的搭档。

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/1.png" alt="同样的代码写三份，bug也会有三份">
  <figcaption>同样的代码写三份，bug也会有三份</figcaption>
</figure>

DRY是"Don't Repeat Yourself"的缩写，意思是不要在系统内重复同一份知识。

这个概念出自1999年出版的《程序员修炼之道》（The Pragmatic Programmer），由Andy Hunt和Dave Thomas提出，原文的定义相当精确。

> 系统中的每一份知识都必须有一个单一的、明确的、权威的表达形式。

这里值得留意的关键词不是"代码"，而是"知识"。这正是今天要讲的核心。

---

## 复制粘贴代码为什么是个问题？

复制粘贴本身并不是罪过，问题出在之后。

如果同一段逻辑存在于三个地方，需求一变，就得把这三处全部找出来修改。哪怕漏掉一处，都会变成bug。

```swift
// 如果运费计算逻辑散落在三个文件里
// Cart.swift
let fee = total >= 50000 ? 0 : 3000

// Checkout.swift
let shippingFee = totalPrice >= 50000 ? 0 : 3000

// OrderSummary.swift
let delivery = price >= 50000 ? 0 : 3000
```

有一天如果需求变成"把免运费门槛降到3万韩元"，会怎样？就得把三个文件都翻出来改。而且各处的变量命名还不一样，搜索起来势必会漏掉一处。

```swift
// 把知识集中到一个地方
// Shipping.swift
enum ShippingPolicy {
    static let freeShippingThreshold = 50000
    static let fee = 3000

    static func shippingFee(for total: Int) -> Int {
        total >= freeShippingThreshold ? 0 : fee
    }
}
```

现在政策一变，只需要改一个地方就够了。这就是DRY。

---

## 重复的不是"代码"，而是"知识"

不过在这里，很多人会栽一次跟头——把DRY理解成"把长得像的代码全部合并起来"。

DRY所说的重复，指的不是代码的外形，而是知识，也就是业务规则的重复。

这个区分之所以重要，是因为世界上存在偶然长得相似的代码。

| 情况 | 是重复吗？ |
|------|-----------|
| 运费计算逻辑出现在三处 | 真正的重复（同一份知识） |
| 会员注册校验和活动报名校验碰巧相似 | 伪重复（不同的知识） |
| 常量3000分别出现在运费和积分标准里 | 伪重复（不同的含义） |

会员注册校验和活动报名校验，现在都是"姓名必填、电话号码11位"，代码看起来一模一样，但这两条规则会因为不同的原因发生变化。如果把它们合并成一个，改活动规则时很可能把会员注册功能改坏。

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/2.png" alt="长得像不代表就是同一份知识">
  <figcaption>长得像不代表就是同一份知识</figcaption>
</figure>

---

## 草率的抽象比重复代价更高

所以最近的开发者社区里也经常能听到这样的说法："宁可重复，也不要错误的抽象（prefer duplication over the wrong abstraction）"。这是知名Ruby开发者Sandi Metz说过的话。

把两段看似相似的代码硬凑到一起，往往会发生这样的事情：

1. 先写一个公共函数
2. 一边的需求变了，于是加一个可选参数
3. 另一边也变了，于是又加一个if分支
4. 不知不觉就变成了一个五个参数、谁都看不懂的函数

到这个地步，还不如老老实实复制两份代码。

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/4-1783847956412.png" alt="硬凑出来的函数是如何一步步崩溃的">
  <figcaption>硬凑出来的函数是如何一步步崩溃的</figcaption>
</figure>

所以实际工作中经常会用到"三次法则（Rule of Three）"：同样的模式出现两次时先放着，出现第三次时再抽象。反复到第三次，才能真正看清它究竟是同一份知识，还是纯属巧合。

---

## 我常用的判断标准

发现重复代码时，我会问自己这样一个问题。

> 这两段代码，是因为同一个原因而发生变化的吗？

如果是因为同一个原因而变化，那就是真正的重复，应该合并。如果是因为不同的原因而变化，哪怕外形再像，也应该保持原样。

<figure>
  <img src="/assets/images/posts/52ab8398-a81d-4f14-b59a-89c82327e577/3.png" alt="合并之前，问自己这一个问题就够了">
  <figcaption>合并之前，问自己这一个问题就够了</figcaption>
</figure>

---

## 今天的结论

DRY原则，提炼出核心要点就是这些。

- 重复的判断单位不是代码的外形，而是知识（业务规则）。
- 只合并因为同一个原因而变化的代码，偶然相似的代码保持原样即可。
- 拿不准的话，用三次法则——到第三次重复时再抽象，也不算晚。

如果说KISS是"保持简单"，那DRY就是"知识只放在一个地方"。归根结底，两者说的都是如何降低变更成本。

搜索一下就能命中三处的逻辑，脑海中大概已经浮现出一个例子了吧。那就是今天的重构候选。
