const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/", (req, res) => {

  const query = `
    SELECT 
      au.user_id AS id,
      COALESCE(d.name, h.hospital_name, bb.bank_name, 'Admin User') AS name,
      au.email,
      au.role AS role,
      au.account_status AS status,
      au.created_at
    FROM auth_users au
    LEFT JOIN donor d ON au.linked_donor_id = d.donor_id
    LEFT JOIN hospital h ON au.linked_hospital_id = h.hospital_id
    LEFT JOIN blood_bank bb ON au.linked_bank_id = bb.bank_id
    ORDER BY au.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});

module.exports = router;
