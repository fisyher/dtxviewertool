import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { readFile } from "../app/reducers/chartReducer";
import { TextField } from "@mui/material";
import { JsonViewer } from "@textea/json-viewer";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

function Debug() {
  //Initialize dispatcher and selector
  const dispatch = useAppDispatch();
  const { status, error, raw, chart } = useAppSelector((state) => state.chart);

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
          <input type="file" onChange={handleFileChange} />
          {status === "loading" && <p>Loading file...</p>}
        </div>
      </Box>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debug Output
        </Typography>
        <Typography variant="h5" gutterBottom>
          Title: {chart.songInfo.title}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Artist: {chart.songInfo.artist}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Comment: {chart.songInfo.comment}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Length: {chart.songInfo.songDuration} seconds
        </Typography>
        <Typography variant="h5" gutterBottom>
          Chip Count: {chart.chips.length}
        </Typography>
        {error && <p>Error: {error}</p>}

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
              <JsonViewer value={chart} defaultInspectDepth={2} theme="auto" />
            </TabPanel>
            <TabPanel value="3">To be added</TabPanel>
          </TabContext>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default Debug;
