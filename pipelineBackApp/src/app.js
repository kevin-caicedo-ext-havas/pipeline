import express from 'express'
import cors from 'cors'
import businessRoutes from './routes/business.route.js'

const app = express()

// Allow Request from Angular
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use(businessRoutes)

export default app