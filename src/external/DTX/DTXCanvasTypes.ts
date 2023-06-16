//DifficultyLabel
enum DifficultyLabelEnum {
  BASIC = "Basic",
  ADVANCED = "Advanced",
  EXTREME = "Extreme",
  MASTER = "Master",
  REAL = "Real",
}
//Array version computed from Enum
const DifficultyLabels: string[] = Object.values(DifficultyLabelEnum);
/**
 * This is equivalent to:
 * type DifficultyLabelType = 'Basic' | 'Advanced' | 'Extreme' | 'Master' | Real;
 */
type DifficultyLabelType = `${DifficultyLabelEnum}`;

//ChartModeEnum
enum ChartModeEnum {
  XG_GITADORA = "XG/Gitadora",
  CLASSIC = "Classic",
  FULL = "Full",
}
//Array version computed from Enum
const ChartModes: string[] = Object.values(ChartModeEnum);
type ChartModeType = `${ChartModeEnum}`;

//GameModeEnum
enum GameModeEnum {
    DRUM = "Drum",
    GUITAR = "Guitar",
    BASS = "Bass",
  }
  //Array version computed from Enum
  const GameModes: string[] = Object.values(GameModeEnum);
  type GameModeType = `${GameModeEnum}`;

//Assumes origin is top left
interface DTXRect {
  posX: number;
  posY: number;
  width: number;
  height: number;
}

interface DTXChipPixelRectPos {
  laneType: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  text? : string;
  //canvasSheetIndex: number;
}

interface DTXChipPositionInCanvas {
    chipPositions: DTXChipPixelRectPos[]
}

interface DTXDrawingConfig {
  difficultyLabel: DifficultyLabelType;
  scale: number;
  maxHeight: number;
  chartMode: ChartModeType;
  gameMode: GameModeType;
  isLevelShown: boolean;
}

export type { DTXRect, DTXChipPixelRectPos, ChartModeType, DifficultyLabelType, DTXDrawingConfig, DTXChipPositionInCanvas, GameModeType };
export { ChartModes, DifficultyLabels };