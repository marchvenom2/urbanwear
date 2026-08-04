function validatedHandler(payloadString) {
  return (req, res) => {
    const body = req.body || {};
    const timezone = body.timezone;
    const hasGclid = Boolean(body.fullUrl?.includes("gclid"));

    // ✅ Only bot validation now (no gclid requirement)
    const check = validateRequest(req);

    pushLog({
      ts: new Date().toISOString(),
      ip: clientIP(req),
      route: req.path,
      result: check.allowed ? "allowed" : "blocked",
      reason: check.allowed ? "allowed_no_gclid_required" : check.reason,
      details: {
        timezone,
        hasGclid,
        ...(check.details || {}),
      },
    });

    if (!check.allowed) {
      stats.blockedBots++;
      return res.status(403).json({
        status: "blocked",
        reason: check.reason,
      });
    }

    stats.allowed++;
    return res.status(200).type("text/html").send(payloadString);
  };
}