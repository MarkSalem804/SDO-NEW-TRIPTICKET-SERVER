const errorHandler = (err, req, res, next) => {
  console.error("❌ ERROR STACK:", err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred on the server.";

  // Sanitize Prisma errors (they are too verbose for Sonner)
  if (message.includes("prisma") || message.includes("invocation")) {
    console.error("🧹 Sanitizing Prisma error for UI...");
    
    if (message.includes("Unique constraint failed")) {
      message = "A record with this information already exists.";
      statusCode = 400;
    } else if (message.includes("Record to update not found")) {
      message = "The requested record was not found.";
      statusCode = 404;
    } else if (message.includes("Unknown argument")) {
      message = "Invalid configuration or mapping detected. Please check your inputs.";
      statusCode = 400;
    } else {
      message = "A database error occurred. Please try again or contact support.";
    }
  }

  res.status(statusCode).json({
    success: false,
    message: message, // Standardize on 'message' as used in controllers
    error: process.env.NODE_ENV === "development" ? message : undefined 
  });
};

module.exports = { errorHandler };
