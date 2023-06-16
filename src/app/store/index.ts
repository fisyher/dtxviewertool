import { configureStore } from '@reduxjs/toolkit';
import chartReducer from '../reducers/chartReducer';
import optionsReducer from '../reducers/optionsReducer';
import canvasEngineReducer from '../reducers/canvasEngineReducer';

const store = configureStore({
  reducer: {
    chart: chartReducer,
    canvasDTX: canvasEngineReducer,
    // debugData: debugDataReducer,
    UIOptions: optionsReducer
    
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store;