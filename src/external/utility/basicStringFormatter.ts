const convertNumberToFormattedText = (inputValue: number, numOfDigits?: number | undefined): string => {
    let output = inputValue.toString();
    if (numOfDigits && numOfDigits > output.length) {
        const prependZeroCount = numOfDigits - output.length;
        for (let index = 0; index < prependZeroCount; index++) {
            output = "0" + output;
        }
    }
    return output;
};

const convertSecondsToMMssFormat = (inputSeconds: number): string => {
    const minutes = Math.floor(inputSeconds / 60);
    const seconds = Math.round(inputSeconds % 60);
    return minutes + ":" + convertNumberToFormattedText(seconds, 2);
};

export { convertNumberToFormattedText, convertSecondsToMMssFormat };
