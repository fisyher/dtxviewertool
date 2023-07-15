import { matchSingleLineWithRegex } from "../utility/StringFormatMatcher";
import { ChartModeType, DTXImageRectPos, DTXRect, GameModeType } from "./DTXCanvasTypes";

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

const DEFAULT_FRAME_RECT_WIDTH = 201;

const COMMON_CHIP_POS_SIZE_INFO: DTXCanvasLaneToChipRelativePosSize = {
    Bar: { posX: 60, width: DEFAULT_FRAME_RECT_WIDTH, height: 2 }, //Not actually a chip
    QuarterBar: { posX: 60, width: DEFAULT_FRAME_RECT_WIDTH, height: 1 }, //Not actually a chip
    BGM: { posX: 60, width: DEFAULT_FRAME_RECT_WIDTH, height: 2 },
    EndLine: { posX: 60, width: DEFAULT_FRAME_RECT_WIDTH, height: 2 }, //Not actually a chip
    BPMMarker: { posX: 50, width: 10, height: 2 },
    BarNumMarker: { posX: 261, width: 39, height: 9 } //Takes up remaining space of 39 pixel, total width for DM is 300
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
    Green: { posX: 79, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Blue: { posX: 98, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Yellow: { posX: 117, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Pink: { posX: 136, width: DEFAULT_CHIP_WIDTH + 1, height: DEFAULT_CHIP_HEIGHT },
    Open: { posX: 60, width: (DEFAULT_CHIP_WIDTH + 1) * 5, height: DEFAULT_CHIP_HEIGHT },
    OpenV: { posX: 60, width: (DEFAULT_CHIP_WIDTH + 1) * 3, height: DEFAULT_CHIP_HEIGHT },
    Wail: { posX: 155, width: 15, height: 19 },
    WailV: { posX: 117, width: 15, height: 19 }
};

const GUITAR_BASS_BUTTON_ORDER: string[] = ["Red", "Green", "Blue", "Yellow", "Pink"];
const GUITAR_BASS_V_BUTTON_ORDER: string[] = ["Red", "Green", "Blue", "Green", "Blue"];

class DTXCanvasDrawConfigHelper {
    public static getRelativeSizePosOfChipsForLaneCode(
        laneCode: string,
        gameMode: GameModeType,
        chartMode: ChartModeType
    ): DTXChipDrawingLane[] {
        let retArray: DTXChipDrawingLane[] = [];

        //Draw common chips like BGM, BPM markers
        if (COMMON_CHIP_POS_SIZE_INFO[laneCode]) {
            let currChipRelativePosSize: DTXChipRelativePosSize = COMMON_CHIP_POS_SIZE_INFO[laneCode];
            //BGM is the only chip that is drawn covering the full Frame Rect
            //Since the Frame Rect width is dynamic according to game and chart mode, it is set here specifically
            if (laneCode === "BGM") {
                currChipRelativePosSize = {
                    ...currChipRelativePosSize,
                    width: DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode)
                };
            }

            const chipDrawingLane: DTXChipDrawingLane = {
                drawingLane: laneCode,
                chipRelativePosSize: currChipRelativePosSize
            };

            retArray.push(chipDrawingLane);
        } else {
            if (gameMode === "Drum") {
                const combinedMap: DTXCanvasLaneToChipRelativePosSize = DM_CHIP_POS_SIZE_INFO;
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
                //Guitar/Bass
                if (laneCode === "GWail" && gameMode === "Guitar") {
                    retArray.push({
                        drawingLane: "Wail",
                        chipRelativePosSize: GUITAR_BASS_CHIP_POS_SIZE_INFO[chartMode === "Classic" ? "WailV" : "Wail"]
                    });
                } else if (laneCode === "BWail" && gameMode === "Bass") {
                    retArray.push({
                        drawingLane: "Wail",
                        chipRelativePosSize: GUITAR_BASS_CHIP_POS_SIZE_INFO[chartMode === "Classic" ? "WailV" : "Wail"]
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

    public static convertHoldNoteRectsToDrawingImageRects(
        holdNoteRect: DTXRect,
        laneCode: string,
        gameMode: GameModeType,
        chartMode: ChartModeType
    ): DTXImageRectPos[] {
        let retImageRect: DTXImageRectPos[] = [];

        let buttonPressArray: string[] | undefined = this.convertLaneCodeToButtonPressArray(
            laneCode,
            gameMode,
            chartMode
        );

        if (buttonPressArray) {
            buttonPressArray.forEach((buttonPress) => {
                if (buttonPress === "Open" || buttonPress === "OpenV") {
                    console.error("Hold Note with Open / OpenV press detected and discarded");
                } else {
                    const drawingHoldNoteRect: DTXImageRectPos = {
                        name: `${buttonPress}Hold`,
                        rectPos: {
                            posX: holdNoteRect.posX + GUITAR_BASS_CHIP_POS_SIZE_INFO[buttonPress].posX,
                            posY: holdNoteRect.posY,
                            width: GUITAR_BASS_CHIP_POS_SIZE_INFO[buttonPress].width,
                            height: holdNoteRect.height
                        }
                    };
                    retImageRect.push(drawingHoldNoteRect);
                }
            });
        }

        return retImageRect;
    }

    public static getFrameRectRelativePosX(gameMode: GameModeType, chartMode: ChartModeType): number {
        return COMMON_CHIP_POS_SIZE_INFO.Bar.posX;
    }

    public static getFrameRectWidth(gameMode: GameModeType, chartMode: ChartModeType): number {
        //Set to default value of 201
        let retWidth = COMMON_CHIP_POS_SIZE_INFO.Bar.width;
        if (gameMode === "Drum") {
            if (chartMode === "Classic" || chartMode === "XG/Gitadora") {
                retWidth = retWidth - DM_CHIP_POS_SIZE_INFO["RideCymbal"].width;
            }
        } else {
            retWidth = (DEFAULT_CHIP_WIDTH + 1) * 5 + GUITAR_BASS_CHIP_POS_SIZE_INFO.Wail.width;
            if (chartMode === "Classic") {
                retWidth = (DEFAULT_CHIP_WIDTH + 1) * 3 + GUITAR_BASS_CHIP_POS_SIZE_INFO.Wail.width;
            }
        }
        return retWidth;
    }

    public static getFullBodyFrameWidth(gameMode: GameModeType, chartMode: ChartModeType): number {
        return (
            COMMON_CHIP_POS_SIZE_INFO.Bar.posX +
            DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode) +
            COMMON_CHIP_POS_SIZE_INFO.BarNumMarker.width
        );
    }

    public static getCommonChipRelativePosSize(laneCode: string): DTXChipRelativePosSize | undefined {
        return COMMON_CHIP_POS_SIZE_INFO[laneCode];
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
        const laneCodeSupported: boolean = matchSingleLineWithRegex(laneCode, regex);

        if (laneCodeSupported) {
            let retButtonPressArray: string[] = [];
            const numCodeArray: string[] = laneCode.split("").splice(1, 5);

            const buttonOrder: string[] =
                chartMode === "Classic" ? GUITAR_BASS_V_BUTTON_ORDER : GUITAR_BASS_BUTTON_ORDER;

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
                retButtonPressArray.push(chartMode === "Classic" ? "OpenV" : "Open");
            }

            return retButtonPressArray;
        }

        return;
    }
}

export type { DTXChipDrawingLane, DTXChipRelativePosSize, DTXCanvasLaneToChipRelativePosSize };

export default DTXCanvasDrawConfigHelper;
