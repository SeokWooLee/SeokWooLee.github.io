---
title: "Swift 프로토타입 패턴 완벽 정리 (NSCopying vs 값 타입 복사 차이)"
description: "Swift로 객체를 복사하다가 \"이게 진짜 복사된 게 맞나?\" 하고 멈칫한 적 있으신가요."
header:
  og_image: /assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/1.png
tags:
  - Swift
  - 프로토타입패턴
  - NSCopying
  - 값타입
  - 디자인패턴
  - iOS개발
  - Swift복사
  - 스위프트
  - 깊은복사
  - 얕은복사
permalink: /Swift-프로토타입-패턴-완벽-정리-NSCopying-vs-값-타입-복사-차이/
toc: true
toc_sticky: true
last_modified_at: 2026-07-19
---

Swift로 객체를 복사하다가 "이게 진짜 복사된 게 맞나?" 하고 멈칫한 적 있으신가요.

클래스 인스턴스를 대입 한 줄로 복사하면, 복제본을 고쳤는데 원본까지 같이 바뀌는 문제로 이어지기 쉽습니다.

결론부터 말씀드리면, Swift에서 복사는 두 갈래입니다.

값 타입(struct)은 대입만 해도 알아서 복사되고 클래스(참조 타입)는 `NSCopying`을 직접 구현해야 진짜 복사가 됩니다.

이 글에서는 프로토타입 패턴이 뭔지, 그리고 `NSCopying`과 값 타입 복사가 어떻게 다른지 코드로 하나씩 정리해 드릴게요.

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/1.png" alt="값 타입 복사와 NSCopying, 이 그림 한 장이면 차이가 정리돼요">
  <figcaption>값 타입 복사와 NSCopying, 이 그림 한 장이면 차이가 정리돼요</figcaption>
</figure>

---

## 프로토타입 패턴이 뭔가요?

프로토타입 패턴은 한마디로 **기존 객체를 복제해서 새 객체를 만드는 디자인 패턴**이에요.

처음부터 새로 만드는 게 아니라 이미 세팅이 끝난 원본을 "찍어내듯" 복사하는 방식이죠.

저는 이걸 도장에 비유해서 이해했어요. 원본 도장을 하나 잘 파두면, 그다음부턴 찍기만 하면 되잖아요.

객체 생성 비용이 크거나 초기 설정이 복잡한 경우에 특히 유용합니다.

예를 들어 게임 캐릭터를 만들 때 능력치, 장비, 스킬을 매번 세팅하는 대신, 기본 캐릭터 하나를 복제해서 조금씩 바꾸는 식이에요.

핵심은 "복제본이 원본과 완전히 분리돼야 한다"는 점입니다.

> 복제본을 수정했을 때 원본이 같이 바뀐다면, 그건 복사가 아니라 참조 공유일 뿐입니다.

바로 이 지점에서 값 타입과 참조 타입의 차이가 갈립니다.

---

## 값 타입 복사는 왜 편할까?

Swift의 struct와 enum은 값 타입입니다.

값 타입의 가장 큰 장점은 대입이나 함수 전달만 해도 **자동으로 복사**된다는 거예요.

아래 코드를 보시면 감이 오실 거예요. 원본을 복사한 뒤 값을 바꿔도 서로 영향을 주지 않습니다.

```swift
struct Character {
    var name: String
    var level: Int
}

var origin = Character(name: "전사", level: 1)
var copy = origin      // 여기서 값이 통째로 복사됨
copy.level = 99
print(origin.level)    // 1 (원본은 그대로!)
```

`copy.level`을 99로 바꿔도 `origin.level`은 여전히 1이에요.

별도로 복사 코드를 짜지 않아도 되니 실수할 여지가 확 줄어듭니다.

그래서 저는 특별한 이유가 없다면 struct를 먼저 고려하는 편이에요.

Swift가 값 타입 복사를 권장하는 이유도 바로 이 안전함 때문입니다.

---

## NSCopying은 어떻게 쓰나요?

문제는 클래스(참조 타입)예요.

클래스는 대입해도 복사가 아니라 **같은 인스턴스를 가리키는 주소만 공유**됩니다.

그래서 진짜 복사가 필요하면 `NSCopying` 프로토콜을 채택하고 `copy(with:)` 메서드를 직접 구현해야 해요.

```swift
class Character: NSCopying {
    var name: String
    init(name: String) { self.name = name }

    func copy(with zone: NSZone? = nil) -> Any {
        return Character(name: self.name)
    }
}

let origin = Character(name: "전사")
let clone = origin.copy() as! Character
```

`copy()`를 호출하면 새 인스턴스가 만들어지므로 `clone`을 바꿔도 `origin`은 그대로예요.

여기서 한 가지 주의할 점이 있어요.

`copy(with:)` 안에서 내부 프로퍼티까지 새로 만들어야 완전한 복사(깊은 복사)에 가까워집니다.

내부 객체를 그대로 대입만 하면, 겉만 복사되고 속은 여전히 공유되는 얕은 복사가 되거든요.

---

## 값 타입 복사 vs NSCopying, 한눈에 비교

두 방식의 차이를 표로 정리해 봤어요.

| 구분 | 값 타입(struct) 복사 | NSCopying(class) |
|------|------|------|
| 복사 방식 | 대입 시 자동 복사 | `copy()` 직접 호출 |
| 구현 필요 | 불필요 | `copy(with:)` 구현 필요 |
| 기본 동작 | 항상 분리된 복사본 | 대입 시 주소 공유 |
| 얕은/깊은 복사 | 신경 쓸 일 적음 | 직접 챙겨야 함 |
| 추천 상황 | 대부분의 데이터 모델 | 참조 타입이 꼭 필요할 때 |

정리하면, 웬만하면 값 타입으로 설계하는 게 편하고 안전해요.

다만 상속이 필요하거나 Objective-C API와 맞물리거나 인스턴스 동일성이 중요할 땐 클래스와 `NSCopying`을 씁니다.

이럴 때 프로토타입 패턴을 `NSCopying`으로 구현하면 깔끔하게 맞아떨어져요.

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/2.png" alt="저는 struct부터 떠올리는 편이에요, 대입만 해도 복사되니까요">
  <figcaption>저는 struct부터 떠올리는 편이에요, 대입만 해도 복사되니까요</figcaption>
</figure>

---

## 자주 묻는 질문 (Q&A)

**Q. struct만 쓰면 NSCopying은 몰라도 되나요?**

기본적인 복사는 그렇습니다. 하지만 UIKit이나 Objective-C 기반 API를 다루다 보면 클래스를 복사할 일이 생기니, 개념은 알아두시는 게 좋아요.

**Q. copy()랑 mutableCopy()는 뭐가 다른가요?**

`copy()`는 불변 복사본, `mutableCopy()`는 수정 가능한 복사본을 만드는 용도로 나뉩니다. 후자는 `NSMutableCopying`을 채택해야 해요.

**Q. 깊은 복사가 항상 정답인가요?**

아니에요. 내부 객체를 공유해도 되는 상황이라면 얕은 복사가 성능상 더 유리할 수 있습니다.

<figure>
  <img src="/assets/images/posts/1e23c2e3-19f7-4f99-824a-221093351866/3.png" alt="원본 도장 하나 잘 파두면 그다음은 찍기만 하면 됩니다">
  <figcaption>원본 도장 하나 잘 파두면 그다음은 찍기만 하면 됩니다</figcaption>
</figure>

---

## 마무리

복사가 헷갈릴 땐 "원본을 건드렸을 때 복제본이 같이 바뀌나?"만 떠올려 보세요.

값 타입은 그 고민을 Swift가 대신 해주고, 클래스는 `NSCopying`으로 우리가 직접 챙기면 됩니다.

오늘 정리한 내용이 복사 때문에 밤새 헤매는 일을 조금이나마 줄여드리길 바라요. 화이팅입니다!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 빌더 패턴으로 매개변수 8개 초기화 지옥 탈출하기 (실전 예제)](/Swift-%EB%B9%8C%EB%8D%94-%ED%8C%A8%ED%84%B4%EC%9C%BC%EB%A1%9C-%EB%A7%A4%EA%B0%9C%EB%B3%80%EC%88%98-8%EA%B0%9C-%EC%B4%88%EA%B8%B0%ED%99%94-%EC%A7%80%EC%98%A5-%ED%83%88%EC%B6%9C%ED%95%98%EA%B8%B0-%EC%8B%A4%EC%A0%84-%EC%98%88%EC%A0%9C/)
- [Swift 팩토리 메서드 패턴, init 대신 쓰는 이유 (실전 정리)](/Swift-%ED%8C%A9%ED%86%A0%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C-%ED%8C%A8%ED%84%B4-init-%EB%8C%80%EC%8B%A0-%EC%93%B0%EB%8A%94-%EC%9D%B4%EC%9C%A0-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
- [Swift 옵저버 패턴, NotificationCenter부터 Combine까지 (실전 정리)](/Swift-%EC%98%B5%EC%A0%80%EB%B2%84-%ED%8C%A8%ED%84%B4-NotificationCenter%EB%B6%80%ED%84%B0-Combine%EA%B9%8C%EC%A7%80-%EC%8B%A4%EC%A0%84-%EC%A0%95%EB%A6%AC/)
<!-- /RELATED-POSTS -->
