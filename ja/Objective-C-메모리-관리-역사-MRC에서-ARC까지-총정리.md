---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "Objective-C メモリ管理の歴史：MRCからARCまで総まとめ"
lang: ja
description: "iOS開発をしていると、一度は気になることがあります。"
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

iOS開発をしていると、一度は気になることがあります。

「昔のObjective-Cコードには、なぜ`retain`や`release`がぎっしり書かれているんだろう?」

Swiftから開発を始めた方なら、昔のコードを開いて一度は戸惑った経験があるかもしれませんね。

今日はObjective-Cのメモリ管理の歴史、つまりMRCからARCまでどう流れてきたのかをまとめてみます。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/1.png" alt="MRCからARCまで、Objective-Cメモリ管理の流れを一目で">
  <figcaption>MRCからARCまで、Objective-Cメモリ管理の流れを一目で</figcaption>
</figure>

まず結論から言うとこうです。

> Objective-Cのメモリ管理は、「開発者が自分でカウントしていた時代(MRC)」から「コンパイラが代わりにカウントしてくれる時代(ARC)」へと移り変わりました。

途中でガベージコレクションという実験も少しありましたが、結局2011年にARCが登場し、流れが定まりました。

以下で時代ごとに一つずつ見ていきましょう。

---

## 参照カウントとは何か? メモリ管理の基本概念

本格的な歴史の話に入る前に、ひとつだけ概念を押さえておきます。

それが「参照カウント(reference count)」です。

オブジェクト一つひとつに「自分を掴んでいる人が何人いるか」を数える数字が付いていると考えてください。

この数字が1以上なら生きていて、0になるとメモリから解放されます。

そのため、オブジェクトを掴むときは数字を上げ(`retain`)、手放すときは下げる(`release`)という仕組みです。

このシンプルなルールが、Objective-Cのメモリ管理の根幹にあります。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/3-1783847918895.png" alt="数字ひとつで生死が分かれる参照カウントの流れ">
  <figcaption>数字ひとつで生死が分かれる参照カウントの流れ</figcaption>
</figure>

---

## MRC時代:開発者が自分で数を数えていた頃

ARC以前、つまりMRC(Manual Retain Count)時代には、この数字を人の手で管理していました。

<figure>
  <img src="/assets/images/posts/caa8bc4a-df68-42c5-948e-211873162c9a/2.png" alt="retain releaseがぎっしり書かれた昔のコード、初めて見ると戸惑いますよね">
  <figcaption>retain releaseがぎっしり書かれた昔のコード、初めて見ると戸惑いますよね</figcaption>
</figure>

ルールは明確でした。よく「NARC」という語呂合わせで覚えられていましたね。

- **N**ew、**A**lloc、**R**etain、**C**opyで作ったオブジェクトは自分が責任を持つ
- 責任を持ったオブジェクトは、使い終わったら必ず`release`する

実際のコードはこんな感じでした。

```objc
// オブジェクトを作ると参照カウントが1になります
NSObject *obj = [[NSObject alloc] init];
[obj retain];   // カウント2
[obj release];  // カウント1
[obj release];  // カウント0 → メモリ解放
```

問題はここで発生しました。

`release`を忘れるとメモリがリークし、早く解放しすぎるとすでに消えたオブジェクトに触ってアプリがクラッシュしていました。

いわゆる「ゾンビオブジェクト」クラッシュです。

今掴んでいるオブジェクトのカウントがいくつなのか、頭の中で常に数え続けなければならず、本当に神経を使う作業でした。

---

## autorelease:「今じゃなくて、あとで手放すよ」

MRC時代には、もうひとつ厄介な状況がありました。

それは、メソッドが新しいオブジェクトを作って外に返すときです。

```objc
- (NSString *)greeting {
    NSString *msg = [[NSString alloc] initWithString:@"こんにちは"];
    return msg; // 自分がallocしたのでreleaseすべきだけど…いつ?
}
```

ルール通りなら、allocした側が`release`すべきです。

しかしreturnする前にreleaseしてしまうと、受け取る側が使う前にオブジェクトが消えてしまいます。かといってしないとリークになります。

このジレンマを解決するために生まれた仕組みが`autorelease`です。

「今すぐじゃなくて、少しあとでreleaseしてね」と予約しておくわけです。

autoreleaseされたオブジェクトは「オートリリースプール(autorelease pool)」という待機リストに登録され、プールが空になるタイミング(通常はランループが一周し終わるとき)にまとめてreleaseされます。

そのおかげで、受け取る側は安全にオブジェクトを受け取って使うことができました。

`[NSString stringWithFormat:]`のようにallocなしですぐ受け取って使える便利なコンストラクタは、すべてこの方式で作られたオブジェクトを返していました。

ちなみにこのオートリリースプールはARC時代にも`@autoreleasepool`ブロックという名前で生き残っていますが、ループ処理でメモリが急増するときに使う実践的なツールなので、この話はボリュームがかなりあるため別記事でまとめました。

---

## ガベージコレクションはなぜ失敗したのか?

Appleもこの不便さを分かっていました。

そこで2007年、Mac OS X 10.5 Leopardで、Javaのように自動でメモリを掃除する「ガベージコレクション(GC)」を導入しました。

開発者が`retain`、`release`を書かなくて済むので、便利になりそうでした。

しかし結果は芳しくありませんでした。

GCがバックグラウンドで動作し、予測しにくいタイミングでアプリが一瞬固まる問題がありました。何より、パフォーマンスとバッテリーに敏感なiPhoneには負担が大きすぎました。

そのため、iOSにはそもそも導入されませんでした。

結局、Mac向けのGCも2012年、OS X 10.8から非推奨(deprecated)の道を歩むことになります。

---

## ARCの登場:コンパイラが代わりにカウントする

そして2011年、Appleが打ち出した解決策がARC(Automatic Reference Counting)です。

Xcode 4.2とiOS 5、OS X 10.7 Lionと共に発表されました。

ARCの発想は巧妙でした。

> 参照カウント方式はそのままに、`retain`・`release`を開発者ではなくコンパイラが自動で挿入する。

GCのようにランタイムで別途クリーナーが動くのではなく、コンパイル時点で必要な箇所にきっちり解放コードが自動で入る方式です。

おかげでランタイムのパフォーマンス負担がほとんどないまま、メモリ管理が自動化されました。

二つの時代を表で比較すると、こうまとめられます。

| 区分 | MRC | ARC |
|------|-----|-----|
| 登場時期 | 初期〜2011年 | 2011年(iOS 5) |
| retain/release | 自分で記述 | コンパイラが自動挿入 |
| autorelease | 自分で呼び出し | コンパイラが管理 |
| メモリリークのリスク | 高い | 大幅に低い |
| パフォーマンス負担 | なし | ほぼなし |

ただし、ARCも万能ではありません。

お互いがお互いを掴み合う「循環参照」は自動では解決できないため、`weak`や`unowned`といった弱い参照を使って開発者自身が断ち切る必要があります。

この概念は、今私たちが使っているSwiftにもそのまま受け継がれています。

---

## よくある質問(Q&A)

**Q. 今でもMRCを学ぶ必要はありますか?**

実務で新たにMRCでコードを書くことはほとんどありません。ただ、古いライブラリや面接で概念を聞かれることがあるので、原理くらいは知っておくとよいでしょう。

**Q. autoreleaseはARCでも使われていますか?**

直接呼び出すことはありませんが、メカニズム自体はARCの下でも今なお動いています。だからこそ`@autoreleasepool`ブロックは今でも有効なツールなのです。

**Q. SwiftもARCを使っていますか?**

はい、SwiftもARCベースです。そのため循環参照や`weak`の概念は、Swiftでも同じように重要です。

---

簡単にまとめると、Objective-Cのメモリ管理は「手で数えていたMRC → 短いGCの実験 → コンパイラが数えてくれるARC」へと発展してきました。

今では当たり前に使っている自動メモリ管理も、実は数多くのクラッシュと試行錯誤の上に磨き上げられた結果なのです。

iOS開発を勉強している方々にとって、この流れが小さな地図になれば幸いです。今日も楽しいコーディングを!

---

## 参考資料

- [Transitioning to ARC Release Notes (Apple Developer)](https://developer.apple.com/library/archive/releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html)
- [About Memory Management (Apple Developer)](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html)
