import db from '@/config/db'
import passwordService from '@/services/password.service'
import Joi from 'joi'

export const uniqueEmailLookup =
  (exludeId?: number): Joi.ExternalValidationFunction =>
  async (val) => {
    const count = await db.user.count({ where: { email: val, id: { not: exludeId } } })
    if (count) {
      throw new Joi.ValidationError('"Email" already exists.', [{ message: '"Email" already exists.', path: ['email'] }], val)
    }
  }

export const registeredEmailLookup =
  (exludeId?: number): Joi.ExternalValidationFunction =>
  async (val) => {
    const count = await db.user.count({ where: { email: val, id: { not: exludeId } } })
    if (!count) {
      throw new Joi.ValidationError('"Email" is not registered.', [{ message: '"Email" is not registered.', path: ['email'] }], val)
    }
  }

export const passwordMatchLookup =
  (password: string): Joi.ExternalValidationFunction =>
  async (val) => {
    const match = await passwordService.verify(val, password)
    if (!match) {
      throw new Joi.ValidationError('"Password" is not valid.', [{ message: '"Password" is not valid', path: ['password'] }], val)
    }
  }

export const uniqueRoleNameLookup =
  (exludeId?: number): Joi.ExternalValidationFunction =>
  async (val) => {
    const count = await db.role.count({ where: { name: val, id: { not: exludeId } } })
    if (count) {
      throw new Joi.ValidationError('"Name" already exists.', [{ message: '"Name" already exists.', path: ['name'] }], val)
    }
  }
