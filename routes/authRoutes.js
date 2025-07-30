import express from 'express' ;
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs';

const router = express.Router();

// route for login
router.get('/login', (req, res) => {
    res.render("login", { title: 'Login-page' });
});

// route for register
router.get('/register', (req, res) => {
    res.render("register", { title: 'Register-page' });
});


// route for forgot-password
router.get('/forgot-password', (req, res) => {
    res.render("forgot-password", { title: 'Forgot-password-page' });
});


// route for forgot-password
router.get('/reset-password', (req, res) => {
    res.render("reset-password", { title: 'Reset-password-page' });

});

// route for profile page
router.get('/profile', (req, res) => {
    res.render('profile', {title: 'Profile Page'})
})

// handle user registration
router.post('/register', async (req, res ) => {
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
router.post('/login', async(req, res) =>{
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email });
        if (user && (await bcrypt.compare(password, user.password))){
            req.session.user = User,
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
})

export default router;
 