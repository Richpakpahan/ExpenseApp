const mongoose = require('mongoose')

const expenseSchema = mongoose.Schema({
    amount: {
        type: String,
        required: true
    },
    category: String,
    notes: String
}, {
    timestamps: true
})

module.exports = mongoose.model('expenses', expenseSchema)