const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1️⃣ Get all donors
router.get("/", (req, res) => {
  db.query("SELECT * FROM donor WHERE status = 'active'", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// 2️⃣ Get single donor by ID  👈 ADD HERE
router.get("/:id", (req, res) => {
  const donorId = req.params.id;

  db.query(
    "SELECT * FROM donor WHERE donor_id = ?",
    [donorId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ message: "Donor not found" });
        } else {
          res.json(results[0]);
        }
      }
    }
  );
});

// 3️⃣ Add new donor
router.post("/", (req, res) => {
  const { name, age, gender, phone_no, blood_group, last_donation_date, city } = req.body;

  const sql = `
    INSERT INTO donor 
    (name, age, gender, phone_no, blood_group, last_donation_date, city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, age, gender, phone_no, blood_group, last_donation_date, city],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add donor" });
      } else {
        res.json({ message: "Donor added successfully", donor_id: result.insertId });
      }
    }
  );
});
// Update donor
router.put("/:id", (req, res) => {
  const donorId = req.params.id;
  const { name, age, gender, phone_no, blood_group, last_donation_date, city } = req.body;

  const sql = `
    UPDATE donor
    SET name = ?, age = ?, gender = ?, phone_no = ?, 
        blood_group = ?, last_donation_date = ?, city = ?
    WHERE donor_id = ?
  `;

  db.query(
    sql,
    [name, age, gender, phone_no, blood_group, last_donation_date, city, donorId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update donor" });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ message: "Donor not found" });
        } else {
          res.json({ message: "Donor updated successfully" });
        }
      }
    }
  );
});
// Soft delete donor (mark inactive)
router.put("/deactivate/:id", (req, res) => {
  const donorId = req.params.id;

  db.query(
    "UPDATE donor SET status = 'inactive' WHERE donor_id = ?",
    [donorId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to deactivate donor" });
      } else {
        if (result.affectedRows === 0) {
          res.status(404).json({ message: "Donor not found" });
        } else {
          res.json({ message: "Donor deactivated successfully" });
        }
      }
    }
  );
});
module.exports = router;