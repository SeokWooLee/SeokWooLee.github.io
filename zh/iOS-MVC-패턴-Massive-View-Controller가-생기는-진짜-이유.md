---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "iOS MVC 模式：Massive View Controller 出现的真正原因"
lang: zh
description: "做 iOS 开发的人多少都听过一句玩笑话。"
header:
  og_image: /assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/1.png
tags:
  - iOS
  - MVC
  - 架构设计
  - UIKit
  - 视图控制器
  - Swift
  - iOS开发
  - MassiveViewController
  - App开发
  - iOS架构
permalink: /zh/iOS-MVC-패턴-Massive-View-Controller가-생기는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [English](/en/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

做 iOS 开发的人多少都听过一句玩笑话。

“MVC 不是 Model-View-Controller 的缩写，而是 Massive View Controller 的缩写。”

听着像调侃，但确实说到了痛处。MVC 明明是 Apple 官方推荐的架构，可为什么照着做下去，视图控制器最后往往会膨胀成几千行的怪物呢？

作为 iOS 架构系列的第一篇，今天我们就来梳理一下**MVC 原本是怎样的设计，以及在 iOS 里为什么没能按照那个设计走**。

先说结论：问题并不出在 MVC 这个概念本身，而是出在 **UIViewController 这个类本身就横跨在 View 和 Controller 边界上**这个结构上。

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/1.png" alt="既不属于 Model 也不属于 View 的代码，最后全都涌向了视图控制器">
  <figcaption>既不属于 Model 也不属于 View 的代码，最后全都涌向了视图控制器</figcaption>
</figure>

---

## MVC 原本长什么样

MVC 是一个非常古老的模式，1979 年诞生于 Smalltalk。它的原型对三个角色的划分非常清晰。

- **Model**：数据和业务逻辑
- **View**：界面展示
- **Controller**：接收用户输入并传递给 Model

在原型 MVC 中，View 会直接观察 Model。Model 一变化，View 就会自动跟着更新。

但 Apple 的 MVC 略有不同。它让 View 和 Model 彼此完全不知道对方的存在，改成**由 Controller 在中间统一负责中转**。这是为了提高复用性而做出的合理选择，但也因此给 Controller 打开了一条不断堆积职责的路。

---

## UIViewController 这个名字本身就有问题

Apple MVC 中的 Controller 在 iOS 里是通过 UIViewController 实现的。但请再看一眼这个类的名字。**View + Controller**。名字本身就把两个角色粘在了一起。

实际上，UIViewController 承担的工作包括：

- 管理 `viewDidLoad`、`viewWillAppear` 之类的**视图生命周期**
- 处理屏幕旋转、布局刷新等**紧贴视图的事件**
- 实现 `UITableViewDataSource`、`UITableViewDelegate` 之类的**视图协议**

到这里为止，这些都还算是和视图相关的工作。真正的问题在于，面对“那网络请求该写在哪？”“页面跳转呢？”“数据格式化呢？”这类问题时，根本没有明确的答案。既不属于 Model，也不属于 View，最后全都堆进了视图控制器里。

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/2.png" alt="名字就叫 View+Controller，一个人扛下所有几乎成了默认选项">
  <figcaption>名字就叫 View+Controller，一个人扛下所有几乎成了默认选项</figcaption>
</figure>

---

## 臃肿视图控制器的典型样貌

把常见的视图控制器结构写成代码，大致是这样的：

```swift
final class ProfileViewController: UIViewController {
    // 1. 视图属性
    private let tableView = UITableView()

    // 2. 状态（实际上是 Model 的缓存）
    private var user: User?
    private var posts: [Post] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayout()          // 3. 布局代码
        fetchProfile()         // 4. 网络请求
    }

    private func fetchProfile() {
        URLSession.shared.dataTask(...) { ... }  // 5. 解析、错误处理
    }

    @objc private func editTapped() {
        // 6. 连页面跳转都自己处理
        navigationController?.pushViewController(EditViewController(), animated: true)
    }
}
```

布局、状态管理、网络请求、解析、页面跳转，全都塞在同一个文件里。再加上一堆 delegate 的实现，很快就会超过一千行。

这种结构真正的代价不在于行数,而在于**根本无法测试**。哪怕只是想验证“user 为 nil 时编辑按钮应该隐藏”这种简单逻辑,也得把整个 UIViewController 拉起来,还得模拟它的生命周期。

---

## 那 MVC 该被抛弃吗？

倒也不必。对于规模较小的页面，MVC 依然是最快、最简单的选择。而且 Apple 的框架本身就是围绕 MVC 设计的，如果硬要套上其他架构，反而会产生摩擦。

关键在于，即便继续使用 MVC，也要**有意识地把能从视图控制器里剥离出去的职责剥离出去**。

- 网络、数据逻辑 → 拆到独立的 service 对象里
- 页面跳转 → 拆到 Coordinator 之类的专职对象里
- 单元格构建、格式化 → 拆到专门的类型里

做到这一步之后，早晚会想把“生成界面展示状态的逻辑”也分离出去。这个答案就是下一篇要讲的 **MVVM**。接下来我们会继续聊聊为什么需要 ViewModel 这样一个对象，以及没有绑定机制的话为什么它只能算做了一半。

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/3.png" alt="从能剥离的职责开始有意识地拆分，就是改变的起点">
  <figcaption>从能剥离的职责开始有意识地拆分，就是改变的起点</figcaption>
</figure>

---

## 小结

- MVC 本身没有错。问题在于 iOS 的结构特性——UIViewController 同时兼任了 View 和 Controller 的角色。
- 既不属于 Model 也不属于 View 的代码无处安放，最后全都堆进视图控制器里，这就是 Massive View Controller 的真相。
- 对于小规模页面，MVC 依然有效。但网络请求、页面跳转、格式化这些职责需要有意识地拆分出去。
- 如果想把生成视图状态的逻辑也分离出去，就需要用到 MVVM。下一篇会详细讲解。
