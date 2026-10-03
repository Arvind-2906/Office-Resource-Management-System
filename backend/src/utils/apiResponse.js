class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, message = 'Resource created successfully', data = {}) {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Internal Server Error', errors = [], statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }

  static badRequest(res, message = 'Bad Request', errors = []) {
    return res.status(400).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message,
      errors: [message]
    });
  }

  static forbidden(res, message = 'Forbidden: You do not have permission to perform this action') {
    return res.status(403).json({
      success: false,
      message,
      errors: [message]
    });
  }

  static notFound(res, message = 'Requested resource not found') {
    return res.status(404).json({
      success: false,
      message,
      errors: [message]
    });
  }

  static conflict(res, message = 'Resource conflict detected', errors = []) {
    return res.status(409).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }
}

module.exports = ApiResponse;
