const express = require('express');
const bodypars = require('body-parser');
const expense = require('./controllers/expense.controller.js')
const mongoose = require('mongoose')
const Expenses = require('./models/expense.model.js');

const app = express();

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodypars.json())

const MongoClient = require('mongodb').MongoClient;

const PORT = process.env.PORT || 3000;
const url = process.env.MONGODB_URL || "mongodb+srv://mike:mike@cluster0-i3mcu.gcp.mongodb.net/test?retryWrites=true&w=majority";

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/addExpense', (req, res) => {
    res.render('expenses')
})

app.get('/edit/', (req, res) => {
    res.render('edit')
})

const connect = async () => {
    try {
        const db = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Successfully connected to the database')
    } catch (err) {
        console.log('Could not connect to the database. Error: ', err)
        process.exit()
    }
}

connect()

const routes = require('./routes/expense.routes.js')

routes(app)

const server = app.listen(PORT, function () {
    console.log('Server is running...');
    console.log(`Listen on Port ${PORT}`)
});

const io = require('socket.io')(server)

io.on('connection', async (socket) => {
    console.log('Connected!')
    const data = await Expenses.find({});
    io.emit('get_data', data);

    socket.on('new_message', (data) => {
        console.log("receiving : " + data.amount + " from the client." + data.notes+ "this is category "+ data.category) ;
        expense.createExpense(data);
        io.emit('new_message', data);
    });

    socket.on('deleted', (data) => {
        console.log("receiving : " + data.id) ;
        expense.deleteExpense(data);
        io.emit('new_message', data);
    });
})