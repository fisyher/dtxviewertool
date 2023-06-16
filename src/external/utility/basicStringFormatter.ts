

const convertNumberToFormattedText = (inputValue: number, numOfDigits? : number | undefined) : string => {
    let output = inputValue.toString();
    if(numOfDigits && numOfDigits > output.length){
        const prependZeroCount = numOfDigits - output.length;
        for (let index = 0; index < prependZeroCount; index++) {
            output = '0' + output;            
        }    
    }
    return output;
}

export {convertNumberToFormattedText}

