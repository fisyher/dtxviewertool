import DTXJson, { DTXBar, DTXBpmSegment, DTXChip, DTXLine } from "./DTXJsonTypes";
import {
  DTXRect,
  DTXChipPixelRectPos,
  DTXDrawingConfig,
  DTXCanvasDataType,
  DTXTextRectPos,
  GameModeType,
  ChartModeType,
} from "./DTXCanvasTypes";
import { convertNumberToFormattedText, convertSecondsToMMssFormat } from "../utility/basicStringFormatter";

interface DTXInterimBarPosType {
  absoluteTime: number;
  relativePosY: number;
  frameIndex: number;
  canvasSheetIndex: number;
}

interface DTXFrameRect {
  rectPos: DTXRect;
  canvasSheetIndex: number;
}

export class DtxCanvasPositioner {
  readonly DEFAULT_SCALE = 1.0;
  readonly MIN_SCALE = 0.5;
  readonly MAX_SCALE = 3.0;

  // readonly DEFAULT_PAGE_HEIGHT = 720;
  // readonly MIN_PAGE_HEIGHT = 480;
  // readonly MAX_PAGE_HEIGHT = 3840;

  readonly DEFAULT_PAGEPERCANVAS = 20;
  readonly MIN_PAGEPERCANVAS = 6;
  readonly MAX_PAGEPERCANVAS = 50;

  readonly HEADER_SECTION_HEIGHT = 60;
  readonly SECTION_SPLIT_MARGIN = 2;
  readonly FOOTER_SECTION_HEIGHT = 50;
  readonly BODY_FRAME_MARGINS = {
    top: 10,
    bottom: 10,
    left: 0,
    right: 0,
  };
  //Does not include left+right margins
  readonly BODY_FRAME_WIDTH = 300;

  //Base PIXELS_PER_SECOND is 192 px at scale 1.0
  //This is equivalent of a drawing a full 4/4 bar at 240 BPM with 192 pixels
  readonly BASE_BPM = 240;
  readonly BASE_PIXELS_PER_SECOND = 192 * (this.BASE_BPM / 240);

  //
  readonly DEFAULT_DRAW_DIRECTION_DOWN_TO_UP: boolean = true;

  /**
   * Bar
   * LeftCrashCymbal
   * Hi-Hat
   * Snare
   * LeftBassPedal
   * Hi-Tom
   * RightBassPedal
   * Low-Tom
   * Floor-Tom
   * RightCrashCymbal
   * RideCymbal
   * BPM Segment
   */
  //Width and Height of chips are standard
  readonly DEFAULT_CHIP_HEIGHT = 5;
  readonly DEFAULT_CHIP_WIDTH = 18;
  readonly DEFAULT_LANE_BORDER = 1;

  //Put in a map and reference this map instead in case need to change
  readonly DM_CHIP_POS_SIZE_INFO: { [key: string]: { posX: number; width: number; height: number } } = {
    Bar: { posX: 60, width: 200, height: 2 },
    QuarterBar: { posX: 60, width: 200, height: 1 },
    BGM: { posX: 60, width: 200, height: 2 },
    LeftCrashCymbal: { posX: 60, width: this.DEFAULT_CHIP_WIDTH + 6, height: this.DEFAULT_CHIP_HEIGHT },
    "Hi-Hat": { posX: 84, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    LeftBassPedal: { posX: 102, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    Snare: { posX: 120, width: this.DEFAULT_CHIP_WIDTH + 3, height: this.DEFAULT_CHIP_HEIGHT },
    "Hi-Tom": { posX: 141, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    RightBassPedal: { posX: 159, width: this.DEFAULT_CHIP_WIDTH + 5, height: this.DEFAULT_CHIP_HEIGHT },
    "Low-Tom": { posX: 182, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    "Floor-Tom": { posX: 200, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    RightCrashCymbal: { posX: 218, width: this.DEFAULT_CHIP_WIDTH + 6, height: this.DEFAULT_CHIP_HEIGHT },
    RideCymbal: { posX: 242, width: this.DEFAULT_CHIP_WIDTH + 1, height: this.DEFAULT_CHIP_HEIGHT },
    BPMMarker: { posX: 50, width: 10, height: 2 },
  };

  private barIndexToFrameSheetMapping: DTXInterimBarPosType[];
  private actualPixelsPerSecond: number;
  private isDrawFromDownToUp: boolean;
  private bodySectionHeightPerCanvas: number[] = [];

  private canvasDTXObjects: DTXCanvasDataType[] = [];

  /**
   * Constructor takes in DTXJson object and a Drawing configuration selected by UI
   */
  constructor(dtxJson: DTXJson, drawingOptions: DTXDrawingConfig) {
    const maxBodySectionRect = this.availableBodySectionRect(drawingOptions.maxHeight);

    this.actualPixelsPerSecond = drawingOptions.scale * this.BASE_PIXELS_PER_SECOND;
    this.isDrawFromDownToUp = this.DEFAULT_DRAW_DIRECTION_DOWN_TO_UP;

    //Compute the interim mapping of Bar to Frame/Sheet index, number of canvas, body section height and canvas-width
    //Ensure entire bars would be drawn within the same frame
    const { barFrameSheetMapping, numOfCanvas, bodySectionHeightPerCanvas, widthPerCanvas, partialFrameRect } =
      this.computeBarIndexToFrameSheetMapping(dtxJson, maxBodySectionRect.height);
    this.barIndexToFrameSheetMapping = barFrameSheetMapping;
    this.bodySectionHeightPerCanvas = bodySectionHeightPerCanvas;

    //Initialize the canvasChipPositions given the number of canvas computed. This should be 1 for most charts
    for (let index = 0; index < numOfCanvas; index++) {
      this.canvasDTXObjects.push({
        chipPositions: [],
        textPositions: [],
        frameRect: [],
        canvasSize: {
          width: widthPerCanvas[index],
          height: this.canvasHeightGivenBodySectionHeight(bodySectionHeightPerCanvas[index]),
        },
      });
    }

    //
    //Update posY for all frames, now that we have the actual body section height
    for (let index = 0; index < partialFrameRect.length; index++) {
      const frameRect: DTXFrameRect = partialFrameRect[index];
      const currCanvasHeight: number = this.canvasHeightGivenBodySectionHeight(bodySectionHeightPerCanvas[frameRect.canvasSheetIndex]);
      frameRect.rectPos.posY = currCanvasHeight - (this.FOOTER_SECTION_HEIGHT +
        this.SECTION_SPLIT_MARGIN +
        this.BODY_FRAME_MARGINS.top + frameRect.rectPos.height);
        //Also push the frameRect info into canvasDTXObjects
        this.canvasDTXObjects[frameRect.canvasSheetIndex].frameRect.push({...frameRect.rectPos});
    }


    //Compute pixel positions for chips to be drawn and store into canvasDTXObjects
    this.computeChipPositionInCanvas(dtxJson);

    //
    this.createTextInfoForDrawing(dtxJson, drawingOptions.gameMode, drawingOptions.chartMode);
  }

  public getCanvasDataForDrawing(): DTXCanvasDataType[] {
    return this.canvasDTXObjects;
  }

  private getCurrentDifficultyLevel(dtxJson: DTXJson, gameMode: GameModeType): number {
    let diffLevel = dtxJson.songInfo.difficultyLevelDrum;

    if (gameMode === "Guitar") {
      diffLevel = dtxJson.songInfo.difficultyLevelGuitar;
    } else if (gameMode === "Bass") {
      diffLevel = dtxJson.songInfo.difficultyLevelBass;
    }

    return diffLevel;
  }

  private getCurrentNoteCount(dtxJson: DTXJson, gameMode: GameModeType): number {
    let noteCount = dtxJson.songInfo.noteCountDrum;

    if (gameMode === "Guitar") {
      noteCount = dtxJson.songInfo.noteCountGuitar;
    } else if (gameMode === "Bass") {
      noteCount = dtxJson.songInfo.noteCountBass;
    }

    return noteCount;
  }

  private convertDifficultyLevelToText(level: number, chartMode: ChartModeType): string {
    if (chartMode === "Classic") {
      return Math.floor(level * 10).toFixed(0);
    }

    return level.toFixed(2);
  }

  private createTextInfoForDrawing(dtxJson: DTXJson, gameMode: GameModeType, chartMode: ChartModeType): void {
    let localTextPostArray: DTXTextRectPos[] = [];

    //Title
    const titlePos: DTXTextRectPos = {
      rectPos: {
        posX: 70,
        posY: 15,
        width: 400,
        height: 25,
      },
      fontFamily: "Arial",
      fontWeight: 200,
      fontSize: 24,
      color: "#ffffff",
      text: dtxJson.songInfo.title,
    };

    //Artist
    const artistPos: DTXTextRectPos = {
      rectPos: {
        posX: 70,
        posY: 45,
        width: 400,
        height: 25,
      },
      fontFamily: "Arial",
      fontWeight: 200,
      fontSize: 16,
      color: "#ffffff",
      text: dtxJson.songInfo.artist,
    };

    //Difficulty Level
    const diffLevelText: string = this.convertDifficultyLevelToText(
      this.getCurrentDifficultyLevel(dtxJson, gameMode),
      chartMode
    );
    const BPMText: string = dtxJson.bpmSegments[0].bpm.toFixed(0);
    const durationText: string = convertSecondsToMMssFormat(dtxJson.songInfo.songDuration);
    const noteCount: number = this.getCurrentNoteCount(dtxJson, gameMode);
    const difficultyLevelPos: DTXTextRectPos = {
      rectPos: {
        posX: 710,
        posY: 15,
        width: 400,
        height: 25,
      },
      fontFamily: "Arial",
      fontWeight: 200,
      fontSize: 24,
      color: "#ffffff",
      text: `Level ${diffLevelText}`,
    };

    const otherSongInfoPos: DTXTextRectPos = {
      rectPos: {
        posX: 710,
        posY: 45,
        width: 400,
        height: 25,
      },
      fontFamily: "Arial",
      fontWeight: 200,
      fontSize: 16,
      color: "#ffffff",
      text: `BPM ${BPMText} Length ${durationText} Notes ${noteCount}`,
    };

    //
    localTextPostArray.push(titlePos);
    localTextPostArray.push(artistPos);
    localTextPostArray.push(difficultyLevelPos);
    localTextPostArray.push(otherSongInfoPos);

    this.canvasDTXObjects.forEach((canvasData) => {
      canvasData.textPositions = canvasData.textPositions.concat(localTextPostArray);
    });
  }

  private computeChipPositionInCanvas(dtxJson: DTXJson): void {
    //let retResult: DTXChipPixelPos[] = [];

    //Compute for bar lines
    for (let index = 0; index < dtxJson.bars.length; index++) {
      const barInfo: DTXBar = dtxJson.bars[index];
      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(index, barInfo.startTimePos);

      //Bar Line
      const chipPixelPos: DTXChipPixelRectPos = {
        laneType: "Bar",
        rectPos: {
          posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO["Bar"].posX,
          posY: chipLinePosInCanvas.posY,
          width: this.DM_CHIP_POS_SIZE_INFO["Bar"].width,
          height: this.DM_CHIP_POS_SIZE_INFO["Bar"].height,
        },
      };

      //Bar Number
      const textPos: DTXTextRectPos = {
        rectPos: {
          posX:
            chipLinePosInCanvas.posX +
            this.DM_CHIP_POS_SIZE_INFO["Bar"].posX +
            this.DM_CHIP_POS_SIZE_INFO["Bar"].width +
            5,
          posY: chipLinePosInCanvas.posY,
          width: 50,
          height: 21,
        },
        fontFamily: "Arial",
        fontWeight: 200,
        fontSize: 18,
        color: "#ffffff",
        text: convertNumberToFormattedText(index, 3),
      };

      this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
      this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].textPositions.push(textPos);
    }

    //Compute for Quarter bars
    for (let index = 0; index < dtxJson.quarterBarLines.length; index++) {
      const quarterBarLine: DTXLine = dtxJson.quarterBarLines[index];
      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
        quarterBarLine.barNumber,
        quarterBarLine.timePosition
      );

      //Bar Line
      const chipPixelPos: DTXChipPixelRectPos = {
        laneType: "QuarterBar",
        rectPos: {
          posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO["QuarterBar"].posX,
          posY: chipLinePosInCanvas.posY,
          width: this.DM_CHIP_POS_SIZE_INFO["QuarterBar"].width,
          height: this.DM_CHIP_POS_SIZE_INFO["QuarterBar"].height,
        },
      };

      this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
    }

    //Compute for BPM change marker
    for (let index = 0; index < dtxJson.bpmSegments.length; index++) {
      const bpmSegment: DTXBpmSegment = dtxJson.bpmSegments[index];

      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(bpmSegment.startBarNum, bpmSegment.startTimePos);

      //BPM Line
      const chipPixelPos: DTXChipPixelRectPos = {
        laneType: "BPMMarker",
        rectPos: {
          posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO["BPMMarker"].posX,
          posY: chipLinePosInCanvas.posY,
          width: this.DM_CHIP_POS_SIZE_INFO["BPMMarker"].width,
          height: this.DM_CHIP_POS_SIZE_INFO["BPMMarker"].height,
        },
      };

      //BPM Value as text
      const textPos: DTXTextRectPos = {
        rectPos: {
          posX: chipLinePosInCanvas.posX + 10,
          posY: chipLinePosInCanvas.posY,
          width: 50,
          height: 15,
        },
        fontFamily: "Arial",
        fontWeight: 100,
        fontSize: 12,
        color: "#ffffff",
        text: bpmSegment.bpm.toFixed(2),
      };

      this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
      this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].textPositions.push(textPos);
    }

    //Compute for chips
    for (let index = 0; index < dtxJson.chips.length; index++) {
      const chip: DTXChip = dtxJson.chips[index];
      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
        chip.lineTimePosition.barNumber,
        chip.lineTimePosition.timePosition
      );

      //
      const chipPixelPos: DTXChipPixelRectPos = {
        laneType: chip.laneType,
        rectPos: {
          posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO[chip.laneType].posX,
          posY: chipLinePosInCanvas.posY,
          width: this.DM_CHIP_POS_SIZE_INFO[chip.laneType].width,
          height: this.DM_CHIP_POS_SIZE_INFO[chip.laneType].height,
        },
      };

      this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
    }

    // return retResult;
  }

  private computeActualPixelPosY(relativePosY: number, bodySectionRect: DTXRect, isBottomUp: boolean): number {
    //DM style: Bottom to Top
    if (isBottomUp) {
      return bodySectionRect.posY + bodySectionRect.height - relativePosY;
    }
    //GF style: Top to Bottom
    else {
      return bodySectionRect.posY + relativePosY;
    }
  }

  private canvasWidthForFrames(numOfFrames: number): number {
    return numOfFrames * (this.BODY_FRAME_WIDTH + this.BODY_FRAME_MARGINS.left + this.BODY_FRAME_MARGINS.right);
  }

  private canvasHeightGivenBodySectionHeight(bodySectionHeight: number): number {
    return (
      bodySectionHeight +
      (this.HEADER_SECTION_HEIGHT +
        this.SECTION_SPLIT_MARGIN +
        this.FOOTER_SECTION_HEIGHT +
        this.SECTION_SPLIT_MARGIN +
        this.BODY_FRAME_MARGINS.top +
        this.BODY_FRAME_MARGINS.bottom)
    );
  }

  private computeBarIndexToFrameSheetMapping(
    dtxJson: DTXJson,
    bodySectionHeight: number
  ): {
    barFrameSheetMapping: DTXInterimBarPosType[];
    numOfCanvas: number;
    bodySectionHeightPerCanvas: number[];
    widthPerCanvas: number[];
    partialFrameRect: DTXFrameRect[];
  } {
    let barIndexToFrameSheetMapping: DTXInterimBarPosType[] = [];
    let greatestFrameHeightPerCanvas: number[] = [];
    let returnedWidthPerCanvas: number[] = [];
    let returnedFrameRect: DTXFrameRect[] = [];
    let currFrameNum: number = 0;
    let currFramePosY: number = 0;
    let currGreatestFrameHeight: number = 0;
    let currCanvasSheetIndex: number = 0;
    for (let index = 0; index < dtxJson.bars.length; index++) {
      const barInfo: DTXBar = dtxJson.bars[index];
      const currBarHeightInPx: number = barInfo.duration * this.actualPixelsPerSecond;
      let incrementCanvasIndex = false;

      //Check if current bar can fit into current frame
      if (currFramePosY + currBarHeightInPx > bodySectionHeight) {
        //The case for current bar UNABLE to fit into current frame
        //Current Frame Pos Y before reset would be the Height for this frame
        //Position Y are set to 0 first because the final Body Section Height is not confirmed until end of this loop
        returnedFrameRect.push({
          rectPos:{
            posX: this.BODY_FRAME_MARGINS.left + this.DM_CHIP_POS_SIZE_INFO["Bar"].posX +
            currFrameNum *
              (this.BODY_FRAME_WIDTH + this.BODY_FRAME_MARGINS.left + this.BODY_FRAME_MARGINS.right),
            posY: 0,
            width: this.DM_CHIP_POS_SIZE_INFO["Bar"].width,
            height: currFramePosY
          },
          canvasSheetIndex: currCanvasSheetIndex
        });

        //Check For largest height value
        if (currFramePosY > currGreatestFrameHeight) {
          currGreatestFrameHeight = currFramePosY;
        }

        //Check if next frame can fit within current canvas sheet
        if (currFrameNum + 1 > this.MAX_PAGEPERCANVAS) {
          returnedWidthPerCanvas.push(this.canvasWidthForFrames(currFrameNum + 1));
          incrementCanvasIndex = true;
          currFrameNum = 0;
        } else {
          currFrameNum++;
        }

        //Reset Frame Height
        currFramePosY = 0;
      }

      //Store mapping info
      barIndexToFrameSheetMapping.push({
        absoluteTime: barInfo.startTimePos,
        relativePosY: currFramePosY,
        //posY: this.computeActualPixelPosY(currFramePosY, this.bodySectionRect, this.isDrawFromDownToUp),
        frameIndex: currFrameNum,
        canvasSheetIndex: currCanvasSheetIndex,
      });

      //Increment values for the next bar
      currFramePosY += currBarHeightInPx;
      //Increment canvas value only when canvas sheet hit size limit
      if (incrementCanvasIndex) {
        //Store currGreatestFrameHeight into array then reset to 0
        greatestFrameHeightPerCanvas.push(currGreatestFrameHeight);
        currGreatestFrameHeight = 0;
        currCanvasSheetIndex++;
      }
    }

    //Store the greatest frame height one last time if not present
    if (greatestFrameHeightPerCanvas.length !== currCanvasSheetIndex + 1) {
      greatestFrameHeightPerCanvas.push(currGreatestFrameHeight);
    }

    //Store the body section width of all frames one last time if not present
    if (returnedWidthPerCanvas.length !== currCanvasSheetIndex + 1) {
      returnedWidthPerCanvas.push(this.canvasWidthForFrames(currFrameNum + 1));
    }

    //Push the final frame rect after looping is done
    returnedFrameRect.push({
      rectPos:{
        posX: this.BODY_FRAME_MARGINS.left + this.DM_CHIP_POS_SIZE_INFO["Bar"].posX +
        currFrameNum *
          (this.BODY_FRAME_WIDTH + this.BODY_FRAME_MARGINS.left + this.BODY_FRAME_MARGINS.right),
        posY: 0,
        width: this.DM_CHIP_POS_SIZE_INFO["Bar"].width,
        height: currFramePosY
      },
      canvasSheetIndex: currCanvasSheetIndex
    });

    return {
      barFrameSheetMapping: barIndexToFrameSheetMapping,
      numOfCanvas: currCanvasSheetIndex + 1,
      bodySectionHeightPerCanvas: greatestFrameHeightPerCanvas,
      widthPerCanvas: returnedWidthPerCanvas,
      partialFrameRect: returnedFrameRect
    };
  }

  /*
  Calculate max possible Body Section Rect per Frame
  */
  private availableBodySectionRect(maxHeight: number): DTXRect {
    return {
      posX: this.BODY_FRAME_MARGINS.left,
      posY: this.HEADER_SECTION_HEIGHT + this.SECTION_SPLIT_MARGIN + this.BODY_FRAME_MARGINS.top,
      width: this.BODY_FRAME_WIDTH,
      height:
        maxHeight -
        (this.HEADER_SECTION_HEIGHT +
          this.SECTION_SPLIT_MARGIN +
          this.FOOTER_SECTION_HEIGHT +
          this.SECTION_SPLIT_MARGIN +
          this.BODY_FRAME_MARGINS.top +
          this.BODY_FRAME_MARGINS.bottom),
    };
  }

  //Compute the Pixel Position of an absolute time, PosX here is left-margin relative to its frame
  private computePixelPosFromAbsoluteTime(
    barNum: number,
    absTime: number
  ): { posX: number; posY: number; canvasSheetIndex: number } {
    //Compute PosX and CanvasSheet index
    const posX: number =
      this.BODY_FRAME_MARGINS.left +
      this.barIndexToFrameSheetMapping[barNum].frameIndex *
        (this.BODY_FRAME_WIDTH + this.BODY_FRAME_MARGINS.left + this.BODY_FRAME_MARGINS.right);
    const canvasSheetIndex = this.barIndexToFrameSheetMapping[barNum].canvasSheetIndex;

    //Retrieve the actual Body Section Height for current canvas
    const currCanvasBodySectionHeight = this.bodySectionHeightPerCanvas[canvasSheetIndex];
    const currCanvasBodySectionRect: DTXRect = {
      posX: this.BODY_FRAME_MARGINS.left,
      posY: this.HEADER_SECTION_HEIGHT + this.SECTION_SPLIT_MARGIN + this.BODY_FRAME_MARGINS.top,
      width: this.BODY_FRAME_WIDTH,
      height: currCanvasBodySectionHeight,
    };

    //Compute the posY in canvas for a given position in time and barIndex
    const timeDiff: number = absTime - this.barIndexToFrameSheetMapping[barNum].absoluteTime;
    const heightDelta: number = timeDiff * this.actualPixelsPerSecond;
    const relativePosY: number = this.barIndexToFrameSheetMapping[barNum].relativePosY + heightDelta;

    return {
      posX,
      posY: this.computeActualPixelPosY(relativePosY, currCanvasBodySectionRect, this.isDrawFromDownToUp),
      canvasSheetIndex,
    };
  }
}
