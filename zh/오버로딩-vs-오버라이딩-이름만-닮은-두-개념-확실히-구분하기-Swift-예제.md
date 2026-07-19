---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "重载 vs 重写，彻底分清这两个“名字很像”的概念（Swift 示例）"
lang: zh
description: "重载（Overloading）和重写（Overriding）。这两个概念的名字像到让人怀疑是不是故意的。"
header:
  og_image: /assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/1.png
tags:
  - 重载
  - 重写
  - 多态
  - 继承
  - Swift
  - 动态分发
  - 静态分发
  - OOP
  - 技术面试
  - CS基础
permalink: /zh/오버로딩-vs-오버라이딩-이름만-닮은-두-개념-확실히-구분하기-Swift-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-19
---

🌐 [한국어](/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/) · [English](/en/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/) · [日本語](/ja/%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-vs-%EC%98%A4%EB%B2%84%EB%9D%BC%EC%9D%B4%EB%94%A9-%EC%9D%B4%EB%A6%84%EB%A7%8C-%EB%8B%AE%EC%9D%80-%EB%91%90-%EA%B0%9C%EB%85%90-%ED%99%95%EC%8B%A4%ED%9E%88-%EA%B5%AC%EB%B6%84%ED%95%98%EA%B8%B0-Swift-%EC%98%88%EC%A0%9C/) · **中文**
{: .notice--info}

重载（Overloading）和重写（Overriding）。这两个概念的名字像到让人怀疑是不是故意的。

它们是考试和面试的常客，容易混淆很大程度上是名字惹的祸。实际的运作原理完全不同：一个是“用同一个名字定义多个函数”，另一个是“重新定义继承来的函数”。

两者被“决定”的时机也不同：一个在编译期，一个在运行期。这个差异还会延伸到静态分发、动态分发这类性能话题上。

这篇文章就用 Swift 示例，把两者彻底分清楚。

<figure>
  <img src="/assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/1.png" alt="Overload 是一个名字对应多个函数，Override 是覆盖父类的定义">
  <figcaption>Overload 是一个名字对应多个函数，Override 是覆盖父类的定义</figcaption>
</figure>

先看核心摘要。

1. 重载（Overloading）：用同一个名字、不同参数定义多个函数，与继承无关
2. 重写（Overriding）：子类重新定义父类的方法，以继承为前提
3. 重载在编译期决定调用哪个函数，重写在运行期决定
4. 重写正是多态的核心机制

---

## 重载：同一个名字，多个版本

重载是指定义多个名字相同、但参数构成（个数、类型、标签）不同的函数。

```swift
func area(radius: Double) -> Double { .pi * radius * radius }
func area(width: Double, height: Double) -> Double { width * height }
func area(side: Double) -> Double { side * side }
```

编译器会根据调用处传入的参数来判断具体调用哪个函数。一旦写下 area(radius: 3)，就已经确定调用第一个函数了——在程序真正执行之前，这件事就已经定好了。

回想一下没有这个特性的 C 语言，就能体会到重载的好处。求绝对值的函数按类型分别叫 abs、labs、fabs，名字五花八门。重载则让“概念相同、名字也保持一致”成为可能。

Swift 标准库里到处都在用重载，比如 print(_:)、min(_:_:) 等。通过运算符重载，一个 + 号就能同时处理整数相加、字符串拼接、数组合并等多种情况。

有一点需要注意：最好避免“仅返回类型不同”的重载。Swift 在语法上有时允许这么做，但如果调用处没有明确指定类型，就会出现二义性错误，读代码的人也会感到困惑。

---

## 重写：重新定义继承来的东西

重写是指子类以相同的方法签名，重新定义从父类继承来的方法。它以继承关系为前提。

```swift
class Animal {
    func speak() { print("...") }
}
class Dog: Animal {
    override func speak() { print("멍멍") }
}
class Cat: Animal {
    override func speak() { print("야옹") }
}
```

关键就在下面这个场景。

```swift
let animals: [Animal] = [Dog(), Cat()]
for animal in animals {
    animal.speak() // 멍멍, 야옹
}
```

变量的类型是 Animal，但实际执行的却是各个实例自己的方法。“到底调用哪个 speak”，是在运行期根据实际对象来决定的。这就是动态分发，也是多态得以运作的机制。

值得一提的是，Swift 强制要求使用 override 关键字。这能让编译器帮忙拦截“不小心写出与父类相同签名”或“因笔误导致重写失败”之类的事故。反过来，如果在父类一方加上 final，则可以禁止子类重写。

<figure>
  <img src="/assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/2.png" alt="即便变量类型是 Animal，实际执行的仍是各实例自己的方法">
  <figcaption>即便变量类型是 Animal，实际执行的仍是各实例自己的方法</figcaption>
</figure>

---

## 用表格一次性对比

| 区分 | 重载 | 重写 |
|---|---|---|
| 定义 | 同名，参数不同 | 重新定义相同签名 |
| 继承 | 不需要 | 必须 |
| 决定时机 | 编译期（静态） | 运行期（动态） |
| 目的 | 命名一致性、API 便利性 | 多态、行为替换 |
| Swift 关键字 | 无 | override（必须），可用 final 禁止 |

决定时机的差异也和性能相关。在编译期就已确定的调用（静态分发）可以直接跳转执行，而运行期才决定的调用（动态分发）则需要经过实际类型的方法表。在 Swift 中加上 final、private 之后，编译器就有机会把动态分发转换为静态分发进行优化。

<figure>
  <img src="/assets/images/posts/f43ad7f1-a220-4a59-80c0-43700ea3bb2b/3.png" alt="重载在编译期决定，重写在运行期决定">
  <figcaption>重载在编译期决定，重写在运行期决定</figcaption>
</figure>

---

## 不会混淆的记忆法

按英文单词本身的意思记就行。

**Overload = 超载**。在同一个名字上“装载”多个函数，一个名字承载多种功能。

**Override = 无视并踩过去**。把父类的定义“覆盖”掉，定义只有一个，但内容被替换。

面试时可以这样开头回答。

> “重载是指定义多个同名但参数不同的函数，在编译期就已确定；重写是指重新定义继承来的方法，在运行期根据实际类型来决定。而多态正是由重写实现的。”

---

## 总结

- 重载：定义多个同名、参数构成不同的函数，无需继承
- 重写：子类以相同签名重新定义父类方法，必须有继承关系
- 重载在编译期（静态）决定调用对象，重写在运行期（动态）决定
- 多态的核心机制是重写与动态分发
- Swift 通过强制使用 override 关键字来防止失误，也可以用 final 禁止重写
- 记忆法：Overload 是名字上的超载，Override 是覆盖定义
