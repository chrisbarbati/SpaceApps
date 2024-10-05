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

const MapComponent = () => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [email, setEmail] = useState("");
    const [leadTime, setLeadTime] = useState("");
    const [cloudCoverage, setCloudCoverage] = useState(0); // Default to 0

    const callApiTest = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/test");
            if (response.data) {
                console.log("Response from server", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch", error);
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
        });

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
        console.log("1");
        if (!kmlLayer) return;
        console.log("2");

        let closestFeature = null;
        let minDistance = Infinity;

        kmlLayer.forEachFeature((feature) => {
            const featureCoord = feature.getGeometry().getCoordinates();
            const distance = getDistance(coordinate, featureCoord);
            console.log("thing running");
            if (distance < minDistance) {
                minDistance = distance;
                closestFeature = feature;
                console.log("closest found");
            }
        });

        if (closestFeature) {
            // Optionally, adjust styling of the closest feature here if needed
            console.log("Closest KML feature:", closestFeature);

            // Clear existing KML features and add only the closest one
            kmlLayer.clear();
            kmlLayer.addFeature(closestFeature);
        }
    };

    const handleCheckboxChange = (event) => {
        setIsNotificationEnabled(event.target.checked);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Form submitted!");

        // Ensure lat and lng are filled
        if (lat && lng) {
            console.log("Latitude and Longitude are filled:", lat, lng);

            updateMarkerPosition(
                fromLonLat([parseFloat(lng), parseFloat(lat)])
            );

            if (isNotificationEnabled && email && leadTime) {
                const formData = {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    email: email,
                    leadTime: parseInt(leadTime),
                    boundingBox: 12.44693,
                    cloudCoverage: cloudCoverage,
                };

                console.log(
                    "Form Data before submission:",
                    JSON.stringify(formData, null, 2)
                );

                try {
                    const response = await axios.post(
                        "http://localhost:8080/api/addEmailNotification",
                        formData,
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    console.log("Form submitted successfully:", response.data);
                } catch (error) {
                    console.error("Error submitting the form:", error);
                    if (error.response) {
                        console.error("Response data:", error.response.data);
                    }
                }
            } else {
                console.log("Please fill all required fields");
            }
        } else {
            console.log("Latitude and Longitude are not filled");
        }
    };

    return (
        <div id="main-container">
            <div id="sidebar">
                <div className="form-header">
                    <h1 className="text-center">Search Location</h1>
                    <input
                        id="search-box"
                        type="text"
                        placeholder="Search by Name..."
                        className="mb-2"
                    />
                    <p className="text-center">Or input Lat/Long manually:</p>
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
                                Receive a notification for selected location?
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
                                onChange={(e) => setLeadTime(e.target.value)}
                                required={isNotificationEnabled}
                                className="styled-select fade-input"
                            >
                                <option value="2">2 Hours</option>
                                <option value="6">6 Hours</option>
                                <option value="12">12 Hours</option>
                                <option value="24">24 Hours</option>
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
                        </div>
                    </div>

                    <button id="submit" className="mt-4" type="submit">
                        Submit
                    </button>
                </form>
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
    );
};

export default MapComponent;
