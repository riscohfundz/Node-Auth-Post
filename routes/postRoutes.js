import express from 'express';
import { protectedRoute } from '../middlewares/authMiddlewares.js';
import multer from 'multer';
import path from 'path';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import fs, { unlink } from 'fs';
import { log } from 'console';

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
router.get('/my-posts', protectedRoute, async (req, res) => {

    try {

        const userId = req.session.user._id;
        const user = await User.findById(userId).populate('posts');

        if (!user) {
            req.flash('error', 'User not found!');
            return res.redirect('/');
        }

        res.render('posts/my-posts', {
            title: 'My Posts',
            active: 'my-posts',
            posts: user.posts
        });

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occured while fecthing your posts!');
        res.redirect('/my-posts')
    }
});


// route for create a new post
router.get('/create-post', protectedRoute, (req, res) =>{
    res.render('posts/create-post', {title: 'Create Post', active: 'create-post'})
});

//  route for edit post
router.get('/edit-post/:id', protectedRoute, async (req, res) => {
    try {

        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            req.flash('error', 'Post not found!');
            return res.redirect('/my-posts');
        }

       res.render('posts/edit-post', {
         title: 'Edit Post',
         active: 'edit-post', post});
      
     } catch (error) {
        console.error('error');
        req.flash('error', 'Something went wrong!');
        res.redirect('/my-posts');
        
    }
});



// Handle update a post request
router.post('/update-post/:id', protectedRoute, upload.single('image'), async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            req.flash('error', 'Post not found!');
            return res.redirect('/my-posts');
        }

        // Update text fields
        post.title = req.body.title;
        post.content = req.body.content;
        post.slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

        // If a new image is uploaded, delete the old one
        if (req.file) {
            const oldImagePath = path.join(process.cwd(), 'uploads', post.image);
            
            // Delete old image if it exists
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            // Assign new image filename
            post.image = req.file.filename;
        }

        // Save updated post
        await post.save();

        req.flash('success', 'Post updated successfully!');
        res.redirect('/my-posts');

    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong!');
        res.redirect('/my-posts');
    }
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

});

// handle delete post request
router.post('/delete-post/:id', protectedRoute, async (req, res) => {

    try {
        
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            req.flash('error', 'Post not found!');
            return res.redirect('/my-posts');
        }

        await User.updateOne({_id: req.session.user._id }, { $pull: { posts: postId } });
        await Post.deleteOne({_id: postId });

        unlink(path.join(process.cwd(), 'uploads') + '/' + post.image, (err) => {
            if (err) {
                console.log(err);
                
            }
        });

        req.flash('success', 'Post deleted successfully!');
        res.redirect('/my-posts');


    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong!');
        req.redirect('/my-posts');
        
    }
})



export default router;