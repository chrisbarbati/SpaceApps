import { useState } from "react";
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
import LandingPage from "./components/Landing";
import MapComponent from "./components/MapComponent";
import Analysis from "./components/Analysis";

function App() {
    const [count, setCount] = useState(0);

    return (
        <main>
            <LandingPage />
            <MapComponent />
            <Analysis />
        </main>
    );
}

export default App;
