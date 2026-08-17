---
title: "[무료 서비스 소개 #1] Agentation(에이젠테이션) 사용법, \"이 버튼 말고 저 버튼\" 설명 없이 AI에게 웹 디자인 수정 시키기"
description: "AI에게 웹사이트를 만들어 달라고 하는 건 이제 어렵지 않습니다. 진짜 고생은 그다음에 시작됩니다. 완성된 화면을 띄워놓고 \"이 버튼이 좀 이상한데요\"라고 말하는 순간부터요."
header:
  og_image: /assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-visual-feedback-1.jpg
tags:
  - Agentation
  - 무료서비스
  - 바이브코딩
  - AI코딩
permalink: /Agentation에이젠테이션-사용법-이-버튼-말고-저-버튼-설명-없이-AI에게-웹-디자인-수정-시키기/
toc: true
toc_sticky: true
last_modified_at: 2026-07-30
---

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-visual-feedback-1.jpg" alt="VISUAL FEEDBACK FOR AI AGENTS 텍스트와 웹사이트 화면의 핀 마커를 클릭해 구조화된 데이터 카드를 코딩 로봇에게 전달하는 이미지" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>화면에서 가리키기만 하면, 나머지는 AI가 알아서 찾아갑니다</figcaption>
</figure>

AI에게 웹사이트를 만들어 달라고 하는 건 이제 어렵지 않습니다. 진짜 고생은 그다음에 시작됩니다. 완성된 화면을 띄워놓고 "이 버튼이 좀 이상한데요"라고 말하는 순간부터요.

"가운데 파란 버튼요." → AI가 엉뚱한 버튼을 고칩니다.
"아니요, 그 위에 있는 거요." → 또 다른 걸 건드립니다.
"위에서 두 번째, 로그인 옆에 붙어 있는..." → 결국 코드를 직접 열어보게 됩니다.

원인은 단순합니다. 사람은 화면을 보고, AI는 코드를 봅니다. 눈이 다른 둘 사이를 말로 이으려니 새는 곳이 생기는 겁니다. 이 틈을 메우려고 나온 도구가 [Agentation(에이젠테이션)](https://www.agentation.com/)입니다.

이 연재는 돈 들이지 않고 쓸 수 있는 서비스를 하나씩 골라 소개하는 자리입니다. 뭘 해주는 물건인지, 어디까지 무료인지, 어떤 조건이 붙는지를 확인해 봅니다. 첫 편은 Agentation입니다.

## 화면에서 찍으면, AI가 알아듣는 말로 번역합니다

Agentation은 내가 만들고 있는 웹사이트 위에 떠 있는 작은 툴바입니다. 마음에 안 드는 곳을 클릭하고 "여백이 너무 좁아요" 같은 메모를 남기면, 그걸 AI 코딩 도구가 그대로 실행할 수 있는 형식으로 정리해 줍니다.

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-annotation-to-agent-2.gif" alt="Agentation 주석 3개가 에이전트 터미널의 Page Feedback 목록으로 변환되는 공식 데모 화면" width="1200" height="592" loading="lazy" decoding="async">
  <figcaption>찍는 건 화면에서, 받는 건 터미널에서. 이 흐름 하나가 전부입니다.</figcaption>
</figure>

핵심은 "정리해 준다"입니다. 클릭 한 번이면 이런 정보가 자동으로 따라붙죠.

- 그 요소를 코드에서 찾아낼 CSS 선택자(selector, 화면 요소를 코드에서 지목하는 주소 같은 것) — `body > main > .hero-section > button.cta`
- 그 요소를 만든 소스 파일과 줄 번호 — `src/components/Button.tsx:42`
- 리액트(React) 컴포넌트 계층 — `App > LandingPage > HeroSection > CTAButton`
- 위치와 크기, 주변 텍스트, 지금 적용돼 있는 색상·글꼴·여백 값

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-react-component-detection-6.gif" alt="Agentation이 웹 요소 위에 App-Header-Button 리액트 컴포넌트 계층을 툴팁으로 표시하는 공식 데모 화면" width="1096" height="784" loading="lazy" decoding="async">
  <figcaption>마우스만 올려도 이 요소가 어떤 컴포넌트인지 바로 뜹니다.</figcaption>
</figure>

복사 버튼을 누르면 이런 모양이 클립보드에 담깁니다.

```
## Page Feedback: /landing
**Viewport:** 1440×900

### 1. button
**Location:** body > main > .hero-section > button.cta
**Source:** src/components/Button.tsx:42
**React:** App > LandingPage > HeroSection > CTAButton
**Feedback:** Button is cut off on mobile viewport
```

정보량은 조절할 수 있습니다. 간단(Compact)·표준(Standard)·상세(Detailed)·정밀(Forensic) 네 단계가 있고, 위 예시는 기본값인 표준입니다. 여백이나 색상이 왜 저렇게 나오는지 따져야 할 때는 정밀로 올리면 적용된 CSS 값까지 딸려 옵니다.

참고로 `Source:` 줄, 그러니까 소스 파일과 줄 번호는 개발 모드에서만 붙습니다. Vite·Next.js·웹팩(Webpack)·터보팩(Turbopack) 환경을 지원하는데, 번들러 설정에 따라 이 정보가 빠질 수도 있습니다. 없으면 선택자와 컴포넌트 계층만으로 찾아가는 셈이라 정확도가 조금 떨어질 뿐, 못 쓰는 건 아닙니다.

이걸 Claude Code나 Cursor 채팅창에 붙여넣기만 하면 끝입니다. AI는 더 이상 "파란 버튼"이 뭔지 추측하지 않습니다. 주소를 받았으니 그 파일 그 줄로 곧장 갑니다.

## 스크린샷에 화살표 그려서 주면 안 되나요

많이 쓰는 방법이고 아예 안 되는 것도 아닙니다. 다만 스크린샷은 그림일 뿐이라 코드와 이어지지 않습니다. AI는 그림 속 버튼이 코드 어디에 있는지 처음부터 다시 찾아야 합니다. 그 과정에서 비슷하게 생긴 다른 버튼을 고치는 일이 벌어지고요.

Agentation이 넘겨주는 건 그림이 아니라 검색 가능한 문자열입니다. 선택자와 클래스 이름이 있으면 AI는 코드베이스를 뒤져 해당 위치를 정확히 짚어냅니다. 화살표 그린 이미지와 결정적으로 갈리는 지점입니다.

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-vs-screenshot-3.png" alt="스크린샷 화살표 방식과 Agentation 주석 방식 비교 다이어그램, 요소 추측 후 잘못된 파일 수정 대 CSS 선택자와 소스 파일 줄 번호로 정확한 줄 수정" width="1200" height="588" loading="lazy" decoding="async">
  <figcaption>같은 지적이라도 뭘 같이 넘기느냐에 따라 결과가 갈립니다</figcaption>
</figure>

## 찍는 방법이 다섯 가지입니다

지적하고 싶은 대상이 늘 버튼 하나인 건 아니죠. 그래서 방식이 나뉘어 있습니다.

- **요소 클릭** — 버튼, 카드, 이미지 하나를 콕 집습니다.
- **텍스트 선택** — 오타나 문구를 고칠 때 씁니다. 선택한 문장이 따옴표째 결과물에 들어가서, AI가 코드에서 그 문장을 바로 검색합니다.
- **다중 선택** — 드래그해서 여러 요소를 한꺼번에. "이 카드 세 개 간격 맞춰주세요" 같은 요청에 맞습니다.
- **영역 지정** — 빈 공간도 지정됩니다. "여기가 허전해요"가 가능해집니다.
- **애니메이션 정지** — `P` 키를 누르면 CSS·자바스크립트·영상 애니메이션이 멈춥니다. 스르륵 지나가서 못 잡던 순간을 세워놓고 지적하면 됩니다. 다만 서드파티 애니메이션 라이브러리 중에는 완전히 멈추지 않는 것도 있습니다.

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-text-annotation-7.gif" alt="Agentation 텍스트 선택 주석 데모, 오타 단어를 선택해 Fix typo 메모를 입력하고 마커가 찍히는 화면" width="1096" height="708" loading="lazy" decoding="async">
  <figcaption>오타 하나 고칠 때는 이렇게 문장을 통째로 집어 줍니다.</figcaption>
</figure>

자주 쓰는 단축키도 몇 개 외워두면 편합니다. `Cmd+Shift+F`(윈도우는 `Ctrl+Shift+F`)로 피드백 모드를 켜고 끄고, `C`로 복사, `X`로 전체 삭제, `H`로 마커 숨기기입니다.

## 배치를 바꿔야 한다면 레이아웃 모드

"이 카드를 오른쪽으로 옮기고 그 아래에 폼을 하나 넣어주세요." 이런 요청은 문장으로 옮기는 순간 흐릿해집니다. 그래서 `L` 키를 누르면 툴바가 레이아웃 모드로 바뀝니다. 배치를 말로 설명하는 대신 직접 움직여 보여주는 자리입니다.

- 컴포넌트 팔레트에서 65가지가 넘는 요소를 화면 위로 끌어다 놓습니다.
- 기존 섹션에 마우스를 올리면 CSS 선택자 라벨이 뜨고 그대로 드래그해 순서를 바꿉니다.
- '새 페이지 와이어프레임'을 켜면 지금 디자인이 흐려지고 빈 화면에서 스케치할 수 있습니다. 투명도 슬라이더로 원래 화면을 비쳐 보며 그려도 됩니다.
- 이 페이지가 어떤 용도인지 적어두는 칸도 따로 있습니다.

이렇게 만든 변경은 주석 하나하나에 `feedback`·`placement`·`rearrange` 중 한 종류가 붙어 넘어갑니다. AI가 받는 건 "가운데로 옮겨주세요" 같은 문장이 아니라 좌표와 크기입니다. 다만 레이아웃 모드는 Agentation 3.0부터 들어간 기능이라 버전을 확인해야 하고 다른 기능과 마찬가지로 데스크톱에서만 동작합니다. 자세한 소개는 [공식 블로그 글](https://www.agentation.com/blog/layout-mode)에 있습니다.

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-layout-mode-4.png" alt="Agentation 레이아웃 모드 화면, 하단 툴바와 크기 조절 핸들로 선택된 Text 블록" width="1200" height="630" loading="lazy" decoding="async">
  <figcaption>L 키를 누르면 말로 설명하던 배치를 직접 끌어다 놓게 됩니다.</figcaption>
</figure>

## 설치, 개발자를 부르지 않아도 됩니다

Claude Code를 쓰고 있다면 터미널에 한 줄이면 됩니다.

```bash
npx skills add benjitaylor/agentation
```

그다음 Claude Code에서 `/agentation`이라고 치면 프레임워크를 알아서 감지해 설치까지 끝냅니다. 코드를 못 읽어도 여기까지는 갑니다.

직접 하려면 패키지를 설치하고 컴포넌트 한 줄을 넣습니다.

```bash
npm install agentation -D
```

```jsx
import { Agentation } from 'agentation';

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <Agentation />}
    </>
  );
}
```

뒤쪽의 `NODE_ENV === 'development'` 조건은 "개발 중일 때만 툴바를 띄운다"는 뜻입니다. 실제 서비스에 접속한 방문자 화면에는 안 보이게 하는 안전장치니 빼먹지 마세요.

프레임워크별 설치 방법과 설정 항목은 [공식 홈페이지](https://www.agentation.com/)의 Install·Features 문서에 정리돼 있습니다.

## 복붙마저 귀찮다면 MCP로 연결합니다

메모하고, 복사하고, 채팅창에 붙여넣고. 이것도 몇 번 반복하면 일입니다. MCP(Model Context Protocol, AI 도구가 외부 프로그램과 주고받는 표준 규격)로 연결하면 이 왕복이 통째로 사라집니다. 화면에 메모를 남기면 AI가 알아서 가져갑니다. 툴바와 별개로 `agentation-mcp` 서버를 붙이고 설정에서 동기화를 켜는 단계가 하나 더 필요합니다.

여기서부터 쓰는 방식이 세 갈래로 갈립니다.

- **핸즈프리** — 새 메모가 올라오면 AI가 알아서 확인하고, 고치고, 해결 표시까지 합니다. 사람은 화면 보며 지적만 계속하면 됩니다.
- **크리티크(Critique)** — 반대로 AI가 브라우저를 열고 페이지를 훑으며 디자인 문제를 메모로 남깁니다. 사람은 그걸 검토합니다.
- **셀프드라이빙** — 지적도 AI가 하고 수정도 AI가 합니다.

뒤의 둘은 AI가 브라우저를 직접 열어야 해서 `agent-browser` 스킬을 따로 깔아야 합니다. 처음이라면 핸즈프리부터 써보는 편이 무난합니다.

연결해 두면 메모가 일방통행이 아니게 되는 것도 큽니다. AI가 "이거 24px로 할까요, 16px로 할까요?"라고 그 메모에 되물으면 같은 자리에서 답합니다. 대기 중·확인함·해결됨·보류 같은 상태도 남습니다. 던져놓고 끝이 아니라 대화가 됩니다.

<figure>
  <img src="/assets/images/posts/423d38a8-4d81-4677-bb1a-14c4060c902a/agentation-agent-reply-5.png" alt="Agentation 주석 4개가 선으로 이어진 채 에이전트가 응답하는 대화 카드 화면" width="1200" height="630" loading="lazy" decoding="async">
  <figcaption>메모를 남기면 에이전트가 그 자리에서 대답합니다. 일방통행이 아닙니다.</figcaption>
</figure>

여담이지만 이렇게 오가는 메모의 데이터 구조는 AFS(Annotation Format Schema, 주석 형식 규격)라는 이름으로 공개돼 있습니다. 만든 쪽은 이걸 "실행 중인 앱에 붙이는 똑똑한 피그마 코멘트"라고 설명합니다.

## 시작 전에 알아둘 조건들

좋은 얘기만 하면 곤란하니 선을 분명히 긋겠습니다.

**남의 웹사이트는 못 고칩니다.** 내가 만들고 있는 프로젝트에 설치해서, 내 컴퓨터에서 개발 서버를 띄운 상태로 쓰는 도구입니다. 아무 사이트나 열어서 디자인을 바꾸는 확장 프로그램이 아닙니다.

**리액트 18 이상이 필요합니다.** AI에게 웹 앱을 만들어 달라고 했다면 십중팔구 리액트로 나오지만 확인은 해보세요. Next.js·Remix·Astro 같은 SSR/SSG 프레임워크에서도 문제없이 돌아갑니다. Astro는 리액트 기반은 아니지만 리액트를 얹어 쓰는 구성이면 됩니다.

**데스크톱 전용입니다.** 마우스를 올려 대상을 고르고 드래그로 범위를 잡는 도구라 모바일에서는 사실상 조작이 안 됩니다. 모바일에서 깨진 부분을 잡으려면 데스크톱 브라우저 창 크기를 줄여서 보는 식으로 우회하세요.

**결과물에 이미지는 없습니다.** 전부 텍스트입니다. 색감이나 분위기처럼 말로 옮기기 어려운 피드백은 여전히 스크린샷이 낫습니다.

**iframe 안쪽은 못 짚습니다.** 외부에서 가져다 붙인 결제 위젯이나 지도가 여기 해당합니다. 다른 사이트 화면이 통째로 들어앉은 영역이죠. 브라우저 보안 정책상 어쩔 수 없는 부분입니다.

**메모는 오래 안 남습니다.** MCP로 연결하지 않았다면 브라우저에 페이지 단위로 저장되고 7일 뒤 사라집니다. 쌓아뒀다가 나중에 처리할 생각이라면 연결해 두는 편이 낫습니다.

가격은 부담 없습니다. 개인이든 회사든 내부에서 쓰는 건 무료입니다. 이걸 재배포하거나 상용으로 제공할 때만 별도 라이선스가 필요합니다. PolyForm Shield 1.0.0을 따릅니다.

## 정리

- Agentation은 화면에서 클릭한 위치를 AI가 알아들을 수 있는 코드 주소로 번역해 주는 툴바입니다.
- 선택자와 컴포넌트 계층이 자동으로 붙고 개발 모드에서는 소스 파일과 줄 번호까지 붙어서 AI가 "그 버튼"을 추측하지 않습니다.
- 클릭·텍스트 선택·다중 선택·영역 지정·애니메이션 정지까지 다섯 가지로 지적할 수 있습니다.
- `L` 키의 레이아웃 모드에서는 컴포넌트를 끌어다 놓고 섹션 순서를 바꿔 배치 자체를 보여줄 수 있습니다(3.0 이상).
- Claude Code라면 `npx skills add benjitaylor/agentation` 후 `/agentation` 한 번으로 설치가 끝납니다.
- MCP로 연결하면 복사·붙여넣기 없이 AI가 메모를 직접 가져가고, 되묻고 답하는 대화까지 됩니다.
- 단, 내 리액트 18+ 프로젝트를 개발 서버로 띄운 상태에서 데스크톱 브라우저로만 쓸 수 있습니다.

말로 설명하다 지치는 구간이 매번 반복된다면 그 구간을 손가락으로 가리키는 쪽으로 바꿔볼 만합니다. 공식 홈페이지는 <https://www.agentation.com/>입니다. 다음 편에서도 무료로 쓸 수 있는 서비스를 하나 골라 열어보겠습니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [바이브 코딩(Vibe Coding) 제대로 하는 법, 코드 어디까지 읽어야 할까](/%EB%B0%94%EC%9D%B4%EB%B8%8C-%EC%BD%94%EB%94%A9-%EC%BD%94%EB%93%9C-%EC%95%88-%EC%9D%BD%EA%B3%A0-%EA%B0%9C%EB%B0%9C%ED%95%98%EB%A9%B4-%EC%83%9D%EA%B8%B0%EB%8A%94-%EC%9D%BC%EA%B3%BC-%ED%95%B4%EA%B2%B0%EC%B1%85-3%EA%B0%80%EC%A7%80/)
- [바이브 코딩(Vibe Coding) 사고, 룰 파일로 애초에 막는 법](/%EB%B0%94%EC%9D%B4%EB%B8%8C-%EC%BD%94%EB%94%A9Vibe-Coding-%EC%82%AC%EA%B3%A0-%EB%A3%B0-%ED%8C%8C%EC%9D%BC%EB%A1%9C-%EC%95%A0%EC%B4%88%EC%97%90-%EB%A7%89%EB%8A%94-%EB%B2%95/)
<!-- /RELATED-POSTS -->
