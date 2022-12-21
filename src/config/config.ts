import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const config = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',

  port: Number(process.env.PORT || 5000),
  resetPasswordExpMinutes: Number(process.env.RESET_PASSWORD_EXP_MINUTES || 15),
  logging: process.env.LOGGING === 'true',
  uploadDir: path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE || 1024),

  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
    email: process.env.SUPER_ADMIN_EMAIL || 'super@admin.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin',
  },

  jwt: {
    secret: String(process.env.JWT_SECRET || 'secret'),
    expDays: Number(process.env.JWT_EXP_DAYS || 30),
  },

  smtp: {
    host: String(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: String(process.env.SMTP_USER),
      pass: String(process.env.SMTP_PASS),
    },
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_MAIL}>`,
  },

  totalSpace: Number(process.env.TOTAL_SPACE || 5000) * 1048576, //bytes
}

export default config
