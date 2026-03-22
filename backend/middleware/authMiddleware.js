const {
  decodeAccessToken,
  findUserById,
} = require("../services/authService");

function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({ message });
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return unauthorized(res, "Missing or invalid authorization header");
    }

    const decoded = decodeAccessToken(token);
    const user = await findUserById(decoded.sub);

    if (!user) {
      return unauthorized(res, "User not found");
    }

    if (user.account_status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    req.auth = {
      userId: user.user_id,
      role: user.role,
      accountStatus: user.account_status,
      entityId:
        user.linked_donor_id ||
        user.linked_hospital_id ||
        user.linked_bank_id ||
        null,
      email: user.email,
    };

    return next();
  } catch (error) {
    return unauthorized(res, "Invalid or expired token");
  }
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return unauthorized(res);
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

function requireEntityOwnership(paramName) {
  return (req, res, next) => {
    if (!req.auth) {
      return unauthorized(res);
    }

    if (req.auth.role === "admin") {
      return next();
    }

    const routeValue = Number(req.params[paramName]);
    if (!Number.isInteger(routeValue)) {
      return res.status(400).json({ message: "Invalid route id" });
    }

    if (Number(req.auth.entityId) !== routeValue) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
  requireEntityOwnership,
};

