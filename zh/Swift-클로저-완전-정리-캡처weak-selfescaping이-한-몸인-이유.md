---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 闭包完全整理，捕获·[weak self]·@escaping为何是同一件事"
lang: zh
description: "在 Swift 代码中，闭包就像空气一样无处不在。排序条件、网络请求的完成回调、按钮动作，乃至 SwiftUI 的 body，传递大括号代码块的写法一天之内能出现几十次。可一旦被要求解释\"闭包捕获值到底是什么意思\"\"为什么要用 [weak self]\"\"@escaping 为什么要加\"，很多人却会一时语塞。"
header:
  og_image: /assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/1.png
tags:
  - Swift
  - 斯威夫特
  - 闭包
  - closure
  - 捕获列表
  - weakself
  - escaping
  - 循环引用
  - iOS开发
  - 编程学习
permalink: /zh/Swift-클로저-완전-정리-캡처weak-selfescaping이-한-몸인-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · [English](/en/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/Swift-%ED%81%B4%EB%A1%9C%EC%A0%80-%EC%99%84%EC%A0%84-%EC%A0%95%EB%A6%AC-%EC%BA%A1%EC%B2%98weak-selfescaping%EC%9D%B4-%ED%95%9C-%EB%AA%B8%EC%9D%B8-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

在 Swift 代码中，闭包就像空气一样无处不在。排序条件、网络请求的完成回调、按钮动作，乃至 SwiftUI 的 body，传递大括号代码块的写法一天之内能出现几十次。可一旦被要求解释"闭包捕获值到底是什么意思""为什么要用 [weak self]""@escaping 为什么要加"，很多人却会一时语塞。

这三个问题其实是同一件事。只要理解闭包捕获周围值的方式（捕获），它为什么是引用类型、为什么会产生循环引用、为什么需要 escaping 标记，都会随之迎刃而解。这是 Swift 基础系列的第二篇，本文按顺序梳理这条逻辑链。

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/1.png" alt="闭包的本质不是代码块，而是捕获外部变量的这个特性">
  <figcaption>闭包的本质不是代码块，而是捕获外部变量的这个特性</figcaption>
</figure>

## 什么是闭包——比名字更重要的是"捕获"这一特性

先把语法部分做最简单的梳理。闭包是把一段可执行代码当作值来处理的语法。它可以被赋给变量、作为参数传递、也可以被返回。

```swift
let add: (Int, Int) -> Int = { a, b in a + b }
add(2, 3) // 5
```

其实用 `func` 声明的函数也是有名字的闭包。在 Swift 里函数和闭包属于同一类东西，`{ }` 语法只是不带名字、临时创建的版本而已。

不过闭包（closure）这个名字并非来自"代码块"，而是来自另一个特性：它会把周围的变量包裹起来、封闭住（close over）。

```swift
func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counter = makeCounter()
counter() // 1
counter() // 2
counter() // 3
```

这里发生了一件奇怪的事。`count` 本是 makeCounter 的局部变量，函数返回后理应消失，可每次调用返回的闭包时它却在不断累加。这是因为闭包捕获了自己身体之外的变量 `count`，让它在函数结束之后依然存活。这正是闭包的本质，本文剩下的内容全都是这个"捕获"衍生出来的话题。

## 捕获的准确含义——不是复制，而是引用

Swift 闭包默认的捕获方式是引用。它不是把值复制一份带走，而是与那个变量本身保持连接。因此会出现下面这样的结果。

```swift
var multiplier = 2
let times = { (n: Int) in n * multiplier }

times(10)      // 20
multiplier = 3
times(10)      // 30 — 闭包看到的是变化后的值
```

这里用到的不是闭包创建时刻的 multiplier（2），而是执行时刻的 multiplier（3）。闭包携带的不是变量的快照，而是变量本身。

如果想固定创建时刻的值，可以使用捕获列表。

```swift
let times = { [multiplier] (n: Int) in n * multiplier }

times(10)      // 20
multiplier = 3
times(10)      // 20 — 固定为创建时刻的 2
```

写在方括号里的变量，会在闭包创建的那一刻被复制一份，作为常量封存在闭包内部。总结一下：默认是引用捕获（保持存活的连接），捕获列表是值捕获（创建时刻的快照）。在解释 [weak self] 之前，必须先立住这个区分。

而正因为要有这样一个捕获存储区，闭包才是引用类型。被捕获的变量需要和闭包共享生命周期，所以会被存储在堆上；复制一个闭包值，实际上是让指向同一份存储区的引用多了一份。这就是在以 struct 为中心的 Swift 里，闭包却表现得像 class 的原因。如果对值类型和引用类型的区分还不太熟悉，建议先读一读值类型优先主义那一篇。

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/2.png" alt="默认捕获是保持存活的连接，捕获列表是创建时刻的快照">
  <figcaption>默认捕获是保持存活的连接，捕获列表是创建时刻的快照</figcaption>
</figure>

## 循环引用与 [weak self]——捕获引发的典型事故

引用捕获的代价，正是循环引用。它的结构总是一样的。

```swift
class ProfileViewModel {
    var onUpdate: (() -> Void)?
    var name = ""

    func bind() {
        onUpdate = {
            print("姓名: \(self.name)")
        }
    }
}
```

ViewModel 通过 onUpdate 属性强引用持有闭包。而这个闭包又引用捕获了 self，也就是 ViewModel 本身。ViewModel → 闭包 → ViewModel，这条所有权的链条就闭合了，在 ARC 的世界里这两者会互相拽住对方，永远不会被释放。即便关闭了页面，ViewModel 依然留在内存里，一次内存泄漏就此形成。

解决办法就是捕获列表的第二种用法。`[weak self]` 是指示以弱引用的方式捕获 self。闭包虽然拽住了 self，却不持有它的所有权，链条因此被切断。不过这样一来 self 有可能先于闭包被释放，所以闭包内的 self 会变成可选类型，通常需要以 `guard let self else { return }` 开头。在可选类型那篇里出现过的提前退出模式，在这里又出现了一次。

```swift
onUpdate = { [weak self] in
    guard let self else { return }
    print("姓名: \(self.name)")
}
```

需要注意的是，[weak self] 并不是万能前缀。循环的成立条件是"self 拥有闭包，而这个闭包又捕获了 self"。如果不满足这个条件，也就不需要 weak。比如传给 `DispatchQueue.main.asyncAfter` 的闭包会在执行后被系统丢弃，self 只是多存活了一小段时间，并不会造成泄漏。与其反射性地到处加 weak，不如养成习惯去问"这个闭包到底被谁、持有多久"，这才是准确的做法。像 NSTimer 那种因所有权结构特殊而闻名的案例，我们在另一篇文章里专门讨论过。

## @escaping——当闭包比函数活得更久时

最后一块拼图。作为函数参数接收的闭包，有时会带上 @escaping。

```swift
func fetchUser(completion: @escaping (User) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, _ in
        let user = parse(data)
        completion(user)   // 在函数返回很久之后才会执行
    }.resume()
}
```

区分标准在于执行时机。在函数返回之前，内部就把闭包完整执行并丢弃的属于 non-escaping（默认情况）；而如果被存进属性，或者传给异步任务，可能在函数返回之后才执行，那就是 escaping，也就是"逃出"函数范围的闭包。

为什么一定要强制区分呢？因为是否逃逸，会改变编译器和开发者双方的计算方式。non-escaping 保证只在函数执行期间存活，所以编译器可以优化捕获的存储方式，也从根本上不用担心循环引用。传给 map 或 filter 的闭包里不必操心 self，原因就在这里。相反，escaping 意味着闭包会被存放在某处、活得更久，因此就成了需要按照上文方式检查循环引用的候选对象。@escaping 标记，其实就是 API 层面发出的一个警示标签："这个闭包会存活很久，请留意捕获问题"。

顺带一提，completion 处理器风格的 escaping 闭包，随着 async/await 的引入，在新代码里正呈减少趋势，但要阅读和桥接既有 API，依然需要准确理解这个概念。

<figure>
  <img src="/assets/images/posts/acbedb03-d119-4e28-b248-ff183d5af89c/3.png" alt="weak 切断了彼此拽住对方的链条">
  <figcaption>weak 切断了彼此拽住对方的链条</figcaption>
</figure>

## 落地到实战的三条标准

把理论压缩成实战标准，可以归纳为三条。

**第一，看到闭包先问它的生命周期。** 这个闭包是在函数内部被消费完就结束（non-escaping），还是会被存放在某处、活得更久（escaping）？光靠这一个问题，就能决定你需要在多大程度上关注捕获问题。

**第二，weak 不是反射动作，而是判断结果。** 在所有权链条真正闭合的地方（存成属性的处理器、类似代理的回调）加 [weak self]，在没有闭合链条的一次性执行里则不需要。判断拿不准时，用 Instruments 的 Leaks 或者 deinit 日志确认一下，是个好习惯。

**第三，用捕获列表把意图写进代码。** 想固定某个值就用 [value]，不想持有所有权就用 [weak self]。捕获列表首先是一份文档，用来在代码里明确"这个闭包与外部世界是如何连接的"，其次才是性能层面的手段。

## 总结

- 闭包的本质不是代码块，而是捕获，也就是把周围变量包裹封闭、从而延长其生命周期的特性。
- 默认捕获方式是引用而非复制，所以闭包看到的是执行时刻的值；而捕获列表 [x] 会把值固定在创建时刻。
- 由于需要共享捕获存储区，闭包属于引用类型。
- 当 self 拥有的闭包又捕获了 self 时，就会形成循环引用，[weak self] + guard let self 是标准解法。但如果不存在所有权链条，也就不需要 weak。
- @escaping 是"比函数活得更久的闭包"这一警示标签，用来标出需要检查捕获问题的地方。

下一篇将梳理存储属性与计算属性、lazy、属性观察器——藏在一行变量声明背后的各种选择。
