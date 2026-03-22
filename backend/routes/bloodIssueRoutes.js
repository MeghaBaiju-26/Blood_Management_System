const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =============================
// GET ALL BLOOD ISSUES
// =============================
router.get("/", (req, res) => {
    if (!["admin", "blood_bank", "hospital"].includes(req.auth.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }

   const sql = `
SELECT 
    bi.issue_id,
    br.request_id,
    h.hospital_name AS hospital,
    bb.bank_name AS blood_bank,
    br.bank_id,
    br.hospital_id,
    bi.units_issued,
    bi.issue_date
FROM blood_issue bi
JOIN blood_request br ON bi.request_id = br.request_id
JOIN hospital h ON br.hospital_id = h.hospital_id
JOIN blood_bank bb ON br.bank_id = bb.bank_id
`;
    const clauses = [];
    const params = [];

    if (req.auth.role === "blood_bank") {
        clauses.push("br.bank_id = ?");
        params.push(req.auth.entityId);
    } else if (req.auth.role === "hospital") {
        clauses.push("br.hospital_id = ?");
        params.push(req.auth.entityId);
    }

    const finalSql = `${sql}${clauses.length ? ` WHERE ${clauses.join(" AND ")}` : ""} ORDER BY bi.issue_date DESC`;

    db.query(finalSql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
});

module.exports = router;
