---
title: "[오픈소스 발굴 #2] oh-my-design, 코딩 에이전트에게 브랜드를 입히다"
description: "oh-my-design은 Claude Code·Codex·Cursor에 DESIGN.md 디자인 워크플로를 설치하는 오픈소스 CLI입니다. 기업 레퍼런스 440개의 근거 표기 방식과 스킬 구조, 쓰기 전 주의점까지 뜯어봅니다."
header:
  og_image: /assets/images/posts/7a855f56-283c-465d-b072-3e16af7791ae/oh-my-design-ai-design-workflow-1.jpg
categories:
  - AI
  - 개발 도구
tags:
  - ohmydesign
  - 오픈소스
  - DESIGNmd
  - 디자인시스템
permalink: /오픈소스-발굴-2-oh-my-design-코딩-에이전트에게-브랜드를-입히다/
toc: true
toc_sticky: true
last_modified_at: 2026-08-09
---

<figure>
  <img src="/assets/images/posts/7a855f56-283c-465d-b072-3e16af7791ae/oh-my-design-ai-design-workflow-1.jpg" alt="DESIGN.md 파일로 세 AI 에이전트가 같은 UI를 그리게 하는 OH-MY-DESIGN 일러스트" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>터미널 한 줄로 설치하면, 에이전트마다 제각각이던 화면이 한 브랜드로 모입니다</figcaption>
</figure>

묻혀 있는 저장소를 골라 열어보는 연재, 두 번째입니다. [오픈소스 발굴 1편](/오픈소스-발굴-1-AutoThreads-Threads-계정-운영을-AI에게-맡기는-오픈소스-데스크톱-앱/)에서는 Threads 계정 운영을 AI에게 맡기는 데스크톱 앱을 뜯어봤는데, 이번엔 국내 개발자의 프로젝트입니다. oh-my-design, 코딩 에이전트에게 디자인 시스템을 설치해 주는 도구입니다.

문제의식은 명확합니다. AI 에이전트에게 UI를 시키면 화면마다 다른 브랜드가 나옵니다. 어제는 파란 버튼, 오늘은 보라 그라데이션. 이 문제를 파일 규약으로 푸는 DESIGN.md는 [별도 글](/DESIGNmd란-AI-에이전트에게-디자인-시스템을-읽히는-파일/)에서 다뤘습니다. Google Stitch가 공개한 명세로, 저장소에 디자인 토큰과 브랜드 규칙을 담은 마크다운 파일을 두고 에이전트가 매번 읽게 하는 방식이죠. oh-my-design은 그 규약을 "그래서 월요일 아침에 뭘 치면 되는데?"의 영역으로 끌고 내려온 프로젝트입니다.

[저장소](https://github.com/kwakseongjae/oh-my-design)는 2026년 4월에 공개돼 지금 별 400개를 넘겼고, MIT 라이선스입니다. 만든 이는 한국 개발자고 그래서인지 카탈로그에 토스·배민·당근·번개장터 같은 국내 서비스가 유난히 많습니다. 이 프로젝트의 실질적인 차별점 중 하나라 뒤에서 다시 얘기하겠습니다.

## 한 줄 설치, 네 개의 에이전트

설치는 이게 전부입니다.

```bash
npx oh-my-design-cli@latest
```

대화형 설치기가 프로젝트에 어떤 에이전트가 있는지 감지해서 채널별로 번들을 깔아줍니다. [README](https://github.com/kwakseongjae/oh-my-design)에 정리된 지원 범위는 이렇습니다.

| 에이전트 | 설치되는 것 |
|---|---|
| Claude Code | 풀 번들 — `.claude/` 아래 스킬 20개, 서브에이전트 18개, hooks, 카탈로그 데이터 |
| Codex | `.agents/skills/` 스킬, `.codex/agents/` 서브에이전트 역할, 로컬 카탈로그 |
| OpenCode | `.opencode/` 아래 동일 번들 |
| Cursor | 프로젝트 rule 파일 하나 + 공용 카탈로그. 스킬·서브에이전트·훅은 설치하지 않음 |

Cursor만 대접이 다른 게 눈에 띄죠. Cursor는 스킬·서브에이전트 실행 채널이 없어서 rule 파일로 "DESIGN.md를 우선하라"는 계약만 심는, 의도된 rules-only 채널입니다. 문서가 이 차이를 숨기지 않고 "Cursor의 정확한 사용 경로"라는 섹션으로 따로 안내한 건 정직합니다.

설치 후 에이전트를 재시작하고 `npx oh-my-design-cli@latest doctor`로 진단합니다. CLI의 역할은 여기까지입니다. 설치와 진단만 하고, 이후 디자인 작업은 전부 에이전트 세션 안에서 자연어로 이뤄집니다. 별도 API 키도, 상주 데몬도, MCP(Model Context Protocol, 에이전트에 외부 도구를 연결하는 표준) 서버도 없습니다. 실제로 초기엔 카탈로그를 MCP로 제공했다가 지금은 접었습니다. 스킬이 로컬 파일을 직접 읽는 쪽이 단순하다는 판단인데, 과거 구현은 `packages/mcp/`에 아카이브로만 남아 있습니다.

<figure>
  <img src="/assets/images/posts/7a855f56-283c-465d-b072-3e16af7791ae/oh-my-design-homepage-2.png" alt="oh-my-design 공식 홈페이지, 440개 품질 등급 레퍼런스와 npx 설치 명령 소개" width="1200" height="806" loading="lazy" decoding="async">
  <figcaption>홈 화면 첫 문장이 곧 프로젝트 요약입니다. 레퍼런스 440개에서 DESIGN.md를 뽑아냅니다</figcaption>
</figure>

## 기업 레퍼런스 440개, 핵심은 개수가 아니라 근거

패키지에는 기업 디자인 시스템을 DESIGN.md 형식으로 재구성한 레퍼런스가 440개 들어 있습니다. 토스, 스트라이프, 리니어, 애플, 에어비앤비까지. [카탈로그 사이트](https://oh-my-design.kr/design-systems)에서 전부 눈으로 확인할 수 있고 각 레퍼런스는 `oh-my-design.kr/<id>/design.md` 주소로 raw 마크다운 트윈이 제공돼 에이전트가 URL로 바로 가져올 수도 있습니다. 웹에서 레퍼런스를 골라 DESIGN.md를 내려받는 Builder 페이지도 있어서 스킬이 안 깔리는 Cursor는 이 경로를 쓰라고 안내합니다.

<figure>
  <img src="/assets/images/posts/7a855f56-283c-465d-b072-3e16af7791ae/oh-my-design-builder-korean-references-3.png" alt="oh-my-design Builder 페이지, 토스·당근·배민·카카오 등 기업 레퍼런스 타일과 카테고리 필터" width="1200" height="806" loading="lazy" decoding="async">
  <figcaption>Builder에서 레퍼런스를 고르면 DESIGN.md를 바로 내려받습니다. 국내 서비스 타일이 유난히 많습니다</figcaption>
</figure>

숫자만 보면 "웹 긁어서 440개 만들었겠지" 싶은데, 파일을 열어보면 생각이 달라집니다. 토스 레퍼런스의 프런트매터에는 주장(claim) 하나하나에 근거가 달려 있습니다. `tokens.colors.primary: #3182f6`이라는 값 옆에 어느 화면(TDS 모바일 버튼 문서)에서, 어떤 방법(computed style 캡처와 공식 문서 대조)으로, 언제(2026-07-11) 확인했는지가 붙습니다. 본문도 마찬가지입니다. "Toss Product Sans가 가시 요소 810곳에서 첫 번째 폰트로 관찰됐다"처럼 관찰 횟수를 적고, 브랜드 로고의 파란색과 실제 UI의 파란색(`#3182f6`)이 다르니 섞어 쓰지 말라는 주의까지 담겨 있습니다. 폰트 재배포 권리는 공식 소스가 명시한 바 없다고 "모름"을 모름으로 남겨두고요.

그렇다고 440개 전부가 이 밀도인 건 아닙니다. 카탈로그가 스스로 등급을 공개하는데, 이 글을 쓰는 시점 기준 Verified v2가 141개, Partial이 159개, Legacy 스냅샷이 140개입니다. 신형 검증 파이프라인을 통과한 건 아직 3분의 1이라는 뜻이죠. 저장소의 스펙 문서에는 "`verified` 날짜는 타임스탬프이지 품질 등급이 아니다"라는 문장이 있고 카탈로그 페이지에도 "신뢰는 근거·신선도·충돌 여부로 계산하지, 날짜 도장에서 추론하지 않는다"고 못 박아 뒀습니다. 자기 데이터의 한계를 등급으로 드러내는 태도는 이런 카탈로그형 프로젝트에서 흔치 않은 미덕입니다.

<figure>
  <img src="/assets/images/posts/7a855f56-283c-465d-b072-3e16af7791ae/oh-my-design-catalog-quality-grades-4.png" alt="oh-my-design 카탈로그, Verified v2·Partial·Legacy 품질 등급 분포 표기" width="1200" height="806" loading="lazy" decoding="async">
  <figcaption>카탈로그가 등급을 숨기지 않습니다. Verified v2는 아직 141개입니다</figcaption>
</figure>

## 토큰 너머, Voice

DESIGN.md 원 명세는 색·타이포그래피·간격 같은 토큰 중심입니다. oh-my-design은 [Google Stitch의 명세](https://stitch.withgoogle.com/docs/design-md/overview/)를 바닥에 깔고 그 위에 Voice, Narrative, Principles, Personas, States, Motion 섹션을 얹었습니다. 색상 코드만으로는 안 잡히는 "이 브랜드는 어떻게 말하는가"를 담는 자리입니다.

공식 사이트가 이 차이를 보여주는 방식이 재미있습니다. 같은 프롬프트를 같은 모델에 주되 DESIGN.md만 읽히고 안 읽히고를 나눠 결과 UI를 나란히 놓습니다. 기본 CTA 버튼의 "Get Started"가 토스 레퍼런스를 물리면 "3초만에 시작하기"가 되고, "Error 500: Internal Server Error" 토스트는 리니어 레퍼런스에서 "Sync paused — we'll retry in 4 seconds"로 바뀝니다. 빈 화면의 "No data available"조차 Anthropic 레퍼런스를 거치면 "Nothing here yet — and that's a good place to begin"이 되고요.

<figure>
  <img src="/assets/images/posts/7a855f56-283c-465d-b072-3e16af7791ae/oh-my-design-with-without-designmd-5.png" alt="DESIGN.md 유무로 달라진 CTA 버튼·빈 화면·에러 토스트 문구 비교 데모" width="1200" height="1621" loading="lazy" decoding="async">
  <figcaption>왼쪽이 맨몸의 에이전트, 오른쪽이 DESIGN.md를 읽은 에이전트입니다. 차이는 전부 말투에서 옵니다</figcaption>
</figure>

토큰 값이 아니라 전부 말투의 차이입니다. 이 감각을 홈페이지는 "Tokens get you halfway. Voice takes you home."이라고 요약합니다. 토큰은 절반까지만 데려다주고, 나머지 절반은 목소리가 채운다는 거죠.

## 스킬 20개가 굴러가는 방식

번들의 알맹이는 스킬입니다. 핵심 플로우는 `omd:init`입니다. "가족 식단 기록 앱의 DESIGN.md를 만들어줘. Toss를 레퍼런스로 쓰되 확인된 값만 가져와"라고 말하면, 스킬이 카탈로그에서 레퍼런스를 추천하고 → 사용자 확인을 받고 → 선택된 레퍼런스의 톤을 보존하면서 프로젝트 맥락을 반영한 DESIGN.md를 프로젝트 루트에 씁니다. 흥미롭게도 이 과정에서 CLI 서브커맨드는 하나도 호출하지 않습니다. 추천 점수 계산까지 전부 에이전트가 로컬 파일을 읽어 세션 안에서 처리합니다.

그 외에도 인터페이스 품질을 점검하는 `omd:feel`, AI 특유의 밋밋한 UI를 잡아내는 `omd:slop-audit`, 그리고 취향 루프(`omd:learn` / `omd:remember` / `omd:taste`)가 있습니다. 취향 루프는 작업 중 사용자가 한 교정("버튼은 더 각지게")을 `.omd/preferences.md`에 쌓아뒀다가 다음 작업에 반영하는 구조로, "내 취향 보여줘" 한마디면 지금까지 배운 것과 대기 중인 것을 한 화면으로 보여줍니다.

이 스킬들이 슬래시 명령 없이 자연어로 발동하는 비결은 hooks입니다. 설치 시 프로젝트의 `.claude/settings.json`에 UserPromptSubmit·SessionStart·PostToolUse 훅이 등록돼, 프롬프트가 들어올 때마다 노드 스크립트가 스킬 발동 여부를 판단합니다. 편리한 만큼 모든 프롬프트마다 끼어드는 레이어가 하나 생깁니다.

서브에이전트는 `omd-master`와 UX 리서치·a11y 감사·페르소나 테스트·카피 다듬기 같은 스페셜리스트 17명 구성입니다. 상세 목록은 [공식 문서](https://oh-my-design.kr/docs/ko)에 정리돼 있습니다.

## 쓰기 전에 알아둘 것들

이번에도 걸리는 지점을 적습니다.

**레퍼런스의 법적 지위를 오해하면 안 됩니다.** README의 라이선스 조항이 명시하듯 코드는 MIT지만 레퍼런스는 각 기업의 자산이고, 교육적 참조 목적으로 재구성된 것입니다. "Toss 스타일로"는 영감의 출발점이지, 토스의 색·폰트·문구를 그대로 이식해도 된다는 면허가 아닙니다. 토스 레퍼런스 스스로 Toss Product Sans의 재배포 권리가 확인되지 않았다고 적어둔 이유입니다.

**값은 낡습니다.** 레퍼런스의 색과 타이포그래피는 특정 날짜에 실측한 스냅샷입니다. 기업이 리브랜딩하면 그 순간부터 어긋나기 시작합니다. 프런트매터의 `verified` 날짜를 확인하는 습관이 필요하고, 앞서 말했듯 v2 검증 스키마 적용은 아직 일부입니다.

**프로젝트에 파일이 꽤 많이 깔립니다.** 스킬·서브에이전트·훅·카탈로그가 저장소 안의 `.claude/`(또는 채널별 경로)에 들어옵니다. 혼자 쓰는 저장소면 상관없지만 팀 저장소라면 커밋 전에 합의가 필요합니다. 대신 관리는 신경 쓴 편입니다. 관리 파일에 마커와 해시를 심어 재설치 시 제자리 갱신하고, 사용자가 손댄 파일은 덮어쓰지 않고 건너뛰며(`skipped-drift`), `doctor`가 범위 한정 복구 명령을 알려줍니다.

**릴리스 속도가 빠릅니다.** [npm 기준](https://www.npmjs.com/package/oh-my-design-cli) 2026년 4월 말 첫 배포에서 석 달 만에 1.9.0까지 왔습니다. 그 사이 MCP 제거 같은 구조 변경도 있었고 0.1.x 사용자용 MIGRATION.md가 따로 있을 정도입니다. 좋게 보면 활발한 것이고, 조심스럽게 보면 반년 뒤 워크플로가 지금과 같으리란 보장은 없습니다.

**추론 품질은 결국 에이전트 몫입니다.** 이 도구는 좋은 컨텍스트를 만들어 넣어줄 뿐, UI를 그리는 건 여전히 Claude Code나 Codex입니다. DESIGN.md가 있어도 에이전트가 무시하는 날이 있다는 건, 이런 파일 규약을 써본 분이라면 아실 겁니다. 그래서 `omd:harness`나 `doctor` 같은 검증 장치가 세트로 붙어 있는 것이고요.

## 정리

- oh-my-design은 코딩 에이전트(Claude Code·Codex·OpenCode·Cursor)에 DESIGN.md 기반 디자인 워크플로를 설치하는 오픈소스 CLI입니다. MIT 라이선스, 한국 개발자 프로젝트입니다.
- 기업 레퍼런스 440개가 들어 있고, 값마다 어느 화면에서 어떤 방법으로 언제 확인했는지 근거를 답니다. 다만 신형 검증 스키마 적용은 아직 일부(약 140개)입니다.
- Google Stitch의 DESIGN.md 명세에 Voice·Narrative·Personas 등을 얹어, 토큰만으로 안 잡히는 브랜드의 말투까지 명세화합니다.
- 로컬 파일 기반입니다. API 키·데몬·MCP 서버 없이 기존 에이전트 세션 안에서 동작하고, 초기의 MCP 방식은 의도적으로 걷어냈습니다.
- 레퍼런스는 각 기업의 자산이라 그대로 이식하면 안 되고, 실측 스냅샷이라 낡을 수 있습니다. 팀 저장소에는 설치 파일 커밋 합의가 필요합니다.

저장소는 <https://github.com/kwakseongjae/oh-my-design>, 카탈로그와 문서는 [oh-my-design.kr](https://oh-my-design.kr/)입니다. 다음 편에서도 묻혀 있는 저장소를 하나 골라 열어보겠습니다.

<!-- SOURCE-PROVENANCE -->
## 출처 및 확인 기준

- [oh-my-design README](https://github.com/kwakseongjae/oh-my-design) — kwakseongjae · 공식 문서 · 확인 2026-08-09 · 근거: 지원 에이전트 4종과 채널별 설치물, 스킬 20개·서브에이전트 18개·레퍼런스 440개 이상, API 키·데몬·MCP 서버 불필요, MCP 구현 아카이브, MIT 라이선스와 레퍼런스의 법적 지위
- [Design Systems 카탈로그](https://oh-my-design.kr/design-systems) — oh-my-design · 공식 데이터 · 확인 2026-08-09 · 근거: 품질 등급 분포(141 Verified v2 · 159 Partial · 140 Legacy)와 "신뢰는 근거·신선도·충돌로 계산한다"는 원칙
- [oh-my-design 공식 문서](https://oh-my-design.kr/docs/ko) — oh-my-design · 공식 문서 · 확인 2026-08-09 · 근거: 스킬·서브에이전트 상세 구성과 설치 옵션
- [Google Stitch DESIGN.md Overview](https://stitch.withgoogle.com/docs/design-md/overview/) — Google · 공식 문서 · 확인 2026-08-09 · 근거: oh-my-design이 확장의 바닥으로 삼는 DESIGN.md 명세의 출처
- [oh-my-design-cli — npm](https://www.npmjs.com/package/oh-my-design-cli) — npm registry · 공식 데이터 · 확인 2026-08-09 · 근거: 첫 배포 2026년 4월 말, 현재 1.9.0(2026-07-21)이라는 릴리스 이력
<!-- /SOURCE-PROVENANCE -->

<!-- RELATED-POSTS -->
## 이어서 읽기

### 오픈소스 발굴 시리즈

- 이전 편: [\[오픈소스 발굴 #1\] AutoThreads, Threads 계정 운영을 AI에게 맡기는 오픈소스 데스크톱 앱](/%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4-%EB%B0%9C%EA%B5%B4-1-AutoThreads-Threads-%EA%B3%84%EC%A0%95-%EC%9A%B4%EC%98%81%EC%9D%84-AI%EC%97%90%EA%B2%8C-%EB%A7%A1%EA%B8%B0%EB%8A%94-%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4-%EB%8D%B0%EC%8A%A4%ED%81%AC%ED%86%B1-%EC%95%B1/)
<!-- /RELATED-POSTS -->
