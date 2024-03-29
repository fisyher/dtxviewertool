import { Box, Card, CardContent, Paper } from "@mui/material";
import Sidebar from "./Sidebar";
import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactSplit from "@devbookhq/splitter";
import { useTheme } from "@mui/material";
import Copyright from "../../components/copyright";
//
import DTXLoadConfigPanel from "../../components/DTXLoadConfig/DTXLoadConfigPanel";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ChartState, ChartStatusType, parseFile } from "../../app/reducers/chartReducer";
import { loadDtxJsonIntoEngine, reset as resetCanvasEngine } from "../../app/reducers/canvasEngineReducer";
import { LoadConfigOptionType } from "../../app/reducers/optionsReducer";
import { DTXDrawingConfig } from "../../external/DTX/DTXCanvasTypes";
import OutputPane from "./OutputPane";
import ConfigTest from "../../components/ConfigTest";

const Viewer: React.FC = () => {
    const {
        mixins: { toolbar }
    } = useTheme();

    const dispatch = useAppDispatch();
    const previousStatusRef = useRef<ChartStatusType>();
    const { status, raw, dtxJsonObject }: ChartState = useAppSelector((state) => state.chart);

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
            } else if (status === "valid") {
                console.log("Dispatch action to generate Canvas Chip data from DTXObject Object");
                const drawingOptions: DTXDrawingConfig = {
                    difficultyLabel: difficultyLabel,
                    scale: scale,
                    chartMode: chartMode,
                    maxHeight: maxHeight,
                    gameMode: "Drum",
                    isLevelShown: true
                };
                
                dispatch(loadDtxJsonIntoEngine({ dtxJson: dtxJsonObject, drawingOptions }));
                //Load Guitar Chips
                drawingOptions.gameMode = "Guitar";                
                dispatch(loadDtxJsonIntoEngine({ dtxJson: dtxJsonObject, drawingOptions }));
                //Load Bass Chips
                drawingOptions.gameMode = "Bass";                
                dispatch(loadDtxJsonIntoEngine({ dtxJson: dtxJsonObject, drawingOptions }));

            }
        } else {
            //Handle use effect trigger not caused by change in chart Status
            if (dtxJsonObject && status === "valid") {
                dispatch(resetCanvasEngine());
                const drawingOptions: DTXDrawingConfig = {
                    difficultyLabel: difficultyLabel,
                    scale: scale,
                    chartMode: chartMode,
                    maxHeight: maxHeight,
                    gameMode: "Drum",
                    isLevelShown: true
                };
                dispatch(loadDtxJsonIntoEngine({ dtxJson: dtxJsonObject, drawingOptions }));
                //Load Guitar Chips
                drawingOptions.gameMode = "Guitar";                
                dispatch(loadDtxJsonIntoEngine({ dtxJson: dtxJsonObject, drawingOptions }));
                //Load Bass Chips
                drawingOptions.gameMode = "Bass";                
                dispatch(loadDtxJsonIntoEngine({ dtxJson: dtxJsonObject, drawingOptions }));
            }
        }

        // Update the reference to the current nestedField value
        previousStatusRef.current = status;
    }, [status, dtxJsonObject, raw, dispatch, difficultyLabel, scale, chartMode, maxHeight]);

    const [selectedItemNum, setSelectedItemNum] = useState<number>(0);

    const sideBarCallback: Function = useCallback((selectedItem: number) => {
        setSelectedItemNum(selectedItem);
    }, []);

    return (
        <React.Fragment>
            <Box
                sx={{
                    display: "flex",
                    minHeight: `calc(100vh - (${toolbar?.minHeight}px + ${32}px))`,
                    maxHeight: `calc(100vh - (${toolbar?.minHeight}px + ${32}px))`
                }}
            >
                <Sidebar callback={sideBarCallback}></Sidebar>

                <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
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
                                <CardContent>
                                    <ConfigTest></ConfigTest>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={selectedItemNum === 2 ? { p: 1 } : { display: "none" }}>
                                Config Panel 3
                            </Card>
                            <Card variant="outlined" sx={selectedItemNum === 3 ? { p: 1 } : { display: "none" }}>
                                Config Panel 4
                            </Card>
                        </Paper>
                        <OutputPane></OutputPane>
                    </ReactSplit>
                    <Copyright></Copyright>
                </Box>
            </Box>
        </React.Fragment>
    );
};

export default Viewer;
