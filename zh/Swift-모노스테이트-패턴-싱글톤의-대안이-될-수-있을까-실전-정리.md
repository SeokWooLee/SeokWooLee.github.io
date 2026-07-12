---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 单例模式的替代方案，Monostate 模式真的靠谱吗（实战复盘）"
lang: zh
description: "写给那些觉得单例这样用下去不太对劲的朋友"
header:
  og_image: /assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png
tags:
  - Swift
  - Monostate模式
  - 单例模式
  - iOS开发
  - 设计模式
  - Monostate
  - Singleton
  - 依赖注入
  - Swift语言
  - 编程学习
permalink: /zh/Swift-모노스테이트-패턴-싱글톤의-대안이-될-수-있을까-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Swift-%EB%AA%A8%EB%85%B8%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8-%ED%8C%A8%ED%84%B4-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%98-%EB%8C%80%EC%95%88%EC%9D%B4-%EB%90%A0-%EC%88%98-%EC%9E%88%EC%9D%84%EA%B9%8C-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

写给那些觉得单例这样用下去不太对劲的朋友

做 iOS 开发，没用过单例（Singleton）的人应该不多吧。我也是这样过来的。`SomeManager.shared` 这种代码，几乎每个项目里都能翻出来好几个。

可是不知道从什么时候开始，这个 `.shared` 用着用着就觉得别扭了。写测试的时候状态老是纠缠不清，团队里的人也是想在哪调用就在哪调用。

就是在这个时候，我了解到了 Monostate（单态）模式。今天就来聊聊 Swift 里的 Monostate 到底是什么，以及它是不是真能成为单例的替代方案——分享一下我自己实际用下来的体会。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png" alt="单例和 Monostate，看这一张图就懂了">
  <figcaption>单例和 Monostate，看这一张图就懂了</figcaption>
</figure>

先说结论：Monostate 是一种“状态共享为一份，但允许创建多个实例”的模式。目的和单例一样，但实现思路正好相反。不过它也不是万能的，得看具体场景。下面我一条一条展开说。

## Monostate 模式到底是什么？

单例的核心是“只能创建一个实例”。把构造器锁死，只让大家用同一个 `shared`。

Monostate 正好相反。实例想创建多少个都行。但实例内部的状态（数据）全部改成 static 共享。

也就是说，不管你创建对象 A 还是对象 B，它们指向的数据都是同一份。表面上看是普通对象，内里其实是连在一起的。

用 Swift 简单写出来大概是这样。

```swift
struct Settings {
    private static var _volume = 50   // 状态以 static 方式共享
    var volume: Int {                 // 用起来像普通实例
        get { Settings._volume }
        set { Settings._volume = newValue }
    }
}
// 是不同的实例，但状态只有一份
var a = Settings(); a.volume = 80
print(Settings().volume)  // 80
```

即使重新创建 `Settings()`，volume 也还是 80。实例可以有很多个，但状态只有一份——这就是 Monostate 的全部逻辑。

---

## 和单例到底有什么不一样？

最大的区别在于调用方的代码。

用单例的时候，调用方永远得意识到自己在用 `.shared`，心里得想着“啊这是单例”。而 Monostate 就跟普通对象一样，直接 `Settings()` 创建来用就行，调用方完全不需要知道内部是怎么实现的。

整理成表格大概是这样。

| 区分 | 单例 | Monostate |
|---|---|---|
| 实例数量 | 只能 1 个 | 可以有多个 |
| 共享的对象 | 实例本身 | 状态（static 数据）|
| 调用方式 | 显式使用 `.shared` | 像普通对象一样 |
| 继承 | 比较麻烦 | 相对自由 |

继承这一点尤其有意思。单例继承起来其实挺别扭的，而 Monostate 因为本质上就是普通类型，扩展起来更灵活一些。

---

## 那它到底能不能替代单例？

说实话，有时候行，有时候不行。

先说优点。调用方代码会变得干净，`.shared` 这种全局访问点也不会散落在代码各处。接口跟普通对象一模一样，以后要改结构的时候负担也比较小。

> Monostate 本质上是一种“把全局状态藏起来”的模式。看起来很方便，但被藏起来的全局状态本身就是一把双刃剑。

问题也出在这里。因为表面上就是个普通对象，团队里的人可能会想“这不就是个局部对象嘛”，结果一用才发现状态其实是全局共享的，反而更容易搞混。

而且因为本质上还是 static 共享，多线程环境下的并发问题一点也没少，这一点跟单例没什么区别。

以我的经验来说，现在写 Swift 的话，比起 Monostate，我更建议优先考虑依赖注入（Dependency Injection）。测试更方便，依赖关系也更清晰。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/2-1783803834678.png" alt="如果是现在的 Swift 项目，我会先想到 DI">
  <figcaption>如果是现在的 Swift 项目，我会先想到 DI</figcaption>
</figure>

---

## 那到底什么时候适合用？

总结一下，大概是这几种情况。

1. 项目里已经有大量单例代码，想一点点地逐步替换掉的时候
2. 想让调用方接口保持得跟普通对象一样干净的时候
3. 需要处理带继承或扩展需求的全局状态的时候

反过来，如果是从零开始搭一个新项目，我更想建议大家先看看依赖注入或者显式的状态管理方案，而不是直接上 Monostate。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/3.png" alt="我习惯把各种模式放进工具箱，遇到合适的场景再拿出来用">
  <figcaption>我习惯把各种模式放进工具箱，遇到合适的场景再拿出来用</figcaption>
</figure>

---

说到底，Monostate 并不是“单例的完美升级版”，而是“性格不同的另一个选项”。把它放进工具箱里，遇到合适的场景再拿出来用就好。

希望今天这篇内容，能给那些被满屏 `.shared` 折腾得有点累的朋友一点小提示。与其一股脑地全盘替换，不如先想想自己的项目到底适合什么——祝大家都能找到适合自己项目的方案！
