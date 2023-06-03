import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';

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
    metadata: ChartMetadata,
    notes: Array<ChartNoteData>,
    raw: String,
    status: 'empty' | 'loading' | 'rawLoaded' | 'error' | 'invalid' | 'valid',
    error: String
  };

//Initial state
const initialState = {
  metadata: {
    source: '',
    size: 0, 
    version: ''
  },
  notes: [],
  raw: '',
  status: 'empty',
  error: ''
} as ChartState;

export const readFile = createAsyncThunk(
    'chart/readFile',
    async (file: File) => {
      const reader = new FileReader();
  
      return new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const content = reader.result as string;
          resolve(content);
        };
  
        reader.onerror = () => {
          reject(reader.error?.message || 'Failed to read file');
        };
  
        reader.readAsText(file);
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
            state.raw = action.payload;
          })
          .addCase(readFile.rejected, (state, action) => {
            state.status = 'error';
            state.error = action.error.message || 'Failed to read file';
          });
      },
  });


  export const { reset, setDtx } = chartSlice.actions;
  export default chartSlice.reducer;