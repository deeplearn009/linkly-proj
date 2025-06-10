const express = require('express');
const {connect} = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const upload = require('express-fileupload')
const {notFound, errorHandler} = require("./middleware/errorMiddleware");
const routes = require('./routes/routes');
const {server, app} = require("./socket/socket");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({credentials: true, origin: ["http://localhost:5173"]}));
app.use(upload())

app.use('/api', routes)

app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_URL).then(server.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`))).catch(err => console.log(err));

console.log(`${process.env.MONGO_URL}://localhost:${process.env.PORT}`);
// console.log('JWT Secret:', process.env.JWT_SECRET);



