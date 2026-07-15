---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "iOSのMVCパターン、Massive View Controllerが生まれる本当の理由"
lang: ja
description: "iOS開発をしていると一度は耳にするジョークがあります。"
header:
  og_image: /assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/1.png
tags:
  - iOS
  - MVC
  - アーキテクチャ
  - UIKit
  - ビューコントローラー
  - Swift
  - iOS開発
  - MassiveViewController
  - アプリ開発
  - iOSアーキテクチャ
permalink: /ja/iOS-MVC-패턴-Massive-View-Controller가-생기는-진짜-이유/
toc: true
toc_sticky: true
last_modified_at: 2026-07-15
---

🌐 [한국어](/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · [English](/en/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/) · **日本語** · [中文](/zh/iOS-MVC-%ED%8C%A8%ED%84%B4-Massive-View-Controller%EA%B0%80-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%A7%84%EC%A7%9C-%EC%9D%B4%EC%9C%A0/)
{: .notice--info}

iOS開発をしていると一度は耳にするジョークがあります。

「MVCとはModel-View-Controllerの略ではなく、Massive View Controllerの略だ」

冗談めかした言い方ですが、核心を突いています。れっきとしたAppleの公式推奨アーキテクチャなのに、なぜその通りに実装していくとビューコントローラーが数千行のモンスターになってしまうのでしょうか。

今回はiOSアーキテクチャシリーズの第一弾として、**MVCが本来どんな設計だったのか、そしてiOSではなぜその設計通りにいかないのか**を整理してみます。

結論から言うと、問題はMVCという概念そのものではなく、**UIViewControllerというクラスがViewとControllerの境界にまたがっているという構造**そのものにあります。

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/1.png" alt="ModelでもViewでもないコードは、結局すべてビューコントローラーに集まってきます">
  <figcaption>ModelでもViewでもないコードは、結局すべてビューコントローラーに集まってきます</figcaption>
</figure>

---

## そもそもMVCとはどんな設計だったのか

MVCは1979年にSmalltalkで生まれた、非常に歴史のあるパターンです。原型では3つの役割が明確に分かれています。

- **Model**: データとビジネスロジック
- **View**: 画面表示
- **Controller**: ユーザー入力を受け取ってModelに伝える

原型のMVCでは、ViewがModelを直接観察します。Modelが変わればViewが自動的に更新される仕組みでした。

ところがAppleのMVCは少し違います。ViewとModelが互いを一切知らないようにし、**Controllerが真ん中ですべての橋渡しを担う**形に変えました。再利用性を高めるための合理的な選択ではありましたが、その代わりにControllerへ仕事が集中する余地を残してしまったわけです。

---

## UIViewControllerは名前からしてズルをしています

Apple版MVCのControllerは、iOSではUIViewControllerとして実装されます。ですが、このクラス名をもう一度よく見てください。**View + Controller**です。名前の時点で2つの役割がくっついています。

実際、UIViewControllerはこれらすべてを担っています。

- `viewDidLoad`、`viewWillAppear`といった**ビューのライフサイクル**管理
- 画面回転、レイアウト更新といった**ビューに密着したイベント**処理
- `UITableViewDataSource`、`UITableViewDelegate`といった**ビュープロトコル**の実装

ここまではまだビュー関連の仕事です。問題は「ではネットワークリクエストはどこに書けばいいのか」「画面遷移は」「データのフォーマットは」という問いに、しかるべき置き場所がないことです。ModelでもViewでもないので、結局すべてビューコントローラーに流れ込んでいきます。

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/2.png" alt="名前からしてView+Controller、一人で何でもこなすのがデフォルトです">
  <figcaption>名前からしてView+Controller、一人で何でもこなすのがデフォルトです</figcaption>
</figure>

---

## 肥大化したビューコントローラーの典型的な姿

よく見かけるビューコントローラーの構造をコードでまとめるとこうなります。

```swift
final class ProfileViewController: UIViewController {
    // 1. ビューのプロパティ群
    private let tableView = UITableView()

    // 2. 状態(事実上Modelのキャッシュ)
    private var user: User?
    private var posts: [Post] = []

    override func viewDidLoad() {
        super.viewDidLoad()
        setupLayout()          // 3. レイアウトコード
        fetchProfile()         // 4. ネットワークリクエスト
    }

    private func fetchProfile() {
        URLSession.shared.dataTask(...) { ... }  // 5. パースとエラー処理
    }

    @objc private func editTapped() {
        // 6. 画面遷移まで自前で
        navigationController?.pushViewController(EditViewController(), animated: true)
    }
}
```

レイアウト、状態管理、ネットワーク、パース、画面遷移がすべて1つのファイルに詰め込まれています。ここにdelegateの実装まで加わると、あっという間に1000行を超えてしまいます。

この構造の本当のコストは行数ではなく、**テストができないという点**です。「userがnilなら編集ボタンを非表示にする」といった単純なロジックを検証しようとしても、UIViewController全体を立ち上げてライフサイクルを再現しなければならないからです。

---

## では、MVCは捨てるべきなのでしょうか

そうではありません。規模の小さい画面では、MVCは今でも最も速くシンプルな選択肢です。Appleのフレームワーク自体がMVCを前提に設計されているため、無理に別の構造を乗せるとかえって摩擦が生じることもあります。

肝心なのは、MVCを使うにしても**ビューコントローラーから切り離せる責務は意識的に切り離すこと**です。

- ネットワーク・データロジック → 別のサービスオブジェクトへ
- 画面遷移 → Coordinatorのような専用オブジェクトへ
- セルの構成、フォーマット → 専用の型へ

そして、「画面に表示する状態を作るロジック」まで切り離したくなる瞬間がやってきます。その答えが、次回取り上げる**MVVM**です。ViewModelというオブジェクトがなぜ必要なのか、そしてバインディングがなければなぜ片手落ちになるのか、続けて整理していきます。

<figure>
  <img src="/assets/images/posts/a3101292-21b1-4a89-b770-3e844f1a23c6/3.png" alt="切り離せる責務から意識的に分離していくことが第一歩です">
  <figcaption>切り離せる責務から意識的に分離していくことが第一歩です</figcaption>
</figure>

---

## まとめ

- MVC自体に罪はありません。問題はUIViewControllerがViewとControllerの役割を兼ねているという、iOS特有の構造的な特性です。
- ModelでもViewでもないコードの行き場がなく、すべてビューコントローラーに積み上がっていく——それがMassive View Controllerの正体です。
- 小さな画面ではMVCは今でも有効です。ただし、ネットワーク・画面遷移・フォーマットは意識的に切り離す必要があります。
- ビューの状態を作るロジックまで切り離すにはMVVMが必要です。次回取り上げます。
