import { Box, Typography } from "@mui/material";
import React from "react";

function Help() {
    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Help Page
            </Typography>
            Put Help info here
            {/* <ProTip />*/}
        </Box>
    );
}

export default Help;
