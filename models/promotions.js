const mongoose = require('mongoose')
require('mongoose-currency').loadType(mongoose)
const currency = mongoose.Types.Currency

const promotionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique: true
    },
    description:{
        type:String,
        required: true
    },
    image :{
        type:String,
        required:true
    },
    label:{
        type:String,
        default: ''
    },
    price:{
        type:currency,
        required:true,
        min:0
    },
    feature:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const Promotion = mongoose.model('Promotion',promotionSchema)

module.exports = Promotion