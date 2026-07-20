---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 装饰器模式：无需继承即可层层叠加功能（示例与实战全解析）"
lang: zh
description: "做 iOS 开发时经常会遇到这种情况：基础功能不想动，只想加一个日志功能，或者只想加一个缓存功能，可一旦为此开始继承类，继承树很快就会变得一团糟。"
header:
  og_image: /assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/1.png
tags:
  - Swift
  - 装饰器模式
  - 设计模式
  - iOS开发
  - Swift教程
  - 面向对象
  - 协议式编程
  - 编程学习
  - SwiftUI
  - 开发博客
permalink: /zh/Swift-데코레이터-패턴-상속-없이-기능-겹겹이-입히는-법-예제실전-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

做 iOS 开发时经常会遇到这种情况：基础功能不想动，只想加一个日志功能，或者只想加一个缓存功能，可一旦为此开始继承类，继承树很快就会变得一团糟。

给网络客户端一个个添加功能的话，很容易就会做出类似 `CachingLoggingRetryingClient` 这种名字的类。

今天就来梳理一下解决这个问题的 **Swift 装饰器模式**。这是一种不依赖继承、像洋葱一样一层层叠加功能的方法。

> 装饰器模式是用遵循同一协议的对象把原始对象包裹起来，在不改动原有代码的前提下，一层层地叠加新功能。

先说结论：

1. 先把共同行为定义成一个**协议**
2. 装饰器遵循这个协议，同时**内部持有**一个同类型的协议实例
3. 完成自己的工作（日志、缓存等），其余部分**委托**给内部持有的对象
4. 需要多少层就包多少层，功能随之叠加

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/1.png" alt="Swift 装饰器模式，就是这样一层一层包起来的">
  <figcaption>Swift 装饰器模式，就是这样一层一层包起来的</figcaption>
</figure>

---

## 装饰器模式是什么？和继承有什么区别

继承表达的是“是……的一种”。子类会继承父类的一切。

问题出在组合上。如果要用继承来实现带日志的客户端、带缓存的客户端，以及两者都有的客户端，每一种组合都得单独建一个类。

装饰器表达的则是“包裹了……的东西”。

包裹者和被包裹者**共享同一个接口**，所以从外部看根本分不出二者的区别。因此无论包裹了多少层,调用方的代码都保持不变。

简而言之，继承的关系在编译期就固定了，而装饰器可以在运行期自由组装。

---

## Swift 装饰器模式的代码实现

以一个负责加载数据的 `DataLoader` 为例。首先定义大家都要遵循的协议。

```swift
protocol DataLoader {
    func load(id: String) -> Data?
}

// 实际执行加载工作的基础实现
struct NetworkLoader: DataLoader {
    func load(id: String) -> Data? {
        print("从网络请求 \(id)")
        return Data("payload-\(id)".utf8)
    }
}
```

到这里为止，还只是一个普通的协议和实现。

重点来了。装饰器遵循 `DataLoader`，同时内部还持有另一个 `DataLoader`。

```swift
// 负责记录日志的装饰器
struct LoggingLoader: DataLoader {
    let wrapped: DataLoader   // 被包裹的对象

    func load(id: String) -> Data? {
        print("[日志] load 开始: \(id)")
        let result = wrapped.load(id: id)  // 真正的工作委托出去
        print("[日志] load 完成: \(id)")
        return result
    }
}
```

`LoggingLoader` 只做自己的事（打印日志），真正的加载工作交给 `wrapped` 去做。

有了这个结构，就不用再关心里面包的到底是什么，只要它是 `DataLoader` 就行。

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/2-1783772343669.png" alt="只做自己的事，其余全部委托给内部对象的结构" loading="lazy">
  <figcaption>只做自己的事，其余全部委托给内部对象的结构</figcaption>
</figure>

---

## 层层叠加功能

这次再做一个缓存装饰器，实际叠加看看效果。

```swift
final class CachingLoader: DataLoader {
    let wrapped: DataLoader
    private var cache: [String: Data] = [:]

    init(wrapping loader: DataLoader) { self.wrapped = loader }

    func load(id: String) -> Data? {
        if let hit = cache[id] { return hit }        // 缓存命中直接返回
        let data = wrapped.load(id: id)              // 未命中则委托出去
        cache[id] = data
        return data
    }
}
```

接下来的组装部分，正是装饰器模式的精髓所在。

```swift
let loader = LoggingLoader(
    wrapped: CachingLoader(wrapping: NetworkLoader())
)
```

从内往外读就行：先用缓存包裹网络加载器，再用日志包裹缓存加载器。

调用发生时，流程是日志 → 检查缓存 → （未命中时）访问网络。

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/4-1783847764924.png" alt="包了多少层，调用就要往下传递多少层" loading="lazy">
  <figcaption>包了多少层，调用就要往下传递多少层</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/3.png" alt="从内到外依次是网络、缓存、日志的叠加效果" loading="lazy">
  <figcaption>从内到外依次是网络、缓存、日志的叠加效果</figcaption>
</figure>

如果想调整顺序，只需要改变包裹的先后顺序即可。`NetworkLoader` 和 `CachingLoader` 的代码一行都不用改。

不需要某个功能的话，直接去掉那一层就行了。

---

## 继承和装饰器，该在什么时候用哪个

二者并非非此即彼，下面按情况做了归纳。

| 场景 | 推荐 |
|---|---|
| 明确的“是……的一种”关系 | 继承 |
| 需要自由组合、拆卸功能 | 装饰器 |
| 运行时动态开关某项功能 | 装饰器 |
| 无法改动原始代码时 | 装饰器 |
| 组合数量较多时 | 装饰器 |

尤其是日志、缓存、重试、添加认证头这类**并非核心业务本身的附加功能**,装饰器模式非常适合。

反过来说，如果强行使用装饰器，包裹的层数一多，调试时调用栈也会变深，这是它的缺点，使用时需要有所权衡。

---

## 两个常见问题

**Q. 应该用 struct 还是 class？**

如果装饰器需要自己持有状态（比如缓存这种存储空间），用 class 会更方便。如果只是单纯的委托，struct 就足够了。上面的例子里之所以只把缓存部分设为 class，原因就在这里。

**Q. 包裹的层数变多会不会影响性能？**

由于调用要一层层往下传递，确实会带来极其微小的开销。不过相比网络或磁盘 I/O，这点开销可以忽略不计，绝大多数应用都不需要为此担心。

---

装饰器模式说到底，就是先定义一个协议，再做一个“内部持有同一协议对象”的对象，把工作委托出去，仅此而已。

下次想加一个功能又要去翻继承树的时候，不妨想想用一层包裹的方式来解决。代码会轻盈很多。建议把今天的示例原样搬到 Playground 里试试看 🙂
