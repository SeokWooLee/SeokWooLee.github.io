---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID原则实战篇（下）：ISP·DIP,以及依赖注入存在的理由"
lang: zh
description: "上一篇我们讲完了SOLID的前三个字母，SRP、OCP、LSP。今天来把剩下的两个字母整理完。"
header:
  og_image: /assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png
tags:
  - SOLID原则
  - ISP
  - DIP
  - 依赖注入
  - 依赖倒置
  - 接口隔离
  - 面向对象
  - Spring
  - NestJS
  - 整洁代码
permalink: /zh/SOLID-원칙-실무편-하-ISPDIP-의존성-주입이-존재하는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [English](/en/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

上一篇我们讲完了SOLID的前三个字母，SRP、OCP、LSP。今天来把剩下的两个字母整理完。

分别是ISP（接口隔离原则）和DIP（依赖倒置原则）。

尤其是DIP，是无论用Swinject还是Factory，只要在Swift里用过DI库就一定会遇到的"依赖注入（DI）"的理论根基。读完这一篇，你就会明白那些库为什么会设计成那个样子。

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png" alt="这次轮到后两个字母登场了，ISP和DIP">
  <figcaption>这次轮到后两个字母登场了，ISP和DIP</figcaption>
</figure>

---

## ISP：接口隔离原则

先看定义。

> 客户端不应该被强迫依赖它们不使用的方法。

这话听着有点抽象，但看看事故现场就能立刻明白。假设我们做了一个复合机的protocol。

```swift
protocol Machine {
    func print(_ doc: Document)
    func scan(_ doc: Document)
    func fax(_ doc: Document)
}

// 老式打印机只能打印，但是……
class OldPrinter: Machine {
    func print(_ doc: Document) { /* 正常工作 */ }
    func scan(_ doc: Document) { fatalError("不支持扫描") }  // 硬凑的实现
    func fax(_ doc: Document) { fatalError("不支持传真") }   // 硬凑的实现
}
```

这是强迫一台只能打印的打印机去实现扫描和传真的场景。结果就产生了抛异常的假方法，而这恰好也是上一篇讲到的LSP违反。臃肿的接口就是这样连锁破坏两条原则的。

处方很简单，把接口按角色拆分就行。

```swift
protocol Printer { func print(_ doc: Document) }
protocol Scanner { func scan(_ doc: Document) }
protocol Fax { func fax(_ doc: Document) }

class OldPrinter: Printer { ... }                      // 只打印
class MultiFunction: Printer, Scanner, Fax { ... }     // 什么都能做的复合机
```

各自只承诺自己能做到的事。在实战中，这种情况会以这样的迹象出现：采用某个protocol时，如果发现自己在写"这个方法跟我们没关系……"的空实现，那这个protocol就该拆分了。

---

## DIP：依赖倒置原则

这是一个因为名字而常被误解的原则。定义只有两句话。

> 高层模块不应该依赖低层模块，两者都应该依赖抽象。

> 抽象不应该依赖细节，细节应该依赖抽象。

看代码更直观。假设订单服务直接使用了邮件发送库。

```swift
// 高层模块（业务逻辑）直接依赖低层模块（实现细节）
import SendGrid

class OrderService {
    private let mailer = SendGridClient(apiKey: apiKey)

    func completeOrder(_ order: Order) {
        // 处理订单……
        mailer.send(to: order.email, message: "订单完成")  // 被绑死在SendGrid上
    }
}
```

这个结构有两个问题。要把SendGrid换成别的服务，就得动业务逻辑；而且每次测试都会真的发出邮件。

应用DIP之后，箭头方向会发生变化。

```swift
// 抽象由高层模块（订单领域）来定义
protocol NotificationSender {
    func send(to: String, message: String) async throws
}

class OrderService {
    private let sender: NotificationSender

    init(sender: NotificationSender) {  // 只依赖抽象
        self.sender = sender
    }

    func completeOrder(_ order: Order) async throws {
        try await sender.send(to: order.email, message: "订单完成")
    }
}

// 细节（SendGrid）跟随抽象走
class SendGridSender: NotificationSender { ... }
class SlackSender: NotificationSender { ... }
class FakeSender: NotificationSender { ... }  // 用于测试
```

原本朝向"订单服务 → SendGrid"的依赖，现在变成了"订单服务 → protocol ← SendGrid"。因为细节转而向领域低头，所以才叫"倒置"。

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/4-1783847948960.png" alt="箭头方向反转的那一刻，就是DIP的全部">
  <figcaption>箭头方向反转的那一刻，就是DIP的全部</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/2.png" alt="箭头方向的转变，就是&quot;倒置&quot;的真面目">
  <figcaption>箭头方向的转变，就是&quot;倒置&quot;的真面目</figcaption>
</figure>

---

## 所以才会有DI框架

这里自然会冒出一个问题："那`SendGridSender()`到底由谁来创建呢？"

代替我们完成这个组装工作的，正是依赖注入（DI）容器。Swift阵营里的Swinject、Factory之类的DI库，做的正是这件事。让各个类只面向protocol编写，而把真正实现类插进去的工作，交给库来负责。

DIP是原则（方向），DI是实现它的技巧（工具）。只要抓住这个区分，面试回答的档次都能提高一个等级。

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/3.png" alt="实现类可以随意插拔，组装的工作交给框架去做">
  <figcaption>实现类可以随意插拔，组装的工作交给框架去做</figcaption>
</figure>

---

## SOLID全篇总结

跨越两篇讲完的SOLID，浓缩成五句话就是这样。

| 原则 | 一句话总结 |
|------|-----------|
| SRP | 提出修改需求的人不同，代码就该分离 |
| OCP | 频繁变化的地方，用扩展代替修改来应对 |
| LSP | 子类不能违背父类的承诺 |
| ISP | 不要强迫别人实现用不到的方法 |
| DIP | 不要让业务逻辑依附于实现细节 |

这五条最终都指向同一个方向：缩小变更的波及范围。

不过，如果把这些原则machine式地套用到所有代码上，反而会违背KISS和YAGNI原则。这些原则是要挑真正频繁发生变化的地方来用的工具。我认为，这种平衡感才是真正的实力所在。
