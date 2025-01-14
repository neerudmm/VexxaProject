import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import "./styles.css";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [organizationId, setOrganizationId] = useState("");
    const [timeframe, setTimeframe] = useState("");
    const [searchData, setSearchData] = useState({ stats: null, currentJobs: [], postingFrequency: null });
    const [chartData, setChartData] = useState([]);
    const [showChart, setShowChart] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(""); // State to track validation errors
    const jobsPerPage = 10;

    // Fetch data based on Organization ID and Timeframe
    const fetchSearchData = async () => {
        // Validate the Organization ID field
        if (!organizationId.trim()) {
            setError("Organization ID is required.");
            return;
        }
        setError(""); // Clear any previous errors

        try {
            const response = await fetch(
                `http://localhost:9998/api/vexxajobportal/dashboard?organizationId=${organizationId}&timeframe=${timeframe}`
            );
            if (!response.ok) {
                throw new Error("Error fetching data.");
            }
            const result = await response.json();
            setSearchData(result);
            setCurrentPage(1);
            setShowChart(false); // Hide chart if search is performed
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };

    // Fetch data for Bar Chart
    const fetchChartData = async () => {
        try {
            const response = await fetch("http://localhost:9998/api/vexxajobportal/dashboard1");
            if (!response.ok) {
                throw new Error("Failed to fetch chart data");
            }
            const result = await response.json();
            if (result.hits) {
                setChartData(result.hits);
                setShowChart(true); // Show chart after fetching data
            } else {
                console.error("Invalid response structure for chart data:", result);
            }
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    };

    // Generate data for Bar Chart
    const generateBarChartData = () => {
        const companyNames = chartData.map((job) => job.employer?.name || "Unknown");

        const companyCounts = companyNames.reduce((acc, name) => {
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const sortedCompanies = Object.entries(companyCounts)
            .sort((a, b) => b[1] - a[1])
            .reduce(
                (acc, [name, count]) => {
                    acc.labels.push(name);
                    acc.data.push(count);
                    return acc;
                },
                { labels: [], data: [] }
            );

        return {
            labels: sortedCompanies.labels,
            datasets: [
                {
                    label: "Job Postings",
                    data: sortedCompanies.data,
                    backgroundColor: "rgba(75, 192, 192, 0.4)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };

    // Pagination Logic for Search Results
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = searchData.currentJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(searchData.currentJobs.length / jobsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="container">
            <h1>Job Portal Dashboard</h1>

            {/* Filters Section */}
            <div className="section">
                <h2>Filters</h2>
                <div className="filters-row">
                    <label>
                        Organization ID:
                        <input
                            type="text"
                            value={organizationId}
                            onChange={(e) => setOrganizationId(e.target.value)}
                            placeholder="Enter Organization ID"
                        />
                    </label>
                    <label>
                        Timeframe:
                        <input
                            type="date"
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                        />
                    </label>
                </div>
                {error && <p className="error">{error}</p>} {/* Display validation error */}
            </div>

            <div className="button-container">
                <button onClick={fetchSearchData}>Search</button>
                <button onClick={fetchChartData}>Display Dashboard</button>
            </div>

            {/* Statistics and Job Posting Frequency */}
            {(!showChart && (searchData.stats || searchData.postingFrequency)) && (
                <div className="stats-container">
                    {searchData.stats && (
                        <div className="stats-box">
                            <h2>Statistics</h2>
                            <p>Total Positions: {searchData.stats.positions}</p>
                            <p>Query Time: {searchData.stats.query_time_in_millis} ms</p>
                        </div>
                    )}
                    {searchData.postingFrequency && (
                        <div className="stats-box">
                            <h2>Job Posting Frequency</h2>
                            <p>Total Jobs Posted: {searchData.postingFrequency.totalPostings}</p>
                            <p>Frequency: {searchData.postingFrequency.frequency} postings/day</p>
                        </div>
                    )}
                </div>
            )}

            {/* Search Results Section */}
            {!showChart && searchData.currentJobs.length > 0 && (
                <div className="section">
                    <h2>Current Job Listings</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Employer</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentJobs.map((job, index) => (
                                <tr key={index}>
                                    <td>{job.headline}</td>
                                    <td>{job.employer?.name || "N/A"}</td>
                                    <td>{job.application_deadline}</td>
                                    <td>
                                        <a
                                            href={job.webpage_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Job
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Bar Chart Section */}
            {showChart && chartData.length > 0 && (
                <div className="chart-container">
                    <h2>Job Postings by Company</h2>
                    <Bar data={generateBarChartData()} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
