/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Mircrosft - Speech to Text Service' });
};