---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 单例模式，shared 为什么总被吐槽是反模式"
lang: zh
description: "做 Swift 开发的时候，经常会遇到用 static let shared 一行代码就搞定的单例。"
header:
  og_image: /assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png
tags:
  - Swift
  - 单例模式
  - iOS开发
  - 设计模式
  - 依赖注入
  - 反模式
  - shared
  - Swift单例
  - App开发
  - Swift开发者
permalink: /zh/Swift-싱글톤-패턴-shared가-안티패턴-소리-듣는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [English](/en/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

做 Swift 开发的时候，经常会遇到用 `static let shared` 一行代码就搞定的单例。

我自己刚开始做 iOS 应用的时候，网络管理器、用户会话、缓存管理全都用单例来写。

因为真的很方便，随便在哪里调用 `Manager.shared` 就行了。

但随着项目越做越大，一些奇怪的事情开始出现了。测试跑不起来，明明只是改了一个页面，结果 bug 却在完全不相关的地方冒出来。

那时候我才第一次意识到，“原来单例被说成反模式是有原因的”。

这篇文章想结合自己的实际经验，聊聊 Swift 单例模式到底是什么，为什么滥用会被当成反模式，以及什么情况下依然可以放心使用。

先说结论：单例本身并不是坏东西，问题出在“允许在任何地方随意修改状态”这种用法上。所以一旦不加节制地滥用 shared，就会导致测试受阻、依赖关系被隐藏，甚至引发并发问题。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="Swift 单例模式，一个 shared 用起来很方便，但陷阱也不小">
  <figcaption>Swift 单例模式，一个 shared 用起来很方便，但陷阱也不小</figcaption>
</figure>

## Swift 单例模式，到底是什么？

单例是一种设计模式，用来“保证整个应用中某个实例只存在一份”。

在 Swift 里，写起来特别简单，这既是它的魅力所在，也是陷阱所在。

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // 全局唯一
    private init() {}                     // 禁止外部创建
    func request(_ url: URL) { /* ... */ }
}
```

`static let` 会由 Swift 保证以线程安全的方式只初始化一次。因此不需要额外加锁，实例创建本身就是安全的。

用 `private init()` 阻止外部重新创建实例，这也是关键所在。如果去掉这一点，那就只是个全局对象，而不是真正的单例了。

看到这里，代码确实很简洁。但问题恰恰从“可以在任何地方调用它”开始。

---

## shared 实例为什么会被吐槽成反模式？

按我自己踩坑的顺序，说说最常被提到的三个原因。

第一，测试会变成一场灾难。

如果在代码里直接调用 `NetworkManager.shared`，测试的时候就没办法把它替换成假的（mock）对象。

结果请求真的会发到实际服务器上，或者测试之间共享了状态，光是执行顺序变一下，结果就会不一样。

第二，依赖关系会被隐藏起来。

如果某个函数内部偷偷用了 `UserSession.shared`，光看函数签名根本看不出这个函数到底依赖什么。

团队协作的时候，这一点真的很可怕。因为必须把代码全部打开才能看清依赖关系。

第三，全局可变状态带来的并发问题。

如果单例内部持有属性，而多个线程同时读写它，就会产生数据竞争（data race）。

实例创建是安全的，不代表实例内部状态的修改也是安全的。把这两者混为一谈，就会遇到崩溃。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="当年满屏 shared 的代码，现在回头看真是捏一把汗">
  <figcaption>当年满屏 shared 的代码，现在回头看真是捏一把汗</figcaption>
</figure>

总结一下：

> 单例真正被诟病的原因，不是“只存在一份”，而是“在任何地方都能拿出来用，在任何地方都能改”。

---

## 那单例是不是完全不能用？

不是的，我现在在某些场景下依然会用。

有些对象本来就天然只应该存在一份。比如 `UserDefaults.standard`、`FileManager.default`、`URLSession.shared`，Apple 自己在标准库里也在用单例。

可以按这个标准来判断：

- 状态几乎不变、以读取为主 → 单例没问题
- 整个应用中确实只能有一份 → 可以考虑单例
- 测试时需要有不同的行为 → 建议用依赖注入

核心原则是：“不要在代码内部直接调用 shared，而是从外部把它注入进来”。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/3-1783847709763.png" alt="shared 作为默认值，测试时注入假对象的结构">
  <figcaption>shared 作为默认值，测试时注入假对象的结构</figcaption>
</figure>

即便同样用单例，只要这样改一下，可测试性就会大幅提升。

```swift
protocol Networking { func request(_ url: URL) }
extension NetworkManager: Networking {}

final class FeedViewModel {
    private let network: Networking
    init(network: Networking = .shared) {  // 默认值用单例，测试时注入 mock
        self.network = network
    }
}
```

平时用默认值走单例，很方便；测试的时候可以传入假对象，很灵活。

这不是抛弃单例，只是改变了调用方式而已。

---

## 实战中我自己坚持的 3 条规则

最后分享一下我在实际工作中给自己定的标准。

1. 不创建会在多处被修改可变状态的单例。如果需要状态，就明确谁是所有者。
2. 不在函数内部直接调用 `shared`，而是通过构造函数或参数注入。
3. 存在并发访问的单例，要么做成 actor，要么用串行队列保护。

只要守住这三条，基本就不会再出现“项目被单例拖垮”的情况。

单例不是一个错误的工具，而是一个太容易上手、因此也太容易被滥用的工具。

在因为方便就到处撒 `shared` 之前，不妨先问自己一句：“这个以后能测试吗？”这一个问题，能救未来六个月后的自己。
