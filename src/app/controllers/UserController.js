import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string().required(),
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

    const hasUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (hasUser) {
      return res.status(401).json({ error: 'O usuário já existe.' });
    }

    const { id, name, email } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(4),
      oldPassword: Yup.string()
        .min(4)
        .when('password', (pw, field) => (pw ? field.required() : field)),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'A validação falhou.' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const found = await User.findOne({
        where: {
          email,
        },
      });

      if (found) {
        return res
          .status(401)
          .json({ error: 'Já existe um usuario com este email.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'A senha esta incorreta.' });
    }

    const updated = await user.update(req.body);

    return res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
    });
  }
}

export default new UserController();
