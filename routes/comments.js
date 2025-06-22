import express from 'express';
import * as CommentController from '../controllers/CommentController.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.post('/posts/:id/comments', checkAuth, CommentController.create);
router.get('/posts/:id/comments', CommentController.getPostComments);
router.delete('/comments/:id', checkAuth, CommentController.remove);

export default router;
