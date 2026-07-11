---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift单例模式，shared被骂反模式的真正原因"
lang: zh
description: "写Swift的时候，用static let shared一行代码搞定的单例，真的会经常碰到。"
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
  - Swift开发
  - 移动应用开发
  - Swift开发者
permalink: /zh/Swift-싱글톤-패턴-shared가-안티패턴-소리-듣는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [English](/en/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

写Swift的时候，用`static let shared`一行代码搞定的单例，真的会经常碰到。

我自己刚开始做iOS应用的时候，网络管理器、用户会话、缓存管理全都用单例糊上去了。

因为方便啊，随便在哪里调用一句`Manager.shared`就行了。

但项目一大，怪事就开始出现了。测试跑不通。明明只改了一个页面，bug却在完全不相干的地方爆出来。

那时候我才第一次真切体会到，“原来单例被骂反模式是有原因的”。

这篇文章想结合自己的实际经验，聊聊Swift单例模式到底是什么、为什么滥用会被当成反模式、以及什么情况下还是可以用的。

先说结论：单例本身并不坏，问题出在“允许在任何地方随意修改状态”这种用法上。所以一旦不加节制地滥用shared，就会导致测试受阻、依赖关系被隐藏，甚至引发并发问题。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="Swift单例模式，一个shared用起来很方便，但陷阱也同样不小">
  <figcaption>Swift单例模式，一个shared用起来很方便，但陷阱也同样不小</figcaption>
</figure>

## Swift单例模式，到底是什么？

单例是一种“保证整个应用中某个实例只存在一份”的设计模式。

在Swift里可以写得非常简短，这既是它的魅力，也是陷阱所在。

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // 整个应用只有一个
    private init() {}                     // 禁止外部创建
    func request(_ url: URL) { /* ... */ }
}
```

`static let`会由Swift保证线程安全地只初始化一次。所以即使不加额外的锁，实例创建本身也是安全的。

用`private init()`挡住外部重新创建的路径，这也是关键所在。如果少了这一步，那就只是个全局对象，而不是真正的单例。

只看到这里的话，确实很干净利落。问题是从“可以在任何地方调用它”这一点开始的。

---

## 为什么shared实例会被骂成反模式？

按我实际踩坑的顺序，说说最常被提到的三个原因。

第一，测试会变成地狱。

如果在代码里直接调用`NetworkManager.shared`，写测试的时候就没办法把它换成假的（mock）对象。

请求会真的打到服务器上，或者测试之间共享状态，哪怕只是顺序变了，结果也会跟着变。

第二，依赖关系会被隐藏起来。

如果某个函数内部偷偷用了`UserSession.shared`，光看函数签名根本看不出这个函数到底需要什么。

协作开发的时候这一点真的很可怕，因为得把代码全部打开才能看清依赖关系。

第三，全局可变状态带来的并发问题。

单例内部持有属性，如果多个线程同时读写它，就会发生数据竞争（data race）。

实例创建是安全的，不代表内部状态的修改也是安全的。把这两者混为一谈，迟早会遇到崩溃。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="当年满屏shared的代码，现在回头看真是惊出一身冷汗">
  <figcaption>当年满屏shared的代码，现在回头看真是惊出一身冷汗</figcaption>
</figure>

总结一下。

> 单例被骂的真正原因不是“只存在一个”，而是“在任何地方都能取出来用，也能在任何地方改”。

---

## 那单例是不是绝对不能用？

不是的。我现在也还在特定场合使用它。

本来就该只存在一份的对象是存在的。比如`UserDefaults.standard`、`FileManager.default`、`URLSession.shared`，苹果自己在标准库里也在用单例。

可以按这样的标准来判断，会比较省心：

- 几乎不改状态、以读取为主 → 单例没问题
- 整个应用里必须真的只有一个 → 可以考虑单例
- 测试时需要有不同的行为 → 推荐用依赖注入

核心是：“不要在代码内部直接调用shared，而是从外部把它注入进去”。

即使用的还是同一个单例，只要这样改一下，可测试性就会大幅提升。

```swift
protocol Networking { func request(_ url: URL) }
extension NetworkManager: Networking {}

final class FeedViewModel {
    private let network: Networking
    init(network: Networking = .shared) {  // 默认值用单例，测试时注入mock
        self.network = network
    }
}
```

平时用默认值走单例，方便；测试的时候可以塞进假对象，灵活。

这不是抛弃单例，只是改变了调用它的方式而已。

---

## 我在实战中坚持的3条原则

最后分享一下我在实际工作中给自己定的标准。

1. 不做那种在多处被随意修改的可变状态单例。如果确实需要状态，就明确谁是它的所有者。
2. 不在函数内部直接调用`shared`，而是通过构造函数或参数注入。
3. 存在并发访问的单例，要么做成actor，要么用串行队列保护起来。

只要守住这三条，“项目因为单例而慢慢腐烂”的情况基本就不会发生了。

单例不是一个错误的工具，而是一个因为太简单而容易被滥用的工具。

在图方便到处撒`shared`之前，不妨先问自己一句：“这东西以后能测试吗？”这一个问题，能救六个月后的自己一命。
