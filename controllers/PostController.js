import PostModel from '../models/Post.js';
import CommentModel from '../models/Comment.js';

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    const tags = [...new Set(posts.map(obj => obj.tags).flat())];
    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить теги',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const userId = req.query.user;
    const filter = userId ? { user: userId } : {};

    const posts = await PostModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('user')
      .lean();

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await CommentModel.countDocuments({ post: post._id });
        return { ...post, commentsCount };
      })
    );

    res.json(postsWithComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('user');

    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    res.json(doc);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статью',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findOneAndDelete({ _id: postId });

    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось удалить статью',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(','),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(','),
        user: req.userId,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при постановке лайка' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Убедимся, что количество лайков не становится отрицательным
    post.likes = Math.max(0, (post.likes || 0) - 1);

    await post.save();

    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при снятии лайка' });
  }
};
