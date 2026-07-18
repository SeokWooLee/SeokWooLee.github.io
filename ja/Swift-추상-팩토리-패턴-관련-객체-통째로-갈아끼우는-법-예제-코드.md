---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swift抽象ファクトリーパターン、関連オブジェクトを丸ごと入れ替える方法(サンプルコード)"
lang: ja
description: "アプリの画面テーマをライトからダークへ丸ごと切り替えたことはありますか?"
header:
  og_image: /assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/1-1783771760314.png
tags:
  - Swift
  - 抽象ファクトリーパターン
  - デザインパターン
  - AbstractFactory
  - iOS開発
  - Swift文法
  - ファクトリーメソッド
  - オブジェクト指向
  - プログラミング学習
  - プログラミング
permalink: /ja/Swift-추상-팩토리-패턴-관련-객체-통째로-갈아끼우는-법-예제-코드/
toc: true
toc_sticky: true
last_modified_at: 2026-07-18
---

🌐 [한국어](/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · [English](/en/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/) · **日本語** · [中文](/zh/Swift-%EC%B6%94%EC%83%81-%ED%8C%A9%ED%86%A0%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EA%B4%80%EB%A0%A8-%EA%B0%9D%EC%B2%B4-%ED%86%B5%EC%A7%B8%EB%A1%9C-%EA%B0%88%EC%95%84%EB%81%BC%EC%9A%B0%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C-%EC%BD%94%EB%93%9C/)
{: .notice--info}

アプリの画面テーマをライトからダークへ丸ごと切り替えたことはありますか?

ボタン1つ、ラベル1つの色を1つずつ入れ替えていくと、必ずどこか1つは見落としてしまいます。ボタンは黒背景なのにラベルだけ白背景のまま残る、といった問題が起きやすいんです。

こういうときにぴったりなのがSwiftの抽象ファクトリーパターンです。互いに関連するオブジェクトを1つのセットとしてまとめておき、セットごと入れ替える方法です。

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/1-1783771760314.png" alt="Swift抽象ファクトリーパターン、部品ではなく工場を丸ごと入れ替えます">
  <figcaption>Swift抽象ファクトリーパターン、部品ではなく工場を丸ごと入れ替えます</figcaption>
</figure>

この記事では、抽象ファクトリーパターンが具体的に何を解決するのか、Swiftのコードでどうやって関連オブジェクトを丸ごと切り替えるのか、そしていつ使いいつ避けるべきかまで整理していきます。

---

## 抽象ファクトリーパターンとは何か

一言で言うとこうなります。

> 互いに調和すべきオブジェクトを1つの束にまとめてくれる工場を、状況に応じて丸ごと入れ替えるパターンです。

ポイントは「一緒に使われるべきオブジェクト」という点です。ダークテーマのボタンとライトテーマの背景が混ざると困りますよね。

抽象ファクトリーは、こうした組み合わせミスを防いでくれます。

工場(ファクトリー)を1つ選べば、その工場が作り出す部品同士は自動的に調和します。ライト工場を選べばライトボタン、ライトラベル、ライト背景が出てくる、という具合です。

部品を個別に選ぶのではなく、工場を丸ごと選ぶこと。

これが抽象ファクトリーのすべてです。

---

## Swiftで関連オブジェクトを丸ごと入れ替える方法

実際のコードで見るとずっと明確になります。UIテーマを例にしてみましょう。

まず、作られる部品の規格(プロトコル)と、その部品を生み出す工場の規格を定義します。

```swift
protocol Button { func render() -> String }
protocol Label  { func render() -> String }

// 工場は調和する部品セットを丸ごと責任を持つ
protocol ThemeFactory {
    func makeButton() -> Button
    func makeLabel() -> Label
}
```

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/2.png" alt="protocolを1つ決めるところから始まりました">
  <figcaption>protocolを1つ決めるところから始まりました</figcaption>
</figure>

次に、ライトテーマ工場とダークテーマ工場をそれぞれ作ります。工場ごとに自分のテーマに合った部品だけを生み出します。

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/4-1783847732231.png" alt="工場を1つ選べば、部品は自動的にセットでついてくる">
  <figcaption>工場を1つ選べば、部品は自動的にセットでついてくる</figcaption>
</figure>

```swift
struct LightFactory: ThemeFactory {
    func makeButton() -> Button { LightButton() }
    func makeLabel() -> Label  { LightLabel() }
}
struct DarkFactory: ThemeFactory {
    func makeButton() -> Button { DarkButton() }
    func makeLabel() -> Label  { DarkLabel() }
}
```

画面を描画する側は工場を1つ受け取るだけで済みます。どの工場かは気にしません。

```swift
func buildScreen(with factory: ThemeFactory) {
    let button = factory.makeButton()
    let label  = factory.makeLabel()
    print(button.render(), label.render())
}

// テーマの切り替えは工場の1行を変えるだけでいい
buildScreen(with: DarkFactory())
```

`LightFactory()`を`DarkFactory()`に変えた瞬間、ボタンとラベルが一斉にダークへ切り替わります。

ボタンの色を直して、ラベルの色も直して、という手間がなくなるわけです。

<figure>
  <img src="/assets/images/posts/83042fcc-289b-4915-8eea-35dfb3ace490/3.png" alt="ライトからダークへ、1行変えただけなのに画面がぴたりと合いました">
  <figcaption>ライトからダークへ、1行変えただけなのに画面がぴたりと合いました</figcaption>
</figure>

---

## ファクトリーメソッドと何が違うのか

名前が似ていて混同しやすい部分なので、ここで整理しておきます。

| 区分 | ファクトリーメソッド | 抽象ファクトリー |
|------|------|------|
| 作る対象 | オブジェクト1種類 | 関連オブジェクト複数種類(セット) |
| 焦点 | 「何を作るか」 | 「調和するもの同士をまとめる」 |
| 代表例 | ボタン1つの生成 | ボタン+ラベル+背景の一式 |

簡単に言うと、ファクトリーメソッドは部品を1つ作る方法で、抽象ファクトリーはその部品を一式にまとめる方法です。

抽象ファクトリーの中でファクトリーメソッドが複数使われている、と捉えても差し支えありません。

---

## いつ使い、いつ避けるべきか

実際に使ってみると、相性がいい状況とむしろ過剰になる状況が分かれてきます。

**こんなときに向いています**

- テーマ・プラットフォーム・国ごとのように「セット単位」で変わることが明確なとき
- iOSとmacOSのようにUI部品群を丸ごと入れ替える必要があるとき
- 決済手段、データベースドライバーのように一式ごと入れ替える構造のとき

**こんなときは過剰です**

- 作るオブジェクトが1〜2種類しかないとき
- 組み合わせのルールが頻繁に変わってセット自体が不安定なとき

オブジェクトが1つしかないのに抽象ファクトリーを立てると、かえってコードが増えて読みにくくなります。

セットとしてまとめる理由がはっきりしているときに使うのがいいでしょう。

---

## よくある質問2つ

**Q. 後から部品の種類を追加するには?**

プロトコルにメソッドを追加し、すべての工場でそのメソッドを実装する必要があります。工場の数が多いと手間がかかる部分なので、部品の種類が頻繁に増えるプロジェクトなら事前に検討しておくのがいいでしょう。

**Q. SwiftUIでも使えますか?**

もちろん使えますが、SwiftUIには`Environment`や`@Observable`のような独自の注入方式がよく整っているので、テーマ程度ならそちらのほうが簡潔な場合が多いです。UIKitベースだったり、純粋なロジック層でセットの入れ替えが必要なときに抽象ファクトリーがより真価を発揮します。

---

抽象ファクトリーは結局、「バラバラに動いてはいけないものを1つの持ち手でまとめる」パターンです。

テーマ切り替えの1行だけで画面全体がぴたりと噛み合う体験を一度してみると、なぜこのパターンを使うのかすぐに実感できるはずです。小さなサンプルから、まずは自分の手で書き写してみることをお勧めします。
