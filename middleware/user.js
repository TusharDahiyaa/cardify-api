const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decodedValue = jwt.verify(token, JWT_SECRET);

    if (decodedValue) {
      req.username = decodedValue;
      next();
    } else {
      res.status(403).json({
        msg: "You are not authenticated",
      });
    }
  } catch (err) {
    res.status(500).send(`Error authenticating user: ${err}`);
  }
};

module.exports = authMiddleware;

// {
//   "about": "Full Stack Developer Earning 10Lakhs per month",
//   "facebook": "",
//   "first_name": "Tushar",
//   "github": "tushardahiyaa",
//   "instagram": "tushardahiyaa",
//   "interests": "",
//   "last_name": "Dahiya",
//   "stackOverflow": "",
//   "linkedin": "tushardahiya",
//   "phone": "",
//   "twitter": "tushardahiyaa"
// }
