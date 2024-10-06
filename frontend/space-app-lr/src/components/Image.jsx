import React, { useState } from "react";

const ImageComponent = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageData, setImageData] = useState([]);

    const fetchImage = async () => {
        const dummyData = {
            LON_UL: 12.45,
            LAT_UR: 41.9,
            LON_UR: 12.54,
            LAT_UL: 41.92,
            cloudCoverage: 10,
            bands: "B01,B02,B03,B04,B05",
        };

        const queryString = new URLSearchParams(dummyData).toString();
        const url = `http://localhost:8080/api/landsatImage?${queryString}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl); // Set the imageSrc state
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
        }
    };

    return (
        <div className="image-container">
            <button onClick={fetchImage} className="primary-button">
                Fetch Image
            </button>
            <div className="image-result mt-4 mb-1">
                {imageSrc && <img src={imageSrc} alt="Fetched from backend" />}
            </div>
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
                            <strong> Bands:</strong> {data.bands.join(", ")}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ImageComponent;
