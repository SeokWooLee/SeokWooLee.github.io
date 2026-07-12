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
description: "面接で「SOLID原則を説明してください」という質問、皆さん一度は聞かれたことがあると思います。"
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
last_modified_at: 2026-07-12
---

🌐 [한국어](/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · [English](/en/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/) · **日本語** · [中文](/zh/SOLID-%EB%8B%A4%EC%84%AF-%EA%B8%80%EC%9E%90-%EC%99%B8%EC%9A%B0%EC%A7%80-%EB%A7%90%EA%B3%A0-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-SRPOCPLSP/)
{: .notice--info}

面接で「SOLID原則を説明してください」という質問、皆さん一度は聞かれたことがあると思います。

ただ正直なところ、5つをすらすら暗唱できても「じゃあ自分のコードにはどう活かすの?」まで話がつながることは少ない気がします。私も長らくそうでした。

そこで今回はSOLIDを教科書的な定義ではなく、実務のワンシーンとして解きほぐしてみようと思います。ボリュームがあるので前後編に分けます。今日は前半の3文字、SRP・OCP・LSPです。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/1.png" alt="5文字のうち今日は前半の3つから">
  <figcaption>5文字のうち今日は前半の3つから</figcaption>
</figure>

SOLIDはロバート・マーティン(通称アンクル・ボブ)がまとめたオブジェクト指向設計5原則の頭文字です。

- **S**RP — 単一責任の原則
- **O**CP — オープン・クローズドの原則
- **L**SP — リスコフの置換原則
- **I**SP — インターフェース分離の原則
- **D**IP — 依存性逆転の原則

5つそれぞれ別々のことを言っているようですが、貫くメッセージは一つです。変更が起きたときに直さなければならないコードの範囲を減らそう、ということです。

---

## SRP — 単一責任の原則

教科書的な定義は「クラスはただ一つの責任だけを持つべき」ですが、アンクル・ボブ本人が後により良い表現に言い換えています。

> モジュールはただ一つのアクターに対してのみ責任を持つべきである。

ここでいうアクターとは、そのコードの変更を要求する人(部署)のことです。例えば、こんなクラスがあるとします。

```javascript
class Employee {
  calculatePay() { ... }    // 経理部が変更を要求する
  reportHours() { ... }     // 人事部が変更を要求する
  save() { ... }            // 開発部門(DBA)が変更を要求する
}
```

3つのメソッドの「持ち主」がそれぞれ違います。経理部の要求で`calculatePay`を直しているうちに共通ロジックに手を加えてしまうと、人事部のレポートが静かに狂ってしまいます。実際にこういう事故が起きると、原因究明も一苦労です。

SRPはこれを「変更を求める人が違えば、コードも分けよう」と整理してくれます。給与計算、勤務レポート、保存をそれぞれ別のクラスに分ければ、経理部の要求が人事部の機能に影響することはなくなります。

---

## OCP — オープン・クローズドの原則

定義は「拡張に対しては開いていて、修正に対しては閉じているべき」です。最初聞くと禅問答のようですが、コードで見ると明確です。

```javascript
// 決済手段が増えるたびにこの関数を修正しないといけないなら
function pay(method, amount) {
  if (method === 'card') { ... }
  else if (method === 'kakaopay') { ... }
  else if (method === 'naverpay') { ... }
  // 新しい決済手段 = 新しいelse if = 既存コードの修正
}
```

この構造では、例えば新しい決済サービスを追加するために、うまく動いていた関数を開いて手を加える必要があります。修正するたびに、既存の決済手段が壊れるリスクを背負うことになります。

```javascript
// 新しい決済手段は「追加」するだけで済む構造
const payments = {
  card: new CardPayment(),
  kakaopay: new KakaoPayment(),
  naverpay: new NaverPayment(),
  // 新サービス追加 = 新しいクラスを登録する1行だけ
};

function pay(method, amount) {
  return payments[method].process(amount);
}
```

既存のコードには触れず(修正に閉じている)、新しいクラスを追加するだけで機能が増えます(拡張に開いている)。頻繁に変わりそうな箇所にだけこの構造を敷いておくのがコツです。すべてのコードに敷いてしまうと、前回の記事で触れたYAGNI違反になってしまいます。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/4-1783848080106.png" alt="新決済サービスの追加はクラス一つ足すだけで完了">
  <figcaption>新決済サービスの追加はクラス一つ足すだけで完了</figcaption>
</figure>

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/2.png" alt="修正じゃなくて追加で対応するのがOCPです">
  <figcaption>修正じゃなくて追加で対応するのがOCPです</figcaption>
</figure>

---

## LSP — リスコフの置換原則

名前が一番いかついですが、意味はシンプルです。

> 子クラスは親クラスが使われている場所にそのまま差し込んでも、プログラムが壊れてはいけない。

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

// 長方形を期待しているコード
function test(rect) {
  rect.setWidth(5);
  rect.setHeight(4);
  console.log(rect.width * rect.height); // 20を期待するが、Squareなら16
}
```

Squareを入れた瞬間、「幅5、高さ4なら面積20」という当たり前の期待が崩れます。is-a関係が成立しているように見えても、振る舞いの約束が崩れるなら継承すべきではない、というのがLSPです。

実務でのサインはこれです。子クラスで親のメソッドをオーバーライドして例外を投げたり、空実装のままにしていたら、その継承はLSP違反である可能性が高いです。

<figure>
  <img src="/assets/images/posts/7b95a0fb-b586-4f62-b56e-4a8b31a29dfd/3.png" alt="正方形は長方形の場所には入れなかったんですよね">
  <figcaption>正方形は長方形の場所には入れなかったんですよね</figcaption>
</figure>

---

## 前編を締めくくって

今日扱った3つの原則、それぞれ一行でまとめておきます。

- **SRP** — 変更を求める人が違えば、コードも分けよう。
- **OCP** — 頻繁に変わる箇所は、修正ではなく追加で対応できるようにしよう。
- **LSP** — 子は親の約束を破ってはいけない。破らざるを得ないなら、そもそも継承が間違っている。

次回は残りの2文字、ISP(インターフェース分離)とDIP(依存性逆転)を扱います。特にDIPは最近のフレームワークがなぜこぞって依存性注入(DI)を採用しているのかにそのままつながる話なので、きっと面白いはずです。
