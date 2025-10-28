import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Dropdown, Table } from "react-bootstrap";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

function App() {
  const [data, setData] = useState(null);
  const [batchData, setBatchData] = useState(null)
  const [chartType, setChartType] = useState("bar");
  const [dashboardType, setDashboardType] = useState("fileProcessing");
  const [lastUpdated, setLastUpdated] = useState(null);

  const ENDPOINTS = {
    fileProcessing:
      "https://vyizdv7gpwr2biqnz6phaevswy0nrqss.lambda-url.ap-south-1.on.aws",
    batchExtraction: "https://volity4ygyqqtyeu2u3s7hespq0vgews.lambda-url.ap-south-1.on.aws", // ⚠️ Replace with your API
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(ENDPOINTS[dashboardType]);
      if (dashboardType === "fileProcessing") {
        setData(res?.data?.data);
      } else if (dashboardType === "batchExtraction") {
        setBatchData(res?.data);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
    }
  };


useEffect(() => {
  setData(null);
  fetchData();
  const interval = setInterval(fetchData, 60000);
  return () => clearInterval(interval);
}, [dashboardType]);


  // ------------------- CHART CONFIG -------------------
  const getChartData = () => {
    if (dashboardType === "fileProcessing") {
      return {
        labels: [
          "Total Files",
          "Processed Files",
          "OCR Files",
          "Failed Files",
          "Unsupported Files",
        ],
        datasets: [
          {
            label: "Count",
            data: data
              ? [
                data?.toBeProcessedCount,
                data?.processedCount,
                data?.ocrCount,
                data?.failedCout,
                data?.unsupportedCount,
              ]
              : [0, 0, 0, 0, 0],
            backgroundColor: [
              "#FFDE63",
              "#78C841",
              "#33A1E0",
              "#E62727",
              "grey",
            ],
            borderWidth: 1.5,
            tension: 0.4,
            fill: false,
          },
        ],
      };
    } else {
      // Example for batch extraction (change fields based on API)
      return {
        labels: [
          "Pending",
          "In Progress",
          "Completed Count",
        ],
        datasets: [
          {
            label: "Batch Count",
            data: batchData
              ? [
                batchData?.pendingCount,
                batchData?.inProgressCount,
                batchData?.completedCount,
              ]
              : [0, 0, 0, 0, 0],
            backgroundColor: [
              "#36A2EB",
              "#4BC0C0",
              "#FFCE56",
              "#E62727",
              "#9966FF",
            ],
            borderWidth: 1.5,
            tension: 0.4,
            fill: false,
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text:
          dashboardType === "fileProcessing"
            ? "File Processing Metrics"
            : "Batch Extraction Metrics",
      },
    },
  };

  const renderChart = () => {
    const chartData = getChartData();
    switch (chartType) {
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  // ------------------- TABLES -------------------
  const renderTable = () => {
    if (!data && !batchData) return null;

    if (dashboardType === "fileProcessing") {
      return (
        <Table striped bordered hover size="xs" className="text-center">
          <thead className="table-light">
            <tr>
              <th>Metric</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Files</td>
              <td>{data?.toBeProcessedCount ?? 0}</td>
            </tr>
            <tr>
              <td>Processed Files</td>
              <td>{data?.processedCount ?? 0}</td>
            </tr>
            <tr>
              <td>OCR Files</td>
              <td>{data?.ocrCount ?? 0}</td>
            </tr>
            <tr>
              <td>Failed Files</td>
              <td>{data?.failedCout ?? 0}</td>
            </tr>
            <tr>
              <td>Unsupported Files</td>
              <td>{data?.unsupportedCount ?? 0}</td>
            </tr>
          </tbody>
        </Table>
      );
    } else {
      // ⚙️ Example Batch Extraction Table (adjust columns to your API)
      return (
        <Table striped bordered hover size="xs" className="text-center">
          <thead className="table-light">
            <tr>
              <th>Metric</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pending</td>
              <td>{batchData?.pendingCount ?? 0}</td>
            </tr>
            <tr>
              <td>In Progress</td>
              <td>{batchData?.inProgressCount ?? 0}</td>
            </tr>
            <tr>
              <td>Completed</td>
              <td>{batchData?.completedCount ?? 0}</td>
            </tr>
          </tbody>
        </Table>
      );
    }
  };

  // ------------------- RENDER -------------------
  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ overflow: "scroll", height: "90%" }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "1200px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Card.Header className="d-flex align-items-center justify-content-between bg-white">
          <div className="d-flex align-items-center">
            <span
              className="me-2"
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "red",
                animation: "blink 1s infinite",
              }}
            ></span>
            <strong>Live Metrics Dashboard</strong>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Dashboard Type Dropdown */}
            <Dropdown onSelect={(eventKey) => setDashboardType(eventKey)}>
              <Dropdown.Toggle variant="light" size="sm">
                {dashboardType === "fileProcessing"
                  ? "File Processing"
                  : "Batch Extraction"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="fileProcessing">
                  File Processing
                </Dropdown.Item>
                <Dropdown.Item eventKey="batchExtraction">
                  Batch Extraction
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Chart Type Dropdown */}
            <Dropdown onSelect={(eventKey) => setChartType(eventKey)}>
              <Dropdown.Toggle variant="light" size="sm">
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="bar">Bar Chart</Dropdown.Item>
                <Dropdown.Item eventKey="line">Line Chart</Dropdown.Item>
                <Dropdown.Item eventKey="pie">Pie Chart</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Header>

        <Card.Body className="bg-white">
          {!(data || batchData) ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "300px" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <div className="chart-container mb-4 d-flex justify-content-center">
                {renderChart()}
              </div>
              <hr />
              <div className="table-responsive">{renderTable()}</div>
            </>
          )}
        </Card.Body>

        {lastUpdated && (
          <Card.Footer className="text-center text-muted small bg-light">
            Last updated: {lastUpdated}
          </Card.Footer>
        )}
      </Card>

      <style>
        {`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        .chart-container {
          max-width: 100%;
          height: 400px;
        }
        `}
      </style>
    </div>
  );
}

export default App;
