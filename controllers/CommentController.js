import CommentModel from '../models/Comment.js';

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      post: req.params.id,
      user: req.userId,
    });

    const comment = await doc.save();
    res.json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось создать комментарий' });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const comments = await CommentModel.find({ post: req.params.id })
      .populate('user', 'fullName avatarUrl')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось получить комментарии' });
  }
};

export const remove = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Комментарий не найден' });
    }

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    await CommentModel.findByIdAndDelete(commentId);

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Не удалось удалить комментарий' });
  }
};
