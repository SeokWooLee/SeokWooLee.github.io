---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-Cのメモリ管理史:MRCからARCまで総まとめ"
lang: ja
description: "iOS開発をしていると、一度は気になることがありますよね。"
header:
  og_image: /assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png
tags:
  - ObjectiveC
  - iOS開発
  - ARC
  - メモリ管理
  - retainrelease
  - MRC
  - Apple開発者
  - プログラミング
  - Swift
  - コーディング勉強
permalink: /ja/Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-13
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **日本語** · [中文](/zh/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

iOS開発をしていると、一度は気になることがありますよね。

「昔のObjective-Cのコードには、なぜ`retain`や`release`がびっしり書かれているんだろう?」

Swiftから入門した方なら、昔のコードを開いて一度は戸惑ったことがあるかもしれません。

今日はObjective-Cのメモリ管理の歴史、つまりMRCからARCへとどう移り変わってきたのかをまとめてみます。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="MRCからARCまで、Objective-Cのメモリ管理の流れを一目で">
  <figcaption>MRCからARCまで、Objective-Cのメモリ管理の流れを一目で</figcaption>
</figure>

まず結論から言うとこうです。

> Objective-Cのメモリ管理は、「開発者が自分で数えていた時代(MRC)」から「コンパイラが代わりに数えてくれる時代(ARC)」へと移り変わってきました。

途中でガベージコレクションという実験も少しありましたが、結局2011年にARCが登場したことで流れが整理されました。

以下で時代ごとに一つずつ見ていきましょう。

---

## 参照カウントとは何か?メモリ管理の基本概念

本格的な歴史の話に入る前に、一つだけ概念を押さえておきましょう。

それが「参照カウント(reference count)」です。

オブジェクトひとつひとつに、「自分を掴んでいる相手が何人いるか」を数える数字がついている、とイメージしてください。

この数字が1以上なら生きていて、0になるとメモリから解放されます。

そのため、オブジェクトを掴むときは数字を上げ(`retain`)、手放すときは下げる(`release`)という仕組みです。

このシンプルなルールが、Objective-Cのメモリ管理の根幹になっています。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="たった一つの数字で生死が分かれる参照カウントの流れ">
  <figcaption>たった一つの数字で生死が分かれる参照カウントの流れ</figcaption>
</figure>

---

## MRC時代:開発者が自分で数を数えていた頃

ARC以前、つまりMRC(Manual Retain Count)の時代には、この数字を人の手で管理していました。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="retainとreleaseがびっしり書かれた昔のコード、思わず戸惑ってしまいますよね">
  <figcaption>retainとreleaseがびっしり書かれた昔のコード、思わず戸惑ってしまいますよね</figcaption>
</figure>

ルールは明確でした。よく「NARC」という語呂合わせで覚えたものです。

- **N**ew、**A**lloc、**R**etain、**C**opyで作ったオブジェクトは自分が責任を持つ
- 責任を持ったオブジェクトは、使い終わったら必ず`release`する

実際のコードはこんな感じでした。

```objc
// オブジェクトを作ると参照カウントは1になります
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // カウント2
[obj release];  // カウント1
[obj release];  // カウント0 → メモリ解放
```

問題はここで起きました。

`release`を忘れるとメモリが漏れ(リーク)、逆に早く解放しすぎると、すでに消えたオブジェクトを触ってアプリが落ちてしまいます。

いわゆる「ゾンビオブジェクト」クラッシュです。

今掴んでいるオブジェクトのカウントがいくつなのか、頭の中でずっと数え続けなければならないので、本当に神経を使う作業でした。

---

## autorelease:「今じゃなくて、ちょっと後で手放すよ」

MRC時代には、もう一つ厄介な状況がありました。

それは、メソッドが新しいオブジェクトを作って外に返すときです。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"こんにちは"];
    return msg; // allocしたので release すべきだが…いつ?
}
```

ルール通りなら、allocした側が`release`すべきです。

ですが、returnする前にreleaseしてしまうと、受け取る側が使う前にオブジェクトが消えてしまいます。かといってしないとリークになります。

このジレンマを解決するために出てきた仕組みが`autorelease`です。

「今すぐじゃなくて、少し後でreleaseしてね」と予約をかけておくわけです。

autoreleaseがかかったオブジェクトは「オートリリースプール(autorelease pool)」という待機リストに載せられ、プールが空になるタイミング(通常はランループが一巡し終わるとき)でまとめてreleaseされます。

そのおかげで、受け取る側は安全にオブジェクトを受け取って使うことができました。

`[NSString stringWithFormat:]`のように、allocなしでそのまま受け取って使える便利なコンストラクタは、すべてこの方式で作られたオブジェクトを返していました。

ちなみにこのオートリリースプールは、ARC時代にも`@autoreleasepool`ブロックという名前で生き残っています。ループ処理でメモリが急増したときに取り出して使う実践的な道具なので、この話はボリュームがかなりあり、別の記事としてまとめました。

---

## ガベージコレクションはなぜ失敗したのか?

Appleもこの不便さに気づいていました。

そこで2007年、Mac OS X 10.5 Leopardで、Javaのように自動でメモリを掃除してくれる「ガベージコレクション(GC)」を導入しました。

開発者が`retain`や`release`を書かなくてよくなるので、便利になりそうに見えました。

しかし結果は芳しくありませんでした。

GCがバックグラウンドで動くことで、予測しづらいタイミングでアプリが一瞬固まる問題がありました。何より、パフォーマンスとバッテリーに敏感なiPhoneには負担が大きすぎました。

そのため、iOSにはそもそも導入されませんでした。

結局、Mac向けのGCも2012年、OS X 10.8から非推奨(deprecated)の道をたどることになります。

---

## ARCの登場:コンパイラが代わりに数えてくれる

そして2011年、Appleが打ち出した解決策がARC(Automatic Reference Counting)です。

Xcode 4.2、iOS 5、OS X 10.7 Lionとともに発表されました。

ARCの発想は巧妙でした。

> 参照カウント方式そのものは維持しつつ、`retain`・`release`を開発者ではなくコンパイラが自動で挿入する。

GCのように実行時に別の掃除役が動くのではなく、コンパイル時にちょうど必要な場所へ解放コードが自動的に入る仕組みです。

おかげで実行時のパフォーマンス負担はほとんどないまま、メモリ管理は自動化されました。

2つの時代を表で比較するとこうなります。

| 区分 | MRC | ARC |
|------|-----|-----|
| 登場時期 | 初期〜2011年 | 2011年(iOS 5) |
| retain/release | 自分で記述 | コンパイラが自動挿入 |
| autorelease | 自分で呼び出す | コンパイラが管理 |
| メモリリークのリスク | 高い | 大幅に低い |
| パフォーマンス負担 | なし | ほぼなし |

ただし、ARCも万能というわけではありません。

お互いがお互いを掴み合う「循環参照」は自動では解決できないため、`weak`や`unowned`といった弱い参照を使って開発者が断ち切る必要があります。

この概念は、今私たちが使っているSwiftにもそのまま受け継がれています。

---

## よくある質問(Q&A)

**Q. 今でもMRCを学ぶ必要がありますか?**

実務で新たにMRCでコードを書くことはほとんどありません。ただ、古いライブラリや面接で概念を聞かれることもあるので、原理だけは知っておくとよいでしょう。

**Q. autoreleaseはARCでも使われていますか?**

自分で呼び出すことはありませんが、仕組み自体はARCの下でも引き続き動いています。だからこそ`@autoreleasepool`ブロックは今でも有効な道具なのです。

**Q. SwiftもARCを使っていますか?**

はい、SwiftもARCベースです。だからこそ、循環参照と`weak`の概念はSwiftでも同じように重要になります。

---

簡単にまとめると、Objective-Cのメモリ管理は「手で数えていたMRC → 一時的なGCの実験 → コンパイラが数えてくれるARC」へと進化してきました。

今では当たり前のように使っている自動メモリ管理も、実は数多くのクラッシュと試行錯誤の上に磨かれてきた結果なのです。

iOS開発を勉強されている方にとって、この流れが小さな地図になれば幸いです。今日も楽しいコーディングを!

---

## 参考資料

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
