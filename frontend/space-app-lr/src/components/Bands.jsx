import React, { useEffect, useState } from "react";
import axios from "axios";
import Analysis from "./Analysis";

const bandInfo = [
    {
        id: "B0",
        label: "Coastal/Aerosol",
        description: `Wavelength: 0.43 – 0.45 µm (in the blue spectrum). Use Cases: Water Penetration, Aerosol Detection.`,
    },
    {
        id: "B1",
        label: "Blue Band",
        description: `Wavelength: 0.45 – 0.51 µm (blue spectrum). Use Cases: Water Body Mapping, Atmospheric Correction, Vegetation Analysis.`,
    },
    {
        id: "B2",
        label: "Green Band",
        description: `Wavelength: 0.52 – 0.60 µm (green spectrum). Use Cases: Vegetation Health, Soil/Water Differentiation, Urban Areas.`,
    },
    {
        id: "B3",
        label: "Red Band",
        description: `Wavelength: 0.63 – 0.68 µm (red spectrum). Use Cases: Vegetation Analysis, Soil and Urban Areas.`,
    },
    {
        id: "B4",
        label: "Near-Infrared (NIR)",
        description: `Wavelength: 0.85 – 0.88 µm (infrared spectrum). Use Cases: Vegetation Health, Water Body Mapping.`,
    },
    {
        id: "B5",
        label: "Shortwave Infrared 1 (SWIR 1)",
        description: `Wavelength: 1.57 – 1.65 µm (infrared spectrum). Use Cases: Soil and Vegetation Moisture, Burn Severity.`,
    },
    {
        id: "B6",
        label: "Shortwave Infrared 2 (SWIR 2)",
        description: `Wavelength: 2.11 – 2.29 µm (infrared spectrum). Use Cases: Moisture Content, Thermal Sensitivity.`,
    },
    {
        id: "B7",
        label: "Panchromatic (Pan) Band",
        description: `Wavelength: 0.50 – 0.68 µm (visible spectrum, all colors combined). Use Cases: Higher Resolution Imagery, Urban Areas.`,
    },
    {
        id: "B8",
        label: "Thermal Infrared 1 (TIR 1)",
        description: `Wavelength: 10.6 – 11.19 µm (thermal infrared spectrum). Use Cases: Surface Temperature.`,
    },
    {
        id: "B9",
        label: "Thermal Infrared 2 (TIR 2)",
        description: `Wavelength: 11.50 – 12.51 µm (thermal infrared spectrum). Use Cases: Surface Temperature, Volcanic and Heat Analysis.`,
    },
    {
        id: "B10",
        label: "Cirrus Band",
        description: `Wavelength: 1.36 – 1.38 µm (infrared spectrum). Use Cases: Cloud Detection.`,
    },
];

function Bands({ coordinates, boundingBoxCoordinates }) {
    console.log(coordinates);
    console.log(boundingBoxCoordinates);
    const [bands, setBands] = useState(() => {
        return bandInfo.reduce((acc, band) => {
            acc[band.id] = false;
            return acc;
        }, {});
    });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [imageSize, setImageSize] = useState("3x3");
    const [cloudCoverage, setCloudCoverage] = useState(0);
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
    const [data, setData] = useState(false);

    // response states
    const [imageResponse, setimageResponse] = useState(null);
    const [dataResponse, setdataResponse] = useState(null);

    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        setBands((prev) => ({ ...prev, [id]: checked }));
    };

    const getLandsetData = async () => {
        try {
            console.log("Fetching landsat data...");
            // const response = await axios.get(
            //     "http://localhost:8080/api/landsatData"
            // );
            const response = await fetch("/example.json"); // Adjust the filename as needed
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const jsonData = await response.json();
            setData(jsonData);
            return jsonData;
        } catch (error) {
            console.log("Failed to fetch landset data", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // if (imageSize === "3x3") {
        //     const imageResponse = await axios.get(
        //         "http://localhost:8080/api/landsat3x3",
        //         {
        //             params: {
        //                 coordinates: coordinates,
        //                 boundingBoxCoordinates: boundingBoxCoordinates,
        //                 startDate: startDate,
        //                 endDate: endDate,
        //                 imageSize: imageSize,
        //                 cloudCoverage: cloudCoverage,
        //             },
        //             headers: { "Content-Type": "application/json" },
        //         }
        //     );
        //     setimageResponse(imageResponse);
        // } else if (imageSize === "full") {
        //     const imageResponse = await axios.get(
        //         "http://localhost:8080/api/landsatImage",
        //         {
        //             params: {
        //                 boundingBoxCoordinates: boundingBoxCoordinates,
        //                 startDate: startDate,
        //                 endDate: endDate,
        //                 imageSize: imageSize,
        //                 cloudCoverage: cloudCoverage,
        //             },
        //             headers: { "Content-Type": "application/json" },
        //         }
        //     );
        //     setimageResponse(imageResponse);
        // }
        // const dataResponse = await axios.get(
        //     "http://localhost:8080/api/landsatData",
        //     {
        //         params: {
        //             boundingBoxCoordinates: boundingBoxCoordinates,
        //             startDate: startDate,
        //             endDate: endDate,
        //             imageSize: imageSize,
        //             cloudCoverage: cloudCoverage,
        //         },
        //         headers: { "Content-Type": "application/json" },
        //     }
        // );
        // setdataResponse(dataResponse);
        console.log("Fetching landsat data...");
        const landsatData = await getLandsetData();
        console.log("Landsat Data:", landsatData);
        setIsAnalysisVisible(true);
    };

    return (
        <>
            <div className="bands-container" id="bands-page">
                <div className="sidebar">
                    <div className="form-header">
                        <h2>Filters</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="styled-date"
                            />
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className="styled-date"
                            />
                        </label>
                        <label>Pick the Image Size</label>
                        <select
                            id="image-size-selector"
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value)}
                            required
                            className="styled-select fade-input"
                        >
                            <option value="3x3">3x3</option>
                            <option value="full">Full</option>
                        </select>
                        <div className="slider-container">
                            <label>Cloud Coverage: {cloudCoverage}%</label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={cloudCoverage}
                                onChange={(e) =>
                                    setCloudCoverage(Number(e.target.value))
                                }
                                className="slider"
                            />
                        </div>
                        <button type="submit" className="primary-button mt-4">
                            Fetch Data
                        </button>
                    </form>
                </div>
                <div className="bands-control-container">
                    <div className="bands-header mt-2 text-center pt-2 pb-2">
                        <h3>Choose Your Desired Landsat Bands:</h3>
                        <p>
                            Hover over each card to view detailed descriptions.
                        </p>
                    </div>
                    <div className="bands-grid">
                        {bandInfo.map((band) => (
                            <div key={band.id} className="band-card">
                                <div className="band-card-inner">
                                    <div className="band-card-front">
                                        <label>{band.label}</label>
                                    </div>
                                    <div className="band-card-back">
                                        <p>{band.description}</p>
                                    </div>
                                </div>
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        id={band.id}
                                        checked={bands[band.id] || false}
                                        onChange={handleCheckboxChange}
                                        className="band-checkbox"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {isAnalysisVisible && <Analysis data={data} />}
        </>
    );
}

export default Bands;
