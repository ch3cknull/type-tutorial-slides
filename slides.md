---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
---

# 类型体操 抛砖引玉

[@ch3cknull](https://github.com/ch3cknull)

---

# 目录

- 给类型分个类
- 类型编程入门
- 练习平台
- 题目（内置类型 Required）
- 题目（两数之和）

---

# 写在前面

```ts
interface Person {
  readonly id: number
  name: string
  age: number 
  description?: string
}
```

我们通常见到的类型是这样的，我们会去手动添加 `readonly`, `?` 等修饰符来对属性进行修饰

属性修饰符可以增加或者删除（通过添加 `-/+`, 默认为 `+`）, 我们可以这样去除类型中所有的 `readonly`

```ts
type Writable<T> = {
  -readonly [P in keyof T]: T[P]
}
```

---

# 简单分类

在 TypeScript 中同时存在 `interface` 和 `type` 两个关键字，这两个关键字使用的场景大家相比都比较清楚

- `type` 通常用于类型别名，给一个类型起名字 `type A = number`
- `interface` 常用于我们给实际的业务实体添加类型（商品，订单……）
- `type` 也可以使用 `&` 来进行扩展，添加新的属性

我们首先简单对类型进行一个分类，这些分类会在我们后续的实践中反复出现

```ts {all|1|2|3|4|5-9|all}
type A = string                         // 最普通的类型
type B = {name: number} & {age: number} // Intersection
type C = string | number                // Union
type D = Uppercase<"a">                 // 内置类型，后面我们会专门介绍这部分
type Head<                              // 自定义类型，类似函数式编程
  T extends unknown[]
> = T extends [infer H, ...infer _] 
  ? H
  : never
```

---

# 类型编程入门

<del>众所周知，TypeScript有一个图灵完备的类型系统</del>

在类型系统中，我们的操作是非常受限制的
- 只提供了几个关键词(`extends`, `infer`, `...`, `as` , `&`, `|`, 模板字符串类型)
- 仅能使用**递归**来进行计算

<br>

但是其提供了一种近似函数式编程的体验，我们可以看到函数式编程的缩影
- 模式匹配
- 使用递归而非循环
- 对很多简单功能的函数进行组合，TypeScript也提供了部分内置类型

在简单了解类型系统后，我们可以使用它做一些简单的数学计算（加减乘除）

下面我们简单介绍一下 关键字 和 内置的类型

---

## typeof

TypeScript 分出了类型空间和值空间，类型空间会在编译到 JavaScript 后丢失，这两个空间也是相互隔离的

但是我们可以使用 typeof 关键字 获取当前值对应的类型

```ts {all|1-3|4-}
const val = 'hello'
// 错误，不能将值直接传递给类型
type A = Uppercase<val>
// 正确，先获取值的类型，在传给类型作为参数
type A = Uppercase<typeof val>
```

---

## & (Intersection)
假设我们现在有这个类型
```ts
type Person = { name: string } & { age: number }
```
- 我们可以理解为将age拼接到前面的类型上
- 但是另一种理解方式是：我们将这两种类型看作集合，从中选择带有交集的部分
  - 既满足 `{name: string}` 又满足 `{age: number}` 的部分
  
<img src="/images/intersection.png" alt="" class="w-3/5">

---

## | (Union)
假设我们现在有这个类型
```ts
type Stringify = number | string
```
- 其实就是集合的并集

Union有个特性就是计算时，会分别展开其中的每一项参与计算

我们有时可以利用这个特性来简化类型的编写过程

```ts {all|3-5|all}
type Hello<T> = `Hello, ${T & string}`
type Person = "World" | "146"
type A = Hello<Person>
// type A = Hello<"World"> | Hello<"146">
// type A = "Hello, World" | "Hello, 146"
```

---

## keyof

我们使用 keyof 可以获取到类型的对应key（仅object）

对于基本类型 我们可以获得类型上的属性，方法等，最后返回一个 Union

```ts {all|1-4|6-7|9-11|12-}
type Person = {
  name: string
  age: number
}

// "name" | "string"
type KeyofPerson = keyof Person

// "toString" | "toFixed" | "toExponential" | "toPrecision" | "valueOf" | "toLocaleString"
type KeyofNumber = keyof number

// ???
type KeyofArray = keyof number[]
```

---
layout: two-cols
image: ./images/keyof_array.png
---

### 潜在问题

对于数组，由于类型系统存在 **惰性计算** 的特性

在遇到某些类型时，**不会展开参与运算以节约性能**

我们要查看数组的keyof 需要额外做下处理

正是这种特性，让我们在编写类型时，造成了困扰

通常是在外层套一个新类型，来让类型强制参与计算

比如下面的判断相等类型

```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
```

`(<T>() => T extends X ? 1 : 2)`

其实是包裹了一层，来让 X 和 Y 强制参与计算

::right::

![keyof array](/images/keyof_array.png)

<div class="text-center">数组的 keyof</div>

---

## extends infer

extends 我们常用来做条件类型，而且常与 infer 配合使用

```ts {1-2|4-9|all}
type Cat = 'cat'
type Dog = 'dog'

type 叫声<T> = T extends Cat
  ? '喵'
  : T extends Dog
    ? '汪'
    : never
```

extends 和 infer 配合的情况
```ts
type Head<
  某个数组 extends unknown[]
> = 某个数组 extends [infer 数组第一个元素, ...infer _]  // 另外，此处使用了展开运算符，使用方法和ES6中的比较近似
  ? 数组第一个元素
  : never
```
我们使用 infer， 意味着我们想要让类型系统帮助我们获取所在位置的类型，并将类型加到我们使用的变量中
---

## 模板字符串类型
模板字符串类型和我们在 ES6 接触的模板字符串很相似，但是我们在模板字符串中使用的只能是类型

我们可以为模板字符串以下类型作为参数
- string
- number
- bigint
- boolean
- null
- undefined

```ts
type Hello<Name extends string> = `Hello, ${Name}!`
```

---

## as

把下面这个 `Foo` 类型转换成如下 `FooWarped` 类型

```ts {all|1-3|5-9}
type Foo = {
  bar: number
}

type FooWarped = {
  bar: number,
  setBar: (bar: number) => void
  getBar: () => number
}
```


```ts {|4-|all}
type ForOf<T extends object> = {
  [P in keyof T]: T[P]
}

type Warped<T extends object> = ForOf<{
  [P in keyof T as P extends string ? `get${Capitalize<P>}` : never]: () => T[P]
} & {
    [P in keyof T as P extends string ? `set${Capitalize<P>}` : never]: (val: T[P]) => void
} & T>

```

---

## 内置类型 (Utility Types)

挑选几个内置的类型，详细的列表可以参见[这里](https://www.typescriptlang.org/docs/handbook/utility-types.html)

| 类型            |                                               |
| --------------- | --------------------------------------------- |
| `Required<T>`   | 将类型中所有的属性变为必选项(去掉 `?`)        |
| `Partial<T>`    | 将类型中所有的属性变为可选项(添加 `?`)        |
| `Awaited<T>`    | 提取Promise包裹的类型(以及所有Thenable的类型) |
| `Exclude<T, K>` | 从 Union中过滤某些key                         |
| `Omit<T, K>`    | 从object里排除某些键值对                      |

---

![logo](https://github.com/type-challenges/type-challenges/raw/main/screenshots/logo.svg)

  <div class="text-center leading-loose text-2xl">
    <a href="https://github.com/type-challenges/type-challenges">https://github.com/type-challenges/type-challenges</a>
      
  一个在线类型题目平台，可以在这里练习类型体操
  </div>

---

# 实现内置类型 Required 
--

将 Foo 类型转换为 FooBar 类型， 即 `Required<Foo> === FooBar`

```ts
type Foo = {
  bar?: number
}

type FooBar = {
  bar: number
}
```

模板

```ts
type MyRequired<T extends object> = any
```

--- 
layout: center
class: text-center
---

# 感谢观看！
