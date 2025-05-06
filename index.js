const express = require('express')
const cors = require('cors')
const encodePassword = require('./crypto').encodePassword
const generateToken = require('./crypto').generateToken
const app = express()

app.use(cors())
app.use(express.json())

let users = []

app.post('/sign-up', (req, res) => { 
    const { email , password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message: 'Email and password are required!' })
    }
    if (password.length < 8) {
        return res.status(400).json({message : 'Password length should be minimum 8 symbols!!' })
    }
    if(users.find((user) => user.email === email)) {
       return res.status(400).json({message: 'User with this email already exists!' })
    }
    users.push({
        email, 
        password : encodePassword(password)
    })
    return res.status(201).json({message: 'Registered successfully!' })
})

app.post('/sign-in', (req, res) => {
    const { email , password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message: 'Email and password are required!' })
    }
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'User not found!' });
    }

    if (user.password !== encodePassword(password)) {
       return res.status(401).json({ message: 'Invalid password!' });
    }
    
    const token = generateToken(email);
    return res.status(200).json({ message: 'Login successful!', token, user: { email }
    })
})

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000')
})
