---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 工厂方法模式，为什么用它而不是 init（实战整理）"
lang: zh
description: "用 Swift 写应用时，创建对象的代码几乎每天都要写上几十遍。"
header:
  og_image: /assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png
tags:
  - Swift
  - 工厂方法模式
  - iOS开发
  - 设计模式
  - init
  - 静态工厂方法
  - 面向对象
  - 编程学习
  - App开发
  - Swift教程
permalink: /zh/Swift-팩토리-메서드-패턴-init-대신-쓰는-이유-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

🌐 [한국어](/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

用 Swift 写应用时，创建对象的代码几乎每天都要写上几十遍。

可是到了某个阶段，只靠 init 会让人越来越觉得力不从心。

很多人一开始都只用 init，等项目规模变大后才开始接触工厂方法模式。

这篇文章会结合实际代码，聊聊 Swift 工厂方法模式到底是什么，以及为什么要用工厂方法而不是 init。

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png" alt="先来搞清楚 Swift 工厂方法模式和 init 到底有什么不同">
  <figcaption>先来搞清楚 Swift 工厂方法模式和 init 到底有什么不同</figcaption>
</figure>

## 工厂方法模式，一句话概括

先把核心答案放在前面。

> 工厂方法就是把对象的创建逻辑从 init 中抽出来，放进一个独立的方法里，给它起个名字，并且可以自由选择返回类型。

在 Swift 里，通常指的是用 `static func` 写出来的静态工厂方法。

init 只能在语言规定的规则范围内活动。

它不能命名，而且必须始终返回自身类型的新实例。

工厂方法正好解开了这个限制。

来看一个简单的例子。

```swift
struct Color {
    let r, g, b: Double
    // 用名字表明创建意图
    static func rgb(_ r: Double, _ g: Double, _ b: Double) -> Color {
        Color(r: r, g: g, b: b)
    }
    static func gray(_ v: Double) -> Color {
        Color(r: v, g: v, b: v)
    }
}
```

只要看 `Color.gray(0.5)` 这样的调用，光看代码就能明白它是在创建一个灰色。

---

## 为什么要用工厂方法而不是 init？

结合实际使用经验，主要可以归纳为四点。

**第一，可以命名。**

init 的名字都一样，只能靠参数来区分。

如果有好几个构造器都接收两个 `Double`，那就很容易搞混。

工厂方法可以用 `from(hex:)`、`rgb(_:_:_:)` 这样的名字，把意图直接体现出来。

**第二，不用每次都创建新实例。**

init 必须每次都返回一个新对象，而工厂方法可以返回缓存好的值，或者单例。

**第三，返回类型可以灵活选择。**

根据情况返回子类型或者不同的具体实现都是可以的。

**第四，可以更明确地表达失败处理。**

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/2.png" alt="只加一行 static func，代码可读性就能提升不少">
  <figcaption>只加一行 static func，代码可读性就能提升不少</figcaption>
</figure>

下面是一个利用缓存的工厂方法示例。

```swift
final class IconCache {
    private static var store: [String: Icon] = [:]
    // 名字相同时，直接复用已经创建好的图标
    static func icon(named name: String) -> Icon {
        if let cached = store[name] { return cached }
        let icon = Icon(name: name)
        store[name] = icon
        return icon
    }
}
```

多次调用同一个图标时，可以节省内存。

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/4-1783847712458.png" alt="有就直接拿出来用，没有就创建一个补上">
  <figcaption>有就直接拿出来用，没有就创建一个补上</figcaption>
</figure>

---

## 那 init 就不用了吗？

并不是这样。

工厂方法不是要取代 init，而是对它的一层封装。

工厂方法内部最终还是要调用 init 来创建对象。

如果只是简单的值类型，或者创建逻辑一目了然，直接用 init 反而更好。

没必要非要用工厂方法包一层，那样只会让代码变长、变得难读。

工厂方法真正能发挥价值的场景，其实是有条件的。

- 创建方式不止一种，想用名字加以区分的时候
- 需要缓存、池化之类的复用机制时
- 想把复杂的初始化流程集中隐藏起来时
- 想以协议类型返回、隐藏具体实现时

如果不符合这些条件，用 init 才是正确答案。

Swift 标准库也是这样区分使用的。

`Array(repeating:count:)` 用的是 init，但像 `UIColor.systemBlue` 这样的静态属性，其实也可以算是工厂方法的近亲。

---

## 实际开发中的判断标准整理

遇到犹豫不决的情况时，可以参考下面这张表格。

| 情况 | 推荐 |
| --- | --- |
| 简单的值存储 | init |
| 存在多种创建方式 | 工厂方法 |
| 实例复用、缓存 | 工厂方法 |
| 隐藏实现、返回协议类型 | 工厂方法 |
| 初始化一行就能搞定 | init |

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/3.png" alt="每次犹豫不决时，我都会想起这张表来做选择">
  <figcaption>每次犹豫不决时，我都会想起这张表来做选择</figcaption>
</figure>

总结一下，init 负责的是"怎么创建"，工厂方法负责的是"创建什么、为什么创建"。

两者不是竞争关系，而是分工不同的搭档。

建议一开始先用 init，等创建逻辑变复杂时，再把它迁移到工厂方法上。

只要记住今天介绍的这些判断标准，代码就会清爽不少。祝大家 Swift 编程愉快！
