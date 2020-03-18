const Expense = require('../models/expense.model.js')
const redis = require('redis')
const {
    buildSchema
} = require('graphql')
const expressGraphQL = require('express-graphql')

const findAll = async (req, res) => {
    try {
        const expenses = await Expense.find({})
        for (let i = 0; i < expenses.length; i++) {
            console.log(expenses[i].amount)
        }
        res.json({
            expense: expenses
        })
    } catch (err) {
        res.status(500).json({
            message: 'Error: ' + err
        })
    }
}

const create = async (req, res) => {
    try {
        console.log(req.body)
        const newExpenses = new Expense({
            amount: req.body.amount,
            notes: req.body.notes,
            category:req.body.category
        })
        const result = await newExpenses.save()
        res.json(result)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const createExpense = async (data) => {
    try {
        const newExpenses = new Expense({
            amount: data.amount,
            notes: data.notes,
            category : data.category
        });

        const result = await newExpenses.save();
        console.log("Insert success.")
    } catch (err) {
        console.log(err)
    }
};

const updateExpense = async (req, res) => {
    try {
        const id = req.params.id
        const body = req.body
        console.log(req.body)
        const data = await Expense.findOneAndUpdate({
            _id: id
        }, {
            $set: body
        }, {
            useFindAndModify: false
        })
        res.json({
            message: 'Updated',
            data
        })
    } catch (err) {
        console.log(err)

    }
}

const deleteExpense = async (data) => {
    try {
        const id = {
            _id: data.id
        }
        console.log(id)
        const result = await Expense.deleteOne(id, (err) => {
            if (err) throw err;
            console.log('Deleted')
        })


    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}

const findAllRedis = async (req, res) => {
    const client = redis.createClient()
    //    cek data di redis
    client.get('Expense', async (err, result) => {
        if (err) throw err

        //    jika ada maka tampilkan
        if (result) {
            const resp = JSON.parse(result)
            res.json({
                expenses: resp,
                from: 'Redis'
            })
        } else {
            //    jika tidak ada maka query ke db
            const expenses = await Expense.find({})
            const jsonExpenses = JSON.stringify(expenses)

            //    insert ke redis
            client.set('Expense', jsonExpenses)

            res.json({
                expenses: expenses,
                from: 'Mongo'
            })
        }
    })
}


const schema = buildSchema(`
    type Expense {
        id:String,
        amount:String,
        notes:String,
    }
    type Query{
        expenses: [Expense],
        expense(id:String):Expense
    }

    type Mutation {
        deleteExpense(id:String!): Expense,
        update(id:String,amount:String,notes:String):Expense,
        create(amount:String, notes:String): Expense
    }
`)

const root = {
    expenses: async () => {
        const dataexpenses = await Expense.find()
        console.log('ini jumlah yg ada di db ' + dataexpenses.length)
        return dataexpenses
    },
    deleteExpense: async ({
        data
    }) => {
        const expense = await Expense.findOne({
            _id: id
        })
        await Expense.deleteOne({
            _id: id
        })
        return expense
    },
    create: async ({
        amount,
        notes
    }) => {
        const newExpense = new Expense({
            amount: amount,
            notes: notes
        })
        const result = await newExpense.save()
        //        res.json(result)
        return result
    },
    expense: async ({
        id
    }) => {
        return await Expense.findOne({
            _id: id
        })
    },
    //    petByName:async ({name}) => {
    //        return await Pet.findOne({ name:name })
    //    },
    update: async ({
        id,
        amount,
        notes
    }) => {
        const updateExpense = {}
        if (amount) updateExpense.amount = amount
        if (notes) updateExpense.notes = notes
        return await Expense.findOneAndUpdate({
            _id: id
        }, {
            $set: updateExpense
        }, {
            useFindAndModify: false
        })
    }
}

const graphql = expressGraphQL({
    schema: schema,
    rootValue: root,
    graphiql: true

})

module.exports = {
    findAll: findAll,
    create: create,
    createExpense: createExpense,
    updateExpense: updateExpense,
    deleteExpense: deleteExpense,
    findAllRedis: findAllRedis,
    graphql
}