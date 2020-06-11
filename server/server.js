// Import express framework
import express from 'express'
// Import middleware
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
// Import routes
import MashupRoutes from './routes/MashupRoutes'
// Setup default port
const PORT = process.env.PORT || 4000
// Create express app
const app = express()
// Implement middleware
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    app.get('*', (req, res) => {
      res.sendFile('build/index.html', { root: __dirname })
  })
}
// Implement route for '/api' endpoint
app.use('/mashup/', MashupRoutes)
// Implement route for errors
app.use((err, req, res, next) => {
   console.error(err.stack)
   res.status(500).send('Something broke!')
})
// Start express app
app.listen(PORT, function() {
  console.log(`Server is running on: ${PORT}`)
})