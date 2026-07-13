---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C id 类型全面精讲(动态类型·鸭子类型详解)"
lang: zh
description: "刚开始学习 Objective-C 时,难免会在 id 这个类型面前停顿一下。"
header:
  og_image: /assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/1.png
tags:
  - Objective-C
  - id类型
  - 动态类型
  - 鸭子类型
  - iOS开发
  - Cocoa框架
  - 运行时
  - 编程学习
  - objc
permalink: /zh/Objective-C-id-타입-완전정복-동적-타이핑덕-타이핑-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [日本語](/ja/Objective-C-id-%ED%83%80%EC%9E%85-%EC%99%84%EC%A0%84%EC%A0%95%EB%B3%B5-%EB%8F%99%EC%A0%81-%ED%83%80%EC%9D%B4%ED%95%91%EB%8D%95-%ED%83%80%EC%9D%B4%ED%95%91-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **中文**
{: .notice--info}

刚开始学习 Objective-C 时,难免会在 `id` 这个类型面前停顿一下。

"这到底是什么类型?为什么随便塞进什么对象都能编译通过?"心里总会冒出这样的疑问。

先说结论:`id` 是一种"可以指向任何对象的万能指针",而这正是 Objective-C 动态类型和鸭子类型的核心支撑。

这篇文章会把 `id` 类型究竟是什么、动态类型和鸭子类型在实际代码中如何运作,以及它该在什么时候使用、什么时候要多加小心,逐一梳理清楚。

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/1.png" alt="一个 id 类型,动态类型和鸭子类型都由此起步">
  <figcaption>一个 id 类型,动态类型和鸭子类型都由此起步</figcaption>
</figure>

## id 类型到底是什么?

简单说,`id` 就是"指向任意 Objective-C 对象的指针"。

不需要像 `NSString *`、`NSArray *` 那样指定具体的类,它可以容纳任何对象。

其实 `id` 的本质比想象中简单得多,内部大致是这样定义的。

```objc
// objc.h 内部定义(摘要)
typedef struct objc_object {
    Class isa;  // 指向该对象所属类的指针
} *id;
```

也就是说,`id` 是一个只含有 `isa` 这一个指针的结构体的指针。

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/4-1783847906422.png" alt="id 的真面目,原来只是一个装着 isa 的指针">
  <figcaption>id 的真面目,原来只是一个装着 isa 的指针</figcaption>
</figure>

这个 `isa` 就像一个铭牌,在运行时告诉系统"我是哪个类的实例"。

这里有个有趣的细节:`id` 本身已经是指针了,所以写作 `id obj`,而不是像 `id *obj` 那样加星号。

和 `NSString *str` 相比,这一点很容易让人混淆。

---

## 动态类型是这样运作的

动态类型(dynamic typing)指的是"对象的实际类型不是在编译时确定,而是在运行时判断"这一概念。

`id` 中装的对象究竟是什么类,是在程序运行的那一刻,通过查看 `isa` 指针来决定的。

所以下面这样的代码是可以成立的。

```objc
id obj = @"Hello";           // 此刻是 NSString
NSLog(@"%@", [obj class]);   // 输出:__NSCFConstantString
obj = @[@1, @2, @3];         // 现在变成了 NSArray
NSLog(@"%@", [obj class]);   // 输出:__NSArrayI
```

同一个变量 `obj` 先是字符串,后来又变成了数组。

编译器并不会阻止这一点,因为实际类型的判断被推迟到了运行时。

发送消息时也是同样的道理。调用 `[obj length]` 时,编译阶段其实无法确定 `obj` 是否能响应 `length`。

运行时会在那一刻查找 `obj` 所属的类,找到对应的方法并执行,这个过程叫做消息分发(message dispatch)。

两者对比如下。

- 静态类型:编译器提前确定类型并进行检查
- 动态类型:运行过程中根据实际对象来判断

> 在 Objective-C 中,`id` 与动态类型正是"先放进去,真正是什么等运行的时候再问"这一理念的产物。

---

## 鸭子类型的真正含义是什么?

这里有很多人容易产生误解。有人会把鸭子类型(duck typing)简单粗暴地理解成"不做类型检查"。

鸭子类型原本的说法是这样的:

"如果它走起来像鸭子,叫起来也像鸭子,那它就是鸭子。"

意思是,对象属于哪个类并不重要,重要的是"它能不能响应那个消息"。

在 Objective-C 中,可以直接用 `respondsToSelector:` 来确认这一点。

```objc
// 无论是什么类,只要能响应这个方法就调用
if ([obj respondsToSelector:@selector(quack)]) {
    [obj quack];  // 能像鸭子一样叫,就当作鸭子处理
}
```

这里 `obj` 到底是 `Duck` 类还是 `Robot` 类,完全无关紧要。

只要能响应 `quack` 这个消息,在我们的代码看来它就是"鸭子"。

这和基于继承的多态是不同的思路。

即使不是继承自同一个父类,甚至彼此毫无关联的类,只要拥有相同名字的方法,就能被同等对待。

正是这种灵活性,构成了委托模式(delegate)、目标-动作(target-action)等 Cocoa 核心设计理念的基础。

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/2.png" alt="只要能响应方法就当作鸭子,这个想法挺有意思的">
  <figcaption>只要能响应方法就当作鸭子,这个想法挺有意思的</figcaption>
</figure>

---

## 方便的同时也危险的 id,什么时候要小心?

`id` 越自由,代价也就越大。

由于编译器几乎不做类型检查,一旦发送了无法响应的消息,编译依然能通过,但程序在运行时就会崩溃。

这正是那个著名的 `unrecognized selector sent to instance` 崩溃错误。

所以在实际开发中,通常会这样处理:

- 如果类型已经明确,就用具体的类(如 `NSString *`)代替 `id`
- 如果必须使用 `id`,调用前先用 `respondsToSelector:` 做防御性检查
- 通过定义委托协议(delegate protocol),把"会响应这个消息"这件事文档化

如今随着 `instancetype` 和泛型(`NSArray<NSString *> *`)的引入,滥用 `id` 的情况已经大大减少。

不过在框架底层、涉及运行时(runtime)操作的代码中,`id` 依然像心脏一样在跳动着。

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/3.png" alt="这条红色报错,是用错 id 时最常见的面孔">
  <figcaption>这条红色报错,是用错 id 时最常见的面孔</figcaption>
</figure>

---

总结一下,`id` 是象征 Objective-C 动态特性的类型,而动态类型和鸭子类型都指向同一个理念:"判断一个对象靠的不是它属于哪个类,而是它的行为"。

刚开始接触时会觉得陌生甚至危险,但一旦理解了这个原理,Cocoa 框架的设计思路就会清晰很多。

希望今天这篇文章能让曾经在 `id` 面前感到困惑的你,多一分从容。祝学习 Objective-C 愉快!
