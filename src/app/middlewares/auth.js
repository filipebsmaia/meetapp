import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'O token não foi informado.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const dec = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = dec.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido.' });
  }
};
