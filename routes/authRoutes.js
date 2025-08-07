import express from 'express' ;
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { guestRoute, protectedRoute } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Looking to send emails in production? Check out our Email API/SMTP product!
// nodemailer credentials
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5531ef58775ab0",
    pass: "22942e81528db6"
  }
});

// route for login
router.get('/login', guestRoute, (req, res) => {
    res.render("login", { title: 'Login-page', active: 'login' });
});

// route for register
router.get('/register', guestRoute, (req, res) => {
    res.render("register", { title: 'Register-page', active: 'register' });
});


// route for forgot-password
router.get('/forgot-password', guestRoute, (req, res) => {
    res.render("forgot-password", { title: 'Forgot-password-page', active: 'forgot' });
});


// route for reset-password
router.get('/reset-password', guestRoute, (req, res) => {
    res.render("reset-password", { title: 'Reset-password-page', active: 'reset' });

});

// route for profile page
router.get('/profile', protectedRoute, (req, res) => {
    res.render('profile', {title: 'Profile Page', active: 'profile'})
})

// handle user registration
router.post('/register', guestRoute, async (req, res ) => {
    const {name, email, password } = req.body;
    try {
        const userExists = await User.findOne({email});

        if(userExists){
            req.flash('error', 'User already exist with this email');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        user.save();
        req.flash('success', 'User registered successfully, you can login now!');
        res.redirect('/login');

    } catch (error) {
       console.error(error)
       req.flash('error', 'Something went wrong, try again');
       res.redirect('/register');
    } 
});

// handle user login request
router.post('/login', guestRoute, async(req, res) =>{
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email });
        if (user && (await bcrypt.compare(password, user.password))){
            req.session.user = user,
            res.redirect('/profile');
        } else {
            req.flash('error', 'Invaid email or password!');
            res.redirect('/login')
        }
    } catch (error) {
        console.error(error)
       req.flash('error', 'Something went wrong, try again');
       res.redirect('/login');
    } 
});

// handle user logout
router.post('/logout', (req, res) =>{
    req.session.destroy();
    res.redirect('/login');
});

//  handle forgot password
router.post('/forgot-password', async (req, res) =>{
    const {email} = req.body;
    // console.log(email);
    try {
         
        const user = await User.findOne({email});
        if(!user){
            req.flash('error', 'User not found with this email!');
            return res.redirect('/forgot-password');
        }
        const token = Math.random().toString(36).slice(2);
        // console.log(token);
        user.token = token;
        await user.save();

      const info = await transport.sendMail({
        from: '"Riscoh Tech" <ridwanadekunle.com>', // sender address
        to: email, // list of receivers
        subject: "Password Reset ✔", // subject line
        text: "Reset your password?", // plain‑text body
        html: `<p>Click this to reset your password: <a href='http://localhost:3000/
        reset-password/${token}'>Reset Password</a> <br> Thank you!</p>`, // HTML body
    });

    if(info.messageId){
        req.flash('success', 'Password reset link has been sent to your email!');
        res.redirect('/forgot-password');
    } else {
        req.flash('error', 'Error sending email');
        res.redirect('/forgot-password')
    }
        

    } catch (error) {
       console.error(error);
       req.flash('error', 'Something went wrong, try again');
       res.redirect('/forgot-password');
    }
    
})
export default router;
 