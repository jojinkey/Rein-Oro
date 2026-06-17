export function notFoundHandler(req, res) {
 res.status(404).json({
  success: false,
  error: `API endpoint ${req.method} ${req.originalUrl} not found`,
 });
}

export function globalErrorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.error("DEV ERROR:", err);
    res.status(statusCode).json({
      success: false,
      error: err.message || "Internal Server Error",
      stack: err.stack
    });
  } else {
    console.error("PROD ERROR:", err);

    // In production, avoid leaking system error details on 500 Internal Server Errors
    if (statusCode >= 500) {
      res.status(500).json({
        success: false,
        error: "Something went wrong on our server. Please try again later."
      });
    } else {
      res.status(statusCode).json({
        success: false,
        error: err.message || "An error occurred"
      });
    }
  }
}
