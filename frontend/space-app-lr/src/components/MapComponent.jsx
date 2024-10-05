import "ol/ol.css";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Icon, Stroke, Fill } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";

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

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer,
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

        const [lng, lat] = toLonLat(coordinate);
        setCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        setLat(lat.toFixed(6));
        setLng(lng.toFixed(6));
    };

    const handleCheckboxChange = (event) => {
        setIsNotificationEnabled(event.target.checked);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (lat && lng) {
            // Update marker position only (don't submit form)
            updateMarkerPosition(
                fromLonLat([parseFloat(lng), parseFloat(lat)])
            );
            if (isNotificationEnabled && email && leadTime) {
                // Proceed with form submission and API call when notifications are enabled

                console.log("Form submitted with notification details");
            } else if (!isNotificationEnabled) {
                console.log("Lat/Lng updated without notifications");
            } else {
                console.log("Please fill all required fields");
            }
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

                        {isNotificationEnabled && (
                            <>
                                <label>Email</label>
                                <input
                                    id="email-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required={isNotificationEnabled}
                                />
                                <label>Lead Time</label>
                                <input
                                    id="lead-time-input"
                                    type="number"
                                    value={leadTime}
                                    onChange={(e) =>
                                        setLeadTime(e.target.value)
                                    }
                                    required={isNotificationEnabled}
                                />
                            </>
                        )}
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
                {coordinates && (
                    <p id="coordinates" className="pt-2">
                        Coordinates: Latitude: {coordinates.lat}, Longitude:{" "}
                        {coordinates.lng}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MapComponent;
