/**
 * Output JSON format
 * {
 * songInfo: DTXSongInfoType,
 * metadata: DTXMetaDataType,
 * chips: DTXChip[],
 * bars: DTXBar[],
 * bpmSegments: DTXBpmSegment[]
 * }
 *
 * DTXChip = {
 *    barNumber: number,
 *    lineNumberInBar: number,
 *    timePosition: number,
 *    type: String
 * }
 *
 * Transient Data Types
 *
 * {
 * bars: DTXBar[],
 * bpmSegments: DTXBpmSegment[]
 * }
 *
 * DTXBar = {
 *      lineCount: number,
 *      startTimePos: number,
 *      duration: number
 * }
 *
 * DTXBpmSegment = {
 *  bpm: number,
 *  startBarNum: number,
 *  startLineNum: number,
 *  startTimePos: number,
 *  duration: number
 * }
 *
 *
 */

type DTXFileType = "dtx" | "gda";

interface DTXSongInfoType {
    title: string;
    artist: string;
    comment: string;
    difficultyLevelDrum: number;
    difficultyLevelGuitar: number;
    difficultyLevelBass: number;
    songDuration: number;
    noteCountDrum: number;
    noteCountGuitar: number;
    noteCountBass: number;
}

interface DTXMetaDataType {
    source: String;
    size: number;
    version: String;
}

interface DTXBar {
    lineCount: number;
    startTimePos: number;
    duration: number;
}

interface DTXBpmSegment {
    bpm: number;
    startBarNum: number;
    startLineNum: number;
    startTimePos: number;
    duration: number;
}

interface DTXLine {
    barNumber: number;
    lineNumberInBar: number;
    timePosition: number;
}

interface DTXChip {
    lineTimePosition: DTXLine;
    chipCode: string;
    laneType: string;
}

interface DTXLaneChipCounter {
    [type: string]: number;
}

interface DTXJson {
    songInfo: DTXSongInfoType;
    metadata?: DTXMetaDataType;
    chips: Array<DTXChip>;
    bars: Array<DTXBar>;
    quarterBarLines: Array<DTXLine>;
    bpmSegments: Array<DTXBpmSegment>;
    laneChipCounter: DTXLaneChipCounter;
}

const EmptyDTXJson: DTXJson = {
    songInfo: {
        title: "",
        artist: "",
        comment: "",
        difficultyLevelDrum: 0,
        difficultyLevelGuitar: 0,
        difficultyLevelBass: 0,
        songDuration: 0,
        noteCountDrum: 0,
        noteCountGuitar: 0,
        noteCountBass: 0
    },
    bars: [],
    quarterBarLines: [],
    bpmSegments: [],
    chips: [],
    laneChipCounter: {}
};

export type { DTXBar, DTXBpmSegment, DTXChip, DTXLine, DTXSongInfoType, DTXMetaDataType, DTXFileType };
export { EmptyDTXJson };
export default DTXJson;
