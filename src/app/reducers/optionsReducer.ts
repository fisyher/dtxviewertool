import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { DifficultyLabelType, ChartModeType } from "../../external/DTX/DTXCanvasTypes";

interface LoadConfigOptionType {
    inputFile: string;
    difficultyLabel: DifficultyLabelType;
    scale: number;
    maxHeight: number;
    chartMode: ChartModeType;
    isLevelShown: boolean;
}

interface OptionsStateType {
    loadConfigUI: LoadConfigOptionType;
}

//Initial state
const initialState = {
    loadConfigUI: {
        inputFile: "",
        difficultyLabel: "Basic",
        scale: 1.0,
        maxHeight: 2000,
        chartMode: "XG/Gitadora",
        isLevelShown: true
    }
} as OptionsStateType;

export const optionsSlice = createSlice({
    name: "options",
    initialState,
    reducers: {
        reset: (state) => {
            state = { ...initialState };
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        setInputFile: (state, action: PayloadAction<string>) => {
            state.loadConfigUI.inputFile = action.payload;
        },
        setDifficultyLabel: (state, action: PayloadAction<DifficultyLabelType>) => {
            //state.loadConfigUI = {...state.loadConfigUI, difficultyLabel: action.payload};
            state.loadConfigUI.difficultyLabel = action.payload;
        },
        setScale: (state, action: PayloadAction<number>) => {
            state.loadConfigUI.scale = action.payload;
        },
        setMaxHeight: (state, action: PayloadAction<number>) => {
            state.loadConfigUI.maxHeight = action.payload;
        },
        setChartMode: (state, action: PayloadAction<ChartModeType>) => {
            state.loadConfigUI.chartMode = action.payload;
        },
        setIsLevelShown: (state, action: PayloadAction<boolean>) => {
            state.loadConfigUI.isLevelShown = action.payload;
        }
    }
});

export type { OptionsStateType, LoadConfigOptionType };
//export { DifficultyLabels, ChartModes };
export const { reset, setInputFile, setDifficultyLabel, setScale, setMaxHeight, setChartMode, setIsLevelShown } =
    optionsSlice.actions;
export default optionsSlice.reducer;
