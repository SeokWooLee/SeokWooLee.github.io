---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-CのnilとJavaのnullを比較、なぜ動作が違うのか"
lang: ja
description: "開発者としてiOSに初めて触れたとき、いちばん戸惑ったのがこれでした。"
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
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-nil/) · [English](/en/Objective-C-nil/) · **日本語** · [中文](/zh/Objective-C-nil/)
{: .notice--info}

開発者としてiOSに初めて触れたとき、いちばん戸惑ったのがこれでした。

JavaやC++ではnil(ヌル)オブジェクトに何かをさせると即座にアプリが落ちますよね。あの有名なNullPointerExceptionです。

ところがObjective-Cはnilにメッセージを送っても静かなものです。クラッシュもエラーも起きません。

最初は「これバグじゃないの?」と思いましたが、調べてみると言語がわざとそう設計していたんですね。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-Cのnilメッセージは例外の代わりに静かにスルーされます">
  <figcaption>Objective-Cのnilメッセージは例外の代わりに静かにスルーされます</figcaption>
</figure>

結論から言うと、Objective-Cでnilにメッセージを送ると何も起こらず、そのまま0(またはnil)を返すだけです。

これはミスを放置しているわけではなく、言語レベルで意図的に作られた安全装置なんです。

今日はなぜこんな動作が可能なのか、そしてこれをどう受け止めればいいのか、話してみようと思います。

---

## nilへのメッセージ送信がなぜ落ちないのか?

鍵はObjective-Cのメッセージ送信の仕組みにあります。

`[object doSomething]` とコードを書くと、コンパイラはこれを `objc_msgSend(object, @selector(doSomething))` という関数呼び出しに変換します。

メソッドを直接呼び出すのではなく、「このオブジェクトにこのメッセージを渡してくれ」とランタイムに頼む構造なんです。

ところがこの `objc_msgSend` 関数は、最初に受け取ったオブジェクトがnilかどうかをまず確認します。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/4-1783847973933.png" alt="objc_msgSendがnilを静かに飲み込むポイント">
  <figcaption>objc_msgSendがnilを静かに飲み込むポイント</figcaption>
</figure>

受け手のオブジェクトがnilだったら?

> メソッドを探しに行かず、その場ですぐに0を返して静かに終わります。

つまりnilは「メッセージを飲み込んでしまう存在」というわけです。送っても誰にも届かないので、落ちようがないんですね。

```objc
// receiverがnilならメソッドを探さず即座に0を返す
NSString *name = nil;
NSUInteger len = [name length];  // クラッシュせずlen == 0
```

---

## NullPointerExceptionと何が違うの?

混同しやすいポイントなので表にまとめてみました。

| 区分 | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| nullへのメソッド呼び出し | 無視して0/nilを返す | NullPointerExceptionが発生 |
| アプリの挙動 | 落ちずに処理を継続 | 例外でクラッシュ |
| 処理の主体 | ランタイム(objc_msgSend) | JVMの例外処理 |

Javaはnull参照にアクセスした瞬間「そんなオブジェクトはない」と例外を投げます。

一方Objective-Cのランタイムは、nilを正常な値として扱います。

なのでJava開発者がObjective-Cに来ると、この違いにしばらく戸惑うことが多いようです。

戻り値もタイプによって微妙に変わります。オブジェクト型ならnil、数値型なら0、構造体なら0で埋められた値が返ってきます。

---

## 落ちないことは無条件にいいことなのか?

正直に言うと諸刃の剣です。

メリットは確かにあります。あちこちにnilチェックのコードを埋め尽くさなくて済むんです。

例えば配列が空でnilが返ってきても、そこに`count`を尋ねればただ0が返ってくるだけなので、処理の流れが止まりません。

でもまさにこの点が落とし穴になることもあります。

バグがクラッシュとして表に出ず、静かに埋もれてしまうんです。

私も以前、データが画面に表示されなくてかなり悩んだことがありますが、調べてみると途中であるオブジェクトがnilになっていて、メッセージが全部無視されていたんですね。

クラッシュしていればすぐ見つかったはずなのに、静かにスルーされるので原因の特定にもっと時間がかかりました。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="実際に動かしてみると本当に落ちないことがすぐ確認できます">
  <figcaption>実際に動かしてみると本当に落ちないことがすぐ確認できます</figcaption>
</figure>

だからnilが流れても構わない場所なのか、それとも必ず値がなければならない場所なのかを、開発者自身が見極める習慣が大切です。

---

## 実務ではどう扱えばいいのか?

私が使っている方法をいくつかまとめてみます。

1. 重要な分岐ではnilを明示的にチェックする(`if (object == nil)`)
2. nilが返る可能性のあるメソッドはコメントや名前で示しておく
3. 想定外のnilが疑われる場合は`NSAssert`で開発段階のうちに弾いておく

特にSwiftに移ると話がまた変わってきます。

Swiftはオプショナル(Optional)という概念そのもので、nilの可能性を型システムに刻み込んでしまいます。

nilになりうる値には必ずクエスチョンマークを付けて示し、アンラップして使うときも安全に処理するよう強制されるんです。

言ってみれば、Objective-Cの「静かにスルーする」やり方を、Swiftは「あらかじめ表に出す」やり方に変えたわけですね。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Swiftと並べて見ると設計思想の違いが見えてきます">
  <figcaption>Swiftと並べて見ると設計思想の違いが見えてきます</figcaption>
</figure>

---

Objective-Cがnilへのメッセージで落ちないのは、バグではなく哲学です。

便利な分だけ静かなバグも隠れやすくなるので、「なぜ落ちないのか」を理解しておけば、むしろもっと堅牢なコードが書けるようになります。

もし今、iOSのコードで原因不明の空白画面に出くわしているなら、途中でnilがこっそり通り過ぎていないか一度確認してみてください。きっと役に立つはずです。
