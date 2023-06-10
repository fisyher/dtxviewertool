import { Box, Card, CardContent, Paper, Typography } from "@mui/material";
import Sidebar from "./Sidebar";
import React, { useState } from "react";
import ReactSplit from "@devbookhq/splitter";
import { useTheme } from "@mui/material";
import Copyright from "../../components/copyright";
//
import DTXLoadConfigPanel from "../../components/DTXLoadConfig/DTXLoadConfigPanel";

const Viewer : React.FC = () => {
  const {
    mixins: { toolbar },
  } = useTheme();

  const [selectedItemNum, setSelectedItemNum] = useState(0);

  const sideBarCallback: Function = (selectedItem: number) => {
    console.log(selectedItem);
    setSelectedItemNum(selectedItem);
  };


  return (
    <React.Fragment>
      <Box sx={{ display: "flex", minHeight: `calc(100vh - (${toolbar?.minHeight}px + ${32}px))` }}>
        <Sidebar callback={sideBarCallback}></Sidebar>

        <Box component="main" sx={{ flexGrow: 1, p: 0,  }}>
          <ReactSplit initialSizes={[25, 75]}>
            {/* Each Paper component within ReactSplit is a split pane */}
            <Paper sx={{ p: 1 }}>
              {/* Raw, basic implementation of Sidebar Tab */}
              <Card variant="outlined" sx={selectedItemNum === 0 ? {p: 1} : {display: 'none'}}><CardContent><DTXLoadConfigPanel></DTXLoadConfigPanel></CardContent></Card>
              <Card variant="outlined" sx={selectedItemNum === 1 ? {p: 1} : {display: 'none'}}>Config Panel 2</Card>
              <Card variant="outlined" sx={selectedItemNum === 2 ? {p: 1} : {display: 'none'}}>Config Panel 3</Card>
              <Card variant="outlined" sx={selectedItemNum === 3 ? {p: 1} : {display: 'none'}}>Config Panel 4</Card>
              </Paper>
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
              
            </Paper>
            
          </ReactSplit>
          <Copyright></Copyright>
        </Box>
        
      </Box>
    </React.Fragment>
  );
}

export default Viewer;
