---
title: "Objective-C id 타입 완전정복 (동적 타이핑·덕 타이핑 총정리)"
description: "Objective-C를 처음 공부하다 보면 id라는 타입 앞에서 한 번쯤 멈칫하게 됩니다."
header:
  og_image: /assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/1.png
tags:
  - Objective-C
  - iOS개발
  - 런타임
  - 프로그래밍공부
permalink: /Objective-C-id-타입-완전정복-동적-타이핑덕-타이핑-총정리/
toc: true
toc_sticky: true
last_modified_at: 2026-07-14
---

Objective-C를 처음 공부하다 보면 `id`라는 타입 앞에서 한 번쯤 멈칫하게 됩니다.

"이게 대체 무슨 타입이지? 왜 아무 객체나 다 넣어도 컴파일이 되지?" 하는 의문이 들죠.

결론부터 말씀드리면, `id`는 "어떤 객체든 가리킬 수 있는 만능 포인터"이고, 이게 바로 Objective-C의 동적 타이핑과 덕 타이핑을 떠받치는 핵심입니다.

이 글에서는 `id` 타입이 정확히 무엇인지, 동적 타이핑과 덕 타이핑이 실제 코드에서 어떻게 굴러가는지, 그리고 이걸 언제 쓰고 언제 조심해야 하는지까지 하나씩 정리해 풀어보려고 합니다.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/1.png" alt="id 타입 하나면 동적 타이핑도 덕 타이핑도 다 여기서 출발해요">
  <figcaption>id 타입 하나면 동적 타이핑도 덕 타이핑도 다 여기서 출발해요</figcaption>
</figure>

## id 타입이 대체 뭔가요?

한마디로 `id`는 "임의의 Objective-C 객체를 가리키는 포인터"입니다.

`NSString *`, `NSArray *`처럼 구체적인 클래스를 지정하지 않고도 아무 객체나 담을 수 있어요.

사실 `id`의 정체는 생각보다 단순합니다. 내부적으로는 이렇게 정의돼 있거든요.

```objc
// objc.h 내부 정의 (요약)
typedef struct objc_object {
    Class isa;  // 이 객체가 어떤 클래스인지 가리키는 포인터
} *id;
```

즉 `id`는 `isa`라는 포인터 하나를 가진 구조체의 포인터입니다.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/4-1783847906422.png" alt="id의 정체, 결국 isa 하나 든 포인터였다">
  <figcaption>id의 정체, 결국 isa 하나 든 포인터였다</figcaption>
</figure>

이 `isa`가 "나는 어떤 클래스의 인스턴스야"라고 런타임에 알려주는 이름표 역할을 해요.

여기서 재미있는 점 하나. `id`는 이미 포인터라서 `id obj`라고 쓰지 `id *obj`라고 별표를 붙이지 않습니다.

`NSString *str`과 비교하면 헷갈리기 쉬운 부분입니다.

---

## 동적 타이핑은 이렇게 동작합니다

동적 타이핑(dynamic typing)은 "객체의 실제 타입을 컴파일 시점이 아니라 실행 시점에 판단한다"는 개념입니다.

`id`에 담긴 객체가 실제로 무슨 클래스인지는 프로그램이 돌아가는 순간에 `isa` 포인터를 보고 결정돼요.

그래서 이런 코드가 가능합니다.

```objc
id obj = @"Hello";           // 지금은 NSString
NSLog(@"%@", [obj class]);   // 출력: __NSCFConstantString
obj = @[@1, @2, @3];         // 이제 NSArray로 바뀜
NSLog(@"%@", [obj class]);   // 출력: __NSArrayI
```

같은 변수 `obj`가 문자열이었다가 배열이 됩니다.

컴파일러는 이걸 막지 않아요. 실제 타입 판단을 런타임에 미루기 때문이죠.

메시지를 보낼 때도 마찬가지입니다. `[obj length]`를 호출하면, 컴파일 시점엔 `obj`가 `length`에 응답할지 알 수 없어요.

런타임이 그 순간 `obj`의 클래스를 뒤져서 해당 메서드를 찾아 실행합니다. 이걸 메시지 디스패치라고 부릅니다.

둘을 비교하면 이렇습니다.

- 정적 타이핑: 컴파일러가 타입을 미리 확정하고 검사
- 동적 타이핑: 실행 중에 실제 객체를 보고 결정

> Objective-C에서 `id`와 동적 타이핑은 "일단 넣고, 진짜 무엇인지는 실행할 때 물어본다"는 철학의 결과물입니다.

---

## 덕 타이핑의 진짜 의미는 뭘까요?

여기서 많은 분들이 오해하는 지점이 있습니다. 덕 타이핑(duck typing)을 그냥 "타입 검사 안 하는 거"로 뭉뚱그리는 경우죠.

덕 타이핑의 원래 표현은 이렇습니다.

"오리처럼 걷고 오리처럼 운다면, 그건 오리다."

객체가 어떤 클래스에 속하는지가 중요한 게 아니라, "그 메시지에 응답할 수 있느냐"가 중요하다는 뜻입니다.

Objective-C에서는 이걸 `respondsToSelector:`로 직접 확인할 수 있어요.

```objc
// 클래스가 뭐든 상관없이, 이 메서드에 응답만 하면 호출
if ([obj respondsToSelector:@selector(quack)]) {
    [obj quack];  // 오리처럼 울 수 있으면 오리로 취급
}
```

여기서 `obj`가 `Duck` 클래스인지 `Robot` 클래스인지는 아무 상관이 없습니다.

`quack`이라는 메시지에 응답만 하면 우리 코드 입장에선 "오리"인 거예요.

이게 상속 기반의 다형성과는 결이 다릅니다.

같은 부모 클래스를 물려받지 않아도, 서로 아무 관계가 없는 클래스라도 같은 메서드 이름만 가지면 똑같이 다룰 수 있으니까요.

바로 이 유연함이 델리게이트 패턴이나 타깃-액션 같은 코코아의 핵심 설계를 가능하게 만든 밑바탕입니다.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/2.png" alt="메서드에 응답만 하면 오리로 쳐준다는 발상이 재미있죠">
  <figcaption>메서드에 응답만 하면 오리로 쳐준다는 발상이 재미있죠</figcaption>
</figure>

---

## 편한 만큼 위험한 id, 언제 조심해야 할까

`id`는 자유로운 만큼 대가가 따릅니다.

컴파일러가 타입 검사를 거의 해주지 않으니 응답할 수 없는 메시지를 보내면 컴파일은 통과하고 실행 중에 앱이 죽어버려요.

바로 그 유명한 `unrecognized selector sent to instance` 크래시입니다.

그래서 실무에서는 이렇게 씁니다.

- 타입이 확실하면 `id` 대신 구체 클래스(`NSString *` 등)를 명시한다
- 꼭 `id`를 써야 하면 호출 전에 `respondsToSelector:`로 방어한다
- 델리게이트 프로토콜을 정의해 "이 메시지에는 응답한다"를 문서화한다

요즘은 `instancetype`이나 제네릭(`NSArray<NSString *> *`)이 도입돼서 무분별한 `id` 사용은 많이 줄었습니다.

그래도 프레임워크 밑바닥, 런타임을 다루는 코드에서는 여전히 `id`가 심장처럼 뛰고 있어요.

<figure>
  <img src="/assets/images/posts/985ef22b-6988-47cb-adf2-a9d803086c51/3.png" alt="이 빨간 로그, id 잘못 쓰면 제일 자주 만나는 얼굴입니다">
  <figcaption>이 빨간 로그, id 잘못 쓰면 제일 자주 만나는 얼굴입니다</figcaption>
</figure>

---

정리하자면 `id`는 Objective-C의 동적 성격을 상징하는 타입이고, 동적 타이핑과 덕 타이핑은 "클래스가 아니라 행동으로 객체를 판단한다"는 하나의 철학으로 이어져 있습니다.

처음엔 낯설고 위험해 보이지만, 이 원리를 이해하고 나면 코코아 프레임워크의 설계가 훨씬 선명하게 보일 거예요.

오늘 헤매던 `id` 앞에서 조금은 덜 막막해지셨길 바랍니다. 즐거운 Objective-C 공부 되세요!

<!-- RELATED-POSTS -->
## 함께 보면 좋은 글

- [Swift 클래스와 구조체 차이 총정리 (값 타입·참조 타입)](/Swift-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EC%B0%A8%EC%9D%B4-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EA%B0%92-%ED%83%80%EC%9E%85%EC%B0%B8%EC%A1%B0-%ED%83%80%EC%9E%85/)
- [Objective-C 골뱅이(@) 문법, 왜 전부 @로 시작할까? (완벽 정리)](/Objective-C-%EA%B3%A8%EB%B1%85%EC%9D%B4-%EB%AC%B8%EB%B2%95/)
- [Objective-C nil vs Java null 비교, 왜 다르게 동작할까](/Objective-C-nil/)
<!-- /RELATED-POSTS -->
