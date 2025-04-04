// Helper function for error responses

const errorResponse = (
  res,
  status,
  message,
  error = null,
  description = null
) => {
  const response = { success: false, message };
  if (error) {
    response.error = error.message;
  }
  if (description) {
    response.description = description;
  }

  return res.status(status).json(response);
};
export default errorResponse;
