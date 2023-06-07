import { Box, Card, CardContent, Paper, Typography } from "@mui/material";
import Sidebar from "./Sidebar";
import React from "react";
import ReactSplit, { SplitDirection } from "@devbookhq/splitter";
import { useTheme } from "@mui/material";
import Copyright from "../../components/copyright";

function Viewer() {
  const {
    mixins: { toolbar },
  } = useTheme();

  return (
    <React.Fragment>
      <Box sx={{ display: "flex" }}>
        <Sidebar></Sidebar>

        <Box component="main" sx={{ flexGrow: 1, p: 0, minHeight: `calc(100vh - (${toolbar?.minHeight}px + ${8}px))` }}>
          <ReactSplit>
            {/* Each Paper component within ReactSplit is a split pane */}
            <Paper sx={{ p: 2 }}>Input Config Here</Paper>
            <Paper sx={{ p: 2 }}>
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
              <Copyright></Copyright>
            </Paper>
            
          </ReactSplit>
          
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default Viewer;
