const express = require('express');
const router = express.Router();
const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleWare1 = require("../middleware/authentication")


router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/authors",authorController.createAuthor)
router.get("/getAuthor",authorController.getAuthor)

router.post("/createBlog",middleWare1.authentication, blogController.createBlog)
router.get("/getBlog", blogController.getBlog)
router.get("/getBlogWithAuth", blogController.getBlogWithAuth)

router.get("/getPublishedBlog",middleWare1.authentication,blogController.getPublishedBlog)

router.put("/updateBlog/:blogId",middleWare1.authentication,blogController.updateBlog)

router.delete("/checkBlog/:blogId",middleWare1.authentication,blogController.checkBlog)

router.delete("/deleteQuery",middleWare1.authentication,blogController.deleteQuery )

router.post("/login",authorController.login)
module.exports = router;