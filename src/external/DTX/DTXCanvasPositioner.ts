import DTXJson, { DTXBar, DTXBpmSegment, DTXChip } from "./DTXJsonTypes";
import { DTXRect, DTXChipPixelPos, DTXDrawingConfig, DTXChipPositionInCanvas } from "./DTXCanvasTypes";

interface DTXInterimBarPosType {
  absoluteTime: number;
  relativePosY: number;
  posY: number;
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
    Bar: { posX: 15, width: 300, height: 2 },
    BGM: { posX: 26, width: 289, height: 2 },
    LeftCrashCymbal: { posX: 26, width: this.DEFAULT_CHIP_WIDTH + 6, height: this.DEFAULT_CHIP_HEIGHT },
    "Hi-Hat": { posX: 50, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    LeftBassPedal: { posX: 68, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    Snare: { posX: 86, width: this.DEFAULT_CHIP_WIDTH + 3, height: this.DEFAULT_CHIP_HEIGHT },
    "Hi-Tom": { posX: 107, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    RightBassPedal: { posX: 125, width: this.DEFAULT_CHIP_WIDTH + 5, height: this.DEFAULT_CHIP_HEIGHT },
    "Low-Tom": { posX: 148, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    "Floor-Tom": { posX: 166, width: this.DEFAULT_CHIP_WIDTH, height: this.DEFAULT_CHIP_HEIGHT },
    RightCrashCymbal: { posX: 184, width: this.DEFAULT_CHIP_WIDTH + 6, height: this.DEFAULT_CHIP_HEIGHT },
    RideCymbal: { posX: 208, width: this.DEFAULT_CHIP_WIDTH + 1, height: this.DEFAULT_CHIP_HEIGHT },
    BPMMarker: {posX: 217, width: this.DEFAULT_CHIP_WIDTH + 1, height: 7}
  };

  private barIndexToFrameSheetMapping: DTXInterimBarPosType[];
  private actualPixelsPerSecond: number;
  private isDrawFromDownToUp: boolean;
  private bodySectionRect: DTXRect;

  private canvasChipPositions: DTXChipPositionInCanvas[] = [];

  /**
   * Constructor takes in DTXJson object and a Drawing configuration selected by UI
  */
  constructor(dtxJson: DTXJson, drawingOptions: DTXDrawingConfig) {
    this.bodySectionRect = this.availableBodySectionRect(drawingOptions.maxHeight);

    this.actualPixelsPerSecond = drawingOptions.scale * this.BASE_PIXELS_PER_SECOND;
    this.isDrawFromDownToUp = this.DEFAULT_DRAW_DIRECTION_DOWN_TO_UP;

    //Compute the interim mapping of Bar to Frame/Sheet index
    //Ensure entire bars would be drawn within the same frame
    const {barFrameSheetMapping, numOfCanvas} =  this.computeBarIndexToFrameSheetMapping(dtxJson, this.bodySectionRect.height);
    this.barIndexToFrameSheetMapping = barFrameSheetMapping;

    //Initialize the canvasChipPositions given the number of canvas computed. This should be 1 for most charts
    for (let index = 0; index < numOfCanvas; index++) {
      this.canvasChipPositions.push({chipPositions: []});
    }

    this.computeChipPositionInCanvas(dtxJson);
  }

  public getCanvasChipPositionsForDrawing(): DTXChipPositionInCanvas[] {
    return this.canvasChipPositions;
  }

  private computeChipPositionInCanvas(dtxJson: DTXJson): void {
    //let retResult: DTXChipPixelPos[] = [];

    //Compute for bar lines
    for (let index = 0; index < dtxJson.bars.length; index++) {
      const barInfo: DTXBar = dtxJson.bars[index];
      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(index, barInfo.startTimePos);

      const chipPixelPos: DTXChipPixelPos = {
        laneType: "Bar",
        posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO["Bar"].posX,
        posY: chipLinePosInCanvas.posY
      };

      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
    }

    //Compute for BPM change marker
    for (let index = 0; index < dtxJson.bpmSegments.length; index++) {
      const bpmSegment : DTXBpmSegment = dtxJson.bpmSegments[index];

      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(index, bpmSegment.startTimePos);

      const chipPixelPos: DTXChipPixelPos = {
        laneType: "BPMMarker",
        posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO["BPMMarker"].posX,
        posY: chipLinePosInCanvas.posY
      };

      this.canvasChipPositions[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
      
    }

    //Compute for chips
    for (let index = 0; index < dtxJson.chips.length; index++) {
      const chip: DTXChip = dtxJson.chips[index];
      const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(chip.barNumber, chip.timePosition);

      //
      const chipPixelPos: DTXChipPixelPos = {
        laneType: chip.laneType,
        posX: chipLinePosInCanvas.posX + this.DM_CHIP_POS_SIZE_INFO[chip.laneType].posX,
        posY: chipLinePosInCanvas.posY
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

  private computeBarIndexToFrameSheetMapping(dtxJson: DTXJson, bodySectionHeight: number): { barFrameSheetMapping: DTXInterimBarPosType[], numOfCanvas: number} {
    let barIndexToFrameSheetMapping: DTXInterimBarPosType[] = [];
    let currFrameNum: number = 0;
    let currFramePosY: number = 0;
    let currCanvasSheetIndex: number = 0;
    for (let index = 0; index < dtxJson.bars.length; index++) {
      const barInfo: DTXBar = dtxJson.bars[index];
      const currBarHeightInPx: number = barInfo.duration * this.actualPixelsPerSecond;
      let incrementCanvasIndex = false;
      let incrementFrameNum = false;

      //Check if current bar can fit into current frame
      if (currFramePosY + currBarHeightInPx > bodySectionHeight) {
        //Check if next frame can fit within current canvas sheet
        if (currFrameNum + 1 > this.MAX_PAGEPERCANVAS) {
          incrementCanvasIndex = true;
          currFrameNum = 0;
        }
        else{
          currFrameNum++;
        } 
        //Reset Frame Height
        currFramePosY = 0;
      } 

      //Store mapping info
      barIndexToFrameSheetMapping.push({
        absoluteTime: barInfo.startTimePos,
        relativePosY: currFramePosY,
        posY: this.computeActualPixelPosY(currFramePosY, this.bodySectionRect, this.isDrawFromDownToUp),
        frameIndex: currFrameNum,
        canvasSheetIndex: currCanvasSheetIndex,
      });

      //Increment values for the next bar      
      currFramePosY += currBarHeightInPx;
      //Increment canvas value only when canvas sheet hit size limit
      if(incrementCanvasIndex){
        currCanvasSheetIndex++;
      }
    }

    return {barFrameSheetMapping: barIndexToFrameSheetMapping, numOfCanvas: currCanvasSheetIndex + 1};
  }

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

    //Compute the posY in canvas for a given position in time and barIndex
    const timeDiff: number = absTime - this.barIndexToFrameSheetMapping[barNum].absoluteTime;
    const heightDelta: number = timeDiff * this.actualPixelsPerSecond;
    const relativePosY: number = this.barIndexToFrameSheetMapping[barNum].relativePosY + heightDelta;

    return {
      posX,
      posY: this.computeActualPixelPosY(relativePosY, this.bodySectionRect, this.isDrawFromDownToUp),
      canvasSheetIndex,
    };
  }
}
