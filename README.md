# 개발바닥

> 개발을 바닥부터, 단단하게.

10년차 iOS 개발자가 Swift와 iOS, 소프트웨어 설계, AI 도구를 실무의 언어로 풀어내는 기술 블로그입니다.

`main`은 Astro 기반 Cloudflare Pages 운영 브랜치입니다.

## 기술 구성

- Astro 정적 사이트
- Markdown 콘텐츠 컬렉션
- 프레임워크 없는 HTML·CSS·JavaScript UI
- Cloudflare Pages Git 연동 배포
- 자동 생성 XML·텍스트 sitemap 및 RSS
- Google AdSense, Analytics, Search Console, 네이버 서치어드바이저 연동

## 로컬 실행

Node.js 버전은 `.nvmrc`에 고정되어 있습니다.

```bash
npm ci
npm run dev
```

전체 검증은 타입·콘텐츠 검사, 정적 빌드, permalink·sitemap·이미지 회귀 검사를 차례로 실행합니다.

```bash
SITE_URL=https://gae-balbadak.pages.dev npm run validate
```

## 글 작성

글은 `src/content/posts/`에 `YYYY-MM-DD-제목.md` 형식으로 추가합니다.

```yaml
---
title: "글 제목"
description: "검색 결과와 공유 카드에 사용할 설명"
header:
  og_image: /assets/images/posts/example/cover.jpg
categories:
  - iOS
tags:
  - Swift
permalink: /글-주소/
toc: true
toc_sticky: true
last_modified_at: 2026-08-17
---
```

- 기존 검색 노출을 지키기 위해 발행된 글의 `permalink`는 바꾸지 않습니다.
- 본문 제목이 H1이므로 글 안의 첫 섹션은 `##`부터 시작합니다.
- 글 이미지는 `public/assets/images/posts/` 아래에 둡니다.
- 커밋 전에 `npm run validate`를 실행합니다.

## 주요 구조

```text
src/
├── components/       공통 UI
├── content/posts/    블로그 글
├── content/pages/    소개·개인정보처리방침
├── layouts/          문서 레이아웃과 공통 메타데이터
├── lib/              글 분류·URL·sitemap 로직
├── pages/            정적 페이지와 XML/TXT 엔드포인트
└── styles/           브랜드 디자인 시스템
public/               이미지·인증 파일·Cloudflare 규칙
scripts/              빌드 산출물 회귀 검사
```

Cloudflare Pages 최초 연결과 전환 체크리스트는 [CLOUDFLARE.md](CLOUDFLARE.md)를 참고합니다.

## 저작권

글과 자체 제작 이미지의 저작권은 작성자에게 있습니다. 저장소의 제3자 코드와 이전 이력에 적용되는 MIT 고지는 [LICENSE](LICENSE)에 보존되어 있습니다.
