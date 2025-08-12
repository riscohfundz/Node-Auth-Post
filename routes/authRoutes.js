import express from 'express' ;
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { guestRoute, protectedRoute } from '../middlewares/authMiddlewares.js';

const router = express.Router();

import dotenv from 'dotenv';
dotenv.config();

// Looking to send emails in production? Check out our Email API/SMTP product!
// nodemailer credentials
console.log('MAIL_HOST:', process.env.MAIL_HOST);

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  
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
    res.render('forgot-password', { title: 'Forgot-password-page', active: 'forgot' });
});


// route for reset-password
router.get('/reset-password/:token', guestRoute, async (req, res) => {
    const {token} = req.params;
    const user = await User.findOne({token});

    if(!user) {
        req.flash('error', 'Link expired or invalid!');
        return res.redirect('/forgot-password');
    }

    res.render('reset-password', { title: 'Reset-password-page', active: 'reset', token });
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
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not found with this email!');
      return res.redirect('/forgot-password');
    }

    // Generate token and save
    const token = Math.random().toString(36).slice(2);
    user.token = token;
    await user.save();

    // Create reset link
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

    // Send email via Mailtrap
    const info = await transport.sendMail({
      from: '"Riscoh Tech" <no-reply@riscohtech.com>',
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello ${user.name || 'User'},</p>
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    if (info.messageId) {
      req.flash('success', 'Password reset link has been sent to your email!');
      res.redirect('/forgot-password');
    } else {
      req.flash('error', 'Error sending email');
      res.redirect('/forgot-password');
    }
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong, try again');
    res.redirect('/forgot-password');
  }
});

// Reset password request
router.post('/reset-password', async (req, res) =>{
    // console.log(req.body);
    const {token, new_password, confirm_password} = req.body;
    try {
        const user = await User.findOne({token});

        if(!user){
            req.flash('error', 'Invalid token');
        }
          if(new_password !== confirm_password){
            req.flash('error', 'Password do not math!');
            return res.redirect(`/reset-password/${token}`);
        }

           if(new_password.length < 6) {
          req.flash('error', 'Password must be at least 6 characters👍');
          return res.redirect(`/reset-password/${token}`)
        }
       // Hash the new password and clear the token
        user.password = await bcrypt.hash(new_password, 10);
        user.token = null;
        await user.save();

        req.flash('success', 'Password reset successful!');
        res.redirect('/login');

    } catch (error) {
       console.error(error);
       req.flash('error', 'Something went wrong, try again');
       res.redirect('/reset-password');
  }
    
    
});

export default router;
 