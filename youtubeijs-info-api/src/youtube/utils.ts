export function calculateAspectRatio(width: number, height: number) {
    return toFixedNumber((width / height) || 0, 2);
}

export function toFixedNumber(num: number, digits: number) {
    const pow = Math.pow(10, digits);
    return Math.round(num * pow) / pow;
}