import "./App.css";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import CustomNavBar from "./CustomNavBar";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer";
import Debug from "./pages/Debug";
import Help from "./pages/Help";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        DTX Viewer 2
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Container fixed>
        <CustomNavBar></CustomNavBar>
        {/*Start of Content body*/}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/viewer" element={<Viewer></Viewer>}></Route>
          <Route path="/debug" element={<Debug></Debug>}></Route>
          <Route path="/help" element={<Help></Help>}></Route>
        </Routes>
        <Copyright />
      </Container>
    </BrowserRouter>
  );
}

export default App;
