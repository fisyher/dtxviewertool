import { Paper, Typography, Box, Tabs, Tab, Card } from "@mui/material";
import FabricCanvas from "../../components/FabricCanvas/FabricCanvas";
import { CanvasEngineOverallState } from "../../app/reducers/canvasEngineReducer";
import { useAppSelector } from "../../app/hooks";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { fabric } from "fabric";
import CanvasDrawing from "../../external/CanvasDrawing/CanvasDrawing";
import styled from "@emotion/styled";

const OutputPane: React.FC = () => {
    const { Drum, Guitar, Bass, overallStatus }: CanvasEngineOverallState = useAppSelector((state) => state.canvasDTX);

    const [tabValue, setTabValue] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const drawCanvasFunction = useCallback(
        (canvas: fabric.StaticCanvas, renderCount: number) => {
            console.log("drawCanvas func called");
            console.log(renderCount);

            if (canvas && Drum.status === "loaded") {
                //Clear canvas before re-drawing
                CanvasDrawing.clear(canvas);
                CanvasDrawing.drawAllChipsOntoCanvas(canvas, Drum.canvasDTXObjects[0]);
                canvas.renderAll();
            }
        },
        [Drum]
    );

    const fabricComponentsForDrum = useMemo(() => {
        let retComponents: ReactNode = <Typography variant="h5">Load a DTX File to start</Typography>;
        console.log("in useMemo: status is " + Drum.status);
        if (Drum.status === "loaded") {
            retComponents = Drum.canvasDTXObjects.map((canvasDTXObject, index) => {
                return (
                    <FabricCanvas
                        key={`drum-canvas-${index}`}
                        id={`drum-canvas-${index}`}
                        triggerDraw={0}
                        canvasProps={{ ...canvasDTXObject.canvasSize, backgroundColor: "#000000" }}
                        drawFunction={drawCanvasFunction}
                    ></FabricCanvas>
                );
            });
        } else {
            //console.log("in useMemo: status is " + Drum.status);
        }
        return retComponents;
    }, [Drum]);

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
                {fabricComponentsForDrum}
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
                <Typography variant="h5">Guitar Chart under construction</Typography>
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
                <Typography variant="h5">Bass Chart under construction</Typography>
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
