const express = require('express')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const app = express();
const shorturls = require('./models/shorturl')

const connect = async() => {
    try {
        const con = await mongoose.connect('mongodb+srv://dev:test1234@cluster0.d1wo9.mongodb.net/URLShortner?retryWrites=true&w=majority');
        console.log(`Database is connected ${con.connection.host}`);
    } catch (err) {
        console.log(err)
        process.exit(1);
    }
}
connect()
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
}))

app.listen(3000 , console.log('server is listening.'));
app.set('view engine' , 'ejs');
app.use(express.urlencoded( {extended : false}))

app.get('/' , async (req,res) => {
    const shorturl = await shorturls.find()
    res.render('index' , { shorturl : shorturl});
})

app.post('/shorturl' , async (req,res) => {
    await shorturls.create({full : req.body.furl})
    res.redirect('/')
})

app.get('/:shorturl' , async (req,res) =>{
    const shorturl = await shorturls.findOne({ short : req.params.shorturl})
    if(shorturl ==null)
        return res.sendStatus(404)
    
    shorturl.clicks++
    shorturl.save()

    res.redirect(shorturl.full)
})

app.post('/delete/:id' ,async (req,res) => {
    try {
        await shorturls.remove( { _id:req.params.id})
        res.redirect('/')
    } catch (err) {
       console.log(err)
       return res.sendStatus(404)
    }
})