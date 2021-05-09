var express = require('express');
var router = express.Router();
var createError = require('http-errors');


const driver = require('../helpers/neo4j');

function basicAuth(req, res, next) {
    //Change credentials if needed - ADMIN
    const auth = {login: 'admin', password: 'password'}
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    if (login && password && login === auth.login && password === auth.password) {
      return next()
    }
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Authentication required.')
};


router.get('/',basicAuth, (req, res, next) => {



  res.render('admin', { title: 'Admin'});
});
  
router.get('/logout', (req, res, next) => {
    res.status(401).send('Logged Out.');
});

router.post('/addMovie', async (req, res, next) => {
    console.log(req.body);
    // DB operations 
    try {
        let qrarr = [];
        let my_data = {};
        const neo4jsession = driver.session();
        const q1 = await neo4jsession.run('MATCH (m:Movie) RETURN max(m.movie_id);');
        my_data.movie_id = parseInt(q1.records[0].get(0)) +1;
        console.log(my_data);

        let q = 'CREATE (m: Movie{movie_id: $movie_id, ';

        Object.keys(req.body).forEach(k => {
            // if(req.body[k]) {
            if (k != 'movie_id') qrarr.push(`${k} : $${k}`);
            if (k == 'year' || k == 'duration' || k == 'movie_id') {my_data[k] = parseInt(req.body[k])}
            else {my_data[k] = req.body[k].toLowerCase()}
            // }
          });
        q += qrarr.join(' , ');
        q += '}) RETURN m;';
        // console.log(q);
        // console.log(my_data);
        const result = await neo4jsession.run(q, my_data);
        console.log('result ',result);
      
        const singleRecord = result.records[0];
        // console.log('singleRecord ',singleRecord);
    
        const node = singleRecord.get(0);
        // console.log('node ',node);
      
        // console.log(node.properties.name);
            if (node.properties.movie_id) res.send('Added succesfully');
            else next(createError(400, "Movie could't be added"));
        await neo4jsession.close()
        
      } catch(err) {
        console.log('err', err);
        next(createError(err));
      } 

});

router.post('/editMovie', async (req, res, next) => {
    console.log(req.body);
    // DB operations 
    try {
        const neo4jsession = driver.session();
        let q = 'MATCH (m: Movie{movie_id: $movie_id}) SET ';
        let qrarr = [];
        let my_data = {};
        Object.keys(req.body).forEach(k => {
            // if(req.body[k]) {
            if (k != 'movie_id') qrarr.push(`m.${k} = $${k}`);
            if (k == 'year' || k == 'duration' || k == 'movie_id') {my_data[k] = parseInt(req.body[k])}
            else {my_data[k] = req.body[k].toLowerCase()}
            // }
          });
        q += qrarr.join(' , ');
        q += ' RETURN m;';
        console.log(q);
        console.log(my_data);
        const result = await neo4jsession.run(q, my_data);
        // console.log('result ',result);
      
        const singleRecord = result.records[0];
        // console.log('singleRecord ',singleRecord);
    
        const node = singleRecord.get(0);
        // console.log('node ',node);
      
        // console.log(node.properties.name);
            if (node.properties.movie_id) res.send('Added succesfully');
            else next(createError(400, 'Movie not found!!'));
        await neo4jsession.close()
        
      } catch(err) {
        console.log('err', err);
        next(createError(err));
      } 
});

router.post('/deleteMovie',async (req, res, next) => {
    console.log(req.body);
    req.body.movie_id = parseInt(req.body.movie_id);
    try {
        const neo4jsession = driver.session();
        const result = await neo4jsession.run(
          `MATCH (movie:Movie {movie_id: $movie_id})
          DETACH DELETE(movie);
            `,
          req.body
        );
        console.log('result ',result);
      
        const singleRecord = result.records[0];
        console.log('singleRecord ',singleRecord);
    
        // const node = singleRecord.get(0)
        // console.log('node ',node);
      
        // console.log(node.properties.name);
    
        res.send('Deleted succesfully');
        await neo4jsession.close()
        
      } catch(err) {
        console.log('err', err);
        next(createError(err));
      } 
    
});

  

module.exports = router;