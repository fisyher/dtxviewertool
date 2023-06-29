import { ChartModeType, GameModeType } from "./DTXCanvasTypes";

interface DTXChipRelativePosSize {
    posX: number;
    width: number;
    height: number;
}

interface DTXCanvasLaneToChipRelativePosSize {
    [key: string]: DTXChipRelativePosSize;
}

interface DTXChipDrawingLane {
    drawingLane: string;
    chipRelativePosSize: DTXChipRelativePosSize;
}

const DEFAULT_CHIP_HEIGHT = 5;
const DEFAULT_CHIP_WIDTH = 18;

const COMMON_CHIP_POS_SIZE_INFO: DTXCanvasLaneToChipRelativePosSize = {
    Bar: { posX: 60, width: 200, height: 2 },
    QuarterBar: { posX: 60, width: 200, height: 1 },
    BGM: { posX: 60, width: 200, height: 2 },
    EndLine: { posX: 60, width: 200, height: 2 },
    BPMMarker: { posX: 50, width: 10, height: 2 }
};

const DM_CHIP_POS_SIZE_INFO: DTXCanvasLaneToChipRelativePosSize = {
    "LeftCrashCymbal": { posX: 60, width: DEFAULT_CHIP_WIDTH + 6, height: DEFAULT_CHIP_HEIGHT },
    "Hi-Hat": { posX: 84, width: DEFAULT_CHIP_WIDTH, height: DEFAULT_CHIP_HEIGHT },
    "LeftBassPedal": { posX: 102, width: DEFAULT_CHIP_WIDTH, height: DEFAULT_CHIP_HEIGHT },
    "LeftHiHatPedal": { posX: 102, width: DEFAULT_CHIP_WIDTH, height: DEFAULT_CHIP_HEIGHT },
    "Snare": { posX: 120, width: DEFAULT_CHIP_WIDTH + 3, height: DEFAULT_CHIP_HEIGHT },
    "Hi-Tom": { posX: 141, width: DEFAULT_CHIP_WIDTH, height: DEFAULT_CHIP_HEIGHT },
    "RightBassPedal": { posX: 159, width: DEFAULT_CHIP_WIDTH + 5, height: DEFAULT_CHIP_HEIGHT },
    "Low-Tom": { posX: 182, width: DEFAULT_CHIP_WIDTH, height: DEFAULT_CHIP_HEIGHT },
    "Floor-Tom": { posX: 200, width: DEFAULT_CHIP_WIDTH, height: DEFAULT_CHIP_HEIGHT },
    "RightCrashCymbal": { posX: 218, width: DEFAULT_CHIP_WIDTH + 6, height: DEFAULT_CHIP_HEIGHT },
    "RideCymbal": { posX: 242, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT }
};

const GUITAR_BASS_CHIP_POS_SIZE_INFO: DTXCanvasLaneToChipRelativePosSize = {
    Red: { posX: 60, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Green: { posX: 78, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Blue: { posX: 96, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Yellow: { posX: 114, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Pink: { posX: 132, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Open: { posX: 60, width: (DEFAULT_CHIP_WIDTH + 1) * 5, height: DEFAULT_CHIP_HEIGHT },
    OpenV: { posX: 60, width: (DEFAULT_CHIP_WIDTH + 1) * 3, height: DEFAULT_CHIP_HEIGHT },
    Wail: { posX: 150, width: 15, height: 19 }
};

const GUITAR_BASS_BUTTON_ORDER: string[] = ["Red", "Green", "Blue", "Yellow", "Pink"];
const GUITAR_BASS_V_BUTTON_ORDER: string[] = ["Red", "Green", "Blue", "Green", "Blue"];

export type { DTXCanvasLaneToChipRelativePosSize };

class DTXCanvasDrawConfigHelper {
    public static getRelativeSizePosOfChipsForLaneCode(
        laneCode: string,
        gameMode: GameModeType,
        chartMode: ChartModeType
    ): DTXChipDrawingLane[] {
        let retArray: DTXChipDrawingLane[] = [];

        if (gameMode === "Drum") {
            const combinedMap: DTXCanvasLaneToChipRelativePosSize = {
                ...COMMON_CHIP_POS_SIZE_INFO,
                ...DM_CHIP_POS_SIZE_INFO
            };
            let tempLaneCode = laneCode;
            //Re-map to other lanes for modes with fewer lanes
            if (chartMode === "XG/Gitadora") {
                if (tempLaneCode === "RideCymbal") {
                    tempLaneCode = "RightCrashCymbal";
                } else if (tempLaneCode === "LeftBassPedal") {
                    tempLaneCode = "LeftHiHatPedal";
                }
            } else if (chartMode === "Classic") {
                if (tempLaneCode === "LeftCrashCymbal") {
                    tempLaneCode = "Hi-Hat";
                } else if (tempLaneCode === "LeftBassPedal" || tempLaneCode === "LeftHiHatPedal") {
                    tempLaneCode = "RightBassPedal";
                } else if (tempLaneCode === "Floor-Tom") {
                    tempLaneCode = "Low-Tom";
                } else if (tempLaneCode === "RideCymbal") {
                    tempLaneCode = "RightCrashCymbal";
                }
            }

            if (combinedMap[tempLaneCode]) {
                const drumChipDrawingLane: DTXChipDrawingLane = {
                    drawingLane: tempLaneCode,
                    chipRelativePosSize: combinedMap[tempLaneCode]
                };

                retArray.push(drumChipDrawingLane);
            }
        } else {
            //Draw common chips like bar lines, BPM markers the same way for Guitar/Bass
            if (COMMON_CHIP_POS_SIZE_INFO[laneCode]) {
                const chipDrawingLane: DTXChipDrawingLane = {
                    drawingLane: laneCode,
                    chipRelativePosSize: COMMON_CHIP_POS_SIZE_INFO[laneCode]
                };

                retArray.push(chipDrawingLane);
            } else {
                //Guitar/Bass
                if (laneCode === "GWail" && gameMode === "Guitar") {
                    retArray.push({
                        drawingLane: "Wail",
                        chipRelativePosSize: GUITAR_BASS_CHIP_POS_SIZE_INFO["Wail"]
                    });
                } else if (laneCode === "BWail" && gameMode === "Bass") {
                    retArray.push({
                        drawingLane: "Wail",
                        chipRelativePosSize: GUITAR_BASS_CHIP_POS_SIZE_INFO["Wail"]
                    });
                } else {
                    let buttonPressArray: string[] | undefined = this.convertLaneCodeToButtonPressArray(
                        laneCode,
                        gameMode,
                        chartMode
                    );
                    if (buttonPressArray) {
                        buttonPressArray.forEach((buttonPress) => {
                            const chipDrawingLane: DTXChipDrawingLane = {
                                drawingLane: buttonPress,
                                chipRelativePosSize: GUITAR_BASS_CHIP_POS_SIZE_INFO[buttonPress]
                            };

                            retArray.push(chipDrawingLane);
                        });
                    }
                }
            }
        }

        return retArray;
    }

    private static convertLaneCodeToButtonPressArray(
        laneCode: string,
        gameMode: GameModeType,
        chartMode: ChartModeType
    ): string[] | undefined {
        let prefix: string = "G";
        if (gameMode === "Bass") {
            prefix = "B";
        }

        //Starts with G or B and has 5 numeric characters thereafter
        const regex = new RegExp(`[${prefix}](\\d{5})`, "g");

        let matches: RegExpExecArray | null = null;
        let laneCodeSupported: boolean = false;

        while ((matches = regex.exec(laneCode)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (matches.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            matches.forEach((match, groupIndex) => {
                console.log(`Found match, group ${groupIndex}: ${match}`);
                laneCodeSupported = true;
            });
        }

        if (laneCodeSupported) {
            let retButtonPressArray: string[] = [];
            const numCodeArray: string[] = laneCode.split("").splice(1, 5);

            const buttonOrder: string[] =
                chartMode == "Classic" ? GUITAR_BASS_V_BUTTON_ORDER : GUITAR_BASS_BUTTON_ORDER;

            const set1 = new Set();
            for (let index = 0; index < numCodeArray.length; index++) {
                const numCode: string = numCodeArray[index];
                if (numCode === "1") {
                    //Use set to prevent adding multiple chips of the same button
                    //Affects Classic mode only
                    if (!set1.has(buttonOrder[index])) {
                        set1.add(buttonOrder[index]);
                        retButtonPressArray.push(buttonOrder[index]);
                    }
                }
            }

            //If still empty, means 00000 i.e. OPEN
            if (retButtonPressArray.length === 0) {
                retButtonPressArray.push( chartMode == "Classic" ? "OpenV" :"Open");
            }

            return retButtonPressArray;
        }

        return;
    }
}

export type { DTXChipDrawingLane, DTXChipRelativePosSize };

export default DTXCanvasDrawConfigHelper;
