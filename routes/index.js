/*
 * GET home page.
 */

var keys = null;

try {
  keys = require('./keys.json');
} catch (e) { 
}

var speachKey =  process.env.SPEACH_KEY || keys.speachKey;

exports.index = function(req, res){
  res.render('index', { title: 'Microsoft - Speech to Text Service',
                        key: speachKey });
};