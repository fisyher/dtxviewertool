import DTXJson, { DTXBar, DTXBpmSegment, DTXChip } from "./DTXJsonTypes";
import { DTXRect, DTXChipPixelRectPos, DTXDrawingConfig, DTXCanvasDataType, DTXTextRectPos } from "./DTXCanvasTypes";
import { convertNumberToFormattedText } from "../utility/basicStringFormatter";

interface DTXInterimBarPosType {
  absoluteTime: number;
  relativePosY: number;
  //posY: number;
  frameIndex: number;
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
  readonly BODY_FRAME_WIDTH = 320;

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
    Bar: { posX: 70, width: 220, height: 2 },
    BGM: { posX: 70, width: 220, height: 2 },
    LeftCrashCymbal: { posX: 70, width: this.DEFAULT_CHIP_WIDTH + 6, height: this.DEFAULT_CHIP_HEIGHT },
    "Hi-Hat": { posX: 94, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    LeftBassPedal: { posX: 112, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    Snare: { posX: 130, width: this.DEFAULT_CHIP_WIDTH + 3, height: this.DEFAULT_CHIP_HEIGHT },
    "Hi-Tom": { posX: 151, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    RightBassPedal: { posX: 169, width: this.DEFAULT_CHIP_WIDTH + 5, height: this.DEFAULT_CHIP_HEIGHT },
    "Low-Tom": { posX: 192, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    "Floor-Tom": { posX: 210, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    RightCrashCymbal: { posX: 228, width: this.DEFAULT_CHIP_WIDTH + 6, height: this.DEFAULT_CHIP_HEIGHT },
    RideCymbal: { posX: 252, width: this.DEFAULT_CHIP_WIDTH + 1, height: this.DEFAULT_CHIP_HEIGHT },
    BPMMarker: { posX: 52, width: this.DEFAULT_CHIP_WIDTH, height: 2 },
  };

  private barIndexToFrameSheetMapping: DTXInterimBarPosType[];
  private actualPixelsPerSecond: number;
  private isDrawFromDownToUp: boolean;
  private bodySectionHeightPerCanvas: number[] = [];

  private canvasChipPositions: DTXCanvasDataType[] = [];

  /**
   * Constructor takes in DTXJson object and a Drawing configuration selected by UI
   */
  constructor(dtxJson: DTXJson, drawingOptions: DTXDrawingConfig) {
    const maxBodySectionRect = this.availableBodySectionRect(drawingOptions.maxHeight);

    this.actualPixelsPerSecond = drawingOptions.scale * this.BASE_PIXELS_PER_SECOND;
    this.isDrawFromDownToUp = this.DEFAULT_DRAW_DIRECTION_DOWN_TO_UP;

    //Compute the interim mapping of Bar to Frame/Sheet index, number of canvas, body section height and canvas-width
    //Ensure entire bars would be drawn within the same frame
    const { barFrameSheetMapping, numOfCanvas, bodySectionHeightPerCanvas, widthPerCanvas } =
      this.computeBarIndexToFrameSheetMapping(dtxJson, maxBodySectionRect.height);
    this.barIndexToFrameSheetMapping = barFrameSheetMapping;
    this.bodySectionHeightPerCanvas = bodySectionHeightPerCanvas;

    //Initialize the canvasChipPositions given the number of canvas computed. This should be 1 for most charts
    for (let index = 0; index < numOfCanvas; index++) {
      this.canvasChipPositions.push({
        chipPositions: [],
        textPositions: [],
        canvasSize: { width: widthPerCanvas[index], height: this.canvasHeightGivenBodySectionHeight(bodySectionHeightPerCanvas[index]) },
      });
    }

    //Compute pixel positions for chips to be drawn
    this.computeChipPositionInCanvas(dtxJson);
  }

  public getCanvasChipPositionsForDrawing(): DTXCanvasDataType[] {
    return this.canvasChipPositions;
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
        rectPos:{
          posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO["Bar"].posX + this.DM_CHIP_POS_SIZE_INFO["Bar"].width + 2,
          posY: chipLinePosInCanvas.posY,
          width: 50,
          height: 21
        },
        fontFamily: "Arial",
        fontWeight: 200,
        fontSize: 18,
        color: "#ffffff",
        text: convertNumberToFormattedText(index, 3)        
      };

      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].textPositions.push(textPos);
    }

    //Compute for BPM change marker
    for (let index = 0; index < dtxJson.bpmSegments.length; index++) {
      const bpmSegment: DTXBpmSegment = dtxJson.bpmSegments[index];

      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(index, bpmSegment.startTimePos);

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
        rectPos:{
          posX: chipLinePosInCanvas.posX + 15,
          posY: chipLinePosInCanvas.posY,
          width: 50,
          height: 15
        },
        fontFamily: "Arial",
        fontWeight: 100,
        fontSize: 12,
        color: "#ffffff",
        text: bpmSegment.bpm.toFixed(2)        
      };

      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].textPositions.push(textPos);
    }

    //Compute for chips
    for (let index = 0; index < dtxJson.chips.length; index++) {
      const chip: DTXChip = dtxJson.chips[index];
      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(chip.barNumber, chip.timePosition);

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

      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
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
  } {
    let barIndexToFrameSheetMapping: DTXInterimBarPosType[] = [];
    let greatestFrameHeightPerCanvas: number[] = [];
    let returnedWidthPerCanvas: number[] = [];
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
        //Check if next frame can fit within current canvas sheet
        if (currFrameNum + 1 > this.MAX_PAGEPERCANVAS) {
          returnedWidthPerCanvas.push(this.canvasWidthForFrames(currFrameNum + 1));
          incrementCanvasIndex = true;
          currFrameNum = 0;
        } else {
          currFrameNum++;
        }

        //Current Frame Pos Y before reset would be the highest Bar for this frame
        if (currFramePosY > currGreatestFrameHeight) {
          currGreatestFrameHeight = currFramePosY;
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

    return {
      barFrameSheetMapping: barIndexToFrameSheetMapping,
      numOfCanvas: currCanvasSheetIndex + 1,
      bodySectionHeightPerCanvas: greatestFrameHeightPerCanvas,
      widthPerCanvas: returnedWidthPerCanvas,
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
