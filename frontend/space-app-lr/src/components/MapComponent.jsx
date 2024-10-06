import "ol/ol.css";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Map, View } from "ol";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Icon, Stroke, Fill } from "ol/style";
import { getDistance } from "ol/sphere";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import KML from "ol/format/KML";

import ImageComponent from "./Image";

const MapComponent = () => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const kmlLayerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [email, setEmail] = useState("");
    const [leadTime, setLeadTime] = useState("2"); // Default to 2 Hours
    const [cloudCoverage, setCloudCoverage] = useState(0); // Default to 0
    const [formMessage, setFormMessage] = useState(""); // Track form status

    const getLandsetData = async () => {
        try {
            console.log("Fetching landsat data...");
            const response = await axios.get(
                "http://localhost:8080/api/getLandsetData"
            );

            if (response.data) {
                // Destructuring the response data to extract needed properties
                const { cloudCoverage, boundingBox, name, bands } =
                    response.data;
                const { minLat, minLng, maxLat, maxLng } = boundingBox;
                // Logging the values
                console.log("Cloud Coverage:", cloudCoverage);
                console.log("Bounding Box:", {
                    minLat,
                    minLng,
                    maxLat,
                    maxLng,
                });
                console.log("Name:", name);

                return {
                    cloudCoverage,
                    boundingBox: [minLat, minLng, maxLat, maxLng], // Returning as an array
                    name,
                };
            }
        } catch (error) {
            console.log("Failed to fetch landset data", error);
        }
    };

    useEffect(() => {
        const sceneCenter = fromLonLat([-79.457808, 44.593214]);

        const corners = [
            fromLonLat([-61.99896, 51.35789]),
            fromLonLat([-58.67466, 51.28223]),
            fromLonLat([-58.8617, 49.17268]),
            fromLonLat([-62.04239, 49.2429]),
        ];

        const markerFeature = new Feature({
            geometry: new Point(sceneCenter),
        });

        const markerStyle = new Style({
            image: new Icon({
                src: "/marker.png",
                scale: 0.05,
            }),
        });

        markerFeature.setStyle(markerStyle);
        markerRef.current = markerFeature;

        const polygonFeature = new Feature({
            geometry: new Polygon([corners]),
        });

        const polygonStyle = new Style({
            stroke: new Stroke({
                color: "white",
                width: 2,
            }),
            fill: new Fill({
                color: "rgba(255, 255, 255, 0)",
            }),
        });

        polygonFeature.setStyle(polygonStyle);

        const vectorSource = new VectorSource({
            features: [markerFeature, polygonFeature],
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        const kmlLayer = new VectorLayer({
            source: new VectorSource({
                url: "centers.kml",
                format: new KML(),
            }),
            style: new Style({}),
        });

        kmlLayerRef.current = kmlLayer;

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer,
                kmlLayer,
            ],
            view: new View({
                center: sceneCenter,
                zoom: 14,
            }),
        });

        initialMap.on("singleclick", (event) => {
            const coordinate = event.coordinate;
            updateMarkerPosition(coordinate);
        });

        setMap(initialMap);

        return () => initialMap.setTarget(null);
    }, []);

    const updateMarkerPosition = (coordinate) => {
        if (markerRef.current) {
            markerRef.current.getGeometry().setCoordinates(coordinate);
        }

        const [lngValue, latValue] = toLonLat(coordinate);
        setCoordinates({ lat: latValue.toFixed(6), lng: lngValue.toFixed(6) });

        // Update the form inputs with new values
        setLat(latValue.toFixed(6));
        setLng(lngValue.toFixed(6));

        // Call displayClosestKmlPoint to update the closest KML point
        displayClosestKmlPoint(coordinate);
    };

    const displayClosestKmlPoint = (coordinate) => {
        if (!kmlLayerRef.current) return; // if kml layer is loaded

        const kmlFeatures = kmlLayerRef.current.getSource().getFeatures(); // Get KML features
        console.log("KML Features:", kmlFeatures);
        let closestFeature = null;
        let closestDistance = Infinity;

        const emptyStyle = new Style({});
        kmlFeatures.forEach((feature) => {
            feature.setStyle(emptyStyle);
        });

        kmlFeatures.forEach((feature) => {
            const geom = feature.getGeometry();
            if (
                getDistance(
                    toLonLat(coordinate),
                    toLonLat(geom.getCoordinates())
                ) < closestDistance
            ) {
                closestDistance = getDistance(
                    toLonLat(coordinate),
                    toLonLat(geom.getCoordinates())
                );
                closestFeature = feature;
            }
        });

        if (closestFeature) {
            closestFeature.setStyle(
                new Style({
                    image: new Icon({
                        src: "ylw-diamond.png", // You can use a custom icon for the closest point
                        scale: 0.4, // Make the closest point larger or distinct
                    }),
                })
            );
        }
    };

    const handleCheckboxChange = (event) => {
        setIsNotificationEnabled(event.target.checked);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormMessage("");
        console.log("Form submitted!");

        console.log("Latitude: ", lat);
        console.log("Longitude: ", lng);
        console.log("Notification enabled: ", isNotificationEnabled);
        console.log("Email: ", email);
        console.log("Lead Time: ", leadTime);
        console.log("Cloud Coverage: ", cloudCoverage);

        // Ensure all fields are filled
        if (lat && lng && (!isNotificationEnabled || (email && leadTime))) {
            console.log("All required fields are filled");

            // Update the marker position
            updateMarkerPosition(
                fromLonLat([parseFloat(lng), parseFloat(lat)])
            );

            if (isNotificationEnabled) {
                const formData = {
                    email,
                    leadTime: parseInt(leadTime),
                    boundingBox: {
                        minLat: 12.44693,
                        minLng: 10.12345,
                        maxLat: 15.6789,
                        maxLng: 14.56789,
                    },
                    cloudCoverage,
                };

                console.log(
                    "Form Data before submission:",
                    JSON.stringify(formData, null, 2)
                );

                try {
                    const response = await axios.post(
                        "http://localhost:8080/api/addEmailNotification",
                        formData,
                        { headers: { "Content-Type": "application/json" } }
                    );

                    console.log("Form submitted successfully:", response.data);
                    setFormMessage("Form submitted!");
                } catch (error) {
                    console.error(
                        "Error submitting the form:",
                        error.response ? error.response.data : error
                    );
                    setFormMessage("Form submission failed. Please try again.");
                }
            } else {
                setFormMessage("Form submitted without notifications.");
            }

            // Fetch landsat data
            console.log("Fetching landsat data...");
            const landsatData = await getLandsetData();
            console.log("Landsat Data:", landsatData);
        } else {
            console.log("Please fill all required fields");
            setFormMessage("Please fill all required fields.");
        }
    };

    return (
        <>
            <div id="main-container">
                <div id="sidebar">
                    <div className="form-header">
                        <h1 className="text-center pt-4">Search Location</h1>
                        <input
                            id="search-box"
                            type="text"
                            placeholder="Search by Name..."
                            className="mb-2"
                        />
                        <p className="text-center">
                            Or input Lat/Long manually:
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label>Latitude</label>
                        <input
                            id="lat-input"
                            type="number"
                            step="any"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            required
                        />
                        <label>Longitude</label>
                        <input
                            id="lng-input"
                            type="number"
                            step="any"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            required
                        />
                        <div className="email-container">
                            <div className="notify-checkbox">
                                <label className="me-2">
                                    Receive a notification for selected
                                    location?
                                </label>
                                <input
                                    type="checkbox"
                                    onChange={handleCheckboxChange}
                                />
                            </div>

                            <div
                                className={`fade ${
                                    isNotificationEnabled ? "show" : ""
                                }`}
                            >
                                <label className="fade-label">Email</label>
                                <input
                                    id="email-input"
                                    className="fade-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required={isNotificationEnabled}
                                />
                                <label className="fade-label">Lead Time</label>
                                <select
                                    id="lead-time-input"
                                    value={leadTime}
                                    onChange={(e) =>
                                        setLeadTime(e.target.value)
                                    }
                                    required={isNotificationEnabled}
                                    className="styled-select fade-input"
                                >
                                    <option value="2">2 Hours</option>
                                    <option value="6">6 Hours</option>
                                    <option value="12">12 Hours</option>
                                    <option value="24">24 Hours</option>
                                </select>
                                <div className="slider-container">
                                    <label>
                                        Cloud Coverage: {cloudCoverage}%
                                    </label>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={cloudCoverage}
                                        onChange={(e) =>
                                            setCloudCoverage(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="slider"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            id="submit"
                            className="mtt-4 mt-4"
                            type="submit"
                        >
                            Submit
                        </button>
                    </form>
                    <p className="form-message mt-2 text-center">
                        {formMessage}
                    </p>
                </div>

                <div id="map-container">
                    <div
                        ref={mapRef}
                        id="map"
                        style={{
                            width: "100%",
                            maxWidth: "1200px",
                            height: "600px",
                            border: "2px solid white",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                        }}
                    ></div>
                </div>
            </div>
            <ImageComponent />
        </>
    );
};

export default MapComponent;
