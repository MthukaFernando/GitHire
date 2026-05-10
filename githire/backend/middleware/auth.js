const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Server error' });
  }
};

module.exports = authMiddleware;