import { Container, CssBaseline, Grid, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link } from "react-router-dom";
import PageFooter from "../components/PageFooter";

function Home() {
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
                <Container component="main" maxWidth="lg">
                    <Grid container direction="row" justifyContent="space-evenly">
                        <Grid item xs={12}>
                            <Box sx={{ my: 4 }}>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    DTX Viewer Tool
                                </Typography>
                                <Typography variant="body1" component="p" gutterBottom>
                                    DTX Viewer Tool is a pure client-side app that enables users to load .dtx files to
                                    output high resolution HTML5 canvas rendering of Drum/Guitar/Bass charts.
                                </Typography>
                                <Typography variant="body1" component="p" gutterBottom>
                                    Click on <Link to={"/viewer"}>Viewer</Link> to start.
                                </Typography>
                                {/* <ProTip />*/}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
                {/*Common Footer*/}
                <PageFooter></PageFooter>
            </Box>
        </React.Fragment>
    );
}

export default Home;
