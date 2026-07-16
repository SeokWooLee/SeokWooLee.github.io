---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftのファクトリメソッドパターン、initの代わりに使う理由(実践まとめ)"
lang: ja
description: "Swiftでアプリを作っていると、オブジェクトを生成するコードは1日に何十回も書くことになります。"
header:
  og_image: /assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png
tags:
  - Swift
  - ファクトリメソッドパターン
  - iOS開発
  - デザインパターン
  - スウィフト
  - init
  - 静的ファクトリメソッド
  - オブジェクト指向
  - コーディング学習
  - アプリ開発
permalink: /ja/Swift-팩토리-메서드-패턴-init-대신-쓰는-이유-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-17
---

🌐 [한국어](/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **日本語** · [中文](/zh/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

Swiftでアプリを作っていると、オブジェクトを生成するコードは1日に何十回も書くことになります。

でもある瞬間から、initひとつだけではもどかしい状況が繰り返し出てきます。

最初はとにかくinitだけを使っていたのが、プロジェクトが大きくなるにつれてファクトリメソッドパターンにたどり着くケースが多いんですよね。

この記事では、Swiftのファクトリメソッドパターンとは何か、そしてなぜinitの代わりにファクトリを使うのかを、実際のコードとともに解説していきます。

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/1.png" alt="Swiftのファクトリメソッドパターン、initと何が違うのかから押さえていきましょう">
  <figcaption>Swiftのファクトリメソッドパターン、initと何が違うのかから押さえていきましょう</figcaption>
</figure>

## ファクトリメソッドパターン、一言で言うと?

まず結論からお伝えします。

> ファクトリメソッドとは、オブジェクト生成のロジックをinitの外に独立したメソッドとして切り出し、名前を付けて戻り値の型も自由に選べるようにする方式です。

Swiftでは通常、`static func`で作る静的ファクトリメソッドを指します。

initは言語が定めたルールの中でしか動けません。

名前を付けられず、常に自分自身の型のインスタンスを新しく作らなければなりません。

ファクトリメソッドはこの制約を取り払ってくれます。

簡単な例を見てみましょう。

```swift
struct Color {
    let r, g, b: Double
    // 生成意図を名前で明示する
    static func rgb(_ r: Double, _ g: Double, _ b: Double) -> Color {
        Color(r: r, g: g, b: b)
    }
    static func gray(_ v: Double) -> Color {
        Color(r: v, g: v, b: v)
    }
}
```

`Color.gray(0.5)`のように呼び出せば、これがグレーを作るものだとコードを見ただけで分かります。

---

## initの代わりにファクトリを使う理由は?

実際に扱ってみてまとめた理由は、大きく4つありました。

**第一に、名前を付けられます。**

initはすべて名前が同じなので、パラメータだけで区別しなければなりません。

同じ`Double`を2つ受け取るイニシャライザが複数あると、混乱の元になりがちです。

ファクトリメソッドなら`from(hex:)`、`rgb(_:_:_:)`のように意図を名前に込められます。

**第二に、毎回新しいインスタンスを作らなくてもよくなります。**

initは必ず新しいオブジェクトを返しますが、ファクトリならキャッシュされた値やシングルトンを返すことができます。

**第三に、戻り値の型を柔軟に選べます。**

状況に応じてサブタイプや別の実装を返すことも可能です。

**第四に、失敗処理をより明確に表現できます。**

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/2.png" alt="static funcを一行加えるだけで、コードがぐっと読みやすくなります">
  <figcaption>static funcを一行加えるだけで、コードがぐっと読みやすくなります</figcaption>
</figure>

以下はキャッシュを活用するファクトリの例です。

```swift
final class IconCache {
    private static var store: [String: Icon] = [:]
    // 同じ名前なら、すでに作成済みのアイコンを再利用する
    static func icon(named name: String) -> Icon {
        if let cached = store[name] { return cached }
        let icon = Icon(name: name)
        store[name] = icon
        return icon
    }
}
```

同じアイコンを何度も呼び出すとき、メモリを節約できます。

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/4-1783847712458.png" alt="あれば取り出し、なければ作って補充しておきます">
  <figcaption>あれば取り出し、なければ作って補充しておきます</figcaption>
</figure>

---

## では、initはもう使わなくていいのか?

いいえ、決してそうではありません。

ファクトリはinitを置き換えるものではなく、包み込むためのツールです。

ファクトリメソッドの内部でも、結局はinitを呼び出してオブジェクトを作っています。

単純な値型だったり、生成ロジックが分かりきっている場合は、素直にinitを使う方がいいでしょう。

無理にファクトリで包んでしまうと、コードが長くなるだけで読みにくくなります。

ファクトリが真価を発揮する場面は別にあります。

- 生成方法が複数あり、名前で区別したいとき
- キャッシュやプーリングのように再利用が必要なとき
- 複雑な初期化手順を一箇所に隠したいとき
- プロトコル型として返し、実装を隠したいとき

この条件に当てはまらないなら、initを使うのが正解です。

Swiftの標準ライブラリもこのように使い分けています。

`Array(repeating:count:)`はinitですが、`UIColor.systemBlue`のような静的プロパティも、実はファクトリの親戚のような存在です。

---

## 実務での判断基準まとめ

迷ったときに使っている基準を表にまとめてみました。

| 状況 | おすすめ |
| --- | --- |
| 単純な値の保持 | init |
| 生成方法が複数ある | ファクトリメソッド |
| インスタンスの再利用・キャッシュ | ファクトリメソッド |
| 実装を隠してプロトコルで返す | ファクトリメソッド |
| 初期化が一行で終わる | init |

<figure>
  <img src="/assets/images/posts/99f6f318-d7b7-4d4b-80f1-8442636176f7/3.png" alt="迷ったときはいつもこの表を思い浮かべて選んでいます">
  <figcaption>迷ったときはいつもこの表を思い浮かべて選んでいます</figcaption>
</figure>

まとめると、initは「どう作るか」を扱い、ファクトリは「何を、なぜ作るか」を扱います。

両者は競合関係ではなく、役割の異なるパートナーです。

最初はinitから始めて、生成ロジックが複雑になった瞬間にファクトリへ移行する流れをおすすめします。

今日紹介した基準さえ覚えておけば、コードがぐっとすっきりするはずです。楽しいSwiftコーディングを!
