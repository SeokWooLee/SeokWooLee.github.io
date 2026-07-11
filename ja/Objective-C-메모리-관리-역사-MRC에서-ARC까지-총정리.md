---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-Cメモリ管理の歴史:MRCからARCまで総まとめ"
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
  - コーディング学習
permalink: /ja/Objective-C-메모리-관리-역사-MRC에서-ARC까지-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **日本語** · [中文](/zh/Objective-C-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EA%B4%80%EB%A6%AC-%EC%97%AD%EC%82%AC-MRC%EC%97%90%EC%84%9C-ARC%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

iOS開発をしていると、一度は気になることがありますよね。

「昔のObjective-Cのコードには、なぜ`retain`や`release`がびっしり書かれているんだろう?」

私もSwiftから入門したあと、昔のコードを開いてかなり戸惑った記憶があります。

今日はObjective-Cのメモリ管理の歴史、つまりMRCからARCまでどう変わってきたのかをまとめてみます。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="MRCからARCまで、Objective-Cメモリ管理の流れを一目で">
  <figcaption>MRCからARCまで、Objective-Cメモリ管理の流れを一目で</figcaption>
</figure>

まず結論から言うと、こうです。

> Objective-Cのメモリ管理は「開発者が自分で数えていた時代(MRC)」から「コンパイラが代わりに数えてくれる時代(ARC)」へと移り変わりました。

途中でガベージコレクションという実験もありましたが、結局2011年にARCが登場して決着がつきました。

以下、時代ごとに一つずつ見ていきましょう。

---

## 参照カウントとは何か?メモリ管理の基本概念

本格的な歴史の話に入る前に、一つだけ概念を押さえておきます。

それが「参照カウント(reference count)」です。

オブジェクト一つひとつに「自分を掴んでいる人が何人いるか」を数える数字が付いていると考えてください。

この数字が1以上なら生きていて、0になるとメモリから解放されます。

だからオブジェクトを掴むときは数字を上げ(`retain`)、手放すときは下げる(`release`)わけです。

このシンプルなルールがObjective-Cのメモリ管理の根っこにあります。

---

## MRC時代:開発者自身が数字を数えていた頃

ARC以前、つまりMRC(Manual Retain Count)の時代には、この数字を人間が手作業で管理していました。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="retain releaseがびっしり書かれた昔のコード、私も最初は戸惑いました">
  <figcaption>retain releaseがびっしり書かれた昔のコード、私も最初は戸惑いました</figcaption>
</figure>

ルールは明確でした。よく「NARC」という語呂合わせで覚えたものです。

- **N**ew、**A**lloc、**R**etain、**C**opyで作ったオブジェクトは自分が責任を持つ
- 責任を持ったオブジェクトは使い終わったら必ず`release`する

実際のコードはこんな感じでした。

```objc
// オブジェクトを作ると参照カウントが1になります
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // カウント2
[obj release];  // カウント1
[obj release];  // カウント0 → メモリ解放
```

問題はここから起きました。

`release`を忘れるとメモリがリークし、早すぎるタイミングで解放すると既に消えたオブジェクトを触ってアプリが落ちました。

いわゆる「ゾンビオブジェクト」クラッシュです。

今掴んでいるオブジェクトのカウントがいくつか、頭の中でずっと数え続けなければならず、本当に神経を使う作業でした。

---

## autorelease:「今じゃなくて、あとでちょっとしてから手放すよ」

MRC時代には、もう一つ厄介な状況がありました。

メソッドが新しいオブジェクトを作って外に返すときです。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"こんにちは"];
    return msg; // allocしたから release しなきゃいけないけど...いつ?
}
```

ルール通りなら、allocした側が`release`すべきです。

ですがreturnする前にreleaseしてしまうと、受け取る側が使う前にオブジェクトが消えてしまいます。かといってしないとリークになります。

このジレンマを解決するために生まれた仕組みが`autorelease`です。

「今すぐじゃなくて、少しあとでreleaseしてね」と予約をかけておくものです。

autoreleaseがかかったオブジェクトは「オートリリースプール(autorelease pool)」という待機リストに載り、プールが空になるタイミング(通常はランループが一周し終わるとき)でまとめてreleaseされます。

だから受け取る側は、オブジェクトを安全に受け取って使うことができたのです。

`[NSString stringWithFormat:]`のようにallocなしですぐ受け取って使える便利なコンストラクタは、すべてこの方式で作られたオブジェクトを返していました。

ちなみにこのオートリリースプールは、ARC時代にも`@autoreleasepool`ブロックという形で生き残っています。ループ処理でメモリが急増したときに使う実戦的なツールで、この話はかなりボリュームがあるので別記事としてまとめました。

---

## ガベージコレクションはなぜ失敗したのか?

Appleもこの不便さには気づいていました。

そこで2007年、Mac OS X 10.5 Leopardで、Javaのように自動でメモリを掃除する「ガベージコレクション(GC)」を導入しました。

開発者が`retain`、`release`を書かなくて済むので、便利になりそうでした。

しかし結果は芳しくありませんでした。

GCがバックグラウンドで動くことで、予測しづらいタイミングでアプリが一瞬フリーズする問題がありました。何より、パフォーマンスとバッテリーに敏感なiPhoneには負担が大きすぎたのです。

そのため、iOSには結局導入されませんでした。

最終的にMac用のGCも、2012年のOS X 10.8から非推奨(deprecated)の道をたどることになりました。

---

## ARCの登場:コンパイラが代わりに数えてくれる

そして2011年、Appleが打ち出した解決策がARC(Automatic Reference Counting)です。

Xcode 4.2、iOS 5、OS X 10.7 Lionとともに発表されました。

ARCの発想は巧妙でした。

> 参照カウント方式自体はそのままに、`retain`・`release`を開発者ではなくコンパイラが自動で入れてくれるようにしよう。

GCのようにランタイムで別途「掃除係」が動き回るのではなく、コンパイル時に必要な箇所へ解放コードが自動的に挿入される仕組みです。

おかげでランタイムのパフォーマンス負荷はほとんどないまま、メモリ管理が自動化されました。

両時代を表で比較するとこうなります。

| 区分 | MRC | ARC |
|------|-----|-----|
| 登場時期 | 初期〜2011年 | 2011年(iOS 5) |
| retain/release | 手動で記述 | コンパイラが自動挿入 |
| autorelease | 手動で呼び出し | コンパイラが管理 |
| メモリリークのリスク | 高い | 大幅に低い |
| パフォーマンス負荷 | なし | ほぼなし |

ただし、ARCも万能ではありません。

お互いがお互いを掴み合う「循環参照」は自動では解決できないため、`weak`や`unowned`のような弱い参照で開発者自身が断ち切る必要があります。

この概念は、今私たちが使っているSwiftにもそのまま受け継がれています。

---

## よくある質問(Q&A)

**Q. 今もMRCを学ぶ必要はありますか?**

実務で新たにMRCでコードを書くことはほとんどありません。ただ、古いライブラリや面接で概念を聞かれることもあるので、原理くらいは知っておくといいでしょう。

**Q. autoreleaseはARCでも使われていますか?**

直接呼び出すことはありませんが、メカニズム自体はARCの下でも今なお動いています。だから`@autoreleasepool`ブロックは今でも有効なツールなのです。

**Q. SwiftもARCを使っていますか?**

はい、SwiftもARCベースです。だから循環参照と`weak`の概念は、Swiftでも同じくらい重要です。

---

簡単にまとめると、Objective-Cのメモリ管理は「手で数えていたMRC → 短命だったGCの実験 → コンパイラが数えてくれるARC」という流れで発展してきました。

今では当たり前に使っている自動メモリ管理も、実は数多くのクラッシュと試行錯誤の上に磨き上げられた結果なのです。

iOS開発を勉強している方にとって、この流れが小さな道しるべになれば嬉しいです。今日も楽しいコーディングを!

---

## 参考資料

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
