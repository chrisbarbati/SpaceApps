import "ol/ol.css";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { fromLonLat, toLonLat } from "ol/proj";
import { Style, Icon, Stroke, Fill } from "ol/style";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import KML from "ol/format/KML";
import { buffer as bufferExtent } from "ol/extent";

import Bands from "./Bands";
import Analysis from "./Analysis";

const MapComponent = () => {
    // map is used to store the reference to the map object
    // mapRef is used to store the reference to the map container
    const map = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const kmlLayerRef = useRef(null);
    const borderLayerRef = useRef(null);
    const searchBoxRef = useRef(null);
    const [boundingBox, setBoundingBox] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    useEffect(() => {
        if (!mapRef.current) return;
        const sceneCenter = fromLonLat([-79.457808, 44.593214]);

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

        const vectorSource = new VectorSource({
            features: [markerFeature],
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        const kmlLayer = new VectorLayer({
            source: new VectorSource({
                url: "worldwide.kml",
                format: new KML(),
            }),
            opacity: 0,
        });

        kmlLayerRef.current = kmlLayer;

        const borderSource = new VectorSource();
        const borderLayer = new VectorLayer({
            source: borderSource,
            style: new Style({
                stroke: new Stroke({
                    color: "white",
                    width: 2,
                }),
                fill: new Fill({
                    color: "rgba(94, 129, 172, 0.3)",
                }),
            }),
        });
        borderLayerRef.current = borderLayer;

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer,
                kmlLayer,
                borderLayer,
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

        map.current = initialMap;

        const searchBox = new window.google.maps.places.Autocomplete(
            searchBoxRef.current
        );

        searchBox.addListener("place_changed", () => {
            const place = searchBox.getPlace();
            if (!place.geometry) {
                console.log(
                    "No details available for input: '" + place.name + "'"
                );
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setLat(lat.toFixed(6));
            setLng(lng.toFixed(6));

            const newCoordinate = fromLonLat([lng, lat]);
            updateMarkerPosition(newCoordinate);

            map.current.getView().setCenter(newCoordinate);
            map.current.getView().setZoom(14);
        });

        return () => {
            if (map.current) map.current.setTarget(null);
        };
    }, []);

    const updateMarkerPosition = (coordinate) => {
        if (markerRef.current) {
            markerRef.current.getGeometry().setCoordinates(coordinate);
        }

        const [lngValue, latValue] = toLonLat(coordinate);
        setCoordinates({ lat: latValue.toFixed(6), lng: lngValue.toFixed(6) });

        setLat(latValue.toFixed(6));
        setLng(lngValue.toFixed(6));

        displayClosestKmlPoint(coordinate);
    };

    const isPointInPolygon = (point, polygon) => {
        // Extract the x and y coordinates of the point
        const x = point[0],
            y = point[1];
        let inside = false;

        // Loop through each edge of the polygon
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            // Get the coordinates of the current vertex (xi, yi) and the previous vertex (xj, yj)
            const xi = polygon[i][0],
                yi = polygon[i][1];
            const xj = polygon[j][0],
                yj = polygon[j][1];

            // Check if the point is within the y-bounds of the edge
            const intersect =
                yi > y !== yj > y &&
                // Check if the point is to the left of the edge
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

            // If the point is on the left side of the edge, toggle the inside status
            if (intersect) inside = !inside;
        }

        // Return true if the point is inside the polygon, false otherwise
        return inside;
    };

    const displayClosestKmlPoint = (coordinate) => {
        if (!kmlLayerRef.current) return; // if kml layer is loaded

        const kmlFeatures = kmlLayerRef.current.getSource().getFeatures();

        let containingFeature = null;

        for (const feature of kmlFeatures) {
            const coords = feature.getGeometry().flatCoordinates;
            const polygonCoords = [
                [coords[0], coords[1]],
                [coords[3], coords[4]],
                [coords[6], coords[7]],
                [coords[9], coords[10]],
            ];

            if (isPointInPolygon(coordinate, polygonCoords)) {
                containingFeature = feature;
                break;
            }
        }

        if (containingFeature) {
            const coords = containingFeature.getGeometry().flatCoordinates;

            // ----------------- Drawing the Border ----------------- \\

            const polygonCoords = [
                [coords[3], coords[4]],
                [coords[6], coords[7]],
                [coords[9], coords[10]],
                [coords[12], coords[13]],
                [coords[3], coords[4]],
            ];

            const boundingBoxCoords = [
                toLonLat([coords[3], coords[4]]),
                toLonLat([coords[6], coords[7]]),
                toLonLat([coords[9], coords[10]]),
                toLonLat([coords[12], coords[13]]),
                toLonLat([coords[3], coords[4]]),
            ];

            setBoundingBox(boundingBoxCoords);

            const borderPolygon = new Feature({
                geometry: new Polygon([polygonCoords]),
            });

            // Clear previous border and add new one
            borderLayerRef.current.getSource().clear();
            borderLayerRef.current.getSource().addFeature(borderPolygon);

            const extent = containingFeature.getGeometry().getExtent();
            //const bufferedExtent = bufferExtent(extent, extent[2] - extent[0]);
            setTimeout(() => {
                // change extent to bufferedExtent to zoom out a lot more, maybe for 3x3?
                map.current.getView().fit(extent, {
                    padding: [100, 100, 100, 100],
                    duration: 1000, // Animate over 1 second
                });
            }, 0);
        }
    };

    const handleCheckboxChange = (event) => {
        setIsNotificationEnabled(event.target.checked);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const element = document.getElementById("bands-page");
        if (element) {
            element.scrollIntoView();
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLat(latitude.toFixed(6));
                    setLng(longitude.toFixed(6));

                    const newCoordinate = fromLonLat([longitude, latitude]);
                    updateMarkerPosition(newCoordinate);
                    map.current.getView().setCenter(newCoordinate);
                    map.current.getView().setZoom(14);
                },
                (error) => {
                    console.error("Error fetching location", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <>
            <div id="main-container">
                <div className="sidebar">
                    <div className="form-header">
                        <h1 className="text-center pt-4">Search Location</h1>
                        <input
                            id="search-box"
                            ref={searchBoxRef}
                            type="text"
                            placeholder="Search by Name..."
                            className="mb-2"
                        />
                        <div>
                            <button
                                type="button"
                                className="my-4 primary-button"
                                onClick={handleUseCurrentLocation}
                            >
                                Use Current Location
                            </button>
                        </div>
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

                        <button
                            id="submit"
                            className="mtt-4 mt-4 primary-button"
                            type="submit"
                        >
                            Next
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
            <div className="landsart-data-container">
                {/* <ImageComponent /> */}
                <Bands
                    coordinates={coordinates}
                    boundingBoxCoordinates={boundingBox}
                />
            </div>
        </>
    );
};

export default MapComponent;
