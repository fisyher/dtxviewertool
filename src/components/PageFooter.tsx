import { Box, Container, Typography, Link } from "@mui/material";
import Copyright from "./copyright";
import GitHubIcon from "@mui/icons-material/GitHub";


const PageFooter = () => {
    return (
        <Box component="footer" sx={{ mt: "auto", py: 3, px: 2 }}>
            <Container maxWidth="lg">
                <Typography variant="body1">
                    <Link color="inherit" href="https://github.com/fisyher/dtxviewertool">
                        <GitHubIcon></GitHubIcon>
                    </Link>
                </Typography>
                <Copyright />
            </Container>
        </Box>
    );
};

export default PageFooter;
