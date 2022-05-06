const mongoose = require('mongoose')
const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")
const jwt = require("jsonwebtoken")
const ObjectId = mongoose.Types.ObjectId

const isValid = function(value)
{
    if(typeof value === 'undefined'|| value === null )
    return false
    if(typeof value === 'string' && value.trim().length === 0)
    return false
    return true
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const createBlog = async function(req,res)
{
    try{
        let blogData = req.body

        if(!isValidRequestBody(blogData))
        res.status(400).send({status:false, msg:"Please enter Blog details"})

        let {title, body, authorId, category, isPublished, isDeleted, tags, subcategory} = blogData

        if(!isValid(title))
        return res.status(400).send({status:false, msg:"Please enter title of your Blog"})

        if(!isValid(body))
        return res.status(400).send({status:false,msg:"Please enter body"})

        if(!isValid(category))
        return res.status(400).send({status:false,msg:"Please enter category"})

        if(!isValid(authorId))
        res.status(400).send({status:false,msg:"Please enter author Id"})
        if(!isValidObjectId(authorId))
        return res.status(400).send({status:false , message: '${authorId}is not a valid author id'})
        let author = blogData.authorId       
        let checkAuthor = await authorModel.findById(author)
        if(!checkAuthor)
        return res.status(400).send({status:false,msg:"Author does not exist"})

        const blogDataa = {
            title, 
            body, 
            authorId,
            category, 
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null,
            isDeleted: isDeleted ? isDeleted : false,
            deletedAt: isDeleted ? new Date() : null
        }

        if(tags)
        {
            if(Array.isArray(tags)){
                blogDataa['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags)=== "[object String]"){
                blogDataa['tags'] = [tags]
            }
        }

        if(subcategory)
        {
            if(Array.isArray(subcategory)){
                blogDataa['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory)=== "[object String]"){
                blogDataa['subcategory'] = [subcategory]
            }
        }
        
        let createdBlog = await blogModel.create(blogDataa)
        res.status(201).send({status:true,msg:"New blog created successfully",data:createdBlog})           
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})
    }   
}

const getBlog = async function(req,res){
    try{
        let getDetails = await blogModel.find()
        res.status(200).send({status:true,data:getDetails})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})
    }      
}

const getBlogWithAuth = async function (req,res){
    try{
        let getmixDetils = await blogModel.find().populate("authorId")
        res.status(200).send({status:true,data:getmixDetils})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})
    }  
}

const getPublishedBlog = async function(req, res){
    try {

        const filterQuery = {isDeleted:false,  isPublished:true}

        const queryParams = req.query

        if(isValidRequestBody(queryParams))
        {
            const {authorId, category, tags, subcategory} = queryParams

            if(isValid(authorId) && isValidObjectId(authorId)){
                filterQuery['authorId'] = authorId
            }

            if(isValid(category)){
                filterQuery['category'] = category.trim()
            }

            if(isValid(tags)){
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = {$all : tagsArr}
            }

            if(isValid(subcategory)){
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filterQuery['subcategory'] = {$all: subcatArr}
            }
        }
            
        let blogs = await blogModel.find(filterQuery)

        if(Array.isArray(blogs) && blogs.length === 0){
            return res.status(404).send({status:false,msg:"No Blog exist"})           
        }
        
        res.status(200).send({ status: true, msg:"Blogs list",data: blogs})
    }
    catch(err)
    {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const updateBlog = async function(req,res)
{
    try{
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        if(!isValidObjectId(blogId))
        return res.status(400).send({status:false, msg:`${blogId} is not a valig blog Id`})

        if(!isValidObjectId(authorIdFromToken))
        return res.status(400).send({status:false, msg:`${authorIdFromToken} is not a valid token id`})
       

        const blog = await blogModel.findOne({_id:blogId, isDeleted:false}) 

        if(!blog)
        return res.status(404).send({status:false,msg:"Blog not found"})

        if(blog.authorId.toString() !== authorIdFromToken)
        return res.status(401).send({status:false, msg:"unauthorized access! owner info does not matcg"})
        
        if(!isValidRequestBody(requestBody))
        return res.status(200).send({staus: true, msg:"Blog unmodified", data:blog})

        // Extract params 
        const {title, body, tags, category, subcategory, isPublished} = requestBody
     
        const updateBlogData = {}

        if(isValid(title)){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData,'$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['title'] = title
        }

        if(isValid(body)){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData,'$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['body'] = body
        }

        if(isValid(category)){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData,'$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['category'] = category
        }

        if(isPublished !== undefined){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData,'$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['isPublished'] = isPublished
            updateBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }

        if(tags){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData,'$addToSet')) updateBlogData['$addToSet'] = {}

            if(Array.isArray(tags))
            updateBlogData['$addToSet']['tags'] = {$each:[...tags]}

            if(typeof tags === "sting")
            updateBlogData['$addToSet']['tags'] = tags
        }

        if(subcategory){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData,'$addToSet')) updateBlogData['$addToSet'] = {}

            if(Array.isArray(subcategory))
            updateBlogData['$addToSet']['subcategory'] = {$each:[...subcategory]}

            if(typeof subcategory === "sting")
            updateBlogData['$addToSet']['subcategory'] = subcategory
        }  
        
        const updatedBlog = await blogModel.findOneAndUpdate({_id:blogId}, updateBlogData, {new:true})
        res.status(200).send({status:true,msg:"Blog updated Successfully",data:updatedBlog})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})
    }
}

const checkBlog = async function(req,res)
{
    try{
        let blogId = req.params.blogId
        const authorIdFromToken = req.authorId

        if(!isValidObjectId(blogId))
        return res.status(400).send({status:false, msg:`${blogId} is not a valid blog id`})

        if(!isValidObjectId(authorIdFromToken))
        return res.status(400).send({status:false, msg:`${authorIdFromToken} is not a valid token id`})

        let blog = await blogModel.findOne({_id:blogId, isDeleted:false})

        if(!blog)
        res.status(200).send({status:false, msg:"blog not found"})
        
        if(blog.authorId.toString() !== authorIdFromToken)
        return res.status(401).send({status:false, msg:"Unauthorized acess! owner info doesn't match"})

        await blogModel.findOneAndUpdate({_id:blogId},{$set:{isDeleted:true, deletedAt:new Date()}})
        res.status(200).send({status:true, msg:"blog deleted successfully"})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})
    }  
}

const deleteQuery = async function(req,res)
{
    try{

        const filterQuery = {isDeleted:false}
        let queryParams = req.query
        const authorIdFromToken = req.authorId

        if(!isValidObjectId(authorIdFromToken))
        return res.status(400).send({status:false, msg:`${authorIdFromToken} is not a valid token id`})

        if(!isValidRequestBody(queryParams))
        return res.status(400).send({status:false, msg:"No query params received"})

        const {authorId, category, tags,subcategory, isPublished} = queryParams

        if(isValid(authorId) && isValidObjectId(authorId))
        filterQuery['authorId'] = authorId

        if(isValid(category))
        filterQuery['category'] = category

        if(isValid(isPublished))
        filterQuery['isPublished'] = isPublished

        if(isValid(tags)){
            const tagsArr = tags.trim().split(',').map(tag => tag.trim())
            filterQuery['tags'] = {$all : tagsArr}
        }

        if(isValid(subcategory)){
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim())
            filterQuery['subcategory'] = {$all : subcatArr}
        }

        const blogs = await blogModel.find(filterQuery)

        if(Array.isArray(blogs) && blogs.length === 0)
        return res.status(404).send({status:false, message: 'No matching blogs found'})

        const idsOfBlogsToDelete = blogs.map(blog => {
            if(blog.authorId.toString() === authorIdFromToken)
            return blog._id
        })

        if(idsOfBlogsToDelete.length === 0)
        return res.status(404).send({status:false, msg:"no blogs found"})
   
        await blogModel.updateMany({_id:{$in:idsOfBlogsToDelete}},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true})
  
        res.status(200).send({status:false,msg:"blog(s) deleted successfully"})
    }
    catch(err){
        console.log(err.message)
        res.status(500).send({error:err.message})
    }    
}


module.exports = {createBlog, getBlog, getBlogWithAuth, getPublishedBlog, updateBlog, checkBlog, deleteQuery}