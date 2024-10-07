import React, { useEffect, useState } from "react";
import axios from "axios";
import Analysis from "./Analysis";

const domain = "chrisbarbati.ddns.net:8082";

const bandInfo = [
    {
        id: "B01",
        label: "Coastal/Aerosol",
        description: `Wavelength: 0.43 – 0.45 µm (in the blue spectrum). Use Cases: Water Penetration, Aerosol Detection.`,
    },
    {
        id: "B02",
        label: "Blue Band",
        description: `Wavelength: 0.45 – 0.51 µm (blue spectrum). Use Cases: Water Body Mapping, Atmospheric Correction, Vegetation Analysis.`,
    },
    {
        id: "B03",
        label: "Green Band",
        description: `Wavelength: 0.52 – 0.60 µm (green spectrum). Use Cases: Vegetation Health, Soil/Water Differentiation, Urban Areas.`,
    },
    {
        id: "B04",
        label: "Red Band",
        description: `Wavelength: 0.63 – 0.68 µm (red spectrum). Use Cases: Vegetation Analysis, Soil and Urban Areas.`,
    },
    {
        id: "B05",
        label: "Near-Infrared (NIR)",
        description: `Wavelength: 0.85 – 0.88 µm (infrared spectrum). Use Cases: Vegetation Health, Water Body Mapping.`,
    },
    {
        id: "B06",
        label: "Shortwave Infrared 1 (SWIR 1)",
        description: `Wavelength: 1.57 – 1.65 µm (infrared spectrum). Use Cases: Soil and Vegetation Moisture, Burn Severity.`,
    },
    {
        id: "B07",
        label: "Shortwave Infrared 2 (SWIR 2)",
        description: `Wavelength: 2.11 – 2.29 µm (infrared spectrum). Use Cases: Moisture Content, Thermal Sensitivity.`,
    },
    {
        id: "B08",
        label: "Panchromatic (Pan) Band",
        description: `Wavelength: 0.50 – 0.68 µm (visible spectrum, all colors combined). Use Cases: Higher Resolution Imagery, Urban Areas.`,
    },
    {
        id: "B09",
        label: "Thermal Infrared 1 (TIR 1)",
        description: `Wavelength: 10.6 – 11.19 µm (thermal infrared spectrum). Use Cases: Surface Temperature.`,
    },
    {
        id: "B10",
        label: "Thermal Infrared 2 (TIR 2)",
        description: `Wavelength: 11.50 – 12.51 µm (thermal infrared spectrum). Use Cases: Surface Temperature, Volcanic and Heat Analysis.`,
    }
];

function Bands({ coordinates, boundingBoxCoordinates }) {
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
    const [nextFlyOverTime, setNextFlyOverTime] = useState("");


    // response states
    const [imageResponse, setimageResponse] = useState(null);
    const [dataResponse, setdataResponse] = useState(null);

    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        setBands((prev) => ({ ...prev, [id]: checked }));
        console.log(bands);
    };

    const handleSubmit = async (event) => {

        //Iterate over all properties of the bands state object
        const selectedBands = Object.keys(bands).filter((bandId) => bands[bandId]);

        let selectedBandsCSV = ""

        //For each value in selectedBands, concatenate into selectedBandsCSV
        selectedBands.forEach((band) => {
            selectedBandsCSV += band + ","
        });

        //Trim the trailing comma
        selectedBandsCSV = selectedBandsCSV.substring(0, selectedBandsCSV.length - 1);

        if (selectedBandsCSV === "") {
            selectedBandsCSV = "B01,B02,B03,B04,B05"
        }

        console.log(selectedBandsCSV);

        //console.log("Bounding Box Coordinates:");
        //console.log(boundingBoxCoordinates.minLon.toString());
        event.preventDefault();
        if (imageSize === "3x3") {
            const imageResponse = await axios
                .get("http://" + domain + "/api/landsat3x3", {
                    params: {
                        latitude: coordinates.lat,
                        longitude: coordinates.lng,
                        LON_UL: boundingBoxCoordinates.minLon.toString(),
                        LAT_UR: boundingBoxCoordinates.minLat.toString(),
                        LON_UR: boundingBoxCoordinates.maxLon.toString(),
                        LAT_UL: boundingBoxCoordinates.maxLat.toString(),
                        startDate: startDate,
                        endDate: endDate,
                        bands: selectedBandsCSV,
                        cloudCoverage: cloudCoverage,
                    },
                    headers: { "Content-Type": "image/png" },
                    responseType: "blob",
                })
                .then((response) => {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        setimageResponse(reader.result); // base64 encoded string
                    };
                    reader.readAsDataURL(response.data); // Convert the blob to base64
                })
                .catch((error) =>
                    console.error("Error fetching image:", error)
                );
        } else if (imageSize === "full") {
            // console.log("Fetching full image...");
            const imageResponse = await axios
                .get("http://" + domain + "/api/landsatImage", {
                    params: {
                        LON_UL: boundingBoxCoordinates.minLon.toString(),
                        LAT_UR: boundingBoxCoordinates.minLat.toString(),
                        LON_UR: boundingBoxCoordinates.maxLon.toString(),
                        LAT_UL: boundingBoxCoordinates.maxLat.toString(),
                        startDate: startDate,
                        endDate: endDate,
                        bands: selectedBandsCSV,
                        cloudCoverage: cloudCoverage,
                    },
                    headers: { "Content-Type": "image/png" },
                    responseType: "blob",
                })
                .then((response) => {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        setimageResponse(reader.result); // base64 encoded string
                    };
                    reader.readAsDataURL(response.data); // Convert the blob to base64
                })
                .catch((error) =>
                    console.error("Error fetching image:", error)
                );

            // console.log("Image Response retrieved");
            // console.log("Image Response:");
            // console.log(imageResponse);
        }
        console.log("Fetching landsat data...");
        const dataResponse = await axios.get(
            "http://" + domain + "/api/landsatData",
            {
                params: {
                    LON_UL: boundingBoxCoordinates.minLon.toString(),
                    LAT_UR: boundingBoxCoordinates.minLat.toString(),
                    LON_UR: boundingBoxCoordinates.maxLon.toString(),
                    LAT_UL: boundingBoxCoordinates.maxLat.toString(),
                    startDate: startDate,
                    endDate: endDate,
                    cloudCoverage: cloudCoverage,
                    bands: selectedBandsCSV,
                },
                headers: { "Content-Type": "application/json" },
            }
        );
        setdataResponse(dataResponse);
        // console.log("Data Response:");
        // console.log(dataResponse);
        setIsAnalysisVisible(true);
        const element = document.getElementById("analysis-page");
        if (element) {
            element.scrollIntoView();
        }
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
            {isAnalysisVisible && (
                <Analysis data={dataResponse} imageResponse={imageResponse} />
            )}
        </>
    );
}

export default Bands;
