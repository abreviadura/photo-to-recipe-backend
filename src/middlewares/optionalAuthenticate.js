import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    next();
    return;
  }

  try {
    const session = await SessionsCollection.findOne({ accessToken: token });
    if (!session) {
      next();
      return;
    }

    if (new Date() > new Date(session.accessTokenValidUntil)) {
      next();
      return;
    }

    const user = await UsersCollection.findById(session.userId);
    if (user) {
      req.user = user;
    }
  } catch {
    // ignore invalid session
  }

  next();
};
