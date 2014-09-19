var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res)
{
	res.render('index', { title: 'Austin Restaurant Inspection Scores' });
});

module.exports = router;

