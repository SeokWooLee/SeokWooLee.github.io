---
title: "[Claude Code #1] /init, CLAUDE.md 자동 생성으로 시작하기"
description: "Claude Code /init 명령어는 코드베이스를 분석해 CLAUDE.md를 자동 생성합니다. 기존 파일이 있을 때의 동작, Cursor·Copilot 룰 이관, 대화형 모드, 생성 후 다듬는 기준까지 정리했습니다."
header:
  og_image: /assets/images/posts/29f64ad2-15d8-41ec-84be-686abdce13e9/claude-code-init-1.jpg
categories:
  - AI
  - 개발 도구
tags:
  - ClaudeCode
  - init
  - CLAUDEmd
  - 슬래시커맨드
permalink: /Claude-Code-1-init-CLAUDEmd-자동-생성으로-시작하기/
toc: true
toc_sticky: true
last_modified_at: 2026-08-17
---

AI 코딩 도구를 새 프로젝트에 붙이면 같은 설명을 반복하게 됩니다. 빌드 명령은 뭔지, 테스트는 어떻게 돌리는지, 코드는 어떤 규칙으로 쓰는지요.

Claude Code는 이 설명을 CLAUDE.md라는 파일에 담아 두고 매 세션 자동으로 읽습니다. 문제는 이 파일을 맨손으로 처음 쓰기가 은근히 막막하다는 점이에요.

`/init`은 그 첫 문턱을 넘겨주는 명령어입니다. 코드베이스를 분석해서 CLAUDE.md 초안을 대신 만들어 줍니다.

<figure>
  <img src="/assets/images/posts/29f64ad2-15d8-41ec-84be-686abdce13e9/claude-code-init-1.jpg" alt="CLAUDE CODE /INIT 텍스트와 터미널에서 새싹처럼 자라나는 CLAUDE.md 문서 일러스트" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>터미널에 심은 씨앗 하나가 CLAUDE.md로 자랍니다</figcaption>
</figure>

이 글은 Claude Code 명령어를 하나씩 뜯어보는 시리즈의 첫 편입니다. 가장 먼저 실행하게 되는 명령어부터 시작할게요.

## /init이 하는 일

세션 입력창에 `/init`을 치면 Claude가 프로젝트를 훑기 시작합니다.

[공식 메모리 문서](https://code.claude.com/docs/en/memory)는 이 과정을 이렇게 설명합니다. 코드베이스를 분석해 빌드 명령, 테스트 방법, 프로젝트 컨벤션을 찾아내고 그 내용으로 CLAUDE.md를 생성한다고요.

결과물은 대략 이런 모양입니다.

```markdown
# CLAUDE.md

## 빌드와 테스트
- 개발 서버: pnpm dev
- 테스트: pnpm test (커밋 전 필수)

## 구조
- API 핸들러는 src/api/handlers/에 둔다
- 공용 타입은 src/lib/types.ts에 모은다
```

package.json이나 Makefile에서 읽어낼 수 있는 정보가 뼈대가 됩니다. 사람이 처음부터 쓰면 30분 걸릴 초안이 몇 분 안에 나와요.

여기서 CLAUDE.md가 뭐고 왜 필요한지 궁금하시다면, [Claude Code 룰과 메모리 정리 글](/Claude-Code-룰과-메모리-CLAUDEmd와-메모리-기능은-뭐가-다를까/)을 먼저 읽고 오시면 좋습니다.

## 이미 CLAUDE.md가 있다면

`/init`을 다시 실행해도 기존 파일을 덮어쓰지 않습니다.

공식 문서 기준으로, 파일이 이미 있으면 덮어쓰기 대신 개선안을 제안합니다. 그래서 프로젝트를 한참 진행한 뒤에 실행해도 안전해요.

오래된 CLAUDE.md를 점검할 때 주기적으로 돌려볼 만합니다. 그 사이 바뀐 빌드·테스트 절차를 반영한 개선안을 제안해 주거든요.

## 다른 AI 도구에서 넘어올 때

`/init`은 다른 코딩 에이전트의 룰 파일도 읽습니다.

Cursor의 `.cursor/rules/`와 `.cursorrules`, GitHub Copilot의 `.github/copilot-instructions.md`가 대상입니다. 관련 있는 내용을 골라 새로 만드는 CLAUDE.md에 녹여 넣습니다.

이미 AGENTS.md를 쓰는 저장소라면 방법이 따로 있습니다. CLAUDE.md 안에 `@AGENTS.md` 한 줄을 넣으면 그 파일을 통째로 불러옵니다.

```markdown
@AGENTS.md

## Claude Code 전용 지시
- src/billing/ 아래를 고칠 땐 계획 모드를 먼저 쓴다
```

두 도구가 같은 룰을 읽게 되니 내용을 복사해 둘 필요가 없어요.

Codex CLI나 Gemini CLI를 쓰던 저장소라면 `/import` 명령어가 따로 있습니다. 지시 파일부터 MCP 서버·커맨드·스킬까지 한 번에 옮겨 줍니다(v2.1.213 이상).

<figure>
  <img src="/assets/images/posts/29f64ad2-15d8-41ec-84be-686abdce13e9/claude-code-init-2.png" alt="Claude Code /init 명령어의 코드베이스 분석과 CLAUDE.md 생성 흐름 다이어그램" width="1048" height="1500" loading="lazy" decoding="async">
  <figcaption>/init 실행 흐름이에요. 파일 유무에 따라 생성과 개선 제안으로 갈립니다</figcaption>
</figure>

## 대화형 /init 켜기

환경 변수 하나로 `/init`을 더 꼼꼼한 대화형 모드로 바꿀 수 있습니다.

```bash
CLAUDE_CODE_NEW_INIT=1 claude
```

이 모드의 `/init`은 무엇을 만들지부터 물어봅니다. CLAUDE.md만 만들지, 스킬과 훅(hook, 특정 시점에 자동 실행되는 스크립트)까지 세팅할지 고르는 식이에요.

그다음 서브에이전트로 코드베이스를 탐색하고, 부족한 정보는 되물어서 채웁니다. 파일을 쓰기 전에 제안서를 먼저 보여 주니 검토한 뒤 반영하면 됩니다.

이 모드에서는 읽는 룰 파일 범위도 넓어집니다. AGENTS.md, `.windsurf/rules/`, `.clinerules` 같은 다른 도구 설정까지 참고 대상이 됩니다.

## 만들었으면 확인부터

생성이 끝나면 `/context`를 실행해 보세요.

Memory files 항목에 CLAUDE.md가 보이면 정상적으로 로드된 겁니다. 여기 없으면 Claude는 그 파일을 못 읽고 있는 거예요.

파일을 열어 고치고 싶을 땐 `/memory` 명령어를 쓰면 됩니다. 세션 안에서 바로 편집기로 열어 줍니다.

## 초안은 초안일 뿐, 다듬는 기준

`/init`이 만든 파일을 그대로 두면 아까운 지점이 하나 있습니다. 자동 분석으로는 찾을 수 없는 지식이 빠져 있거든요.

공식 문서도 파일을 만든 뒤에는 "Claude가 스스로 발견할 수 없는 지시"를 보태라고 권합니다. 왜 이런 구조를 택했는지, 어떤 함정을 피해야 하는지 같은 맥락 말이죠.

다듬을 때 기준은 두 가지만 기억하면 됩니다.

첫째, 파일당 200줄 이하를 목표로 합니다. 길수록 컨텍스트를 잡아먹고 지시 준수율도 떨어집니다.

둘째, 검증 가능한 문장으로 씁니다. "코드를 깔끔하게"보다 "들여쓰기는 2칸"이 훨씬 잘 지켜집니다.

디렉터리 목록처럼 코드만 봐도 알 수 있는 내용은 지워도 됩니다. `/doctor` 점검이 이런 군더더기를 찾아 삭제를 제안해 주기도 합니다(v2.1.206 이상).

짧게 유지해야 하는 이유가 더 궁금하시다면 [CLAUDE.md는 왜 짧아야 할까](/CLAUDEmd는-왜-짧아야-할까-AI-에이전트-상시-로드-컨텍스트-설계법/) 편에서 자세히 다뤘습니다.

<figure>
  <img src="/assets/images/posts/29f64ad2-15d8-41ec-84be-686abdce13e9/claude-code-init-3.jpg" alt="REFINE THE DRAFT 문구와 CLAUDE.md 초안을 빨간 펜으로 다듬는 손 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>초안을 200줄 아래로 다듬는 건 사람 몫이에요</figcaption>
</figure>

## 정리

`/init`은 새 프로젝트에서 Claude Code를 시작할 때 가장 먼저 거치는 관문입니다.

코드베이스 분석으로 CLAUDE.md 초안을 만들고, 기존 파일이 있으면 개선안을 제안합니다. Cursor·Copilot 룰 이관까지 해 주니 도구를 갈아탈 때도 유용해요.

다만 초안은 출발점입니다. 자동 분석이 못 찾는 팀의 맥락을 보태고, 200줄 이하로 다듬는 일은 사람 몫으로 남습니다.

다음 편 [Claude Code 2편](/Claude-Code-2-plan-계획-모드-수정-전에-설계부터-합의하기/)에서는 코드를 고치기 전에 설계부터 합의하는 `/plan` 계획 모드를 다룹니다.

## 출처 및 확인 기준

- [Claude Code 공식 문서 — How Claude remembers your project](https://code.claude.com/docs/en/memory) (Anthropic, 2026-08-12 확인)

<!-- RELATED-POSTS -->
## 이어서 읽기

- [바이브 코딩(Vibe Coding) 사고, 룰 파일로 애초에 막는 법](/%EB%B0%94%EC%9D%B4%EB%B8%8C-%EC%BD%94%EB%94%A9Vibe-Coding-%EC%82%AC%EA%B3%A0-%EB%A3%B0-%ED%8C%8C%EC%9D%BC%EB%A1%9C-%EC%95%A0%EC%B4%88%EC%97%90-%EB%A7%89%EB%8A%94-%EB%B2%95/)
- [\[에이전트 설계 #1\] 하네스 엔지니어링이란? 프롬프트 다음에 오는 것](/%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%84%A4%EA%B3%84-1-%ED%95%98%EB%84%A4%EC%8A%A4-%EC%97%94%EC%A7%80%EB%8B%88%EC%96%B4%EB%A7%81%EC%9D%B4%EB%9E%80-%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8-%EB%8B%A4%EC%9D%8C%EC%97%90-%EC%98%A4%EB%8A%94-%EA%B2%83/)
- [\[MCP·Skill #2\] AI 에이전트 Skill 완벽 정리, 슬래시 커맨드부터 자동 트리거까지](/MCPSkill-2-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-Skill-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC-%EC%8A%AC%EB%9E%98%EC%8B%9C-%EC%BB%A4%EB%A7%A8%EB%93%9C%EB%B6%80%ED%84%B0-%EC%9E%90%EB%8F%99-%ED%8A%B8%EB%A6%AC%EA%B1%B0%EA%B9%8C%EC%A7%80/)
<!-- /RELATED-POSTS -->
