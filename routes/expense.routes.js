const expenses = require('../controllers/expense.controller.js')

const routes = (app) => {
    app.use('/graphql', expenses.graphql)
    app.post('/create', expenses.create)
    app.post('/deleteexpense', expenses.deleteExpense)
    app.post('/updateExpense/:id', expenses.updateExpense)
    app.get('/findAllExpense', expenses.findAll)
    app.get('/findAllRedis', expenses.findAllRedis)
}

module.exports = routes;