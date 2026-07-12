---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 单例状态模式，能成为单例的替代方案吗（实战总结）"
lang: zh
description: "写给那些觉得单例这样用下去真的没问题吗的朋友们"
header:
  og_image: /assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png
tags:
  - Swift
  - 单例状态模式
  - 单例
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

写给那些觉得单例这样用下去真的没问题吗的朋友们

做 iOS 开发的人，应该没有谁没用过单例（Singleton）吧。我也一样。`SomeManager.shared` 这种代码，几乎每个项目里都能找到好几个。

可是不知从什么时候开始，这个 `.shared` 用着用着就觉得别扭了。测试的时候状态会乱成一团，团队成员也会到处随意访问它。

就在这个过程中，我认识了单例状态（Monostate）模式。今天想和大家聊聊 Swift 里的 Monostate 到底是什么，以及它是否真的能成为单例的替代方案，分享一下我自己实际使用的经验。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/1.png" alt="单例和 Monostate，看这张图就一目了然">
  <figcaption>单例和 Monostate，看这张图就一目了然</figcaption>
</figure>

先说结论：Monostate 是一种"状态共享为一份，但实例可以创建多个"的模式。它和单例的目的相同，但实现方式恰好相反。不过它并不是万能药，要不要用还得看具体场景。下面就一点点展开说说。

## Monostate 模式到底是什么？

单例的核心是"只创建一个实例"。把构造器锁起来，只让大家用同一个 `shared`。

Monostate 正好相反。实例可以随便创建，但内部的状态（数据）全部用 static 共享出去。

也就是说，不管你创建的是对象 A 还是对象 B，两者指向的数据其实是同一份。表面上看是个普通对象，内部却是连在一起的。

用 Swift 简单写一下大概是这样：

```swift
struct Settings {
    private static var _volume = 50   // 状态通过 static 共享
    var volume: Int {                 // 用起来像普通实例
        get { Settings._volume }
        set { Settings._volume = newValue }
    }
}
// 虽是不同实例，但状态只有一份
var a = Settings(); a.volume = 80
print(Settings().volume)  // 80
```

即使重新创建 `Settings()`，volume 依然是 80。实例可以有很多个，但状态只有一份，这就是 Monostate 的全部要点。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/4-1783848112872.png" alt="实例有三个，但指向的状态只有一份">
  <figcaption>实例有三个，但指向的状态只有一份</figcaption>
</figure>

---

## 和单例有什么不同？

最大的差异体现在使用方的代码上。

用单例时，使用方必须时刻意识到 `.shared` 的存在，心里默念"啊，这是单例"。而 Monostate 就像普通对象一样，直接 `Settings()` 创建来用就行，使用方甚至不需要知道内部是怎么实现的。

用表格整理一下：

| 分类 | 单例 | Monostate |
|---|---|---|
| 实例数量 | 只有 1 个 | 可以有多个 |
| 共享的对象 | 实例本身 | 状态（static 数据）|
| 使用方式 | 显式使用 `.shared` | 像普通对象一样使用 |
| 继承 | 比较麻烦 | 相对自由 |

继承这一点尤其有意思。单例的继承处理起来相当别扭，而 Monostate 本质上是普通类型，扩展起来会更灵活一些。

---

## 那它真的能替代单例吗？

老实说，有时候可以，有时候不行。

先说优点。使用方的代码会更简洁，`.shared` 这种全局访问点也不会散落在代码各处。接口和普通对象完全一样，以后想改结构时负担也更小。

> Monostate 是一种"把全局状态藏起来"的模式。看着方便，但被藏起来的全局状态本身就是一把双刃剑。

问题也出在这里。表面上看是个普通对象，团队成员可能会想"这不就是个局部对象嘛"就直接创建了，结果发现状态其实是全局共享的，反而更容易让人困惑。

而且它依然是靠 static 共享，多线程环境下的并发问题一点都不比单例少，这方面和单例没什么本质区别。

以我个人的经验来说，如果是现在的 Swift 项目，我更推荐优先考虑依赖注入（Dependency Injection），而不是 Monostate。测试更方便，依赖关系也更清晰。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/2-1783803834678.png" alt="如果是现在的 Swift 项目，我会先想到 DI">
  <figcaption>如果是现在的 Swift 项目，我会先想到 DI</figcaption>
</figure>

---

## 那到底什么时候用比较好？

总结一下，适合用的场景大概是这些：

1. 现有的单例代码太多，想要逐步替换掉的时候
2. 想让使用方的接口保持像普通对象一样简洁的时候
3. 需要处理带继承或扩展需求的全局状态时

反过来，如果是从零开始的新项目，我会更建议先考虑依赖注入或明确的状态管理方式，而不是 Monostate。

<figure>
  <img src="/assets/images/posts/0c7f9b56-a736-429b-b2a1-6f16a399a36b/3.png" alt="我把各种模式放进工具箱，等场景合适再拿出来用">
  <figcaption>我把各种模式放进工具箱，等场景合适再拿出来用</figcaption>
</figure>

---

说到底，Monostate 并不是"单例的完美升级版"，而是"性质不同的另一个选项"。把它放进工具箱里，等场景合适的时候再拿出来用就好。

希望今天的内容能给被 `.shared` 滥用弄得有点疲惫的朋友们一点小启发。与其盲目跟风换用某种模式，不如认真想一想什么才真正适合自己的项目，加油！
