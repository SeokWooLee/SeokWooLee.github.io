---
title: "Objective-C 카테고리 vs Swift extension 차이 (개념·주의점 총정리)"
description: "iOS 개발을 하다 보면 한 번쯤 헷갈리는 지점이 있습니다."
header:
  og_image: /assets/images/posts/5a5abfc5-7192-4dd7-949c-6bd32a81072b/1.png
tags:
  - Objective-C
  - Swift
  - 카테고리
  - extension
permalink: /Objective-C-카테고리-vs-Swift-extension-차이-개념주의점-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-24
---

iOS 개발을 하다 보면 한 번쯤 헷갈리는 지점이 있습니다.

바로 Objective-C 카테고리 vs Swift extension 차이예요.

둘 다 "이미 있는 클래스에 기능을 덧붙인다"는 점이 비슷해서, 그냥 같은 개념이라고 생각하기 쉽거든요.

결론부터 말씀드리면, 겉모습은 닮았지만 적용 대상과 동작 방식이 꽤 다릅니다.

> 카테고리는 클래스에만 붙고 런타임에 동작하지만, extension은 구조체·열거형·프로토콜까지 붙고 컴파일 타임에 결정됩니다.

오늘은 이 둘을 실무 관점에서 하나씩 비교해드릴게요.

<figure>
  <img src="/assets/images/posts/5a5abfc5-7192-4dd7-949c-6bd32a81072b/1.png" alt="Objective-C 카테고리 vs Swift extension, 이 그림 하나로 감이 잡힙니다">
  <figcaption>Objective-C 카테고리 vs Swift extension, 이 그림 하나로 감이 잡힙니다</figcaption>
</figure>

---

## Objective-C 카테고리는 어떤 개념인가요?

카테고리(Category)는 기존 클래스를 상속받지 않고도 메서드를 추가하는 문법입니다.

예를 들어 `NSString` 같은 프레임워크 클래스에도 내 메서드를 끼워 넣을 수 있어요.

소스 코드가 없어도 됩니다.

```objc
// NSString에 이메일 검증 메서드를 추가
@interface NSString (Validation)
- (BOOL)isValidEmail;
@end
```

포인트는 런타임에 메서드가 클래스에 붙는다는 거예요.

덕분에 유연하지만 같은 메서드를 두 카테고리가 정의하면 어느 쪽이 이길지 보장되지 않는 위험도 있습니다.

카테고리끼리 이름이 겹치면 원인을 찾기 어려운 버그로 이어지기 쉬워요.

---

## Swift extension은 무엇이 다를까?

Swift의 extension은 카테고리의 확장판이라고 보시면 편합니다.

메서드뿐 아니라 계산 프로퍼티, 생성자, 중첩 타입, 프로토콜 채택까지 얹을 수 있거든요.

무엇보다 클래스에만 국한되지 않습니다.

구조체(struct), 열거형(enum), 프로토콜에도 붙습니다.

```swift
// String에 계산 프로퍼티를 추가
extension String {
    var isValidEmail: Bool {
        contains("@") && contains(".")
    }
}
```

특히 프로토콜 extension으로 기본 구현을 제공하는 기능은 Objective-C 카테고리엔 없는 강력한 무기예요.

중복 코드를 확 줄여주죠.

---

## 카테고리 vs extension, 핵심 차이 한눈에

헷갈리는 분들을 위해 표로 정리했습니다. (2026년 문법 기준)

| 구분 | Objective-C 카테고리 | Swift extension |
|------|------|------|
| 적용 대상 | 클래스만 | 클래스·구조체·열거형·프로토콜 |
| 계산 프로퍼티 | 직접 불가 | 가능 |
| 저장 프로퍼티 | 불가 | 불가 |
| 프로토콜 기본 구현 | 불가 | 가능 |
| 메서드 이름 충돌 | 런타임 위험 있음 | 컴파일 단계에서 방지 |
| 동작 시점 | 런타임 | 컴파일 타임 |

<figure>
  <img src="/assets/images/posts/5a5abfc5-7192-4dd7-949c-6bd32a81072b/3.png" alt="표로 정리해두니 차이가 훨씬 선명하게 보이더라고요" loading="lazy">
  <figcaption>표로 정리해두니 차이가 훨씬 선명하게 보이더라고요</figcaption>
</figure>

한 가지 공통점도 있어요.

둘 다 저장 프로퍼티(stored property)는 추가하지 못합니다.

굳이 상태를 붙이고 싶다면 Objective-C의 associated object 방식을 써야 하는데, 권장까지는 아니에요.

---

## 실무에서는 언제 무엇을 쓰나요?

제가 프로젝트를 하며 느낀 기준을 나눠드릴게요.

1. 순수 Swift 프로젝트라면 고민 없이 extension을 씁니다.
2. 오래된 Objective-C 코드를 유지보수한다면 카테고리를 그대로 활용하고요.
3. 공통 기능을 여러 타입에 뿌려야 하면 프로토콜 extension이 정답에 가깝습니다.

<figure>
  <img src="/assets/images/posts/5a5abfc5-7192-4dd7-949c-6bd32a81072b/2.png" alt="순수 Swift 프로젝트라면 저는 고민 없이 extension을 씁니다" loading="lazy">
  <figcaption>순수 Swift 프로젝트라면 저는 고민 없이 extension을 씁니다</figcaption>
</figure>

혼용하는 경우도 많습니다.

Objective-C 카테고리로 만든 기능을 Swift에서 그대로 가져다 쓸 수 있으니까요.

반대로 Swift extension은 `@objc`를 붙이지 않으면 Objective-C 쪽에서 보이지 않는다는 점도 기억해두시면 좋아요.

이 부분을 놓치면 브릿징 과정에서 컴파일 오류가 나기 쉽거든요.

---

정리하면, 카테고리는 클래스 전용의 런타임 확장, extension은 거의 모든 타입을 아우르는 컴파일 타임 확장입니다.

둘의 성격만 확실히 잡아두면 코드 구조가 훨씬 깔끔해질 거예요.

오늘도 즐거운 개발 되시길 응원합니다!
