---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "SwiftUIにViewModelは不要?MVパターン論争総まとめ"
lang: ja
description: "iOSコミュニティで何年も続いている熱い論争があります。"
header:
  og_image: /assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png
tags:
  - SwiftUI
  - MVパターン
  - MVVM
  - ViewModel
  - Observable
  - iOS
  - アーキテクチャ
  - State
  - iOS開発
  - iOSアーキテクチャ
permalink: /ja/SwiftUI에-ViewModel이-필요-없다-MV-패턴-논쟁-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · [English](/en/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/) · **日本語** · [中文](/zh/SwiftUI%EC%97%90-ViewModel%EC%9D%B4-%ED%95%84%EC%9A%94-%EC%97%86%EB%8B%A4-MV-%ED%8C%A8%ED%84%B4-%EB%85%BC%EC%9F%81-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
{: .notice--info}

iOSコミュニティで何年も続いている熱い論争があります。

**「SwiftUIにViewModelは必要なのか?」**

前回の記事でMVVMの核心はバインディングだと整理しましたが、SwiftUIはバインディングがフレームワークに内蔵されています。そうなると「じゃあViewModelという層自体が重複しているのでは」という主張が出てくるようになりました。いわゆる**MV(Model-View)パターン**陣営です。

今回はシリーズ最終回として、この論争の両陣営の論拠を公平に並べたうえで、**実際にどんな基準で判断すればいいのか**まで整理してみます。

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/1.png" alt="SwiftUIコミュニティで何年も続くMV vs MVVM論争">
  <figcaption>SwiftUIコミュニティで何年も続くMV vs MVVM論争</figcaption>
</figure>

---

## SwiftUIのViewはすでにViewModelに似ている

UIKitでMVVMが必要だった理由を振り返ると、次のようなものでした。

- UIViewControllerが肥大化するので、状態とロジックを外に出したい
- 状態と画面を同期させるバインディングが必要

ところがSwiftUIのViewは、そもそも**状態の関数**です。`body`は状態を受け取って画面の宣言を返すだけで、`@State`の値が変わればフレームワークが勝手に再描画してくれます。バインディングのためにCombineの購読コードを書く必要がありません。

さらにSwiftUIのViewはクラスではなく**値型のstruct**です。UIViewControllerのように数千行に肥大化するライフサイクルの塊ではなく、レンダリングのたびに新しく作られる軽量な設計図に近い存在です。

MV陣営の主張はここから出発します。「肥大化するViewもなく、バインディングもタダなのに、画面ごとにViewModelクラスを作るのはUIKitの習慣を惰性で持ち込んでいるだけではないか」というわけです。

---

## MV陣営の論拠

MVパターンでは画面ごとにViewModelを置かず、Viewが状態管理のツールを直接使います。

- 一つのViewに閉じた状態は`@State`で
- 複数の画面が共有する状態は`@Observable`モデルを`@Environment`で注入して
- サーバーデータはModel層のstoreやclientが担当

```swift
struct ProfileView: View {
    @Environment(UserStore.self) private var store
    @State private var isEditing = false

    var body: some View {
        List(store.posts) { PostRow(post: $0) }
            .task { await store.loadPosts() }
    }
}
```

Appleの公式サンプルコード(Fruta、Food Truckなど)も、おおむねこの構造になっています。画面ごとのViewModelの代わりに、ドメイン単位の`@Observable`モデルを一つ、複数のViewが共有する形です。

この方式のメリットは明確です。画面ごとにクラスを一つずつ作るボイラープレートがなくなり、`@State`や`@Binding`といったフレームワークのツールを迂回せずにそのまま使えます。

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/2.png" alt="SwiftUIのViewはそもそも状態の関数です">
  <figcaption>SwiftUIのViewはそもそも状態の関数です</figcaption>
</figure>

---

## MVVM陣営の反論

反対側の論拠も負けていません。

**第一に、ロジックがViewに染み出します。**「投稿が0件で、ローディングが終わっていて、エラーがなければ案内文を表示する」といった条件が`body`の中に三項演算子で積み重なり始めると、値型であっても読みにくいことに変わりはありません。

**第二に、テストの問題です。**Viewの`body`は単体テストで実行しづらいものです。プレゼンテーションロジックがView内にあると、そのロジックもテストの死角に入ってしまいます。ViewModelに切り出しておけば純粋なSwiftオブジェクトなので、すぐに検証できます。

**第三に、規模の問題です。**画面が数十個あり、複数人で作業するアプリであれば、「状態とロジックがどこにあるか」についての一貫したルールが必要です。画面ごとにViewModelという決まった置き場所があるほうが、協業コストを下げてくれるという主張です。

---

## 名前ではなく依存関係の方向

両陣営の論拠を並べてみると、実はこの論争は「ViewModelというクラスがあるかどうか」よりも、**ロジックと状態がどこに存在するか**の問題だとわかります。判断基準をこう置けば、たいていのケースは整理できます。

- **一つのViewに閉じたUI状態**(トグル、フォーカス、シート表示の有無)は`@State`でViewに置く。これをViewModelに切り出すのは過剰設計です。
- **複数の画面が共有するドメイン状態**は`@Observable`モデルにして注入する。名前がStoreであろうとViewModelであろうと、本質は同じです。
- **画面用の加工ロジックが複雑になったら**(フォーマット、表示条件、並べ替え・フィルタ)View外のテスト可能な型に切り出す。それが実質的にViewModelです。
- どちらの場合でも**Viewがネットワークやデータベースを直接触らない**よう依存関係の方向さえ守れば、MVかMVVMかは名前の違いに近いものです。

結局、「SwiftUIにViewModelは不要」という言葉の実体は、こうまとめられます。**画面ごとに機械的にViewModelを作る必要はない。しかしView外に出すべきロジックがなくなるわけではない。**

<figure>
  <img src="/assets/images/posts/7bedf164-d196-4a13-815a-c43b2968f9f4/3.png" alt="名前ではなく依存関係の方向こそが本当の判断基準です">
  <figcaption>名前ではなく依存関係の方向こそが本当の判断基準です</figcaption>
</figure>

---

## シリーズのまとめ

3回にわたるiOSアーキテクチャシリーズを一行ずつ圧縮すると、こうなります。

- **MVC**:UIViewControllerがViewとControllerを兼ねる構造のため、責務が集中する。小さな画面には今も有効。
- **MVVM**:画面の状態をViewModelに切り出し、バインディングで同期する。バインディングがなければ片手落ち。
- **MV論争**:SwiftUIはバインディングが内蔵されているため、画面ごとにViewModelを強制する理由はない。ただしロジックの置き場所と依存関係の方向は、依然として設計する必要がある。

アーキテクチャは流行ではなく、**チームとアプリの規模に見合ったトレードオフの選択**です。反響が良ければ、VIPERやTCAといったより重量級の選択肢についても続けて取り上げていきます。
