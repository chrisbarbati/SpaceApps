import React, { useState } from "react";
import axios from "axios";

const LocationForm = ({
    lat,
    setLat,
    lng,
    setLng,
    updateMarkerPosition,
    getLandsetData,
}) => {
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [email, setEmail] = useState("");
    const [leadTime, setLeadTime] = useState("2");
    const [cloudCoverage, setCloudCoverage] = useState(0);
    const [formMessage, setFormMessage] = useState("");

    const handleCheckboxChange = (event) => {
        setIsNotificationEnabled(event.target.checked);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormMessage("");

        if (lat && lng && (!isNotificationEnabled || (email && leadTime))) {
            updateMarkerPosition([parseFloat(lng), parseFloat(lat)]);

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

                try {
                    const response = await axios.post(
                        "http://localhost:8080/api/addEmailNotification",
                        formData,
                        { headers: { "Content-Type": "application/json" } }
                    );
                    setFormMessage("Form submitted!");
                } catch (error) {
                    setFormMessage("Form submission failed. Please try again.");
                }
            } else {
                setFormMessage("Form submitted without notifications.");
            }

            await getLandsetData();
        } else {
            setFormMessage("Please fill all required fields.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Latitude</label>
            <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
            />
            <label>Longitude</label>
            <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
            />
            <div className="email-container">
                <div className="notify-checkbox">
                    <label>Receive a notification?</label>
                    <input type="checkbox" onChange={handleCheckboxChange} />
                </div>

                {isNotificationEnabled && (
                    <>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Lead Time</label>
                        <select
                            value={leadTime}
                            onChange={(e) => setLeadTime(e.target.value)}
                            required
                        >
                            <option value="2">2 Hours</option>
                            <option value="6">6 Hours</option>
                            <option value="12">12 Hours</option>
                            <option value="24">24 Hours</option>
                        </select>
                        <label>Cloud Coverage: {cloudCoverage}%</label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={cloudCoverage}
                            onChange={(e) =>
                                setCloudCoverage(Number(e.target.value))
                            }
                        />
                    </>
                )}
            </div>

            <button type="submit">Submit</button>
            <p>{formMessage}</p>
        </form>
    );
};

export default LocationForm;
