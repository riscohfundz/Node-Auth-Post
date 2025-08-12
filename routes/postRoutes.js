import express from 'express';
import { protectedRoute } from '../middlewares/authMiddlewares.js';
import multer from 'multer';
import path from 'path';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';

const router = express.Router();

// set up storage engine using multer

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// initialize upload variable with the storage engine
const upload = multer ({storage: storage});

// route for home page
router.get("/", (req, res) => {
    res.render("index", { title: 'Home-page' , active: 'home'});
});  

// route for my posts page
router.get('/my-posts', protectedRoute, (req, res) => {
    res.render('posts/my-posts', {title: ' My Posts', active: 'my-posts'});
});


// route for create a new post
router.get('/create-post', protectedRoute, (req, res) =>{
    res.render('posts/create-post', {title: 'Create Post', active: 'create-post'})
});

//  route for edit post
router.get('/edit-post/:id', protectedRoute, (req, res) => {
    res.render('posts/edit-post', {title: 'Edit Post', active: 'edit-post'});
});

// route for  view post in detail
router.get('/post/:id', (req, res) => {
    res.render('posts/view-post', {title: 'View Post', active: 'view-post'});
});

// handle create new post

router.post('/create-post',  protectedRoute,  upload.single('image'),  async (req, res) => {
    try {
        const {title, content} = req.body;
        const image = req.file.filename;
        const slug = title.replace(/\s+/g, '-').toLowerCase();

        const user = await User.findById(req.session.user._id);

        // handle create new post 
        const post = new Post ({ title, slug, content, image, user });

        // save post in user post new
        await User.updateOne({_id: req.session.user._id}, {$push: {posts: post._id} });
        
        await post.save();

        req.flash('success', 'Post created successfully!');
        res.redirect('/my-posts');

        
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong!');
        res.redirect('/create-post');
        
    }

} 
)


export default router;