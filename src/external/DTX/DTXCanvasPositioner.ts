import DTXJson, { DTXBar, DTXBpmSegment, DTXChip, DTXLine } from "./DTXJsonTypes";
import {
    DTXRect,
    DTXChipPixelRectPos,
    DTXDrawingConfig,
    DTXCanvasDataType,
    DTXTextRectPos,
    GameModeType,
    ChartModeType,
    DifficultyLabelType,
    DTXImageRectPos
} from "./DTXCanvasTypes";
import { convertNumberToFormattedText, convertSecondsToMMssFormat } from "../utility/basicStringFormatter";
import DTXCanvasDrawConfigHelper, { DTXChipDrawingLane } from "./DTXCanvasDrawConfigHelper";

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

    readonly DEFAULT_PAGEPERCANVAS = 20;
    readonly MIN_PAGEPERCANVAS = 6;
    readonly MAX_PAGEPERCANVAS = 50;

    readonly HEADER_SECTION_HEIGHT = 65;
    readonly SECTION_SPLIT_MARGIN = 2;
    readonly FOOTER_SECTION_HEIGHT = 25;
    readonly BODY_FRAME_MARGINS = {
        top: 25,
        bottom: 25,
        left: 0,
        right: 0
    };
    //Does not include left+right margins
    readonly SONG_INFO_TITLE_WIDTH = 750;
    readonly SONG_INFO_DIFFICULTY_IMAGE_WIDTH = 140;

    //Base PIXELS_PER_SECOND is 192 px at scale 1.0
    //This is equivalent of drawing a full 4/4 bar at 240 BPM with height of 192 pixels
    readonly BASE_BPM = 240;
    readonly BASE_PIXELS_PER_SECOND = 192 * (this.BASE_BPM / 240);

    //
    readonly DEFAULT_DRAW_DIRECTION_DOWN_TO_UP: boolean = true;

    private barIndexToFrameSheetMapping: DTXInterimBarPosType[];
    private actualPixelsPerSecond: number;
    private isDrawFromDownToUp: boolean;
    private bodySectionHeightPerCanvas: number[] = [];

    private canvasDTXObjects: DTXCanvasDataType[] = [];

    /**
     * Constructor takes in DTXJson object and a Drawing configuration selected by UI
     */
    constructor(dtxJson: DTXJson, drawingOptions: DTXDrawingConfig) {
        const maxBodySectionRect = this.availableBodySectionRect(
            drawingOptions.maxHeight,
            drawingOptions.gameMode,
            drawingOptions.chartMode
        );

        this.actualPixelsPerSecond = drawingOptions.scale * this.BASE_PIXELS_PER_SECOND;

        //Decide draw direction based on game mode
        if (drawingOptions.gameMode === "Drum") {
            this.isDrawFromDownToUp = true;
        } else {
            this.isDrawFromDownToUp = false;
        }

        //Compute the interim mapping of Bar to Frame/Sheet index, number of canvas, body section height and canvas-width
        //Ensure entire bars would be drawn within the same frame
        const { barFrameSheetMapping, numOfCanvas, bodySectionHeightPerCanvas, widthPerCanvas, partialFrameRect } =
            this.computeBarIndexToFrameSheetMapping(
                dtxJson,
                maxBodySectionRect.height,
                drawingOptions.gameMode,
                drawingOptions.chartMode
            );
        this.barIndexToFrameSheetMapping = barFrameSheetMapping;
        this.bodySectionHeightPerCanvas = bodySectionHeightPerCanvas;

        //Initialize the canvasChipPositions given the number of canvas computed. This should be 1 for most charts
        for (let index = 0; index < numOfCanvas; index++) {
            this.canvasDTXObjects.push({
                chipPositions: [],
                textPositions: [],
                frameRect: [],
                images: [],
                canvasSize: {
                    width: widthPerCanvas[index],
                    height: this.canvasHeightGivenBodySectionHeight(bodySectionHeightPerCanvas[index])
                }
            });
        }

        //
        //Update posY for all frames, now that we have the actual body section height
        for (let index = 0; index < partialFrameRect.length; index++) {
            const frameRect: DTXFrameRect = partialFrameRect[index];
            const currCanvasHeight: number = this.canvasHeightGivenBodySectionHeight(
                bodySectionHeightPerCanvas[frameRect.canvasSheetIndex]
            );

            if (this.isDrawFromDownToUp) {
                frameRect.rectPos.posY =
                    currCanvasHeight -
                    (this.FOOTER_SECTION_HEIGHT +
                        this.SECTION_SPLIT_MARGIN +
                        this.BODY_FRAME_MARGINS.bottom +
                        frameRect.rectPos.height);
            } else {
                frameRect.rectPos.posY =
                    this.HEADER_SECTION_HEIGHT + this.SECTION_SPLIT_MARGIN + this.BODY_FRAME_MARGINS.top;
            }

            //Also push the frameRect info into canvasDTXObjects
            this.canvasDTXObjects[frameRect.canvasSheetIndex].frameRect.push({ ...frameRect.rectPos });
        }

        //Compute pixel positions for chips to be drawn and store into canvasDTXObjects
        this.computeChipPositionInCanvas(dtxJson, drawingOptions.gameMode, drawingOptions.chartMode);

        //
        this.createTextInfoForDrawing(
            dtxJson,
            drawingOptions.gameMode,
            drawingOptions.chartMode,
            drawingOptions.difficultyLabel
        );
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

    private createTextInfoForDrawing(
        dtxJson: DTXJson,
        gameMode: GameModeType,
        chartMode: ChartModeType,
        difficultyLabel: DifficultyLabelType
    ): void {
        let localTextPostArray: DTXTextRectPos[] = [];

        //Title
        const titlePos: DTXTextRectPos = {
            rectPos: {
                posX: DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode),
                posY: 20,
                width: this.SONG_INFO_TITLE_WIDTH,
                height: 30
            },
            fontFamily: "Arial",
            fontWeight: 200,
            fontSize: 28,
            color: "#ffffff",
            text: dtxJson.songInfo.title
        };

        //Artist
        const artistPos: DTXTextRectPos = {
            rectPos: {
                posX: DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode),
                posY: 50,
                width: this.SONG_INFO_TITLE_WIDTH,
                height: 20
            },
            fontFamily: "Arial",
            fontWeight: 200,
            fontSize: 16,
            color: "#ffffff",
            text: dtxJson.songInfo.artist
        };

        //Difficulty Type Image Label
        const diffTypeImage: DTXImageRectPos = {
            rectPos: {
                posX:
                    DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode) +
                    this.SONG_INFO_TITLE_WIDTH,
                posY: 5,
                width: this.SONG_INFO_DIFFICULTY_IMAGE_WIDTH,
                height: 50
            },
            name: `${gameMode}${difficultyLabel}BannerSmall`
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
                posX:
                    DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode) +
                    this.SONG_INFO_TITLE_WIDTH +
                    this.SONG_INFO_DIFFICULTY_IMAGE_WIDTH,
                posY: 20,
                width: 400,
                height: 30
            },
            fontFamily: "Arial",
            fontWeight: 200,
            fontSize: 28,
            color: "#ffffff",
            text: `Level ${diffLevelText}`
        };

        const otherSongInfoPos: DTXTextRectPos = {
            rectPos: {
                posX:
                    DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode) +
                    this.SONG_INFO_TITLE_WIDTH +
                    this.SONG_INFO_DIFFICULTY_IMAGE_WIDTH,
                posY: 50,
                width: 400,
                height: 25
            },
            fontFamily: "Arial",
            fontWeight: 200,
            fontSize: 16,
            color: "#ffffff",
            text: `BPM ${BPMText} Length ${durationText} Notes ${noteCount}`
        };

        //
        localTextPostArray.push(titlePos);
        localTextPostArray.push(artistPos);
        localTextPostArray.push(difficultyLevelPos);
        localTextPostArray.push(otherSongInfoPos);

        this.canvasDTXObjects.forEach((canvasData) => {
            canvasData.textPositions = canvasData.textPositions.concat(localTextPostArray);
            //Add the Background Rect for the Header Section
            const backgroundRect: DTXRect = {
                posX: 0,
                posY: 0,
                width: canvasData.canvasSize.width,
                height: this.HEADER_SECTION_HEIGHT
            };
            canvasData.frameRect.push(backgroundRect);
            canvasData.images.push(diffTypeImage);
        });
    }

    private computeChipPositionInCanvas(dtxJson: DTXJson, gameMode: GameModeType, chartMode: ChartModeType): void {
        //let retResult: DTXChipPixelPos[] = [];

        //Compute for bar lines
        for (let index = 0; index < dtxJson.bars.length; index++) {
            const barInfo: DTXBar = dtxJson.bars[index];
            const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
                index,
                barInfo.startTimePos,
                gameMode,
                chartMode
            );

            //Bar Line
            const chipPixelPos: DTXChipPixelRectPos = {
                laneType: "Bar",
                rectPos: {
                    posX:
                        chipLinePosInCanvas.posX +
                        DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode),
                    posY: chipLinePosInCanvas.posY,
                    width: DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode),
                    height: DTXCanvasDrawConfigHelper.getCommonChipRelativePosSize("Bar")?.height as number
                }
            };

            //Bar Number
            const textPos: DTXTextRectPos = {
                rectPos: {
                    posX:
                        chipLinePosInCanvas.posX +
                        DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode) +
                        DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode) +
                        5,
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

            this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
            this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].textPositions.push(textPos);
        }

        //Compute for Quarter bars
        for (let index = 0; index < dtxJson.quarterBarLines.length; index++) {
            const quarterBarLine: DTXLine = dtxJson.quarterBarLines[index];
            const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
                quarterBarLine.barNumber,
                quarterBarLine.timePosition,
                gameMode,
                chartMode
            );

            //Bar Line
            const chipPixelPos: DTXChipPixelRectPos = {
                laneType: "QuarterBar",
                rectPos: {
                    posX:
                        chipLinePosInCanvas.posX +
                        DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode),
                    posY: chipLinePosInCanvas.posY,
                    width: DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode),
                    height: DTXCanvasDrawConfigHelper.getCommonChipRelativePosSize("QuarterBar")?.height as number
                }
            };

            this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
        }

        //Compute for BPM change marker
        const bpmMarkerRelativeRectPos = DTXCanvasDrawConfigHelper.getCommonChipRelativePosSize("BPMMarker");
        for (let index = 0; index < dtxJson.bpmSegments.length; index++) {
            const bpmSegment: DTXBpmSegment = dtxJson.bpmSegments[index];

            const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
                bpmSegment.startBarNum,
                bpmSegment.startTimePos,
                gameMode,
                chartMode
            );

            //BPM Line
            const chipPixelPos: DTXChipPixelRectPos = {
                laneType: "BPMMarker",
                rectPos: {
                    posX: chipLinePosInCanvas.posX + (bpmMarkerRelativeRectPos ? bpmMarkerRelativeRectPos.posX : 0),
                    posY: chipLinePosInCanvas.posY,
                    width: bpmMarkerRelativeRectPos ? bpmMarkerRelativeRectPos.width : 0,
                    height: bpmMarkerRelativeRectPos ? bpmMarkerRelativeRectPos.height : 0
                }
            };

            //BPM Value as text
            const textPos: DTXTextRectPos = {
                rectPos: {
                    posX: chipLinePosInCanvas.posX + 10,
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

            this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
            this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].textPositions.push(textPos);
        }

        //Compute for chips
        for (let index = 0; index < dtxJson.chips.length; index++) {
            const chip: DTXChip = dtxJson.chips[index];
            const chipLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
                chip.lineTimePosition.barNumber,
                chip.lineTimePosition.timePosition,
                gameMode,
                chartMode
            );

            //Iterate through the return array of chipPosSize to add multiple drawing chips
            const chipPosSizeArray: DTXChipDrawingLane[] =
                DTXCanvasDrawConfigHelper.getRelativeSizePosOfChipsForLaneCode(chip.laneType, gameMode, chartMode);
            for (let j = 0; j < chipPosSizeArray.length; j++) {
                const chipPosSizeInfo: DTXChipDrawingLane = chipPosSizeArray[j];

                if (chipPosSizeInfo.chipRelativePosSize) {
                    const chipPixelPos: DTXChipPixelRectPos = {
                        laneType: chipPosSizeInfo.drawingLane,
                        rectPos: {
                            posX: chipLinePosInCanvas.posX + chipPosSizeInfo.chipRelativePosSize.posX,
                            posY: chipLinePosInCanvas.posY,
                            width: chipPosSizeInfo.chipRelativePosSize.width,
                            height: chipPosSizeInfo.chipRelativePosSize.height
                        }
                    };

                    this.canvasDTXObjects[chipLinePosInCanvas.canvasSheetIndex].chipPositions.push(chipPixelPos);
                } else {
                    console.log("Lane " + chip.laneType + " has no chipRelativePosSize info!!");
                }
            }
        }

        //EndLine
        const endLineRelativeRectPos = DTXCanvasDrawConfigHelper.getCommonChipRelativePosSize("EndLine");
        const endLinePosInCanvas = this.computePixelPosFromAbsoluteTime(
            dtxJson.bars.length - 1,
            dtxJson.songInfo.songDuration,
            gameMode,
            chartMode
        );
        const endLinePixelPos: DTXChipPixelRectPos = {
            laneType: "EndLine",
            rectPos: {
                posX: endLinePosInCanvas.posX + (endLineRelativeRectPos ? endLineRelativeRectPos.posX : 0),
                posY: endLinePosInCanvas.posY,
                width: DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode),
                height: endLineRelativeRectPos ? endLineRelativeRectPos.height : 0
            }
        };

        this.canvasDTXObjects[endLinePosInCanvas.canvasSheetIndex].chipPositions.push(endLinePixelPos);
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

    private canvasWidthForFrames(numOfFrames: number, gameMode: GameModeType, chartMode: ChartModeType): number {
        return (
            numOfFrames *
            (DTXCanvasDrawConfigHelper.getFullBodyFrameWidth(gameMode, chartMode) +
                this.BODY_FRAME_MARGINS.left +
                this.BODY_FRAME_MARGINS.right)
        );
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
        bodySectionHeight: number,
        gameMode: GameModeType,
        chartMode: ChartModeType
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
                    rectPos: {
                        posX:
                            this.BODY_FRAME_MARGINS.left +
                            DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode) +
                            currFrameNum *
                                (DTXCanvasDrawConfigHelper.getFullBodyFrameWidth(gameMode, chartMode) +
                                    this.BODY_FRAME_MARGINS.left +
                                    this.BODY_FRAME_MARGINS.right),
                        posY: 0,
                        width: DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode),
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
                    returnedWidthPerCanvas.push(this.canvasWidthForFrames(currFrameNum + 1, gameMode, chartMode));
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
                canvasSheetIndex: currCanvasSheetIndex
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
            returnedWidthPerCanvas.push(this.canvasWidthForFrames(currFrameNum + 1, gameMode, chartMode));
        }

        //Push the final frame rect after looping is done
        //Change rectPos.height to currFramePosY for actual current frame height
        returnedFrameRect.push({
            rectPos: {
                posX:
                    this.BODY_FRAME_MARGINS.left +
                    DTXCanvasDrawConfigHelper.getFrameRectRelativePosX(gameMode, chartMode) +
                    currFrameNum *
                        (DTXCanvasDrawConfigHelper.getFullBodyFrameWidth(gameMode, chartMode) +
                            this.BODY_FRAME_MARGINS.left +
                            this.BODY_FRAME_MARGINS.right),
                posY: 0,
                width: DTXCanvasDrawConfigHelper.getFrameRectWidth(gameMode, chartMode),
                height: greatestFrameHeightPerCanvas[currCanvasSheetIndex]
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
    private availableBodySectionRect(maxHeight: number, gameMode: GameModeType, chartMode: ChartModeType): DTXRect {
        return {
            posX: this.BODY_FRAME_MARGINS.left,
            posY: this.HEADER_SECTION_HEIGHT + this.SECTION_SPLIT_MARGIN + this.BODY_FRAME_MARGINS.top,
            width: DTXCanvasDrawConfigHelper.getFullBodyFrameWidth(gameMode, chartMode),
            height:
                maxHeight -
                (this.HEADER_SECTION_HEIGHT +
                    this.SECTION_SPLIT_MARGIN +
                    this.FOOTER_SECTION_HEIGHT +
                    this.SECTION_SPLIT_MARGIN +
                    this.BODY_FRAME_MARGINS.top +
                    this.BODY_FRAME_MARGINS.bottom)
        };
    }

    /**
     *
     * @param barNum - BarNum index of the nearest bar within the same frame for this time position. This is usually the bar which the chip is associated with
     * @param absTime - The absolute Time position in seconds
     * @returns Returns the actual posX, posY and canvasSheetIndex for this time
     */
    private computePixelPosFromAbsoluteTime(
        barNum: number,
        absTime: number,
        gameMode: GameModeType,
        chartMode: ChartModeType
    ): { posX: number; posY: number; canvasSheetIndex: number } {
        //Compute PosX and CanvasSheet index
        const posX: number =
            this.BODY_FRAME_MARGINS.left +
            this.barIndexToFrameSheetMapping[barNum].frameIndex *
                (DTXCanvasDrawConfigHelper.getFullBodyFrameWidth(gameMode, chartMode) +
                    this.BODY_FRAME_MARGINS.left +
                    this.BODY_FRAME_MARGINS.right);
        const canvasSheetIndex = this.barIndexToFrameSheetMapping[barNum].canvasSheetIndex;

        //Retrieve the actual Body Section Height for current canvas
        const currCanvasBodySectionHeight = this.bodySectionHeightPerCanvas[canvasSheetIndex];
        const currCanvasBodySectionRect: DTXRect = {
            posX: this.BODY_FRAME_MARGINS.left,
            posY: this.HEADER_SECTION_HEIGHT + this.SECTION_SPLIT_MARGIN + this.BODY_FRAME_MARGINS.top,
            width: DTXCanvasDrawConfigHelper.getFullBodyFrameWidth(gameMode, chartMode),
            height: currCanvasBodySectionHeight
        };

        //Compute the posY in canvas for a given position in time and barIndex
        const timeDiff: number = absTime - this.barIndexToFrameSheetMapping[barNum].absoluteTime;
        const heightDelta: number = timeDiff * this.actualPixelsPerSecond;
        const relativePosY: number = this.barIndexToFrameSheetMapping[barNum].relativePosY + heightDelta;

        return {
            posX,
            posY: this.computeActualPixelPosY(relativePosY, currCanvasBodySectionRect, this.isDrawFromDownToUp),
            canvasSheetIndex
        };
    }
}
