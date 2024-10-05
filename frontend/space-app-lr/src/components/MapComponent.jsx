// import ol css
import "ol/ol.css";

//
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Icon, Stroke, Fill } from "ol/style";

// Importing necessary OpenLayers components
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";

const MapComponent = () => {
    // Reference for the map container
    const mapRef = useRef(null);

    // State to hold the map instance
    const [map, setMap] = useState(null);

    // State to hold coordinates
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        // Scene center coordinates
        const sceneCenter = fromLonLat([-79.457808, 44.593214]);

        // Corner coordinates for the white border, proof of concept for future use to show where the landsat data will sit
        const corners = [
            fromLonLat([-61.99896, 51.35789]), // Upper Left
            fromLonLat([-58.67466, 51.28223]), // Upper Right
            fromLonLat([-58.8617, 49.17268]), // Lower Right
            fromLonLat([-62.04239, 49.2429]), // Lower Left
        ];

        // Create a marker for the scene center
        const markerFeature = new Feature({
            geometry: new Point(sceneCenter),
        });

        const markerStyle = new Style({
            image: new Icon({
                src: "/marker.png", // Marker icon
                scale: 0.05,
            }),
        });

        markerFeature.setStyle(markerStyle);

        // Create the polygon feature (white border)
        const polygonFeature = new Feature({
            geometry: new Polygon([corners]),
        });

        const polygonStyle = new Style({
            stroke: new Stroke({
                color: "white", // White border
                width: 2,
            }),
            fill: new Fill({
                color: "rgba(255, 255, 255, 0)", // Transparent fill
            }),
        });

        polygonFeature.setStyle(polygonStyle);

        // Vector source for marker and polygon
        const vectorSource = new VectorSource({
            features: [markerFeature, polygonFeature],
        });

        // Vector layer for marker and polygon
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        // Initialize the map
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

        // Add click event to update marker
        initialMap.on("singleclick", (event) => {
            const coordinate = event.coordinate;
            updateMarkerPosition(coordinate);
        });

        setMap(initialMap);

        return () => initialMap.setTarget(null); // Cleanup on unmount
    }, []);

    // Function to update marker position
    const updateMarkerPosition = (coordinate) => {
        const markerFeature = new Feature({
            geometry: new Point(coordinate),
        });

        // Display coordinates in a readable format
        const [lng, lat] = toLonLat(coordinate);
        setCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    };

    return (
        <div id="main-container">
            <div id="sidebar">
                <h1>Search Location</h1>
                <p>Or input Lat/Long manually:</p>
                <input
                    id="lat-input"
                    type="number"
                    step="any"
                    placeholder="Enter Latitude"
                />
                <input
                    id="lng-input"
                    type="number"
                    step="any"
                    placeholder="Enter Longitude"
                />
                <button id="go-to-location">Go to Location</button>
            </div>

            <div id="map-container">
                <div
                    ref={mapRef}
                    id="map"
                    style={{ width: "60%", height: "500px" }}
                ></div>
                {coordinates && (
                    <p id="coordinates">
                        Coordinates: Latitude: {coordinates.lat}, Longitude:{" "}
                        {coordinates.lng}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MapComponent;
