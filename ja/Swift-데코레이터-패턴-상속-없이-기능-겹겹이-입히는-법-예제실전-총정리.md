---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftのデコレーターパターン、継承なしで機能を重ね着させる方法(実例・実践まとめ)"
lang: ja
description: "iOS開発をしていると、こんな瞬間が訪れます。基本機能はそのままに、ロギングだけ、キャッシュだけをちょっと足したいのに、それをやろうとしてクラスを継承し始めると、いつの間にか継承ツリーがぐちゃぐちゃになっている——というものです。"
header:
  og_image: /assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/1.png
tags:
  - Swift
  - デコレーターパターン
  - デザインパターン
  - iOS開発
  - スウィフト
  - オブジェクト指向
  - プロトコル指向
  - コーディング学習
  - SwiftUI
  - 開発ブログ
permalink: /ja/Swift-데코레이터-패턴-상속-없이-기능-겹겹이-입히는-법-예제실전-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-20
---

🌐 [한국어](/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **日本語** · [中文](/zh/Swift-%EB%8D%B0%EC%BD%94%EB%A0%88%EC%9D%B4%ED%84%B0-%ED%8C%A8%ED%84%B4-%EC%83%81%EC%86%8D-%EC%97%86%EC%9D%B4-%EA%B8%B0%EB%8A%A5-%EA%B2%B9%EA%B2%B9%EC%9D%B4-%EC%9E%85%ED%9E%88%EB%8A%94-%EB%B2%95-%EC%98%88%EC%A0%9C%EC%8B%A4%EC%A0%84-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

iOS開発をしていると、こんな瞬間が訪れます。基本機能はそのままに、ロギングだけ、キャッシュだけをちょっと足したいのに、それをやろうとしてクラスを継承し始めると、いつの間にか継承ツリーがぐちゃぐちゃになっている——というものです。

ネットワーククライアントに機能を一つずつ付け足していくと、いつの間にか`CachingLoggingRetryingClient`みたいな名前のクラスができあがりやすいですよね。

今日はまさにその問題を解決する**Swiftのデコレーターパターン**を整理してみます。継承なしで、機能を玉ねぎのように重ね着させる方法です。

> デコレーターパターンとは、同じプロトコルに準拠したオブジェクトで元のオブジェクトをラップし、元のコードに手を加えずに機能を一枚ずつ重ねていく手法です。

結論から言うとこうです。

1. 共通の振る舞いを先に**プロトコル**として定義する
2. デコレーターはそのプロトコルに準拠しつつ、同じプロトコル型のインスタンスを**内部に持つ**
3. 自分の仕事(ロギング・キャッシュなど)をこなし、残りは内部に持つオブジェクトに**委譲する**
4. 必要なだけラップを重ねれば機能が積み上がる

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/1.png" alt="Swiftのデコレーターパターン、継承なしでこうやって一枚ずつ重ねます">
  <figcaption>Swiftのデコレーターパターン、継承なしでこうやって一枚ずつ重ねます</figcaption>
</figure>

---

## デコレーターパターンとは何か?継承との違いは

継承は「〜の一種」を表現します。子は親のすべてを受け継ぎます。

問題は組み合わせです。ロギングされるクライアント、キャッシュされるクライアント、両方されるクライアントを継承で作ると、組み合わせの数だけクラスが増えていきます。

デコレーターは「〜をラップしたもの」を表現します。

ラップする側とラップされる側が**同じインターフェース**を共有しているため、外から見ると両者は区別できません。だから何重にラップしても、使う側のコードはそのままです。

一言でまとめると、継承はコンパイル時点で関係が固定され、デコレーターは実行中に自由に組み立てられます。

---

## Swiftのデコレーターパターン実装、コードで見る

例として、データを読み込む`DataLoader`を作ってみます。まずは全員が準拠するプロトコルです。

```swift
protocol DataLoader {
    func load(id: String) -> Data?
}

// 実際の処理を行う基本実装
struct NetworkLoader: DataLoader {
    func load(id: String) -> Data? {
        print("ネットワークから\(id)をリクエスト")
        return Data("payload-\(id)".utf8)
    }
}
```

ここまでは普通のプロトコルと実装です。

ここからが本題です。デコレーターは`DataLoader`に準拠しつつ、内部にもう一つの`DataLoader`を持ちます。

```swift
// ログを出力するデコレーター
struct LoggingLoader: DataLoader {
    let wrapped: DataLoader   // ラップ対象

    func load(id: String) -> Data? {
        print("[ログ] load開始: \(id)")
        let result = wrapped.load(id: id)  // 実際の処理は委譲
        print("[ログ] load完了: \(id)")
        return result
    }
}
```

`LoggingLoader`は自分の仕事(ログ出力)だけをこなし、実際の読み込みは`wrapped`に任せます。

この構造のおかげで、何をラップしているか気にする必要がありません。`DataLoader`でありさえすればいいのです。

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/2-1783772343669.png" alt="自分の仕事だけをこなし、残りは内側のオブジェクトに委譲する構造です" loading="lazy">
  <figcaption>自分の仕事だけをこなし、残りは内側のオブジェクトに委譲する構造です</figcaption>
</figure>

---

## 機能を何重にも重ねてみる

今度はキャッシュデコレーターをもう一つ作って、実際に重ねてみましょう。

```swift
final class CachingLoader: DataLoader {
    let wrapped: DataLoader
    private var cache: [String: Data] = [:]

    init(wrapping loader: DataLoader) { self.wrapped = loader }

    func load(id: String) -> Data? {
        if let hit = cache[id] { return hit }        // キャッシュにあればそのまま返す
        let data = wrapped.load(id: id)              // なければ委譲
        cache[id] = data
        return data
    }
}
```

ここからの組み立て部分がデコレーターパターンの真骨頂です。

```swift
let loader = LoggingLoader(
    wrapped: CachingLoader(wrapping: NetworkLoader())
)
```

内側から読めばいいだけです。ネットワークローダーをキャッシュでラップし、それをさらにロギングでラップしました。

呼び出しが入ると、ログ → キャッシュ確認 → (なければ)ネットワークの順に流れます。

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/4-1783847764924.png" alt="重ねた分だけ、呼び出しも一層ずつ下りていきます" loading="lazy">
  <figcaption>重ねた分だけ、呼び出しも一層ずつ下りていきます</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/693f4da4-c7cb-4afb-b47c-adae41cf9d3c/3.png" alt="内側からネットワーク・キャッシュ・ロギングの順に重なっている様子です" loading="lazy">
  <figcaption>内側からネットワーク・キャッシュ・ロギングの順に重なっている様子です</figcaption>
</figure>

順序を変えたければ、ラップする順番を入れ替えるだけです。`NetworkLoader`も`CachingLoader`もコード一行たりとも修正しません。

不要な機能があれば、そのレイヤーを外すだけで済みます。

---

## 継承とデコレーター、どちらをいつ使うか

どちらか一方が常に正解というわけではありません。状況別に整理してみました。

| 状況 | おすすめ |
|---|---|
| 明確な「〜の一種」という関係 | 継承 |
| 機能を自由に組み合わせ・着脱したい | デコレーター |
| 実行中に機能をオン/オフしたい | デコレーター |
| 元のコードに手を加えられない場合 | デコレーター |
| 組み合わせのパターンが多い場合 | デコレーター |

特にロギング、キャッシュ、リトライ、認証ヘッダーの追加のような**本質ではない付加機能**は、デコレーターとの相性がいいです。

逆に無理にデコレーターを使うと、ラップする層が増えてデバッグ時のコールスタックが深くなるという欠点もあります。この点は踏まえた上で使うのがいいでしょう。

---

## よくある質問2つ

**Q. structとclass、どちらを使うべきですか?**

状態(キャッシュのような保存領域)をデコレーター自身が直接持つ必要がある場合はclassが便利です。単純な委譲だけならstructでも十分です。上の例でキャッシュだけをclassにしたのはこのためです。

**Q. ラップする層が増えるとパフォーマンスに問題はありませんか?**

呼び出しが一層ずつ下りていくので、ごくわずかなオーバーヘッドはあります。ただしネットワークやディスクI/Oと比べれば無視できるレベルなので、ほとんどのアプリでは気にするほどではありません。

---

デコレーターパターンは結局、プロトコルを一つ定義して「同じプロトコルを内部に持つオブジェクト」を作り、委譲する——それだけです。

次に機能を一つ足そうとして継承ツリーをいじり回すことになったら、一枚ラップする方法を思い出してみてください。コードがずっと軽くなるはずです。今日の例をそのままPlaygroundに移してみることをおすすめします🙂
