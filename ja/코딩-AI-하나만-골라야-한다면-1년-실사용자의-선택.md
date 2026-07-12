---
layout: single
author_profile: true
read_time: true
comments: true
share: false
related: true
classes: wide
title: "コーディングAIを一つだけ選ぶなら?1年間実際に使ったユーザーの選択"
lang: ja
description: "最近、開発者コミュニティで一番よく見かける質問の一つが「Claude CodeとCodex、どっちを使えばいいの?」というものです。私はClaudeを1年ほど、Codexも6ヶ月以上課金して毎日使っていて、最近登場したClaude Fable 5とGPT-5.6…"
header:
  og_image: /assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png
tags:
  - Claude
  - Codex
  - ClaudeCode
  - GPT-5.6
  - Fable5
  - AIコーディング
  - 開発者ツール
  - AIエージェント
  - Cursor
  - Kiro
permalink: /ja/코딩-AI-하나만-골라야-한다면-1년-실사용자의-선택/
toc: true
toc_sticky: true
last_modified_at: 2026-07-12
---

🌐 [한국어](/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · [English](/en/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/) · **日本語** · [中文](/zh/%EC%BD%94%EB%94%A9-AI-%ED%95%98%EB%82%98%EB%A7%8C-%EA%B3%A8%EB%9D%BC%EC%95%BC-%ED%95%9C%EB%8B%A4%EB%A9%B4-1%EB%85%84-%EC%8B%A4%EC%82%AC%EC%9A%A9%EC%9E%90%EC%9D%98-%EC%84%A0%ED%83%9D/)
{: .notice--info}

# Claude歴1年、Codex歴6ヶ月の開発者が出した結論

最近、開発者コミュニティで一番よく見かける質問の一つが「Claude CodeとCodex、どっちを使えばいいの?」というものです。私はClaudeを1年ほど、Codexも6ヶ月以上課金して毎日使っていて、最近登場したClaude Fable 5とGPT-5.6 Solも試してみました。実はこの2つに落ち着く前にCursorとKiroも使っていました。Cursorは最初はとても良かったのですが、Claudeがあまりに優秀だったので自然と乗り換えましたし、Kiroも悪くないツールではあるものの、やはり非主流ゆえにスキルやプラグインといったエコシステムがあまり整っておらず、結局Kiroの中でもClaudeモデルを使うことになるので、あえて経由する理由がありませんでした。そこで今回は、私が実際に感じた違いに加えて、コミュニティのアンケート・ベンチマーク・GitHub issueといった客観的な資料もまとめてご紹介したいと思います。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/1.png" alt="2026年、コーディングAI二強、ClaudeとCodexの比較">
  <figcaption>2026年、コーディングAI二強、ClaudeとCodexの比較</figcaption>
</figure>

## 私が感じた2つのエージェントの性格の違い

一言でまとめるとこうです。**Claudeは全体的に何でもできるシニア開発者という印象で、Codexは口数は少ないけれど正確な同僚という印象です。**

Claude Codeは比較的速くて正確です。コードベースを把握する感覚や文脈を読み取る能力が優れていて、あいまいな指示でも意図をよく汲み取ってくれます。ただ、たまにミスをします。自信満々に突き進んでいって細部を見落とす、まさにそういうシニアタイプなんですよね。それと、使っている人が多いだけあって、スキルやプラグインといった周辺エコシステムが充実しているのも見逃せない長所です。必要なワークフローを検索すれば、誰かがすでに作ってくれているものが出てきます。

CodexはClaudeほど速く、思い切りよくコードを書くタイプではありません。その代わり正確です。じっくり考えてから出してくる成果物には抜け漏れが少ないんです。

面白いのは、これが私だけの感覚ではないという点です。500人以上が参加したRedditのアンケートでは、日常使いでは65%がCodexを好むと答えた一方、ブラインドでのコードレビューでは67%がClaudeのコードのほうがきれいだと評価しました。海外コミュニティでも「Claudeは精密な編集に強く、Codexは大規模なリファクタリングに強い」「Codexは遅いが複雑な作業ではより徹底している」という評価がよく見られます。私の実感ともほぼ一致しています。

## Claude Fable 5:物足りなかった点がすべて解消されました

2026年6月に登場したClaude Fable 5は、個人的にとても満足しています。従来のClaudeの物足りない部分、つまり「速いけれどたまにミスをする」という部分がほぼ解消されました。

数値でも裏付けられています。Fable 5はSWE-bench Verifiedで95%、SWE-bench Proで80.3%を記録しました。直前の最上位モデルだったOpus 4.8のSWE-bench Proスコアが69.2%だったので、11ポイント以上向上したことになります。難易度の高いFrontierCode Diamondでは29.3%と、Opus(13.4%)の2倍以上です。Stripeは5,000万行規模のRubyコードベースのマイグレーションをFable 5でわずか1日で終えたと発表していますが、手作業なら2ヶ月以上かかっていた作業です。もちろんこれらのベンチマークはAnthropic自社のスキャフォールディングに基づくもので中立的なハーネスではないという批判もあるので、数値そのものよりもトレンドとして見るのが適切でしょう。

## GPT-5.6 Sol:トークン問題という致命的な玉に瑕、それでも優秀です

OpenAIが7月9日にリリースしたGPT-5.6 Solも本当に優れたモデルです。Artificial AnalysisのCoding Agent Indexで80点という新記録を打ち立てました。ところがリリース直後から「使用量の上限がとんでもない速さで削られる」という報告が相次ぎました。私も経験しましたし、実際に調べてみるとかなり具体的な事情が出てきます。

- CodexリポジトリのGitHub issue #32250を見ると、Proサブスクライバーがgpt-5.6 Sol Mediumで短い作業を一つ実行させただけで、5時間の使用上限の残量が87%から76%へ、一気に11ポイント吹き飛んだそうです。その後は、ツール呼び出しすらない些細な追質問一つごとに約1ポイントずつ削られていったといいます。同じユーザーが使っていたGPT-5.5 xhighよりも早く消費されたというわけです。
- issue #31860では、CodexアプリがSolのコンテキストを1.05Mトークンというスペックの35%程度にあたる372Kに切り詰めて使っていることが確認されました。コンテキストが90%に達すると早期にcompactionが発生し、この再処理の過程がトークン消費をさらに加速させた可能性が指摘されています。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/2.png" alt="短い作業一回で11ポイントも消えた使用上限">
  <figcaption>短い作業一回で11ポイントも消えた使用上限</figcaption>
</figure>

結局OpenAIも「最高の演算設定をあまりに簡単に使えるようにしておきながら、その影響を十分に周知できていなかった」と認め、24時間以内にレートリミットを2回リセットしました。OpenAI関係者の説明によれば、5.6 SolのMediumは5.5のMediumと同格ではなく、デフォルトはSol Lowであり、xhighは本当に難しい問題にのみ使うべきだとのことです。つまりモデル自体がトークン単位で非効率というより、高演算設定がデフォルトのように使われてしまったUXの問題とアプリ側のバグが重なった案件に近いといえます。実際OpenAIは、Solのmax reasoningが競合モデルに比べて出力トークンを54%削減していると主張しています。

致命的な玉に瑕ではあったものの、それでもモデル自体は非常に優れています。設定さえ理解して使えば、成果物の精度は依然としてトップクラスです。

## もはや無理にClaudeにこだわる必要はありません

数ヶ月前までは「コーディングといえば断然Claude」という空気がありましたよね。今はそうではないと思います。どちらも本当に優秀です。Terminal-Bench 2.1ではCodex CLIの組み合わせが83.4%で1位、SWE-bench ProではFable 5が80.3%でトップです。ベンチマークごとに1位が入れ替わる時代になっています。

ですから私の結論は、両方使うのが一番良いということです。ただ、もし一つだけ選ばなければならないとしたら、私はCodexを選びます。ChatGPTをすでによく使っていて、画像生成まで一つのサブスクリプションで済んでしまうからです。コーディングエージェント単体で見て選ぶというより、サブスクリプション全体の効用で見るとそうなる、という話です。

## 結局みんな両方使うようになるのでは

ここにもう一つ加えたい視点があります。最近のモデルのトークン使用量が飛躍的に増えているという点です。エージェンティックAIは一般的なチャットボット利用に比べて最大1,000倍のトークンを消費するという分析があり、ForbesやTechCrunchはこの現象を「Tokenpocalypse」と呼び、サブスクリプションの上限を想定より早く使い切ってしまうユーザーが急増していると報じています。実際コミュニティでCodexを追加課金する一番の理由は「Claudeの上限がすぐに減ってしまうから」なんです。

一つのサブスクリプションの上限では足りなくなる時代だとすれば、結局みんな自然と2つのサブスクリプションを併用する形に収束していくのではないでしょうか。

## 2つのエージェントを一緒に使うとパフォーマンスも上がります

両方使うのは単に上限の問題だけではありません。AIオーケストレーションをやってみると、同じエージェントを2つ組み合わせるよりも、異なるエージェント同士をやり取りさせるほうがパフォーマンスが良かったんです。

これも研究で裏付けられています。X-MAS研究(arXiv 2505.16997)は、マルチエージェントシステムで異なるLLMを役割ごとに配置すると、同種の組み合わせに比べて精度が8〜47%向上すると報告していますし、別の研究(arXiv 2602.03794)では、多様な2つのエージェントが同種のエージェント16個と同等かそれを上回るという結果を出しています。

私の経験で一番うまく機能した組み合わせはこれでした。**Claudeに作業をさせて、その成果物をCodexにチェックさせること。**速くて思い切りの良いシニアが作った成果物を、慎重で正確なレビュアーがふるいにかける構造です。互いの性格が違うからこそ、お互いの死角をうまく拾ってくれます。

<figure>
  <img src="/assets/images/posts/aa3ce05d-615c-4f13-b2b3-23c2e3a3dc84/3.png" alt="Claudeが作り、Codexがチェックする協業構造">
  <figcaption>Claudeが作り、Codexがチェックする協業構造</figcaption>
</figure>

## まとめ

- Claudeは速くて正確なシニアタイプ、Codexは遅いけれど正確なタイプ。コミュニティの評価も同じです。
- Fable 5はClaudeの物足りない点(たまのミス)を解消し、GPT-5.6 Solはトークン問題があっても非常に優秀です。
- もはや無理にClaudeにこだわる必要はありません。どちらもトップクラスで、両方使うのが一番です。
- 一つだけ選ぶなら私はCodexです。ChatGPTと画像生成まで含めたサブスクリプションの効用のためです。
- トークン消費が急増している傾向を見ると、結局みんな両方使う形になるのではないでしょうか。
- オーケストレーションは異種の組み合わせが正解です。Claudeが作ってCodexがチェックする組み合わせが一番うまく機能しました。

## 参考資料

- [GPT-5.6 Solの使用量急減issue (openai/codex #32250)](https://github.com/openai/codex/issues/32250)
- [CodexアプリのSolコンテキストキャップissue (openai/codex #31860)](https://github.com/openai/codex/issues/31860)
- [Claude Fable 5 & Mythos 5ベンチマーク分析 (Vellum)](https://www.vellum.ai/blog/claude-fable-5-and-mythos-5-benchmarks-explained)
- [Claude Code vs OpenAI Codex比較 (Composio)](https://composio.dev/content/claude-code-vs-openai-codex)
- [Codex vs Claude Code比較 (Builder.io)](https://www.builder.io/blog/codex-vs-claude-code)
- [X-MAS:異種LLMマルチエージェント研究 (arXiv 2505.16997)](https://arxiv.org/abs/2505.16997)
- [エージェント多様性スケーリング研究 (arXiv 2602.03794)](https://arxiv.org/abs/2602.03794)
- [AIトークン消費加速報道 (Forbes, 2026.4)](https://www.forbes.com/sites/ronschmelzer/2026/04/10/running-out-of-ai-tokens-faster-than-ever-heres-why/)
- [トークン請求書の時代 (TechCrunch, 2026.6)](https://techcrunch.com/2026/06/05/the-token-bill-comes-due-inside-the-industry-scramble-to-manage-ais-runaway-costs/)
