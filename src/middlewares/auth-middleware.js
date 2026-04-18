const jwt = require("jsonwebtoken")

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const isOptional = req.headers['x-auth-optional'] === 'true';
  
  if (!authHeader) {
    if (isOptional) return next();
    return res.status(401).json({ error: "Unauthorized" })
  }

  const token = authHeader.split(" ")[1]
  
  if (!token) {
    if (isOptional) return next();
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET)    

    const roles = decoded.roles || (decoded.role ? [decoded.role] : []);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: roles,
      permissions: decoded.permissions || []
    }

    next()
  } catch (err) {
    if (isOptional) return next();
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = authMiddleware
