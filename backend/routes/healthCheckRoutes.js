const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get health checks for donor
router.get("/donor/:id", (req, res) => {
    const donorId = req.params.id;

    const sql = `
        SELECT *
        FROM health_check
        WHERE donor_id = ?
        ORDER BY check_date DESC
    `;

    db.query(sql, [donorId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
});

module.exports = router;