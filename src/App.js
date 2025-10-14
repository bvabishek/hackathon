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
  const [chartType, setChartType] = useState("bar");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://vyizdv7gpwr2biqnz6phaevswy0nrqss.lambda-url.ap-south-1.on.aws"
      );
      setData(res?.data?.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: [
      "Failed Files",
      "Processed Files",
      "Total Files",
      "OCR Files",
      "Unsupported Files",
    ],
    datasets: [
      {
        label: "Count",
        data: data
          ? [
              data?.failedCout,
              data?.processedCount,
              data?.toBeProcessedCount,
              data?.ocrCount,
              data?.unsupportedCount,
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(245, 37, 9, 0.6)",
          "rgba(79, 222, 222, 0.6)",
          "rgba(51, 157, 227, 0.6)",
          "rgba(238, 200, 105, 0.6)",
          "rgba(72, 43, 131, 0.6)",
        ],
        pointBackgroundColor: [
          "rgba(152, 3, 3, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1.5,
        tension: 0.4,
        fill: false,
        showLine: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light" style={{overflow: "scroll", height: "90%"}}>
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
        </Card.Header>

        <Card.Body className="bg-white">
          {!data ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "300px" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div>
              <div className="chart-container mb-4 d-flex justify-content-center">{renderChart()}</div>
              <hr />
              {/* --- Summary Table --- */}
              <div className="table-responsive">
                <Table striped bordered hover size="xs" className="text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Metric</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Failed Files</td>
                      <td>{data?.failedCout ?? 0}</td>
                    </tr>
                    <tr>
                      <td>Processed Files</td>
                      <td>{data?.processedCount ?? 0}</td>
                    </tr>
                    <tr>
                      <td>Total Files</td>
                      <td>{data?.toBeProcessedCount ?? 0}</td>
                    </tr>
                    <tr>
                      <td>OCR Files</td>
                      <td>{data?.ocrCount ?? 0}</td>
                    </tr>
                    <tr>
                      <td>Unsupported Files</td>
                      <td>{data?.unsupportedCount ?? 0}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
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
