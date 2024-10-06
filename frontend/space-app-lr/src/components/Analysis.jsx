import React, { useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    AreaChart,
    Area,
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Scatter,
    ZAxis,
    RadialBarChart,
    RadialBar,
    Treemap,
    ScatterChart,
} from "recharts";
import "../assets/css/analysisStyles.css";

// Sample Data for the charts
const data = [
    { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
    { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
    { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
    { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
    { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
    { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

const pieData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 },
];

const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 },
];

// Treemap data
const treemapData = [
    { name: "A", size: 3000 },
    { name: "B", size: 2000 },
    { name: "C", size: 1000 },
    { name: "D", size: 500 },
];

const Analysis = () => {
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
                <div className="centered-image">
                    <img src="marker.png" alt="Analysis" />
                </div>

                <div className="chart-grid">
                    {/* Chart 1: Line Chart */}
                    <div className="chart">
                        <LineChart width={300} height={200} data={data}>
                            <Line
                                type="monotone"
                                dataKey="pv"
                                stroke="#8884d8"
                            />
                            <Line
                                type="monotone"
                                dataKey="uv"
                                stroke="#82ca9d"
                            />
                            <Tooltip />
                        </LineChart>
                    </div>

                    {/* Chart 2: Bar Chart */}
                    <div className="chart">
                        <BarChart width={300} height={200} data={data}>
                            <Bar dataKey="uv" fill="#8884d8" />
                            <Bar dataKey="pv" fill="#82ca9d" />
                            <Tooltip />
                        </BarChart>
                    </div>

                    {/* Chart 3: Pie Chart */}
                    <div className="chart">
                        <PieChart width={300} height={200}>
                            <Pie
                                data={pieData}
                                cx={150}
                                cy={100}
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            [
                                                "#0088FE",
                                                "#00C49F",
                                                "#FFBB28",
                                                "#FF8042",
                                            ][index % 4]
                                        }
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    {/* Chart 4: Radar Chart */}
                    <div className="chart">
                        <RadarChart
                            outerRadius={90}
                            width={300}
                            height={200}
                            data={data}
                        >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis />
                            <Radar
                                name="Mike"
                                dataKey="uv"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Tooltip />
                        </RadarChart>
                    </div>

                    {/* Chart 5: Area Chart */}
                    <div className="chart">
                        <AreaChart width={300} height={200} data={data}>
                            <defs>
                                <linearGradient
                                    id="colorUv"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#8884d8"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#8884d8"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="uv"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorUv)"
                            />
                        </AreaChart>
                    </div>

                    {/* Chart 6: Composed Chart */}
                    <div className="chart">
                        <ComposedChart width={300} height={200} data={data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <CartesianGrid stroke="#f5f5f5" />
                            <Area
                                type="monotone"
                                dataKey="amt"
                                fill="#8884d8"
                                stroke="#8884d8"
                            />
                            <Bar dataKey="pv" barSize={20} fill="#413ea0" />
                            <Line
                                type="monotone"
                                dataKey="uv"
                                stroke="#ff7300"
                            />
                        </ComposedChart>
                    </div>

                    {/* Chart 7: Scatter Chart */}
                    <div className="chart">
                        <ScatterChart width={300} height={200}>
                            <CartesianGrid />
                            <XAxis dataKey="x" name="stature" unit="cm" />
                            <YAxis dataKey="y" name="weight" unit="kg" />
                            <ZAxis
                                dataKey="z"
                                range={[60, 400]}
                                name="score"
                                unit="points"
                            />
                            <Tooltip />
                            <Scatter
                                name="A school"
                                data={scatterData}
                                fill="#8884d8"
                            />
                        </ScatterChart>
                    </div>

                    {/* Chart 8: Radial Bar Chart */}
                    <div className="chart">
                        <RadialBarChart
                            width={300}
                            height={200}
                            innerRadius="10%"
                            outerRadius="80%"
                            data={pieData}
                        >
                            <RadialBar
                                minAngle={15}
                                label={{
                                    fill: "#666",
                                    position: "insideStart",
                                }}
                                background
                                clockWise
                                dataKey="value"
                            />
                            <Legend />
                            <Tooltip />
                        </RadialBarChart>
                    </div>

                    {/* Chart 9: Treemap */}
                    <div className="chart">
                        <Treemap
                            width={300}
                            height={200}
                            data={treemapData}
                            dataKey="size"
                            ratio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
