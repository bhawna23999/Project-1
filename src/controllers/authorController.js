
const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")

const isValid = function(value)
{
    if(typeof value === 'undefined' || value === null)
    return false
    if(typeof value === 'string' && value.trim().length === 0)
    return false
    return true
}

const isValidTitle = function(title){
    return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const createAuthor = async function(req,res)
{
    try{
        let authorDetails = req.body
        if(!isValidRequestBody(authorDetails))
        return res.status(400).send({status:false, msg:"Please fill your details"})

        const {fname, lname, title, email, passsword} = authorDetails

        if(!isValid(fname))
        return res.status(400).send({status:false, msg:"Plear enter first name"})

        if(!isValid(lname))
        return res.status(400).send({status:false, msg:"Please enter last name"})

        if(!isValid(title))
        return res.status(400).send({status:false, msg:"Please enter title"})
        if(!isValidTitle(title))
        return res.status(400).send({status:false, msg:"titlt shoul be among Mr, Mrs, Miss"})

        if(!isValid(email))
        return res.status(400).send({status:false, msg:"please enter emailId"})
        if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
        return res.status(400).send({status:false,msg:"Please enter a valid emailId"})
        //check for unique mail
        let existmail = await authorModel.findOne({email:email})
        if(existmail)
        return res.status(400).send({status:false, msg:"This mail is already registered"})

        if(!isValid(passsword))
        return res.status(400).send({status:false, msg:"Please enter password"})

        let createdAuthor = await authorModel.create(authorDetails)
        res.status(201).send({status:true,msg:"Author created successfully",data:createdAuthor})            
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({status:false,error:err.message})
    }   
}

const getAuthor = async function(req,res)
{
    try{
        let getDetails = await authorModel.find()
        res.status(200).send({status:true,data:getDetails})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({status:false,error:err.message})
    }   
}

const login = async function(req,res){
    try{
        let data = req.body
        if(!isValidRequestBody(data))
        return res.status(400).send({status:false, msg:"please provide login details"})

        let{email,passsword} = data

        if(!isValid(email))
        return res.status(400).send({status:false,msg:"email id is missing"})
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
        return res.status(400).send({status:false, msg:"email should be valid email address"})  
        
        if(!isValid(passsword))
        return res.status(400).send({status:false,msg:"password is missing"})
       
        let author = await authorModel.findOne({email, passsword})
        if(!author)
        return res.status(400).send({status:false,msg:"invalid email or password"})

        let token = jwt.sign({
            authorId : author._id.toString()
        }, "project-one");

        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true,msg:"Author login successful", data: token });

    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})

    }
}

module.exports = {createAuthor, getAuthor, login}

