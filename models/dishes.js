const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const currency = mongoose.Types.Currency;

const CommentSchema = new mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
})

const dishSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
    description:{
        type:String,
        required: true
    },
    image :{
        type:String,
        required:true
    },
    category:{
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
    },
    comments:[CommentSchema]
},{
    timestamps: true
});

const Dishes = mongoose.model('Dish',dishSchema);

module.exports = Dishes