---
title: "Xcode 테스트 플랜(Test Plan) 총정리, 구성별로 돌리는 법"
description: "테스트 플랜은 실행할 테스트와 실행 조건을 .xctestplan 파일로 관리합니다. 스킴 설정만으로 부족한 이유와 대상 선택, 구성 나누기, 커버리지·실행 순서·반복 설정, xcodebuild 연동까지 정리했습니다."
header:
  og_image: /assets/images/posts/fe6f5632-281e-43cf-906d-1512a6abe71c/xcode-test-plan-1.jpg
categories:
  - 개발 도구
  - iOS
tags:
  - Xcode
  - 테스트플랜
  - xctestplan
  - XCTest
permalink: /Xcode-테스트-플랜Test-Plan-총정리-구성별로-돌리는-법/
toc: true
toc_sticky: true
last_modified_at: 2026-08-17
---

테스트 코드를 어느 정도 쌓고 나면 새로운 고민이 하나 생깁니다. "이 테스트들, 어떤 조합으로 돌려야 하지?"

전체를 다 돌리자니 CI(Continuous Integration, 지속적 통합)에서 20분씩 걸립니다. 일부만 돌리자니 매번 손으로 체크를 껐다 켜야 합니다.

한국어와 영어 환경에서 각각 UI 테스트를 돌리고 싶은데 방법이 마땅치 않기도 하고요.

결론부터 말씀드리면, 이 문제를 풀라고 애플이 만들어 둔 게 테스트 플랜(Test Plan)입니다.

[Xcode 11에서 소개된 테스트 플랜](https://developer.apple.com/videos/play/wwdc2019/413/)은 "실행할 테스트"와 "그 테스트를 어떤 조건으로 돌릴지"를 파일로 분리해 관리합니다.

오늘은 테스트 플랜의 구조부터 실전 구성, CI 연동까지 한 번에 정리해 볼게요.

테스트 코드 작성 자체가 아직 낯설다면 [XCTest 기본기와 Given-When-Then으로 첫 테스트 작성하는 법](/XCTest-기본기-Given-When-Then으로-첫-테스트-작성하기-초보-가이드/)부터 보고 와도 좋습니다.

<figure>
  <img src="/assets/images/posts/fe6f5632-281e-43cf-906d-1512a6abe71c/xcode-test-plan-1.jpg" alt="XCODE TEST PLANS 텍스트와 스킴 하나가 세 개의 테스트 플랜·구성으로 갈라지는 구조 이미지" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>스킴 하나에 플랜 여럿, 플랜 하나에 구성 여럿입니다</figcaption>
</figure>

## 테스트 플랜은 무엇인가요

테스트 플랜은 확장자가 `.xctestplan`인 파일입니다. 내용물은 사람이 읽을 수 있는 JSON이고, 프로젝트에 추가한 뒤 스킴(Scheme)에서 참조해 씁니다.

한 파일 안에는 두 가지가 들어갑니다.

- **실행할 테스트**: 어떤 테스트 타깃·스위트·함수를 포함하거나 제외할지. [Xcode 16 이상에서는 Swift Testing 태그도 조건으로 쓸 수 있습니다](https://developer.apple.com/documentation/xcode/organizing-tests-to-improve-feedback)
- **구성(Configuration)**: 그 테스트들을 어떤 조건으로 실행할지

중요한 건 이게 파일이라는 겁니다. `.xctestplan`을 Git에 커밋할 수 있어 팀원과 같은 조건을 공유하고, 설정 변경도 코드 리뷰 대상으로 만들 수 있습니다.

팀에서 쓴다면 플랜과 이를 참조하는 공유 스킴을 함께 버전 관리하는 편이 안전합니다.

## 스킴 설정만으로는 왜 부족할까요

테스트 플랜이 없던 시절에는 실행 조건이 전부 스킴의 Test 액션 안에 있었습니다. 여기엔 구조상 한계가 있어요.

스킴 하나에는 Test 액션 설정도 하나뿐입니다. 그래서 "빠른 검증용"과 "야간 전체 검증용"을 나누고 싶으면 스킴 자체를 복제해야 했습니다.

스킴을 복제하면 빌드 설정, 실행 설정, 프로파일 설정까지 전부 딸려 옵니다. 테스트 조건 하나 바꾸려고 나머지를 다 복사하는 셈이죠.

테스트 플랜은 이 관계를 뒤집습니다. **스킴 하나에 테스트 플랜 여러 개**를 매달 수 있고, 각 플랜은 다시 구성 여러 개를 가집니다.

<figure>
  <img src="/assets/images/posts/fe6f5632-281e-43cf-906d-1512a6abe71c/xcode-test-plan-2.png" alt="Xcode 스킴과 테스트 플랜 구성 계층 다이어그램, Smoke Regression Nightly 플랜 분기" width="1200" height="436" loading="lazy" decoding="async">
  <figcaption>테스트를 새로 짜지 않아도 실행 조합은 얼마든지 늘릴 수 있어요</figcaption>
</figure>

## 테스트 플랜 만들기

[애플의 현재 안내](https://developer.apple.com/documentation/xcode/organizing-tests-to-improve-feedback)를 기준으로 보면, Xcode는 스킴이 빌드하는 테스트 타깃의 모든 테스트를 포함한 기본 플랜을 만들어 줍니다.

1. Product > Scheme > Edit Test Plan으로 기본 플랜을 열고 저장합니다
2. Tests 탭에서 타깃·태그·스위트·함수 단위로 실행 대상을 고릅니다
3. Configurations 탭에서 공유 설정과 필요한 구성을 추가합니다

플랜을 더 만들려면 Product > Test Plan > New Test Plan을 씁니다. 아직 테스트 플랜을 쓰지 않는 예전 스킴에서는 스킴 편집기의 **Convert to use Test Plans**가 보일 수 있습니다. 이건 [Xcode 11에서 소개된 기존 설정 변환 흐름](https://developer.apple.com/videos/play/wwdc2019/413/)입니다.

플랜을 여러 개 붙였다면 Product > Test Plan > Manage Test Plans에서 하나를 기본값(Default)으로 정합니다. 별도로 지정하지 않았을 때 쓰는 플랜이 이 기본값입니다.

지금 실행할 플랜은 Product > Test Plan에서 활성화합니다. 그 상태에서 Command + U, 즉 Product > Test를 실행하면 현재 활성 플랜이 구성마다 한 번씩 실행됩니다. 기본 플랜과 현재 활성 플랜은 구분해 두는 게 좋습니다.

## 공유 설정과 구성의 관계

테스트 플랜 편집기를 열면 Tests와 Configurations 두 탭이 보입니다. 핵심은 Configurations 탭이에요.

이 탭은 위아래 두 층으로 되어 있습니다.

- **Shared Settings(공유 설정)**: 모든 구성이 물려받는 기본값
- **개별 구성**: 공유 설정에서 필요한 항목만 덮어쓴 변형

CSS의 상속과 비슷하다고 보면 이해가 빠릅니다. 공통 조건은 한 군데 적어두고, 구성별로 달라지는 항목만 따로 지정하는 구조죠.

덮어쓴 항목은 편집기에서 굵게 표시되어 "여기만 다르다"가 한눈에 보입니다.

설정할 수 있는 항목은 꽤 많은데, 자주 쓰는 것만 추리면 이렇습니다.

| 항목 | 무엇을 정하나 |
|---|---|
| Arguments / Environment Variables | 실행 인자와 환경 변수 |
| Application Language / Region | 앱이 실행될 언어와 지역 |
| Code Coverage | 커버리지 수집 여부와 대상 타깃 |
| Execution Order | 알파벳 순으로 실행할지, 실행마다 무작위로 섞을지 |
| Test Repetition Mode | 테스트 반복 실행 방식 |
| Test Timeouts | 테스트 하나에 허용할 최대 실행 시간 |
| Runtime Sanitization | Address·Thread·Undefined Behavior Sanitizer |
| Memory Management | Malloc Scribble, Malloc Guard Edges, Zombie Objects |
| Automatic Screen Capture | 실패 시 화면 캡처 자동 첨부 여부 |

> 공통은 공유 설정에, 차이만 구성에. 이 원칙만 지키면 플랜이 아무리 늘어도 관리가 무너지지 않습니다.

## 구성을 나눠 쓰는 실전 예시

가장 자주 쓰이는 건 언어별 구성입니다. 다국어 앱이라면 레이아웃이 언어에 따라 깨지는 일이 흔한데, 구성만 나누면 같은 UI 테스트 코드를 언어별로 자동 반복할 수 있습니다.

- 공유 설정: 커버리지 켜기, 실패 시 스크린샷 남기기
- 구성 A "Korean": Application Language를 한국어로
- 구성 B "English": Application Language를 영어로
- 구성 C "RTL Pseudolanguage": 오른쪽에서 왼쪽으로 쓰는 언어 검증용

이 플랜을 한 번 실행하면 [선택한 테스트가 각 구성에서 한 번씩 실행](https://developer.apple.com/documentation/xcode/organizing-tests-to-improve-feedback)되고, 결과 리포트에도 구성별로 나뉘어 표시됩니다. 어떤 언어에서만 실패했는지가 바로 드러나죠.

메모리 검사도 마찬가지입니다. [애플 문서상 Address Sanitizer는 메모리를 2~3배 쓰고 코드를 2~5배 느리게 할 수 있으므로](https://developer.apple.com/documentation/xcode/diagnosing-memory-thread-and-crash-issues-early), 실행 비용을 고려해야 합니다.

대신 평소 구성은 새니타이저를 끄고 진단용 구성을 따로 둡니다. 예를 들어 Address Sanitizer용과 Thread Sanitizer용 구성을 목적에 맞게 분리한 뒤 야간 빌드에서 실행할 수 있습니다.

## 커버리지, 무작위 순서, 반복 실행

구성 안에서 특히 쓸모가 큰 옵션 세 가지를 짚고 갈게요.

**코드 커버리지**는 켜기만 하면 되는 게 아니라 무엇을 측정할지 먼저 정하는 게 중요합니다. 의존 라이브러리까지 한 숫자에 섞이면 앱 코드의 변화를 읽기 어려울 수 있습니다.

"some targets"를 선택해 우리 앱 타깃만 지정하면 의미 있는 수치가 나옵니다.

**Execution Order**에서는 Alphabetical과 Random을 고를 수 있습니다. 다만 모든 테스트의 기본값을 Alphabetical이라고 일반화하면 안 됩니다.

XCTest 플랜에서 Random을 고르면 실행마다 순서가 섞입니다. 반면 [Swift Testing은 테스트 함수를 기본적으로 병렬 실행하며 순서도 무작위화](https://developer.apple.com/videos/play/wwdc2024/10195/?time=1296)합니다. 두 프레임워크의 동작을 나눠서 봐야 해요.

순서를 바꿨을 때 깨진다면 앞 테스트가 남긴 상태에 기대고 있었을 가능성이 큽니다. 테스트 사이의 숨은 결합을 드러내는 데 유용한 신호죠. 이런 독립성은 [좋은 단위 테스트의 FIRST 원칙](/좋은-단위-테스트의-조건-FIRST-원칙-5가지-총정리/)에서도 핵심으로 다룹니다.

**Test Repetition**은 [Xcode 13에서 추가된 옵션](https://developer.apple.com/documentation/xcode-release-notes/xcode-13-release-notes)으로, 반복 방식을 이렇게 고를 수 있습니다.

| 모드 | 동작 | 쓰임새 |
|---|---|---|
| Up Until Maximum Repetitions | 지정한 최대 횟수까지 결과와 무관하게 반복 | 간헐적 실패의 재현율 측정 |
| 실패까지 반복 (`-run-tests-until-failure`) | 실패가 날 때까지 반복 | 어쩌다 깨지는 테스트 추적 |
| Retry on Failure | 실패하면 지정 횟수까지 재시도 | 불안정한 UI 테스트의 CI 통과율 방어 |

[Xcode 13 릴리스 노트](https://developer.apple.com/documentation/xcode-release-notes/xcode-13-release-notes)에 따르면 **Maximum Test Repetitions**에는 양의 정수를 지정해야 합니다. 공식 문서에서 "기본값 3회"는 확인되지 않으므로, 플랜에 저장된 값을 직접 확인하는 게 정확합니다.

명령줄에서는 `-test-iterations`로 횟수를 정합니다. 여기에 `-run-tests-until-failure` 또는 `-retry-tests-on-failure`를 조합할 수 있습니다. 이 명령줄 반복 설정은 플랜의 반복 설정보다 우선합니다.

Retry on Failure는 편리하지만 조심해서 쓰는 게 좋습니다. 재시도로 통과시키면 불안정한 테스트를 그대로 안고 가게 되니까요.

임시 방편으로 켜두되, 왜 불안정한지는 따로 파는 편이 낫습니다.

<figure>
  <img src="/assets/images/posts/fe6f5632-281e-43cf-906d-1512a6abe71c/xcode-test-plan-3.jpg" alt="CI PIPELINE 텍스트와 풀 리퀘스트·머지·야간 빌드로 나뉜 테스트 실행 파이프라인 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>PR엔 가볍게, 야간엔 무겁게. 플랜을 쪼개면 이게 됩니다</figcaption>
</figure>

## CI에서 테스트 플랜 쓰기

테스트 플랜은 명령줄에서도 그대로 쓸 수 있습니다. 먼저 `xcodebuild -scheme MyApp -showTestPlans`로 스킴에 연결된 플랜을 확인합니다. `-testPlan`에는 파일 경로가 아닌 플랜 이름을 넘깁니다.

```bash
xcodebuild test \
  -project MyApp.xcodeproj \
  -scheme MyApp \
  -testPlan Smoke \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

같은 스킴을 그대로 두고 플랜 이름만 바꿔가며 CI 잡의 실행 범위를 나눌 수 있습니다. 예를 들면 이런 식으로요.

- PR(Pull Request)마다: `-testPlan Smoke` — 핵심 유닛 테스트 중심
- 메인 브랜치 머지: `-testPlan Regression` — 유닛 + UI 테스트 전체
- 야간 스케줄: `-testPlan Nightly` — 새니타이저와 다국어 구성까지 포함

구성 단위로 더 잘게 쪼갤 수도 있습니다.

[애플의 현재 명령줄 예시](https://developer.apple.com/documentation/xcode/organizing-tests-to-improve-feedback)처럼 `--only-test-configuration`은 지정한 구성만 실행합니다. 반대로 `--skip-test-configuration`은 지정한 구성만 빼고 실행하고요. 두 옵션은 하이픈이 두 개입니다.

언어 구성이 다섯 개인 플랜이라면 CI 시스템에서 잡 다섯 개를 만들고 각 잡에 구성을 하나씩 배정할 수 있습니다. 다만 이 병렬 분배는 CI 시스템이 하는 일이지, 테스트 플랜이 자동으로 머신을 나누거나 실행 시간을 줄여 주는 기능은 아닙니다.

```bash
xcodebuild test \
  -scheme MyApp \
  -testPlan Localization \
  --only-test-configuration Korean \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

## 자주 묻는 것들

**Q. 테스트 플랜 파일은 Git에 올리나요?**

A. 팀에서 같은 실행 조건을 공유하려면 커밋하는 편이 좋습니다. 다만 Git 업로드 자체가 Xcode의 필수 조건은 아닙니다. 플랜과 이를 참조하는 공유 스킴을 함께 관리하세요.

다만 JSON이라 여러 사람이 동시에 수정하면 충돌이 납니다. 플랜 목적별로 파일을 나눠두면 충돌 빈도가 줄어듭니다.

**Q. 구성을 여러 개 만들면 시간이 배로 걸리지 않나요?**

A. 맞습니다. 구성 수만큼 테스트가 반복 실행됩니다.

그래서 다국어·새니타이저처럼 무거운 구성은 평소 플랜에서 떼어내 야간 플랜으로 돌리는 편이 좋습니다.

**Q. 하나의 플랜에 유닛 테스트와 UI 테스트를 같이 넣어도 되나요?**

A. 됩니다. 다만 유닛 테스트는 초 단위, UI 테스트는 분 단위라 피드백 속도가 크게 차이 납니다.

빠른 플랜과 느린 플랜으로 나눠두는 편이 개발 흐름에 잘 맞습니다.

**Q. Swift Testing으로 짠 테스트도 플랜에 들어가나요?**

A. 들어갑니다. XCTest와 Swift Testing 테스트가 선택된 타깃에 함께 있으면 같은 플랜에서 실행할 수 있습니다. [Swift Testing의 태그와 병렬 실행 방식](/Swift-Testing-프레임워크-XCTest-대체하는-새-표준-한눈-정리/)까지 함께 알아두면 플랜을 나누기 쉬워집니다.

**Q. 특정 테스트만 빼고 싶으면요?**

A. Tests 탭에서 타깃·스위트·함수·매개변수화된 개별 케이스 단위로 체크를 해제할 수 있습니다. [Xcode 16 이상에서는 Swift Testing의 Include Tags와 Exclude Tags로도 범위를 고를 수 있습니다](https://developer.apple.com/documentation/xcode/organizing-tests-to-improve-feedback).

코드에 손대지 않고 플랜 파일에만 기록되므로, 다른 플랜에서는 그대로 실행됩니다.

---

테스트 플랜은 테스트를 새로 짜는 도구가 아닙니다. 이미 짜둔 테스트 가운데 무엇을, 어떤 조건으로 돌릴지 정하는 도구죠.

스킴 복제로 실행 조건을 나누고 있었다면 기본 플랜을 저장한 뒤 목적별 플랜으로 정리해 보세요. CI에서는 플랜과 구성을 잡별로 명시하면 실행 범위가 분명해지지만, 실제 시간 단축은 러너 수와 병렬화 방식에 달려 있습니다.

우선 Product > Scheme > Edit Test Plan으로 기본 플랜을 저장하고, Smoke 플랜 하나만 만들어 보세요. 그 다음 구성을 붙이는 건 훨씬 쉬워집니다.

---

## 출처 및 확인 기준

- [Improving code assessment by organizing tests into test plans (Apple)](https://developer.apple.com/documentation/xcode/organizing-tests-to-improve-feedback) — 현재 Xcode의 플랜 생성 메뉴, 테스트 선택 단위, 구성별 실행, `xcodebuild` 옵션을 확인했습니다.
- [Testing in Xcode, WWDC19 (Apple)](https://developer.apple.com/videos/play/wwdc2019/413/) — Xcode 11 도입 시점, `.xctestplan` 파일 구조와 기존 스킴 변환 흐름을 확인했습니다.
- [Xcode 13 Release Notes (Apple)](https://developer.apple.com/documentation/xcode-release-notes/xcode-13-release-notes) — 반복 모드, 양의 정수 반복 횟수, 명령줄 옵션 우선순위를 확인했습니다.
- [Go further with Swift Testing, WWDC24 (Apple)](https://developer.apple.com/videos/play/wwdc2024/10195/?time=1296) — Swift Testing의 기본 병렬 실행과 무작위 실행 순서를 확인했습니다.
- [Diagnosing memory, thread, and crash issues early (Apple)](https://developer.apple.com/documentation/xcode/diagnosing-memory-thread-and-crash-issues-early) — 새니타이저의 역할과 Address Sanitizer 실행 비용을 확인했습니다.

확인 기준일은 2026년 8월 16일입니다. 메뉴 이름과 명령줄 표기는 위 Apple 공식 문서의 현재 표기를 우선했고, 문서에서 확인되지 않는 반복 기본 횟수나 CI 시간 단축 수치는 단정하지 않았습니다.
