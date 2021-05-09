const neo4j = require('neo4j-driver');
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'neo4j-pass'));
console.log(`Database running at ${'localhost:7687'}`);

module.exports = driver;
// const neo4jsession = driver.session();