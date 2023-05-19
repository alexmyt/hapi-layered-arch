import Joi from 'joi';

const user = Joi.object({
  id: Joi.number().alter({
    register: (schema) => schema.forbidden(),
    login: (schema) => schema.forbidden(),
    info: (schema) => schema.required(),
  }),
  name: Joi.string().alter({
    register: (schema) => schema.required(),
    login: (schema) => schema.forbidden(),
    info: (schema) => schema.forbidden(),
  }),
  email: Joi.string()
    .email()
    .alter({
      register: (schema) => schema.required(),
      login: (schema) => schema.required(),
      info: (schema) => schema.forbidden(),
    }),
  password: Joi.string().alter({
    register: (schema) => schema.required(),
    login: (schema) => schema.required(),
    info: (schema) => schema.forbidden(),
  }),
});

const userSchema = {
  login: user.tailor('login'),
  register: user.tailor('register'),
  info: user.tailor('info'),
};

export default userSchema;
