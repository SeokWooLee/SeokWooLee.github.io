---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "声明式 vs 命令式：SwiftUI 所谓的“声明式”到底意味着什么"
lang: zh
description: "SwiftUI 的介绍文档开篇第一句几乎必定会出现“声明式（declarative）框架”这个说法。React 也好，Jetpack Compose 也好,都自称是声明式的。"
header:
  og_image: /assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/1.png
tags:
  - 声明式编程
  - 命令式编程
  - SwiftUI
  - UIKit
  - declarative
  - imperative
  - 函数式编程
  - 状态管理
  - 技术面试
  - 计算机基础
permalink: /zh/선언형-vs-명령형-SwiftUI가-선언형이라는-말의-진짜-의미/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · [English](/en/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · [日本語](/ja/%EC%84%A0%EC%96%B8%ED%98%95-vs-%EB%AA%85%EB%A0%B9%ED%98%95-SwiftUI%EA%B0%80-%EC%84%A0%EC%96%B8%ED%98%95%EC%9D%B4%EB%9D%BC%EB%8A%94-%EB%A7%90%EC%9D%98-%EC%A7%84%EC%A7%9C-%EC%9D%98%EB%AF%B8/) · **中文**
{: .notice--info}

SwiftUI 的介绍文档开篇第一句几乎必定会出现“声明式（declarative）框架”这个说法。React 也好，Jetpack Compose 也好,都自称是声明式的。

可一旦被问到“到底什么是声明式”,答案往往就变得含糊起来。“代码写得比较简洁”并不是正确答案。

声明式和命令式的区别,其实一句话就能说清楚：**写的是“怎么做（How）”,还是“要什么（What）”。**

这篇文章会以这个标准为基础,先从日常例子入手,再用 UIKit 和 SwiftUI 的代码来验证,最后还会谈到声明式并不是免费的午餐。

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/1.png" alt="声明式与命令式区别示意图">
  <figcaption>亲自指路就是命令式,只说目的地就是声明式</figcaption>
</figure>

核心要点如下。

1. 命令式：一步步指示达到目标结果所需的过程——How
2. 声明式：描述想要的结果是什么,过程交给系统去处理——What
3. SQL、HTML、map/filter、SwiftUI 都是声明式的代表案例
4. 声明式 UI 的本质：只需声明“当状态是这样时,画面就是这样”,状态变化引发的界面更新则交给框架去做

---

## 用打车来打比方

命令式就像亲自给司机指路。“右转、直行 300 米、在红绿灯处左转……”——把过程一步一步指示出来,这些步骤的总和最终带来“到达目的地”这个结果。

声明式则是“请去江南站”。只说出目的地（What）,至于走哪条路（How）,则交给司机和导航来决定。

两者最终都能到达目的地。区别只在于**过程的所有权掌握在自己手里,还是只负责描述结果**。

---

## 代码中,同一件事可以用两种方式来写

下面用“筛选出偶数并求平方”这段代码,分别用两种方式实现一下。

```swift
// 命令式：由我来指示如何遍历、结果存到哪里
var result: [Int] = []
for n in numbers {
    if n % 2 == 0 {
        result.append(n * n)
    }
}

// 声明式：只描述想要什么
let result = numbers.filter { $0 % 2 == 0 }.map { $0 * $0 }
```

命令式版本中,循环变量、中间数组、执行顺序这些“过程的零件”都暴露在外。声明式版本里,只留下“筛出偶数再求平方”这一层意图,具体的遍历方式则被藏进了 filter 和 map 内部。

其实我们早就在无意中使用更熟悉的声明式写法了。SQL 只写“给我符合这些条件的行”,并不会写具体的索引查找方式；HTML 也只声明“这里是标题、这里是段落”这样的结构,并不涉及渲染的具体过程。

---

## 到了 UI 层面,这种差异会被急剧放大

命令式 UI（UIKit）写的是**改变画面的过程**。

```swift
// UIKit：每当状态变化时,由我直接指示画面操作
func updateBadge(count: Int) {
    if count > 0 {
        badgeLabel.isHidden = false
        badgeLabel.text = "\(count)"
    } else {
        badgeLabel.isHidden = true
    }
}
```

这种方式的难点在于,开发者必须持续追踪“当前画面处于什么状态”。一旦更新路径变多,就很容易漏掉某一处,而这正是“数据已经变了,画面却还是老样子”这类 bug 的根源。

声明式 UI（SwiftUI）声明的则是**画面相对于状态应呈现的样子**。

```swift
// SwiftUI：声明“当 count 是这样时,画面就是这样”
struct BadgeView: View {
    let count: Int
    var body: some View {
        if count > 0 {
            Text("\(count)").badgeStyle()
        }
    }
}
```

count 发生变化时,具体该如何修改画面,这一点我们不需要亲自去写。SwiftUI 会比较旧的声明和新的声明,只更新需要更新的部分。这相当于把 UI 变成了“状态的函数”。更新过程的所有权被交给了框架,自然也就不存在会被漏掉的更新代码了。

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/2.png" alt="SwiftUI 声明式 UI 状态更新流程图" loading="lazy">
  <figcaption>命令式要自己写更新过程,声明式则由框架来计算差异</figcaption>
</figure>

---

## 声明式并不是免费的

为了保持平衡,也要看看它的另一面。

**把过程隐藏起来是有代价的——真正需要操控过程的时候,反而会觉得束手束脚**。像“把滚动位置精确地移动到这个偏移量”这类命令式需求,在声明式框架里反而需要绕道而行。

**调试的思路也完全不同**。命令式只要顺着过程一步步排查就行,声明式却要去追踪框架内部的判断逻辑,比如“这里为什么又重新渲染了”。并不是说完全不需要了解那些被隐藏起来的 How。

**性能调优最终也绕不开对内部机制的理解**。在 SwiftUI 中,当视图被过度重新计算时,想要解决问题,就必须弄清楚 diffing 和依赖追踪的运作方式。

所以准确的看法并不是“声明式更优越”,而是**抽象层级的一种取舍**。把过程的所有权交出去,代码就会以意图为中心变得更简洁,但精细的控制能力和对内部机制的理解,则会作为课题留给你。

<figure>
  <img src="/assets/images/posts/8e0f30e5-8050-45c9-8136-4399ee8b55a9/3.png" alt="SwiftUI 与 UIKit 声明式命令式对比插画" loading="lazy">
  <figcaption>交出过程所有权,换来的是精细控制权的取舍</figcaption>
</figure>

---

## 总结

- 命令式指示达到结果的过程（How）,声明式描述想要的结果（What）
- SQL、HTML、map/filter 都是我们早已熟悉的声明式写法
- 命令式 UI 编写的是改变画面的过程,容易出现状态与画面不一致的 bug
- 声明式 UI 声明“当状态是这样时,画面就是这样”,更新交给框架负责（UI = 状态的函数）
- 声明式的代价：难以进行精细的过程控制,最终仍需要理解框架内部的运作方式
- 本质上不是孰优孰劣的问题,而是过程的所有权由谁掌握的一种选择
