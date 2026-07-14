---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftのオブザーバーパターン、NotificationCenterからCombineまで(実践まとめ)"
lang: ja
description: "iOSアプリを作っていると、こんな場面に必ず出くわします。A画面で何かが変わったのに、遠く離れたB画面も一緒に更新しなければならない状況です。"
header:
  og_image: /assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png
tags:
  - Swift
  - オブザーバーパターン
  - NotificationCenter
  - Combine
  - iOS開発
  - スイフト
  - リアクティブプログラミング
  - デザインパターン
  - iOSアプリ開発
permalink: /ja/Swift-옵저버-패턴-NotificationCenter부터-Combine까지-실전-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

🌐 [한국어](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/) · **日本語** · [中文](/zh/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
{: .notice--info}

iOSアプリを作っていると、こんな場面に必ず出くわします。A画面で何かが変わったのに、遠く離れたB画面も一緒に更新しなければならない状況です。

画面同士をデリゲートで無理やりつなげていくと、コードがスパゲッティのように絡まりがちです。

こんなときに使うのがオブザーバーパターンです。結論から言うと、SwiftではNotificationCenterから始めてCombineへ移行していく流れが一番自然です。

この記事では、オブザーバーパターンとは何かから、NotificationCenterの使い方、そして最近よく使われるCombineまで、実際のコードと一緒にまとめていきます。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/1.png" alt="Swiftのオブザーバーパターン、左から右へ流れていく図がこの記事のキモです">
  <figcaption>Swiftのオブザーバーパターン、左から右へ流れていく図がこの記事のキモです</figcaption>
</figure>

## オブザーバーパターンとは?

オブザーバーパターンとは、「ある対象の状態が変わったら、それを見守っているオブジェクトに自動的に知らせる」仕組みです。

YouTubeのチャンネル登録を思い浮かべるとわかりやすいです。チャンネル(発行者)が動画をアップロードすると、登録者(オブザーバー)に通知が届きますよね。

ポイントは、発行者とオブザーバーが互いを直接知らなくてもいいという点です。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/4-1783847822056.png" alt="発行者とオブザーバーはお互いを知らないまま、通知だけをやり取りします">
  <figcaption>発行者とオブザーバーはお互いを知らないまま、通知だけをやり取りします</figcaption>
</figure>

チャンネル側は登録者が何人いるか、誰なのかを気にしません。ただ「動画をアップロードした」と叫ぶだけでいいのです。

こうして緩やかにつながっていると、コード同士が絡まりにくくなり、後で修正するのもずっと楽になります。

---

## NotificationCenterの使い方は?

NotificationCenterは、Appleが標準で提供しているオブザーバーパターンのツールです。追加のライブラリなしですぐに使えます。

まず通知名を定義し、発行する側のコードです。

```swift
// 通知名を定義
extension Notification.Name {
    static let didLogin = Notification.Name("didLogin")
}

// ログイン成功時に通知を発行
NotificationCenter.default.post(name: .didLogin, object: nil)
```

受け取る側では、このようにオブザーバーを登録します。

```swift
// 通知を購読
NotificationCenter.default.addObserver(
    self, selector: #selector(handleLogin),
    name: .didLogin, object: nil
)
```

一つ注意点があります。従来の方式(addObserver + selector)は、画面が破棄されるときにremoveObserverをしないと問題が起きることがあります。

ただし、iOS 9以降では自動的に解放される部分が増えているので、ブロックベースのAPIを使う場合は戻り値のトークン管理に気をつければ大丈夫です。

---

## Combineに移行すると何がいいの?

Combineは、Appleが2019年に発表したリアクティブプログラミングフレームワークです。iOS 13から使えます。

NotificationCenterもCombineのPublisherに変換できるので、既存のコードと自然に混ぜて使えます。

```swift
// NotificationCenterをCombine方式で扱う
let token = NotificationCenter.default
    .publisher(for: .didLogin)
    .sink { _ in
        print("ログイン検知!")
    }
```

Combineの本当の強みは、データの流れをつなぎ合わせられることです。

mapやfilterといったオペレーターで値を加工したり、複数のイベントを合成したりすることも可能です。

さらに、sinkが返す購読(AnyCancellable)を変数に保持しておけば、その変数が解放されるときに購読も自動でキャンセルされます。メモリ管理がぐっと楽になるわけです。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/2.png" alt="私はこうやってコードを開きながら実際に手を動かして感覚をつかみました">
  <figcaption>私はこうやってコードを開きながら実際に手を動かして感覚をつかみました</figcaption>
</figure>

---

## では、どちらを使えばいい?

状況によります。以下の表にまとめてみました。

| 項目 | NotificationCenter | Combine |
|------|-------------------|---------|
| 登場時期 | 古くからある標準API | iOS 13+ |
| 学習難易度 | 低い | 中程度以上 |
| 値の加工 | 難しい | map/filterで自由自在 |
| メモリ管理 | 自分で気をつける | 購読を保持すれば自動 |

単純な通知が一つ二つ程度なら、NotificationCenterで十分です。

逆に、データの流れが複雑だったり、複数のイベントを組み合わせる必要がある場合は、Combineのほうがずっとすっきりします。

> 初めてなら、まずNotificationCenterで概念を身につけ、慣れてきたらCombineに移行してみてください。

もちろん最近はSwiftUIとasync/awaitが主流になっているので、新規プロジェクトならこの二つも合わせて検討することをおすすめします。

<figure>
  <img src="/assets/images/posts/60338bae-53e5-45cb-907e-58c9a798ee1c/3.png" alt="通知が一つ届いた瞬間、他の画面も一緒に更新されると、それだけで達成感がありますよね">
  <figcaption>通知が一つ届いた瞬間、他の画面も一緒に更新されると、それだけで達成感がありますよね</figcaption>
</figure>

---

## まとめ

今日はSwiftのオブザーバーパターンを、NotificationCenterからCombineまで見てきました。

最初から完璧に理解しようとせず、まずは小さな通知を一つ自分の手で作ってみることから始めてみてください。実際にコードを書いてみると、感覚がずっと早くつかめます。応援しています!
