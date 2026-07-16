---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "构造函数注入 vs 属性注入 vs 方法注入,到底该用哪个(Swift DI 全面总结)"
lang: zh
description: "用 Swift 开发 iOS 应用时,总会遇到一个绕不开的问题。"
header:
  og_image: /assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/1.png
tags:
  - SwiftDI
  - 依赖注入
  - 构造函数注入
  - 属性注入
  - Swift
  - iOS开发
  - Swift学习
  - App开发
  - 编程学习
  - Swinject
permalink: /zh/생성자-주입-vs-프로퍼티-주입-vs-메서드-주입-뭘-써야-할까-Swift-DI-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

🌐 [한국어](/%EC%83%9D%EC%84%B1%EC%9E%90-%EC%A3%BC%EC%9E%85-vs-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%A3%BC%EC%9E%85-vs-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A3%BC%EC%9E%85-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-Swift-DI-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/%EC%83%9D%EC%84%B1%EC%9E%90-%EC%A3%BC%EC%9E%85-vs-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%A3%BC%EC%9E%85-vs-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A3%BC%EC%9E%85-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-Swift-DI-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/%EC%83%9D%EC%84%B1%EC%9E%90-%EC%A3%BC%EC%9E%85-vs-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EC%A3%BC%EC%9E%85-vs-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A3%BC%EC%9E%85-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C-Swift-DI-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

用 Swift 开发 iOS 应用时,总会遇到一个绕不开的问题。

"依赖注入到底该用哪种方式才对?"

先说结论。

> 如果没有特殊理由,**构造函数(init)注入**是最接近标准答案的选择。

下面就结合实际经验,聊聊为什么会这样,以及另外两种方式适合在什么场景下使用。

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/1.png" alt="构造函数、属性、方法注入,从第一屏就能看出差别">
  <figcaption>构造函数、属性、方法注入,从第一屏就能看出差别</figcaption>
</figure>

---

## 先理清三种注入方式的核心区别

在被绕晕之前,先把骨架搭好。Swift 中注入依赖的方式大体分三种。

1. **构造函数(init)注入** —— 通过 `init` 参数接收依赖
2. **属性注入** —— 之后再赋值给 `var` 属性
3. **方法注入** —— 通过单独的方法进行注入

先看最推荐的构造函数注入代码。

```swift
final class OrderService {
    private let repo: MemberRepository // 用 let 保证不可变

    init(repo: MemberRepository) { // 构造函数(init)注入
        self.repo = repo
    }
}
```

不需要任何额外的库,单靠纯 Swift 语法就能实现,代码也很干净。

相比之下,属性注入就短得多。

```swift
final class OrderService {
    var repo: MemberRepository! // 只有一行,看起来很方便……
}
```

一眼看去,属性注入显然更简洁。但正是这份简洁,后面会拖后腿。

---

## 为什么都说不要用属性注入?

先从实际会遇到的问题说起。

属性注入在测试时真的很麻烦。创建对象后如果忘记注入,就会因为可选值强制解包而崩溃,而且光看类型根本无法判断到底还需要填入什么才算完整。

如果是构造函数注入,像 `OrderService(repo: mockRepo)` 这样,直接用纯 Swift 代码就能把 mock 对象传进去。

第二个问题是无法使用 `let` 关键字。

构造函数注入可以把属性声明为 `let`,一旦注入完成就不会再变,成为不可变对象。

反过来,属性注入只能用 `var`,值随时可能被改动,留下了出错的空间。

第三个问题是循环引用。

如果 A 引用 B、B 又引用 A,属性注入要等到应用运行时才会察觉——往往是进入对应界面的那一刻才会出问题。

而构造函数注入在创建对象的那一刻就会暴露问题(如果设计本身有问题,甚至根本编译不过),能让你早得多地发现问题。

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/4-1783847681137.png" alt="循环引用爆出来的时机,完全不一样">
  <figcaption>循环引用爆出来的时机,完全不一样</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/2.png" alt="还在只用字段注入的时候,每次写测试都很头疼">
  <figcaption>还在只用字段注入的时候,每次写测试都很头疼</figcaption>
</figure>

---

## 一目了然的对比表

光说容易绕晕,所以整理成了表格。(基于 2026 年 Swift 社区的推荐方向)

| 分类 | 构造函数(init)注入 | 属性注入 | 方法注入 |
|------|------------|------------------|------------------|
| 不可变性(let) | 支持 ⭕ | 不支持 ❌ | 不支持 ❌ |
| 测试便利性 | 高 | 低 | 中等 |
| 循环引用检测 | 创建时立即发现 | 发现较晚 | 发现较晚 |
| 必需/可选依赖 | 适合必需依赖 | 界限模糊 | 适合可选依赖 |
| 代码简洁度 | 中等 | 非常简洁 | 中等 |

光看表格就能感受到大致的走向吧。

构造函数注入在大多数项目上都占优势。所以 Swinject 或 Factory 这类 DI 库的文档,也都把构造函数注入作为默认推荐方式。

---

## 那另外两种方式什么时候用?

这并不是说必须只用构造函数注入。每种方式都有各自合适的场景。

**方法注入**很适合可选依赖的场景。

对于即便没有注入对象也无所谓的依赖——也就是有就用、没有也没关系的那种——可以通过 `configure(with:)` 这样的方法灵活地注入。

**属性注入**如果还有用武之地,大概就是像 Storyboard 创建的视图控制器这种、初始化时机无法由我们自己控制的地方了。

在普通的应用程序代码里,还是尽量避免使用为好。

总结一下:

- 必需依赖 → 构造函数注入
- 可选依赖 → 方法注入
- 普通代码中的属性注入 → 尽量避免

---

## 常见问题

**Q. 使用 Factory 这类 DI 库,构造函数注入会变得更方便吗?**

是的。只要在 Swinject 或 Factory 里注册好依赖的创建方式,容器就会代替你生成要传给构造函数的对象。代码会变短,同时还能保留 `let` 不可变性这类优点。

**Q. 构造函数参数太多怎么办?**

这不是注入方式本身的问题,而是那个类承担的职责太多的信号。应该先考虑拆分职责、把类拆开。

**Q. 小项目也一定要用 DI 库吗?**

不需要。如果项目规模只有几个界面,单纯用 `init` 直接传参的纯构造函数注入就足够了。

<figure>
  <img src="/assets/images/posts/18fb1585-1cdb-4d38-8d79-30c40d4931f3/3.png" alt="犹豫不决时,按这个顺序选就行">
  <figcaption>犹豫不决时,按这个顺序选就行</figcaption>
</figure>

---

刚开始很容易被属性注入的简便所吸引,但当你开始写测试、开始协作开发,就会切身体会到为什么构造函数注入的优点会被反复强调。

如果还在犹豫,不妨先从构造函数注入开始。随着代码规模越来越大,你会越来越庆幸当初这么选。
