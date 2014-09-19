// DOM Ready =============================================================
$(document).ready(function() {

  // Populate the map on initial page load
  initialize();
});

// Functions =============================================================

var fork_green  = '/images/fork_green.png';
var fork_yellow = '/images/fork_yellow.png';
var fork_red    = '/images/fork_red.png';

var map = null;
var markers = [];
var infowindows = [];
var markerCluster = null;


// Functions =============================================================

function CreateMap()
{
	// The center of Austin, Texas
	var mapcenter = new google.maps.LatLng(30.2500, -97.7500);
	var zoom      = 12;
	var map_id    = 'map-canvas';

	var mapOptions =
	{
		center: mapcenter,
		zoom: zoom,
	};
	var new_map = new google.maps.Map(document.getElementById(map_id), mapOptions);
	return new_map;
}

function CreateMarker(data)
{
	//
	// Create a restaurant marker
	//
	var image = fork_green;
	if (data.score < 75)
	{
		image = fork_red;
	}

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(data.address.latitude, data.address.longitude),
		map: map,
		title: data.restaurant_name,
		icon: image
	});
	markers.push(marker);
	return marker;
}

function CreateInfoWindow(data)
{
	//
	// Create an info window
	//
	var locale_date = new Date(data.inspection_date * 1000);
	var contentString =
		'<h4 id="firstHeading" class="firstHeading">' + data.restaurant_name + '</h4>' +
		'<b>Inspection Scores:</b>' +
		'<br><b>' + data.score + '</b> (' + locale_date.toLocaleDateString() + ')';

	var infowindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 600
	});
	infowindows.push(infowindow);
	return infowindow;
}

function UpdateInfoWindow(data, infowindow)
{
	// Update the info window with historical inspection scores
	var locale_date = new Date(data.inspection_date * 1000);
	var contentString = infowindow.getContent() +
		'<br><b>' + data.score + '</b> (' + locale_date.toLocaleDateString() + ')';
	infowindow.setContent(contentString);
}

function CreateClusters()
{
	//
	// Cluster management
	//
	markerCluster = new MarkerClusterer(map, markers, { maxZoom: 15 });
}

function ClearMarkers()
{
	for (var i = 0; i < markers.length; i++)
	{
		markers[i].setMap(null);
	}
	markers = [];
}

function ClearClusters()
{
	if (markerCluster != null)
	{
		markerCluster.clearMarkers();
		markerCluster = null;
	}
}

function ClearInfoWindows()
{
	infowindows = [];
}

function ClearMap()
{
	ClearMarkers();
	ClearClusters();
	ClearInfoWindows();
}

function PopulateMarkers(data_url)
{
	// Clear the map of all the existing markers before loading the new ones

	$.getJSON( data_url, function( data )
	{
		var prev_facility_id = 0;
		var current_infowindow = null;

		ClearMap();

		$.each(data, function()
		{
			if (this.facility_id != prev_facility_id)
			{
				// New facility id encountered.
				// Create marker with most recent information
				var marker = CreateMarker(this);
				var infowindow = CreateInfoWindow(this);
				current_infowindow = infowindow;

				google.maps.event.addListener(marker, 'click', function() {
						infowindow.open(map, marker);
				});

				prev_facility_id = this.facility_id;
			}
			else
			{
				// Update info window with previous inspection scores
				UpdateInfoWindow(this, current_infowindow);
			}
		});
	
		CreateClusters();
	});
}

function FilterControl(controlDiv, buttonText, data_url)
{
	controlDiv.style.padding = '5px';

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '1px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to display ' + buttonText + ' scorers';
	controlDiv.appendChild(controlUI);

	var controlText = document.createElement('div');
	controlText.style.fontFamily = 'Arial,sans-serif';
	controlText.style.fontSize = '12px';
	controlText.style.paddingLeft = '4px';
	controlText.style.paddingRight = '4px';
	controlText.innerHTML = '<b>' + buttonText + '</b>';
	controlUI.appendChild(controlText);

	google.maps.event.addDomListener(controlUI, 'click', function() {
		PopulateMarkers(data_url);
	});
}


function initialize()
{
	map = CreateMap();

	//
	// Top scorers button
	//
	var score100ControlDiv = document.createElement('div');
	var score100Control = new FilterControl(score100ControlDiv, '100', '/restaurants/100');

	score100ControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(score100ControlDiv);

	//
	// Above 90 button
	//
	var score90ControlDiv = document.createElement('div');
	var score90Control = new FilterControl(score100ControlDiv, '90 - 99', '/restaurants/90s');

	score90ControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(score90ControlDiv);

	//
	// Above 80 button
	//
	var score80ControlDiv = document.createElement('div');
	var score80Control = new FilterControl(score100ControlDiv, '80 - 89', '/restaurants/80s');

	score80ControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(score80ControlDiv);

	//
	// Above 70 button
	//
	var score70ControlDiv = document.createElement('div');
	var score70Control = new FilterControl(score100ControlDiv, '70 - 79', '/restaurants/70s');

	score70ControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(score70ControlDiv);

	//
	// Above 60 button
	//
	var score60ControlDiv = document.createElement('div');
	var score60Control = new FilterControl(score100ControlDiv, '60 - 69', '/restaurants/60s');

	score60ControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(score60ControlDiv);

	//
	// Above 50 button
	//
	var score50ControlDiv = document.createElement('div');
	var score50Control = new FilterControl(score100ControlDiv, 'Below 60', '/restaurants/50s');

	score50ControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(score50ControlDiv);

	//
	// All data points
	//
	var allControlDiv = document.createElement('div');
	var allControl = new FilterControl(score100ControlDiv, 'All (slow)', '/restaurants/all');

	allControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(allControlDiv);
}

google.maps.event.addDomListener(window, 'load', initialize);

