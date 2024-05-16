const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
  //   console.log(req.headers.authorization);

  const receivedToken = req.headers.authorization.replace("Bearer ", "");
  // console.log(receivedToken);
  //Bf3V6BjYNrJ3ugkHYPCsukusZ-Bw_AIn
  if (receivedToken) {
    const existingUser = await User.findOne({ token: receivedToken }).select(
      "account _id"
    );
    // console.log(existingUser);
    if (existingUser) {
      req.user = existingUser;
      return next();
    } else {
      res.status(401).json({ Error: "unauthorized" });
    }
  } else {
    res.status(401).json({ Error: "unauthorized" });
  }
};

module.exports = isAuthentificated;
