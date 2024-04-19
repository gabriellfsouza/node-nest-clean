import { randomUUID } from 'node:crypto'

export class UniqueEntityID {
  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(private value: string = randomUUID()) {}

  equals(id: UniqueEntityID) {
    return id.toValue() === this.value
  }
}
