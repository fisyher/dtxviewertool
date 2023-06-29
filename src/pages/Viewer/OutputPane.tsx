import { Paper, Typography, Box, Tabs, Tab, Card } from "@mui/material";
import FabricCanvas from "../../components/FabricCanvas/FabricCanvas";
import { CanvasChartState, CanvasEngineOverallState } from "../../app/reducers/canvasEngineReducer";
import { useAppSelector } from "../../app/hooks";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { fabric } from "fabric";
import CanvasDrawing from "../../external/CanvasDrawing/CanvasDrawing";

const useDTXCanvasHook = (inputChartState: CanvasChartState, prefix: string) => {
    const drawCanvasFunction = useCallback(
        (canvas: fabric.StaticCanvas, sourceObjectIndex: number) => {
            console.log("drawCanvas func called");
            console.log(sourceObjectIndex);

            if (canvas && inputChartState.status === "loaded") {
                //Clear canvas before re-drawing
                CanvasDrawing.clear(canvas);
                CanvasDrawing.drawAllChipsOntoCanvas(canvas, inputChartState.canvasDTXObjects[sourceObjectIndex]);
                canvas.renderAll();
            }
        },
        [inputChartState]
    );

    const fabricComponents = useMemo(() => {
        let retComponents: ReactNode = <Typography variant="h5">Load a DTX File to start</Typography>;
        
        if (inputChartState.status === "loaded") {
            retComponents = inputChartState.canvasDTXObjects.map((canvasDTXObject, index) => {
                return (
                    <FabricCanvas
                        key={`${prefix}-canvas-${index}`}
                        id={`${prefix}-canvas-${index}`}
                        sourceObjectIndex={index}
                        canvasProps={{ ...canvasDTXObject.canvasSize, backgroundColor: "#000000" }}
                        drawFunction={drawCanvasFunction}
                    ></FabricCanvas>
                );
            });
        } else {
            //console.log("in useMemo: status is " + Drum.status);
        }
        return retComponents;
    }, [inputChartState, prefix]);

    return [fabricComponents];
};

const OutputPane: React.FC = () => {
    const { Drum, Guitar, Bass, overallStatus }: CanvasEngineOverallState = useAppSelector((state) => state.canvasDTX);

    const [tabValue, setTabValue] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const [drumFabricComponents] = useDTXCanvasHook(Drum, "drum");
    const [guitarFabricComponents] = useDTXCanvasHook(Guitar, "guitar");
    const [bassFabricComponents] = useDTXCanvasHook(Bass, "Bass");

    return (
        <Paper className="my-paper">
            <Card variant="outlined">
                <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                >
                    <Tab label="Drum" />
                    <Tab label="Guitar" />
                    <Tab label="Bass" />
                    <Tab label="Overview" />
                    <Tab label="Phase Builder" />
                </Tabs>
            </Card>
            {/* Manage tab content by simply setting the display sx prop with a none value conditionally to hide it*/}
            <Paper
                elevation={3}
                sx={{
                    overflow: "auto",
                    maxHeight: "85vh",
                    maxWidth: "75vw",
                    height: "85vh",
                    display: tabValue !== 0 ? "none" : undefined
                }}
            >
                {drumFabricComponents}
            </Paper>
            <Paper
                elevation={3}
                sx={{
                    overflow: "auto",
                    maxHeight: "85vh",
                    maxWidth: "75vw",
                    height: "85vh",
                    display: tabValue !== 1 ? "none" : undefined
                }}
            >
                {guitarFabricComponents}
            </Paper>
            <Paper
                elevation={3}
                sx={{
                    overflow: "auto",
                    maxHeight: "85vh",
                    maxWidth: "75vw",
                    height: "85vh",
                    display: tabValue !== 2 ? "none" : undefined
                }}
            >
                {bassFabricComponents}
            </Paper>
            <Paper
                elevation={3}
                sx={{
                    overflow: "auto",
                    maxHeight: "85vh",
                    maxWidth: "75vw",
                    height: "85vh",
                    display: tabValue !== 3 ? "none" : undefined
                }}
            >
                <Typography variant="h5">Overview Information under construction</Typography>
            </Paper>
            <Paper
                elevation={3}
                sx={{
                    overflow: "auto",
                    maxHeight: "85vh",
                    maxWidth: "75vw",
                    height: "85vh",
                    display: tabValue !== 4 ? "none" : undefined
                }}
            >
                <Typography variant="h5">Phase Builder under construction</Typography>
            </Paper>
        </Paper>
    );
};

export default OutputPane;
