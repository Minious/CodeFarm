export class Utils {
    static clamp(n: number, min: number, max: number) {
        return Math.min(Math.max(n, min), max);
    }

    static getRandomSetInArray(arr: Array<any>, n: number) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    static randomEnum<T>(anEnum: T): T[keyof T] {
        const enumValues = Object.keys(anEnum) as unknown as T[keyof T][]
        return enumValues[Math.floor(Math.random() * enumValues.length)]
    }
}