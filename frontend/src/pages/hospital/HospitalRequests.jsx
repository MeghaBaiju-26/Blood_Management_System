import { useState, useEffect } from "react";
import HospitalLayout from "../../components/hospital/HospitalLayout";

export default function HospitalRequests() {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [bankId, setBankId] = useState("");
  const [units, setUnits] = useState(1);
  const [loading, setLoading] = useState(false);

  // 🔥 FETCH ALL REQUESTS
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/blood-requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 🔥 SUBMIT NEW REQUEST
  const handleSubmit = async () => {
    if (!patientId || !bankId || !units) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await fetch("http://localhost:5000/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hospital_id: 1,
          patient_id: parseInt(patientId),
          bank_id: parseInt(bankId),
          units_required: parseInt(units)
        })
      });

      setShowModal(false);
      setPatientId("");
      setBankId("");
      setUnits(1);

      fetchRequests(); // refresh list

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <HospitalLayout title="Blood Requests" page="REQUESTS">
      <div style={{ padding: 30 }}>

        <h2 style={{ color: "#fff" }}>Blood Requests</h2>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "red",
            color: "white",
            padding: "8px 15px",
            border: "none",
            marginBottom: 20,
            cursor: "pointer"
          }}
        >
          + New Request
        </button>

        {/* REQUEST TABLE */}
        <table
          style={{
            width: "100%",
            background: "#111",
            color: "white",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Hospital ID</th>
              <th>Patient ID</th>
              <th>Bank ID</th>
              <th>Units</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.request_id}>
                <td>{req.request_id}</td>
                <td>{req.hospital_id}</td>
                <td>{req.patient_id}</td>
                <td>{req.bank_id}</td>
                <td>{req.units_required}</td>
                <td>{req.status}</td>
                <td>{new Date(req.request_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODAL */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              style={{
                background: "#222",
                padding: 30,
                borderRadius: 10,
                width: 400
              }}
            >
              <h3 style={{ color: "white" }}>New Blood Request</h3>

              <input
                placeholder="Patient ID"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />

              <input
                placeholder="Bank ID"
                value={bankId}
                onChange={e => setBankId(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />

              <input
                type="number"
                placeholder="Units"
                value={units}
                onChange={e => setUnits(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: "red",
                  color: "white",
                  padding: "8px 15px",
                  border: "none",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginTop: 10,
                  width: "100%"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </HospitalLayout>
  );
}