const jwt = require("jsonwebtoken")



const authentication = async function(req,res, next)
{
    try
    {
        const token = req.headers["x-api-key"] || req.headers["x-Api-key"]
      
        if(!token)
        return res.status(403).send({status:false,msg:"token must be present"})
    
        const decoded = await jwt.verify(token,  "project-one")
      
        if(!decoded)
        return res.status(403).send({status:false,msg:"token is invalid"})

        req.authorId = decoded.authorId

        next()

    }
    catch(err){
        console.log(err.message)
        res.status(500).send({status:false, msg:err.message})
    }

}

module.exports = {authentication}