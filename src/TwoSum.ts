import { Expect, Equal } from "./utils";

type TwoSum<Array extends any[], Target extends number> = any

type TestCase = [
  Expect<Equal<TwoSum<[1, 2, 3], 4>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 5>, true>>,
  Expect<Equal<TwoSum<[1, 2, 3], 6>, false>>,
  Expect<Equal<TwoSum<[1, 2, 3], 8>, false>>,
]