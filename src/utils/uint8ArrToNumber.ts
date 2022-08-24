/**
 * Converts a Uint8Array representation of an integer back into a number.
 *
 * @param arr The array to convert.
 * @returns the number representation of arr.
 */
export function uint8ArrToNumber(arr: Uint8Array) {
    return Buffer.from(arr).readUIntBE(0, arr.length);
}
