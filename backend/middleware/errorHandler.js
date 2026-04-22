// Basic centralized error handler for future API expansion.
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({ message: 'Internal server error' });
};

export default errorHandler;
