const express = require("express")
const dotenv = require('dotenv').config()
const cors = require('cors')
const { mongoose } = require('mongoose')
const cookieParser = require('cookie-parser')
const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.0.167:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

//Database Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Database Connected"))
.catch((e) => console.log(`Error: ${e}`))

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))

app.use('/', require('./routes/authRoutes'))
app.use('/', require('./routes/friendRoutes'))
app.use('/', require('./routes/crudFileRoutes'))

app.listen(3000, '0.0.0.0', () => {
  console.log("Server started on port 3000");
});
