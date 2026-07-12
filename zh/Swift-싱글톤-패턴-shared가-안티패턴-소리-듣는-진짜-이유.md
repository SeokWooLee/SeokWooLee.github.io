---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift单例模式，shared被吐槽是反模式的真正原因"
lang: zh
description: "做Swift开发时，经常会遇到用一行static let shared写出来的单例。"
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
last_modified_at: 2026-07-13
---

🌐 [한국어](/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [English](/en/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/Swift-%EC%8B%B1%EA%B8%80%ED%86%A4-%ED%8C%A8%ED%84%B4-shared%EA%B0%80-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4-%EC%86%8C%EB%A6%AC-%EB%93%A3%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

做Swift开发时，经常会遇到用一行`static let shared`写出来的单例。

刚开始做iOS应用的时候，很容易把网络管理器、用户会话、缓存管理全都写成单例。

因为方便啊，在任何地方只要调用`Manager.shared`就行了。

但项目一大，奇怪的事情就开始出现了。测试跑不起来，明明只改了一个页面，bug却在莫名其妙的地方冒出来。

单例被吐槽是反模式，是有原因的。

这篇文章会从实战角度梳理一下：Swift单例模式到底是什么、为什么滥用会被当成反模式、以及即便如此什么时候还是可以用。

先说结论：单例本身并不是坏东西，问题出在"允许在全局任何地方随意修改状态"这种用法上。所以一旦不加节制地滥用shared，就会导致测试受阻、依赖关系被隐藏，甚至引发并发问题。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/1.png" alt="Swift单例模式，一个shared带来便利，也埋下了不小的陷阱">
  <figcaption>Swift单例模式，一个shared带来便利，也埋下了不小的陷阱</figcaption>
</figure>

## Swift单例模式，到底是什么？

单例是一种"保证整个应用中只存在一个实例"的设计模式。

在Swift里可以写得非常简短，这既是它的魅力，也是陷阱所在。

```swift
final class NetworkManager {
    static let shared = NetworkManager()  // 整个应用中只有一个
    private init() {}                     // 阻止外部创建实例
    func request(_ url: URL) { /* ... */ }
}
```

`static let`会由Swift保证以线程安全的方式只初始化一次。所以即使不加额外的锁，实例创建本身也是安全的。

用`private init()`阻止外部重新创建实例也是关键所在。如果少了这一步，那就只是个普通的全局对象，而不是真正的单例了。

看到这里似乎相当简洁。问题就出在——它可以在任何地方被调用。

---

## shared实例为什么会被吐槽是反模式？

按照最常被指出的三个原因，我按经验顺序展开说说。

第一，测试会变成地狱。

如果代码里直接调用`NetworkManager.shared`，写测试的时候就没办法把它替换成假的（mock）对象。

要么请求真的会打到实际服务器上，要么各个测试之间共享状态，仅仅是执行顺序不同，结果就会跟着变。

第二，依赖关系会被隐藏起来。

如果某个函数内部悄悄调用了`UserSession.shared`，光看函数签名根本不知道这个函数到底需要什么。

协作开发时这一点相当可怕，因为必须把代码全部打开才能看清依赖关系。

第三，全局可变状态带来的并发问题。

如果单例内部持有属性，而多个线程同时对其进行读写，就会产生数据竞争。

实例创建是安全的，不代表其内部状态的修改也是安全的。一旦把这两者混为一谈，就会遇到崩溃。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/2.png" alt="当年满屏都是shared的代码，现在回头看真是心惊肉跳">
  <figcaption>当年满屏都是shared的代码，现在回头看真是心惊肉跳</figcaption>
</figure>

总结一下。

> 单例被诟病的真正原因，不是"因为只存在一个"，而是"因为在任何地方都能拿出来用、在任何地方都能被修改"。

---

## 那单例是不是完全不能用？

不是的。我现在在某些情况下依然会用。

本来就有些对象天生只应该存在一个实例。比如`UserDefaults.standard`、`FileManager.default`、`URLSession.shared`，苹果自己在标准库里也在用单例。

可以按下面的标准来判断：

- 几乎不修改状态，以读取为主 → 用单例没问题
- 在整个应用中必须真正只有一个 → 可以考虑单例
- 测试时需要让它表现出不同的行为 → 推荐用依赖注入

核心就是："不要在代码内部直接调用shared，而是从外部注入进来"。

<figure>
  <img src="/assets/images/posts/b71a69ec-a38f-40af-8715-df457527f22f/3-1783847709763.png" alt="shared作为默认值，测试时注入假对象的结构">
  <figcaption>shared作为默认值，测试时注入假对象的结构</figcaption>
</figure>

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

平时用默认值调用单例，很方便；测试时可以塞入假对象，也很灵活。

这并不是抛弃单例，只是改变了调用它的方式而已。

---

## 实战中我遵循的3条规则

最后分享一下我在实际工作中给自己定下的标准。

1. 不创建在多个地方修改可变状态的单例。如果确实需要状态，就明确它的所有者。
2. 不在函数内部直接调用`shared`，而是通过构造函数或参数注入。
3. 存在并发访问的单例，要么做成actor，要么用串行队列保护起来。

只要守住这三条，"项目因为单例而逐渐腐坏"的情况基本就不会发生了。

单例不是一个错误的工具，而是一个因为太容易上手、所以太容易被滥用的工具。

在因为图方便就到处撒`shared`之前，不妨先问自己一句："这个以后能测试吗？"就这一句自问，能救未来六个月后的自己一命。
