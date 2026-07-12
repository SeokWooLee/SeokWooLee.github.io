---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "YAGNI原则梳理：开发者\"以后可能用得上\"为什么代价高昂"
lang: zh
description: "\"以后应该会用到吧，要不要提前做好？\""
header:
  og_image: /assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png
tags:
  - YAGNI原则
  - 极限编程
  - 过度设计
  - 开发原则
  - KISS原则
  - MartinFowler
  - 软件设计
  - 整洁代码
  - 编程
  - 开发学习
permalink: /zh/YAGNI-정리-개발자의-언젠가-쓰겠지가-비싼-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [English](/en/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

"以后应该会用到吧，要不要提前做好？"

开发过程中这个诱惑真的经常出现。提前把配置选项抽出来，提前搭好多语言支持的结构，提前建好表方便后台随时改。

今天要聊的YAGNI，正是正面回答这个诱惑的原则——"不要"。它和KISS、DRY并称开发原则三巨头。

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png" alt="'以后应该用得上'大多数时候都会落空">
  <figcaption>'以后应该用得上'大多数时候都会落空</figcaption>
</figure>

YAGNI是"You Aren't Gonna Need It"的缩写，意思是"这个东西，反正你用不上"。

这个说法出自极限编程（XP）这一开发方法论，Kent Beck、Ron Jeffries等XP阵营的人经常挂在嘴边，久而久之就固化成了一条原则。

核心主张只有一个。

> 功能应该在真正需要的时候再实现，而不是在"觉得以后可能需要"的时候就动手。

---

## 提前做好会有什么问题？

"提前做好以后不是更方便吗？"——这样的反驳马上就会冒出来。问题在于，这种预测大多数时候都是错的。

Martin Fowler就这个主题写过一篇总结文章，把提前做好的功能的成本分成了四类。

| 成本 | 内容 |
|------|------|
| 实现成本 | 花时间做了现在根本用不上的功能 |
| 延迟成本 | 本该在这段时间完成的真正功能被拖延了 |
| 维护成本 | 即使没人用，测试、重构、修bug也照样要跟进 |
| 修复成本 | 真到需要的那一刻，需求早已变样，还得推倒重做 |

最痛的是最后一项。等"以后"真的到来时，那个"以后"的需求几乎总是和你当初设想的不一样。结果就是连提前写好的代码也要重新推翻，等于双重付出成本。

---

## 实战中YAGNI被打破的场景

道理讲出来大家都点头认同，但到了实战中，它常常以这些形式悄悄潜入。

**1. 提前预留参数**

```swift
// 目前只有邮件通知
func sendNotification(user: User, message: String, channel: String = "email",
                      retryCount: Int = 3, priority: String = "normal",
                      template: String? = nil) {
    // 只有channel为"email"时才生效的代码
}
```

调用的地方全都只写`sendNotification(user: user, message: msg)`。剩下那些参数，是为了"以后接入Slack通知时能用上"而做的，但Slack通知的需求始终没有出现。

**2. 提前铺设协议**

明明只有一个实现类，却先把协议建好。就像只做一个`UserService`，却顺手建一个`UserServiceProtocol`——在第二个实现出现之前，这个协议只是个增加文件数量的摆设。

**3. "抽成配置不是挺好的吗"**

因为害怕硬编码，把所有值都抽到配置文件和后台管理界面里。结果那个配置一年都改不了一次，配置项越多，"改这个值会影响到哪里？"这种疑问反而越多。

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/2.png" alt="用不上的选项，维护成本可一分不少">
  <figcaption>用不上的选项，维护成本可一分不少</figcaption>
</figure>

---

## 哪些不属于YAGNI

为了避免误解，先划清界限。YAGNI并不是这个意思。

首先，它不是说不要做设计。让代码更容易修改的努力（好的命名、小函数、测试）本身现在就有价值，不属于YAGNI要限制的对象。相反，代码越容易修改，等"真正需要的那一刻"来临时才能更快做出来。

其次，它也不是说难以撤回的决策也要往后拖。像数据库选型、API公开规范这类一旦定下就很难更改的东西，提前考虑清楚才是对的。YAGNI针对的是"明明以后可以轻松追加，却偏要提前做好的功能"。

---

## 我使用的判断标准

每当冒出"要不要提前做好"的念头时，我会问自己两个问题。

> 这个功能的需求，是在路线图上写着的，还是只存在于我的想象里？

> 以后再加，成本会比现在贵很多吗？

如果依据只是想象，而且以后追加的成本和现在差不多，那就不做。大多数情况都属于这一类。

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/4-1783847956996.png" alt="两个问题足够帮你做判断了">
  <figcaption>两个问题足够帮你做判断了</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/3.png" alt="等到真正需要的那天再做也不迟">
  <figcaption>等到真正需要的那天再做也不迟</figcaption>
</figure>

---

## 结语

YAGNI原则要带走的要点有三个。

- 功能应该在真正需要时再做，而不是在"觉得可能需要"时就做。
- 提前做好的功能，会同时收取实现、延迟、维护、修复四份成本。
- 但好的设计习惯和难以撤回的决策，不属于YAGNI的限制对象。

把KISS、DRY和YAGNI放在一起看，这三条原则最终汇聚成一句话：只做今天需要的东西，做得简单，只放在一个地方。

如果有哪个功能是因为"以后应该用得上"才做出来、如今却在沉睡，说不定两年后就得亲手把它删掉。
