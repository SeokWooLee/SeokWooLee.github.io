---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-Cの歴史を総まとめ、ジョブズが愛した言語の物語(NS接頭辞の由来まで)"
lang: ja
description: "iOS開発の勉強を始めると、必ず一度は出会う言語があります。角括弧だらけの見慣れない文法、NSStringのような謎の接頭辞。"
header:
  og_image: /assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png
categories:
  - iOS
tags:
  - Objective-C
  - オブジェクティブC
  - プログラミング言語
  - iOS開発
  - Apple
  - Swift
  - スティーブ・ジョブズ
  - NS接頭辞
  - 開発勉強
  - プログラミング歴史
permalink: /ja/Objective-C-역사/
toc: true
toc_sticky: true
last_modified_at: 2026-07-11
---

🌐 [한국어](/Objective-C-%EC%97%AD%EC%82%AC/) · [English](/en/Objective-C-%EC%97%AD%EC%82%AC/) · **日本語** · [中文](/zh/Objective-C-%EC%97%AD%EC%82%AC/)
{: .notice--info}

iOS開発の勉強を始めると、必ず一度は出会う言語があります。角括弧だらけの見慣れない文法、`NSString`のような謎の接頭辞。

そう、Objective-Cです。

私も最初にレガシーコードでこの言語に出会ったとき、「これ、一体どこから来た文法なんだ?」と思ったんですよね。でも歴史を知ってからは、コードの見え方が変わりました。

まず結論から言うと、Objective-Cは1980年代初頭にC言語にSmalltalkのオブジェクト概念を乗せて作られた言語です。

そしてあの有名なNS接頭辞は、スティーブ・ジョブズが設立した会社NeXTのOS「NeXTSTEP」に由来します。

この記事で得られる内容は以下の通りです。

1. Objective-Cが生まれた背景(C + Smalltalk)
2. NS接頭辞の由来と技術的な理由
3. iPhoneとともに訪れた全盛期
4. Swift時代になっても生き残っている理由

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="1983年からiPhoneまで、Objective-Cの歴史が一本の線でつながっています">
  <figcaption>1983年からiPhoneまで、Objective-Cの歴史が一本の線でつながっています</figcaption>
</figure>

---

## Objective-Cはどうやって生まれたのでしょうか?

1980年代初頭、Brad CoxとTom Loveという2人のエンジニアがいました。彼らが求めていたものは2つです。

- C言語:高速だがオブジェクト指向の概念がない
- Smalltalk:エレガントなオブジェクト指向言語だが遅すぎる

そこで生まれた答えがObjective-Cです。Cの上に非常に薄いオブジェクト指向レイヤーを重ねつつ、Cには一切手を加えないという原則でした。

> Objective-CはCの厳密なスーパーセット(上位集合)です。
>
> 世の中のすべてのCコードは、修正なしにそのままObjective-Cコードとして通用します。

実際にどんな見た目なのか、短いコードでお見せします。

```objc
// ごく普通のCコード — そのままObjective-Cコードとしても有効です
int sum = 1 + 2;

// Objective-Cが乗せたもの:Smalltalk式のメッセージ送信(角括弧)
NSString *text = [NSString stringWithFormat:@"合計 %d", sum];
```

上の2行はCの文法そのままで、下の角括弧の1行だけがObjective-Cが新たに乗せたすべてです。

体はCから、魂(オブジェクトモデルとメッセージ送信)はSmalltalkから来たというわけです。角括弧の文法`[receiver message]`こそ、Smalltalkから受け継いだ遺産です。

C++とほぼ同時期に、同じ材料(C+オブジェクト指向)からまったく違う料理を作り上げた、と考えていただければと思います。

---

## NS接頭辞はどういう意味なのでしょうか?

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="NS接頭辞の正体は、このNeXT時代にありました">
  <figcaption>NS接頭辞の正体は、このNeXT時代にありました</figcaption>
</figure>

1985年、スティーブ・ジョブズは自ら創業したApple社を追放されます。

そしてNeXTという会社を設立するのですが、この会社のOS「NeXTSTEP」の公式開発言語こそがObjective-Cでした。

`NSString`や`NSArray`のNSは、まさにこの**NeXTSTEPの略**なのです。2026年最新のiPhoneアプリのコードにも、1980年代末のジョブズの会社名が化石のように埋め込まれているわけです。

ではなぜわざわざ接頭辞をつけたのでしょうか。そこには技術的な理由があります。

- Objective-Cにはネームスペース(namespace)がない
- クラス名がグローバルに一意でなければならず、同じ名前がぶつかると衝突する
- そのため会社名やプロジェクト名の頭文字をつける慣習が生まれた(AppleはNS、AFNetworkingはAF)

Appleは「2文字接頭辞はApple予約、サードパーティは3文字を使うこと」と公式に案内までしていました。言語の穴を文化で埋めた事例と言えます。

ちなみにSwiftはモジュール単位のネームスペースができたことで、この慣習が不要になりました。NSのない`String`や`Array`が、Swift時代の象徴になった理由です。

---

## iPhoneとともに訪れた全盛期

1996年、AppleがNeXTを4億ドルで買収し、ジョブズが12年ぶりに復帰します。

NeXTSTEPはMac OS Xの骨格となり、Objective-CはApple公式の言語になります。

そして2008年にApp Storeが開かれました。iPhoneアプリを作れる言語はたった1つ、Objective-Cだけでした。

世界中の開発者が押し寄せたことで、20年以上マイナー言語だったこの言語は、一気に最も熱い言語になります。

言語人気指標であるTIOBEインデックスでは、2012年と2014年の2回「今年の言語」に選ばれ、一時はCとJavaに次ぐ3位まで上り詰めました。

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="App Store黎明期は、みんなこの言語でアプリを作っていました">
  <figcaption>App Store黎明期は、みんなこの言語でアプリを作っていました</figcaption>
</figure>

---

## Objective-Cは今でも使われているのでしょうか?

2014年、AppleがSwiftを発表したことで、Objective-Cの時代は終わりを迎えるかに見えました。しかし10年以上経った今も、この言語は死んではいません。理由は3つあります。

1. **Appleのシステムフレームワーク**:UIKit、Foundationの土台は今もObjective-Cのままで、Swiftのコードもブリッジングを通してこれらとやり取りしています。
2. **レガシーコードベース**:数百万行規模の大型アプリを一晩で書き直すことはできないため、保守を担う開発者の需要は根強く続いています。
3. **ランタイムの動的な特性**:実行中にメソッドを差し替える手法(メソッドスウィズリング)が可能なため、解析系SDKは今もこのランタイムに依存しています。

**Q. 今からObjective-Cを新しく学ぶべきでしょうか?**

新規プロジェクトをこの言語で始めることはほとんどありません。ただ、iOS開発者として古いコードベースを扱うのであれば、読めるというだけでも大きな武器になります。

**Q. Swiftだけ知っていれば十分でしょうか?**

新規開発ならSwiftで十分です。ただ、NSがどこから来たのか、角括弧がなぜ生まれたのかを知っていれば、Appleのフレームワークがぐっと理解しやすくなるはずです。

---

## まとめ

Objective-Cは死んだ言語ではなく、引退を控えたベテランに近い存在です。ジョブズとともにApple社外で育ち、ジョブズとともに戻ってきて世界で最も価値のある会社の心臓部になった言語なのですから。

古いコードで`NSString`に出会ったら、これからは温かい目で見てあげてください。あの2文字には40年の歴史が刻まれているのです。

**参考資料**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)
