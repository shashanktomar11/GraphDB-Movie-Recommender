
var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var router = express.Router();

const driver = require('../helpers/neo4j');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Checking if user is autheticated
  if(!req.session.username) return res.redirect('/login');
  // console.log('user_id ', req.session.user_id);
  res.render('index', { title: 'Home', user_id: req.session.user_id });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login or Register' });
});

router.post('/login', async function(req, res, next) {
  //Check for credentials here
  console.log(req.body);
  try {
    const neo4jsession = driver.session();
        
    const result = await neo4jsession.run(
      `MATCH (consumer_login :Consumer {username: $username, password: $password})
      RETURN consumer_login`,
      req.body
    );
    console.log('result ',result);
  
    const singleRecord = result.records[0];
    if(!singleRecord) return next(createError(401, "Incorrect credentials!"))
    console.log('singleRecord ',singleRecord);

    const node = singleRecord.get(0)
    console.log('node ',node);
  
    console.log(node.properties.name);

    // Authenticate the request
    req.session.username = node.properties.username;
    req.session.user_id = node.properties.user_id;
    res.redirect('/');
    await neo4jsession.close()
    
  } catch(err) {
    console.log('err', err);
    next(createError(err));
  } 
});

router.get('/logout', function(req, res, next) {
  delete req.session.username;
  res.redirect('/');
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Add details', username:req.params.username });

});
router.post('/register/', async function(req, res, next) {
  console.log(req.body);
  // Add details in DB
  
  try {
    const neo4jsession = driver.session();
    const q1 = await neo4jsession.run('MATCH (c: Consumer) RETURN count(c) as count');
    req.body.user_id = parseInt(q1.records[0].get(0)) +1;
    // console.log('user_id', parseInt(req.body.user_id));
    const result = await neo4jsession.run(
      `CREATE (new_consumer : Consumer {user_id: $user_id, name: $name, dob: $DOB, gender: $gender,
        email: $email, username: $username, county: $country, password: $password}) return
        new_consumer
        `,
      req.body
    );
    console.log('result ',result);
  
    const singleRecord = result.records[0];
    console.log('singleRecord ',singleRecord);

    const node = singleRecord.get(0)
    console.log('node ',node);
  
    console.log(node.properties.name);

    // Authenticate the request
    req.session.username = node.properties.username;
    req.session.user_id = node.properties.user_id;
    res.redirect('/');
    await neo4jsession.close()
    
  } catch(err) {
    console.log('err', err);
    next(createError(err));
  } 


  
});

router.post('/addReview', async (req, res, next) => {
  console.log(req.body);
  req.body.user_id = parseInt(req.body.user_id); 
  req.body.movie_id = parseInt(req.body.movie_id); 
  req.body.rating = parseInt(req.body.rating); 
  
        try {
          const neo4jsession = driver.session();
          const result = await neo4jsession.run(
            `MATCH (consumer:Consumer {user_id: $user_id})
            MATCH (movie:Movie {movie_id: $movie_id})
            MERGE (consumer)-[op:RATED]->(movie)
            ON CREATE SET op.rating = $rating;
              `,
            req.body
          );
          res.send('Added succesfully');
          await neo4jsession.close()
          
        } catch(err) {
          console.log('err', err);
          next(createError(err));
        } 
      


  
});

router.post('/normal-search', async (req, res, next) => {
  // DB operations
  // console.log(req.body);
    try {
    const neo4jsession = driver.session();
    let q1 =   await neo4jsession.run('MATCH (c1:Consumer {user_id:$user_id})-[r:RATED]->(m:Movie) return count(r) as count;', {user_id: parseInt(req.body.user_id)});
    console.log(parseInt(q1.records[0].get(0)));
    if (parseInt(q1.records[0].get(0)) < 10) {
      console.log('if block');
      let qrarr = [];
  let my_data = {};
  Object.keys(req.body).forEach(k => {
      if(req.body[k]) {
      if (k != 'user_id') qrarr.push(`${k} : $${k}`);
      if (k == 'year' || k == 'user_id') {my_data[k] = parseInt(req.body[k])}
      else {my_data[k] = req.body[k].toLowerCase()}
      // else {my_data[k] = req.body[k]}
      }
  });
  console.log('my_data, ',my_data);
  let query_input = qrarr.join(' , ');
      let q2 = await neo4jsession.run('MATCH (m:Movie {'+query_input+'}) return m LIMIT 100;', my_data);
      let return_data = q2.records.map(r => r.get(0).properties);
      return res.json({status: 200, data: return_data})
    } else {
    let qr = `MATCH (c1:Consumer {user_id: $user_id})-[r:RATED]->(m:Movie) WITH c1, avg(r.rating) AS c1_mean MATCH (c1)-[r1:RATED]->(m:Movie)<-[r2:RATED]-(c2)
    WITH c1, c1_mean, c2, COLLECT({r1: r1, r2: r2}) AS ratings WHERE size(ratings) > 3 
    MATCH (c2)-[r:RATED]->(m:Movie) WITH c1, c1_mean, c2, avg(r.rating) AS c2_mean, ratings UNWIND ratings AS r 
    WITH sum( (r.r1.rating-c1_mean) * (r.r2.rating-c2_mean) ) AS nom,
         sqrt( sum( (r.r1.rating - c1_mean)^2) * sum( (r.r2.rating - c2_mean) ^2)) AS denom,
         c1, c2 WHERE denom <> 0
    WITH c1, c2, nom/denom AS pearson
    ORDER BY pearson DESC LIMIT 10
    MATCH (c2)-[r:RATED]->(m:Movie {`;
    let qrarr = [];
    let my_data = {};
    Object.keys(req.body).forEach(k => {
      if(req.body[k]) {
      if (k != 'user_id') qrarr.push(`${k} : $${k}`);
      if (k == 'year' || k == 'user_id') {my_data[k] = parseInt(req.body[k])}
      else {my_data[k] = req.body[k].toLowerCase()}
      // else {my_data[k] = req.body[k]}
      }
    });
    qr += qrarr.join(' , ');
    qr += `}) WHERE NOT EXISTS( (c1)-[:RATED]->(m) )
    RETURN m, SUM( pearson * r.rating) AS score
    ORDER BY score DESC LIMIT 100
      `;
      console.log('qr = ',qr);
      console.log('mydata ', my_data);
    const result = await neo4jsession.run(
      qr,
      my_data
    );
    console.log(result);
    let return_data = result.records.map(r => r.get(0).properties);
console.log(return_data);
    res.json({status: 200,data: return_data});
    }
    await neo4jsession.close()
    
  } catch(err) {
    console.log('err', err);
    res.json({status: 400,data: err});
  } 
});

// router.post('/advance-search', (req, res, next) => {
//   // DB operations
//   console.log(req.body);



//   res.json({status: 200,data: []});
// });

module.exports = router;

