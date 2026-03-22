const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { requireRoles } = require("../middleware/authMiddleware");

// ==========================
// GET ALL HOSPITALS (WITH PATIENT COUNT) ✅
// ==========================
router.get("/", requireRoles("admin"), (req, res) => {

    const query = `
        SELECT 
            h.*,
            COUNT(p.patient_id) AS total_patients
        FROM hospital h
        LEFT JOIN patient p
            ON h.hospital_id = p.hospital_id
        GROUP BY h.hospital_id
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.error("GET ALL ERROR:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);

    });

});

// ==========================
// GET SINGLE HOSPITAL ✅
// ==========================
router.get("/:id", (req, res) => {
    if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(req.params.id)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (!["hospital", "admin"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }


    const hospitalId = req.params.id;

    const query = `
        SELECT *
        FROM hospital
        WHERE hospital_id = ?
    `;

    db.query(query, [hospitalId], (err, results) => {

        if (err) {
            console.error("GET ERROR:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.json(results[0]);

    });

});

// ==========================
// ADD HOSPITAL ✅
// ==========================
router.post("/", requireRoles("admin"), (req, res) => {

    const { hospital_name, city, contact_no } = req.body;

    const query = `
        INSERT INTO hospital (hospital_name, city, contact_no)
        VALUES (?, ?, ?)
    `;

    db.query(query, [hospital_name, city, contact_no], (err, result) => {

        if (err) {
            console.error("INSERT ERROR:", err);
            return res.status(500).json({ error: "Insert failed" });
        }

        res.json({
            message: "Hospital added successfully",
            hospital_id: result.insertId
        });

    });

});

// ==========================
// UPDATE HOSPITAL ✅
// ==========================
router.put("/:id", (req, res) => {
    if (req.auth.role === "hospital" && Number(req.auth.entityId) !== Number(req.params.id)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (!["hospital", "admin"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }


    const hospitalId = req.params.id;
    const { hospital_name, city, contact_no } = req.body;

    const query = `
        UPDATE hospital
        SET hospital_name = ?, city = ?, contact_no = ?
        WHERE hospital_id = ?
    `;

    db.query(
        query,
        [hospital_name, city, contact_no, hospitalId],
        (err, result) => {

            if (err) {
                console.error("UPDATE ERROR:", err);
                return res.status(500).json({ error: "Update failed" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Hospital not found" });
            }

            res.json({
                message: "Hospital updated successfully"
            });

        }
    );

});

// ==========================
// DELETE HOSPITAL ✅
// ==========================
router.delete("/:id", requireRoles("admin"), (req, res) => {

    const hospitalId = req.params.id;

    const query = `
        DELETE FROM hospital
        WHERE hospital_id = ?
    `;

    db.query(query, [hospitalId], (err, result) => {

        if (err) {
            console.error("DELETE ERROR:", err);
            return res.status(500).json({ error: "Delete failed" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.json({
            message: "Hospital deleted successfully"
        });

    });

});

module.exports = router;
