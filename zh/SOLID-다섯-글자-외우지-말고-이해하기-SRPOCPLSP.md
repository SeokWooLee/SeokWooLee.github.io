---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID 五个字母，别死记硬背，理解才是关键（SRP·OCP·LSP）"
lang: zh
description: "面试的时候被问到\"你能讲讲 SOLID 原则吗\"，相信不少人都遇到过。"
header:
  og_image: /assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png
tags:
  - SOLID原则
  - SRP
  - OCP
  - LSP
  - 面向对象
  - 单一职责原则
  - 里氏替换原则
  - 开发原则
  - 整洁代码
  - 编程
permalink: /zh/SOLID-다섯-글자-외우지-말고-이해하기-SRPOCPLSP/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [English](/en/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [日本語](/ja/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **中文**
{: .notice--info}

面试的时候被问到"你能讲讲 SOLID 原则吗"，相信不少人都遇到过。

但说实话，五个原则能背得滚瓜烂熟，真要说到"那具体在我的代码里怎么用"，往往就接不上了。

所以这次想换个角度，不从教科书定义出发，而是结合实际开发场景来讲 SOLID。内容比较多，分两篇来写。今天讲前三个字母：SRP、OCP、LSP。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="五个字母中，今天先讲前三个">
  <figcaption>五个字母中，今天先讲前三个</figcaption>
</figure>

SOLID 是罗伯特·马丁（Robert Martin，人称 Uncle Bob）总结的面向对象设计五大原则的首字母缩写。

- **S**RP — 单一职责原则
- **O**CP — 开闭原则
- **L**SP — 里氏替换原则
- **I**SP — 接口隔离原则
- **D**IP — 依赖倒置原则

乍一看这五个原则各说各话，但贯穿其中的核心信息其实只有一个：发生变更时，尽量缩小需要修改的代码范围。

---

## SRP — 单一职责原则

教科书上的定义是"一个类应该只承担一项职责"，但 Uncle Bob 本人后来把这句话改得更精准了。

> 一个模块应该只对一个执行者（actor）负责。

这里的"执行者"指的是要求这段代码变更的人（或部门）。举个例子，假设有这样一个类：

```swift
class Employee {
    func calculatePay() { ... }   // 财务部要求修改
    func reportHours() { ... }    // 人事部要求修改
    func save() { ... }           // 开发部（DBA）要求修改
}
```

这三个方法的"主人"完全不同。如果为了满足财务部的需求去改 `calculatePay`，不小心动到了公共逻辑，人事部的报表就可能悄悄出错。这类事故一旦发生，排查起来也相当麻烦。

SRP 把这个道理总结为："提需求的人不同，代码就该分开。"把工资计算、工时报表、数据保存拆成各自独立的类，财务部的需求就不会再牵连到人事部的功能了。

---

## OCP — 开闭原则

定义是"对扩展开放，对修改关闭"。第一次听可能觉得像绕口令，但看代码就一目了然了。

```swift
// 每增加一种支付方式，就要修改这个函数
func pay(method: String, amount: Int) {
    if method == "card" { ... }
    else if method == "kakaopay" { ... }
    else if method == "naverpay" { ... }
    // 新增支付方式 = 新增 else if = 修改已有代码
}
```

在这种结构下，想加入 TossPay，就必须打开原本运行良好的函数进行修改。每次修改都要承担把现有支付方式改坏的风险。

```swift
// 新增支付方式只需要“添加”即可的结构
let payments: [String: Payment] = [
    "card": CardPayment(),
    "kakaopay": KakaoPayment(),
    "naverpay": NaverPayment(),
    // 新增 TossPay = 注册一个新类，一行搞定
]

func pay(method: String, amount: Int) {
    payments[method]?.process(amount: amount)
}
```

不动原有代码（对修改关闭），只通过新增类来扩展功能（对扩展开放）。诀窍在于只在经常变动的地方采用这种结构，如果所有代码都这么写，就会违反上一篇提到的 YAGNI 原则。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="新增 TossPay，只需要挂上一个新类就搞定">
  <figcaption>新增 TossPay，只需要挂上一个新类就搞定</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="用新增代替修改，这就是 OCP">
  <figcaption>用新增代替修改，这就是 OCP</figcaption>
</figure>

---

## LSP — 里氏替换原则

名字听起来最吓人，但含义其实很简单。

> 子类应该可以完全替代父类出现的位置，而不会破坏程序的正确性。

最经典的反例就是长方形-正方形问题。如果按照"正方形是一种特殊的长方形"这个数学常识来做继承，就会出现下面这种情况。

```swift
class Rectangle {
    var width = 0
    var height = 0
    func setWidth(_ w: Int) { width = w }
    func setHeight(_ h: Int) { height = h }
}

class Square: Rectangle {
    override func setWidth(_ w: Int) { width = w; height = w }  // 正方形嘛
    override func setHeight(_ h: Int) { width = h; height = h }
}

// 期望传入长方形的代码
func test(_ rect: Rectangle) {
    rect.setWidth(5)
    rect.setHeight(4)
    print(rect.width * rect.height) // 期望是 20，但如果是 Square 就变成 16
}
```

一旦传入 Square，"宽 5、高 4 面积应该是 20"这个理所当然的预期就被打破了。哪怕表面上看是成立的 is-a 关系，只要行为约定被破坏，就不该用继承——这就是 LSP 的核心。

实际开发中的一个信号是：如果子类重写父类方法时抛出异常，或者干脆留空不实现，那这个继承关系很可能就违反了 LSP。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="正方形，还真没法放进长方形的位置">
  <figcaption>正方形，还真没法放进长方形的位置</figcaption>
</figure>

---

## 上篇小结

今天讲的三个原则，各用一句话总结一下。

- **SRP** — 提需求的人不同，代码就该分开。
- **OCP** — 经常变动的地方，要做到能通过"新增"而不是"修改"来应对。
- **LSP** — 子类不能违背父类的行为约定。如果必须违背，那说明这个继承关系本身就错了。

下一篇会讲剩下的两个字母：ISP（接口隔离）和 DIP（依赖倒置）。尤其是 DIP，和"为什么现在的框架都在用依赖注入"这个问题直接相关，应该会挺有意思的。
