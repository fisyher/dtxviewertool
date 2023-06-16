import { Paper, Typography, Card, CardContent } from "@mui/material";
import FabricCanvas from "../../components/FabricCanvas/FabricCanvas";
import { CanvasEngineOverallState } from "../../app/reducers/canvasEngineReducer";
import { useAppSelector } from "../../app/hooks";
import { useCallback } from "react";
import { fabric } from "fabric";
import CanvasDrawing from "../../external/CanvasDrawing/CanvasDrawing";


const OutputPane: React.FC = () => {

    const { Drum, Guitar, Bass, overallStatus } : CanvasEngineOverallState = useAppSelector((state) => state.canvasDTX);


    const drawCanvasFunction = useCallback((canvas: fabric.StaticCanvas, renderCount: number) => {
        console.log("drawCanvas func called");
        console.log(renderCount);
        const colorArray: string[] = ["red", "green", "blue"];
    
        if (canvas && Drum.status === 'loaded') {
          //Clear canvas before re-drawing
          CanvasDrawing.clear(canvas);
          CanvasDrawing.drawAllChipsOntoCanvas(canvas, Drum.canvasChipPositions[0]);
          canvas.renderAll();
        }
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
        {/* 2 Fabric Canvas to simulate large chart */}
        <FabricCanvas
          id="canvas-1"
          triggerDraw={0}
          canvasProps={{width: 16000, height: 3000, backgroundColor: "#000000"}}
          drawFunction={drawCanvasFunction}
        ></FabricCanvas>
        {/* <FabricCanvas
          id="canvas-2"
          triggerDraw={0}
          canvasProps={{width: 3000, height: 3000, backgroundColor: "#000000"}}
          drawFunction={drawCanvasFunction}
        ></FabricCanvas> */}
      </CardContent>
    </Card>
  </Paper>);
}

export default OutputPane;