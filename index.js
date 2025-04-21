const express = require('express')
const cors = require('cors')
const encodePassword = require('./crypto').encodePassword
const generateToken = require('./crypto').generateToken
const app = express()

app.use(cors())
app.use(express.json())

const users = []

app.post('/sign-up', (req, res) => { 
    const { email , password } = req.body;
    if (!email || !password) {
        res.status(400).json({message: 'Email and password are required!' })
        return
    }
    if (password.length < 8) {
        res.status(400).json({message : 'Password length should be minimum 8 symbols!!' })
        return
    }
    if(users.find((user) => user.email === email)) {
        res.status(400).json({message: 'User with this email already exists!' })
        return
    }
    users.push({
        email, 
        password : encodePassword(password)
    })
    res.status(201).json({message: 'Registered successfully!' })
})

app.post('/sign-in', (req, res) => {
    const { email , password } = req.body;
    if (!email || !password) {
        res.status(400).json({message: 'Email and password are required!' })
        return
    }
    const user = users.find(user => user.email === email);
    if (!user) {
        res.status(401).json({ message: 'User not found!' });
        return;
    }
    
    if (user.password !== encodePassword(password)) {
        res.status(401).json({ message: 'Invalid password!' });
        return;
    }
    
    const token = generateToken(email);
    res.json({ message: 'Login successful!', token, user: { email }
    })
})

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000')
})