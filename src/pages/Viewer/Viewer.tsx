import { Box, Card, CardContent, Paper, Typography } from "@mui/material";
import Sidebar from "./Sidebar";
import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactSplit from "@devbookhq/splitter";
import { useTheme } from "@mui/material";
import Copyright from "../../components/copyright";
//
import DTXLoadConfigPanel from "../../components/DTXLoadConfig/DTXLoadConfigPanel";
import FabricCanvas from "../../components/FabricCanvas/FabricCanvas";
import { fabric } from "fabric";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ChartState, ChartStatusType, parseFile } from "../../app/reducers/chartReducer";
import { loadDtxJsonIntoEngine } from "../../app/reducers/canvasEngineReducer";
import { LoadConfigOptionType } from "../../app/reducers/optionsReducer";
import { DTXDrawingConfig } from "../../external/DTX/DTXCanvasTypes";

const Viewer: React.FC = () => {
  const {
    mixins: { toolbar },
  } = useTheme();

  const dispatch = useAppDispatch();
  const previousStatusRef = useRef<ChartStatusType>();
  const { status, error, raw, dtxJsonObject } : ChartState = useAppSelector((state) => state.chart);

  const { difficultyLabel, scale, chartMode, maxHeight }: LoadConfigOptionType = useAppSelector<LoadConfigOptionType>(
    (state) => state.UIOptions.loadConfigUI
  );
  //
  useEffect(() => {
    if (status !== previousStatusRef.current) {
      // Dispatch your action here conditionally
      console.log("Change in status detected");
      console.log(previousStatusRef.current + " to " + status);
      if (status === "rawLoaded") {
        console.log("Dispatch action to parseFile");
        dispatch(parseFile(raw));
      }
      else if(status === "valid"){
        console.log("Dispatch action to generate Canvas Chip data from DTXObject Object");
        const drawingOptions: DTXDrawingConfig = {
          difficultyLabel: difficultyLabel,
          scale: scale,
          chartMode: chartMode,
          maxHeight: maxHeight,
          gameMode: "Drum",
          isLevelShown: true
        };
        console.log(drawingOptions);
        dispatch(loadDtxJsonIntoEngine({dtxJson: dtxJsonObject, drawingOptions}));
      }
    }

    // Update the reference to the current nestedField value
    previousStatusRef.current = status;
  }, [status, raw, dispatch, difficultyLabel, scale, chartMode, maxHeight]);

  const [selectedItemNum, setSelectedItemNum] = useState<number>(0);

  //Test trigger state
  const [triggerNumber, setTriggerNumber] = useState<number>(0);

  const sideBarCallback: Function = useCallback((selectedItem: number) => {
    setSelectedItemNum(selectedItem);
    //Test trigger
    setTriggerNumber((prevNum) => {
      return prevNum + 1;
    });
  }, []);

  const drawCanvasFunction = useCallback((canvas: fabric.StaticCanvas, renderCount: number) => {
    console.log("drawCanvas func called");
    console.log(renderCount);
    const colorArray: string[] = ["red", "green", "blue"];

    if (canvas) {
      //Clear canvas before re-drawing
      const bgColor = canvas.backgroundColor as string;
      canvas.clear();
      canvas.setBackgroundColor(bgColor, canvas.renderAll.bind(canvas));

      const textObject = new fabric.Text("Title: " + dtxJsonObject.songInfo.title,{
        left: 20,
        top: 20,
        fill: "#ffffff",
        fontSize: 20,
        fontWeight: "",
        fontFamily: "Arial",
        originY: "top",
        originX: "left"
    });

      const rect = new fabric.Rect({
        height: 280,
        width: 200,
        left: (100 + 40 * (renderCount % 10)) % 800,
        top: 200,
        fill: colorArray[renderCount % colorArray.length],
      });
      canvas.add(rect);
      canvas.add(textObject);
      canvas.renderAll();
    }
  }, [dtxJsonObject]);

  // const sideBarCallback: Function = (selectedItem: number) => {
  //   console.log(selectedItem);
  //   setSelectedItemNum(selectedItem);
  // };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", minHeight: `calc(100vh - (${toolbar?.minHeight}px + ${32}px))`, maxHeight: `calc(100vh - (${toolbar?.minHeight}px + ${32}px))` }}>
        <Sidebar callback={sideBarCallback}></Sidebar>

        <Box component="main" sx={{ flexGrow: 1, p: 0}}>
          <ReactSplit initialSizes={[25, 75]}>
            {/* Each Paper component within ReactSplit is a split pane */}
            <Paper sx={{ p: 1 }} className="my-paper">
              {/* Raw, basic implementation of Sidebar Tab */}
              <Card variant="outlined" sx={selectedItemNum === 0 ? { p: 1 } : { display: "none" }}>
                <CardContent>
                  <DTXLoadConfigPanel></DTXLoadConfigPanel>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={selectedItemNum === 1 ? { p: 1 } : { display: "none" }}>
                Config Panel 2
              </Card>
              <Card variant="outlined" sx={selectedItemNum === 2 ? { p: 1 } : { display: "none" }}>
                Config Panel 3
              </Card>
              <Card variant="outlined" sx={selectedItemNum === 3 ? { p: 1 } : { display: "none" }}>
                Config Panel 4
              </Card>
            </Paper>
            <Paper sx={{ p: 2 }} className="my-paper">
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
                    triggerDraw={triggerNumber}
                    drawFunction={drawCanvasFunction}
                  ></FabricCanvas>
                  <FabricCanvas
                    id="canvas-2"
                    triggerDraw={triggerNumber + 1}
                    drawFunction={drawCanvasFunction}
                  ></FabricCanvas>
                </CardContent>
              </Card>
            </Paper>
          </ReactSplit>
          <Copyright></Copyright>
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default Viewer;
