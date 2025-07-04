const express = require('express');
const {connect} = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const upload = require('express-fileupload')
const {notFound, errorHandler} = require("./middleware/errorMiddleware");
const routes = require('./routes/routes');
const adminRoutes = require('./routes/admin');
const storyRoutes = require('./routes/story');
const {server, app} = require("./socket/socket");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const allowedOrigins = [
  "https://linkly-proj-7jtf.vercel.app", // frontend
  "https://linkly-proj.vercel.app",      // backend (optional, for testing)
  "http://localhost:5173",
  "linkly-proj.onrender.com",
  "https://warm-begonia-fe513d.netlify.app"               // local dev (optional)
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(upload())
app.use('/api', routes)
app.use('/api/admin', adminRoutes)
app.use('/api/stories', storyRoutes)

app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_URL).then(server.listen(process.env.PORT || 6060, () => console.log(`Server started on port ${process.env.PORT}`))).catch(err => console.log(err));

console.log(`${process.env.MONGO_URL}://localhost:${process.env.PORT}`);



