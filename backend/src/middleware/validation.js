const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/asyncHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(ApiError(400, message));
  }
  next();
};

module.exports = validate;
