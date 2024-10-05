import { useState } from 'react'
import MapComponent from "./components/MapComponent";
import './App.css'
import axios from "axios";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

/**Views**/
import LandingPage from './components/landing'
import Map from './components/map'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <LandingPage />
    <Map />
     </>
  )
}

export default App
