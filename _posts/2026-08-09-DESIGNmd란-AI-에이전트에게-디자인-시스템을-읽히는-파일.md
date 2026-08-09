---
title: "DESIGN.md란? AI 에이전트에게 디자인 시스템을 읽히는 파일"
description: "DESIGN.md는 Google Stitch가 오픈소스로 공개한 AI 코딩 에이전트용 디자인 시스템 파일 규약입니다. YAML 토큰과 마크다운 본문 구조, lint·export CLI, Claude Code·Cursor에서 연결하는 법과 한계까지 정리했습니다."
header:
  og_image: /assets/images/posts/82ae7299-c720-42ef-bf81-5a22ee051c4a/design-md-ai-agent-1.jpg
categories:
  - AI
  - 개발 도구
tags:
  - DESIGNmd
  - GoogleStitch
  - 디자인시스템
  - 디자인토큰
permalink: /DESIGNmd란-AI-에이전트에게-디자인-시스템을-읽히는-파일/
toc: true
toc_sticky: true
last_modified_at: 2026-08-09
---

AI 에이전트에게 UI를 시켜본 분이라면 겪어봤을 상황입니다. 어제 만든 화면은 파란 버튼에 둥근 모서리였는데, 오늘 새 세션에서 만든 화면은 보라색 그라데이션에 각진 버튼이 나옵니다. 같은 프로젝트인데 화면마다 브랜드가 다른 앱이 되어 가죠. 그래서 매번 프롬프트에 "우리 브랜드 색은 #2563EB이고, 모서리는 8px이고…"를 복사해 붙입니다.

DESIGN.md는 이 문제를 겨냥한 파일 규약입니다. Google Labs가 자사 AI UI 디자인 도구 Stitch에서 쓰던 포맷을 2026년 4월 21일 오픈소스로 공개했는데([Google 공식 발표](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/)), 한 줄로 요약하면 **"코딩 에이전트에게 시각 아이덴티티를 설명하는 형식 명세"**입니다. 프로젝트 저장소에 마크다운 파일 하나를 두고 에이전트가 UI를 만들 때마다 이 파일을 읽게 하는 거예요.

<figure>
  <img src="/assets/images/posts/82ae7299-c720-42ef-bf81-5a22ee051c4a/design-md-ai-agent-1.jpg" alt="DESIGN.md 파일이 디자인 토큰을 AI 에이전트와 일관된 UI 화면으로 연결하는 구조 일러스트" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>DESIGN.md 파일 하나로 에이전트가 만드는 화면들이 같은 브랜드를 유지합니다.</figcaption>
</figure>

## 프롬프트가 아니라 파일인 이유

브랜드 규칙을 프롬프트에 넣는 방식의 약점은 휘발성입니다. 세션이 끝나면 사라지고 팀원마다 다른 버전의 규칙을 들고 다니게 되죠. 저장소에 커밋된 파일은 사정이 다릅니다.

- **버전 관리가 됩니다.** 디자인 규칙 변경이 Git 히스토리에 남고, PR 리뷰 대상이 됩니다.
- **코드와 같은 곳에 삽니다.** 에이전트가 코드를 읽는 바로 그 위치에 디자인 규칙이 있으니, 별도 도구나 링크 없이 컨텍스트로 들어갑니다.
- **도구 중립적입니다.** 일반 텍스트라서 Claude Code, Cursor, Copilot 등 어떤 에이전트든 읽습니다.

이 발상 자체는 낯설지 않습니다. 에이전트에게 행동 규칙을 주는 CLAUDE.md·AGENTS.md가 이미 같은 원리로 동작하니까요. DESIGN.md는 그 관례를 디자인 시스템 영역까지 넓혔습니다. CLAUDE.md가 "이 프로젝트에서 어떻게 일할지"를 담는다면, DESIGN.md는 "이 제품이 어떻게 보여야 하는지"를 담습니다. 상시 로드 컨텍스트를 어떻게 설계할지는 [CLAUDE.md는 왜 짧아야 할까](/CLAUDEmd는-왜-짧아야-할까-AI-에이전트-상시-로드-컨텍스트-설계법/)에서 자세히 다뤘습니다.

한 가지 헷갈리기 쉬운 부분이 있습니다. 스펙 주도 개발(spec-driven development) 워크플로우에서 requirements.md → design.md → tasks.md 순서로 만드는 "기술 설계 문서 design.md"와는 이름만 같은 다른 물건입니다. 이 글에서 다루는 DESIGN.md는 아키텍처 설계서가 아니라 **디자인 시스템 파일**입니다.

## 파일 구조: 기계가 읽는 토큰 + 사람이 읽는 산문

[공식 명세](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md)에 따르면 DESIGN.md는 두 부분으로 구성됩니다. 앞쪽에 YAML 프런트매터로 기계가 읽는 디자인 토큰을, 뒤쪽에 마크다운 본문으로 사람이 읽는 디자인 의도를 적습니다.

```markdown
---
name: My Product
version: alpha
colors:
  primary: "#2563EB"
  surface: "#FFFFFF"
  onSurface: "#0F172A"
typography:
  headline:
    fontFamily: Pretendard
    fontSize: 28px
    fontWeight: 700
spacing:
  sm: 8px
  md: 16px
rounded:
  card: 12px
components:
  button:
    backgroundColor: "{colors.primary}"
    rounded: 8px
---

## Overview
차분하고 신뢰감 있는 금융 서비스. 화려한 장식보다 정보의 명료함을 우선한다.

## Colors
primary는 행동 유도 요소에만 아껴 쓴다. 화면의 80%는 surface 계열로 유지한다.
...
```

여기서 설계의 핵심이 보입니다. **토큰이 규범이고, 산문은 맥락입니다.** `colors.primary: "#2563EB"`라는 값은 에이전트가 그대로 따라야 하는 정답입니다. "primary는 행동 유도 요소에만 아껴 쓴다"는 산문은 그 값을 언제 어디에 쓸지 판단하는 근거고요. 색상 코드만 주면 에이전트는 그 색을 아무 데나 칠하고 분위기 설명만 주면 색을 제멋대로 고릅니다. 그래서 둘을 한 파일에 묶었습니다.

명세가 정한 규칙 몇 가지를 짚어보면 이렇습니다.

- 프런트매터에서 `name`은 필수이고, 색상은 최소한 `primary` 하나는 정의해야 합니다.
- 토큰끼리는 `{colors.primary}`처럼 경로 참조로 연결합니다. 버튼 배경색이 primary를 참조하면, primary 하나만 바꿔도 연쇄 반영됩니다.
- 본문 섹션은 Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts 8가지가 정의되어 있습니다. 모두 선택이지만 넣는 섹션은 이 순서를 지켜야 합니다.
- 다루지 않기로 한 영역은 `omitted` 필드에 이유와 함께 명시할 수 있습니다. "안 적은 것"과 "일부러 뺀 것"을 에이전트가 구분하게 하려는 장치입니다.

<figure>
  <img src="/assets/images/posts/82ae7299-c720-42ef-bf81-5a22ee051c4a/design-md-ai-agent-2.jpg" alt="Google Stitch가 공개한 DESIGN.md 발표 이미지와 에디터에 열린 파일 화면" width="1200" height="675" loading="lazy" decoding="async">
  <figcaption>Stitch 팀이 공개한 발표 이미지예요. 에디터에서 열리는 평범한 마크다운 파일이라는 점이 핵심입니다.</figcaption>
</figure>

## 검증 도구까지 있는 이유

포맷 명세만 있는 게 아니라 [공식 CLI 도구](https://github.com/google-labs-code/design.md)(`@google/design.md`, Apache-2.0 라이선스)가 함께 공개됐습니다. 명령은 네 가지입니다.

| 명령 | 하는 일 |
|---|---|
| `lint` | 파일 구조 검증 + 토큰 참조 검사 + WCAG 명암비 검사 |
| `diff` | 두 버전을 비교해 토큰 수준의 변경 사항 보고 |
| `export` | 토큰을 Tailwind 설정이나 W3C DTCG 포맷으로 변환 |
| `spec` | 명세 전문을 출력 — 에이전트 프롬프트에 주입하는 용도 |

lint가 재미있는 부분입니다. 색상 값을 내부적으로 sRGB로 변환해 WCAG(Web Content Accessibility Guidelines, 웹 콘텐츠 접근성 지침) 명암비를 검사해 줍니다. 에이전트가 "그럴싸해 보이는" 색 조합을 만들어도 접근성 기준에 미달하면 기계적으로 걸러냅니다. 디자인 규칙 준수를 에이전트의 성실함에 맡기지 않고 CI에서 검증할 수 있는 형태로 만든 셈인데, Google도 공개 문서에서 이 점을 강조합니다. [공식 발표](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/)의 표현을 빌리면, 에이전트가 추측하는 대신 "색이 어떤 용도인지 정확히 알고, 선택을 WCAG 접근성 규칙에 대조해 검증할 수 있게" 하는 것이 목표입니다.

export로 Tailwind 설정을 뽑아낼 수 있다는 점도 실무에서는 중요합니다. DESIGN.md를 단일 출처로 두고 실제 CSS 쪽 설정은 거기서 파생시키는 구조가 가능해지니까요.

## 실제로 어떻게 쓰나

시작하는 방법은 두 갈래입니다.

**Stitch에서 생성하기.** [Stitch](https://stitch.withgoogle.com/)에서 디자인을 만들면 DESIGN.md 파일로 내보낼 수 있습니다. 화면 몇 개를 디자인해 두고 그 시각 언어를 파일로 추출한 뒤, 코딩 에이전트에게 넘기는 흐름입니다.

**손으로 쓰기.** 일반 마크다운이라 에디터에서 직접 작성해도 됩니다. 이미 디자인 토큰이 정리된 팀이라면 기존 토큰을 프런트매터로 옮기고 디자인 가이드 문서에서 "왜"에 해당하는 부분을 본문 섹션으로 옮기면 됩니다.

파일을 만들었다면 저장소 루트에 두고 에이전트가 참조하게 합니다. 여기서 주의할 점 하나. DESIGN.md는 CLAUDE.md처럼 에이전트가 **자동으로** 세션에 로드하는 파일이 아닙니다. 아직 알파 단계의 신생 규약이라, CLAUDE.md나 AGENTS.md에 "UI 작업 시 DESIGN.md를 먼저 읽고 토큰을 따를 것" 같은 한 줄을 넣어 연결해 주는 편이 확실합니다. UI 작업이 없는 세션에서까지 디자인 시스템 전체가 컨텍스트를 차지할 필요는 없으니, 상시 로드가 아니라 필요할 때 읽게 하는 이 방식이 컨텍스트 비용 면에서도 낫습니다.

<figure>
  <img src="/assets/images/posts/82ae7299-c720-42ef-bf81-5a22ee051c4a/design-md-ai-agent-3.png" alt="DESIGN.md의 YAML 토큰과 마크다운 본문이 코딩 에이전트와 CLI 검증으로 이어지는 흐름 다이어그램" width="1184" height="348" loading="lazy" decoding="async">
  <figcaption>토큰과 산문이 한 파일에서 에이전트 쪽과 CLI 검증 쪽으로 갈라져 흘러가는 구조입니다.</figcaption>
</figure>

## 한계와 전망

냉정하게 볼 부분도 있습니다.

**아직 알파입니다.** [명세](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md)의 version 값 자체가 "alpha"이고, 필드 구성이 바뀔 수 있는 초안 단계입니다. 지금 도입한다면 스펙 변경을 따라갈 각오는 필요합니다.

**에이전트 준수는 여전히 확률적입니다.** 파일에 토큰을 아무리 정확히 적어도 에이전트가 그대로 따른다고 장담할 수는 없습니다. 결국 LLM의 지시 이행이니까요. CLAUDE.md의 지시가 가끔 무시되는 것과 같은 원리죠. 그래서 lint 같은 결정적 검증 도구가 세트로 나왔습니다. 실전에서도 "파일로 지시 + CI에서 검증"을 한 묶음으로 봐야 합니다.

**커버 범위가 아직 좁습니다.** 현재 명세는 색·타이포그래피·간격·모서리·컴포넌트 중심입니다. 모션, 아이콘 세트, 반응형 브레이크포인트 같은 영역은 본문 산문으로 서술할 수는 있지만 토큰 스키마가 없습니다.

그래도 방향 자체는 분명합니다. 에이전트에게 주는 컨텍스트를 프롬프트가 아니라 **저장소의 버전 관리되는 파일**로 옮기는 흐름은 CLAUDE.md, AGENTS.md에 이어 이제 디자인 영역까지 닿았습니다. 도구가 바뀌어도 파일은 남는다는 점에서, 특정 에이전트에 종속되지 않는 투자이기도 합니다. UI 일관성 문제로 프롬프트에 브랜드 규칙을 복사해 넣고 있었다면, 그 내용을 DESIGN.md 한 파일로 옮기는 것부터 시작해 보세요.

<!-- SOURCE-PROVENANCE -->
## 출처 및 확인 기준

- [Stitch's DESIGN.md format is now open-source](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/) — Google (2026-04-21) · 공식 발표 · 확인 2026-08-08 · 근거: DESIGN.md 오픈소스 공개 사실, 공개 취지(에이전트가 색의 용도를 알고 WCAG 검증 가능), Stitch에서 생성 지원
- [google-labs-code/design.md](https://github.com/google-labs-code/design.md) — Google Labs · 공식 문서 · 확인 2026-08-08 · 근거: Apache-2.0 라이선스, 알파 상태, @google/design.md CLI의 lint·diff·export·spec 명령과 기능
- [DESIGN.md Specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) — Google Labs · 표준·명세 원문 · 확인 2026-08-08 · 근거: 프런트매터 필드 구성(name 필수, primary 색 필수), 본문 8개 섹션, 토큰 참조 문법, omitted 필드, WCAG 명암비 검사 방식
<!-- /SOURCE-PROVENANCE -->
