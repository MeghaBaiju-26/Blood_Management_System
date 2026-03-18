const express = require('express');
const router = express.Router();
const db = require('../config/db');


// =============================
// CREATE BLOOD REQUEST
// =============================
router.post('/', (req, res) => {

    const { hospital_id, patient_id, bank_id, units_required } = req.body;

    const query = `
        INSERT INTO blood_request 
        (hospital_id, patient_id, bank_id, request_date, units_required, status)
        VALUES (?, ?, ?, CURDATE(), ?, 'Pending')
    `;

    db.query(
        query,
        [hospital_id, patient_id, bank_id, units_required],
        (err, result) => {

            if (err) {
                console.error("POST ERROR:", err);
                return res.status(500).json({
                    message: "Server Error"
                });
            }

            res.status(201).json({
                message: "Blood request created successfully",
                request_id: result.insertId
            });
        }
    );
});


// =============================
// GET ALL BLOOD REQUESTS
// =============================
router.get('/', (req, res) => {

    const query = `
        SELECT 
            br.request_id,
            br.hospital_id,
            h.hospital_name,
            br.patient_id,
            p.name AS patient_name,
            br.bank_id,
            p.blood_group,
            br.units_required,
            br.request_date,
            br.status,
            'Routine' AS priority
        FROM blood_request br
        JOIN hospital h 
            ON br.hospital_id = h.hospital_id
        JOIN patient p 
            ON br.patient_id = p.patient_id
        ORDER BY br.request_date DESC
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.error("GET ERROR:", err);
            return res.status(500).json({
                message: "Server Error"
            });
        }

        res.json(results);
    });
});

router.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  const requestId = req.params.id;

  try {
    const [result] = await db.query(
      "UPDATE blood_request SET status = ? WHERE request_id = ?",
      [status, requestId]
    );

    res.json({
      message: "Request status updated",
      affectedRows: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update request status" });
  }
});

// =============================
// UPDATE REQUEST STATUS
// (Blood Bank Approve / Reject)
// =============================
router.put('/:id/status', (req, res) => {

    const { status } = req.body;
    const requestId = req.params.id;

    const query = `
        UPDATE blood_request
        SET status = ?
        WHERE request_id = ?
    `;

    db.query(query, [status, requestId], (err, result) => {

        if (err) {
            console.error("UPDATE ERROR:", err);
            return res.status(500).json({
                message: "Server Error"
            });
        }

        res.json({
            message: "Request status updated successfully"
        });
    });

});


module.exports = router;