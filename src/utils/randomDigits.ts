export function randomDigits(digits: number) {
    return Math.floor(
        Math.random() * Math.pow(10, digits) + Math.pow(10, digits)
    )
        .toString()
        .slice(-digits);
}
