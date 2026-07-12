---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C全史まとめ、ジョブズが愛した言語の物語(NS接頭辞の由来まで)"
lang: ja
description: "iOS開発の勉強を始めると、必ず一度は出くわす言語があります。角括弧だらけの見慣れない文法、NSStringのような謎の接頭辞。"
header:
  og_image: /assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png
categories:
  - iOS
tags:
  - ObjectiveC
  - オブジェクティブC
  - プログラミング言語
  - iOS開発
  - アップル
  - Swift
  - スティーブジョブズ
  - NS接頭辞
  - 開発勉強
  - コーディング歴史
permalink: /ja/Objective-C-역사/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EC%97%AD%EC%82%AC/) · [English](/en/Objective-C-%EC%97%AD%EC%82%AC/) · **日本語** · [中文](/zh/Objective-C-%EC%97%AD%EC%82%AC/)
{: .notice--info}

iOS開発の勉強を始めると、必ず一度は出くわす言語があります。角括弧だらけの見慣れない文法、`NSString`のような謎の接頭辞。

そう、Objective-Cです。

レガシーコードでこの言語に初めて触れると、「これは一体どこから来た文法なんだ」と思いがちです。ですが、歴史を知ると、コードの見え方が変わってきます。

まず結論から言うと、Objective-Cは1980年代初頭にC言語にSmalltalkのオブジェクト概念を乗せて作られた言語です。

そして、あの有名なNS接頭辞は、スティーブ・ジョブズが設立した会社NeXTのOS「NeXTSTEP」に由来しています。

この記事で得られる内容は以下の通りです。

1. Objective-Cが生まれた背景(C + Smalltalk)
2. NS接頭辞の由来と技術的な理由
3. iPhoneとともに迎えた全盛期
4. Swift時代になっても生き残っている理由

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/1-1783736402000.png" alt="1983年からiPhoneまで、Objective-Cの歴史が一本の線でつながっています">
  <figcaption>1983年からiPhoneまで、Objective-Cの歴史が一本の線でつながっています</figcaption>
</figure>

---

## Objective-Cはどうやって生まれたのか

1980年代初頭、Brad CoxとTom Loveという2人のエンジニアがいました。彼らが求めていたものは2つでした。

- C言語:速いがオブジェクト指向の概念がない
- Smalltalk:エレガントなオブジェクト指向言語だが遅すぎる

そこで生まれた答えがObjective-Cです。Cの上に非常に薄いオブジェクト指向レイヤーを乗せるだけで、Cそのものには一切手を加えないという原則でした。

> Objective-CはCの厳密なスーパーセット(上位集合)です。
>
> この世のあらゆるCコードは、修正なしにそのままObjective-Cコードとして通用します。

実際にどんな形なのか、短いコードでお見せします。

```objc
// ごく普通のCコード — そのままObjective-Cコードとしても有効です
int sum = 1 + 2;

// Objective-Cが乗せたもの:Smalltalk式のメッセージ送信(角括弧)
NSString *text = [NSString stringWithFormat:@"合計 %d", sum];
```

上の2行はCの文法そのままで、下の角括弧の1行だけがObjective-Cが新たに乗せた部分です。

体はCから、魂(オブジェクトモデルとメッセージ送信)はSmalltalkから来ているというわけです。角括弧の文法`[receiver message]`こそ、Smalltalkから受け継いだ遺産です。

C++とほぼ同じ時期に、同じ材料(C+オブジェクト指向)からまったく別の料理を作り上げたと考えていただければわかりやすいと思います。

---

## NS接頭辞は何の略なのか

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/2.png" alt="NS接頭辞の正体は、このNeXT時代にありました">
  <figcaption>NS接頭辞の正体は、このNeXT時代にありました</figcaption>
</figure>

1985年、スティーブ・ジョブズは自ら設立したアップルから追放されます。

そしてNeXTという会社を興すのですが、この会社のOS「NeXTSTEP」の公式開発言語がまさにObjective-Cでした。

`NSString`、`NSArray`のNSは、この**NeXTSTEPの略**なのです。2026年最新のiPhoneアプリのコードにも、1980年代末のジョブズの会社名が化石のように刻まれているわけです。

では、なぜわざわざ接頭辞を付けたのでしょうか。そこには技術的な理由があります。

- Objective-Cにはネームスペース(namespace)がない
- クラス名がグローバルに一意でなければならず、同じ名前がぶつかると衝突が起きる
- そこで会社やプロジェクトの頭文字を付ける慣習が生まれた(アップルはNS、AFNetworkingはAF)

アップルは「2文字の接頭辞はアップル用に予約されているので、サードパーティは3文字を使うように」と公式にアナウンスまでしていました。言語の穴を文化で埋めた事例と言えます。

ちなみにSwiftはモジュール単位のネームスペースが導入されたことで、この慣習が不要になりました。NSの付かない`String`、`Array`が、Swift時代を象徴する存在になった理由です。

---

## iPhoneとともに迎えた全盛期

1996年、アップルがNeXTを4億ドルで買収し、ジョブズが12年ぶりに復帰します。

NeXTSTEPはMac OS Xの骨格となり、Objective-Cはアップルの公式言語になりました。

そして2008年、App Storeがオープンします。iPhoneアプリを作れる言語は、たった一つ、Objective-Cだけでした。

世界中の開発者が押し寄せ、20年以上マイナー言語だったこの言語は、あっという間に最も熱い言語になります。

言語人気指標であるTIOBEインデックスでは、2012年と2014年の2回「今年の言語」に選ばれ、一時はCとJavaに次ぐ3位まで上り詰めました。

<figure>
  <img src="/assets/images/posts/59856350-4154-473a-abe2-acc81b32612e/3.png" alt="App Store黎明期は、みんなこの言語でアプリを作っていました">
  <figcaption>App Store黎明期は、みんなこの言語でアプリを作っていました</figcaption>
</figure>

---

## Objective-Cは今も使われているのか

2014年、アップルがSwiftを発表し、Objective-Cの時代は終わりを迎えるかに見えました。ですが、10年以上経った今もこの言語は死んでいません。理由は3つあります。

1. **アップルのシステムフレームワーク**:UIKitやFoundationのルーツは今もObjective-Cにあり、SwiftコードもブリッジングでこれらとやりとりしSaveしています。
2. **レガシーコードベース**:数百万行規模の大型アプリを一夜にして書き直すことはできないため、保守開発者の需要が根強く残っています。
3. **ランタイムの動的特性**:実行中にメソッドを差し替える手法(メソッドスウィズリング)が可能なため、分析SDKの多くが今もこのランタイムに依存しています。

**Q. 今からObjective-Cを新しく学ぶべきでしょうか?**

新規プロジェクトをこの言語で始めることはほとんどありません。ただ、iOS開発者として古いコードベースを扱うのであれば、読めるようにしておくことは大きな武器になります。

**Q. Swiftだけ知っていれば十分でしょうか?**

新規開発ならSwiftだけで十分です。ただ、NSがどこから来たのか、角括弧がなぜ生まれたのかを知っておくと、アップルのフレームワークがぐっと理解しやすくなるはずです。

---

## まとめ

Objective-Cは死んだ言語ではなく、引退を控えたベテランに近い存在です。ジョブズとともにアップルの外で育ち、ジョブズとともに戻ってきて、世界で最も高額な会社の心臓部になった言語なのですから。

古いコードで`NSString`を見かけたら、これからは温かい目で見てあげてください。あの2文字には40年の歴史が刻まれているのです。

**参考資料**
- [Wikipedia — Objective-C](https://en.wikipedia.org/wiki/Objective-C)
- [Apple Developer — Programming with Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html)
- [Wikipedia — NeXTSTEP](https://en.wikipedia.org/wiki/NeXTSTEP)
