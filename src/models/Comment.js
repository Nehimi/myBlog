const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',//reference to User model who created the comment
    required: true
  },
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',//reference to BlogPost model 
    required: true
  },
  parent: { //what it means user can comment on blog post or on comment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

commentSchema.pre('save', async function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  if (this.isNew && this.parent) {
    await this.constructor.findByIdAndUpdate(this.parent, {
      $push: { replies: this._id }
    });
  }
  
  next();
});

commentSchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('BlogPost').findByIdAndUpdate(this.blogPost, {
      $inc: { commentsCount: 1 }
    });
  }
});

commentSchema.post('remove', async function() {//cascasing deletion of comments and replies
  await mongoose.model('BlogPost').findByIdAndUpdate(this.blogPost, {
    $inc: { commentsCount: -1 }
  });
  
  if (this.parent) {//if comment is a reply
    await this.constructor.findByIdAndUpdate(this.parent, {
      $pull: { replies: this._id }
    });
  }
  
  await this.constructor.deleteMany({ parent: this._id });//delete all replies(children comments)
});

commentSchema.index({ blogPost: 1, createdAt: -1 });//index for blog post and created at
commentSchema.index({ author: 1 });//index for author why? because we want to show comments by author
commentSchema.index({ parent: 1 });//index for parent why? because we want to show replies

module.exports = mongoose.model('Comment', commentSchema);
