import { fabric } from "fabric";
import {
    DTXChipPixelRectPos,
    DTXCanvasDataType,
    DTXRect,
    DTXTextRectPos,
    DTXImageRectPos
} from "../DTX/DTXCanvasTypes";

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
        "EndLine": { color: "red" },
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

    static CHART_IMAGE_ASSETS: Record<string, HTMLImageElement> = {};

    public static initLoadAllAssets(): void {
        const imageAssetPromises: Promise<Record<string, HTMLImageElement>>[] = [];
        //Drum assets
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("LeftCrashCymbal", require("../../assets/images/leftcymbal_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Hi-Hat", require("../../assets/images/hihat_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Snare", require("../../assets/images/snare_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("LeftBassPedal", require("../../assets/images/leftbass_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("LeftHiHatPedal", require("../../assets/images/lefthihatpedal_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Hi-Tom", require("../../assets/images/hitom_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("RightBassPedal", require("../../assets/images/rightbass_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Low-Tom", require("../../assets/images/lowtom_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Floor-Tom", require("../../assets/images/floortom_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("RightCrashCymbal", require("../../assets/images/rightcymbal_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("RideCymbal", require("../../assets/images/ridecymbal_chip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "DrumBasicBannerSmall",
                require("../../assets/images/DrumBasicBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "DrumAdvancedBannerSmall",
                require("../../assets/images/DrumAdvancedBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "DrumExtremeBannerSmall",
                require("../../assets/images/DrumExtremeBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "DrumMasterBannerSmall",
                require("../../assets/images/DrumMasterBannerSmall.png")
            )
        );

        //Guitar/Bass assets
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Red", require("../../assets/images/red_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Green", require("../../assets/images/green_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Blue", require("../../assets/images/blue_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Yellow", require("../../assets/images/yellow_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Pink", require("../../assets/images/mag_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Wail", require("../../assets/images/wail_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("Open", require("../../assets/images/open_gfchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject("OpenV", require("../../assets/images/open_gfvchip.png"))
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "GuitarBasicBannerSmall",
                require("../../assets/images/GuitarBasicBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "GuitarAdvancedBannerSmall",
                require("../../assets/images/GuitarAdvancedBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "GuitarExtremeBannerSmall",
                require("../../assets/images/GuitarExtremeBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "GuitarMasterBannerSmall",
                require("../../assets/images/GuitarMasterBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "BassBasicBannerSmall",
                require("../../assets/images/BassBasicBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "BassAdvancedBannerSmall",
                require("../../assets/images/BassAdvancedBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "BassExtremeBannerSmall",
                require("../../assets/images/BassExtremeBannerSmall.png")
            )
        );
        imageAssetPromises.push(
            CanvasDrawing.loadImageAsObject(
                "BassMasterBannerSmall",
                require("../../assets/images/BassMasterBannerSmall.png")
            )
        );

        Promise.all(imageAssetPromises)
            .then((array) => {
                array.forEach((item) => {
                    CanvasDrawing.CHART_IMAGE_ASSETS = { ...CanvasDrawing.CHART_IMAGE_ASSETS, ...item };
                });
                console.log(CanvasDrawing.CHART_IMAGE_ASSETS);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    public static loadImageAsObject(name: string, url: string): Promise<Record<string, HTMLImageElement>> {
        const promise = new Promise<Record<string, HTMLImageElement>>((resolve) => {
            fabric.util.loadImage(url, (img) => {
                const returnedObject: Record<string, HTMLImageElement> = {};
                returnedObject[name] = img;
                resolve(returnedObject);
            });
        });

        return promise;
    }

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
                element.laneType
            );
        }

        //Draw GameMode/Difficulty Image banner
        for (let index = 0; index < canvasData.images.length; index++) {
            const element: DTXImageRectPos = canvasData.images[index];
            this.addImageRect(canvasObject, element.rectPos, element.name);
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

    private static addImageRect(canvasObject: fabric.StaticCanvas, positionSize: DTXRect, imageName: string) {
        if (CanvasDrawing.CHART_IMAGE_ASSETS[imageName]) {
            const imageElement: HTMLImageElement = CanvasDrawing.CHART_IMAGE_ASSETS[imageName];

            const rect = new fabric.Rect({
                width: imageElement.naturalWidth,
                height: imageElement.naturalHeight,
                left: positionSize.posX,
                top: positionSize.posY
            });
            rect.set(
                "fill",
                new fabric.Pattern({
                    source: imageElement,
                    repeat: "no-repeat"
                })
            );

            canvasObject.add(rect);
        }
    }

    private static addChipImageRect(
        canvasObject: fabric.StaticCanvas,
        positionSize: DTXRect,
        imageElement: HTMLImageElement
    ) {
        const rect = new fabric.Rect({
            width: imageElement.naturalWidth,
            height: imageElement.naturalHeight,
            left: positionSize.posX,
            top: positionSize.posY,
            originY: "center"
        });
        rect.set(
            "fill",
            new fabric.Pattern({
                source: imageElement,
                repeat: "no-repeat"
            })
        );

        canvasObject.add(rect);
    }

    /**
     * positionSize - An object defined as {x: <number>, y: <number>, width: <number>, height: <number>}
     * laneType - Lane Type
     * Remarks: Origin of rect is assumed to be top-left corner by default, unless otherwise
     */
    private static addChip(canvasObject: fabric.StaticCanvas, positionSize: DTXRect, laneType: string) {
        if (CanvasDrawing.CHART_IMAGE_ASSETS[laneType]) {
            CanvasDrawing.addChipImageRect(canvasObject, positionSize, CanvasDrawing.CHART_IMAGE_ASSETS[laneType]);
        } else {
            CanvasDrawing.addChipRect(canvasObject, positionSize, {
                fill: CanvasDrawing.DM_CHIP_COLOR_INFO[laneType].color
            });
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
    private static addChipRect(
        canvasObject: fabric.StaticCanvas,
        positionSize: DTXRect,
        drawOptions: CanvasDrawOptions
    ) {
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

//This will run before App.tsx is loaded and rendered on screen
CanvasDrawing.initLoadAllAssets();
