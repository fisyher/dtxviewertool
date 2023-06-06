import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { ChartState, ChartStatusType, parseFile, readFile } from "../app/reducers/chartReducer";
import { Card, CardContent, TextField } from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";


function Debug() {
  //Initialize dispatcher and selector
  const dispatch = useAppDispatch();
  const previousStatusRef = useRef<ChartStatusType>();
  const { status, error, raw, dtxJsonObject } : ChartState = useAppSelector((state) => state.chart);

  //
  useEffect(() => {

    if (status !== previousStatusRef.current) {
      // Dispatch your action here conditionally
      console.log("Change in status detected");
      console.log(previousStatusRef.current + ' to ' + status);
      if(status === 'rawLoaded'){
        console.log("Dispatch action to parseFile");
        dispatch(parseFile(raw));
      }
      
    }

    // Update the reference to the current nestedField value
    previousStatusRef.current = status;

  }, [status, raw, dispatch])
  

  //Handle file change event
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(readFile(file));
    }
  };

  //
  const [tabValue, setTabValue] = React.useState("1");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <React.Fragment>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debugger for Viewer
        </Typography>
        <div>
          <input type="file" accept=".dtx, .gda" onChange={handleFileChange} />
          {status === "loading" && <p>Loading file...</p>}
        </div>
      </Box>
      <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
          Debug Output
        </Typography>
        <Card variant="outlined">
          <CardContent>
          
        <Typography  gutterBottom>
          Title: {dtxJsonObject.songInfo.title}
        </Typography>
        <Typography  gutterBottom>
          Artist: {dtxJsonObject.songInfo.artist}
        </Typography>
        <Typography  gutterBottom>
          Comment: {dtxJsonObject.songInfo.comment}
        </Typography>
        <Typography  gutterBottom>
          Length: {dtxJsonObject.songInfo.songDuration} seconds
        </Typography>
        <Typography  gutterBottom>
          Chip Count: {dtxJsonObject.chips.length}
        </Typography>
        {error && <p>Error: {error}</p>}
          </CardContent>
        </Card>
        <Box sx={{ my: 4 }}>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Raw View" value="1" />
                <Tab label="JSON View" value="2" />
                <Tab label="Others" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <TextField
                fullWidth
                type="text"
                multiline
                value={raw}
                InputProps={{
                  readOnly: true,
                  spellCheck: "false",
                  style: { fontFamily: "monospace" },
                }}
              />
            </TabPanel>
            <TabPanel value="2">
              <JsonViewer value={dtxJsonObject} defaultInspectDepth={2} theme="auto" />
            </TabPanel>
            <TabPanel value="3">To be added</TabPanel>
          </TabContext>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default Debug;
