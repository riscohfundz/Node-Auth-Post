import express from 'express' ;

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
export default router;
 