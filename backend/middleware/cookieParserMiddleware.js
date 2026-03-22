function parseCookies(headerValue) {
  if (!headerValue) return {};

  return headerValue.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
}

function cookieParser(req, _res, next) {
  req.cookies = parseCookies(req.headers.cookie);
  next();
}

module.exports = {
  cookieParser,
};

