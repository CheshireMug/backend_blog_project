import express from 'express';
import multer from 'multer';
import cors from 'cors';

import mongoose from 'mongoose';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { getUserById } from './controllers/UserController.js';
import { likePost, unlikePost } from './controllers/PostController.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';
import commentRoutes from './routes/comments.js';
import User from './models/User.js';
import Post from './models/Post.js';


import { UserController, PostController } from './controllers/index.js';


mongoose.connect(
    'mongodb+srv://admin:wwwwww@cluster0.pzs15ho.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0'
).then(() => console.log('DB ok'))
.catch((err) => console.log('DB error', err))

const app = express();


const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
    '/posts/:id', 
    checkAuth, 
    postCreateValidation, 
    handleValidationErrors, 
    PostController.update
);
app.post('/posts/:id/like', likePost);
app.delete('/posts/:id/like', unlikePost);

app.get('/auth/user/:id', getUserById);

app.use('/api', commentRoutes);

app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server OK');
});
