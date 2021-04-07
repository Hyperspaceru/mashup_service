const resolve = require ('path').resolve
require('dotenv').config();



module.exports = {
  
  development: {
    database: 'mashup',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },

  test: {
    database: 'mashup',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },

  production: {
    database: 'mashup',
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },  

  mashup: {
    downloadDir: resolve('./downloads'),
    vk: {
      email: process.env.VK_EMAIL,
      phone: process.env.VK_PHONE,
      password: process.env.VK_PASS,
      sessionFile: resolve("./sessions/vsCookies")
    },
    puppeteer:{
      cookies: resolve('./sessions/puppeteerCookies.json')
    },
    youtube: {
      email: process.env.YOUTUBE_EMAIL,
      password: process.env.YOUTUBE_PASS,
      cookies: resolve('./sessions/youtubeCookies.json')
    }
  }
};