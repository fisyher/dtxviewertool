const matchSingleLineWithRegex = (line: string, regex: RegExp): boolean => {
    const trimmedLine: string = line.trim();

    let matches: RegExpExecArray | null = null;
    let matchFound: boolean = false;

    while ((matches = regex.exec(trimmedLine)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (matches.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        if(matches.length > 0){
            matchFound = true;
        }

        // Only need the first match, so break out to skip necessary regex search
        if(matchFound){
            break;
        }
    }

    return matchFound;
};


export {matchSingleLineWithRegex};
