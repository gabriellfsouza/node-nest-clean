import { Either, left, right } from './either'

function doSomething(shouldSuccess: boolean): Either<string, string> {
  if (shouldSuccess) {
    return right('success')
  } else {
    return left('error')
  }
}

test('success result', () => {
  const result = doSomething(true)
  expect(result.value).toEqual('success')
  expect(result.isLeft()).toBe(false)
  expect(result.isRight()).toBe(true)
})

test('error reason', () => {
  const result = doSomething(false)
  expect(result.value).toEqual('error')
  expect(result.isRight()).toBe(false)
  expect(result.isLeft()).toBe(true)
})
