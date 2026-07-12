---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "YAGNI原则：开发者的\"以后可能用得上\"为什么代价高昂"
lang: zh
description: "\"以后好像用得上，要不要先做出来？\""
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
  - 代码整洁
  - 编程
  - 开发学习
permalink: /zh/YAGNI-정리-개발자의-언젠가-쓰겠지가-비싼-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [English](/en/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · [日本語](/ja/YAGNI-%EC%A0%95%EB%A6%AC-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EC%96%B8%EC%A0%A0%EA%B0%80-%EC%93%B0%EA%B2%A0%EC%A7%80%EA%B0%80-%EB%B9%84%EC%8B%BC-%EC%9D%B4%EC%9C%A0/) · **中文**
{: .notice--info}

"以后好像用得上，要不要先做出来？"

开发的时候，这种诱惑真的很常出现。配置选项提前预留，多语言支持结构提前搭好，连管理后台能改的表也提前建好。

我以前也做过"以后应该用得上"的功能。结果两年后亲手删掉那段代码的人，正是我自己。因为它一次都没被用过。

今天要聊的YAGNI，正是正面回应这种诱惑的原则——它的答案是"不需要"。它和KISS、DRY并称为开发三大原则。

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/1.png" alt="&quot;以后应该用得上&quot;大多数时候都是猜错的">
  <figcaption>&quot;以后应该用得上&quot;大多数时候都是猜错的</figcaption>
</figure>

YAGNI是"You Aren't Gonna Need It"的缩写，意思是"反正你不会用到的"。

这个说法出自极限编程（XP）这一开发方法论，是Kent Beck和Ron Jeffries等XP阵营人物挂在嘴边的口头禅，后来固化成了一条原则。

核心主张只有一句话：

> 只在真正需要某个功能时才去实现它，而不是预测可能需要的时候。

---

## 提前做好会有什么问题？

"提前做好以后不是更方便吗？"这样的反驳马上就会冒出来。问题在于，这种预测大多数时候都是错的。

Martin Fowler在一篇整理这个主题的文章中，把提前做好的功能的成本分成了四类。

| 成本 | 内容 |
|------|------|
| 实现成本 | 花时间做了眼下用不到的功能 |
| 延迟成本 | 本该在这段时间完成的真正功能被拖延 |
| 维护成本 | 就算不用，测试、重构、修bug也一样跑不掉 |
| 修复成本 | 真正需要用到的时候，需求早已变了样，还得重新改 |

最痛的是最后一项。等"以后"真的到来时，那时候的需求几乎总是和你当初设想的不一样。结果提前写的代码还得再返工一次，等于双重付出成本。

---

## 实战中YAGNI被打破的场景

道理讲出来大家都点头，可到了实战中，它总会用这些方式悄悄溜进来。

**1. 提前预留参数**

```javascript
// 现在只有邮件通知
function sendNotification(user, message, channel = 'email',
  retryCount = 3, priority = 'normal', template = null) {
  // 只有 channel 为 'email' 时才生效的代码
}
```

调用的地方全都只是`sendNotification(user, msg)`。剩下的参数是"为了以后接入Slack通知"而做的，可Slack通知的需求最终从没提出过。

**2. 提前搭好接口**

明明只有一个实现，却先把接口做出来。比如做一个`UserService`的同时顺手做一个`IUserService`，在第二个实现出现之前，这个接口只是个白白增加文件数量的摆设。

**3. "抽成配置不是更好吗？"**

因为害怕硬编码，把所有值都抽到配置文件和管理后台里。可实际上那个配置一年都改不了一次，配置越多，"改这个值会影响到哪里？"这样的疑问就越多。

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/2.png" alt="不用的选项，维护成本可一点都不会少">
  <figcaption>不用的选项，维护成本可一点都不会少</figcaption>
</figure>

---

## YAGNI不是什么

为了避免误解，先划清界限。YAGNI不是这些意思。

首先，它不是说不要做设计。让代码更容易修改的努力（好的命名、小函数、测试）在当下就有价值，所以不属于YAGNI要限制的对象。反而正是因为代码容易修改，"真正需要的那一刻"才能快速做出来。

其次，它也不是说要把难以撤回的决定也往后拖。像数据库选型、API公开规范这类一旦定下来就很难更改的事情，提前考虑清楚才是对的。YAGNI针对的是"以后可以轻松添加、却提前做出来的功能"。

---

## 我使用的判断标准

每当我在想"要不要先做出来"的时候，会问自己两个问题。

> 这个功能有路线图上的依据，还是只存在于我的想象里？

> 以后再加，会比现在贵很多吗？

如果依据只是想象，而且以后加的成本和现在差不多，那我就不做。大多数情况都是这样。

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/4-1783847956996.png" alt="两个问题足够帮你做出判断">
  <figcaption>两个问题足够帮你做出判断</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/54251c52-d88d-4272-9dd5-8f820c168501/3.png" alt="等真正需要的那天再做也不迟">
  <figcaption>等真正需要的那天再做也不迟</figcaption>
</figure>

---

## 结语

YAGNI原则要记住的有三点。

- 功能要在真正需要的时候再做，而不是感觉可能需要的时候。
- 提前做好的功能，会同时收取实现、延迟、维护、修复四重成本。
- 但好的设计习惯和难以撤回的决定，不在YAGNI的限制范围内。

把KISS、DRY和YAGNI放在一起看，这三条原则最终会汇成一句话：只在今天需要的地方，简单地做一处就好。

如果你也有一个"以后应该用得上"却一直在沉睡的功能，说不定两年后，你也会像我一样亲手把它删掉。
