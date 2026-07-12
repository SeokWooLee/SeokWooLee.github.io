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
description: "Swiftでアプリを作っていると、do-catchでエラーをキャッチしたものの、画面に表示するメッセージが今ひとつパッとしなかった経験、きっとあるはずです。"
header:
  og_image: /assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png
categories:
  - iOS
tags:
  - Swift
  - LocalizedError
  - errorDescription
  - iOS開発
  - エラー処理
  - SwiftUI
  - カスタムエラー
  - アプリ開発
permalink: /ja/error-description/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/error-description/) · [English](/en/error-description/) · **日本語** · [中文](/zh/error-description/)
{: .notice--info}

Swiftでアプリを作っていると、`do-catch`でエラーをキャッチしたものの、画面に表示するメッセージが今ひとつパッとしなかった経験、きっとあるはずです。

`error.localizedDescription`をそのまま使うと、「The operation couldn't be completed…」のような正体不明の文言がユーザーにそのまま表示されがちなんですよね。

結論から先にお伝えします。

> Swiftでユーザーに見せるカスタムエラーメッセージを定義するには、`Error`ではなく`LocalizedError`プロトコルを採用し、`errorDescription`プロパティを実装すればOKです。

今日はこの方法をサンプルとともに一つずつ解説していきます。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/1.png" alt="Errorの代わりにLocalizedErrorを使うと、カスタムエラーメッセージがこんな風に変わります">
  <figcaption>Errorの代わりにLocalizedErrorを使うと、カスタムエラーメッセージがこんな風に変わります</figcaption>
</figure>

---

## なぜ普通の`Error`だけでは不十分なのか

多くの方はこんな風にエラーを定義していると思います。

```swift
enum LoginError: Error {
    case invalidPassword
    case userNotFound
}
```

この状態のまま`error.localizedDescription`を出力すると、期待していた「パスワードが間違っています」ではなく、システムが生成する味気ないデフォルトの文言が出てきてしまいます。

`Error`プロトコル自体には、人間が読めるメッセージを定義する仕組みが用意されていないからです。

そこで登場するのが`LocalizedError`です。

---

## Swiftのカスタムエラーメッセージ、どう定義する?

方法はシンプルです。`LocalizedError`を採用し、`errorDescription`を実装するだけです。

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

これで`error.localizedDescription`を呼び出すと、こちらで指定した文言がそのまま出力されます。

ポイントは`errorDescription`の戻り値の型が`String?`、つまりオプショナルだということです。

ここで`nil`を返すと、再びシステムのデフォルトメッセージに戻ってしまいます。ですので、すべてのケースに値を用意しておくことが重要です。

<figure>
  <img src="/assets/images/posts/a4fd42cd-dc7b-4c76-a180-5b1868371ad2/2-1783751475406.png" alt="ケースごとに文字列を埋めていくのがポイントです">
  <figcaption>ケースごとに文字列を埋めていくのがポイントです</figcaption>
</figure>

---

## errorDescription以外にもある?(failureReason・recoverySuggestion)

はい、`LocalizedError`には任意で実装できるプロパティがほかにもあります。

役割を表にまとめるとこうなります。

| プロパティ | 役割 | 文言例 |
|---|---|---|
| `errorDescription` | 何が問題だったか | 「ログインに失敗しました。」 |
| `failureReason` | なぜ発生したか | 「パスワードを5回間違えました。」 |
| `recoverySuggestion` | どう解決すればよいか | 「しばらくしてからもう一度お試しください。」 |

特に`recoverySuggestion`は、ユーザーに次のアクションを案内する際に役立ちます。

実際、SwiftUIの`Alert`やAppKit環境では、これらの値を自動的に読み取って画面に配置してくれることもあります。

私の場合、ユーザー向けのエラーであれば少なくとも`errorDescription`と`recoverySuggestion`の2つは用意するようにしています。

---

## 開発用ログとユーザー向けメッセージを混同しないこと

一つだけ付け加えておきます。

デバッグログに出力したい開発者向けの説明は`CustomStringConvertible`(つまり`description`)で、

ユーザーに見せる翻訳済みメッセージは`LocalizedError`で分ける、というのがおすすめです。

それぞれ目的が違いますからね。一方は自分のため、もう一方はユーザーのためのものです。

こうして役割を分けておくと、後から多言語対応をする際にも`NSLocalizedString`を乗せやすくなります。

---

今日の内容を一言でまとめると、「ユーザーに見せるエラーなら、まず`LocalizedError`の`errorDescription`から埋めよう」ということです。

ちょっとした習慣一つでユーザー体験がぐっと変わりますので、次のプロジェクトでぜひ一度試してみてください。応援しています!🙌

---

## 参考資料

- [Create A Custom Swift Error [and override localizedDescription]](https://www.advancedswift.com/custom-errors-in-swift/)
- [Defining Custom Errors With Advanced Descriptions In Swift – SerialCoder.dev](https://serialcoder.dev/text-tutorials/swift-tutorials/defining-custom-errors-with-advanced-descriptions-in-swift/)
- [Alert and LocalizedError in SwiftUI – Augmented Code](https://augmentedcode.io/2020/03/01/alert-and-localizederror-in-swiftui/)
