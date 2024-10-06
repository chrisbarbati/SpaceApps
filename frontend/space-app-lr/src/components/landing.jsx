import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <section className="landing-container">
            <div className="landing-header">
                <h1 className="text-center pt-4">Space Apps Challenge 2024</h1>
                <p className="text-center subtitle">
                    Explore Earth from Space: Compare Ground-Based Observations
                    with Landsat Data
                </p>
                <button className="primary-button">Get Started</button>
            </div>
            <div className="landing-highlights">
                <article className="highlight">
                    <h2>Real-Time Satellite Overpass Notifications</h2>
                    <p>
                        Stay informed with timely alerts about upcoming Landsat
                        satellite overpasses at your defined locations,
                        empowering you to capture crucial data for your research
                        or projects.
                    </p>
                </article>
                <article className="highlight">
                    <h2>Interactive Map and Data Visualization</h2>
                    <p>
                        Easily visualize satellite data on an interactive map.
                        Compare Landsat Surface Reflectance data with
                        ground-based observations to enhance your understanding
                        of environmental changes.
                    </p>
                </article>
                <article className="highlight">
                    <h2>Download and Share Valuable Insights</h2>
                    <p>
                        Download detailed Landsat data and share your findings
                        with the community. Collaborate and engage with fellow
                        users to deepen your exploration of Earth's landscapes.
                    </p>
                </article>
            </div>
        </section>
    );
}

export default LandingPage;
