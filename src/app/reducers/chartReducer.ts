import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

import { DtxFileParser, DTXJson } from '../../external/DTX';

const DEFAULT_ENCODING = 'shift-jis';

interface ChartMetadata {
    source: String,
    size: Number,
    version: String
};

interface ChartNoteData {
    timestampMS: Number,
    type: String
};

interface ChartState {
    chart: DTXJson,
    raw: String,
    status: 'empty' | 'loading' | 'rawLoaded' | 'error' | 'invalid' | 'valid',
    error: String
  };

//Initial state
const initialState = {
  chart: {
    songInfo: {
        title: "",
        artist: "",
        comment: "",
        difficultyLevelDrum: 0,
        difficultyLevelGuitar: 0,
        difficultyLevelBass: 0,
        songDuration: 0,
      },
      bars: [],
      bpmSegments: [],
      chips: [],
  },
  raw: '',
  status: 'empty',
  error: ''
} as ChartState;

export const readFile = createAsyncThunk(
    'chart/readFile',
    async (file: File) => {
      const reader = new FileReader();
  
      return new Promise<ChartState>((resolve, reject) => {
        reader.onload = () => {
          const content = reader.result as string;

          //
          const parser: DtxFileParser = new DtxFileParser(content);
          if(parser.getErrorMessage() !== ''){
            reject(parser.getErrorMessage());
          }
          else{
            const dtxJson: DTXJson = parser.getDtxJson();
            resolve({chart: dtxJson, raw: content, status: 'valid', error: ''});
          }
        };
  
        reader.onerror = () => {
          reject(reader.error?.message || 'Failed to read file');
        };

        reader.readAsText(file, DEFAULT_ENCODING);
      });
    }
  );
  

export const chartSlice = createSlice({
    name: 'chart',
    initialState,
    reducers: {
      reset: (state) => {
        state = {...initialState};
      },
      // Use the PayloadAction type to declare the contents of `action.payload`
      setDtx: (state, action: PayloadAction<String>) => {
        state.raw = action.payload;
        state.status = 'valid';
      },
    },
    extraReducers: (builder) => {
        builder
          .addCase(readFile.pending, (state) => {
            state.status = 'loading';
            state.error = '';
            state.raw = '';
          })
          .addCase(readFile.fulfilled, (state, action) => {
            state.status = 'rawLoaded';
            //state = {...action.payload};
            state.error = action.payload.error;
            state.chart = action.payload.chart;
            state.raw = action.payload.raw;
            
          })
          .addCase(readFile.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || 'Failed to read file';
          });
      },
  });


  export const { reset, setDtx } = chartSlice.actions;
  export default chartSlice.reducer;