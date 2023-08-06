const express = require('express')
const {getPublicMessage, getProtectedMessage, getAdminMessage} = require('./messages.service')
const messageRouter = express.Router()



messageRouter.get('/public', (req, res)=>{

    const message = getPublicMessage()
    res.status(200).json(message)
})

messageRouter.get('/protected', (req, res)=>{

    const message = getProtectedMessage()
    res.status(200).json(message)
})

messageRouter.get('/admin',  (req, res)=>{
    const message = getAdminMessage()
    res.status(200).json(message)
})

module.exports = {messageRouter}
