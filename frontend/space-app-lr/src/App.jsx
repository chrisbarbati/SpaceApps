import { useState } from 'react'
import MapComponent from "./components/MapComponent";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <MapComponent />
     </>
  )
}

export default App
