import React, { useMemo, useState } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
} from "recharts";
import "../assets/css/analysisStyles.css";

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

const BandScatterPlot = ({ bandData, bandName }) => {
    const scatterData = useMemo(() => {
        return bandData.map((item, index) => ({
            x: index,
            y: item.stats.mean,
            min: item.stats.min,
            max: item.stats.max,
            stDev: item.stats.stDev,
        }));
    }, [bandData]);

    const { slope, intercept } = useMemo(
        () => calculateLineOfBestFit(scatterData),
        [scatterData]
    );

    // Line of best fit coordinates
    const lineData = useMemo(
        () => [
            { x: 0, y: intercept },
            {
                x: scatterData.length - 1,
                y: slope * (scatterData.length - 1) + intercept,
            },
        ],
        [scatterData, slope, intercept]
    );

    return (
        <div className="band-scatter-plot">
            <h2>Band {bandName} Analysis</h2>
            <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Index"
                            stroke="#fff"
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Mean Value"
                            stroke="#fff"
                        />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Legend />

                        <Scatter
                            name="Scatter Data"
                            data={scatterData}
                            fill="#8884d8"
                        />

                        <Line
                            name="Line of Best Fit"
                            type="linear"
                            data={lineData}
                            dataKey="y"
                            stroke="red"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Analysis = ({ data }) => {
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
            <h1>Band Analysis</h1>
            <div className="chart-grid">
                {Object.entries(aggregatedData).map(([band, bandData]) => (
                    <div className="chart" key={band}>
                        <BandScatterPlot bandName={band} bandData={bandData} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analysis;
