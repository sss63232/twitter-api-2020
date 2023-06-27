const { Count, User } = require('../models/db');

const keepAliveController = {
  async keepAlive(req, res, next) {
    const { headers: { 'x-keep-alive-api-secret': keepAliveApiSecret } } = req;
    const secret = process.env.KEEP_ALIVE_API_SECRET;

    if (keepAliveApiSecret !== secret) {
      return res.status(403).json({ error: 'Unauthorized secret' });
    }

    try {
      const usersCount = await User.count();
      const count = await Count.create({ usersCount });
      return res.status(200).json(count);
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = keepAliveController;