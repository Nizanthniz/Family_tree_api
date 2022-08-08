const jwt = require("jsonwebtoken");
const config = require("./auth.config");

exports.verifyToken = (req, res, next) => {
  let token = req.headers["access_token"];
console.log(token);
  if (!token) {
    return res.status(403).send({
      success:false,
      message: "No token provided!",
      data:[]
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(200).send({
        success:false,
        message:"Unauthorized!",
        data:[]
      }
      );
      
    }
    req.logged_in_id = decoded.id;
    console.log(req.logged_in_id);
    next();
  });
// next();
};