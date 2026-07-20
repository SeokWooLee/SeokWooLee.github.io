---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "库 vs 框架，判断标准是「谁调用谁」（控制反转）"
lang: zh
description: "Alamofire 被称为库，SwiftUI 被称为框架。但两者不都是「拿别人写好的代码来用」吗？区别到底在哪里？"
header:
  og_image: /assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/1.png
tags:
  - 库与框架
  - 控制反转
  - IoC
  - 好莱坞原则
  - SwiftUI
  - UIKit
  - 委托模式
  - 技术面试
  - 计算机基础
permalink: /zh/라이브러리-vs-프레임워크-기준은-누가-누구를-호출하나-제어의-역전/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/) · [English](/en/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/) · [日本語](/ja/%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-vs-%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EA%B8%B0%EC%A4%80%EC%9D%80-%EB%88%84%EA%B0%80-%EB%88%84%EA%B5%AC%EB%A5%BC-%ED%98%B8%EC%B6%9C%ED%95%98%EB%82%98-%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/) · **中文**
{: .notice--info}

Alamofire 被称为库，SwiftUI 被称为框架。但两者不都是「拿别人写好的代码来用」吗？区别到底在哪里？

经常能听到「框架更大」这样的说法，但体量并不是本质区别。既有体量很小的框架，也有体量庞大的库。

真正的判断标准只有一个。**谁调用谁。**

抓住这一个标准，就能自然而然地连接到「控制反转」（IoC）这个重要概念。学习依赖注入时还会再次遇到它，所以在这里把它彻底搞清楚是很划算的。

<figure>
  <img src="/assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/1.png" alt="库与框架调用方向对比示意图">
  <figcaption>从工具箱里拿出来用是库，填进骨架里就是框架</figcaption>
</figure>

先看核心要点。

1. 库：需要时由我的代码调用的工具集合。控制权在我手中
2. 框架：由框架掌握整体流程，我的代码是被框架「调用」的骨架的一部分。控制权在框架手中
3. 这种被颠倒过来的调用方向，就叫做控制反转（Inversion of Control）
4. 好莱坞原则：「别打电话给我们，我们会联系你。」

---

## 库：由我来调用的工具

库是预先实现好某种功能的代码集合。什么时候、以什么顺序使用它，完全由我的代码决定。

```swift
// 流程的主导者是我的代码
let json = try JSONDecoder().decode(User.self, from: data)
let hash = SHA256.hash(data: input)
```

程序的开始和结束、整体流程都是我自己写的，只是在中间需要的地方拿出相应的工具来用。这就像从工具箱里取出一把螺丝刀使用一样，螺丝刀本身并不决定作业顺序。

Alamofire、Kingfisher 这类库就属于这一类。什么时候发起网络请求、什么时候加载图片，都是由我决定的。

---

## 框架：反过来调用我的骨架

框架是预先搭建好应用整体结构和执行流程的骨架。我要做的，是在这个骨架预留的空位里填入代码。

以 iOS 应用为例就很清楚了。应用的入口点、事件循环、界面生命周期，全都掌握在 UIKit、SwiftUI 手里。我写的只是像 viewDidLoad、body、onAppear 这类**在框架规定的时机被框架调用**的代码。

```swift
struct ProfileView: View {
    var body: some View {   // 不是我主动调用的
        Text("Hello")       // 而是 SwiftUI 在需要时调用它
    }
}
```

body 从来不是我亲手调用的。它什么时候、被调用几次，都由 SwiftUI 决定。流程的主导权已经被颠倒过来了。

<figure>
  <img src="/assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/2.png" alt="控制反转 IoC 调用流程示意图" loading="lazy">
  <figcaption>调用方向反过来了，这就是控制反转</figcaption>
</figure>

---

## 控制反转，以及好莱坞原则

这种被颠倒的关系有一个专门的名字——控制反转（IoC，Inversion of Control）。

在普通的过程式程序中，是我的代码掌握控制流程，去调用外部代码。而在基于框架的程序中，是框架掌握这个流程，我的代码只是在预先注册好的位置被调用。控制权反过来了，所以叫「反转」。

有一个说法把这层意思表达得很生动，那就是好莱坞原则（Hollywood Principle）。

> "Don't call us, we'll call you." —— 别打电话给我们，我们会联系你。

试镜过的演员不是自己给制作公司打电话，而是一旦被选中，制作公司会主动联系他。框架和我的代码之间的关系，正是如此。

委托（delegate）模式也是同样的原理。实现 UITableViewDataSource 时，cellForRowAt 是我自己调用的吗？不是。是表格视图在需要的时候调用我。框架世界的这套语法，其实渗透在代码的方方面面。

---

## 那么在实际开发中会有什么不同

**学习方式不同**。库只需要弄清楚「有哪些功能」就行了，而框架必须先掌握「什么时候会调用我」（生命周期、调用约定）。这也是学习 UIKit 要从生命周期学起的原因。

**替换成本不同**。库只要改一下调用的地方就能换掉，但框架的情况是整段代码都建立在那副骨架之上，替换基本等于重写。这就是为什么 UIKit → SwiftUI 的迁移不是改几个函数就能搞定的事。

**测试策略不同**。由框架负责调用的代码，脱离框架很难单独运行。这也是为什么反复有人建议把业务逻辑拆分到不依赖框架的层（纯 Swift）中去。

<figure>
  <img src="/assets/images/posts/479c5583-9372-4e43-b639-e3c2b91852ac/3.png" alt="好莱坞原则概念插图" loading="lazy">
  <figcaption>别打电话给我们，我们会联系你——好莱坞原则</figcaption>
</figure>

---

## 面试时一句话总结

> 「库是由我的代码调用的工具，框架是掌握控制流程、反过来调用我的代码的骨架。这种控制权方向的差异，就叫控制反转。」

后续追问通常会是「举个 IoC 的例子」（生命周期方法、委托），以及「这样做为什么好」（把流程标准化，让开发者可以专注于业务逻辑）。

---

## 总结

- 区分标准不是体量，而是调用方向
- 库：需要时由我的代码调用的工具。控制权在我手中
- 框架：掌握流程，在规定时机调用我的代码的骨架。控制权在框架手中
- 这种被颠倒的控制权就是控制反转（IoC），别名是好莱坞原则
- viewDidLoad、body、委托方法全都是「被调用」的代码
- 实际差异：框架要先学生命周期，替换难度高，逻辑分离是测试的关键
