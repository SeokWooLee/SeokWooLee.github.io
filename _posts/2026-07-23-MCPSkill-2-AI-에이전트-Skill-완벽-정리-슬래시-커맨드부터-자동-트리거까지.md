---
title: "[MCP·Skill #2] AI 에이전트 Skill 완벽 정리, 슬래시 커맨드부터 자동 트리거까지"
description: "AI 코딩 도구를 쓰다 보면 같은 지시를 반복하게 됩니다. \"커밋 메시지는 이 형식으로\", \"배포 전엔 이 체크리스트대로\" 같은 것들이요."
header:
  og_image: /assets/images/posts/60116d30-9205-43b5-b09e-610a09bd6239/1.png
tags:
  - ClaudeCode
  - Skill
  - AI에이전트
  - 슬래시커맨드
permalink: /MCPSkill-2-AI-에이전트-Skill-완벽-정리-슬래시-커맨드부터-자동-트리거까지/
toc: true
toc_sticky: true
last_modified_at: 2026-07-23
---

AI 코딩 도구를 쓰다 보면 같은 지시를 반복하게 됩니다. "커밋 메시지는 이 형식으로", "배포 전엔 이 체크리스트대로" 같은 것들이요.

매번 프롬프트로 설명하자니 길고 CLAUDE.md나 AGENTS.md 같은 상시 규칙 파일에 다 넣자니 매 세션 컨텍스트만 무거워집니다.

Skill은 이 반복을 해결하는 기능입니다. 한 문장으로 정리하면, 특정 작업의 절차와 지식을 파일로 패키징해 두고 필요할 때만 불러오는 모듈이에요.

원래 Claude Code의 기능으로 출발했지만, 지금은 특정 도구의 전유물이 아닙니다. 2025년 12월 Anthropic이 Agent Skills라는 이름의 오픈 표준으로 스펙을 공개했고, 이후 OpenAI Codex, Gemini CLI, Cursor, VS Code(GitHub Copilot) 등 30개가 넘는 도구가 같은 형식을 채택했습니다. 한 번 만든 SKILL.md 파일이 도구를 갈아타도 그대로 통한다는 뜻이에요.

이 글에서는 Skill의 구조, 슬래시 커맨드와 자동 트리거라는 두 가지 호출 방식, 도구별 지원 현황, 그리고 상시 규칙 파일과의 역할 구분까지 정리합니다. 예시는 가장 먼저 이 기능을 도입한 Claude Code 기준으로 들되, 개념은 어느 도구에서나 동일합니다.

<figure>
  <img src="/assets/images/posts/60116d30-9205-43b5-b09e-610a09bd6239/1.png" alt="반복 지시를 카드처럼 꺼내 쓰는 게 Skill입니다">
  <figcaption>반복 지시를 카드처럼 꺼내 쓰는 게 Skill입니다</figcaption>
</figure>

핵심 요약부터 보고 갈게요.

1. Skill은 SKILL.md 파일 하나로 시작하는 지시서 폴더이며, 이제 도구를 가리지 않는 오픈 표준입니다
2. 호출 방식은 두 가지, 사용자가 직접 부르는 슬래시 커맨드와 모델이 알아서 부르는 자동 트리거입니다
3. 핵심 설계는 점진적 로딩입니다. 평소엔 이름·설명만 올라가 있고 본문은 실행 시점에 읽습니다
4. 항상 적용할 규칙은 CLAUDE.md·AGENTS.md 같은 상시 규칙 파일에, 특정 작업 절차는 Skill로 나누는 게 기준입니다

---

## Skill의 실체는 마크다운 폴더

Skill의 구조는 단순합니다. 폴더 하나에 SKILL.md 파일 하나면 최소 요건이 끝나요.

```markdown
---
name: release-note
description: 릴리스 노트 초안 작성. "릴리스 노트", "배포 노트" 요청 시 사용
---

# 릴리스 노트 작성 절차
1. 직전 태그 이후의 커밋을 모은다
2. feat/fix/chore로 분류한다
3. 사용자 영향 순으로 정렬해 초안을 쓴다
```

상단 frontmatter의 name과 description이 등록 정보이고 아래 본문이 실제 절차서입니다. 폴더 안에 참고 문서나 스크립트를 더 넣어서 "지시서 + 도구 상자"로 확장할 수도 있어요.

표준이 정의하는 건 딱 이 형식까지입니다. 파일을 어느 폴더에서 읽을지는 도구마다 다르므로, 주로 쓰는 도구의 경로만 알아두면 됩니다.

| 도구 | 스킬 디렉터리 |
| --- | --- |
| Claude Code | `~/.claude/skills/` (전역), `프로젝트/.claude/skills/` (프로젝트) |
| OpenAI Codex | `.agents/skills/` |
| Gemini CLI (Antigravity) | `~/.gemini/antigravity/skills/` |

프로젝트 폴더에 넣으면 git으로 팀원과 공유된다는 점이 실무에서 특히 유용합니다. 작업 노하우가 개인 메모가 아니라 저장소의 자산이 되니까요. 팀원이 서로 다른 코딩 에이전트를 쓰더라도 같은 SKILL.md를 읽을 수 있으니, 도구 통일 없이도 절차를 공유할 수 있습니다.

---

## 호출 방식 두 가지, 수동과 자동

Skill이 실행되는 경로는 두 갈래입니다.

첫째, 슬래시 커맨드. 사용자가 `/release-note`처럼 직접 입력해서 명시적으로 호출합니다. 언제 실행할지 사람이 결정하는 방식이죠.

둘째, 자동 트리거. 모델이 대화 내용을 보고 "이 요청은 저 Skill 소관이네"라고 판단해 스스로 불러옵니다. 이때 판단 근거가 되는 게 frontmatter의 description입니다.

> description은 사람용 설명이 아니라 모델용 라우팅 조건입니다. "언제 이 Skill을 써야 하는지"를 트리거 문구까지 포함해 구체적으로 적을수록 자동 호출이 정확해집니다.

<figure>
  <img src="/assets/images/posts/60116d30-9205-43b5-b09e-610a09bd6239/2.png" alt="직접 호출하든 자동 트리거든 결국 같은 SKILL.md를 읽습니다" loading="lazy">
  <figcaption>직접 호출하든 자동 트리거든 결국 같은 SKILL.md를 읽습니다</figcaption>
</figure>

여기서 점진적 로딩(progressive disclosure)이라는 설계가 중요합니다. 세션 시작 시점에 컨텍스트에 올라가는 건 각 Skill의 이름과 description 한 줄뿐이에요. 본문 전체는 해당 Skill이 실제로 호출될 때만 읽습니다.

덕분에 Skill을 수십 개 등록해도 평소 컨텍스트 부담은 거의 없습니다. 상시 규칙 파일에 모든 절차를 때려 넣는 방식과의 결정적 차이가 여기에 있어요. 여러 벤더가 이 형식을 받아들인 큰 이유도 바로 이 점진적 로딩입니다. 컨텍스트 윈도는 어느 모델에게나 비싼 자원이니까요.

---

## 상시 규칙 파일과 역할 나누기

Claude Code의 CLAUDE.md, Codex의 AGENTS.md, Cursor의 rules처럼 도구마다 "항상 읽는 규칙 파일"이 따로 있습니다. 둘 다 "모델에게 주는 지시"라서 헷갈리기 쉬운 부분입니다. 기준은 적용 시점이에요.

- 상시 규칙 파일(CLAUDE.md·AGENTS.md 등): 매 세션, 모든 작업에 항상 적용되는 규칙. 코딩 컨벤션, 금지 사항, 프로젝트 배경
- Skill: 특정 작업을 할 때만 필요한 절차. 배포, 리뷰, 문서 생성 같은 단위 업무

"항상 참이어야 하는가?"라고 물었을 때 그렇다면 상시 규칙 파일, 특정 상황에서만 참이면 Skill입니다. 항상 적용할 규칙을 Skill로 빼면 트리거가 안 될 때 규칙이 증발합니다. 반대로 절차를 전부 상시 규칙 파일에 넣으면 컨텍스트가 낭비됩니다.

<figure>
  <img src="/assets/images/posts/60116d30-9205-43b5-b09e-610a09bd6239/3.png" alt="Skill의 실체는 에디터에서 열어보는 마크다운 파일 하나예요" loading="lazy">
  <figcaption>Skill의 실체는 에디터에서 열어보는 마크다운 파일 하나예요</figcaption>
</figure>

---

## 만들 때 걸리는 부분

실전에서 자주 부딪히는 지점 두 가지만 짚어둘게요.

자동 트리거가 안 될 때는 거의 항상 description 문제입니다. "문서 작성 도우미"처럼 추상적으로 쓰면 모델이 언제 써야 할지 판단을 못 해요. 실제 사용자가 입력할 법한 문구를 나열해 주는 게 효과적입니다.

반대로 너무 자주 트리거될 때는 description에 "~할 때만 사용, 단순 질문에는 사용하지 않음"처럼 제외 조건을 명시하면 잡힙니다.

이 요령은 어느 도구에서나 통합니다. 자동 트리거의 판단 주체가 결국 모델이고 모델이 보는 건 description 한 줄이라는 구조가 표준 차원에서 같기 때문입니다.

---

## 마무리

Skill은 결국 프롬프트의 함수화입니다. 반복되는 지시를 복사·붙여넣기하는 대신 이름 붙여 저장하고 필요할 때만 로드하는 거죠. 그리고 이제는 그 함수가 특정 도구에 종속되지 않는 표준 형식이 됐습니다.

한 번이라도 같은 지시를 두 번 타이핑했다면, 그게 첫 Skill 후보입니다. 오늘 만든 SKILL.md 하나가 내년에 어떤 에이전트를 쓰든 따라올 겁니다.

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [[AI 컨텍스트 #5] 서브에이전트는 왜 쓰나, AI 에이전트 컨텍스트 격리의 원리와 위임 기준](/AI-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-5-%EC%84%9C%EB%B8%8C%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8%EB%8A%94-%EC%99%9C-%EC%93%B0%EB%82%98-AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EA%B2%A9%EB%A6%AC%EC%9D%98-%EC%9B%90%EB%A6%AC%EC%99%80-%EC%9C%84%EC%9E%84-%EA%B8%B0%EC%A4%80/)
- [AI 에이전트 메모리 설계, 컨텍스트 밖에 두는 기술 (계획 파일·메모리·RAG)](/AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%84%A4%EA%B3%84-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8-%EB%B0%96%EC%97%90-%EB%91%90%EB%8A%94-%EA%B8%B0%EC%88%A0-%EA%B3%84%ED%9A%8D-%ED%8C%8C%EC%9D%BC%EB%A9%94%EB%AA%A8%EB%A6%ACRAG/)
- [컨텍스트가 길수록 AI는 멍청해진다, lost in the middle과 context rot](/%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8%EA%B0%80-%EA%B8%B8%EC%88%98%EB%A1%9D-AI%EB%8A%94-%EB%A9%8D%EC%B2%AD%ED%95%B4%EC%A7%84%EB%8B%A4-lost-in-the-middle%EA%B3%BC-context-rot/)
<!-- /RELATED-POSTS -->
