import { Box, CssBaseline, Container, Typography, useTheme } from "@mui/material";
import React from "react";
import PageFooter from "../components/PageFooter";

function Help() {
    const {
        mixins: { toolbar }
    } = useTheme();

    return (
        <React.Fragment>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: `calc(100vh - (${toolbar?.minHeight}px))`,
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ my: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            About Page
                        </Typography>
                        <Typography variant="body1" component="p" gutterBottom>
                            DTX Viewer Tool is the successor to my older DTXCharter project. It is built using React
                            18 and MUI v5 libraries.
                        </Typography>
                    </Box>
                </Container>
                {/*Common Footer*/}
                <PageFooter></PageFooter>
            </Box>
        </React.Fragment>
    );
}

export default Help;
