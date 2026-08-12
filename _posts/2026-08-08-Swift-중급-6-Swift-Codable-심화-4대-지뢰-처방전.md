---
title: "[Swift 중급 #6] Swift Codable 심화, 4대 지뢰 처방전"
description: "Codable 자동 합성이 실제로 무엇을 만들어주는지부터, 실무에서 반드시 만나는 키 이름 불일치·날짜 포맷·중첩 구조·부분 실패 네 상황의 표준 처방과 DecodingError 디버깅까지 정리했습니다."
header:
  og_image: /assets/images/posts/c82f52ea-3b48-40d5-8739-a94bd38731cf/swift-codable-deep-dive-1.jpg
categories:
  - Swift
tags:
  - Swift
  - 스위프트
  - Codable
  - CodingKeys
permalink: /Swift-중급-6-Swift-Codable-심화-4대-지뢰-처방전/
toc: true
toc_sticky: true
last_modified_at: 2026-08-08
---

Codable의 첫인상은 마법입니다. struct에 `: Codable` 다섯 글자를 붙이면 JSON 변환이 공짜로 생기니까요. 그런데 실무 API를 붙이는 순간 마법이 걷힙니다. 서버는 snake_case인데 Swift는 camelCase고, 날짜 포맷은 API마다 다르고, 목록 응답에서 항목 하나가 이상하면 전체 디코딩이 실패해서 화면이 통째로 비어버리죠.

중급 시리즈 6편은 Codable 심화입니다. 자동 합성이 실제로 무엇을 만들어주는지부터, 실무에서 반드시 만나는 네 가지 상황(키 이름, 날짜, 중첩, 부분 실패)의 표준 처방까지 정리합니다.

<figure>
  <img src="/assets/images/posts/c82f52ea-3b48-40d5-8739-a94bd38731cf/swift-codable-deep-dive-1.jpg" alt="CODABLE DEEP DIVE 텍스트와 커튼 뒤에서 코드를 쓰는 컴파일러 썸네일" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
  <figcaption>Codable의 마법은 컴파일러가 대신 써주는 코드였습니다</figcaption>
</figure>

## 마법의 정체 — 컴파일러가 대신 써주는 코드

Codable은 `Encodable & Decodable`의 typealias고, 각각 "자신을 인코더에 쓰는 법"과 "디코더에서 자신을 만드는 법"을 요구하는 프로토콜입니다. 마법처럼 보이는 건 컴파일러의 자동 합성(synthesis) 때문이에요. 모든 저장 프로퍼티가 Codable이면, 컴파일러가 두 가지를 대신 써줍니다.

첫째, CodingKeys라는 enum. 프로퍼티 이름을 그대로 케이스로 갖는 키 목록입니다. 둘째, 그 키로 프로퍼티를 하나씩 읽고 쓰는 `init(from:)`과 `encode(to:)` 구현. 즉 Codable 커스터마이징이란 이 두 산출물 중 어느 쪽을 손으로 대체하느냐의 문제입니다. 키 이름만 다르면 CodingKeys만, 구조 자체가 다르면 init(from:)까지. 이 구도를 잡아두면 이후 내용이 전부 "어디까지 손으로 쓸 것인가"의 스펙트럼으로 정리됩니다.

또 하나 중요한 사실. Codable은 JSON 전용이 아닙니다. 인코더·디코더가 교체 가능한 구조라서 PropertyListEncoder로 plist를, 서드파티로 XML이나 YAML을 다룰 수 있어요. 타입은 "나를 어떻게 표현하는지"만 알고, 포맷은 인코더가 결정하는 관심사 분리 설계입니다.

## 상황 1. 키 이름이 다를 때 — CodingKeys와 키 전략

서버가 `user_name`을 주는데 프로퍼티는 userName으로 쓰고 싶은 경우, 처방은 두 단계입니다.

전역으로 규칙이 일관되면 디코더 설정 한 줄이 끝입니다. `decoder.keyDecodingStrategy = .convertFromSnakeCase`. 모든 키가 snake_case→camelCase로 자동 변환돼요. API 전체가 관례를 지킨다면 이게 정답입니다.

규칙이 들쭉날쭉하거나 이름 자체를 바꾸고 싶으면 CodingKeys를 직접 씁니다.

```swift
struct User: Codable {
    let userName: String
    let signupDate: Date

    enum CodingKeys: String, CodingKey {
        case userName = "user_nm"     // 서버의 레거시 키
        case signupDate = "created"
    }
}
```

부수 효과로 알아둘 것 하나. CodingKeys에서 케이스를 빼면 그 프로퍼티는 인코딩·디코딩에서 제외됩니다. 로컬 전용 상태(캐시 플래그 등)를 응답 모델에 두고 싶을 때 쓰는 기법인데, 제외된 프로퍼티는 기본값이 있어야 합니다.

<figure>
  <img src="/assets/images/posts/c82f52ea-3b48-40d5-8739-a94bd38731cf/swift-codable-deep-dive-2.jpg" alt="snake case·날짜·중첩·부분 실패 네 구간이 표시된 JSON 파이프라인 도식" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>실무 Codable의 4대 지뢰: 키 이름·날짜·중첩·부분 실패</figcaption>
</figure>

## 상황 2. 날짜 — 포맷의 지뢰밭

Date는 Codable 실무에서 가장 자주 터지는 지뢰입니다. JSON에 날짜 표준이 없어서 서버마다 유닉스 타임스탬프(1720000000), ISO 8601("2026-07-15T09:30:00Z"), 커스텀 포맷("2026-07-15 09:30")이 제각각이거든요.

처방은 디코더의 dateDecodingStrategy를 서버 포맷에 맞추는 겁니다. `.secondsSince1970`, `.iso8601`, 그리고 커스텀 포맷은 `.formatted(formatter)`. 커스텀 DateFormatter를 쓸 때는 함정이 둘 있습니다. locale을 `en_US_POSIX`로 고정하지 않으면 사용자의 12/24시간 설정에 따라 파싱이 깨질 수 있습니다. 또 서버가 밀리초 포함 ISO 8601을 주면 기본 `.iso8601`이 실패합니다(ISO8601DateFormatter에 밀리초 옵션을 켜서 해결). "날짜 파싱이 특정 사용자만 실패해요"라는 미스터리 버그의 팔 할이 이 두 함정이에요.

한 API 안에서 필드마다 포맷이 다른 최악의 경우라면, 해당 필드만 String으로 받아 연산 프로퍼티로 변환하거나 `.custom` 전략으로 분기하는 게 현실적입니다.

## 상황 3. 중첩과 구조 불일치 — 서버의 모양 vs 내 모양

서버 JSON이 깊게 감싸져 오는 경우입니다. `{"data": {"user": {...}}}`처럼요. 가장 단순한 처방은 봉투 타입을 그대로 만드는 것. `struct Envelope: Codable { let data: DataBox }` 식으로 서버 구조를 미러링하고, 호출부에서 `envelope.data.user`로 꺼냅니다. 명시적이고 디버깅이 쉬워서 실무 기본기로 이게 낫습니다.

내 모델의 모양을 서버와 다르게 가져가고 싶으면(평평한 User로 받고 싶다면) init(from:)을 직접 쓰면서 nestedContainer로 계층을 파고들어갑니다. 코드가 늘어나는 대신 모델이 도메인 중심으로 깨끗해지는 거래예요. 판단 기준은 이 모델이 얼마나 널리 쓰이느냐입니다. 앱 전역에서 쓰는 핵심 모델이면 손으로 쓴 init(from:)의 값어치가 있고, 한 화면용 응답이면 봉투 미러링이 경제적입니다.

## 상황 4. 부분 실패 — 항목 하나 때문에 전체가 죽는 문제

실무에서 가장 아픈 상황입니다. 상품 100개 목록에서 한 항목의 필수 필드가 null이면, 배열 전체 디코딩이 throw되고 화면이 비어버립니다. 에러 처리 편에서 본 대로 던져진 에러는 전파되니까요.

1차 방어는 옵셔널입니다. 서버가 빼먹을 수 있는 필드는 정직하게 `let thumbnail: URL?`로 선언하는 것. "없을 수 있음"을 타입에 새기는 옵셔널 편의 원칙이 모델 설계에 그대로 적용됩니다.

구조적 방어는 실패 허용 래퍼입니다. 원소 디코딩 실패를 nil로 삼키는 제네릭 래퍼를 하나 만들어두는 패턴이 표준처럼 쓰입니다.

```swift
struct FailableItem<T: Decodable>: Decodable {
    let value: T?
    init(from decoder: Decoder) throws {
        value = try? T(from: decoder)   // 실패하면 nil
    }
}

let items = try decoder.decode([FailableItem<Product>].self, from: data)
    .compactMap(\.value)   // 성공한 것만 남김
```

try?와 compactMap, 앞선 편들에서 정리한 도구 두 개의 조합인 게 보이시죠. "불량 항목 하나는 버리고 나머지는 살린다"는 정책을 타입 하나로 표현한 겁니다. 단 주의점이 있습니다. 이 패턴은 실패를 조용히 삼킵니다. 그러니 프로덕션에서는 실패 건수를 로깅해서 서버 데이터 문제가 가려지지 않게 해야 합니다.

<figure>
  <img src="/assets/images/posts/c82f52ea-3b48-40d5-8739-a94bd38731cf/swift-codable-deep-dive-3.jpg" alt="불량 하나만 nil 통으로 걸러내고 나머지는 통과시키는 분류 설비 일러스트" width="1200" height="800" loading="lazy" decoding="async">
  <figcaption>불량 하나는 버리고 나머지는 살린다, 단 버린 건 로깅으로 남깁니다</figcaption>
</figure>

## 디버깅 — DecodingError는 답을 알고 있다

마지막으로 디코딩이 실패했을 때의 수사법입니다. `try decoder.decode(...)`를 catch하면 DecodingError가 잡히는데, 이 에러가 생각보다 친절합니다. 네 가지 케이스(keyNotFound, typeMismatch, valueNotFound, dataCorrupted)마다 어느 키가, 어떤 경로(codingPath)에서, 뭘 기대했는데 뭐가 왔는지가 들어 있어요.

그러니 디코딩 실패 시 `print(error)`가 아니라 `print(error as? DecodingError)`를 뜯어보는 습관, 최소한 개발 중에는 catch 블록에서 케이스별로 codingPath를 찍어보는 습관이 디버깅 시간을 크게 줄입니다. "JSON 파싱이 안 돼요"의 대부분은 에러 안에 이미 답이 적혀 있습니다.

## 정리

- Codable의 마법은 컴파일러 합성입니다. CodingKeys enum과 init(from:)/encode(to:)를 대신 써주는 것이고, 커스터마이징은 그중 어디까지 손으로 대체하느냐의 문제입니다.
- 키 이름: 일관된 snake_case면 keyDecodingStrategy 한 줄, 불규칙하면 CodingKeys 수동 선언. 케이스를 빼면 그 필드는 변환에서 제외됩니다.
- 날짜: 서버 포맷에 맞는 dateDecodingStrategy를 명시하고, en_US_POSIX locale과 밀리초 ISO 8601 함정을 조심합니다.
- 중첩: 기본은 봉투 미러링, 핵심 모델만 init(from:) + nestedContainer로 평평하게.
- 부분 실패: 옵셔널 정직 선언 + FailableItem 패턴(try? + compactMap), 그리고 삼킨 실패는 로깅으로 가시화.
- 디버깅: DecodingError의 codingPath에 답이 있습니다.

다음 편은 @State, @Published 같은 골뱅이 문법의 원리, 프로퍼티 래퍼입니다. 프로퍼티 편에서 예고했던 "저장 프로퍼티를 감싸는 문법"을 직접 만들어봅니다.

<!-- RELATED-POSTS -->
## 이어서 읽기

- [프로토콜 지향 프로그래밍(POP), OOP 한계를 넘는 법](/%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C-%EC%A7%80%ED%96%A5-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DPOP-OOP-%ED%95%9C%EA%B3%84%EB%A5%BC-%EB%84%98%EB%8A%94-%EB%B2%95/)
- [\[Swift 심화 #1\] async/await 원리, 멈추는 건 스레드가 아닙니다](/Swift-%EC%8B%AC%ED%99%94-1-asyncawait-%EC%9B%90%EB%A6%AC-%EB%A9%88%EC%B6%94%EB%8A%94-%EA%B1%B4-%EC%8A%A4%EB%A0%88%EB%93%9C%EA%B0%80-%EC%95%84%EB%8B%99%EB%8B%88%EB%8B%A4/)
<!-- /RELATED-POSTS -->
