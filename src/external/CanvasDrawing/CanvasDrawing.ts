import { fabric } from "fabric";
import { DTXChipPixelRectPos, DTXCanvasDataType, DTXRect, DTXTextRectPos } from "../DTX/DTXCanvasTypes";

type CanvasDrawOptions = {
    fill?: string | fabric.Pattern | fabric.Gradient | undefined;
    stroke?: string | undefined;
    strokeWidth?: number | undefined;
};

type CanvasTextOptions = {
    fill?: string | fabric.Pattern | fabric.Gradient | undefined;
    fontFamily?: string | undefined;
    fontWeight?: number | undefined;
    fontSize?: number | undefined;
    originY?: string | undefined;
    originX?: string | undefined;
};

export default class CanvasDrawing {
    static DEFAULT_BACKGROUND_COLOR = "#1f1f1f";

    static DM_CHIP_COLOR_INFO: { [key: string]: { color: string } } = {
        "Bar": { color: "#b1b1b1" },
        "QuarterBar": { color: "#535353" },
        "BGM": { color: "green" },
        "LeftCrashCymbal": { color: "#ff4ca1" },
        "Hi-Hat": { color: "#579ead" },
        "LeftBassPedal": { color: "#e7baff" },
        "Snare": { color: "#fff040" },
        "Hi-Tom": { color: "#00ff00" },
        "RightBassPedal": { color: "#e7baff" },
        "Low-Tom": { color: "#ff0000" },
        "Floor-Tom": { color: "#fea101" },
        "RightCrashCymbal": { color: "#00ccff" },
        "RideCymbal": { color: "#5a9cf9" },
        "BPMMarker": { color: "#7f7f7f" }
    };

    public static drawAllChipsOntoCanvas(canvasObject: fabric.StaticCanvas, canvasData: DTXCanvasDataType) {
        //Draw all panels first
        for (let index = 0; index < canvasData.frameRect.length; index++) {
            const currFrameRect: DTXRect = canvasData.frameRect[index];

            this.addRectangle(canvasObject, { ...currFrameRect }, { fill: this.DEFAULT_BACKGROUND_COLOR });
        }

        //Draw all lines and chips
        for (let index = 0; index < canvasData.chipPositions.length; index++) {
            const element: DTXChipPixelRectPos = canvasData.chipPositions[index];

            this.addChip(
                canvasObject,
                {
                    posX: element.rectPos.posX,
                    posY: element.rectPos.posY,
                    width: element.rectPos.width,
                    height: element.rectPos.height
                },
                { fill: CanvasDrawing.DM_CHIP_COLOR_INFO[element.laneType].color }
            );
        }

        //Finally draw all text objects
        for (let index = 0; index < canvasData.textPositions.length; index++) {
            const element: DTXTextRectPos = canvasData.textPositions[index];

            this.addText(
                canvasObject,
                {
                    posX: element.rectPos.posX,
                    posY: element.rectPos.posY,
                    width: element.rectPos.width,
                    height: element.rectPos.height
                },
                element.text,
                {
                    fill: element.color,
                    fontFamily: element.fontFamily,
                    fontSize: element.fontSize,
                    fontWeight: element.fontWeight
                }
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
            originY: "center"
        });
        canvasObject.add(rect);
    }

    private static addRectangle(
        canvasObject: fabric.StaticCanvas,
        positionSize: DTXRect,
        drawOptions: CanvasDrawOptions
    ) {
        const rect = new fabric.Rect({
            fill: drawOptions.fill,
            width: positionSize.width,
            height: positionSize.height,
            left: positionSize.posX,
            top: positionSize.posY
        });

        canvasObject.add(rect);
    }

    private static addLine(canvasObject: fabric.StaticCanvas, positionSize: DTXRect, drawOptions: CanvasDrawOptions) {
        const line = new fabric.Line(
            [
                positionSize.posX,
                positionSize.posY,
                positionSize.posX + positionSize.width,
                positionSize.posY + positionSize.height
            ],
            {
                stroke: drawOptions.stroke,
                strokeWidth: drawOptions.strokeWidth
            }
        );

        canvasObject.add(line);
    }

    private static addText(
        canvasObject: fabric.StaticCanvas,
        positionSize: DTXRect,
        text: string,
        textOptions: CanvasTextOptions
    ) {
        /**
     * "BARNUM":new fabric.Text('000',{
    // backgroundColor: 'black',
    fill: '#ffffff',
    fontSize: 16,
    originY: 'center'
     */

        const textObject = new fabric.Text(text, {
            left: positionSize.posX,
            top: positionSize.posY,
            fill: textOptions.fill ? textOptions.fill : "#ffffff",
            fontSize: textOptions.fontSize ? textOptions.fontSize : 20,
            fontWeight: textOptions.fontWeight ? textOptions.fontWeight : "",
            fontFamily: textOptions.fontFamily ? textOptions.fontFamily : "Times New Roman",
            originY: textOptions.originY ? textOptions.originY : "center",
            originX: textOptions.originX ? textOptions.originX : "left"
        });

        const currTextWidth: number | undefined = textObject.width;
        if (positionSize.width && currTextWidth && currTextWidth > positionSize.width) {
            textObject.scaleToWidth(positionSize.width); //positionSize.width/currTextWidth required for laptop browser but why? Scale becomes relative??? Behaviour different from jsfiddle...
        }

        canvasObject.add(textObject);
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
