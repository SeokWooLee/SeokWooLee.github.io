---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "最小惊讶原则:为什么getUser不应该发邮件"
lang: zh
description: "在做代码审查时,我曾遇到过这样一个函数。"
header:
  og_image: /assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/1.png
tags:
  - 最小惊讶原则
  - POLA
  - 命名规范
  - 副作用
  - 代码审查
  - API设计
  - 整洁代码
  - 开发原则
  - 代码可读性
  - 编程
permalink: /zh/최소-놀람의-원칙-getUser가-메일을-보내면-안-되는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/%EC%B5%9C%EC%86%8C-%EB%86%80%EB%9E%8C%EC%9D%98-%EC%9B%90%EC%B9%99-getUser%EA%B0%80-%EB%A9%94%EC%9D%BC%EC%9D%84-%EB%B3%B4%EB%82%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [English](/en/%EC%B5%9C%EC%86%8C-%EB%86%80%EB%9E%8C%EC%9D%98-%EC%9B%90%EC%B9%99-getUser%EA%B0%80-%EB%A9%94%EC%9D%BC%EC%9D%84-%EB%B3%B4%EB%82%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/%EC%B5%9C%EC%86%8C-%EB%86%80%EB%9E%8C%EC%9D%98-%EC%9B%90%EC%B9%99-getUser%EA%B0%80-%EB%A9%94%EC%9D%BC%EC%9D%84-%EB%B3%B4%EB%82%B4%EB%A9%B4-%EC%95%88-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

在做代码审查时,我曾遇到过这样一个函数。

函数名叫`getUser()`,可打开一看,它不仅查询用户信息,还顺带更新最后登录时间、刷新缓存,如果是休眠账号的话,甚至还会发送提醒邮件。

如果只看名字就以为"反正是查询,应该没问题",然后在循环里调用它,会发生什么?用户们就会被邮件轰炸。

今天要讲的原则,正是用来筛掉这种代码的——最小惊讶原则。这是延续KISS、DRY、YAGNI、SOLID的开发原则系列文章,今天这一篇光是名字就很有意思。

<figure>
  <img src="/assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/1.png" alt="代码里突然蹦出来的惊喜盒子,可一点都不受欢迎">
  <figcaption>代码里突然蹦出来的惊喜盒子,可一点都不受欢迎</figcaption>
</figure>

最小惊讶原则(Principle of Least Astonishment,简称POLA)讲的是这样一件事。

> 代码应该按照阅读者预期的方式运行。如果某个设计会让使用者感到意外,就该重新审视这个设计。

这是源自20世纪60~70年代系统设计领域的一条古老原则,但它其实是一条通用原则,适用于UI设计、API设计,乃至日常代码的方方面面。

---

## 为什么"惊讶"是一种成本?

在编程中,"惊讶"不是情绪问题,而是成本问题。

开发者阅读代码时,会根据函数名和惯例来建立假设,一边读一边验证。看到`getUser`,就会假设它只是查询;看到`isValid`,就会假设它返回布尔值。如果代码按照这些假设运行,阅读起来就会很顺畅。

但一旦假设被打破,阅读者就不得不停下来,钻进函数内部去确认它到底做了什么。哪怕代码库里只有十个这样的函数,也会让人产生"这段代码的名字不可信"的不信任感,从此以后就要打开每个函数逐一确认。代码阅读速度直接减半。

最糟糕的情况是,连确认都没做,就按假设直接使用,结果酿成事故。就像前面提到的邮件轰炸那样。

---

## 代码中"惊讶"冒出来的场景

下面整理几个我实际遇到过的典型模式。

**1. 名字与行为不符的函数**

```swift
// 名字看起来是查询,内部却在改状态
func getUser(id: Int) -> User {
    let user = db.find(id)
    user.lastSeenAt = Date()  // 惊讶点1:副作用
    db.save(user)
    if user.isDormant {
        mailer.send(to: user.email, message: "休眠解除通知")  // 惊讶点2:外部调用
    }
    return user
}
```

藏在查询函数里的写操作,是"惊讶"最典型的代表。get应该只负责读取,如果要改变状态,就应该用update或touch之类的名字。

**2. 违背惯例的返回值**

如果同一个代码库里,有的函数在找不到数据时返回nil,有的抛出异常,有的返回空对象,那调用方每次都得赌一把。无论选哪种方式,统一起来才是关键。

**3. 静默失败**

```swift
func parseConfig(_ json: Data) -> Config {
    guard let config = try? JSONDecoder().decode(Config.self, from: json) else {
        return Config()  // 惊讶点:配置明明解析失败了,却若无其事地返回空配置
    }
    return config
}
```

如果配置文件已经损坏,却悄悄回退到默认值,用户很可能要过很久才发现"咦,配置怎么没生效?",届时排查起来会相当痛苦。失败应该大声地被告知,这样反而不容易让人意外。

<figure>
  <img src="/assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/2.png" alt="名字和行为不一致,吃苦的是读代码的人">
  <figcaption>名字和行为不一致,吃苦的是读代码的人</figcaption>
</figure>

---

## 写出不那么令人意外的代码的诀窍

以下是我自己努力遵守的几条准则。

| 诀窍 | 内容 |
|------|------|
| 名字即契约 | 只做名字承诺的事,如果要做得更多,就改名字 |
| 遵循惯例 | 不要无缘无故偏离语言、框架、团队既有的风格 |
| 暴露副作用 | 会改变状态的函数,要让名字透露出这一点 |
| 若必须令人意外,就写进文档 | 如果确实需要特殊行为,就用注释和文档大张旗鼓地说明 |

这其中最有力的是第二条。比起个人炫技式的聪明写法,团队整体而言,朴实的标准写法永远更胜一筹。这和上一篇KISS原则里提到的"看似高级的一行代码不如平凡的循环"是完全相同的道理。

<figure>
  <img src="/assets/images/posts/08667efa-56be-42a8-ba9a-412b0165801d/3.png" alt="朴实、可预测的代码,最终才是赢家">
  <figcaption>朴实、可预测的代码,最终才是赢家</figcaption>
</figure>

---

## 结语

关于最小惊讶原则,有三点值得记住。

- 代码应该按照名字和惯例所建立的预期来运行。打破预期的代码,正是bug的温床。
- 不要在查询函数里藏副作用,也不要悄悄吞掉失败。
- 比起标新立异的代码,朴实、可预测的代码在团队协作中更胜一筹。

如果只能选一条好代码的标准,我会选这一条:让阅读者不会感到意外的代码。

如果你最近读代码时也曾冒出"咦,这怎么会这样运行?"的念头,那正是这条原则被打破的现场。
