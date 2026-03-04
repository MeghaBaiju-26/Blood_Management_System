import { useState, useEffect } from "react";
import DonorLayout from "../../components/donor/DonorLayout";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DonorHealthCheck() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/health-checks/donor/1")
      .then((res) => res.json())
      .then((data) => {
        setChecks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching health checks:", err);
        setLoading(false);
      });
  }, []);

  return (
    <DonorLayout title="Health Checks">
      <div style={{ padding: 30, color: "white" }}>
        {loading ? (
          <p>Loading health checks...</p>
        ) : checks.length === 0 ? (
          <p>No health checks found.</p>
        ) : (
          checks.map((check) => (
            <div
              key={check.check_id}
              style={{
                background: "#0F0F17",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <p><strong>Date:</strong> {formatDate(check.check_date)}</p>
              <p><strong>Weight:</strong> {check.weight} kg</p>
              <p><strong>Blood Pressure:</strong> {check.blood_pressure}</p>
              <p><strong>Hemoglobin:</strong> {check.hemoglobin} g/dL</p>
              <p>
                <strong>Status:</strong>{" "}
                {check.eligibility_status}
              </p>
            </div>
          ))
        )}
      </div>
    </DonorLayout>
  );
}