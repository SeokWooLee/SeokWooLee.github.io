---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "用Swift构建器模式摆脱8个参数初始化地狱（实战示例）"
lang: zh
description: "用Swift开发App时，初始化代码不知不觉就会变成这样。"
header:
  og_image: /assets/images/posts/7d525bb6-3e20-432c-9a7f-7236a98d4ff3/1.png
tags:
  - Swift
  - 构建器模式
  - 设计模式
  - iOS开发
  - Swift语言
  - 初始化
  - 重构
  - 编程学习
  - App开发
permalink: /zh/Swift-빌더-패턴으로-매개변수-8개-초기화-지옥-탈출하기-실전-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-18
---

🌐 [한국어](/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · [English](/en/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · [日本語](/ja/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · **中文**
{: .notice--info}

用Swift开发App时，初始化代码不知不觉就会变成这样。

`User(name:age:email:phone:address:isVerified:profileURL:createdAt:)`

括号里塞了八个参数。

看调用方的代码时，得一个一个数才能分清哪个是email、哪个是phone。

这种情况在个人项目里也很常见，用Swift构建器模式整理一下就能清爽很多。

先说结论：参数一多的初始化，改成构建器模式让每个值"一行设置一个"，可读性会大幅提升。既不用死记参数顺序，也不用给用不到的值硬塞nil。

<figure>
  <img src="/assets/images/posts/7d525bb6-3e20-432c-9a7f-7236a98d4ff3/1.png" alt="用Swift构建器模式前后，初始化代码差别就是这么大">
  <figcaption>用Swift构建器模式前后，初始化代码差别就是这么大</figcaption>
</figure>

先把这篇文章能带给你的内容整理一下。

1. 为什么8个参数的init容易出错
2. 构建器模式是如何解决这个问题的
3. Swift中实际使用的代码形态
4. 这个模式什么时候该用、什么时候该避免

---

## 8个参数的init，为什么是地狱？

参数只有三四个的时候，其实没什么大问题。

问题是从参数数量增多开始的。

第一，容易出现顺序错误。就算把phone填到email的位置，只要两者都是String类型，编译器也不会帮你拦下来。

第二，可选值的处理会变得凌乱。现在用不到的值也得填成`nil, nil, nil`。

第三，调用处的代码会变长，一眼很难看出到底在创建什么对象。

> 参数越多，init就越像一张"要填满的空白试卷"，空格越多，出错的概率也就越大。

把phone和profileURL的位置填反的bug，有时能耗掉一天多的时间。类型相同的话，这种失误真的很难被发现。

---

## 构建器模式是什么？

构建器模式不是一次性创建复杂对象，而是先把值一个一个填进去，最后再完成组装的方式。

可以理解为：不是在初始化的时候一次性传入所有值，而是只设置需要的值，再通过`build()`之类的方法拿到最终对象的结构。

想想在餐厅点餐的场景就容易理解了。不是把所有配料一口气喊出来，而是"面包要全麦的、芝士加量、酱料不要"这样按项目逐一说明。

只要设置核心值的方法返回自身，就能像连点一样链式调用。下面是最简单形式的构建器示例。

```swift
final class UserBuilder {
    private var name = ""
    private var email: String?
    // 设置值并返回self，以支持链式调用
    func setName(_ v: String) -> Self { name = v; return self }
    func setEmail(_ v: String) -> Self { email = v; return self }
    func build() -> User { User(name: name, email: email) }
}
```

因为设置方法返回的是`Self`，所以可以像`.setName(...).setEmail(...)`这样连着写。

<figure>
  <img src="/assets/images/posts/7d525bb6-3e20-432c-9a7f-7236a98d4ff3/4-1783847733231.png" alt="链式调用实际上就是这样一步步走下来的">
  <figcaption>链式调用实际上就是这样一步步走下来的</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7d525bb6-3e20-432c-9a7f-7236a98d4ff3/2.png" alt="接上一个构建器，喝杯咖啡整理一下，心里踏实多了">
  <figcaption>接上一个构建器，喝杯咖啡整理一下，心里踏实多了</figcaption>
</figure>

---

## 在Swift中怎么使用构建器模式？

最关心的应该是实际调用处会有什么变化吧。

用前面写好的构建器，创建对象的代码会变成这样。

```swift
// 只设置需要的值，靠方法名当"标签"，不用担心顺序
let user = UserBuilder()
    .setName("李锡宇")
    .setEmail("hello@example.com")
    .build()
// 不需要给用不到的值填nil
```

可以看到完全不用操心顺序问题。方法名本身就相当于标签，从结构上就杜绝了把phone填到email位置这种失误。

用不到的值不调用对应方法就行。

在Swift里，除了用类（class）来写构建器，也常见用结构体（struct）来实现，或者传入闭包在一个代码块里完成设置。可以根据项目风格自行选择。

<figure>
  <img src="/assets/images/posts/7d525bb6-3e20-432c-9a7f-7236a98d4ff3/3.png" alt="用带&quot;标签&quot;的方法连着写，就再也不用担心顺序了">
  <figcaption>用带&quot;标签&quot;的方法连着写，就再也不用担心顺序了</figcaption>
</figure>

---

## 构建器模式，什么时候用、什么时候该避免

觉得好用就到处套用，反而只会让代码变得臃肿。

下面把我的判断标准整理成了表格（基于2026年我个人项目的经验）。

| 情况 | 建议 |
|---|---|
| 参数5个以上，可选值较多 | 构建器模式 |
| 有多个类型相同的参数 | 构建器模式 |
| 参数2~3个，全部必填 | 普通init |
| 值简单且固定 | 普通init |

总结一下，如果参数少且全部必填，就没必要专门造一个构建器。

反过来，如果是必填值和可选值混杂的大型对象，构建器明显会更省心。

**Q. 造一个构建器不是反而让代码变多了吗？**

没错。构建器类本身确实会增加代码量。但如果创建该对象的调用处有很多地方，调用处变得整洁带来的好处会更大。

**Q. Swift不是有默认值参数吗？用那个不行吗？**

参数只有三四个的话，默认值（default parameter）就足够了。参数多、组合多样时，构建器的优势才会真正体现出来。

---

如果一直因为8个参数的init而感到压力，不妨就在那个点上试着引入一次构建器模式。不需要全部推倒重来，从最复杂的那个对象开始，负担会小很多。祝今天也编码愉快！
