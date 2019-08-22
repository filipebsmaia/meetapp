import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../../config/auth';

class UserController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(4),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'A validação falhou.' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'O usuário não existe.' });
    }

    if (await !user.checkPassword(password)) {
      return res.status(401).json({ error: 'A senha não coincide.' });
    }

    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new UserController();
