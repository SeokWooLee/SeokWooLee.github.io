---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 委托模式和观察者模式到底有什么区别（1:1 通信的正解）"
lang: zh
description: "做 iOS 开发,委托(delegate)模式真的是会反反复复遇到的东西。"
header:
  og_image: /assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/1.png
tags:
  - Swift
  - 委托模式
  - 观察者模式
  - iOS开发
  - 设计模式
  - Swift语法
  - NotificationCenter
  - iOS入门
  - 委托与观察者的区别
permalink: /zh/Swift-델리게이트-패턴-옵저버와-뭐가-다를까-11-통신의-정석/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/) · [English](/en/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/) · [日本語](/ja/Swift-%EB%8D%B8%EB%A6%AC%EA%B2%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%98%B5%EC%A0%80%EB%B2%84%EC%99%80-%EB%AD%90%EA%B0%80-%EB%8B%A4%EB%A5%BC%EA%B9%8C-11-%ED%86%B5%EC%8B%A0%EC%9D%98-%EC%A0%95%EC%84%9D/) · **中文**
{: .notice--info}

做 iOS 开发,委托(delegate)模式真的是会反反复复遇到的东西。

每次碰 UITableView、UITextField 加上 delegate 的时候，大概都会冒出这样的疑问：“这为什么非得是委托？直接用闭包或者通知不行吗？”

尤其是学了观察者模式之后，反而更容易搞混。两者都是“发生什么事就通知一下”的结构，那到底区别在哪呢？

先说结论。

> 委托是一个对象只对**一个人**说“这件事就交给你了”的 1:1 通信，
>
> 观察者是一件事情同时被**多个对象**订阅的 1:N 广播。

只要记住这一句话，就已经理解了一半。今天就结合代码，把这个区别彻底梳理清楚。

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/1.png" alt="委托是 1:1，观察者是 1:N，一张图就能理清楚">
  <figcaption>委托是 1:1，观察者是 1:N，一张图就能理清楚</figcaption>
</figure>

---

## 委托模式是什么？

delegate 翻译过来就是“委托”“代理”。

把自己不方便直接处理的事情，交给一个可信赖的对象，让对方“替我决定”。

用生活场景打个比方。

假设要预约一家餐厅，懒得亲自打电话，于是拜托一位助理：“帮我预约一下。”

这位助理就是 delegate。拜托的人只有一个，被拜托的人也只有一个，正是 1:1。

在 Swift 里，这种约定通过协议来表达。

```swift
// 用协议定义要委托的事情
protocol OrderDelegate: AnyObject {
    func didFinishOrder(_ menu: String)
}

class Restaurant {
    weak var delegate: OrderDelegate?  // 只能指定一个对象
    func order(_ menu: String) {
        delegate?.didFinishOrder(menu)  // 只通知这一个对象
    }
}
```

这里值得留意的是，`delegate` 不是数组，而是**单一属性**。

因为只委托给一个人，自然也就只能保存一个对象。这就是委托是 1:1 的原因。

另外还带了 `weak` 关键字。如果双方相互强引用，就会产生循环引用（retain cycle）导致内存泄漏，所以按惯例，delegate 都用弱引用持有。

---

## 和观察者模式有什么不同？

observer 是“观察者”的意思。

某个事件一旦发生，**同时**通知所有在关注它的对象。

继续用刚才助理的例子。

这次假设要向整个小区广播餐厅开业的消息：“今晚开业啦！”

听到这条广播的人可能是十个，也可能是一百个。发布的人根本不关心谁在听，只管把消息发出去就是了。

这就是 1:N 广播，也就是观察者模式。

在 iOS 中，最典型的代表就是 `NotificationCenter`。

```swift
// 事件发生 → 向所有订阅者广播
NotificationCenter.default.post(name: .storeOpen, object: nil)

// 感兴趣的对象各自订阅
NotificationCenter.default.addObserver(
    self, selector: #selector(handleOpen),
    name: .storeOpen, object: nil)
```

发送方并不知道接收方是谁，只是贴上一个名字（name）就扔出去。

接收方也是各自独立地去订阅，可能有很多个。

因为彼此不需要认识对方，耦合度低，但缺点是很难追踪当下究竟是谁在监听这条通知。

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/2.png" alt="亲手敲一遍代码，才终于找到感觉">
  <figcaption>亲手敲一遍代码，才终于找到感觉</figcaption>
</figure>

---

## 一图看懂：委托 vs 观察者

光靠文字说明容易绕晕，整理成表格看看。

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/4-1783847561867.png" alt="1:1 的委托和 1:N 的广播，用图一看就明白">
  <figcaption>1:1 的委托和 1:N 的广播，用图一看就明白</figcaption>
</figure>

| 分类 | 委托（Delegate） | 观察者（Observer） |
|------|-----------|--------|
| 通信方式 | 1:1（委托给一个对象） | 1:N（向多个对象广播） |
| 是否认识对方 | 双方彼此明确知道 | 彼此可以互不知道 |
| 代表案例 | UITableViewDelegate | NotificationCenter |
| 是否易于获取返回值 | 容易 | 困难 |
| 耦合度 | 相对较高 | 较低 |
| 追踪/调试 | 容易 | 相对困难 |

关键在于“是否需要拿到返回值”。

委托就像问一句“这个单元格高度该设多少？”，对方会把值返回过来，是一种有来有往的对话结构。

观察者则只是把消息扔出去就结束了。谁、以什么方式做出反应，发送方一概不关心。

---

## 那到底该用哪个？

在实际项目中总结出来的选择标准大致如下。

**适合用委托的情况**

1. 只需要和一个对象通信的时候
2. 需要从对方那里拿到返回值的时候（比如单元格数量、高度）
3. 像界面跳转那样流程和顺序都很明确的时候

**适合用观察者的情况**

1. 一个事件需要被多个界面同时响应的时候
2. 像登录状态变化、深色模式切换这类全局事件的时候
3. 发送方和接收方可以互不知道对方的时候

举个例子，如果登录成功后，首页、我的页面、顶部横幅需要同时发生变化，用委托就会显得力不从心。

因为委托的结构只能对接一个对象，如果要同时连到三个地方，代码就会变得很凌乱。

这种情况下，用观察者广播一次“登录成功了！”会清爽得多。

反过来，像“点击了输入框的确认按钮”这种 1:1 场景，委托或闭包才是正解。

<figure>
  <img src="/assets/images/posts/84b5ff78-dfd2-4f9b-aa60-f4cd50f3afe1/3.png" alt="在白板上用箭头画一画，会理解得容易得多">
  <figcaption>在白板上用箭头画一画，会理解得容易得多</figcaption>
</figure>

---

## 写在最后

两者看起来相似，但只要想清楚“要通知给几个对象”，选择就会变得简单。

一个对象就用委托，多个对象就用观察者，只需要记住这一条标准就足够了。

下次写代码的时候，不妨试着套用一下今天学到的内容。当脑子里的知识落到手上的那一刻，这两个模式就会一下子变得轻松起来，一起加油吧！
