import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import * as XLSX from "xlsx";

const Transactions = () => {
    const [filters, setFilters] = useState({
        jobType: "",
        industry: "",
        timeframe: "",
        skills: "",
        freesearch: "",
    });
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const itemsPerPage = 25;
    const navigate = useNavigate();
    const [isAllChecked, setIsAllChecked] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const fetchJobs = async (page) => {
        const queryParams = new URLSearchParams({
            ...filters,
            page: page - 1,
            size: itemsPerPage,
        });

        try {
            const response = await fetch(
                `http://localhost:9998/api/vexxajobportal/search-jobs?${queryParams}`
            );
            const data = await response.json();
            setJobs(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchJobs(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchJobs(newPage);
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(jobs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs Data");
        XLSX.writeFile(workbook, "JobSearchData.xlsx");
    };

    const handleEmailClick = (email) => {
        window.location.href = `mailto:${email}`;
    };

    const handleCallClick = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const handleCheckboxChange = (email) => {
        setSelectedEmails((prevSelectedEmails) =>
            prevSelectedEmails.includes(email)
                ? prevSelectedEmails.filter((e) => e !== email)
                : [...prevSelectedEmails, email]
        );
    };

    const handleAllCheckboxChange = () => {
        if (!isAllChecked) {
            const emails = jobs.map((job) => job.contact?.email).filter((email) => email);
            setSelectedEmails(emails);
        } else {
            setSelectedEmails([]);
        }
        setIsAllChecked(!isAllChecked);
    };

    const handleGroupEmailClick = () => {
        if (selectedEmails.length > 0) {
            const mailtoLink = `mailto:${selectedEmails.join(",")}`;
            window.location.href = mailtoLink;
        } else {
            alert("No emails selected.");
        }
    };

    const handleDashboardRedirect = (organizationNumber) => {
        navigate(`/dashboard?organizationId=${organizationNumber}`);
    };

    return (
        <div className="container">
            <h1>Job Search</h1>

            {/* Unified Filters and Results Section */}
            <div className="search-results-container">
                {/* Filters Section */}
                <div className="filters-section">
                    <h2>Filters</h2>
                    <div className="filters-row">
                        <label>
                            Job Type:
                            <select name="jobType" value={filters.jobType} onChange={handleChange}>
                                <option value="">Select Job Type</option>
                                <option value="PFZr_Syz_cUq">Full-time</option>
                                <option value="jUzR_oVs_wLp">Part-time</option>
                                <option value="gAyR_pLs_wQp">Internship</option>
                            </select>
                        </label>
                        <label>
                            Industry:
                            <input
                                type="text"
                                name="industry"
                                value={filters.industry}
                                onChange={handleChange}
                                placeholder="Specify industry"
                            />
                        </label>
                        <label>
                            Timeframe:
                            <input
                                type="date"
                                name="timeframe"
                                value={filters.timeframe}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="filters-row-2">
                        <label>
                            Skills Required:
                            <input
                                type="text"
                                name="skills"
                                value={filters.skills}
                                onChange={handleChange}
                                placeholder="Enter skills"
                            />
                        </label>
                        <label>
                            Free Search:
                            <input
                                type="text"
                                name="freesearch"
                                value={filters.freesearch}
                                onChange={handleChange}
                                placeholder="Free search query"
                            />
                        </label>
                    </div>
                    <div className="button-container">
                        <button onClick={handleSearch}>Search</button>
                        <button onClick={exportToExcel}>Export</button>
                        <button onClick={handleGroupEmailClick}>Group Email</button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="results-section">
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Job Type</th>
                                <th>Industry</th>
                                <th>Timeframe</th>
                                <th>Skills Required</th>
                                <th>Name</th>
                                <th>
                                    <label style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                    <span>Email</span>
                                        <input
                                            type="checkbox"
                                            onChange={handleAllCheckboxChange}
                                            checked={isAllChecked}
                                        />
                                    </label>
                                </th>

                                <th>Phone</th>
                                <th>View Job</th>
                                <th>Dashboard</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.length > 0 ? (
                                jobs.map((job, index) => (
                                    <tr key={index}>
                                        <td>{job.jobType}</td>
                                        <td>{job.industry}</td>
                                        <td>{job.timeframe}</td>
                                        <td>{job.skillsRequired}</td>
                                        <td>{job.contact?.name || "N/A"}</td>
                                        <td>
                                            {job.contact?.email ? (
                                                <>
                                                    <button onClick={() => handleEmailClick(job.contact.email)}>
                                                        Email
                                                    </button>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(job.contact.email)}
                                                        checked={selectedEmails.includes(job.contact.email)}
                                                    />
                                                </>
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                        <td>
                                            {job.contact?.phone ? (
                                                <button onClick={() => handleCallClick(job.contact.phone)}>
                                                    Call
                                                </button>
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                        <td>
                                            {job.webPageUrl ? (
                                                <a
                                                    href={job.webPageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Job
                                                </a>
                                            ) : (
                                                "N/A"
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDashboardRedirect(job.organizationNumber)}
                                            >
                                                View Dashboard
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">No jobs found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

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
            </div>
        </div>
    );
};

export default Transactions;
