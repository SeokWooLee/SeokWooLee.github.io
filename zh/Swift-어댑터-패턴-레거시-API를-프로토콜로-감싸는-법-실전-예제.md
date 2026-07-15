---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 适配器模式实战：如何用协议封装遗留 API"
lang: zh
description: "遗留 API 代码，删不掉又不敢直接用，是不是常常让人头疼？"
header:
  og_image: /assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/1.png
tags:
  - Swift
  - 适配器模式
  - 设计模式
  - iOS开发
  - 遗留代码重构
  - 面向协议编程
  - Swift协议
  - iOS开发者
  - 代码重构
permalink: /zh/Swift-어댑터-패턴-레거시-API를-프로토콜로-감싸는-법-실전-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · [English](/en/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · [日本語](/ja/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · **中文**
{: .notice--info}

遗留 API 代码，删不掉又不敢直接用，是不是常常让人头疼？

把老旧的网络模块接入新页面时，几乎每个人都会撞上这堵墙。

先说结论：把遗留 API 用协议（interface）包一层，再在中间放一个适配器，是最干净的解决办法。

适配器模式，就是在两个互不兼容的接口之间插入一个「转换器」。

今天就按照实际踩过的流程，整理一下 Swift 里具体该怎么落地。

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/1.png" alt="Swift 适配器模式：在遗留代码和新代码之间放一个转换器">
  <figcaption>Swift 适配器模式：在遗留代码和新代码之间放一个转换器</figcaption>
</figure>

---

## 读完这篇你能带走的三件事

先给赶时间的读者划重点。

1. 先用协议定义新代码想要的形状
2. 再写一个适配器类型，把遗留 API 转换成这个协议的样子
3. 让页面和视图模型只依赖协议，而不是遗留代码

只要做到这三点，将来整体替换 API 时，需要改动的范围就会大幅缩小。

换成这套结构之后，写测试代码明显轻松了不少。

---

## 为什么 Swift 需要适配器模式？

遗留 API 的形状，通常都不是我们想要的样子。

要么是基于回调的，要么参数很乱，要么返回类型模糊不清。

> 如果新代码为了迁就老 API 而不断妥协，那么等这个老 API 有一天被淘汰，整段代码都会跟着摇摇欲坠。

所以要在中间放一个适配器。

举个例子，假设旧模块长这样。

```swift
// 不太敢动的遗留 API（基于回调）
class LegacyUserAPI {
    func fetch(id: Int,
               done: @escaping (NSDictionary?) -> Void) {
        // 老旧的网络请求……
    }
}
```

如果把 `NSDictionary` 原封不动地一路带到页面层，将来要换这个 API 时，页面代码也得跟着全部拆掉重写。

一看就是不想直接接入的形状。

---

## 用协议封装遗留 API 的三个步骤

实际封装的过程，比想象中要简单。

**第一步，用协议定义想要的形状。**

先把「新代码希望这样调用」的形态写出来。

```swift
// 新代码想要的干净接口
protocol UserRepository {
    func user(id: Int) async throws -> User
}
```

把回调换成了 `async/await`，把 `NSDictionary` 换成了 `User` 类型。

**第二步，让适配器把遗留代码接到这个协议上。**

把所有繁琐的转换都关在适配器里面。

```swift
// 把遗留代码转换成新协议的适配器
struct LegacyUserAdapter: UserRepository {
    let legacy = LegacyUserAPI()
    func user(id: Int) async throws -> User {
        try await withCheckedThrowingContinuation { cont in
            legacy.fetch(id: id) { dict in
                cont.resume(returning: User(dict))
            }
        }
    }
}
```

把回调转成 `async` 的 `withCheckedThrowingContinuation`，在这里发挥了关键作用。

**第三步，让页面只依赖协议。**

视图模型不需要知道 `LegacyUserAPI` 的存在，只需要认识 `UserRepository` 就够了。

这样一来，遗留代码就只会出现在适配器这一个地方。

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/4-1783847742177.png" alt="遗留代码藏在适配器背后，页面只看得到协议">
  <figcaption>遗留代码藏在适配器背后，页面只看得到协议</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/2.png" alt="页面代码只需要认识这个干净的协议就够了">
  <figcaption>页面代码只需要认识这个干净的协议就够了</figcaption>
</figure>

---

## 用了适配器之后会有什么不同？（对比直接调用）

把直接调用和适配器方式做了个对比表。

| 项目 | 直接调用遗留 API | 用适配器封装 |
| --- | --- | --- |
| 更换 API 时的改动范围 | 整个页面 | 只改适配器这一处 |
| 单元测试 | 困难 | 用 mock 轻松搞定 |
| 新代码可读性 | 低 | 高 |
| 初期工作量 | 少 | 略有增加 |

初期工作量确实会稍微增加一点，这是事实。

但这点成本完全不算什么。

测试时只要塞进去一个实现了 `UserRepository` 的假对象，不用连网络也能验证页面逻辑。

哪怕实际 API 还没做好，也可以先动手开发页面这一侧。

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/3.png" alt="记住这三格结构，事情就成了一半">
  <figcaption>记住这三格结构，事情就成了一半</figcaption>
</figure>

---

## 常见问题（Q&A）

**Q. 适配器应该用 struct 还是 class？**

如果没有状态，`struct` 就足够了。

如果需要一直持有遗留对象，或者需要共享引用，就用 `class`。

**Q. 适配器模式和外观（Facade）模式有什么区别？**

适配器的目的是「让接口对齐」。

外观的目的是把「多个复杂的东西简化成一个入口」，方向上略有不同。

**Q. 协议名该怎么起？**

不要照搬遗留代码的命名，而要站在新代码的角度，按它该承担的角色来命名。

比如不叫 `LegacyUserAPI`，而叫 `UserRepository`。

---

不必强行把遗留代码删掉，不妨先从用协议和适配器把它悄悄隔离开始。

只要把老代码关进一个地方，之后的重构就会轻松很多。不妨在你自己的项目里，先挑一个最乱的 API 试着封装一下。
