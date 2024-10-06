import React, { useState } from "react";
import axios from "axios";

const ImageComponent = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageData, setImageData] = useState([]);

    const fetchImage = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/LandsatImage",
                {
                    headers: { "Content-Type": "application/json" },
                    responseType: "arraybuffer",
                }
            );
            const blob = new Blob([response.data], { type: "image/png" });
            const url = URL.createObjectURL(blob);
            setImageSrc(url);

            // Set dummy data for image parameters
            const dummyData = [
                {
                    lonUL: -12.44,
                    latUL: 41.92,
                    lonUR: 12.54,
                    latUR: 41.87,
                    maxCloudCoverage: 100,
                    bands: ["B01", "B02", "BO3", "B04"],
                },
            ];
            setImageData(dummyData);
        } catch (error) {
            console.error("Error fetching image:", error);
        }
    };

    return (
        <div>
            <button onClick={fetchImage}>Fetch Image</button>
            {imageSrc && <img src={imageSrc} alt="Fetched from backend" />}
            {imageData.length > 0 && (
                <ul>
                    {imageData.map((data, index) => (
                        <li key={index}>
                            <strong>Lon-UL:</strong> {data.lonUL},
                            <strong> Lat-UL:</strong> {data.latUL},
                            <strong> Lon-UR:</strong> {data.lonUR},
                            <strong> Lat-UR:</strong> {data.latUR},
                            <strong> Max Cloud Coverage:</strong>{" "}
                            {data.maxCloudCoverage}%,
                            <strong> Bonds:</strong> {data.bonds.join(", ")}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ImageComponent;
