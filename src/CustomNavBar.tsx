import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Help from "@mui/icons-material/Help";
import { useNavigate } from "react-router-dom";

function CustomNavBar() {
    const navigate = useNavigate();
    return (
        <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar color="primary">
                <Typography
                    component="h1"
                    variant="h6"
                    color="inherit"
                    noWrap
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => {
                        navigate("/");
                    }}
                >
                    DTX Viewer Tool
                </Typography>
                <Button
                    color="inherit"
                    onClick={() => {
                        navigate("/");
                    }}
                >
                    Home
                </Button>
                <Button
                    color="inherit"
                    onClick={() => {
                        navigate("/viewer");
                    }}
                >
                    Viewer
                </Button>
                <Button
                    color="inherit"
                    onClick={() => {
                        navigate("/debug");
                    }}
                >
                    Debug
                </Button>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="help"
                    sx={{ mr: 2 }}
                    onClick={() => {
                        navigate("/help");
                    }}
                >
                    <Help />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

export default CustomNavBar;
