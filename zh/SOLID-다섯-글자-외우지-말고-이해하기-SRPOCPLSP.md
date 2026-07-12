---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID 五个字母，别死记硬背，要理解它（SRP·OCP·LSP）"
lang: zh
description: "面试时被问到\"你能解释一下 SOLID 原则吗\"，相信不少人都遇到过。"
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
last_modified_at: 2026-07-12
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [English](/en/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [日本語](/ja/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **中文**
{: .notice--info}

面试时被问到"你能解释一下 SOLID 原则吗"，相信不少人都遇到过。

但说实话，很多人能把五个原则倒背如流，可一旦被追问"那这在你的代码里具体怎么用"，往往就答不上来了。我自己也曾经是这样。

所以这次我想换个角度，不用教科书式的定义，而是结合实际开发场景来讲解 SOLID。内容比较多，分成两篇。今天先讲前三个字母：SRP、OCP、LSP。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="五个字母，今天先讲前三个">
  <figcaption>五个字母，今天先讲前三个</figcaption>
</figure>

SOLID 是罗伯特·马丁（Uncle Bob）总结的面向对象设计五大原则的首字母缩写。

- **S**RP — 单一职责原则
- **O**CP — 开闭原则
- **L**SP — 里氏替换原则
- **I**SP — 接口隔离原则
- **D**IP — 依赖倒置原则

这五个原则看似各说各话，但贯穿其中的核心思想只有一个：当变化发生时，尽量缩小需要修改的代码范围。

---

## SRP — 单一职责原则

教科书上的定义是"一个类应该只承担一项职责"，不过 Uncle Bob 本人后来用了一个更贴切的说法重新表述了它。

> 模块应该只对一个执行者（actor）负责。

这里的执行者，指的是要求这段代码发生变更的人（或部门）。举个例子，假设有这样一个类：

```javascript
class Employee {
  calculatePay() { ... }    // 财务部要求修改
  reportHours() { ... }     // 人事部要求修改
  save() { ... }            // 开发部（DBA）要求修改
}
```

这三个方法背后的"主人"完全不同。如果因为财务部的需求去修改 `calculatePay`，结果动到了公共逻辑，人事部的报表可能就会悄无声息地出错。真出了这种事故，排查起来也非常麻烦。

SRP 把这个道理总结为："要求变更的人不同，代码就应该分开。"把薪资计算、工时报表、数据保存分别拆成不同的类，财务部的需求就不会再影响到人事部的功能了。

---

## OCP — 开闭原则

定义是"对扩展开放，对修改关闭"。第一次听可能觉得像是在打禅语，但看代码就一目了然了。

```javascript
// 每增加一种支付方式，都要改这个函数
function pay(method, amount) {
  if (method === 'card') { ... }
  else if (method === 'kakaopay') { ... }
  else if (method === 'naverpay') { ... }
  // 新支付方式 = 新的 else if = 修改已有代码
}
```

在这种结构下，要新增 Toss Pay，就得打开这个原本运行良好的函数去改动。每改一次，都要承担让现有支付方式出问题的风险。

```javascript
// 新增支付方式只需要"添加"，不用改动已有代码
const payments = {
  card: new CardPayment(),
  kakaopay: new KakaoPayment(),
  naverpay: new NaverPayment(),
  // 新增 Toss Pay = 只需注册一个新类
};

function pay(method, amount) {
  return payments[method].process(amount);
}
```

不动已有代码（对修改关闭），只靠新增类就能扩展功能（对扩展开放）。诀窍在于，只在经常变动的地方采用这种结构。要是所有代码都套上这一层，就会违反上一篇提到的 YAGNI 原则。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="新增 Toss Pay 只需要加一个类就搞定">
  <figcaption>新增 Toss Pay 只需要加一个类就搞定</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="用新增代替修改，这就是 OCP">
  <figcaption>用新增代替修改，这就是 OCP</figcaption>
</figure>

---

## LSP — 里氏替换原则

这个名字听起来最吓人，但含义其实很简单。

> 子类应该可以完全替代父类出现的位置，而不会导致程序出错。

最经典的反例就是矩形-正方形问题。如果按照"正方形是一种矩形"这个数学常识去做继承，就会出现这样的情况：

```javascript
class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; }  // 因为是正方形
  setHeight(h) { this.width = h; this.height = h; }
}

// 假设传入的是矩形
function test(rect) {
  rect.setWidth(5);
  rect.setHeight(4);
  console.log(rect.width * rect.height); // 期望是 20，但如果是 Square 则是 16
}
```

一旦传入 Square，"宽 5、高 4，面积应为 20"这个理所当然的预期就被打破了。哪怕表面上看起来符合 is-a 关系，只要行为上的约定被破坏，就不应该用继承——这就是 LSP 的核心。

实际开发中的信号是这样的：如果子类在重写父类方法时抛出异常，或者干脆留空实现，那这个继承关系很可能就违反了 LSP。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="正方形还真放不进矩形的位置">
  <figcaption>正方形还真放不进矩形的位置</figcaption>
</figure>

---

## 上篇小结

今天讲的这三个原则，各用一句话总结一下：

- **SRP** — 要求变更的人不同，代码就要分开。
- **OCP** — 经常变动的地方，要设计成靠"新增"应对，而不是"修改"。
- **LSP** — 子类不能违背父类的约定。如果必须违背，那说明这个继承关系本身就错了。

下一篇会讲剩下的两个字母：ISP（接口隔离）和 DIP（依赖倒置）。尤其是 DIP，跟"为什么现在的框架都在用依赖注入"这个问题直接相关，应该会很有意思。
