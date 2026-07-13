---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 策略模式完全指南（用协议和闭包灵活切换算法）"
lang: zh
description: "每种支付方式都要写一堆 if-else，代码越堆越多——你是不是也遇到过这种情况？"
header:
  og_image: /assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/1.png
tags:
  - Swift
  - 策略模式
  - 设计模式
  - 协议
  - 闭包
  - iOS开发
  - Swift教程
  - 重构
  - 面向对象
  - swift设计模式
permalink: /zh/Swift-전략-패턴-완벽-정리-프로토콜클로저로-알고리즘-갈아끼우기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/) · [English](/en/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/) · [日本語](/ja/Swift-%EC%A0%84%EB%9E%B5-%ED%8C%A8%ED%84%B4-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A1%9C-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EA%B8%B0/) · **中文**
{: .notice--info}

每种支付方式都要写一堆 if-else，代码越堆越多——你是不是也遇到过这种情况？

排序选项、折扣计算、过滤逻辑一旦全都挤在一个巨大的 switch 语句里纠缠不清，代码就会变得越来越不敢碰。

这时候能派上用场的工具，就是 Swift 的策略模式（Strategy Pattern）。

今天就从实战角度，聊聊如何用协议和闭包把算法像零件一样自由替换。

<figure>
  <img src="/assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/1.png" alt="Swift 策略模式,说到底就是把算法像零件一样自由替换的故事">
  <figcaption>Swift 策略模式,说到底就是把算法像零件一样自由替换的故事</figcaption>
</figure>

先把核心概念讲清楚。

> 策略模式就是把"做什么"和"怎么做"分离开来，让算法可以在外部自由替换的一种设计方式。

在 Swift 里，可以用协议（较重的方式）或闭包（较轻的方式）这两种方式来实现。

下面就分别演示一下。

---

## 策略模式是什么？先来个三行总结

与其先讲复杂的理论，不如先把骨架搭起来。

1. 把可以互相替换的算法归纳成一个统一规格（协议）
2. 把具体的实现分别写成各自的策略对象或闭包
3. 使用方只需要知道这个规格，不需要知道具体内容

打个比方，这就像游戏角色更换武器一样。

角色只需要知道"攻击"这个动作，至于是用剑、弓还是魔法，全部交给当前装备的武器去处理。

不用改角色的代码，只需要换武器就行了。

可以说，这种"自由替换"就是策略模式的全部精髓。

---

## 用协议实现（正统做法）

先来看最教科书式的协议实现方式。

以折扣计算为例。假设有普通会员、VIP 会员、优惠券折扣等多种计算方式并存的场景。

下面是所有策略都要遵守的统一规格，以及一个具体策略的定义代码。

```swift
// 所有折扣策略都要遵循的统一规格
protocol DiscountStrategy {
    func discount(for price: Int) -> Int
}

// VIP 策略：打 8 折（优惠 20%）
struct VIPDiscount: DiscountStrategy {
    func discount(for price: Int) -> Int { price * 20 / 100 }
}
```

接下来看看持有并使用这个策略的一方。

使用方完全不用关心传进来的是哪种策略。

<figure>
  <img src="/assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/3-1783847844763.png" alt="Checkout 只需要知道规格,不需要知道内部具体实现">
  <figcaption>Checkout 只需要知道规格,不需要知道内部具体实现</figcaption>
</figure>

```swift
struct Checkout {
    var strategy: DiscountStrategy   // 可以自由替换策略的位置

    func finalPrice(_ price: Int) -> Int {
        price - strategy.discount(for: price)
    }
}

// 结算时只需替换策略即可
let cart = Checkout(strategy: VIPDiscount())
```

即使出现新的折扣政策，`Checkout` 也完全不用改动。

只需新建一个遵循 `DiscountStrategy` 的结构体就搞定了。

不动原有代码就能扩展功能——这才是实际开发中最能体会到的最大优点。

---

## 用闭包实现（更 Swift 风格的方式）

不过,如果策略本身很简单,每次都新建一个结构体就显得有点麻烦。

把简单逻辑也统统用协议包起来,反而容易让代码变得冗长。

这种情况下,在 Swift 里用闭包会轻巧自然得多。

```swift
struct Checkout {
    // 直接把策略本身当作函数传入
    var discount: (Int) -> Int

    func finalPrice(_ price: Int) -> Int {
        price - discount(price)
    }
}

// 在传入的当下就地定义策略
let cart = Checkout(discount: { $0 * 20 / 100 })
```

不需要单独声明类型,传入的瞬间就能直接写好逻辑。

对于排序标准、过滤条件、简单转换这类轻量级算法替换,这种方式明显更清爽。

<figure>
  <img src="/assets/images/posts/6191441f-b80b-4db0-8367-ca763cbfb2ce/2.png" alt="仔细想想,sorted(by:) 其实也是我们每天都在用的策略模式">
  <figcaption>仔细想想,sorted(by:) 其实也是我们每天都在用的策略模式</figcaption>
</figure>

实际上,标准库里的 `sorted(by:)` 正是这种闭包版的策略模式。

排序这个骨架固定不变,只是把比较标准用闭包来替换,结构完全一致。

可以说我们其实每天都在用它了。

---

## 协议和闭包,该在什么时候用哪个?

把实际开发中用来区分选择的标准整理成了一张表。

| 区分项 | 协议方式 | 闭包方式 |
|------|--------------|------------|
| 适用场景 | 策略复杂、持有状态 | 策略简短、单纯 |
| 复用性 | 便于多处复用 | 更适合一次性使用 |
| 代码量 | 需要类型声明,较多 | 就地定义,较少 |
| 测试 | 便于按独立类型验证 | 只需简单验证逻辑本身 |
| 可读性 | 名称能体现意图 | 短小时清晰,过长则难读 |

划分的标准大致是这样。

如果策略需要持有内部状态、会在多个界面被复用、或者需要用名称明确表达意图,那么协议是更好的选择。

反过来,如果只是一两行逻辑需要随时替换,闭包就是最佳答案。

两者混用完全没有问题。大的策略用协议、细节选项用闭包来区分,是比较常见的实践方式。

---

## 常见问题(Q&A)

**Q. 策略模式和继承(方法重写)有什么区别?**

继承会绑定在父类上,行为在编译阶段就固定下来了。

而策略模式可以在运行时自由替换策略,不受类层级结构的束缚。

**Q. 用 enum 的 switch 语句处理,和这个有什么区别?**

switch 每增加一个新分支,就得打开原有代码进行修改。

而策略模式只需要"新增"一个策略即可,大大减少了改动原有代码的必要。

---

归根结底,策略模式的核心只有一个:把会变化的部分抽离出来,让它便于替换。

只要能根据场景灵活运用今天学到的协议和闭包这两种方式,相信一定能摆脱那令人头疼的 if-else 地狱。不妨从一小段代码开始,试着重构一下吧!
