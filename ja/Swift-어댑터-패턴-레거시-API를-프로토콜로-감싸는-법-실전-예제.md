---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftのアダプターパターン、レガシーAPIをプロトコルで包む方法(実践例)"
lang: ja
description: "レガシーAPIのコード、消すこともできず、そのまま使うこともできなくてもどかしかったことはありませんか。"
header:
  og_image: /assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/1.png
tags:
  - Swift
  - アダプターパターン
  - デザインパターン
  - iOS開発
  - レガシーリファクタリング
  - プロトコル指向プログラミング
  - Swiftプロトコル
  - iOSエンジニア
  - コードリファクタリング
permalink: /ja/Swift-어댑터-패턴-레거시-API를-프로토콜로-감싸는-법-실전-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-16
---

🌐 [한국어](/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · [English](/en/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/) · **日本語** · [中文](/zh/Swift-%EC%96%B4%EB%8C%91%ED%84%B0-%ED%8C%A8%ED%84%B4-%EB%A0%88%EA%B1%B0%EC%8B%9C-API%EB%A5%BC-%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C%EB%A1%9C-%EA%B0%90%EC%8B%B8%EB%8A%94-%EB%B2%95-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
{: .notice--info}

レガシーAPIのコード、消すこともできず、そのまま使うこともできなくてもどかしかったことはありませんか。

古いネットワークモジュールを新しい画面に接続するとき、誰もがぶつかる壁ですよね。

結論から言うと、レガシーAPIをプロトコル(interface)で包み、その間にアダプターを置くのが最もすっきりした解決策です。

アダプターパターンとは、互いに噛み合わない2つのインターフェースの間に"変換器"を差し込む方式です。

今日はSwiftでこれをどう適用するか、実際に取り組んだ流れそのままにまとめてみます。

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/1.png" alt="Swiftのアダプターパターン、レガシーと新しいコードの間に変換器を置きます">
  <figcaption>Swiftのアダプターパターン、レガシーと新しいコードの間に変換器を置きます</figcaption>
</figure>

---

## この記事で得られる3つのポイント

忙しい方のために先にまとめました。

1. 新しいコードが求める形をプロトコルとして先に定義する
2. レガシーAPIをそのプロトコルに合わせて変換するアダプター型を作る
3. 画面・ビューモデルはレガシーではなくプロトコルにのみ依存させる

この3つさえ守れば、後でAPIを丸ごと入れ替えるときの修正範囲がぐっと減ります。

この構造に変えてからは、テストコードを書くのがずっと楽になりました。

---

## Swiftのアダプターパターンがなぜ必要なのか

レガシーAPIは、たいてい私たちが望む形をしていません。

コールバックベースだったり、パラメータが煩雑だったり、戻り値の型が曖昧だったりします。

> 新しいコードが古いAPIの都合に合わせて曲がってしまうと、その古いAPIが消える日にコード全体が揺らぎます。

だからこそ、間にアダプターを置くのです。

例えば、以前のモジュールがこんな形だったとしましょう。

```swift
// 手を加えにくいレガシーAPI(コールバックベース)
class LegacyUserAPI {
    func fetch(id: Int,
               done: @escaping (NSDictionary?) -> Void) {
        // 古いネットワーク呼び出し...
    }
}
```

`NSDictionary`をそのまま画面まで引きずっていくと、後でこのAPIを変更するときに画面のコードまで全部作り直すことになります。

見るからに触れたくない形ですよね。

---

## レガシーAPIをプロトコルで包む方法(3ステップ)

実際に包んでいく過程は思ったよりシンプルです。

**ステップ1、求める形をプロトコルとして定義します。**

新しいコードが「こう呼び出せたらいいのに」という形を先に書きます。

```swift
// 新しいコードが求めるすっきりしたインターフェース
protocol UserRepository {
    func user(id: Int) async throws -> User
}
```

コールバックの代わりに`async/await`を、`NSDictionary`の代わりに`User`型を使うようにしました。

**ステップ2、アダプターがレガシーをこのプロトコルに合わせます。**

煩雑な変換処理はすべてアダプターの中に閉じ込めます。

```swift
// レガシーを新しいプロトコルに変換するアダプター
struct LegacyUserAdapter: UserRepository {
    let legacy = LegacyUserAPI()
    func user(id: Int) async throws -> User {
        try await withCheckedThrowingContinuation { cont in
            legacy.fetch(id: id) { dict in
                cont.resume(returning: User(dict))
            }
        }
    }
}
```

コールバックを`async`に変換する`withCheckedThrowingContinuation`が、ここで核となる役割を果たします。

**ステップ3、画面はプロトコルにのみ依存します。**

ビューモデルは`LegacyUserAPI`を知らなくても構いません。`UserRepository`さえ知っていればいいのです。

こうすることで、レガシーコードはアダプターただ一箇所にしか登場しなくなります。

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/4-1783847742177.png" alt="レガシーはアダプターの後ろに隠れ、画面はプロトコルだけを見ます">
  <figcaption>レガシーはアダプターの後ろに隠れ、画面はプロトコルだけを見ます</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/2.png" alt="画面のコードはこのすっきりしたプロトコルさえ知っていればいいのです">
  <figcaption>画面のコードはこのすっきりしたプロトコルさえ知っていればいいのです</figcaption>
</figure>

---

## アダプターを使うと何が変わるのか(直接呼び出しとの比較)

直接呼び出しとアダプター方式を表で比較してみました。

| 項目 | レガシー直接呼び出し | アダプターで包む |
| --- | --- | --- |
| API入れ替え時の修正範囲 | 画面全体 | アダプター一箇所 |
| ユニットテスト | 難しい | モックで簡単に |
| 新しいコードの可読性 | 低い | 高い |
| 初期の作業量 | 少ない | 少し増える |

初期の作業量がほんの少し増えるのは事実です。

ですが、このコストは全く惜しくありませんでした。

テストの際、`UserRepository`を実装したダミーオブジェクトを一つ渡すだけで、ネットワークなしでも画面のロジックを検証できるからです。

実際のAPIがまだ完成していない状況でも、開発を先に始めることができました。

<figure>
  <img src="/assets/images/posts/3b1d42e6-5160-4f01-904f-89f82dbb29bc/3.png" alt="この3つの箱の構造さえ覚えておけば半分は終わったも同然です">
  <figcaption>この3つの箱の構造さえ覚えておけば半分は終わったも同然です</figcaption>
</figure>

---

## よくある質問(Q&A)

**Q. アダプターはstructで作るべきですか、classで作るべきですか?**

状態を持たないなら`struct`で十分です。

レガシーオブジェクトを持ち続ける必要がある、あるいは参照の共有が必要な場合は`class`を使います。

**Q. アダプターパターンとファサードパターンは何が違うのですか?**

アダプターは「インターフェースを合わせる」ことが目的です。

ファサードは複数の複雑なものを「一つにまとめてシンプルに見せる」ことが目的なので、方向性が少し異なります。

**Q. プロトコル名はどうやって付ければいいですか?**

レガシーの名前をそのまま踏襲せず、新しいコードの観点から求める役割で名付けましょう。

`LegacyUserAPI`ではなく`UserRepository`のように。

---

レガシーを無理に消そうとせず、プロトコルとアダプターで静かに隔離することから始めてみてください。

たった一箇所に古いコードを閉じ込めておけば、次のリファクタリングがぐっと楽になります。皆さんのプロジェクトでも、一番厄介なAPIから一つ包んでみてはいかがでしょうか。
