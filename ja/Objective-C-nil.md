---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-CのnilとJavaのnull、なぜ動きが違うのか"
lang: ja
description: "エンジニアとして初めてiOSに触れたとき、一番戸惑ったのがこれでした。"
header:
  og_image: /assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png
categories:
  - iOS
tags:
  - ObjectiveC
  - nil
  - iOS開発
  - NullPointerException
  - objcmsgSend
  - Swiftオプショナル
  - プログラミング
  - ランタイム
  - 開発学習
  - コーディング
permalink: /ja/Objective-C-nil/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-nil/) · [English](/en/Objective-C-nil/) · **日本語** · [中文](/zh/Objective-C-nil/)
{: .notice--info}

エンジニアとして初めてiOSに触れたとき、一番戸惑ったのがこれでした。

JavaやC++では、nil(null)のオブジェクトに何かをさせようとすると即アプリが落ちますよね。あの有名なNullPointerExceptionです。

ところがObjective-Cは、nilにメッセージを送っても静かなものです。クラッシュもエラーも出ません。

最初は「これバグじゃないの?」と思ったんですが、調べてみると言語側がわざとそう設計していたんですね。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-Cのnilメッセージは例外ではなく静かに素通りします">
  <figcaption>Objective-Cのnilメッセージは例外ではなく静かに素通りします</figcaption>
</figure>

結論から言うと、Objective-Cではnilにメッセージを送ると何も起こらず、そのまま0(あるいはnil)を返します。

これはミスを放置しているわけではなく、言語レベルで意図的に組み込まれた安全装置なんです。

今日はなぜこの挙動が可能なのか、そしてこれをどう受け止めればいいのかについて話してみます。

---

## nil宛のメッセージ送信がなぜ落ちないのか

鍵はObjective-Cのメッセージ送信の仕組みにあります。

`[object doSomething]` というコードを書くと、コンパイラはこれを `objc_msgSend(object, @selector(doSomething))` という関数呼び出しに変換します。

メソッドを直接呼び出すのではなく、「このオブジェクトにこのメッセージを渡してくれ」とランタイムに依頼する構造なんです。

そしてこの `objc_msgSend` 関数は、最初に受け取ったオブジェクトがnilかどうかをまずチェックします。

受け手がnilだった場合は?

> メソッドを探しに行かず、その場で即座に0を返して静かに終わります。

つまりnilは「メッセージを飲み込んでしまう存在」というわけです。送っても届く先がないので、落ちようがないんですね。

```objc
// receiverがnilの場合、メソッドを探さずに即座に0を返す
NSString *name = nil;
NSUInteger len = [name length];  // クラッシュせずlen == 0
```

---

## NullPointerExceptionと何が違うのか

よく混乱するポイントなので、表にまとめてみました。

| 区分 | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| nullへのメソッド呼び出し | 無視して0/nilを返す | NullPointerExceptionが発生 |
| アプリの動作 | 落ちずに続行 | 例外でクラッシュ |
| 処理主体 | ランタイム(objc_msgSend) | JVMの例外処理 |

Javaはnull参照にアクセスした瞬間、「そんなオブジェクトはない」と例外を投げます。

一方Objective-Cのランタイムは、nilを正常な値として扱います。

そのためJavaエンジニアがObjective-Cに移ってくると、この違いにしばらく戸惑うことが多いようです。

返り値も型によって少しずつ変わります。オブジェクト型ならnil、数値型なら0、構造体なら0で埋められた値が返ってきます。

---

## 落ちないのは無条件にいいことなのか

正直に言うと諸刃の剣です。

メリットは明確です。nilチェックのコードをあちこちに書き散らさなくて済むんです。

例えば配列が空でnilが返っても、そこに `count` を尋ねればただ0が返ってくるだけなので、処理の流れが止まりません。

ただ、まさにこの点が落とし穴にもなります。

バグがクラッシュとして表面化せず、静かに埋もれてしまうんです。

私も以前、データが画面に表示されなくてかなり悩んだことがあるんですが、原因を辿ってみるとあるオブジェクトがnilだったせいでメッセージが全部無視されていました。

クラッシュしていればすぐ見つけられたはずなのに、静かにスルーされるせいで原因追跡にかなり時間がかかりました。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="実際に動かしてみると本当に落ちないことがすぐ確認できます">
  <figcaption>実際に動かしてみると本当に落ちないことがすぐ確認できます</figcaption>
</figure>

だからこそ、nilが流れても問題ない箇所なのか、それとも必ず値がなければならない箇所なのかを、開発者自身が見極める習慣が大事なんです。

---

## 実務ではどう扱えばいいか

私が実践している方法をいくつかまとめてみます。

1. 重要な分岐ではnilを明示的にチェックする(`if (object == nil)`)
2. nilが返る可能性のあるメソッドはコメントや命名で示しておく
3. 想定外のnilが疑われる場合は `NSAssert` で開発段階のうちに検出する

特にSwiftに移ると話がまた変わってきます。

Swiftはオプショナル(Optional)という概念で、nilの可能性を型システムに刻み込んでしまいます。

nilになりうる値には必ず疑問符を付けて明示し、アンラップして使う際も安全な処理を強制されるんです。

言うなればObjective-Cの「静かにやり過ごす」流儀を、Swiftは「あらかじめ明らかにする」流儀に変えたわけです。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Swiftと並べてみると設計思想の違いが見えてきます">
  <figcaption>Swiftと並べてみると設計思想の違いが見えてきます</figcaption>
</figure>

---

Objective-Cがnil宛のメッセージで落ちないのは、バグではなく哲学です。

便利な分、静かなバグも隠れてしまうので、「なぜ落ちないのか」を理解しておけば、むしろより堅牢なコードが書けるようになります。

もし今、iOSのコードで原因不明の空白画面に出くわしているなら、途中でnilがそっと通り抜けていないか一度確認してみてください。きっと役に立つはずです。
