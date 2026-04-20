export function calcAspectRatio(width: number, height: number) {
    // .toFixed returns string...
    const pow = Math.pow(10, 2);
    return Math.round((width / height) * pow) / pow;
}