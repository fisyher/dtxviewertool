import { Box, Link, Typography } from "@mui/material";

function Copyright() {
    return (
        
            <Typography variant="body2" color="text.secondary">
                {"Copyright © "}
                <Link color="inherit" href="/">
                    DTX Viewer Tool
                </Link>{" "}
                {new Date().getFullYear()}
                {"."}
            </Typography>
        
    );
}

export default Copyright;
