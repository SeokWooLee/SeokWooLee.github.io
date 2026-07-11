---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Swiftが生まれた背景、クリス・ラトナーはなぜObjective-Cを捨てたのか"
lang: ja
description: "iOS開発を始めると誰もが一度は疑問に思います。「Appleはあれだけ使い込んだObjective-Cがあるのに、なぜわざわざSwiftを新しく作ったのだろう?」と。"
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
  - Swift誕生の背景
  - オプショナル
  - 開発勉強
permalink: /ja/Swift-탄생-배경-크리스-래트너는-왜-Objective-C를-버렸을까/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · [English](/en/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/) · **日本語** · [中文](/zh/Swift-%ED%83%84%EC%83%9D-%EB%B0%B0%EA%B2%BD-%ED%81%AC%EB%A6%AC%EC%8A%A4-%EB%9E%98%ED%8A%B8%EB%84%88%EB%8A%94-%EC%99%9C-Objective-C%EB%A5%BC-%EB%B2%84%EB%A0%B8%EC%9D%84%EA%B9%8C/)
{: .notice--info}

iOS開発を始めると誰もが一度は疑問に思います。「Appleはあれだけ使い込んだObjective-Cがあるのに、なぜわざわざSwiftを新しく作ったのだろう?」と。

私もSwiftで最初のアプリを作ったとき、文法がずいぶんすっきりしているなと感じたのですが、その裏にどんな物語があるのか掘り下げてみると、なかなか面白いいきさつがありました。

結論から言うと、Swiftは**クリス・ラトナー(Chris Lattner)というひとりのエンジニアが2010年からほぼ単独で、秘密裏に作り始めた言語**です。30年以上ほとんど変わらなかったObjective-Cの安全性の問題を根本から作り直すためでした。

今日は、このSwiftがどのようにして世に出てきたのか、その背景を気軽に紐解いてみようと思います。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/1.png" alt="30年物のObjective-CをSwiftが押しのけた理由を、一枚にまとめてみました">
  <figcaption>30年物のObjective-CをSwiftが押しのけた理由を、一枚にまとめてみました</figcaption>
</figure>

---

## Swiftはいつ、誰が作ったのか?

Swiftの開発は**2010年7月**に始まりました。

主人公はクリス・ラトナー。この名前にはあまり馴染みがないかもしれませんが、実は開発者なら誰でもすでに彼の作品を毎日使っています。

ほかでもない、**LLVM**と**Clang**コンパイラを作った人物だからです。Appleの開発ツールの根底を支える中核技術ですね。

初期は本当にラトナーひとりだけのプロジェクトだったそうです。彼が仕事を終えた後や週末に時間を見つけては、静かに設計を練り上げていたという話は有名です。

2011年頃からApple社内の他のエンジニアたちが加わり、本格的なチームプロジェクトへと大きくなっていきました。

そしてついに**2014年6月のWWDC**で世に公開されました。当日会場にいた開発者たちが驚いたという反応は、今でも語り草になっています。誰も予想していなかった発表だったからです。

同年9月、Xcode 6とともに正式にリリースされ、誰もが使えるようになりました。

---

## クリス・ラトナーはなぜObjective-Cを置き換えたのか?

最大の理由はただひとつです。

> Objective-Cは1980年代初頭に設計された言語のため、現代的な安全機構が不足していました。

Objective-Cは簡単に言うと「C言語にメッセージ送信の仕組みを乗せた」構造です。Cの柔軟さをそのまま受け継いでいますが、その柔軟さがそのまま危うさでもありました。

代表的なのが**nil(空の値)処理**の問題です。

Objective-Cでは、nilオブジェクトにメッセージを送ってもアプリは落ちません。ただ何も起きないだけです。

一見便利に見えますが、これが落とし穴なのです。値がないことで生まれたバグが静かに埋もれてしまうからです。後になって思わぬところで表面化するわけです。

ラトナーはすでにLLVMとClangを作る過程で、Objective-Cのメモリ安全性と長く格闘してきました。そしてこんな結論にたどり着いたそうです。

「既存の言語をこれ以上継ぎ接ぎするのではなく、そもそもミスを犯せないようにする言語を新しく作ろう」

ミスを検出するだけでなく、そもそもミス自体を不可能にしてしまおうという発想でした。

---

## Swiftは何がどう変わったのか?

Swiftがもたらした変化の中でもっとも象徴的なのが**オプショナル(Optional)**という概念です。

「この値は空かもしれない」ということを文法レベルで強制的に明示させるようにしたのです。開発者が値のない状況を必ず処理するように、です。

以下のコードを見ると、両言語の考え方の違いがはっきりと表れます。

まずObjective-Cはnilでもそのまま素通りします。

```objc
// nameがnilなら? 何も起きずに静かに素通りしてしまう
NSString *name = [user fetchName];
NSUInteger len = [name length];  // 結果は0、バグを見逃しやすい
```

一方Swiftは、値がない可能性を開発者に真っ向から問いかけます。

```swift
// nameはString?型 — 値がない可能性があることを型が明示している
let name: String? = user.fetchName()
if let name = name {   // 値がある場合のみ安全に使用する
    print(name.count)
}
```

短いコードですが、「ミスを放置するか vs ミスを防ぐか」の違いがそのまま見て取れますね。

このほかにもSwiftは型推論、簡潔な文法、実行速度の速さまで兼ね備えて人気を得ました。ちなみにSwiftは、Objective-Cだけでなく、Rust、Haskell、Python、Rubyなど複数の言語の良い点を参考にして設計されたそうです。

---

## Swiftはその後どうなったのか?

Swiftは発表後、急速に定着していきました。

主な流れを簡単にまとめると、こうなります。

| 時期 | 出来事 |
|------|------|
| 2010年7月 | クリス・ラトナー、開発開始 |
| 2014年6月 | WWDCで正式発表 |
| 2014年9月 | Xcode 6とともに正式リリース |
| 2015年12月 | オープンソース化(Apache 2.0) |
| 2017年1月 | ラトナー、Appleを離れテスラへ移籍 |

興味深いのは、当の言語の生みの親であるラトナーが2017年にAppleを去ったという点です。その後Swiftプロジェクトのリードはテッド・クレメネックが引き継ぎました。

それでもSwiftは現在まで、Appleエコシステムの中心言語としてしっかりと定着しています。オープンソース化に伴い、Linuxやサーバーサイドにも領域を広げました。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/2-1783765666000.png" alt="ラトナーが去った後もSwiftは成長を続けています">
  <figcaption>ラトナーが去った後もSwiftは成長を続けています</figcaption>
</figure>

---

ひとりのエンジニアが週末にひっそりと始めたプロジェクトが、10年以上にわたって世界中の開発者が使う言語になったという事実には、私もとても感慨を覚えました。

「なぜ?」というひとつの問いから出発した言語だからこそ、背景を知ってからだとSwiftの文法のひとつひとつが違って見えてきます。

<figure>
  <img src="/assets/images/posts/93d03ca3-c66b-4d86-89f5-acc96fa3aff0/3.png" alt="背景を知ってから見返すと、コード一行の読み方が変わります">
  <figcaption>背景を知ってから見返すと、コード一行の読み方が変わります</figcaption>
</figure>

Swiftを始めたばかりの方も、オプショナルさえきちんと理解すれば、この言語がなぜこう設計されたのか、感覚がつかめてくるはずです。今日のこの記事が、その最初の一歩になれば嬉しいです。

---

## 参考資料

- [Swift (programming language) - Wikipedia](https://en.wikipedia.org/wiki/Swift_(programming_language))
- [Chris Lattner - Wikipedia](https://en.wikipedia.org/wiki/Chris_Lattner)
- [Apple's top secret Swift language grew from work to sustain Objective C - AppleInsider](https://appleinsider.com/articles/14/06/04/apples-top-secret-swift-language-grew-from-work-to-sustain-objective-c-which-it-now-aims-to-replace)
