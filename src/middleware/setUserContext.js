const pool = require("../config/db");

const setUserContext = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    console.log("This is User_id : "+userId);
   const result = await pool.query("SELECT set_config('app.user_id',$1, false)", [userId]);
   console.log(result);
   
    next();
  } catch (err) {
    console.log(err);
    res.status(500).send("Error setting user context");
  }
};
module.exports = setUserContext;
