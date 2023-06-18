import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
    palette: {
        primary: {
            main: "#556cd6"
        },
        secondary: {
            main: "#19857b"
        },
        error: {
            main: red.A400
        },
        mode: "dark"
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: "#fb8c00"
                }
            }
        }
    }
});

export default theme;
