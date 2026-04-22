export const getTestMessage = (req, res) => {
  res.status(200).json({ message: 'Backend running successfully' });
};
