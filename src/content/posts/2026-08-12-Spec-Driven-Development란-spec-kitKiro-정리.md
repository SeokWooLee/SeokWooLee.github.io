---
title: "Spec Driven Development란? spec-kit·Kiro 정리"
description: "SDD(Spec Driven Development, 명세 주도 개발)는 코드를 시키기 전에 명세를 문서로 확정하고 그것을 단일 진실 원천으로 삼는 방법론입니다. spec·plan·tasks 4단계 흐름과 도구 두 가지, 바이브 코딩과의 구분선을 정리했습니다."
header:
  og_image: /assets/images/posts/a91763ec-5b7e-41e2-bdbb-7a851d9fa162/spec-driven-development-1.jpg
categories:
  - AI
tags:
  - SpecDrivenDevelopment
  - SDD
  - spec-kit
  - Kiro
permalink: /Spec-Driven-Development란-spec-kitKiro-정리/
toc: true
toc_sticky: true
last_modified_at: 2026-08-12
---

AI에게 코딩을 시키는 방식이 빠르게 갈라지고 있습니다.

한쪽엔 대화하며 즉흥적으로 만들어 가는 바이브 코딩이 있습니다. 반대쪽엔 이 글의 주제인 스펙 주도 개발(Spec Driven Development, SDD)이 있고요.

한 문장으로 정리하면 이렇습니다. SDD는 코드를 시키기 전에 명세(spec)부터 문서로 확정합니다.

그 문서를 단일 진실 원천으로 삼아, AI가 계획·구현·검증을 진행하게 하는 방법론이죠.

이 글에서는 SDD의 작동 구조, 대표 도구인 spec-kit과 Kiro, 그리고 바이브 코딩과의 사용 구분 기준까지 정리합니다. 도구 정보는 2026년 8월 기준입니다.

<figure>
  <img src="/assets/images/posts/a91763ec-5b7e-41e2-bdbb-7a851d9fa162/spec-driven-development-1.jpg" alt="SPEC DRIVEN DEV 텍스트와 청사진을 따라 코드 블록을 쌓는 로봇 팔 썸네일" width="1024" height="1024" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>코드보다 먼저 확정되는 건 설계도, 그게 SDD의 전부입니다</figcaption>
</figure>

핵심 요약부터 보고 갈게요.

1. SDD는 "무엇을 만들지"를 spec 문서로 먼저 확정하고, 코드는 그 산출물로 취급하는 방법론입니다
2. 흐름은 spec(요구사항) → plan(기술 설계) → tasks(작업 분해) → 구현의 4단계입니다
3. GitHub의 spec-kit, AWS의 Kiro가 이 흐름을 도구로 구현한 대표 주자입니다
4. 프로토타입엔 바이브 코딩, 오래 유지할 제품 코드엔 SDD라는 게 대체적인 구분선입니다

---

## 왜 스펙이 다시 소환됐나

문서부터 쓰고 개발하자는 얘기 자체는 새롭지 않습니다. 폭포수 시절의 요구사항 명세서가 바로 그거였고 무겁다는 이유로 애자일에 밀려났죠.

그런데 AI 에이전트가 등장하면서 상황이 뒤집혔습니다. 사람 개발자는 모호한 요구를 받아도 질문하고 맥락을 채워 가며 일합니다.

반면 AI는 모호한 프롬프트를 받으면 빈칸을 그럴듯한 추측으로 메꿉니다. 결과물이 요구와 다른데 겉보기엔 멀쩡한, 가장 골치 아픈 형태의 불량이 나오는 거예요.

그래서 "AI에게 일을 시키려면 모호함을 먼저 제거해야 한다"는 요구가 생겼고, 그 답으로 명세가 다시 소환된 겁니다. 이번엔 사람이 읽는 문서가 아니라 AI가 실행 기준으로 삼는 문서라는 점이 다릅니다.

---

## 4단계 파이프라인, spec에서 tasks까지

도구마다 이름은 조금씩 다르지만 골격은 같습니다.

| 단계 | 산출물 | 확정하는 것 |
| --- | --- | --- |
| Specify | spec.md | 무엇을, 왜 만드는가 (요구사항·시나리오) |
| Plan | plan.md | 어떻게 만드는가 (기술 스택·아키텍처) |
| Tasks | tasks.md | 어떤 순서로 만드는가 (작업 단위 분해) |
| Implement | 코드 | 각 task를 순서대로 구현 |

<figure>
  <img src="/assets/images/posts/a91763ec-5b7e-41e2-bdbb-7a851d9fa162/spec-driven-development-2.png" alt="spec에서 plan·tasks를 거쳐 구현으로 가는 SDD 4단계 흐름 다이어그램" width="754" height="1116" loading="lazy" decoding="async">
  <figcaption>단계마다 사람 승인을 거치고, 요구 변경은 코드가 아니라 spec으로 돌아갑니다</figcaption>
</figure>

핵심 규칙은 두 가지입니다.

첫째, 각 단계 산출물을 사람이 검토·승인한 뒤에만 다음 단계로 넘어갑니다. 모호함이 코드에 도달하기 전에 문서 단계에서 걸러지는 구조죠.

둘째, 구현 중 요구가 바뀌면 코드가 아니라 spec을 고치고 아래 단계를 다시 태웁니다. spec이 항상 최신 진실이어야 하기 때문입니다.

> 관점을 뒤집으면 이렇게 됩니다. 코드는 더 이상 원본이 아니라 spec을 컴파일한 결과물이고, 진짜 소스는 문서라는 겁니다.

---

## 도구 둘, spec-kit과 Kiro

GitHub의 spec-kit은 특정 에이전트에 종속되지 않는 오픈소스 툴킷입니다.

Claude Code, Copilot, Gemini CLI 등 위에 /specify, /plan, /tasks 슬래시 커맨드를 얹습니다. 그렇게 위 파이프라인을 강제하죠.

프로젝트의 불변 원칙을 담는 constitution 문서를 두는 것도 특징이에요.

AWS의 Kiro는 아예 SDD를 중심에 놓고 설계된 에이전트형 IDE입니다. 요구사항을 requirements.md, design.md, tasks.md 3종 문서로 만들어 줍니다.

강점은 요구사항 표기법입니다. EARS(Easy Approach to Requirements Syntax) 표기법으로 요구사항을 구조화해 주죠.

"시스템은 ~한 상황에서 ~해야 한다" 형태의 문장으로 정리되는 방식입니다.

이미 Claude Code 같은 범용 에이전트를 쓰고 있다면 spec-kit을 얹는 쪽이 도입 비용이 낮습니다. IDE 통합 경험을 원하면 Kiro가 맞고요.

---

## 바이브 코딩과의 구분선

SDD가 항상 옳은 건 아닙니다. 문서 3종을 만들고 검토하는 비용이 실제로 들기 때문에, 주말 프로토타입이나 일회성 스크립트에 적용하면 배보다 배꼽이 커집니다.

구분 기준은 코드의 수명입니다. 이번 주에 버려도 되는 코드면 바이브 코딩으로 빠르게 돌립니다.

몇 달 이상 유지·확장할 코드면 SDD로 모호함을 먼저 제거하는 쪽이 총비용이 쌉니다.

운영할 때 조심할 점도 하나 있습니다. spec과 코드가 어긋난 채 방치되는 drift입니다.

"요구 변경은 반드시 spec부터"라는 규칙이 무너지는 순간, spec은 아무도 안 믿는 문서로 전락합니다. 그러면 SDD 전체가 형식 절차가 되고요.

<figure>
  <img src="/assets/images/posts/a91763ec-5b7e-41e2-bdbb-7a851d9fa162/spec-driven-development-3.jpg" alt="출력한 명세 문서를 펜으로 함께 검토하는 두 개발자와 마크다운 체크리스트" width="1024" height="1024" loading="lazy" decoding="async">
  <figcaption>모호함은 코드 리뷰가 아니라 문서 리뷰 단계에서 걸러내는 게 쌉니다</figcaption>
</figure>

---

## 마무리

SDD는 결국 "AI 시대의 진짜 프로그래밍 언어는 자연어 명세"라는 주장입니다. 프롬프트 한 줄로 때우던 의도 전달을, 검토 가능한 문서로 승격시킨 거죠.

다음 기능 개발에서 프롬프트를 쓰기 전에 spec 문서 하나를 먼저 써 보면, 이 방법론이 본인 작업에 맞는지 하루 만에 판단할 수 있습니다.

---

## 참고 자료

- [github/spec-kit](https://github.com/github/spec-kit)
- [Kiro 공식 사이트](https://kiro.dev/)
