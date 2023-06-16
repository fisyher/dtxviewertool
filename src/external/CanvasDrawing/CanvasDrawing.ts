import { fabric } from "fabric";
import { DTXChipPixelRectPos, DTXChipPositionInCanvas, DTXRect } from "../DTX/DTXCanvasTypes";

type CanvasDrawOptions = {
  fill?: string | fabric.Pattern | fabric.Gradient | undefined;
  stroke?: string | undefined;
  strokeWidth?: number | undefined;
};

export default class CanvasDrawing {
  static DEFAULT_BACKGROUND_COLOR = "#121212";

  static DM_CHIP_COLOR_INFO: { [key: string]: { color: string } } = {
    Bar: { color: "#b1b1b1" },
    BGM: { color: "red" },
    LeftCrashCymbal: { color: "#ff4ca1" },
    "Hi-Hat": { color: "#579ead" },
    LeftBassPedal: { color: "#e7baff" },
    Snare: { color: "#fff040" },
    "Hi-Tom": { color: "#00ff00" },
    RightBassPedal: { color: "#e7baff" },
    "Low-Tom": { color: "#ff0000" },
    "Floor-Tom": { color: "#fea101" },
    RightCrashCymbal: { color: "#00ccff" },
    RideCymbal: { color: "#5a9cf9" },
    BPMMarker: { color: "#b1b1b1" },
  };

  public static drawAllChipsOntoCanvas(
    canvasObject: fabric.StaticCanvas,
    chipPositionsForCanvas: DTXChipPositionInCanvas
  ) {
    //
    for (let index = 0; index < chipPositionsForCanvas.chipPositions.length; index++) {
      const element: DTXChipPixelRectPos = chipPositionsForCanvas.chipPositions[index];

      this.addChip(
        canvasObject,
        { posX: element.posX, posY: element.posY, width: element.width, height: element.height },
        { fill: CanvasDrawing.DM_CHIP_COLOR_INFO[element.laneType].color }
      );
    }
  }

  /**
   * positionSize - An object defined as {x: <number>, y: <number>, width: <number>, height: <number>}
   * drawOptions - Drawing options consisting of following options:
   *      fill - Fill Color code in string
   *      stroke - Stroke Color, Default is black
   *      strokeWidth - The width of stroke in pixels. Default is 0
   * Remarks: Origin of rect is assumed to be top-left corner by default, unless otherwise
   */
  private static addChip(canvasObject: fabric.StaticCanvas, positionSize: DTXRect, drawOptions: CanvasDrawOptions) {
    let rect = null;
    rect = new fabric.Rect({
      fill: drawOptions.fill,
      width: positionSize.width,
      height: positionSize.height,
      left: positionSize.posX,
      top: positionSize.posY,
      originY: "center",
    });
    canvasObject.add(rect);
  }

  // function addLine(positionSize, drawOptions){

  //     const line = new fabric.Line([
  //         positionSize.x,
  //         positionSize.y,
  //         positionSize.x + positionSize.width,
  //         positionSize.y + positionSize.height
  //     ],{
  //         stroke: drawOptions.stroke,
  //         strokeWidth: drawOptions.strokeWidth
  //     });

  //     this._canvasObject.add(line);

  // }

  //Clears the canvas of all note chart information and resets the background color
  public static clear(canvasObject: fabric.StaticCanvas) {
    const bgColor = canvasObject.backgroundColor;
    canvasObject.clear();
    canvasObject.setBackgroundColor(bgColor as string, canvasObject.renderAll.bind(canvasObject));
    //TODO: May still need to call renderAll
  }

  // function update(){
  //     this._canvasObject.renderAll();
  // }

  // function setZoom(factor){
  //     this._canvasObject.setZoom(factor);
  // }
}
