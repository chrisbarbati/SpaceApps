import "ol/ol.css";
import React, { useEffect, useRef, useState } from "react";

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

    // Function to update marker position
    const updateMarkerPosition = (coordinate) => {
        if (markerRef.current) {
            markerRef.current.getGeometry().setCoordinates(coordinate);
        }

        const [lng, lat] = toLonLat(coordinate);
        setCoordinates({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    };

    return (
        <div id="main-container">
            <div id="sidebar">
                <h1 className="text-center">Search Location</h1>
                <p className="text-center">Or input Lat/Long manually:</p>
                <form>
    <label>Latitude</label>
    <input
        id="lat-input"
        type="number"
        step="any"
        required
    />
    <label>Longitude</label>
    <input
        id="lng-input"
        type="number"
        step="any"
        required
    />
    <label>Email</label>
    <input
        id="email-input"
        type="email"
    />
    <label>Lead Time</label>
    <input
        id="lead-time-input"
        type="number"
    />
    <button id="go-to-location" type="submit">Go to Location</button>
</form>
            
            </div>

            <div id="map-container">
                <div
                    ref={mapRef}
                    id="map"
                    style={{ width: "60%", height: "500px" }}
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
