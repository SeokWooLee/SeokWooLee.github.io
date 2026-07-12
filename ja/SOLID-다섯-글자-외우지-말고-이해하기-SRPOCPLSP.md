---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SOLIDの5文字、丸暗記じゃなくて理解する(SRP・OCP・LSP)"
lang: ja
description: "面接で「SOLID原則を説明してください」と聞かれたこと、みなさん一度はあるんじゃないでしょうか。"
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
  - 開発原則
  - クリーンコード
  - プログラミング
permalink: /ja/SOLID-다섯-글자-외우지-말고-이해하기-SRPOCPLSP/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [English](/en/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **日本語**
{: .notice--info}

面接で「SOLID原則を説明してください」と聞かれたこと、みなさん一度はあるんじゃないでしょうか。

ただ正直なところ、5つをすらすら暗唱して答えられても、「じゃあ自分のコードでどう使うの?」まで話がつながることは少ないんですよね。私もしばらくそんな感じでした。

そこで今回はSOLIDを教科書的な定義ではなく、実務のシーンで解きほぐしてみようと思います。ボリュームがあるので2回に分けます。今日は前半の3文字、SRP・OCP・LSPです。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="5文字のうち今日は前半の3つから行きます">
  <figcaption>5文字のうち今日は前半の3つから行きます</figcaption>
</figure>

SOLIDは、ロバート・マーティン(アンクル・ボブ)がまとめたオブジェクト指向設計5原則の頭文字です。

- **S**RP — 単一責任の原則
- **O**CP — 開放閉鎖の原則
- **L**SP — リスコフの置換原則
- **I**SP — インターフェース分離の原則
- **D**IP — 依存性逆転の原則

5つそれぞれ別々の話をしているように見えますが、貫くメッセージは1つです。変更が起きたときに直さなければならないコードの範囲を減らそう、ということです。

---

## SRP — 単一責任の原則

教科書的な定義は「クラスはただ1つの責任だけを持つべき」ですが、アンクル・ボブ自身が後により良い表現に言い直しています。

> モジュールはただ1つのアクターに対してのみ責任を持つべきである。

ここでいうアクターとは、そのコードの変更を要求する人(部署)のことです。例えばこんなクラスがあるとします。

```javascript
class Employee {
  calculatePay() { ... }    // 経理部が変更を要求する
  reportHours() { ... }     // 人事部が変更を要求する
  save() { ... }            // 開発部(DBA)が変更を要求する
}
```

3つのメソッドの持ち主が全部違います。経理部の要求で`calculatePay`を直しているうちに共通ロジックに触れてしまうと、人事部のレポートが静かに狂ってしまいます。実際にこういう事故が起きると、原因を突き止めるのも大変です。

SRPはこれを「変更を要求する人が違うならコードも分けろ」と整理してくれます。給与計算、勤務レポート、保存をそれぞれ別のクラスに分ければ、経理部の要求が人事部の機能に触れることはなくなります。

---

## OCP — 開放閉鎖の原則

定義は「拡張に対して開かれていて、修正に対しては閉じているべき」です。最初に聞くと禅問答みたいですが、コードで見ると明快です。

```javascript
// 決済手段が増えるたびにこの関数を修正しないといけないなら
function pay(method, amount) {
  if (method === 'card') { ... }
  else if (method === 'kakaopay') { ... }
  else if (method === 'naverpay') { ... }
  // 新しい決済手段 = 新しいelse if = 既存コードの修正
}
```

この構造では、新しい決済手段を追加するにはうまく動いていた関数を開いて修正しなければなりません。修正のたびに既存の決済手段が壊れるリスクを背負うことになるわけです。

```javascript
// 新しい決済手段を「追加」するだけで済む構造
const payments = {
  card: new CardPayment(),
  kakaopay: new KakaoPayment(),
  naverpay: new NaverPayment(),
  // 新しい決済手段の追加 = 新しいクラスを登録する一行
};

function pay(method, amount) {
  return payments[method].process(amount);
}
```

既存コードには触れず(修正に閉じている)、新しいクラスを追加するだけで機能が増えます(拡張に開かれている)。よく変わる箇所にだけこの構造を敷いておくのがコツです。すべてのコードに敷いてしまうと、前回話したYAGNI違反になってしまいます。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="修正じゃなくて追加で対応するのがOCPです">
  <figcaption>修正じゃなくて追加で対応するのがOCPです</figcaption>
</figure>

---

## LSP — リスコフの置換原則

名前が一番いかついですが、意味はシンプルです。

> 子クラスは、親クラスが使われる場所にそのまま差し込んでもプログラムが壊れてはならない。

有名な反例が長方形-正方形問題です。「正方形は長方形である」という数学的な常識どおりに継承させると、こんなことが起きます。

```javascript
class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; }  // 正方形だから
  setHeight(h) { this.width = h; this.height = h; }
}

// 長方形を期待するコード
function test(rect) {
  rect.setWidth(5);
  rect.setHeight(4);
  console.log(rect.width * rect.height); // 20を期待するがSquareなら16
}
```

Squareを渡した瞬間、「幅5、高さ4なら面積20」という当然の期待が崩れます。is-a関係が成り立っているように見えても、振る舞いの約束が崩れるなら継承してはいけない、というのがLSPです。

実務での兆候はこうです。子クラスで親のメソッドをオーバーライドして例外を投げたり、空実装にしていたりする場合、その継承はLSP違反である可能性が高いです。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="正方形は長方形の場所には入れないんですよね">
  <figcaption>正方形は長方形の場所には入れないんですよね</figcaption>
</figure>

---

## 前編を締めくくって

今日扱った3つの原則、一言ずつまとめておきます。

- **SRP** — 変更を要求する人が違うならコードも分けろ。
- **OCP** — よく変わる箇所は修正ではなく追加で対応できるようにしておけ。
- **LSP** — 子は親との約束を破るな。破らざるを得ないなら、それは継承が間違っている。

次回は残りの2文字、ISP(インターフェース分離)とDIP(依存性逆転)を扱います。特にDIPは、最近のフレームワークがなぜこぞって依存性注入を使っているのかに直結する話なので、きっと面白いはずです。
