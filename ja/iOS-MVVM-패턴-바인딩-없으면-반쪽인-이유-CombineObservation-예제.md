---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "iOS MVVMパターン、バインディングがなければ片手落ちな理由(Combine・Observationの例)"
lang: ja
description: "前回の記事では、Massive View Controllerが生まれる理由を扱いました。ビューコントローラがViewとControllerを兼ねてしまうせいで、行き場のないコードが全部そこに集まってしまう、という話でしたね。"
header:
  og_image: /assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/1.png
tags:
  - iOS
  - MVVM
  - アーキテクチャ
  - ViewModel
  - Combine
  - SwiftUI
  - Observation
  - バインディング
  - iOS開発
  - iOSアーキテクチャ
permalink: /ja/iOS-MVVM-패턴-바인딩-없으면-반쪽인-이유-CombineObservation-예제/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/) · [English](/en/iOS-MVVM-%ED%8C%A8%ED%84%B4-%EB%B0%94%EC%9D%B8%EB%94%A9-%EC%97%86%EC%9C%BC%EB%A9%B4-%EB%B0%98%EC%AA%BD%EC%9D%B8-%EC%9D%B4%EC%9C%A0-CombineObservation-%EC%98%88%EC%A0%9C/) · **日本語**
{: .notice--info}

前回の記事では、Massive View Controllerが生まれる理由を扱いました。ビューコントローラがViewとControllerを兼ねてしまうせいで、行き場のないコードが全部そこに集まってしまう、という話でしたね。

その解決策として最も広く使われているのが**MVVM(Model-View-ViewModel)**です。ところが、MVVMを導入したというコードを開いてみると、意外とこういうケースが多いんです。名前だけViewModelのクラスがあって、ビューコントローラが相変わらず値を一つひとつ取り出して画面に反映している構造ですね。

今日はViewModel本来の役割は何なのか、そしてなぜバインディングのないMVVMが片手落ちなのかを整理してみます。

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/1.png" alt="MVVMの完成はViewModelではなく、バインディングにあります">
  <figcaption>MVVMの完成はViewModelではなく、バインディングにあります</figcaption>
</figure>

---

## ViewModelは画面の状態を作る工場です

MVVMの3つの軸はこう分かれます。

- **Model**: データとビジネスロジック(MVCと同じ)
- **View**: 画面表示。iOSではUIViewとUIViewControllerの両方がここに含まれます
- **ViewModel**: Modelのデータを**画面に表示できる形に加工**し、画面の状態を保持するオブジェクト

ポイントは2つあります。

1つ目、MVVMでは**UIViewControllerはView側**です。前回の記事で問題になったビューコントローラの曖昧な立ち位置を、Viewだと明確に定義してしまったわけです。ビューコントローラは画面を描くことだけを担当し、判断はすべてViewModelに委ねます。

2つ目、ViewModelは**UIKitを知らなくてよい**という点です。`import UIKit`が不要という意味です。`Date`を受け取って「3分前」のような文字列に変換したり、ローディング中かどうかをBoolで保持したりするところまでがViewModelの仕事です。その文字列をどのUILabelに入れるかはViewの仕事です。

この分離のおかげで、ViewModelは画面なしでテストできます。「投稿が0件なら案内文が表示される」を、UIViewControllerなしの純粋なロジックとして検証できるようになるわけです。

---

## バインディングがないとなぜ片手落ちなのでしょうか

ここまでで止まってしまうと、こういうコードになります。

```swift
// バインディングのない「見せかけだけのMVVM」
final class ProfileViewController: UIViewController {
    let viewModel = ProfileViewModel()

    func refresh() {
        viewModel.load()
        nameLabel.text = viewModel.displayName   // 値を直接取り出して
        statusLabel.text = viewModel.statusText  // 一つずつ反映する
        emptyView.isHidden = !viewModel.isEmpty
    }
}
```

ViewModelの状態が変わるたびに、ビューコントローラが忘れずに`refresh()`を呼んでやらなければなりません。呼び出しのタイミングを一つでも取りこぼすと、画面と状態がずれてしまいます。状態を移動させただけで、「状態と画面を同期させる責任」は依然としてビューコントローラに残ったままなのです。

MVVMがマイクロソフトのWPFで生まれたときから**データバインディングを前提に設計されている**理由がここにあります。「ViewModelが変われば、Viewもそれに追従して変わる」ことが自動で保証されて初めて完成するのです。

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/2.png" alt="購読を一度仕込めば、画面が状態に自動で追従します">
  <figcaption>購読を一度仕込めば、画面が状態に自動で追従します</figcaption>
</figure>

---

## UIKitではCombineでバインディングします

UIKitには標準搭載のバインディング機構がないので、Combineを組み合わせるのがほぼ定番になっています。

```swift
final class ProfileViewModel {
    @Published private(set) var displayName = ""
    @Published private(set) var isLoading = false

    func load() { ... }  // 完了時に@Publishedの値を更新
}

final class ProfileViewController: UIViewController {
    private var cancellables = Set<AnyCancellable>()

    override func viewDidLoad() {
        super.viewDidLoad()
        viewModel.$displayName
            .assign(to: \.text!, on: nameLabel)
            .store(in: &cancellables)
        viewModel.$isLoading
            .sink { [weak self] in self?.spinner.isAnimating = $0 }
            .store(in: &cancellables)
    }
}
```

購読を一度仕込んでおけば、以降ViewModelがいつどう変わろうと画面が自動で追従します。「refreshをいつ呼べばいいんだっけ」という悩み自体がなくなるわけです。

SwiftUIでは、このバインディングが言語レベルで組み込まれています。`@Observable`を付けたオブジェクトのプロパティをViewがただ読むだけで、その値が変わればそのViewが自動的に再描画されます。購読コードすら不要です。

---

## Massive ViewModelという罠

MVVMを導入して数ヶ月経つと、新しい問題にぶつかります。今度は**ViewModelが肥大化する**んです。ネットワークリクエスト、キャッシング、ビジネスルールまで全部ViewModelに詰め込むと、怪物の居場所が移動しただけになってしまいます。

ViewModelはあくまで**プレゼンテーションロジック**(画面状態の加工)の持ち場です。データ取得はRepositoryやServiceに、ビジネスルールはModel層に下ろすべきです。MVVMはViewとそれ以外を分けるパターンであって、それ以外全部をViewModelに詰め込めというパターンではありません。

<figure>
  <img src="/assets/images/posts/f493544a-c1fe-4846-88cc-edd9a3879c4c/3.png" alt="全部詰め込むと、怪物の居場所が移動しただけです">
  <figcaption>全部詰め込むと、怪物の居場所が移動しただけです</figcaption>
</figure>

---

## まとめ

- ViewModelはModelのデータを画面用の状態に加工するオブジェクトであり、UIKitを知らなくてよい存在です。だからこそ画面なしでテストできます。
- 状態を移動させただけでバインディングがなければ、同期の責任はそのままビューコントローラに残ります。MVVMはバインディングまであって初めて完成です。
- UIKitではCombine、SwiftUIでは@Observableがそのバインディングを担います。
- すべてのロジックをViewModelに詰め込むとMassive ViewModelになります。任せるのはプレゼンテーションロジックまでにしましょう。

ところでSwiftUIでは、View自体が状態を宣言的に反映する構造なので、「ViewModelはそもそも不要では」という主張も勢いを増しています。この論争は次回、正面から扱ってみます。
