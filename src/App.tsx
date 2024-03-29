import Container from "@mui/material/Container";
import CustomNavBar from "./CustomNavBar";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer";
import Debug from "./pages/Debug";
import Help from "./pages/Help";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <CustomNavBar></CustomNavBar>
            <Container maxWidth={false}>
                {/*Start of Content body*/}

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/viewer" element={<Viewer></Viewer>}></Route>
                    <Route path="/debug" element={<Debug></Debug>}></Route>
                    <Route path="/help" element={<Help></Help>}></Route>
                </Routes>
                {/* <Copyright /> */}
            </Container>
        </BrowserRouter>
    );
}

export default App;
