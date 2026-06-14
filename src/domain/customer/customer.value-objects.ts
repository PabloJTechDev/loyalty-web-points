// Domain value objects — pure TypeScript, no framework dependencies

export class CustomerId {
  private constructor(readonly value: string) {}

  static of(value: string): CustomerId {
    if (!value || !value.startsWith('cust_')) {
      throw new Error(`Invalid CustomerId: ${value}`)
    }
    return new CustomerId(value)
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export class EmailHash {
  private constructor(readonly value: string) {}

  static of(value: string): EmailHash {
    if (!value || value.length < 10) {
      throw new Error('Invalid EmailHash')
    }
    return new EmailHash(value)
  }

  toString(): string {
    return this.value
  }
}
