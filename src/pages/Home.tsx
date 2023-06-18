import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function Home() {
    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                DTX Viewer Tool
            </Typography>
            What is DTX Viewer Tool?
            {/* <ProTip />*/}
        </Box>
    );
}

export default Home;
