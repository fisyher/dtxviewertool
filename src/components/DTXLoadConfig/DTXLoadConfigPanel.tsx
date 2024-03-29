import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { ChartState, readFile, reset as resetDTXJson } from "../../app/reducers/chartReducer";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import {
    LoadConfigOptionType,
    setChartMode,
    setDifficultyLabel,
    setMaxHeight,
    setScale
} from "../../app/reducers/optionsReducer";
import { ChartModeType, ChartModes, DifficultyLabelType, DifficultyLabels } from "../../external/DTX/DTXCanvasTypes";
import { reset as resetCanvasEngine } from "../../app/reducers/canvasEngineReducer";
import FileInput from "../FileInput";

const ScaleOptions: number[] = [0.5, 1.0, 1.5, 2.0];
const HeightOptions: number[] = [2000, 2500, 3000, 3500, 4000];

const DTXLoadConfigPanel: React.FC = () => {
    //Initialize dispatcher and selector
    const dispatch = useAppDispatch();
    const { status }: ChartState = useAppSelector<ChartState>((state) => state.chart);

    const { difficultyLabel, scale, chartMode, maxHeight }: LoadConfigOptionType = useAppSelector<LoadConfigOptionType>(
        (state) => state.UIOptions.loadConfigUI
    );

    //Handle file change event
    const handleFileChange = (file: File) => {
        if (file) {
            dispatch(resetCanvasEngine());
            dispatch(resetDTXJson());
            dispatch(readFile(file));
        }
    };

    const handleResetClickEvent = () => {
        console.log("Reset clicked");
        dispatch(resetCanvasEngine());
        dispatch(resetDTXJson());
    };

    //Handle Selection of Difficulty Label
    const handleSelectDifficultyLabel = (event: SelectChangeEvent) => {
        dispatch(setDifficultyLabel(event.target.value as DifficultyLabelType));
    };

    //Handle Selection of Scale
    const handleSelectScaleOption = (event: SelectChangeEvent) => {
        dispatch(setScale(parseFloat(event.target.value) as number));
    };

    //Handle Selection of Max Height
    const handleSelectMaxHeightOption = (event: SelectChangeEvent) => {
        dispatch(setMaxHeight(parseFloat(event.target.value) as number));
    };

    //Handle Selection of Chart Mode
    const handleSelectChartMode = (event: SelectChangeEvent) => {
        dispatch(setChartMode(event.target.value as ChartModeType));
    };

    return (
        <Box sx={{}}>
            <Typography variant="h4" component="h1" gutterBottom>
                Load DTX File
            </Typography>
            <div>
                <FileInput onChange={handleFileChange} accept=".dtx, .gda"></FileInput>
                {status === "loading" && <p>Loading file...</p>}
            </div>
            <Button onClick={handleResetClickEvent}>Reset</Button>
            <Typography variant="h4" component="h1" gutterBottom>
                Draw Options
            </Typography>

            <Grid container direction="column" justifyContent="center" alignItems="stretch" spacing={{ md: 1 }}>
                <Grid item>
                    {/**Difficult Label*/}
                    <FormControl fullWidth>
                        <InputLabel id="select-difficulty-label">Difficulty</InputLabel>
                        <Select
                            sx={{ mb: 2 }}
                            variant="standard"
                            labelId="select-difficulty-label"
                            value={difficultyLabel}
                            label="Difficulty"
                            onChange={handleSelectDifficultyLabel}
                        >
                            {DifficultyLabels.map((item, index) => {
                                return (
                                    <MenuItem key={index} value={item}>
                                        {item}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    {/**Scale Label*/}
                    <FormControl fullWidth>
                        <InputLabel id="select-scale-label">Scale</InputLabel>
                        <Select
                            sx={{ mb: 2 }}
                            variant="standard"
                            labelId="select-scale-label"
                            value={scale.toString()}
                            label="Scale"
                            onChange={handleSelectScaleOption}
                        >
                            {ScaleOptions.map((item, index) => {
                                return (
                                    <MenuItem key={index} value={item}>
                                        {item.toFixed(1)}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    {/**Height Label*/}
                    <FormControl fullWidth>
                        <InputLabel id="select-height-label">Max Height</InputLabel>
                        <Select
                            sx={{ mb: 2 }}
                            variant="standard"
                            labelId="select-height-label"
                            value={maxHeight.toString()}
                            label="Height"
                            onChange={handleSelectMaxHeightOption}
                        >
                            {HeightOptions.map((item, index) => {
                                return (
                                    <MenuItem key={index} value={item}>
                                        {item}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    {/**Mode Label*/}
                    <FormControl fullWidth>
                        <InputLabel id="select-mode-label">Mode</InputLabel>
                        <Select
                            sx={{ mb: 2 }}
                            variant="standard"
                            labelId="select-mode-label"
                            value={chartMode}
                            label="Mode"
                            onChange={handleSelectChartMode}
                        >
                            {ChartModes.map((item, index) => {
                                return (
                                    <MenuItem key={index} value={item}>
                                        {item}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                {/*Checkbox TBC*/}
                {/* <FormControlLabel control={<Checkbox defaultChecked />} label="Show Level" /> */}
            </Grid>
        </Box>
    );
};

export default DTXLoadConfigPanel;
