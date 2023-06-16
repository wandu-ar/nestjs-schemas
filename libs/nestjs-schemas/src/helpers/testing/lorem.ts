import { faker } from '@faker-js/faker';

export class Lorem {
  static getFaker() {
    return faker;
  }

  /**
   * Generate an random string with paragraph lorem ipsum generator.
   * Validate that `min > 0 && max > 0 && max > min`
   *
   * @throws Throw error if args passed are not valid numbers.
   * @param min Min value for length on random string.
   * @param max Max value for length on random string.
   * @returns Return an random string
   */
  static random(min: number, max: number): string {
    let text = '';
    min = Math.floor(min);
    max = Math.floor(max);
    if (min < 0 || max <= 0 || max < min) {
      throw new Error(
        `Invalid arguments. Check values. min > 0 && max > 0 && max > min. Passed args: min (${min}) & max (${max}).`,
      );
    }

    const random = Math.floor(Math.random() * (max - min + 1) + min);
    while (text.length < random) {
      text += faker.lorem.paragraph();
    }
    text = text.substring(0, random);
    // ever add dot to final string
    return text.charAt(text.length - 1) === '.' ? text : text.substring(0, text.length - 1) + '.';
  }
}
