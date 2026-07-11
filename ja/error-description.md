---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftのカスタムエラーメッセージ定義、LocalizedError完全ガイド(サンプル付き)"
lang: ja
description: "Swiftでアプリを作っていると、do-catchでエラーを捕まえたのに、画面に表示するメッセージがいまいちパッとしなかった経験、ありますよね。"
header:
  og_image: /assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png
categories:
  - iOS
tags:
  - Swift
  - LocalizedError
  - errorDescription
  - iOS開発
  - エラーハンドリング
  - SwiftUI
  - カスタムエラー
  - アプリ開発
permalink: /ja/error-description/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/error-description/) · [English](/en/error-description/) · **日本語** · [中文](/zh/error-description/)
{: .notice--info}

Swiftでアプリを作っていると、`do-catch`でエラーを捕まえたのに、画面に表示するメッセージがいまいちパッとしなかった経験、ありますよね。

私も最初は`error.localizedDescription`をそのまま使って、「The operation couldn't be completed…」みたいな正体不明の文言をユーザーに見せてしまったことがあります。😅

結論から言いますね。

> Swiftでユーザーに表示するカスタムエラーメッセージを定義するには、`Error`ではなく`LocalizedError`プロトコルを採用し、`errorDescription`プロパティを実装すればOKです。

今日はこの方法をサンプルとともに一つずつ解説していきます。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="Errorの代わりにLocalizedErrorを使うと、カスタムエラーメッセージがこう変わります">
  <figcaption>Errorの代わりにLocalizedErrorを使うと、カスタムエラーメッセージがこう変わります</figcaption>
</figure>

---

## なぜただの Error では不十分なのか

多くの方はこんな風にエラーを定義していると思います。

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

このまま`error.localizedDescription`を出力すると、期待していた「パスワードが間違っています」ではなく、システムが生成した味気ないデフォルト文言が表示されてしまいます。

`Error`プロトコル自体には、人が読めるメッセージを定義する場所がないからです。

そこで登場するのが`LocalizedError`です。

---

## Swiftのカスタムエラーメッセージ、どう定義する?

方法はシンプルです。`LocalizedError`を採用し、`errorDescription`を実装するだけ。

以下はログインエラーにユーザー向けメッセージを付けたサンプルです。

```swift
extension LoginError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .invalidPassword:
            return "パスワードが正しくありません。"
        case .userNotFound:
            return "存在しないユーザーです。"
        }
    }
}
```

これで`error.localizedDescription`を呼び出すと、自分で決めた文言がそのまま表示されます。

ポイントは`errorDescription`の戻り値の型が`String?`、つまりオプショナルであることです。

ここで`nil`を返してしまうと、またシステムのデフォルトメッセージに戻ってしまいます。だからすべてのケースにきちんと値を入れておくことが大切です。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="ケースごとに文字列を埋めていくのがポイントです">
  <figcaption>ケースごとに文字列を埋めていくのがポイントです</figcaption>
</figure>

---

## errorDescription以外にもある?(failureReason・recoverySuggestion)

はい、`LocalizedError`には任意で実装できるプロパティが他にもあります。

役割を表にまとめるとこんな感じです。

| プロパティ | 役割 | 文言の例 |
|---|---|---|
| `errorDescription` | 何が間違っているか | 「ログインに失敗しました。」 |
| `failureReason` | なぜ発生したか | 「パスワードを5回間違えました。」 |
| `recoverySuggestion` | どう解決すればいいか | 「しばらくしてから再度お試しください。」 |

特に`recoverySuggestion`は、ユーザーに次の行動を案内するときに役立ちます。

実際、SwiftUIの`Alert`やAppKit環境では、これらの値を自動で読み取って画面に配置してくれることもあります。

私はユーザー向けエラーであれば、少なくとも`errorDescription`と`recoverySuggestion`の2つは用意するようにしています。

---

## 開発用ログとユーザー向けメッセージを混同しないこと

もう一つだけ付け加えます。

デバッグログに出力したい開発者向けの説明は`CustomStringConvertible`(つまり`description`)で、

ユーザーに見せる翻訳済みメッセージは`LocalizedError`で分けることをおすすめします。

両者は目的が違うからです。一方は自分のため、もう一方はユーザーのためのものです。

こうして役割を分けておくと、後で多言語対応をする際にも`NSLocalizedString`を乗せやすくなります。

---

今日の内容を一言でまとめると、「ユーザーに見せるエラーなら、まず`LocalizedError`の`errorDescription`から埋めよう」ということです。

ちょっとした習慣一つでユーザー体験がぐっと変わるので、次のプロジェクトでぜひ試してみてください。応援しています! 🙌

---

## 参考資料

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)
