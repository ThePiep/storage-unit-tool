
const steam_api = require('./controllers/steam');

const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000
const options = {
    root: path.join(__dirname, 'public'),
}

var apiRouter = require('./routes/api');

let demoLogger = (req, res, next) => {
    console.log(`Recieving ${req.method} request at ${req.path}.`);
    next();
}

app.use(demoLogger);
app.use(express.json())
app.use(express.static('public'))


app.use('/api', apiRouter);

app.get('/inv-value', (req, res) => {
    console.log(req.url)
    res.sendFile('./inv-value.html', options)
})

app.get('/', (req, res) => {

    console.log(req.url)
    res.sendFile('./index.html', options)
})



app.listen(port, () => {
    console.log(`CS:GO Storage Tool interface listening at http://localhost:${port}`)
})