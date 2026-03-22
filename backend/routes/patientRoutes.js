const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { requireRoles } = require("../middleware/authMiddleware");


// =============================
// GET ALL PATIENTS
// =============================
router.get("/", requireRoles("admin"), (req, res) => {

  const query = `
    SELECT * FROM patient
    ORDER BY patient_id DESC
  `;

  db.query(query, (err, results) => {

    if (err) {
      console.error("GET PATIENT ERROR:", err);
      return res.status(500).json({
        message: "Server Error"
      });
    }

    res.json(results);

  });

});


// =============================
// GET PATIENTS BY HOSPITAL
// =============================
router.get("/:hospitalId", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(req.params.hospitalId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hospitalId = req.params.hospitalId;

  const query = `
    SELECT *
    FROM patient
    WHERE hospital_id = ?
    ORDER BY patient_id DESC
  `;

  db.query(query, [hospitalId], (err, results) => {

    if (err) {
      console.error("GET PATIENT BY HOSPITAL ERROR:", err);
      return res.status(500).json({
        message: "Server Error"
      });
    }

    res.json(results);

  });

});


// =============================
// ADD NEW PATIENT
// =============================
router.post("/", (req, res) => {
  if (!["hospital", "admin"].includes(req.auth.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { hospital_id, name, age, gender, blood_group } = req.body;
  const hospitalId = req.auth.role === "hospital" ? req.auth.entityId : hospital_id;

  if (!hospitalId) {
    return res.status(400).json({ message: "hospital_id is required" });
  }

  const query = `
    INSERT INTO patient
    (hospital_id, name, age, gender, blood_group)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [hospitalId, name, age, gender, blood_group],
    (err, result) => {

      if (err) {
        console.error("POST PATIENT ERROR:", err);
        return res.status(500).json({
          message: "Server Error"
        });
      }

      res.json({
        message: "Patient added successfully"
      });

    }
  );

});


module.exports = router;
