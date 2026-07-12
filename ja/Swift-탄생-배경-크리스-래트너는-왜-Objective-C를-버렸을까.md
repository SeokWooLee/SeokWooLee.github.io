---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftの誕生秘話——クリス・ラトナーはなぜObjective-Cを見限ったのか"
lang: ja
description: "iOS開発を始めると、誰もが一度は気になるはずです。「Appleは使い慣れたObjective-Cがあったのに、なぜわざわざSwiftを新しく作ったんだろう?」と。"
header:
  og_image: /assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png
tags:
  - Swift
  - スウィフト
  - クリスラトナー
  - ObjectiveC
  - iOS開発
  - プログラミング言語
  - Apple開発
  - Swift誕生秘話
  - オプショナル
  - 開発学習
permalink: /ja/Swift-탄생-배경-크리스-래트너는-왜-Objective-C를-버렸을까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [English](/en/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · **日本語** · [中文](/zh/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
{: .notice--info}

iOS開発を始めると、誰もが一度は気になるはずです。「Appleは使い慣れたObjective-Cがあったのに、なぜわざわざSwiftを新しく作ったんだろう?」と。

私もSwiftで初めてアプリを作ったとき、文法がすっきりしているなと感じたのですが、その裏にどんな物語があるのか調べてみると、なかなか面白い経緯がありました。

結論から言うと、Swiftは**クリス・ラトナー(Chris Lattner)というひとりのエンジニアが2010年からほぼ単独で、しかも秘密裏に作り始めた言語**です。30年以上ほとんど変わらなかったObjective-Cの安全性の問題を、根本から作り直すためでした。

今日は、このSwiftがどのようにして世に出たのか、その背景を気軽に紐解いていきます。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="30年続いたObjective-Cを、Swiftが押しのけた理由を一枚にまとめてみました">
  <figcaption>30年続いたObjective-Cを、Swiftが押しのけた理由を一枚にまとめてみました</figcaption>
</figure>

---

## Swiftはいつ、誰が作ったのか

Swiftの開発が始まったのは**2010年7月**のことです。

主役はクリス・ラトナー。この名前にピンとこない人もいるかもしれませんが、実は開発者なら誰もがすでに彼の作品を毎日使っています。

というのも、彼は**LLVM**と**Clang**コンパイラを作った人物だからです。Appleの開発ツールの土台を支える中核技術ですね。

初期は本当にラトナーひとりだけのプロジェクトだったそうです。彼が仕事終わりや週末の時間を使って、静かに設計を練り上げていたという話はよく知られています。

2011年頃からApple内の他のエンジニアも加わり、本格的なチームプロジェクトへと発展しました。

そしてついに**2014年6月のWWDC**で世界に発表されました。当日会場にいた開発者たちが驚愕したという反応は、今も語り草になっています。誰も予想していなかった発表だったからです。

同年9月、Xcode 6とともに正式リリースされ、誰でも使えるようになりました。

---

## クリス・ラトナーはなぜObjective-Cを置き換えようとしたのか

最大の理由はただひとつです。

> Objective-Cは1980年代初頭に設計された言語で、現代的な安全機構が欠けていました。

Objective-Cは簡単に言えば「C言語にメッセージ送信の仕組みを乗せた」構造です。Cの柔軟性をそのまま受け継いでいたのですが、その柔軟性こそが危険の温床でもありました。

代表例が**nil(空値)処理**の問題です。

Objective-Cでは、nilオブジェクトにメッセージを送ってもアプリは落ちません。ただ何も起こらないだけです。

一見便利に思えますが、これが落とし穴なんです。値が存在しないために生じたバグが、静かに埋もれてしまうから。後になって思わぬところで表面化するわけです。

ラトナーはすでにLLVMやClangを作る中で、Objective-Cのメモリ安全性の問題と長年格闘していました。そしてこんな結論にたどり着いたそうです。

「既存の言語をいつまでも継ぎ接ぎするのではなく、そもそもミスができない言語を新しく作ろう」

ミスを検出するだけでなく、ミスそのものを起こせなくしてしまおうという発想でした。

---

## Swiftは何がどう変わったのか

Swiftがもたらした変化の中でも、最も象徴的なのが**オプショナル(Optional)**という概念です。

「この値は空かもしれない」ということを、文法レベルで強制的に明示させるようにしたのです。開発者が値が存在しない状況を必ず処理するように。

以下のコードを見ると、両言語の思想の違いがはっきり浮かび上がります。

まずObjective-Cは、nilでもそのまま素通りしてしまいます。

```objc
// nameがnilなら? 何も起こらずそのまま素通りしてしまう
NSString *name = [user fetchName];
NSUInteger len = [name length];  // 結果は0、バグを見逃しやすい
```

一方Swiftは、値が存在しない可能性を開発者に正面から問いかけます。

```swift
// nameはString?型 — 値が存在しない可能性を型で明示
let name: String? = user.fetchName()
if let name = name {   // 値がある場合のみ安全に使用
    print(name.count)
}
```

短いコードですが、「ミスを放置するか、ミスを未然に防ぐか」の違いがそのまま表れています。

このほかにもSwiftは、型推論、簡潔な文法、実行速度の速さまで兼ね備えており、人気を集めました。ちなみにSwiftは、Objective-Cだけでなく、Rust、Haskell、Python、Rubyなど複数の言語の良い部分を参考にして設計されたそうです。

---

## Swiftはその後どうなったのか

Swiftは発表後、急速に定着していきました。

主な流れを簡単にまとめると、こうなります。

| 時期 | 出来事 |
|------|------|
| 2010年7月 | クリス・ラトナー、開発開始 |
| 2014年6月 | WWDCで正式発表 |
| 2014年9月 | Xcode 6とともに正式リリース |
| 2015年12月 | オープンソース化(Apache 2.0) |
| 2017年1月 | ラトナー、Appleを離れテスラへ移籍 |

興味深いのは、他ならぬ言語の生みの親であるラトナーが、2017年にAppleを去っているという点です。その後、Swiftプロジェクトのリードはテッド・クレメネクが引き継ぎました。

それでもSwiftは、今なおAppleエコシステムの中心言語としてしっかりと根を張っています。オープンソース化に伴い、Linuxやサーバーサイドへも活躍の場を広げました。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="ラトナーが去った後も、Swiftは成長を続けています">
  <figcaption>ラトナーが去った後も、Swiftは成長を続けています</figcaption>
</figure>

---

ひとりのエンジニアが週末に静かに始めたプロジェクトが、10年以上にわたって世界中の開発者が使う言語になった。この事実は、私にとってとても印象深いものでした。

「なぜ?」というひとつの問いから出発した言語だからこそ、背景を知ると、Swiftの文法のひとつひとつが違って見えてくるんです。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="背景を知ってから見返すと、コード一行の読み方が変わります">
  <figcaption>背景を知ってから見返すと、コード一行の読み方が変わります</figcaption>
</figure>

Swiftを始めたばかりの方は、オプショナルさえきちんと理解すれば、この言語がなぜこう設計されたのか、感覚がつかめるはずです。今日の記事が、その最初の一歩になれば嬉しいです。

---

## 参考資料

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_%28programming_language%29)
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)
