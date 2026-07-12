---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift 自定义错误信息定义，LocalizedError 完全指南（附示例）"
lang: zh
description: "用 Swift 开发应用时，经常会遇到这种情况：用 do-catch 捕获到了错误，但真正要显示在界面上的提示信息却总是差强人意。"
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
  - 应用开发
permalink: /zh/error-description/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/error-description/) · [English](/en/error-description/) · [日本語](/ja/error-description/) · **中文**
{: .notice--info}

用 Swift 开发应用时，经常会遇到这种情况：用 `do-catch` 捕获到了错误，但真正要显示在界面上的提示信息却总是差强人意。

如果直接使用 `error.localizedDescription`，很容易把"The operation couldn't be completed…"这种莫名其妙的系统文案原样暴露给用户。

先说结论。

> 在 Swift 中，如果想定义展示给用户看的自定义错误信息，不需要采用 `Error`，而是要遵循 `LocalizedError` 协议，并实现 `errorDescription` 属性。

今天就通过示例，逐步拆解这个方法。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="用 LocalizedError 替代 Error，自定义错误信息就会变成这样">
  <figcaption>用 LocalizedError 替代 Error，自定义错误信息就会变成这样</figcaption>
</figure>

---

## 为什么单靠 Error 不够用？

很多人可能会这样定义错误。

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

如果只做到这一步就输出 `error.localizedDescription`，出现的不会是我们期望的"密码错误"，而是系统生成的平淡无奇的默认文案。

这是因为 `Error` 协议本身并没有为人类可读的消息预留位置。

于是 `LocalizedError` 就登场了。

---

## Swift 自定义错误信息该如何定义？

方法很简单。只需遵循 `LocalizedError` 并实现 `errorDescription` 即可。

下面是给登录错误附加用户提示信息的示例。

```swift
extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidPassword:
            return "密码不正确。"
        case .userNotFound:
            return "用户不存在。"
        }
    }
}
```

现在再调用 `error.localizedDescription`，就会原样输出我们设定好的文案。

关键点在于，`errorDescription` 的返回类型是 `String?`，也就是可选类型。

如果这里返回 `nil`，就会又回退到系统默认信息。所以务必为每个分支都填上具体的值。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="关键在于给每个分支都填上对应的字符串">
  <figcaption>关键在于给每个分支都填上对应的字符串</figcaption>
</figure>

---

## 除了 errorDescription 还有别的吗？（failureReason·recoverySuggestion）

是的，`LocalizedError` 中还有几个可以选择性实现的属性。

把它们的作用整理成表格如下。

| 属性 | 作用 | 示例文案 |
|---|---|---|
| `errorDescription` | 说明出了什么问题 | "登录失败。" |
| `failureReason` | 说明发生的原因 | "密码已连续输错 5 次。" |
| `recoverySuggestion` | 说明如何解决 | "请稍后重试。" |

尤其是 `recoverySuggestion`，在需要引导用户下一步操作时非常实用。

实际上，在 SwiftUI 的 `Alert` 或 AppKit 环境中，这些值有时会被自动读取并展示到界面上。

如果是面向用户的错误，我通常会至少把 `errorDescription` 和 `recoverySuggestion` 这两个都补全。

---

## 别把开发用日志和用户提示信息搞混了

再补充一点。

建议把想打印到调试日志里的开发者用说明放在 `CustomStringConvertible`（即 `description`）中，

而把展示给用户看的翻译文案放在 `LocalizedError` 中，两者分开。

因为两者的目的不同。一个是为自己准备的，另一个是为用户准备的。

这样把职责分开之后，后续做多语言支持、接入 `NSLocalizedString` 时也会顺畅很多。

---

把今天的内容浓缩成一句话："如果是要展示给用户看的错误，就先从 `LocalizedError` 的 `errorDescription` 开始补起。"

只是一个小习惯，就能让用户体验大不一样，希望大家一定要在下一个项目中试一试。为你加油！🙌

---

## 参考资料

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)
