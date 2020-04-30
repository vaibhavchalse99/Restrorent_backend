const mongoose = require('mongoose')

const leaderSchema = new mongoose.Schema({
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
    abbr:{
        type:String,
        default: ''
    },
    designation:{
        type:String,
        required: true
    },
    feature:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const Leader = mongoose.model('Leader',leaderSchema)

module.exports = Leader