import { Expect, Equal } from "./utils"

type MyRequired<T extends object> = any

type Foo = {
  name?: string
}

type RequiredFoo = {
  name: string
}

type TestCase = [
  Expect<Equal<MyRequired<{}>, {}>>,
  Expect<Equal<MyRequired<Foo>, RequiredFoo>>
]