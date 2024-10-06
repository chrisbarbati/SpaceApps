import React, { useMemo, useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "../assets/css/analysisStyles.css";

const ChartJsScatterPlot = ({ bandData, bandName }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");

        const scatterData = bandData.map((item, index) => ({
            x: index,
            y: item.stats.mean,
        }));

        const { slope, intercept } = calculateLineOfBestFit(scatterData);

        const lineData = [
            { x: 0, y: intercept },
            {
                x: scatterData.length - 1,
                y: slope * (scatterData.length - 1) + intercept,
            },
        ];

        const lineColor =
            slope >= 0 ? "rgba(75, 192, 75, 1)" : "rgba(255, 99, 132, 1)";

        chartInstance.current = new Chart(ctx, {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Scatter Data",
                        data: scatterData,
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                    },
                    {
                        label: "Line of Best Fit",
                        data: lineData,
                        type: "line",
                        borderColor: lineColor,
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "linear",
                        position: "bottom",
                        title: {
                            display: true,
                            text: "Index",
                            color: "white",
                        },
                        ticks: {
                            color: "white",
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Mean Value",
                            color: "white",
                        },
                        ticks: {
                            color: "white",
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: "white",
                        },
                    },
                    title: {
                        display: true,
                        text: `Band ${bandName} Analysis`,
                        color: "white",
                        font: {
                            size: 16,
                        },
                    },
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [bandData, bandName]);

    return (
        <canvas ref={chartRef} style={{ height: "250px", width: "200px" }} />
    );
};

const calculateLineOfBestFit = (data) => {
    const n = data.length;
    let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0;

    data.forEach((point) => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumX2 += point.x * point.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};

const Analysis = ({ data }) => {
    const [email, setEmail] = useState("");
    const [leadTime, setLeadTime] = useState("");
    const [cloudCoverage, setCloudCoverage] = useState(50);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if ((email && !leadTime) || (!email && leadTime)) {
            alert("Both Email and Lead Time must be filled out together.");
        } else {
            // Handle the form submission logic here
            console.log("Form submitted", { email, leadTime, cloudCoverage });
        }
    };

    const aggregatedData = useMemo(() => {
        const bands = {};
        data.data.forEach((interval) => {
            if (
                interval.outputs &&
                interval.outputs.data &&
                interval.outputs.data.bands
            ) {
                Object.entries(interval.outputs.data.bands).forEach(
                    ([band, bandData]) => {
                        if (!bands[band]) {
                            bands[band] = [];
                        }
                        bands[band].push(bandData);
                    }
                );
            }
        });
        return bands;
    }, [data]);

    return (
        <div className="analysis-container">
            <div className="sidebar">
                <div className="form-header">
                    <h2>
                        The next landsat will pass over <span></span>
                    </h2>
                </div>
                <form onSubmit={handleFormSubmit}>
                    <div className="email-container">
                        <div>
                            <label className="fade-label">Email</label>
                            <input
                                id="email-input"
                                className="fade-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="fade-label">Lead Time</label>
                            <select
                                id="lead-time-input"
                                value={leadTime}
                                onChange={(e) => setLeadTime(e.target.value)}
                                className="styled-select fade-input"
                            >
                                <option value="">Select Lead Time</option>
                                <option value="2">2 Hours</option>
                                <option value="6">6 Hours</option>
                                <option value="12">12 Hours</option>
                                <option value="24">24 Hours</option>
                            </select>
                        </div>

                        <div className="slider-container">
                            <label>Cloud Coverage: {cloudCoverage}%</label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={cloudCoverage}
                                onChange={(e) =>
                                    setCloudCoverage(Number(e.target.value))
                                }
                                className="slider"
                            />
                        </div>

                        <button type="submit" className="primary-button mt-4">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            <div className="chart-container">
                <h1 className="pb-2">Landsat Results</h1>
                <div className="image-result pb-4">
                    <img src="/output.png" alt="Landsat Output" />
                </div>
                <div className="chart-grid pt-4">
                    {Object.entries(aggregatedData).map(([band, bandData]) => (
                        <div className="chart" key={band}>
                            <ChartJsScatterPlot
                                bandName={band}
                                bandData={bandData}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analysis;
