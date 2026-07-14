---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 观察者模式,从 NotificationCenter 到 Combine 的实战整理"
lang: zh
description: "做 iOS 应用时,总会遇到这样的时刻:A 页面的某个状态变了,远处的 B 页面也得跟着刷新。"
header:
  og_image: /assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png
tags:
  - Swift
  - 观察者模式
  - NotificationCenter
  - Combine
  - iOS开发
  - Swift教程
  - 响应式编程
  - 设计模式
  - iOS应用开发
permalink: /zh/Swift-옵저버-패턴-NotificationCenter부터-Combine까지-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

做 iOS 应用时,总会遇到这样的时刻:A 页面的某个状态变了,远处的 B 页面也得跟着刷新。

如果强行用 delegate 把各个页面连起来,代码很容易变成一团乱麻的意大利面。

这时候就该用观察者模式了。先说结论:在 Swift 里,从 NotificationCenter 入门、再过渡到 Combine,是最自然的路线。

这篇文章会从观察者模式是什么讲起,再到 NotificationCenter 的用法,最后聊聊现在很流行的 Combine,配合实际代码一起整理一下。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png" alt="Swift 观察者模式,从左到右的这条流程线就是这篇文章的核心">
  <figcaption>Swift 观察者模式,从左到右的这条流程线就是这篇文章的核心</figcaption>
</figure>

## 观察者模式到底是什么?

观察者模式是这样一种结构:"某个对象的状态一旦变化,就自动通知所有在关注它的对象"。

用 YouTube 订阅来类比就很好理解。频道(发布者)一旦上传新视频,订阅者(观察者)们就会收到通知。

关键在于,发布者和观察者彼此不需要认识对方。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/4-1783847822056.png" alt="发布者和观察者互不相识,只靠通知传递消息">
  <figcaption>发布者和观察者互不相识,只靠通知传递消息</figcaption>
</figure>

频道不需要关心订阅者有多少、都是谁,只要喊一声"我发新视频了"就够了。

这种松耦合的连接方式,能让代码之间少一些纠缠,后续修改起来也轻松得多。

---

## NotificationCenter 怎么用?

NotificationCenter 是苹果原生提供的观察者模式工具,不需要额外的库就能直接使用。

先定义通知名称,再看发布方的代码。

```swift
// 定义通知名称
extension Notification.Name {
    static let didLogin = Notification.Name("didLogin")
}

// 登录成功时发布通知
NotificationCenter.default.post(name: .didLogin, object: nil)
```

接收方则这样注册观察者。

```swift
// 订阅通知
NotificationCenter.default.addObserver(
    self, selector: #selector(handleLogin),
    name: .didLogin, object: nil
)
```

有一点需要注意:旧写法(addObserver + selector)如果在页面消失时不调用 removeObserver,可能会出问题。

不过 iOS 9 以后,很多情况下系统会自动清理;如果用的是基于闭包(block)的 API,重点是要管理好返回的那个 token。

---

## 换成 Combine 有什么好处?

Combine 是苹果在 2019 年发布的响应式编程框架,iOS 13 起可用。

NotificationCenter 也可以转换成 Combine 的 Publisher,能很自然地和已有代码融合在一起。

```swift
// 把 NotificationCenter 转换成 Combine 方式
let token = NotificationCenter.default
    .publisher(for: .didLogin)
    .sink { _ in
        print("检测到登录!")
    }
```

Combine 真正的优势在于,可以把数据流一节节串接起来。

用 map、filter 之类的操作符加工数据、合并多个事件流,都不在话下。

而且 sink 返回的订阅(AnyCancellable)只要存进变量里,那个变量一旦消失,订阅也会自动取消。内存管理因此轻松了不少。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/2.png" alt="我就是这样开着代码,一边动手敲一边找到感觉的">
  <figcaption>我就是这样开着代码,一边动手敲一边找到感觉的</figcaption>
</figure>

---

## 那到底该用哪个?

这要看具体场景。整理成了下面这张表。

| 项目 | NotificationCenter | Combine |
|------|-------------------|---------|
| 推出时间 | 历史悠久的基础 API | iOS 13+ |
| 学习难度 | 低 | 中等偏上 |
| 数据加工 | 较难 | 可用 map/filter 自由处理 |
| 内存管理 | 需自行处理 | 存好订阅即可自动处理 |

如果只是一两个简单的通知,NotificationCenter 完全够用。

反过来,如果数据流比较复杂,或者需要组合多个事件,Combine 会清爽得多。

> 如果是刚接触,建议先用 NotificationCenter 熟悉概念,等上手了再转向 Combine。

当然,现在 SwiftUI 和 async/await 也是主流,如果是新项目,建议把这两者也一并纳入考虑。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/3.png" alt="一个通知弹出来,另一个页面也跟着刷新的那一刻,真的挺有成就感">
  <figcaption>一个通知弹出来,另一个页面也跟着刷新的那一刻,真的挺有成就感</figcaption>
</figure>

---

## 写在最后

今天把 Swift 观察者模式从 NotificationCenter 到 Combine 大致梳理了一遍。

不必一开始就追求完全理解,不妨先动手做一个小小的通知试试看。亲手写一遍,手感很快就会来了。加油!
