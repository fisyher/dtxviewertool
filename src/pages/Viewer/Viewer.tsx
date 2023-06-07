import { Box, Card, CardContent, Paper, Typography } from "@mui/material";
import Sidebar from "./Sidebar";
import React from "react";

import ReactSplit, { SplitDirection } from "@devbookhq/splitter";

function Viewer() {
  return (
    <React.Fragment>
      <Box sx={{ display: "flex" }}>
        <Sidebar></Sidebar>

        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <ReactSplit>
          {/* Each Paper component within ReactSplit is a split pane */}
          <Paper sx={{p: 2}}>
              <Typography variant="h4" component="h1" gutterBottom>
                Main Viewer
              </Typography>
              This is the main viewer
              {/* <ProTip />*/}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5">Card Top</Typography>
                  <Typography>Card Middle</Typography>
                </CardContent>
              </Card>
              </Paper>
              <Paper sx={{p: 2}}>Tile 2</Paper>
          </ReactSplit>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default Viewer;
