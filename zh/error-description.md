---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift自定义错误消息定义，LocalizedError完全指南（附示例）"
lang: zh
description: "用Swift开发App的时候，你可能也遇到过这种情况：用do-catch捕获了错误，可真到了要在界面上显示提示的时候，那条消息却不太理想。"
header:
  og_image: /assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png
categories:
  - iOS
tags:
  - Swift
  - LocalizedError
  - errorDescription
  - iOS开发
  - 错误处理
  - SwiftUI
  - 自定义错误
  - App开发
permalink: /zh/error-description/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/error-description/) · [English](/en/error-description/) · [日本語](/ja/error-description/) · **中文**
{: .notice--info}

用Swift开发App的时候，你可能也遇到过这种情况：用`do-catch`捕获了错误，可真到了要在界面上显示提示的时候，那条消息却不太理想。

我自己也是一开始直接用`error.localizedDescription`，结果给用户看到的是"The operation couldn't be completed…"这种莫名其妙的句子。😅

先说结论。

> 在Swift中要定义展示给用户看的自定义错误消息，不应该采用`Error`，而是要遵循`LocalizedError`协议，并实现`errorDescription`属性。

今天就结合示例，一步步把这个方法讲清楚。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="用LocalizedError代替Error，自定义错误消息就会变成这样">
  <figcaption>用LocalizedError代替Error，自定义错误消息就会变成这样</figcaption>
</figure>

---

## 为什么单纯用Error不够？

很多人一开始都是这样定义错误的：

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

如果只写到这一步，再打印`error.localizedDescription`，出来的不是我们期待的"密码错误"，而是系统生成的那种干巴巴的默认提示。

这是因为`Error`协议本身并没有预留一个用来定义人类可读消息的位置。

于是`LocalizedError`就登场了。

---

## Swift自定义错误消息该怎么定义？

方法很简单：遵循`LocalizedError`协议，实现`errorDescription`即可。

下面是给登录错误加上面向用户的消息的示例。

```swift
extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidPassword:
            return "密码不正确。"
        case .userNotFound:
            return "该用户不存在。"
        }
    }
}
```

现在再调用`error.localizedDescription`，就会原样输出我们设定好的文字。

有一点要注意：`errorDescription`的返回类型是`String?`，也就是可选类型。

如果这里返回`nil`，就会又变回系统默认的消息。所以务必给每一种case都填上具体的值。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="重点是要给每个case都填上对应的字符串">
  <figcaption>重点是要给每个case都填上对应的字符串</figcaption>
</figure>

---

## 除了errorDescription还有别的吗？（failureReason·recoverySuggestion）

没错，`LocalizedError`里还有几个可以选择性实现的属性。

把它们的作用整理成表格如下。

| 属性 | 作用 | 示例文案 |
|---|---|---|
| `errorDescription` | 说明出了什么问题 | "登录失败。" |
| `failureReason` | 说明发生的原因 | "密码已连续输错5次。" |
| `recoverySuggestion` | 说明该如何解决 | "请稍后再试。" |

尤其是`recoverySuggestion`，在需要引导用户下一步操作时非常好用。

实际上，在SwiftUI的`Alert`或AppKit环境下，这些值有时会被自动读取并展示到界面上。

我个人的习惯是，只要是面向用户的错误，至少会把`errorDescription`和`recoverySuggestion`这两个补齐。

---

## 别把开发用日志和用户消息搞混了

再补充一点。

想打印在调试日志里给开发者看的说明，建议用`CustomStringConvertible`（也就是`description`）；

而要展示给用户看的、经过本地化的消息，则用`LocalizedError`。

两者的目的不一样：一个是写给自己看的，另一个是写给用户看的。

把这两者的职责分开之后，以后做多语言适配时，接入`NSLocalizedString`也会顺畅得多。

---

把今天的内容浓缩成一句话，就是："只要是要展示给用户看的错误，就先把`LocalizedError`的`errorDescription`填好。"

一个小习惯，就能让用户体验发生很大的变化，下个项目里一定要试试看。加油！🙌

---

## 参考资料

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)
