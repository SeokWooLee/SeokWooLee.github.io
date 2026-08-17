# Cloudflare Pages 배포

이 저장소의 `main` 브랜치는 Cloudflare Pages용 Astro 정적 사이트입니다.

## 최초 연결

Cloudflare Dashboard의 **Workers & Pages → Create application → Pages → Import an existing Git repository**에서 이 저장소를 선택합니다.

| 설정 | 값 |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build directory | `dist` |
| Root directory | 비워 둠 |

환경 변수는 다음처럼 설정합니다.

| 변수 | 값 |
| --- | --- |
| `NODE_VERSION` | `22.14.0` |
| `SITE_URL` | 실제 운영 주소. 예: `https://gae-balbadak.pages.dev` |

`SITE_URL`은 canonical, Open Graph, RSS, XML·텍스트 sitemap, robots.txt의 절대 URL에 사용됩니다. 프로젝트 이름이 달라지면 반드시 실제 `*.pages.dev` 주소로 바꿉니다.

## 배포 전 확인

```bash
npm ci
SITE_URL=https://gae-balbadak.pages.dev npm run validate
```

배포 후 아래 주소가 모두 리디렉션 없이 HTTP 200인지 확인합니다.

- `/`
- `/robots.txt`
- `/sitemap.xml`
- `/sitemap.txt`
- `/rss.xml`
- `/ads.txt`
- `/googlef513e75fd4fd1b71.html`
- `/naver7d3beabb75467760ac49851548c4085c.html`

## 검색 도구와 광고

- Google Search Console과 네이버 서치어드바이저에는 새 운영 주소를 별도 사이트로 등록합니다.
- 두 검색 도구 모두 `/sitemap.xml`을 먼저 제출하고, 진단용으로 `/sitemap.txt`도 사용할 수 있습니다.
- AdSense의 사이트 목록에도 새 운영 주소를 추가하고 검토를 요청합니다.
- `ads.txt`와 AdSense 자동 광고 코드는 이미 빌드 결과에 포함됩니다.

기존 GitHub Pages의 `master` 브랜치는 전환 확인이 끝날 때까지 롤백 가능한 운영본으로 유지합니다.
