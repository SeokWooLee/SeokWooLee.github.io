---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 原型模式完全整理（NSCopying 与值类型复制的区别）"
lang: zh
description: "在用 Swift 复制对象时，有没有突然愣住，心想\"这真的算是复制了吗？\"的时刻？"
header:
  og_image: /assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/1.png
tags:
  - Swift
  - 原型模式
  - NSCopying
  - 值类型
  - 设计模式
  - iOS开发
  - Swift复制
  - Swift语言
  - 深拷贝
  - 浅拷贝
permalink: /zh/Swift-프로토타입-패턴-완벽-정리-NSCopying-vs-값-타입-복사-차이/
toc: true
toc_sticky: true
last_modified_at: 2026-07-19
---

🌐 [한국어](/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/) · [English](/en/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/) · [日本語](/ja/Swift-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-NSCopying-vs-%EA%B0%92-%ED%83%80%EC%9E%85-%EB%B3%B5%EC%82%AC-%EC%B0%A8%EC%9D%B4/) · **中文**
{: .notice--info}

在用 Swift 复制对象时，有没有突然愣住，心想"这真的算是复制了吗？"的时刻？

如果只用一行赋值语句来复制类实例，很容易出现修改副本却连原始对象也一起被改动的问题。

先说结论：在 Swift 中，复制分为两条路径。

值类型（struct）只需赋值就会自动复制，而类（引用类型）必须自己实现 `NSCopying` 才能实现真正的复制。

这篇文章会用代码逐一梳理原型模式是什么，以及 `NSCopying` 和值类型复制到底有什么不同。

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/1.png" alt="值类型复制与 NSCopying，一张图就能看懂两者的区别">
  <figcaption>值类型复制与 NSCopying，一张图就能看懂两者的区别</figcaption>
</figure>

---

## 什么是原型模式？

简单来说，原型模式就是**通过复制现有对象来创建新对象的一种设计模式**。

它不是从零开始创建，而是把已经设置好的原始对象像"盖章"一样复制出来。

我是把它比喻成刻图章来理解的——只要把原始图章刻好，之后只管盖章就行。

在对象创建成本高，或者初始设置比较复杂的情况下尤其好用。

比如在制作游戏角色时，与其每次都重新设置属性、装备和技能，不如复制一个基础角色，再稍作修改。

核心在于："副本必须与原始对象完全分离"。

> 如果修改副本时原始对象也跟着变了，那就不是复制，只是共享了引用而已。

值类型和引用类型的差异，正是从这一点开始分道扬镳的。

---

## 值类型复制为什么方便？

Swift 中的 struct 和 enum 都属于值类型。

值类型最大的优点在于，只要赋值或者作为参数传递，就会**自动复制**。

看看下面的代码就能明白：复制原始对象后再修改其中一个的值，两者互不影响。

```swift
struct Character {
    var name: String
    var level: Int
}

var origin = Character(name: "전사", level: 1)
var copy = origin      // 这里整个值被复制了
copy.level = 99
print(origin.level)    // 1（原始值保持不变！）
```

即使把 `copy.level` 改成 99，`origin.level` 依然是 1。

不需要额外编写复制逻辑，出错的可能性也大大降低。

所以如果没有特别的理由，我通常会优先考虑使用 struct。

Swift 之所以推荐使用值类型复制，正是因为这种安全性。

---

## NSCopying 该怎么用？

问题出在类（引用类型）上。

类即使赋值也不算复制，只是**共享指向同一个实例的地址**而已。

所以如果需要真正的复制，就必须遵循 `NSCopying` 协议，并自己实现 `copy(with:)` 方法。

```swift
class Character: NSCopying {
    var name: String
    init(name: String) { self.name = name }

    func copy(with zone: NSZone? = nil) -> Any {
        return Character(name: self.name)
    }
}

let origin = Character(name: "전사")
let clone = origin.copy() as! Character
```

调用 `copy()` 会创建一个新实例，所以即使修改 `clone`，`origin` 也不会受影响。

这里有一点需要注意。

在 `copy(with:)` 内部，需要把内部属性也一并重新创建，这样才更接近真正完整的复制（深拷贝）。

如果只是原样赋值内部对象，就只是表面复制，内部实际上仍然是共享状态，也就是浅拷贝。

---

## 值类型复制 vs NSCopying，一图看懂

把两种方式的差异整理成了表格。

| 区分 | 值类型（struct）复制 | NSCopying（class） |
|------|------|------|
| 复制方式 | 赋值时自动复制 | 直接调用 `copy()` |
| 是否需要实现 | 不需要 | 需要实现 `copy(with:)` |
| 默认行为 | 始终是独立的副本 | 赋值时共享地址 |
| 浅拷贝/深拷贝 | 基本不用操心 | 需要自己处理 |
| 推荐场景 | 大多数数据模型 | 确实需要引用类型时 |

总结一下，只要条件允许，用值类型来设计会更方便、更安全。

但如果需要继承、要和 Objective-C API 对接，或者实例的同一性很重要，这时就要用类和 `NSCopying`。

这种情况下，用 `NSCopying` 来实现原型模式会非常契合。

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/2.png" alt="我一般会优先想到 struct，因为只要赋值就能完成复制">
  <figcaption>我一般会优先想到 struct，因为只要赋值就能完成复制</figcaption>
</figure>

---

## 常见问题（Q&A）

**Q. 如果只用 struct，可以不了解 NSCopying 吗？**

就基本复制而言确实如此。不过在使用 UIKit 或基于 Objective-C 的 API 时，难免会遇到需要复制类的情况，所以最好还是了解一下这个概念。

**Q. copy() 和 mutableCopy() 有什么区别？**

`copy()` 用来创建不可变的副本，`mutableCopy()` 用来创建可修改的副本，两者用途不同。后者需要遵循 `NSMutableCopying` 协议。

**Q. 深拷贝永远是正确答案吗？**

并不是。如果内部对象可以共享，浅拷贝在性能上反而可能更有优势。

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/3.png" alt="把原始图章刻好之后，接下来只管盖章就行">
  <figcaption>把原始图章刻好之后，接下来只管盖章就行</figcaption>
</figure>

---

## 结语

遇到复制相关的疑惑时，只需要想一想："修改原始对象时，副本会不会跟着变？"

值类型的这份操心，Swift 已经替我们做好了；类的话，用 `NSCopying` 亲自处理就可以。

希望今天整理的这些内容，能让大家少一些因为复制问题而熬夜排查的烦恼。加油！
