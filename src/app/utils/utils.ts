export class Utils {
  public static clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
  }

  public static getRandomSetInArray<T>(arr: Array<T>, n: number): Array<T> {
    const result: Array<any> = new Array(n);
    let len: number = arr.length;
    const taken: Array<any> = new Array(len);
    if (n > len) {
      throw new RangeError("getRandom: more elements taken than available");
    }
    while (n--) {
      const x: number = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  public static randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues: Array<T[keyof T]> = (Object.keys(
      anEnum
    ) as unknown) as Array<T[keyof T]>;
    return enumValues[Math.floor(Math.random() * enumValues.length)];
  }
}
