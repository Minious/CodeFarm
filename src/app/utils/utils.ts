import { Vector2 } from "../types/vector2.type";

/**
 * A class with only static utility methods (mainly maths related)
 */
export class Utils {
  /**
   * Clamp a number between a lower and an upper boundaries
   * @param {number} n - The number to clamp
   * @param {number} min - The lower boundary
   * @param {number} max - The upper boundary
   * @returns {number} - The clamped number
   */
  public static clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
  }

  /**
   * Take an array arr and an integer n and returns a new array of size n
   * containing random elements of arr.
   * @param {Array<T>} arr - The array to get the subset from
   * @param {number} n - The number of elements to return
   * @returns {Array<T>} - The subset
   */
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

  /**
   * Returns a random element of an enumeration T
   * @param {T} anEnum - The enumeration to grab the random element from
   * @returns {T[keyof T]} - a random element of T
   */
  public static randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues: Array<T[keyof T]> = (Object.keys(
      anEnum
    ) as unknown) as Array<T[keyof T]>;
    return enumValues[Math.floor(Math.random() * enumValues.length)];
  }

  /**
   * Returns the distance between two points.
   * @param {Vector2} v1 - position of the point 1
   * @param {Vector2} v2 - position of the point 2
   * @returns {number} - The distance between the two points
   */
  public static distance(v1: Vector2, v2: Vector2): number {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
  }

  /**
   * Returns the sum of two Vector2 as a new Vector2.
   * @param {Vector2} v1 - The first vector
   * @param {Vector2} v2 - The second vector
   * @returns {Vector2} - A new Vector2 equal to the sum of v1 and v2
   */
  public static add(v1: Vector2, v2: Vector2): Vector2 {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  /**
   * Returns the subtraction of two Vector2 as a new Vector2.
   * @param {Vector2} v1 - The first vector
   * @param {Vector2} v2 - The second vector
   * @returns {Vector2} - A new Vector2 equal to v1 minus v2
   */
  public static subtract(v1: Vector2, v2: Vector2): Vector2 {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }

  /**
   * Returns a Vector2 scaled by a number as a new Vector2.
   * @param {Vector2} v1 - position of the point 1
   * @param {Vector2} s - The scale factor
   * @returns {Vector2} - A new Vector2 equal to v1 scaled by s
   */
  public static scale(v: Vector2, s: number): Vector2 {
    return { x: v.x * s, y: v.y * s };
  }
}
