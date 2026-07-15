---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SwiftUI 不需要 ViewModel?MV 模式论战全面梳理"
lang: zh
description: "iOS 社区里有一场持续了好几年的热门争论。"
header:
  og_image: /assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png
tags:
  - SwiftUI
  - MV模式
  - MVVM
  - ViewModel
  - Observable
  - iOS
  - 架构
  - State
  - iOS开发
  - iOS架构
permalink: /zh/SwiftUI에-ViewModel이-필요-없다-MV-패턴-논쟁-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

iOS 社区里有一场持续了好几年的热门争论。

**"SwiftUI 真的需要 ViewModel 吗?"**

上一篇我们梳理过,MVVM 的核心在于绑定(binding),而 SwiftUI 恰恰把绑定内置在了框架里。于是就出现了这样的主张:"既然如此,ViewModel 这一层本身岂不是多余的?"这就是所谓的 **MV(Model-View)模式**阵营。

作为系列的最后一篇,今天我们会把这场论战双方的论据都摆在桌面上,公平地看一遍,最后再整理出**到底该按什么标准来判断**。

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png" alt="SwiftUI 社区持续多年的 MV vs MVVM 论战">
  <figcaption>SwiftUI 社区持续多年的 MV vs MVVM 论战</figcaption>
</figure>

---

## SwiftUI 的 View 本来就已经很像 ViewModel 了

回顾一下 UIKit 时代为什么需要 MVVM:

- UIViewController 越来越臃肿,想把状态和逻辑挪到外面去
- 需要绑定机制来让状态和界面保持同步

但 SwiftUI 的 View 从一开始就是**状态的函数**。`body` 只是接收状态、返回界面声明而已,一旦 `@State` 的值发生变化,框架会自动重新绘制。根本用不着为了绑定去写 Combine 的订阅代码。

而且,SwiftUI 的 View 不是类,而是**值类型的 struct**。它不像 UIViewController 那样会膨胀成几千行的生命周期大杂烩,反而更像是每次渲染都会重新生成的一份轻量级"设计图"。

MV 阵营的主张正是从这里出发的:"既没有会膨胀的 View,绑定又是白送的,那每个界面都单独造一个 ViewModel 类,是不是只是把 UIKit 的习惯惯性地带了过来?"

---

## MV 阵营的论据

在 MV 模式中,不会为每个界面单独设置 ViewModel,而是让 View 直接使用状态相关的工具。

- 只属于单个视图的状态用 `@State`
- 多个界面共享的状态,用 `@Observable` 模型通过 `@Environment` 注入
- 服务器数据由 Model 层的 store 或 client 负责

```swift
struct ProfileView: View {
    @Environment(UserStore.self) private var store
    @State private var isEditing = false

    var body: some View {
        List(store.posts) { PostRow(post: $0) }
            .task { await store.loadPosts() }
    }
}
```

Apple 官方的示例代码(Fruta、Food Truck 等)大体上也是这种结构。不是给每个界面配一个 ViewModel,而是让多个 View 共享一个按领域划分的 `@Observable` 模型。

这种做法的优点很明确:省去了每个界面都要建一个类的样板代码,而且可以毫无阻碍地直接使用 `@State`、`@Binding` 这类框架自带的工具。

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/2.png" alt="SwiftUI 的 View 从一开始就是状态的函数">
  <figcaption>SwiftUI 的 View 从一开始就是状态的函数</figcaption>
</figure>

---

## MVVM 阵营的反驳

另一边的论据也不容小觑。

**第一,逻辑会渗进 View 里。** 类似"帖子数为 0、加载已完成、且没有错误时显示提示文案"这样的条件,一旦开始在 `body` 里堆三元运算符,即便是值类型,可读性照样会变差。

**第二,测试的问题。** View 的 `body` 很难用单元测试来跑。如果展示层逻辑写在 View 里面,这部分逻辑也会一并落入测试盲区。而抽成 ViewModel 的话,它就是一个纯粹的 Swift 对象,可以直接验证。

**第三,规模问题。** 如果一个应用有几十个界面、由多人协作开发,就需要一套关于"状态和逻辑该放在哪里"的统一规则。有人认为,给每个界面都固定一个 ViewModel 的位置,能降低协作成本。

---

## 关键不在名字,而在依赖方向

把双方的论据放在一起看就会发现,这场论战与其说是"有没有一个叫 ViewModel 的类",不如说本质上是**逻辑和状态该放在哪里**的问题。按下面这个标准去判断,大多数情况都能理清楚:

- **只属于单个视图的 UI 状态**(开关、焦点、是否显示 sheet)放在 View 里用 `@State` 管理。为此专门抽出一个 ViewModel 反而是过度设计。
- **多个界面共享的领域状态**做成 `@Observable` 模型再注入。不管它叫 Store 还是 ViewModel,本质是一样的。
- **当界面相关的加工逻辑变复杂时**(格式化、显示条件、排序筛选),就把它抽到 View 之外、可测试的类型里。这实际上就是 ViewModel。
- 不管选哪种做法,只要守住**View 不直接碰网络或数据库**这条依赖方向,那 MV 还是 MVVM,差别就更接近于叫法不同而已。

归根结底,"SwiftUI 不需要 ViewModel"这句话的实质可以这样概括:**不必机械地给每个界面都造一个 ViewModel,但需要从 View 中抽离出来的逻辑,并不会因此凭空消失。**

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/3.png" alt="真正的判断标准不是名字,而是依赖方向">
  <figcaption>真正的判断标准不是名字,而是依赖方向</figcaption>
</figure>

---

## 系列总结

把这三篇 iOS 架构系列各自浓缩成一句话:

- **MVC**:UIViewController 身兼 View 和 Controller 两职,职责过于集中。放在小型界面上依然管用。
- **MVVM**:把界面状态抽到 ViewModel,再用绑定同步。没有绑定,这套模式就只剩一半。
- **MV 论战**:SwiftUI 把绑定内置了,所以没有必要强制每个界面都配一个 ViewModel。不过逻辑该放在哪里、依赖方向该怎么设计,这些问题依然需要认真考虑。

架构不是追赶潮流,而是**根据团队和应用规模做出的权衡取舍**。如果反响不错,后面我们再聊聊 VIPER、TCA 这些更"重"的选择。
