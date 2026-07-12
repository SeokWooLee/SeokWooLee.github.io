---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-CのnilとJavaのnullの違い、なぜ動きが異なるのか"
lang: ja
description: "iOSに初めて触れる開発者を一番戸惑わせるものがあります。"
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
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-nil/) · [English](/en/Objective-C-nil/) · **日本語** · [中文](/zh/Objective-C-nil/)
{: .notice--info}

iOSに初めて触れる開発者を一番戸惑わせるものがあります。

JavaやC++ではnil(ヌル)オブジェクトに何か処理をさせると、すぐにアプリが落ちますよね。あの有名なNullPointerExceptionです。

ところがObjective-Cはnilにメッセージを送っても静かなものです。クラッシュもエラーも起きません。

初めて見ると「これバグじゃないの?」と思ってしまいますが、実は言語がわざとそう設計されているんです。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/1-1783736148637.png" alt="Objective-Cのnilメッセージは例外の代わりに静かにやり過ごします">
  <figcaption>Objective-Cのnilメッセージは例外の代わりに静かにやり過ごします</figcaption>
</figure>

結論から言うと、Objective-Cではnilにメッセージを送ると何も起こらず、そのまま0(またはnil)を返します。

これはミスを放置しているのではなく、言語レベルで意図的に組み込まれた安全装置です。

今日はなぜこのような動きが可能なのか、そしてこれをどう受け止めればいいのかについてお話しします。

---

## nilへのメッセージ送信がなぜ落ちないのか

ポイントはObjective-Cのメッセージ送信方式にあります。

`[object doSomething]`というコードを書くと、コンパイラはこれを`objc_msgSend(object, @selector(doSomething))`という関数呼び出しに変換します。

メソッドを直接呼び出すのではなく、「このオブジェクトにこのメッセージを渡してほしい」とランタイムに依頼する構造なんです。

そしてこの`objc_msgSend`関数は、最初に受け取ったオブジェクトがnilかどうかを確認します。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/4-1783847973933.png" alt="objc_msgSendがnilを静かに飲み込む瞬間">
  <figcaption>objc_msgSendがnilを静かに飲み込む瞬間</figcaption>
</figure>

受け取ったオブジェクトがnilだった場合は?

> メソッドを探しに行かず、その場で即座に0を返して静かに終了します。

つまりnilは「メッセージを飲み込んでしまう存在」というわけです。送っても誰にも届かないので、落ちようがないんですね。

```objc
// receiverがnilの場合、メソッドを探さず即座に0を返す
NSString *name = nil;
NSUInteger len = [name length];  // クラッシュせず len == 0
```

---

## NullPointerExceptionと何が違うのか

混同しやすい部分なので、表にまとめてみました。

| 区分 | Objective-C (nil) | Java (null) |
|------|-------------------|-------------|
| nullへのメソッド呼び出し | 無視して0/nilを返す | NullPointerExceptionが発生 |
| アプリの挙動 | 落ちずに処理続行 | 例外でクラッシュ |
| 処理の主体 | ランタイム(objc_msgSend) | JVMの例外処理 |

Javaはnull参照にアクセスした瞬間、「そんなオブジェクトはない」と例外を投げます。

一方Objective-Cのランタイムは、nilを正常な値として扱います。

そのためJavaの開発者がObjective-Cに移ってくると、この違いにしばらく戸惑うことが多いようです。

戻り値も型によって少しずつ異なります。オブジェクト型ならnil、数値型なら0、構造体なら0で埋められた値が返ってきます。

---

## 落ちないことは必ずしも良いことなのか

正直に言うと、これは諸刃の剣です。

メリットは確かにあります。あちこちにnilチェックのコードを書き込まなくて済むんです。

例えば配列が空でnilが返ってきても、そこに`count`を尋ねれば単に0が返ってくるだけで、処理の流れが止まりません。

ですが、まさにこの点が落とし穴にもなります。

バグがクラッシュとして表面化せず、静かに埋もれてしまうんです。

画面にデータが表示されずしばらく悩んでいると、途中のどこかのオブジェクトがnilになっていて、メッセージがすべて無視されているケースがよくあります。

クラッシュすればすぐに見つかるはずが、静かに通り過ぎてしまうので原因の特定にかえって時間がかかります。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/2.png" alt="実際に動かしてみると本当に落ちないことがすぐ確認できます">
  <figcaption>実際に動かしてみると本当に落ちないことがすぐ確認できます</figcaption>
</figure>

ですから、nilが流れても構わない箇所なのか、それとも必ず値が必要な箇所なのかを開発者自身が見極める習慣が重要です。

---

## 実務ではどう扱えばいいのか

参考になりそうな方法をいくつか整理してみます。

1. 重要な分岐ではnilを明示的にチェックする(`if (object == nil)`)
2. nilが返る可能性のあるメソッドはコメントや命名で示しておく
3. 想定外のnilが疑われる場合は`NSAssert`で開発段階でふるいにかける

特にSwiftに移ると話がまた変わってきます。

Swiftはオプショナル(Optional)という概念で、nilになる可能性を型システムに明確に組み込んでいます。

nilになりうる値は必ず疑問符を付けて示し、アンラップして使う際にも安全な処理を強制されます。

言うなればObjective-Cの「静かにやり過ごす」やり方を、Swiftは「あらかじめ明示する」形に変えたわけです。

<figure>
  <img src="/assets/images/posts/ccb29b56-1e71-490d-bbad-54fb19a35880/3.png" alt="Swiftと並べてみると設計思想の違いが見えてきます">
  <figcaption>Swiftと並べてみると設計思想の違いが見えてきます</figcaption>
</figure>

---

Objective-Cがnilへのメッセージで落ちないのは、バグではなく思想です。

便利な反面、静かなバグも隠れてしまうので、「なぜ落ちないのか」を理解しておけば、むしろより堅実なコードが書けるようになります。

もし今iOSのコードで原因不明の空白画面に遭遇しているなら、途中でnilがこっそり通り過ぎていないか一度確認してみてください。きっと役に立つはずです。
