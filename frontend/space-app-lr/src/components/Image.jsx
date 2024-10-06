import React, { useState } from "react";
import axios from "axios";

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
            bands: "B01,B02,B03,B04,B05"
        };
      
        const queryString = new URLSearchParams(dummyData).toString();
        const url = `http://localhost:8080/api/landsatImage?${queryString}`;
      
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.src = imageUrl;
          document.body.appendChild(img); // Append the image to the body or handle it as needed
        } catch (error) {
          console.error('There has been a problem with your fetch operation:', error);
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
