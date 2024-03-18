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
    //Round to nearest second first since we only show up to seconds
    const secondsRounded = Math.round(inputSeconds);
    const minutes = Math.floor(secondsRounded / 60);
    const seconds = secondsRounded % 60;
    return minutes + ":" + convertNumberToFormattedText(seconds, 2);
};

export { convertNumberToFormattedText, convertSecondsToMMssFormat };
