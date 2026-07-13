---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "什么是 MCP 服务器？从连接方法到安全注意事项"
lang: zh
description: "使用 ChatGPT 或 Claude 的时候，总会遇到一些让人遗憾的瞬间。模型明明很聪明，却看不到我的数据库，也读不了公司内部的 Wiki。"
header:
  og_image: /assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/1.png
tags:
  - MCP
  - ModelContextProtocol
  - AI智能体
  - Claude
  - LLM
  - AI工具集成
  - 开发者AI
  - AI自动化
permalink: /zh/MCP-서버란-연결-방법부터-보안-주의점까지/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/MCP-%EC%84%9C%EB%B2%84%EB%9E%80-%EC%97%B0%EA%B2%B0-%EB%B0%A9%EB%B2%95%EB%B6%80%ED%84%B0-%EB%B3%B4%EC%95%88-%EC%A3%BC%EC%9D%98%EC%A0%90%EA%B9%8C%EC%A7%80/) · [English](/en/MCP-%EC%84%9C%EB%B2%84%EB%9E%80-%EC%97%B0%EA%B2%B0-%EB%B0%A9%EB%B2%95%EB%B6%80%ED%84%B0-%EB%B3%B4%EC%95%88-%EC%A3%BC%EC%9D%98%EC%A0%90%EA%B9%8C%EC%A7%80/) · [日本語](/ja/MCP-%EC%84%9C%EB%B2%84%EB%9E%80-%EC%97%B0%EA%B2%B0-%EB%B0%A9%EB%B2%95%EB%B6%80%ED%84%B0-%EB%B3%B4%EC%95%88-%EC%A3%BC%EC%9D%98%EC%A0%90%EA%B9%8C%EC%A7%80/) · **中文**
{: .notice--info}

使用 ChatGPT 或 Claude 的时候，总会遇到一些让人遗憾的瞬间。模型明明很聪明，却看不到我的数据库，也读不了公司内部的 Wiki。

于是大家开始直接对接 API。可问题是，每个模型、每个工具的对接方式都不一样，组合一多，对接代码也会呈指数级膨胀。

MCP（Model Context Protocol）就是为了解决这个问题而生的标准。一句话概括：它是一套让 AI 模型接入外部工具和数据的通用规格。人们常把它称为“AI 界的 USB-C”。

这篇文章会梳理 MCP 到底解决了什么问题、引入前后对接工作量有多大差别、它的内部结构以及与 function calling 的区别，最后再介绍几个现在就能上手接入的代表性服务器。

<figure>
  <img src="/assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/1.png" alt="MCP 把每个工具各不相同的“连接线”统一成了同一种规格">
  <figcaption>MCP 把每个工具各不相同的“连接线”统一成了同一种规格</figcaption>
</figure>

先看一下核心要点。

1. MCP 是连接 AI 与外部工具的开放标准协议（Anthropic 于 2024 年 11 月发布）
2. 直接对接动辄要写几百行代码，而有了 MCP 服务器，几行配置就能搞定
3. 它不是要取代 function calling，而是在其之上把工具标准化、可复用的一层
4. 随着 OpenAI、Google 也相继采用，它已实质上成为业界标准，服务器生态也在快速壮大

---

## MCP 解决的问题：M×N 对接地狱

先来看看 MCP 出现之前的情况。

如果 AI 应用有 M 个，想接入的工具有 N 个，那么需要的对接代码就是 M×N 个。给 Claude 用的 GitHub 对接、给 ChatGPT 用的 GitHub 对接、给 Cursor 用的 GitHub 对接，全都得各自单独开发。

MCP 在中间插入了一套标准规格。工具这一端只需做一次 MCP 服务器，AI 应用这一端只需实现一次 MCP 客户端，就结束了。M×N 就此降为 M+N。

> 可以类比 USB-C 出现之前，每台设备都要带不同充电线的年代。MCP 相当于统一了那根线的规格。

不过光看 M+N 这类公式，估计很难有实感。真正用两种方式做同一个功能对比一下，差别就一目了然了。

---

## 同一个功能，引入前后的对比

假设我们要做一个“查询 GitHub issue 并回答问题”的 AI。

在 MCP 之前，这一切都得自己来。

1. 定义工具 schema：把“list_issues 接收 owner、repo、state”手写成 JSON schema
2. 编写实际调用代码：GitHub REST API 客户端、令牌管理、分页处理
3. 实现执行循环：模型调用工具后接收结果、再返回给模型的往返代码
4. 以上全部按应用重复一遍：Claude 对接一套，公司内部聊天机器人再对接一套

光是查询 issue 这一个功能，光样板代码就要几百行，每多一个工具就要重复 1～3 步。

而有了 MCP，事情就变成了这样：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

schema 定义、API 调用代码、认证处理、错误处理，全都已经内置在服务器里了。我只需要注册这个服务器，然后说一句“帮我总结一下这个仓库最近的 bug issue”就行。

| 项目 | 直接对接 | 使用 MCP 服务器 |
| --- | --- | --- |
| 需要编写的代码 | schema + 调用 + 循环，几百行 | 5 行配置 |
| 认证、错误处理 | 自己实现 | 服务器内置 |
| 新增其他 AI 应用 | 从头再来一遍 | 复用同一个服务器 |
| 新增工具 | 修改代码、重新部署 | 只需更新服务器 |

尤其最后一行很关键：即便服务器新增了功能，我这边的代码一行都不用改，这正是标准化的力量所在。

---

## 内部结构：主机（Host）- 客户端（Client）- 服务器（Server）

MCP 里登场的角色有三个。

| 组成部分 | 角色 | 示例 |
| --- | --- | --- |
| 主机（Host） | 用户使用的 AI 应用 | Claude Desktop、Cursor |
| 客户端（Client） | 在主机内与服务器进行一对一通信 | 内置于主机中 |
| 服务器（Server） | 暴露工具与数据的程序 | GitHub 服务器、数据库服务器 |

一个主机可以启动多个客户端，一个客户端对应连接一个服务器。通信规格采用 JSON-RPC 2.0，连接方式在本地进程时用 stdio，在远程时则用 HTTP 流式传输。

<figure>
  <img src="/assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/2.png" alt="主机内的客户端与服务器一对一连接，就是这样的结构">
  <figcaption>主机内的客户端与服务器一对一连接，就是这样的结构</figcaption>
</figure>

服务器暴露的功能分为三类：

- 工具（tools）：供模型调用的函数，比如“创建 issue”“执行查询”这类动作
- 资源（resources）：供模型读取的数据，比如文件内容、数据库 schema 等只读资料
- 提示词（prompts）：服务器预先准备好的提示词模板

关键在于，工具列表是在运行时动态查询的。客户端一连上服务器，就会问一句“你能做什么”，服务器则会返回工具列表和 schema。这也是前面说的“服务器更新了，我这边代码却不用变”能够成立的原因。

---

## 和 function calling 到底有什么区别？

看到这里，你可能会有个疑问：“这不就是 function calling 早就能做到的事吗？”

二者其实处于不同的层。function calling 是模型对话层面的一种约定，相当于“模型啊，这里有一些函数，需要的时候请用调用格式来回答”这样一个约定。至于函数具体怎么实现、从哪里拿来，完全是开发者自己的事。

MCP 则是把这些函数打包、分发、复用的一套规范。它把工具的实现、认证、文档打包成“服务器”这样一个包，让任何 AI 应用都可以直接插上就用。

> 如果说 function calling 是“函数调用的语法”，那 MCP 就是“装满函数的库生态系统”。实际上 MCP 客户端内部照样是在使用 function calling。两者不是替代关系，而是上下层的关系。

所以“function calling 和 MCP 该选哪个”这个问题本身就不太成立。如果只是自己这一个应用里用到的两三个函数，直接用 function calling 实现就够了；但如果要在多个应用间复用，或者想直接拿别人做好的工具来用，那就该选 MCP。

---

## 现在就能上手接入的代表性服务器

由于生态发展很快，目前市面上常见的工具基本都已经有对应的服务器了。这里挑五个反响不错的介绍一下。

| 服务器 | 能做什么 |
| --- | --- |
| Playwright | 让 AI 直接操作浏览器，点击、输入、截图 |
| Figma | 读取设计稿并转换成前端代码 |
| Notion | 搜索整理文档、会议纪要，创建页面 |
| GitHub | 查询和创建 issue、PR，搜索代码 |
| Supabase（Postgres） | 用自然语言查询数据库，了解表结构 |

如果只能推荐一个，那一定是 Playwright。接入之后，试着说一句“进这个网站，把注册表单填好，再截个图给我看看”。看着 AI 打开浏览器、真的去点击和输入文字，你就不需要别人再解释“连接工具为什么能改变游戏规则”了。这在 E2E 测试自动化或重复性网页操作上也能立刻派上用场。

对前端开发者来说，Figma 同样很有感。以前照着设计稿手动搬运标记（markup）的工作，现在可以直接让能读懂设计稿的 AI 说一句“把这个 frame 做成 React 组件”就完成了。

<figure>
  <img src="/assets/images/posts/45e71f91-f21d-492e-a6da-e0ffc8d4af18/3.png" alt="只需几行配置文件，连接就大功告成">
  <figcaption>只需几行配置文件，连接就大功告成</figcaption>
</figure>

---

## 需要注意的地方和局限

MCP 并非万能。实际使用中会遇到的问题也一并说一下。

首先是安全问题。MCP 服务器相当于给了模型执行权限的通道，一旦接入不可信的服务器，就可能因提示词注入（prompt injection）导致数据泄露。只使用官方注册表或经过验证的服务器会更安全。

其次是上下文成本。接入的服务器越多，工具定义占用的上下文窗口就越大，反而会出现模型性能下降的悖论。就像上表列出的那些一样，只挑当下真正需要的接入，效果会更好。

---

## 结语

MCP 并不是让“模型变得更聪明”的技术，而是把“模型能够伸手触及的范围”标准化的技术。原本直接对接要写几百行代码的工作，现在变成了几行配置；同时也诞生了一个可以直接拿别人做好的工具来用的生态系统。这两点才是它的本质。

下一篇文章，我会梳理经常被拿来和 MCP 做比较的 Claude Code 的 Skill，以及子代理（sub-agent）各自扮演的角色。
