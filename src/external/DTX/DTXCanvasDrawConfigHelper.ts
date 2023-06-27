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
            if (chartMode === "XG/Gitadora") {
                //Re-map to other lanes for modes with fewer lanes
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
        }

        return retArray;
    }
}

export type { DTXChipDrawingLane, DTXChipRelativePosSize };

export default DTXCanvasDrawConfigHelper;
