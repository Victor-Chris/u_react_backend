const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

//Parse Body for JSON Data
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods', 
        'GET, POST, PATCH, DELETE'
    );
    next();
})

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
})

app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(console.error);
    }
    res.status(console.error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});
})

mongoose.connect('mongodb+srv://victor:zdoKqOXpsMcjho5J@cluster0-6xmw7.mongodb.net/mern?retryWrites=true&w=majority', 
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
    app.listen(5000);
})
.catch((err) => {
    console.log(err);
});