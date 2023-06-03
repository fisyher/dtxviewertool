import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { readFile } from "../app/reducers/chartReducer";

function Debug() {
  //Initialize dispatcher and selector
  const dispatch = useAppDispatch();
  const { status, error, raw } = useAppSelector((state) => state.chart);

  //Handle file change event
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(readFile(file));
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debugger for Viewer
        </Typography>
        <div>
        <input type="file" onChange={handleFileChange} />
      {status === 'loading' && <p>Loading file...</p>}
      
      
      </div>
      </Box>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debug Output
        </Typography>
        {error && <p>Error: {error}</p>}
        {raw !== '' && <p>File content: {raw}</p>}
      </Box>
    </React.Fragment>
  );
}

export default Debug;
