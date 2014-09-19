var express = require('express');
var router = express.Router();


function get_data(db, host, path, offset, limit)
{
	var http = require("http");
	
	var dataset_complete = false;

	var url_path = path + offset + '&$limit=' + limit;
	var options =
	{
		host: host,
		path: url_path
	};
	var request= http.request(options, function(response)
	{
		var data = '';
		response.on('data', function(chunk)
		{
			data += chunk;
		});
		response.on('end', function()
		{
			console.log("Dataset retrieved successfully");
			db.collection('restaurants').insert(JSON.parse(data), function(err, result) {
				if (err) { console.log("Problem updating DB") }
				if (result)
				{}
			});
		});
	});

	request.on('error', function(e)
	{
		console.log("An error occurred retrieving from endpoint: " + e.message);
	});
	request.end();
}

function get_data_set(db)
{
	var host = 'data.austintexas.gov';
	var path = '/resource/ecmv-9xxi.json?$offset=';
	var offset = 0;
	var limit  = 1000;
	var chunks = 20;

	for (var i = 0; i < chunks; i++)
	{
		get_data(db, host, path, offset, limit);
		offset = offset + limit;
	}
}

/*
 * GET restaurantlist
 */
router.get('/dataset', function(req, res)
{
	get_data_set(req.db);
	res.json({});
});


/*
 * GET Elite restaurants
 */
router.get('/100', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({score: {$gt: 99}, inspection_date: {$gt: 1388534400}}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


/*
 * GET restaurants with 90 <= score < 100 
 */
router.get('/90s', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({score: {$gte: 90, $lt: 100}, inspection_date: {$gt: 1388534400}}).sort({facility_id: 1, inspection_date: -1}).toArray(
  //db.collection('restaurants').find({}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


/*
 * GET restaurants with 80 <= score < 90 
 */
router.get('/80s', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({score: {$gte: 80, $lt: 90}, inspection_date: {$gt: 1388534400}}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


/*
 * GET restaurants with 70 <= score < 80 
 */
router.get('/70s', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({score: {$gte: 70, $lt: 80}, inspection_date: {$gt: 1388534400}}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


/*
 * GET restaurants with 60 <= score < 70 
 */
router.get('/60s', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({score: {$gte: 60, $lt: 70}, inspection_date: {$gt: 1388534400}}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


/*
 * GET restaurants with score < 60 
 */
router.get('/50s', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({score: {$lt: 60}, inspection_date: {$gt: 1388534400}}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


/*
 * GET all restaurants
 */
router.get('/all', function(req, res) {
  var db = req.db;
  db.collection('restaurants').find({}).sort({facility_id: 1, inspection_date: -1}).toArray(
	function(err, items){
		if (err) { console.log("Problem retrieving restaurant information from DB") }
		if (items)
		{
		  res.json(items);
		}
	});
});


module.exports = router;
