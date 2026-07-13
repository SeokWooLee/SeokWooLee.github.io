---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID原則 実務編（下）ISP・DIP、依存性注入が存在する理由"
lang: ja
description: "前回はSOLIDの最初の3文字、SRP・OCP・LSPを扱いました。今回は残りの2文字をまとめて整理します。"
header:
  og_image: /assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png
tags:
  - SOLID原則
  - ISP
  - DIP
  - 依存性注入
  - 依存性逆転
  - インターフェース分離
  - オブジェクト指向
  - Spring
  - NestJS
  - クリーンコード
permalink: /ja/SOLID-원칙-실무편-하-ISPDIP-의존성-주입이-존재하는-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · [English](/en/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/) · **日本語** · [中文](/zh/SOLID-%EC%9B%90%EC%B9%99-%EC%8B%A4%EB%AC%B4%ED%8E%B8-%ED%95%98-ISPDIP-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%9D%B4-%EC%A1%B4%EC%9E%AC%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

前回はSOLIDの最初の3文字、SRP・OCP・LSPを扱いました。今回は残りの2文字をまとめて整理します。

ISP（インターフェース分離の原則）とDIP（依存性逆転の原則）です。

特にDIPは、SwinjectでもFactoryでも、Swiftで DI ライブラリを使っていれば必ず出会う「依存性注入（DI）」の理論的なルーツです。今回を読み終えると、あのライブラリたちがなぜあんな形をしているのかが見えてくるはずです。

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/1.png" alt="今回は後半の2文字、ISPとDIPの番です">
  <figcaption>今回は後半の2文字、ISPとDIPの番です</figcaption>
</figure>

---

## ISP：インターフェース分離の原則

まず定義から見てみましょう。

> クライアントは、自分が使わないメソッドへの依存を強制されてはならない。

言葉だけだと難しいですが、事故現場を見ればすぐに理解できます。複合機のプロトコルを一つ作ってみましょう。

```swift
protocol Machine {
    func print(_ doc: Document)
    func scan(_ doc: Document)
    func fax(_ doc: Document)
}

// 旧式プリンターは印刷しかできないのに...
class OldPrinter: Machine {
    func print(_ doc: Document) { /* 正常動作 */ }
    func scan(_ doc: Document) { fatalError("スキャンできません") }  // 無理やりの実装
    func fax(_ doc: Document) { fatalError("FAXできません") }   // 無理やりの実装
}
```

印刷しかできないプリンターに、スキャンとFAXまで実装しろと強制している状況です。結局、例外を投げるだけの偽物のメソッドができてしまいますが、これは前回見たLSP違反でもあります。太ったインターフェースは、こうして原則を二つ連鎖的に破ってしまうのです。

処方箋はシンプルです。インターフェースを役割単位に分割すること。

```swift
protocol Printer { func print(_ doc: Document) }
protocol Scanner { func scan(_ doc: Document) }
protocol Fax { func fax(_ doc: Document) }

class OldPrinter: Printer { ... }                      // 印刷専用
class MultiFunction: Printer, Scanner, Fax { ... }     // 何でもできる複合機
```

それぞれができることだけを約束します。実務では、こんな兆候として現れます。プロトコルを採用したときに「このメソッドはうちには関係ないんだけど...」と思うような空実装が出てきたら、そのプロトコルはそろそろ分割すべきタイミングです。

---

## DIP：依存性逆転の原則

名前のせいで誤解されがちな原則です。定義は2行です。

> 上位モジュールは下位モジュールに依存してはならない。両方とも抽象に依存すべきである。

> 抽象は詳細に依存してはならない。詳細が抽象に依存すべきである。

コードで見てみましょう。注文サービスがメール送信ライブラリを直接使っている状況です。

```swift
// 上位モジュール（ビジネスロジック）が下位モジュール（実装の詳細）に直接依存
import SendGrid

class OrderService {
    private let mailer = SendGridClient(apiKey: apiKey)

    func completeOrder(_ order: Order) {
        // 注文処理...
        mailer.send(to: order.email, message: "注文完了")  // SendGridに縛られる
    }
}
```

この構造の問題は2つあります。SendGridを別のサービスに切り替えるにはビジネスロジックを開かなければならず、テストのたびに本物のメールが飛んでしまいます。

DIPを適用すると、矢印の方向が変わります。

```swift
// 抽象は上位モジュール（注文ドメイン）が定義する
protocol NotificationSender {
    func send(to: String, message: String) async throws
}

class OrderService {
    private let sender: NotificationSender

    init(sender: NotificationSender) {  // 抽象にのみ依存
        self.sender = sender
    }

    func completeOrder(_ order: Order) async throws {
        try await sender.send(to: order.email, message: "注文完了")
    }
}

// 詳細（SendGrid）が抽象に従う
class SendGridSender: NotificationSender { ... }
class SlackSender: NotificationSender { ... }
class FakeSender: NotificationSender { ... }  // テスト用
```

もともと「注文サービス → SendGrid」に向かっていた依存関係が、今度は「注文サービス → プロトコル ← SendGrid」になりました。詳細のほうがドメインに向かって頭を下げる格好になるので「逆転」と呼ばれます。

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/4-1783847948960.png" alt="矢印の向きがひっくり返る瞬間、それがDIPのすべてです">
  <figcaption>矢印の向きがひっくり返る瞬間、それがDIPのすべてです</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/2.png" alt="矢印の向きが変わることこそが「逆転」の正体です">
  <figcaption>矢印の向きが変わることこそが「逆転」の正体です</figcaption>
</figure>

---

## だからDIフレームワークがあるのです

ここで自然な疑問が湧きます。「では`SendGridSender()`は誰が作ってくれるのでしょうか？」

この組み立てを代わりにやってくれるのが、まさに依存性注入（DI）コンテナです。Swift界隈のSwinjectやFactoryといったDIライブラリがやっていることは、まさにこれです。クラス群はプロトコルだけを見ていればよく、実際の実装を差し込む作業はライブラリが担当してくれるわけです。

DIPは原則（方向）であり、DIはそれを実現する手法（道具）です。この区別さえ押さえておけば、面接での回答が一段階レベルアップします。

<figure>
  <img src="/assets/images/posts/6d8f2c8e-6a69-4df6-a991-c232fcf9500a/3.png" alt="実装は差し替え自由、組み立てはフレームワークの仕事です">
  <figcaption>実装は差し替え自由、組み立てはフレームワークの仕事です</figcaption>
</figure>

---

## SOLID全体のまとめ

2回にわたったSOLIDを、5行に圧縮するとこうなります。

| 原則 | 一言まとめ |
|------|-----------|
| SRP | 変更を求める人が違うなら、コードも分離せよ |
| OCP | 頻繁に変わる部分は修正ではなく追加で対応せよ |
| LSP | 子は親との約束を破るな |
| ISP | 使いもしないメソッドの実装を強制するな |
| DIP | ビジネスロジックを詳細にぶら下げるな |

5つすべてが、結局は一つの方向を指しています。変更の波及範囲を減らせ、ということです。

ただし、この原則をすべてのコードに機械的に適用すると、逆にKISSやYAGNIを破ることになります。原則は、変更が実際に頻繁に起こる場所を選んで使う道具です。このバランス感覚こそが本当の実力だと思います。
