import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DTXCanvasDataType, DTXDrawingConfig } from "../../external/DTX/DTXCanvasTypes";
import { DtxCanvasPositioner } from "../../external/DTX/DTXCanvasPositioner";
import { DTXJson } from "../../external/DTX";
import type { GameModeType } from "../../external/DTX/DTXCanvasTypes";

type CanvasEngineStatusType = "empty" | "loading" | "loaded" | "rendering" | "done" | "error";

interface NamedImageObject {
    [key: string]: HTMLImageElement;
}

interface CanvasChartState {
    canvasDTXObjects: DTXCanvasDataType[];    
    gameMode: GameModeType;
    status: CanvasEngineStatusType;
    error: string;
}

interface CanvasEngineOverallState {
    Drum: CanvasChartState;
    Guitar: CanvasChartState;
    Bass: CanvasChartState;
    overallStatus: string;
}

type ErrorPayloadType = {
    errorMessage: any;
    gameMode: GameModeType;
};

export const loadDtxJsonIntoEngine = createAsyncThunk<
    CanvasChartState,
    { dtxJson: DTXJson; drawingOptions: DTXDrawingConfig },
    { rejectValue: ErrorPayloadType }
>(
    "canvas/loadDtxJson",
    async (
        { dtxJson, drawingOptions }: { dtxJson: DTXJson; drawingOptions: DTXDrawingConfig },
        { rejectWithValue }
    ) => {
        try {
            const value = await new Promise<CanvasChartState>((resolve, reject) => {
                try {
                    const canvasPositioner: DtxCanvasPositioner = new DtxCanvasPositioner(dtxJson, drawingOptions);
                    resolve({
                        canvasDTXObjects: canvasPositioner.getCanvasDataForDrawing(),
                        gameMode: drawingOptions.gameMode,
                        status: "loaded",
                        error: ""
                    });
                } catch (error) {
                    reject(error);
                }
            });
            return value;
        } catch (error) {
            return rejectWithValue({ errorMessage: error, gameMode: drawingOptions.gameMode });
        }
    }
);

//Initial state
const emptyCanvasChartState = {
    canvasDTXObjects: [],
    status: "empty",
    gameMode: "Drum",
    error: ""
} as CanvasChartState;

//Deep copy of emptyCanvasChartState is necessary to avoid TypeError cause by constness of Object
const initialState = {
    Drum: { ...emptyCanvasChartState },
    Guitar: { ...emptyCanvasChartState },
    Bass: { ...emptyCanvasChartState },
    overallStatus: ""
} as CanvasEngineOverallState;

export const canvasEngineSlice = createSlice({
    name: "canvasEngine",
    initialState,
    reducers: {
        reset: (state) => {
            state.overallStatus = initialState.overallStatus;
            state.Drum = {
                ...emptyCanvasChartState,
                canvasDTXObjects: [],
                gameMode: "Drum"
            };
            state.Guitar = {
                ...emptyCanvasChartState,
                canvasDTXObjects: [],
                gameMode: "Guitar"
            };
            state.Bass = {
                ...emptyCanvasChartState,
                canvasDTXObjects: [],
                gameMode: "Bass"
            };
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        setLoadingStatus: (state, action: PayloadAction<keyof typeof initialState>) => {
            const canvasChart: CanvasChartState = state[action.payload] as CanvasChartState;
            canvasChart.status = "loading";
            state.overallStatus = `Loading ${action.payload} ...`;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadDtxJsonIntoEngine.pending, (state) => {
                //
            })
            .addCase(loadDtxJsonIntoEngine.fulfilled, (state, action) => {
                const gameMode: GameModeType = action.payload.gameMode;
                state[gameMode] = action.payload;
                state.overallStatus = `Loaded ${action.payload.gameMode}`;
            })
            .addCase(loadDtxJsonIntoEngine.rejected, (state, action) => {
                const gameMode: GameModeType | undefined = action.payload?.gameMode;
                if (gameMode) {
                    state[gameMode].error = action.payload?.errorMessage;
                    state[gameMode].status = "error";
                }
                state.overallStatus = `Error loading ${gameMode}`;
            });
    }
});

export type { CanvasChartState, CanvasEngineStatusType, CanvasEngineOverallState };
export const { reset, setLoadingStatus } = canvasEngineSlice.actions;
export default canvasEngineSlice.reducer;
