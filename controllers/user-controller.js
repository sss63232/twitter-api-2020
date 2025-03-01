const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Tweet, Reply, Like } = require('../models/db')
const helpers = require('../_helpers')
const sequelize = require('sequelize')

const userController = {
  signIn: (req, res, next) => {
    const { account, password } = req.body
    if (!account || !password) throw new Error('account and password are required!')

    return User.findOne({
      where: { account }
    })
      .then(user => {
        if (!user) throw new Error('帳號不存在！')
        if (user.role === 'admin') throw new Error('帳號不存在！')
        if (!bcrypt.compareSync(password, user.password)) throw new Error('password incorrect!')
        const userData = user.toJSON()
        delete userData.password
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
        return res.status(200).json({
          token,
          user: userData
        })
      })
      .catch(err => next(err))
  },
  signUp: (req, res, next) => {
    const { account, name, email, password, checkPassword } = req.body
    if (password !== checkPassword) throw new Error('Passwords do not match!')

    return User.findAll({
      $or: [
        { where: { account } },
        { where: { email } }
      ]
    })
      .then(users => {
        if (users.some(u => u.email === email)) throw new Error('email 已重複註冊！')
        if (users.some(u => u.account === account)) throw new Error('account 已重複註冊！')

        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        const ip = req.ip || req.connection.remoteAddress
        const ua = req.headers['user-agent'] || ''

        return User.create({
          ip,
          ua,
          avatar: `https://api.dicebear.com/6.x/fun-emoji/svg?seed=${email}`,
          account,
          password: hash,
          name,
          email,
          role: ''
        })
      })
      .then(newUser => {
        const user = newUser.toJSON()
        delete user.password
        return res.status(200).json(user)
      })
      .catch(err => next(err))
  },
  getCurrentUser: (req, res, next) => {
    const reqUser = helpers.getUser(req)
    const result = reqUser.toJSON()
    delete result.password
    delete result.Followers
    delete result.Followings
    return res.status(200).json(result)
  },
  getUser: (req, res, next) => {
    const userId = Number(req.params.id)
    const reqUserId = helpers.getUser(req).id
    User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: User, as: 'Followers', attributes: { exclude: ['password'] } },
        { model: User, as: 'Followings', attributes: { exclude: ['password'] } }
      ]
    })
      .then(user => {
        if (!user) throw new Error('帳號不存在！')
        if (user.role === 'admin') throw new Error('帳號不存在！')
        user.dataValues.isFollowed = user.Followers.map(u => u.id).includes(reqUserId)
        return res.status(200).json(user)
      })
      .catch(err => next(err))
  },
  putUserSetting: (req, res, next) => {
    const { account, name, email, password, checkPassword } = req.body
    if (password !== checkPassword) throw new Error('Passwords do not match!')
    if (!account || !name || !email) throw new Error('Account, name and email are required!')
    if (helpers.getUser(req).id !== Number(req.params.id)) throw new Error('permission denied')
    return Promise.all([
      User.findAll({
        where: {
          $or: [
            { account },
            { email }
          ]
        },
        raw: true,
        nest: true
      }),
      User.findByPk(Number(req.params.id)),
      bcrypt.hash(password, 10)
    ])
      .then(([checkUsers, user, hash]) => {
        if (!user) throw new Error('帳號不存在！')
        if (checkUsers.some(u => u.email === email && u.id !== helpers.getUser(req).id)) throw new Error('email 已重複註冊！')
        if (checkUsers.some(u => u.account === account && u.id !== helpers.getUser(req).id)) throw new Error('account 已重複註冊！')
        return user.update({
          account,
          name,
          email,
          password: hash
        })
      })
      .then(updatedUser => res.status(200).json({ user: updatedUser }))
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const getUserId = Number(req.params.id)
    const { name, introduction, avatar, cover } = req.body
    if (!name) throw new Error('name is required!')
    if (helpers.getUser(req).id !== getUserId) throw new Error('permission denied')
    return User.findByPk(getUserId)
      .then(user => {
        if (!user) throw new Error('帳號不存在！')
        return user.update({
          name,
          introduction,
          avatar: avatar ? avatar : user.avatar,
          cover: cover ? cover : user.cover
        })
      })
      .then(updatedUser => res.status(200).json({ user: updatedUser }))
      .catch(err => next(err))
  },
  getUserTweets: (req, res, next) => {
    const getUserId = Number(req.params.id)
    const reqUserId = helpers.getUser(req).id
    return Tweet.findAll({
      where: { UserId: getUserId },
      attributes: [
        ['id', 'tweetId'],
        'createdAt',
        'description',
        'image',
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM Likes WHERE Likes.TweetId = Tweet.id)'
          ),
          'LikesCount'
        ],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM Replies WHERE Replies.TweetId = Tweet.id)'
          ),
          'RepliesCount'
        ]
      ],
      include: [
        { model: User, attributes: ['id', 'name', 'account', 'avatar'] },
        { model: Like, attributes: ['userId'] }
      ],
      order: [['createdAt', 'DESC']]
    })
      .then(tweets => {
        if (tweets.length === 0) return res.status(200).json({ isEmpty: true })

        const result = tweets
          .map(t => ({
            ...t.toJSON()
          }))

        result.forEach(tweet => {
          tweet.isLiked = tweet.Likes.some(l => l.userId === reqUserId)
          delete tweet.Likes
        })
        return res.status(200).json(result)
      })
      .catch(err => next(err))
  },
  getReplies: (req, res, next) => {
    const getUserId = Number(req.params.id)
    return Reply.findAll({
      where: { UserId: getUserId },
      attributes: [
        ['id', 'replyId'],
        'comment',
        'createdAt'
      ],
      include: [
        { model: Tweet, attributes: [['id', 'tweetId'], 'description', 'image'], include: { model: User, attributes: ['id', 'name', 'account'] } },
        { model: User, attributes: ['id', 'name', 'account', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    })
      .then(replies => {
        if (replies.length === 0) return res.status(200).json({ isEmpty: true })

        const result = replies
          .map(r => ({
            ...r.toJSON()
          }))


        result.forEach(r => {
          if (!!r.Tweet) {
            r.Tweet.TweetUserId = r.Tweet.User.id
            r.Tweet.TweetUserName = r.Tweet.User.name
            r.Tweet.TweetUserAccount = r.Tweet.User.account
            delete r.Tweet.User
          }
        })

        return res.status(200).json(result)
      })
      .catch(err => next(err))
  },
  getFollowings: (req, res, next) => {
    const getUserId = Number(req.params.id)
    return User.findByPk(getUserId, {
      include: [{
        model: User, as: 'Followings',
        attributes: [
          ['id', 'followingId'],
          'name',
          'account',
          'avatar',
          'cover',
          'introduction'
        ]
      }],
      attributes: [
        ['id', 'userId'],
        'name',
        'account',
        'avatar',
        'cover'
      ]
    })
      .then(followings => {
        if (followings.Followings.length === 0) return res.status(200).json({ isEmpty: true })
        const followingId = helpers.getUser(req).Followings.map(user => user.id)
        const result = followings.Followings
          .map(f => ({
            ...f.toJSON(),
            isFollowed: followingId.includes(f.toJSON().followingId) || false
          }))
          .sort((a, b) => b.Followship.createdAt.getTime() - a.Followship.createdAt.getTime())
        result.forEach(i => delete i.Followship)
        return res.json(result)
      })
      .catch(err => next(err))
  },
  getFollowers: (req, res, next) => {
    const getUserId = Number(req.params.id)
    return User.findByPk(getUserId, {
      include: [{
        model: User, as: 'Followers',
        attributes: [
          ['id', 'followerId'],
          'name',
          'account',
          'avatar',
          'cover',
          'introduction'
        ]
      }],
      attributes: [
        ['id', 'userId'],
        'name',
        'account',
        'avatar',
        'cover'
      ]
    })
      .then(followers => {
        if (followers.Followers.length === 0) return res.status(200).json({ isEmpty: true })
        const followingId = helpers.getUser(req).Followings.map(user => user.id)
        const result = followers.Followers
          .map(f => ({
            ...f.toJSON(),
            isFollowed: followingId.includes(f.toJSON().followerId) || false
          }))
          .sort((a, b) => b.Followship.createdAt.getTime() - a.Followship.createdAt.getTime())
        result.forEach(i => delete i.Followship)
        return res.json(result)
      })
      .catch(err => next(err))
  },
  getLikes: (req, res, next) => {
    const getUserId = Number(req.params.id)
    return Like.findAll({
      where: {
        UserId: getUserId
      },
      include: {
        model: Tweet,
        include: [
          { model: User, attributes: ['id', 'name', 'account', 'avatar', 'cover'] },
          { model: Like, },
          { model: Reply }
        ]
      },
      attributes: { exclude: ['id', 'UserId', 'createdAt', 'updatedAt'] },
      order: [['createdAt', 'DESC']]
    },
    )
      .then(likes => {
        if (likes.length === 0) {
          return res.status(200).json({ isEmpty: true })
        }

        const getUserId = helpers.getUser(req).id
        const likesArray = likes
          .map(like => ({
            ...like.toJSON(),
            isLiked: like.Tweet ? like.Tweet.Likes.map(u => u.UserId).includes(getUserId) : false,
          }))
        likesArray
          .forEach(like => {
            if (!!like.Tweet) {
              like.Tweet.likesCount = like.Tweet.Likes.length
              like.Tweet.repliesCount = like.Tweet.Replies.length
              delete like.Tweet.Likes
              delete like.Tweet.Replies
              delete like.Tweet.UserId
              delete like.tweetId
            }

          })

        return res.json(likesArray)
      })
      .catch(err => next(err))
  },
  topFollowed: (req, res, next) => {
    const reqUser = helpers.getUser(req)

    return User.findAll({
      include: { model: User, as: 'Followers' },
      attributes: ['id', 'name', 'account', 'avatar', 'createdAt'],
      where: {
        role: { $not: 'admin' },
        id: { $not: reqUser.id }
      },
    })
      .then(users => {
        const reqUserFollowing = reqUser.Followings.length > 1 ? reqUser.Followings : [reqUser.Followings]

        const result = users
          .map(user => ({
            ...user.toJSON(),
            followedCount: user.Followers.length,
            isFollowing: reqUserFollowing.some(following => following.id === user.id)
          }))
          .sort((a, b) => b.followedCount - a.followedCount || b.createdAt - a.createdAt)
          .slice(0, 10)

        result.forEach(r => {
          delete r.Followers
        })

        res.status(200).json(result)
      })
      .catch(err => next(err))
  }
}

module.exports = userController