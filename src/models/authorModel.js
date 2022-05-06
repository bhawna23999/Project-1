const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    fname :{
        type : String,
        // required: "hi required",
        trim : true
    },
    lname: {
        type : String,
        required : true,
        trim : true
    },
    title: {
        type : String,
        required : true,
        enum : ["Mr", "Mrs", "Miss"]
    },
    email : {
        type : String,
        trim :  true,
        lowercase : true,
        unique : true,
        validate: {
            validator : function(v){
                return  /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(v);
            },
            message : "Please enter corret email",
        },
        required : true
    },
    passsword : {
        type: String,
        trim : true,
        required : true
    }

},{timestamps:true})

module.exports = mongoose.model('author', authorSchema)