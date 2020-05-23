const express = require('express');
const Authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');

const router = express.Router()
router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    Favorite.findOne({user:req.user._id})
    .populate('user list')
    .exec((err,favorite)=>{
        if(err || !favorite){
            return res.status(400).json({
                error:"No Favourite Found for user"+req.user.username
            })
        }
    res.json(favorite)
    })
})
.post(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    var newData = req.body.map(data=>{
        return data._id
    })

    if (newData.length == 0){
        return res.status(400).json({
            error:"No Data found in Body"
        })
    }
    Favorite.findOne({user:req.user._id}).exec((err,data)=>{
        if (err){
            return res.status(400).json({
                error:"Error"
            })
        }

        if(!data){
            var fav = new Favorite({
                user:req.user._id,
                list:newData
            })
            fav.save((err,data)=>{
                if (err || !data){
                    return res.status(400).json({
                        error:"Somethind went Wrong"
                    })
                }
                return res.json({
                    message:'Data Added'
                })
            })    
        }
        console.log(data.list)
        var arr = newData
        var lst = data.list

        arr.forEach(fav =>{
            if (!lst.includes(fav)){
                lst.push(fav)
            }
        })
        data.list = lst
        data.save((err,newData)=>{
            if(err || !data){
                return res.status(400).json({
                    error:"Error While Update"
                })
            }
            res.json({
                message:'Data Appended'
            })
        })
        
    })
})
.put(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    res.statusCode = 403; 
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    Favorite.findOneAndRemove({user:req.user._id},(err,data)=>{
        if (err){
            return res.status(400).json({
                error:"Cant Delete the Favourite Items"
            })
        }
        res.json(data)
    })
})


router.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    res.statusCode = 403; 
    res.end('GET operation not supported on /favorites/:dishId');
})
.post(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    Favorite.findOne({user:req.user._id}).exec((err,data)=>{
        console.log(data)
        if(err){
            return res.status(400).json({
                error:"Something Went Wrong"
            })
        }
       
        if(!data){
            var fav = new Favorite({
                user:req.user._id,
                list:[req.params.dishId]
            })
            fav.save((err,data)=>{
                if (err || !data){
                    return res.status(400).json({
                        error:"Somethind went Wrong"
                    })
                }
                return res.json({
                    message:'Data Added'
                })
            })    
        }
        else{
            lst = data.list
            if (!lst.includes(req.params.dishId)){
                lst.push(req.params.dishId)
            }
            else{
                return res.status(400).json({
                    error:"Dish Already Present"
                })
            }
            
            Favorite.findOneAndUpdate({'user':req.user._id},{
                $set:{list:lst},
                },{new:true},(err,data)=>{
                if(err || !data){
                    return res.status(400).json({
                        error:"Error While Update"
                    })
                }
                res.json({
                    message:'Data Appended'
                })
        
            })
        }   
      
    })
})
.put(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    res.statusCode = 403; 
    res.end('PUT operation not supported on /favorites/:dishId');
})
.delete(cors.corsWithOptions,Authenticate.verifyUser,(req,res)=>{
    Favorite.findOne({user:req.user._id},(err,data)=>{
        if (err || !data){
            return res.status(400).json({
                error:"Cant Delete the Favourite Items"
            })
        }
        var lst = data.list.filter(value=>{
            if(value!= req.params.dishId){
                return value
            }
        })
        if(lst.length == data.list.length){
            return res.status(400).json({
                error:"data not found"
            })
        }
        data.list = lst
        data.save((err,item)=>{
            if(err || !item){
                return res.status(400).json({
                    error:"Somethig Went Wrong while saving"
                })
            }
            return res.json(item)
        })
        
    })    
})



module.exports = router;
