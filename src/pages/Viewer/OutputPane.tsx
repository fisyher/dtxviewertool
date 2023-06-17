import { Paper, Typography, Card, CardContent } from "@mui/material";
import FabricCanvas from "../../components/FabricCanvas/FabricCanvas";
import { CanvasEngineOverallState } from "../../app/reducers/canvasEngineReducer";
import { useAppSelector } from "../../app/hooks";
import { ReactNode, useCallback, useMemo } from "react";
import { fabric } from "fabric";
import CanvasDrawing from "../../external/CanvasDrawing/CanvasDrawing";


const OutputPane: React.FC = () => {

    const { Drum, Guitar, Bass, overallStatus } : CanvasEngineOverallState = useAppSelector((state) => state.canvasDTX);

    const drawCanvasFunction = useCallback((canvas: fabric.StaticCanvas, renderCount: number) => {
        console.log("drawCanvas func called");
        console.log(renderCount);
    
        if (canvas && Drum.status === 'loaded') {
          //Clear canvas before re-drawing
          CanvasDrawing.clear(canvas);
          CanvasDrawing.drawAllChipsOntoCanvas(canvas, Drum.canvasDTXObjects[0]);
          canvas.renderAll();
        }
      }, [Drum]);

    

    const fabricComponentsForDrum = useMemo(() => {
      let retComponents : ReactNode = <></>;
      console.log("in useMemo: status is " + Drum.status);
      if(Drum.status === 'loaded'){
        retComponents = Drum.canvasDTXObjects.map((canvasDTXObject, index) => {
          return (
            <FabricCanvas
            key={`drum-canvas-${index}`}
            id={`drum-canvas-${index}`}
            triggerDraw={0}
            canvasProps={{...canvasDTXObject.canvasSize, backgroundColor:"#000000"}}
            drawFunction={drawCanvasFunction}
            ></FabricCanvas>
          );
        });
      }else{
        //console.log("in useMemo: status is " + Drum.status);
      }
      return retComponents;
    }, [Drum]);


    return (<Paper sx={{ p: 2 }} className="my-paper">
    <Typography variant="h4" component="h1" gutterBottom>
      Main Viewer
    </Typography>
    This is the main viewer
    {/* <ProTip />*/}
    <Card variant="outlined">
      <CardContent sx={{overflow: 'auto', maxHeight: '80vh', maxWidth: '75vw'}}>
        <Typography variant="h5">Card Top</Typography>
        {fabricComponentsForDrum}
        {/* 2 Fabric Canvas to simulate large chart */}
        {/* <FabricCanvas
          id="canvas-1"
          triggerDraw={0}
          canvasProps={{width: 16000, height: 3000, backgroundColor: "#000000"}}
          drawFunction={drawCanvasFunction}
        ></FabricCanvas> */}        
      </CardContent>
    </Card>
  </Paper>);
}

export default OutputPane;