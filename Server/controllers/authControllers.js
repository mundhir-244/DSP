const User = require('../models/users')
const { hashPassword, comparePassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken');
const axios = require('axios')
const { StreamChat } = require('stream-chat');
const streamChat = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

// Register Endpoint
const registerUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        // Username checks
        if (!userName) {
            return res.json({ error: 'Username is required' });
        }
        const userNameExists = await User.findOne({ userName });
        if (userNameExists) {
            return res.json({ error: 'Username is taken' });
        }

        // Password checks
        if (!password || password.length < 6) {
            return res.json({ error: 'Password should be at least 6 characters long' });
        }

        // Email checks
        if (!email) {
            return res.json({ error: 'Email is required' });
        }
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.json({ error: 'Email is taken' });
        }

        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            userName,
            email,
            password: hashedPassword
        });

        const id = user._id.toString();
        
        try {
            // Create streamChat user
            const existingUser = await streamChat.queryUsers({ id: id });
            if (existingUser.users.length > 0) {
                return res.status(400).send("User Id is already taken")
            }
            streamChat.upsertUser({ id, name: userName, email: email })
            return res.json(user);
            
        } catch (chatEngineError) {
            // Rollback user creation in MongoDB
            await User.findByIdAndDelete(id);
            console.error("ChatEngine error, user rolled back:", chatEngineError.message);
            return res.status(500).json({ error: 'Error creating ChatEngine user. Registration rolled back.' });
        }

    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};


// Login Endpoint
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        // Check if user exists
        const user = await User.findOne({email})
        if (!user) {
            return res.json({
                error: 'No user found'
            })
        }
        id = user._id.toString();
        // Check if passwords match
        const match = await comparePassword(password, user.password)
        if (match) {
            const streamToken = streamChat.createToken(id);
            jwt.sign({ email: user.email, id, userName: user.userName, profilePicUrl: user.profilePicUrl }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) throw err
                res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 })
                res.cookie('streamToken', streamToken, { httpOnly: true, secure: false, sameSite: 'Lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 })
                res.json([ { email: user.email, id, userName: user.userName, profilePicUrl: user.profilePicUrl } ,streamToken])
            } )
        } else {
            res.json({
                error: "Passwords do not match"
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const getProfile = async (req, res) => {
  const { token, streamToken } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user, streamToken });
  } catch (err) {
    console.error('JWT error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};

const logoutUser = (req, res) => {
    try {
        // Clear the cookies
        res.clearCookie('token')
        res.clearCookie('streamToken')
        // Send a response indicating the user has been logged out
        res.json({ message: 'Logged out successfully' })
    } catch (error) {
        console.log(error)
        res.json({ error: 'Something went wrong' })
    }
}


module.exports = {
    registerUser,
    loginUser,
    getProfile,
    logoutUser
}