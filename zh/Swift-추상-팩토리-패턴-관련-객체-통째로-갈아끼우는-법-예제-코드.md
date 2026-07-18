---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 抽象工厂模式，整套替换关联对象的方法(附示例代码)"
lang: zh
description: "有没有把应用界面主题从浅色整体换成深色的经历？"
header:
  og_image: /assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/1-1783771760314.png
tags:
  - Swift
  - 抽象工厂模式
  - 设计模式
  - AbstractFactory
  - iOS开发
  - Swift语法
  - 工厂方法
  - 面向对象
  - 编程学习
  - 编程入门
permalink: /zh/Swift-추상-팩토리-패턴-관련-객체-통째로-갈아끼우는-법-예제-코드/
toc: true
toc_sticky: true
last_modified_at: 2026-07-18
---

🌐 [한국어](/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · [English](/en/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · [日本語](/ja/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · **中文**
{: .notice--info}

有没有把应用界面主题从浅色整体换成深色的经历？

把按钮的颜色、标签的颜色一个个地换过去，总有一个地方会漏掉。很容易出现按钮已经换成黑色背景，标签却还留着白色背景的问题。

这种时候，Swift 抽象工厂模式正好派上用场。它的做法是把相互关联的对象打包成一整套，然后整套一起替换。

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/1-1783771760314.png" alt="Swift 抽象工厂模式,替换的不是零件,而是整个工厂">
  <figcaption>Swift 抽象工厂模式,替换的不是零件,而是整个工厂</figcaption>
</figure>

这篇文章会梳理清楚抽象工厂模式到底解决了什么问题、怎样用 Swift 代码把关联对象整套替换掉，以及什么时候该用、什么时候不该用。

---

## 抽象工厂模式是什么?

用一句话来概括就是这样。

> 把必须搭配在一起使用的对象打包成一个工厂，再根据情况整体替换这个工厂的模式。

关键在于"必须一起使用的对象"这一点。深色主题的按钮和浅色主题的背景混在一起，显然是不合适的。

抽象工厂正是为了防止这种搭配上的失误。

只要选定一个工厂，这个工厂生产出来的部件之间就会自动搭配得当。选了浅色工厂，出来的就是浅色按钮、浅色标签、浅色背景。

不是一个个单独挑选部件，而是整体挑选工厂。

这就是抽象工厂模式的全部要点。

---

## 在 Swift 中整套替换关联对象的方法

看实际代码会更直观。这里以 UI 主题为例。

先定义好要生产的部件规格(协议),以及生产这些部件的工厂规格。

```swift
protocol Button { func render() -> String }
protocol Label  { func render() -> String }

// 工厂整体负责一套相互搭配的部件
protocol ThemeFactory {
    func makeButton() -> Button
    func makeLabel() -> Label
}
```

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/2.png" alt="从定义一个 protocol 开始">
  <figcaption>从定义一个 protocol 开始</figcaption>
</figure>

接下来分别创建浅色主题工厂和深色主题工厂。每个工厂只生产符合自己主题的部件。

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/4-1783847732231.png" alt="选定一个工厂,部件就自动整套配齐">
  <figcaption>选定一个工厂,部件就自动整套配齐</figcaption>
</figure>

```swift
struct LightFactory: ThemeFactory {
    func makeButton() -> Button { LightButton() }
    func makeLabel() -> Label  { LightLabel() }
}
struct DarkFactory: ThemeFactory {
    func makeButton() -> Button { DarkButton() }
    func makeLabel() -> Label  { DarkLabel() }
}
```

负责绘制界面的一方只需要接收一个工厂就可以了,不需要关心具体是哪个工厂。

```swift
func buildScreen(with factory: ThemeFactory) {
    let button = factory.makeButton()
    let label  = factory.makeLabel()
    print(button.render(), label.render())
}

// 切换主题只需改这一行工厂代码
buildScreen(with: DarkFactory())
```

把 `LightFactory()` 换成 `DarkFactory()` 的瞬间,按钮和标签会一起切换成深色。

不用再单独去改按钮颜色、单独去改标签颜色了。

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/3.png" alt="从浅色换成深色,只改了一行,界面却严丝合缝">
  <figcaption>从浅色换成深色,只改了一行,界面却严丝合缝</figcaption>
</figure>

---

## 和工厂方法模式有什么区别?

名字相似,很容易混淆,这里specifically说明一下。

| 区分 | 工厂方法 | 抽象工厂 |
|------|------|------|
| 生产对象 | 一种对象 | 多种相关对象(一整套) |
| 关注点 | "要造什么" | "把搭配得当的东西打包在一起" |
| 代表示例 | 生成一个按钮 | 按钮+标签+背景一整套 |

简单来说,工厂方法是生产单个部件的方法,抽象工厂是把这些部件打包成一整套的方法。

也可以理解为,抽象工厂内部会用到多个工厂方法。

---

## 什么时候该用,什么时候该避免

实际用下来会发现,有些场景很合适,有些场景反而用力过猛。

**适合使用的情况**

- 像主题、平台、国家这样,"以整套为单位"发生变化的场景非常明确时
- 需要像 iOS 和 macOS 那样把整组 UI 部件整体替换时
- 支付方式、数据库驱动这类需要整套替换的结构

**用力过猛的情况**

- 需要生产的对象只有一两种时
- 搭配规则频繁变动,导致这一整套本身就不稳定时

如果只有一个对象却硬要搭建抽象工厂,反而只会让代码变多、变难读。

只有在"确实有理由打包成一套"的时候再拿出来用比较好。

---

## 两个常见问题

**Q. 以后要追加部件种类怎么办?**

需要在协议里追加方法,并且让所有工厂都实现这个方法。工厂一多,这部分改动会比较费力,所以如果项目里部件种类经常增加,最好提前考虑好这一点。

**Q. SwiftUI 里也能用吗?**

当然可以用,不过 SwiftUI 自带 `Environment`、`@Observable` 这类注入方式已经很完善,像主题这种场景往往用这些机制更简洁。在基于 UIKit,或者纯逻辑层需要整套替换时,抽象工厂才更能发挥作用。

---

抽象工厂说到底是一种"把不能各自为政的东西用一个手柄统一起来"的模式。

只改一行主题切换代码,整个界面就严丝合缝地跟着变的体验,只要经历过一次,就会立刻明白为什么要用这个模式。建议从一个小例子开始,亲手敲一遍代码。
