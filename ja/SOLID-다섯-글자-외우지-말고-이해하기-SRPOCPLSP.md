---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLID、丸暗記せずに理解する(SRP・OCP・LSP)"
lang: ja
description: "面接で「SOLID原則を説明してください」と聞かれた経験、誰しも一度はあるかと思います。"
header:
  og_image: /assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png
tags:
  - SOLID原則
  - SRP
  - OCP
  - LSP
  - オブジェクト指向
  - 単一責任の原則
  - リスコフの置換原則
  - 設計原則
  - クリーンコード
  - プログラミング
permalink: /ja/SOLID-다섯-글자-외우지-말고-이해하기-SRPOCPLSP/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [English](/en/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **日本語** · [中文](/zh/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/)
{: .notice--info}

面接で「SOLID原則を説明してください」と聞かれた経験、誰しも一度はあるかと思います。

ただ正直なところ、5つをすらすら暗唱できても、「じゃあ自分のコードにどう使うの?」まで答えられるケースは意外と少ないものです。

そこで今回は、SOLIDを教科書的な定義としてではなく、実務のシーンに落とし込んで解説していきます。分量が多いので2回に分けてお届けします。今日は最初の3文字、SRP・OCP・LSPです。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="5文字のうち、今日は最初の3つから">
  <figcaption>5文字のうち、今日は最初の3つから</figcaption>
</figure>

SOLIDは、ロバート・マーティン(通称アンクル・ボブ)がまとめたオブジェクト指向設計の5原則の頭文字です。

- **S**RP — 単一責任の原則
- **O**CP — オープン・クローズドの原則
- **L**SP — リスコフの置換原則
- **I**SP — インターフェース分離の原則
- **D**IP — 依存性逆転の原則

5つそれぞれ別々のことを言っているように見えますが、貫くメッセージは1つです。変更が起きたときに、直すべきコードの範囲を最小限に抑えようということです。

---

## SRP — 単一責任の原則

教科書的な定義は「クラスはたった1つの責任だけを持つべき」ですが、アンクル・ボブ自身が後により良い表現に言い換えています。

> モジュールは、たった1つのアクターに対してのみ責任を負うべきである。

ここでいうアクターとは、そのコードの変更を要求する人(部署)のことです。例えば、こんなクラスがあるとします。

```swift
class Employee {
    func calculatePay() { ... }   // 経理部門から変更依頼
    func reportHours() { ... }    // 人事部門から変更依頼
    func save() { ... }           // 開発部門(DBA)から変更依頼
}
```

3つのメソッドの「持ち主」がそれぞれ異なります。経理部門の要望で`calculatePay`を修正している最中に共通ロジックに触れてしまうと、人事部門のレポートが静かに壊れてしまいます。実際にこうした事故が起きると、原因を突き止めるのも一苦労です。

SRPはこれを「変更を要求する人が違うなら、コードも分けるべき」と整理してくれます。給与計算、勤務レポート、保存処理をそれぞれ別クラスに分ければ、経理部門の要望が人事部門の機能に影響することはなくなります。

---

## OCP — オープン・クローズドの原則

定義は「拡張に対しては開いていて、修正に対しては閉じているべき」というものです。初めて聞くと禅問答のようですが、コードで見れば一目瞭然です。

```swift
// 決済手段が増えるたびにこの関数を修正しなければならないなら
func pay(method: String, amount: Int) {
    if method == "card" { ... }
    else if method == "kakaopay" { ... }
    else if method == "naverpay" { ... }
    // 新しい決済手段 = 新しいelse if = 既存コードの修正
}
```

この構造では、新しい決済手段を追加するために、うまく動いていた関数を開いて修正しなければなりません。修正のたびに、既存の決済手段が壊れるリスクを背負うことになります。

```swift
// 新しい決済手段は「追加」するだけで済む構造
let payments: [String: Payment] = [
    "card": CardPayment(),
    "kakaopay": KakaoPayment(),
    "naverpay": NaverPayment(),
    // 新しい決済手段の追加 = 新しいクラスを登録する一行だけ
]

func pay(method: String, amount: Int) {
    payments[method]?.process(amount: amount)
}
```

既存コードには触れず(修正に対して閉じている)、新しいクラスを追加するだけで機能が増えます(拡張に対して開いている)。頻繁に変わる箇所にだけこの構造を敷くのがコツです。すべてのコードに適用してしまうと、前回触れたYAGNI違反になってしまいます。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="新しい決済手段の追加は、クラスを1つ乗せるだけで完了">
  <figcaption>新しい決済手段の追加は、クラスを1つ乗せるだけで完了</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="修正ではなく追加で対応するのがOCPです">
  <figcaption>修正ではなく追加で対応するのがOCPです</figcaption>
</figure>

---

## LSP — リスコフの置換原則

名前は一番いかつく見えますが、意味はシンプルです。

> 子クラスは、親クラスが使われている場所にそのまま入れてもプログラムが壊れてはいけない。

有名な反例が長方形-正方形問題です。「正方形は長方形である」という数学の常識どおりに継承させると、こんなことが起きます。

```swift
class Rectangle {
    var width = 0
    var height = 0
    func setWidth(_ w: Int) { width = w }
    func setHeight(_ h: Int) { height = h }
}

class Square: Rectangle {
    override func setWidth(_ w: Int) { width = w; height = w }  // 正方形だから
    override func setHeight(_ h: Int) { width = h; height = h }
}

// 長方形を期待しているコード
func test(_ rect: Rectangle) {
    rect.setWidth(5)
    rect.setHeight(4)
    print(rect.width * rect.height) // 20を期待するが、Squareなら16になる
}
```

Squareを渡した瞬間、「幅5、高さ4なら面積20」という当たり前の期待が崩れます。is-a関係が成立しているように見えても、振る舞いの約束が破られるなら継承すべきではない、というのがLSPです。

実務でのサインはこうです。子クラスで親のメソッドをオーバーライドして例外を投げたり、空実装のままにしていたりするなら、その継承はLSP違反の可能性が高いです。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="正方形は長方形の代わりにはなれないんですよね">
  <figcaption>正方形は長方形の代わりにはなれないんですよね</figcaption>
</figure>

---

## 前編を締めくくって

今日扱った3つの原則、それぞれ一言でまとめます。

- **SRP** — 変更を要求する人が違うなら、コードも分けよう。
- **OCP** — 頻繁に変わる箇所は、修正ではなく追加で対応できる構造にしよう。
- **LSP** — 子は親の約束を破ってはいけない。破らざるを得ないなら、その継承自体が間違っている。

次回は残りの2文字、ISP(インターフェース分離)とDIP(依存性逆転)を扱います。特にDIPは、最近のフレームワークがなぜこぞって依存性注入(DI)を使っているのかに直結する話なので、きっと面白いはずです。
