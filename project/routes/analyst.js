var express = require('express');
var router = express.Router();

function basicAuth(req, res, next) {
    //Change credentials if needed - ADMIN
    const auth = {login: 'analyst', password: 'password'}
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    if (login && password && login === auth.login && password === auth.password) {
      return next()
    }
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Authentication required.')
};


router.get('/',basicAuth, (req, res, next) => {
  res.render('analyst', { title: 'Analyst' });
});
  
router.get('/logout', (req, res, next) => {
    res.status(401).send('Logged Out.');
});


  

module.exports = router;