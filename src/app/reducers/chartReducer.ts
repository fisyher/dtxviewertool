import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DtxFileParser, DTXJson } from "../../external/DTX";
import { EmptyDTXJson } from "../../external/DTX/DTXJsonTypes";

const DEFAULT_ENCODING = "shift-jis";

type ChartStatusType = "empty" | "loading" | "rawLoaded" | "parsing" | "error" | "invalid" | "valid";

interface ChartState {
    dtxJsonObject: DTXJson;
    raw: String;
    status: ChartStatusType;
    error: String;
}

//Initial state
//Deep copy of EmptyDTXJson is necessary to avoid TypeError cause by constness of Object
const initialState = {
    dtxJsonObject: {
        ...EmptyDTXJson,
        songInfo: { ...EmptyDTXJson.songInfo },
        laneChipCounter: { ...EmptyDTXJson.laneChipCounter }
    },
    raw: "",
    status: "empty",
    error: ""
} as ChartState;

export const readFile = createAsyncThunk("chart/readFile", async (file: File, thunkConfig) => {
    const reader = new FileReader();

    return new Promise<String>((resolve, reject) => {
        reader.onload = () => {
            const content = reader.result as string;
            resolve(content);
        };

        reader.onerror = () => {
            reject(reader.error?.message || "Failed to read file");
        };

        reader.readAsText(file, DEFAULT_ENCODING);
    });
});

export const parseFile = createAsyncThunk("chart/parseFile", async (content: String) => {
    return new Promise<ChartState>((resolve, reject) => {
        const parser: DtxFileParser = new DtxFileParser(content as string);
        if (parser.getErrorMessage() !== "") {
            reject(parser.getErrorMessage());
        } else {
            const dtxJson: DTXJson = parser.getDtxJson();
            resolve({ dtxJsonObject: dtxJson, raw: content, status: "valid", error: "" });
        }
    });
});

export const chartSlice = createSlice({
    name: "chart",
    initialState,
    reducers: {
        reset: (state) => {
            state.raw = "";
            state.error = initialState.error;
            state.status = initialState.status;
            state.dtxJsonObject = {
                ...EmptyDTXJson,
                songInfo: { ...EmptyDTXJson.songInfo },
                laneChipCounter: { ...EmptyDTXJson.laneChipCounter }
            };
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        setDtx: (state, action: PayloadAction<String>) => {
            state.raw = action.payload;
            state.status = "valid";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(readFile.pending, (state) => {
                state.status = "loading";
                state.error = "";
                state.raw = "";
                state.dtxJsonObject = initialState.dtxJsonObject;
            })
            .addCase(readFile.fulfilled, (state, action) => {
                state.status = "rawLoaded";
                state.error = "";
                state.raw = action.payload;
            })
            .addCase(readFile.rejected, (state, action) => {
                state.status = "error";
                state.error = action.error.message || "Failed to read file";
            })
            .addCase(parseFile.pending, (state) => {
                state.status = "parsing";
                state.error = "";
                //state.raw = "";
            })
            .addCase(parseFile.fulfilled, (state, action) => {
                state.status = action.payload.status;
                state.error = action.payload.error;
                state.dtxJsonObject = action.payload.dtxJsonObject;
                state.raw = action.payload.raw;
            })
            .addCase(parseFile.rejected, (state, action) => {
                state.status = "invalid";
                state.error = action.error.message || "Failed to parse DTX file";
            });
    }
});

export type { ChartState, ChartStatusType };
export const { reset, setDtx } = chartSlice.actions;
export default chartSlice.reducer;
