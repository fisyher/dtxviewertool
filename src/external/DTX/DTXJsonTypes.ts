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

interface DTXSongInfoType {
  title: string;
  artist: string;
  comment: string;
  difficultyLevelDrum: number;
  difficultyLevelGuitar: number;
  difficultyLevelBass: number;
  songDuration: number;
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

interface DTXChip {
  barNumber: number;
  lineNumberInBar: number;
  timePosition: number;
  chipCode: String;
  laneType: String;
}

interface DTXJson {
  songInfo: DTXSongInfoType;
  metadata?: DTXMetaDataType;
  chips: Array<DTXChip>;
  bars: Array<DTXBar>;
  bpmSegments: Array<DTXBpmSegment>;
}

export type { DTXBar, DTXBpmSegment, DTXChip, DTXSongInfoType, DTXMetaDataType };

export default DTXJson;
