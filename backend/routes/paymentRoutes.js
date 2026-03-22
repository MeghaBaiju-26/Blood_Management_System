const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {
    if (!["admin", "hospital", "blood_bank"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    let query = `
        SELECT 
            p.payment_id,
            p.payment_date,
            p.amount,
            p.payment_status,
            b.bank_name,
            p.hospital_id,
            p.bank_id
        FROM payment p
        JOIN blood_bank b 
        ON p.bank_id = b.bank_id
    `;
    const params = [];

    if (req.auth.role === "hospital") {
        query += " WHERE p.hospital_id = ?";
        params.push(req.auth.entityId);
    } else if (req.auth.role === "blood_bank") {
        query += " WHERE p.bank_id = ?";
        params.push(req.auth.entityId);
    }

    db.query(query, params, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server Error" });
        }

        res.json(results);

    });

});

module.exports = router;
