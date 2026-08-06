---
title: "AI 시대에 Ghostty 터미널이 뜨는 이유, cmux·Orca가 보여주는 터미널 르네상스"
description: "한동안 터미널은 \"있으면 쓰는\" 도구였습니다. IDE(통합 개발 환경)가 개발의 중심이 되면서 터미널은 빌드 로그나 확인하는 보조 창으로 밀려나 있었습니다. 그런데 2025년을 지나며 분위기가 완전히 바뀌었습니다. Claude Code, Codex CLI, Gemini CLI…"
header:
  og_image: /assets/images/posts/00d18e50-b940-4821-8f01-5afe12e74050/ghostty-terminal-ai-era-1.jpg
tags:
  - Ghostty
  - cmux
  - Orca
  - libghostty
permalink: /AI-시대에-Ghostty-터미널이-뜨는-이유-cmuxOrca가-보여주는-터미널-르네상스/
toc: true
toc_sticky: true
last_modified_at: 2026-07-25
---

## AI 시대에 Ghostty 터미널이 뜨는 이유, cmux·Orca가 보여주는 터미널 르네상스

한동안 터미널은 "있으면 쓰는" 도구였습니다. IDE(통합 개발 환경)가 개발의 중심이 되면서 터미널은 빌드 로그나 확인하는 보조 창으로 밀려나 있었습니다. 그런데 2025년을 지나며 분위기가 완전히 바뀌었습니다. Claude Code, Codex CLI, Gemini CLI 같은 AI 코딩 에이전트가 전부 **터미널 앱**으로 출시되면서 터미널이 다시 개발 워크플로의 한가운데로 돌아온 것입니다.

이 흐름에서 가장 주목받는 터미널이 Ghostty입니다. 최근 화제가 된 cmux, 그리고 Orca 같은 에이전트 운용 도구들이 하나같이 Ghostty를 기술 기반이나 품질 기준으로 삼고 있습니다. 이 글에서는 Ghostty가 무엇이 다른지, 왜 하필 AI 시대에 존재감이 커졌는지, 그리고 cmux·Orca 사례가 각각 무엇을 보여주는지 정리합니다.

<figure>
  <img src="/assets/images/posts/00d18e50-b940-4821-8f01-5afe12e74050/ghostty-terminal-ai-era-1.jpg" alt="AI 시대의 Ghostty 터미널을 표현한 히어로 일러스트, ASCII 고스트 아래 AI 코딩 에이전트가 일하는 터미널 창들이 격자로 배열된 모습" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>에이전트가 늘어날수록 터미널의 자리는 커집니다</figcaption>
</figure>

## Ghostty, HashiCorp 창업자가 만든 터미널

Ghostty는 Terraform·Vagrant를 만든 HashiCorp 공동 창업자 Mitchell Hashimoto가 개발한 오픈소스 터미널 에뮬레이터입니다. 2024년 12월 1.0이 공개됐고, Zig 언어로 작성됐습니다.

터미널 에뮬레이터 시장은 이미 포화 상태였습니다. iTerm2, Alacritty, kitty, WezTerm까지 선택지가 넘치는데 Ghostty가 파고든 지점은 명확했습니다. 기존 터미널들이 셋 중 하나를 포기했다는 것입니다.

- **빠르거나**(Alacritty) — 대신 기능이 최소한이고
- **기능이 많거나**(iTerm2) — 대신 무겁고
- **크로스 플랫폼이거나**(kitty, WezTerm) — 대신 OS 네이티브 경험이 아니고

Ghostty는 "빠르고, 기능 많고, 네이티브한" 세 가지를 모두 잡겠다는 목표로 설계됐습니다. GPU 가속 렌더링으로 속도를 확보하면서 macOS에서는 AppKit·SwiftUI, Linux에서는 GTK4로 각 플랫폼의 진짜 네이티브 UI를 씁니다. 탭·분할·단축키가 OS 표준 방식 그대로 동작하고, 설정 없이 설치 직후부터 쓸 만하다는 점이 초기 입소문의 핵심이었습니다.

<figure>
  <img src="/assets/images/posts/00d18e50-b940-4821-8f01-5afe12e74050/ghostty-terminal-ai-era-2.jpg" alt="Ghostty 터미널 공식 소셜 카드, 다크 배경에 파란 ASCII 아트 문자로 그려진 고스트 로고" width="1200" height="675" loading="lazy" decoding="async">
  <figcaption>터미널 문자로 그린 고스트, Ghostty의 정체성이 이 카드 한 장에 담겨 있습니다</figcaption>
</figure>

릴리스도 꾸준합니다. 2025년 9월의 1.2는 macOS Tahoe 지원과 커맨드 팔레트를, 2026년 3월의 1.3은 가장 많이 요청됐던 스크롤백 검색과 네이티브 스크롤바를 추가했습니다.

## 왜 하필 AI 시대에 터미널인가

AI 코딩 에이전트를 만드는 회사들이 GUI(그래픽 사용자 인터페이스) 대신 터미널을 선택한 데는 실용적인 이유가 있습니다. 터미널 앱은 로컬 맥북에서든, SSH로 접속한 서버에서든, CI 파이프라인에서든 똑같이 돌아갑니다. 에디터를 가리지 않고 어떤 개발 환경에도 끼워 넣을 수 있습니다. 에이전트 입장에서 터미널은 가장 보편적인 실행 환경인 셈입니다.

그런데 에이전트가 터미널에 들어오면서 터미널의 쓰임새 자체가 달라졌습니다.

첫째, **출력량이 폭증했습니다.** 사람이 명령어를 치고 결과를 읽던 시절과 달리, 에이전트는 코드 diff·빌드 로그·도구 호출 내역을 쉼 없이 쏟아냅니다. 스트리밍 출력이 많아질수록 렌더링 성능이 체감 품질을 좌우하고, GPU 가속 터미널의 장점이 실사용에서 드러납니다.

둘째, **동시에 여러 세션을 띄우게 됐습니다.** 에이전트 하나가 작업하는 동안 사람은 기다리기만 하니, 자연스럽게 두세 개의 에이전트를 병렬로 돌리는 방식이 자리 잡았습니다. 터미널이 "명령 한 줄 치는 창"에서 "에이전트 여러 대를 관제하는 인프라"로 바뀌었습니다.

셋째, **터미널 위에 얹을 앱이 필요해졌습니다.** 병렬 에이전트를 관리하려면 탭·알림·상태 표시 같은 관제 기능이 필요한데, 이건 터미널 에뮬레이터 본연의 기능 범위를 넘어섭니다. 그래서 "터미널을 품은 에이전트 관제 앱"이라는 새로운 앱 카테고리가 생겨났고, 이 카테고리의 앱들은 터미널 에뮬레이션을 직접 구현하는 대신 검증된 엔진을 가져다 쓰고 싶어 합니다.

바로 이 세 번째 지점에서 Ghostty의 진짜 승부수가 등장합니다.

## libghostty, 터미널을 라이브러리로

Mitchell Hashimoto는 2025년 9월 「Libghostty Is Coming」이라는 글에서 Ghostty의 다음 단계를 공개했습니다. Ghostty의 핵심을 **libghostty**라는 임베드 가능한 라이브러리로 분리해서 어떤 앱이든 검증된 터미널 에뮬레이션을 내장할 수 있게 하겠다는 계획입니다. 웹뷰가 필요한 앱이 브라우저를 새로 만들지 않고 WebKit을 가져다 쓰듯, 터미널이 필요한 앱은 libghostty를 가져다 쓰면 된다는 발상입니다.

첫 결과물이 libghostty-vt입니다. VT(Virtual Terminal, 가상 터미널) 제어 시퀀스를 해석하고 터미널 상태를 관리하는 라이브러리로, 의존성이 전혀 없고 C API(응용 프로그램 인터페이스)를 제공해 어떤 언어에서든 쓸 수 있습니다. 터미널 시퀀스 해석은 수십 년 묵은 사양이 뒤엉킨 영역이라 IDE·웹 콘솔마다 미묘하게 다르게 구현돼 왔는데, 실전에서 검증된 단일 구현을 공유하자는 것입니다. 이후 입력 처리, GPU 렌더링, 플랫폼별 위젯까지 단계적으로 라이브러리화할 계획이 공개돼 있습니다.

이 구상이 AI 에이전트 붐과 정확히 맞물렸습니다. 에이전트 관제 앱을 만들려는 팀들에게 터미널 에뮬레이션은 필수지만 직접 만들기엔 너무 깊은 영역이고, libghostty가 그 빈자리를 채우는 표준 부품이 됐습니다.

<figure>
  <img src="/assets/images/posts/00d18e50-b940-4821-8f01-5afe12e74050/ghostty-terminal-ai-era-3.png" alt="libghostty 생태계 다이어그램, Ghostty 코어에서 Ghostty 앱과 cmux로 이어지는 구조와 Orca가 Ghostty급을 표방하는 관계" width="755" height="692" loading="lazy" decoding="async">
  <figcaption>libghostty를 가운데 두면 지금의 지형도가 한눈에 들어옵니다</figcaption>
</figure>

## cmux, libghostty를 임베드한 첫 대형 사례

cmux는 manaflow-ai가 공개한 macOS 전용 터미널 앱으로, "AI 코딩 에이전트를 위한 터미널"을 표방합니다. GitHub 스타가 2만 5천 개에 이를 만큼 빠르게 주목받았습니다.

기술적으로 흥미로운 점은 cmux가 Ghostty의 포크가 아니라는 것입니다. Swift·AppKit으로 작성된 네이티브 앱이 **libghostty를 렌더링 엔진으로 임베드**하는 구조입니다. 개발팀은 이를 "앱이 웹뷰에 WebKit을 쓰는 것과 같은 방식"이라고 설명합니다. 기존 Ghostty 사용자의 설정 파일(`~/.config/ghostty/config`)을 그대로 읽어 테마·폰트도 이어받습니다.

그 위에 얹은 기능은 전부 에이전트 관제용입니다. 세로 탭으로 수많은 에이전트 세션을 훑어보고 에이전트가 입력을 기다리면 해당 탭에 파란 테두리가 켜집니다. 사이드바에는 git 브랜치·PR 상태·열려 있는 포트가 표시되고 CLI와 소켓 API로 워크스페이스 생성부터 키 입력 전송까지 스크립트로 제어할 수 있습니다. 터미널 에뮬레이션이라는 바닥 공사를 libghostty에 맡긴 덕분에, 개발팀은 관제 기능에만 집중할 수 있었던 셈입니다.

<figure>
  <img src="/assets/images/posts/00d18e50-b940-4821-8f01-5afe12e74050/ghostty-terminal-ai-era-4.jpg" alt="cmux 터미널 공식 스크린샷, 세로 탭에 병렬 AI 코딩 에이전트 세션들과 내장 브라우저·알림이 함께 표시된 화면" width="1200" height="695" loading="lazy" decoding="async">
  <figcaption>세로 탭마다 에이전트가 하나씩, 관제탑에 가까운 화면입니다</figcaption>
</figure>

## Orca, 'Ghostty급'이 품질 기준이 된 사례

Orca는 Stably가 만든 오픈소스 ADE(Agent Development Environment, 에이전트 개발 환경)입니다. 에이전트마다 독립된 git worktree를 부여해 병렬로 돌리고, 터미널·diff 리뷰·내장 브라우저를 한 앱에서 제공합니다. GitHub 스타 2만 8천 개를 넘기며 cmux와 함께 이 카테고리의 대표 주자로 꼽힙니다.

Orca가 보여주는 것은 조금 다른 종류의 영향력입니다. Orca는 공식 소개에서 자사 터미널을 "**Ghostty-class terminals**"라고 표현합니다. 실제 구현은 2026년 7월 기준 xterm.js 계열 엔진에 WebGL 렌더링을 얹은 구조로, libghostty를 쓰는 것은 아닙니다. 그런데도 자기 터미널의 품질을 설명할 때 Ghostty를 단위로 씁니다. 제품 소개 문구에 "네이티브급" 대신 "Ghostty급"이라는 표현이 등장하기 시작했다는 것, 그 자체가 어떤 도구가 사실상의 기준이 됐다는 신호입니다.

정리하면 두 사례는 Ghostty의 위상을 다른 각도에서 증명합니다. cmux는 libghostty를 **부품으로 채택**한 사례이고, Orca는 Ghostty를 **품질의 기준점으로 인용**하는 사례입니다.

## 터미널은 AI 시대의 브라우저가 될까

브라우저 전쟁의 승부를 가른 것은 브라우저 앱이 아니라 그 안의 엔진(WebKit, Blink)이었습니다. 지금 터미널에서 비슷한 구도가 만들어지고 있습니다. AI 에이전트라는 킬러 워크로드가 터미널을 다시 개발의 중심으로 끌어왔고, 그 위에 앱 카테고리가 새로 생겨나고 있으며, Ghostty는 libghostty로 그 카테고리 전체의 엔진 자리를 노리고 있습니다.

물론 변수는 남아 있습니다. libghostty는 아직 vt 모듈만 공개된 초기 단계이고, GPU 렌더링·위젯 계층까지 나와야 cmux 같은 통합이 누구에게나 쉬워집니다. 그래도 방향은 분명해 보입니다. 에이전트가 늘어날수록 터미널 세션도 늘어나고 세션이 늘어날수록 검증된 터미널 엔진의 가치는 커집니다. 터미널을 "다 똑같은 검은 창"으로만 여겨왔다면, 이제 한 번쯤 다시 들여다볼 만합니다.

<!-- HUMANIZE-SUMMARY v1.6.1
run_id: 2026-07-25-001
metrics:
  char_in: 4514
  char_out: 4510
  change_rate: 1.0%
  self_check: 6/6
  grade: A
categories:  # before → after
  C-11 연결어미 뒤 쉼표: 7 → 0
  D-6 결말 공식 '~할 때입니다': 1 → 0
  I-1 형식명사 '~것입니다' 결말: 4 → 2
  B-1 첫등장 영어 병기(프로젝트 룰): 5 → 5 (보존)
self_check:
  - 고유명사·수치·인용·[IMAGE:n] 마커 100% 보존: OK
  - 변경률 30% 이하: OK (1.0%)
  - 장르(블로그) 이탈 없음: OK
  - register(해요/합니다체) 보존: OK
  - S1 잔존 0건: OK
  - 인공 표현 추가 없음: OK
highlights:
  - id: C-11
    before: "세로 탭으로 수많은 에이전트 세션을 훑어보고, 에이전트가 입력을 기다리면 …"
    after: "세로 탭으로 수많은 에이전트 세션을 훑어보고 에이전트가 입력을 기다리면 …"
  - id: D-6
    before: "터미널을 \"다 똑같은 검은 창\"으로 여겼다면, 지금이 다시 들여다볼 때입니다."
    after: "터미널을 \"다 똑같은 검은 창\"으로만 여겨왔다면, 이제 한 번쯤 다시 들여다볼 만합니다."
  - id: I-1
    before: "… \"인프라\"로 바뀐 것입니다."
    after: "… \"인프라\"로 바뀌었습니다."
  - id: D-2/hype
    before: "… 등장하기 시작했다는 것, 이것이야말로 어떤 도구가 …"
    after: "… 등장하기 시작했다는 것, 그 자체가 어떤 도구가 …"
residual_findings: (없음) — B-1 괄호 영어 병기는 프로젝트 CLAUDE.md '축약어 첫 등장 설명 룰'에 따라 의도적 보존
grade_reason: "A — S1 잔존 0건, 변경률 1.0%, 자체검증 6항 통과. 블로그 존댓말 그대로. 원문이 이미 정제돼 있어 최소 개입."
-->

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [AI 에이전트 병렬 터미널 6종 비교, cmux·Orca·Conductor 뭘 써야 할까](/AI-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EB%B3%91%EB%A0%AC-%ED%84%B0%EB%AF%B8%EB%84%90-6%EC%A2%85-%EB%B9%84%EA%B5%90-cmuxOrcaConductor-%EB%AD%98-%EC%8D%A8%EC%95%BC-%ED%95%A0%EA%B9%8C/)
<!-- /RELATED-POSTS -->
