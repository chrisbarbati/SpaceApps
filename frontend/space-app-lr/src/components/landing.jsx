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
                    <h2>1</h2>
                    <p>
                        Select a location by entering a name or clicking on the
                        map.
                    </p>
                </article>
                <article className="highlight">
                    <h2>2</h2>
                    <p>Customize your data by selecting bands.</p>
                </article>
                <article className="highlight">
                    <h2>3</h2>
                    <p>View your results.</p>
                </article>
            </div>
        </section>
    );
}

export default LandingPage;
