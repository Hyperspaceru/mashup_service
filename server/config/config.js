import {resolve} from 'path'
require('dotenv').config();



module.exports = {

  // If using onine database
  // development: {
  //   use_env_variable: 'DATABASE_URL'
  // },

  development: {
    database: 'mashup',
    username: 'mashup',
    password: 'mashup',
    host: '127.0.0.1',
    dialect: 'postgres'
  },

  test: {
    database: 'book_test',
    username: 'steven',
    password: null,
    host: '127.0.0.1',
    dialect: 'postgres'
  },

  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  },

  mashup: {
    downloadDir: resolve('./public/downloads'),
    vk: {
      email: process.env.VK_EMAIL,
      phone: process.env.VK_PHONE,
      password: process.env.VK_PASS,
      sessionFile: resolve("./server/config/credentials/.my-session")
    },
    puppeteer:{
      cookies: resolve('./server/config/credentials/cookies.json')
    },
    youtube: {
      email: process.env.YOUTUBE_EMAIL,
      password: process.env.YOUTUBE_PASS
    }
  }
};