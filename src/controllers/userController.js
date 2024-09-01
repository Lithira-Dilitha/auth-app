const pool = require('../config/db');
exports.getUser = async (req, res) => {
    const resalt = await pool.query(
      "SELECT id,name,email FROM users WHERE id = $1",
      [req.user.sub]
    );
    res.json(resalt.rows[0]);
  }