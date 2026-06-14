// Points value object — pure TypeScript, no framework dependencies

export class Points {
  private constructor(readonly value: number) {}

  static of(value: number): Points {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Points must be a non-negative number, got: ${value}`)
    }
    return new Points(value)
  }

  static zero(): Points {
    return new Points(0)
  }

  add(other: Points): Points {
    return Points.of(this.value + other.value)
  }

  subtract(other: Points): Points {
    return Points.of(this.value - other.value)
  }

  isEnoughFor(required: Points): boolean {
    return this.value >= required.value
  }

  format(locale = 'es'): string {
    return new Intl.NumberFormat(locale).format(this.value)
  }

  toString(): string {
    return String(this.value)
  }
}
