import { useState } from "react";
import MapComponent from "./components/MapComponent";
import "./App.css";
import axios from "axios";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

/**Views**/
import LandingPage from "./components/landing";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <LandingPage />
            <MapComponent />
        </>
    );
}

export default App;
