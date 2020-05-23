const mongoose = require('mongoose');


const favoriteSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref: 'User'
    },
    list:[{
        type:mongoose.Types.ObjectId,
        ref:'Dish'
    }]
},{
    timestamps:true
})

const Favorite = mongoose.model('Favorite',favoriteSchema);

module.exports = Favorite;