import { Box, Link, Typography } from "@mui/material";


function Copyright() {
    return (
        <Box component="footer">
      <Typography variant="body2" color="text.secondary" align="center">
        {"Copyright © "}
        <Link color="inherit" href="/">
          DTX Viewer Tool
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
      </Box>
    );
  }

export default Copyright;