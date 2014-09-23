// Document ready
$(document).ready(initialize);


// Data ==================================================================

var map = null;
var markers = [];
var popupwindows = [];

// Restaurant layer group
//var restaurants = new L.LayerGroup();
var restaurants = new L.MarkerClusterGroup();


// Functions =============================================================

function initialize()
{
	map = CreateMap();

	var parent = L.DomUtil.create('div', 'custom-button-group');
	map.addControl(new FilterControl({'text': 'Below 60', 'dataUrl': '/restaurants/50s', 'onClick': onClick50s, 'parent': parent}));
	map.addControl(new FilterControl({'text': '60 - 69', 'dataUrl': '/restaurants/60s', 'onClick': onClick60s, 'parent': parent}));
	map.addControl(new FilterControl({'text': '70 - 79', 'dataUrl': '/restaurants/70s', 'onClick': onClick70s, 'parent': parent}));
	map.addControl(new FilterControl({'text': '80 - 89', 'dataUrl': '/restaurants/80s', 'onClick': onClick80s, 'parent': parent}));
	map.addControl(new FilterControl({'text': '90 - 99', 'dataUrl': '/restaurants/90s', 'onClick': onClick90s, 'parent': parent}));
	map.addControl(new FilterControl({'text': '100', 'dataUrl': '/restaurants/100', 'onClick': onClick100, 'parent': parent}));
	map.addControl(new FilterControl({'text': 'All (slow)', 'dataUrl': '/restaurants/all', 'onClick': onClickAll, 'parent': parent}));
}   

function CreateMap()
{
	var center = new L.LatLng(30.2500, -97.7500);
	var zoom   = 12;

	var new_map = L.map(
		'map',
		{
			center: center,
			zoom: zoom,
			maxZoom: 18,
			layers: [restaurants]
		});

	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-i875mjb7'
	}).addTo(new_map);
	
	return new_map;
}

function CreateMarker(data)
{
	//
	// Create a restaurant marker
	//
	var marker = L.marker([data.address.latitude, data.address.longitude]).addTo(restaurants);
	markers.push(marker);
	return marker;
}

function CreatePopupWindow(data, marker)
{
	//
	// Create an info window
	//
	var locale_date = new Date(data.inspection_date * 1000);
	var contentString =
		'<h4 id="firstHeading" class="firstHeading">' + data.restaurant_name + '</h4>' +
		'<b>Inspection Scores:</b>' +
		'<br><b>' + data.score + '</b> (' + locale_date.toLocaleDateString() + ')';
	marker.bindPopup(contentString);
	return marker.getPopup();
}

function UpdatePopupWindow(data, popup)
{
	// Update the info window with historical inspection scores
	var locale_date = new Date(data.inspection_date * 1000);
	var contentString = popup.getContent() +
		'<br><b>' + data.score + '</b> (' + locale_date.toLocaleDateString() + ')';
	popup.setContent(contentString);
}

function ClearMarkers()
{
	// Remove the layer containing the markers
	map.removeLayer(restaurants);
	markers = [];

	// Recreate the layer so markers can be re-added
	restaurants = new L.MarkerClusterGroup();
}

function ClearPopupWindows()
{
	for (var i = 0; i < popupwindows.length; i++)
	{
		popupwindows[i].addTo(null);
	}
	popupwindows = [];
}

function ClearMap()
{
	ClearMarkers();
	ClearPopupWindows();
}

function PopulateMarkers(data_url)
{
	// Clear the map of all the existing markers before loading the new ones

	$.getJSON( data_url, function( data )
	{
		var prev_facility_id = 0;
		var current_popupwindow = null;

		ClearMap();

		$.each(data, function()
		{
			if (this.facility_id != prev_facility_id)
			{
				// New facility id encountered.
				// Create marker with most recent information
				var marker = CreateMarker(this);
				var popupwindow = CreatePopupWindow(this, marker);
				current_popupwindow = popupwindow;

				prev_facility_id = this.facility_id;
			}
			else
			{
				// Update info window with previous inspection scores
				UpdatePopupWindow(this, current_popupwindow);
			}
		});
		map.addLayer(restaurants);
	});
}

// Button controls for filtering
var FilterControl = L.Control.extend({
	options: {
		position: 'topright'
	},

	initialize: function(options) {
		this._button = {};
		this.setButton(options);
		this._container = options.parent;
	},

	onAdd: function(map) {
		this._map = map;
		this._update();
		return this._container;
	},

	setButton: function(options) {
		var button = {
			'text'    : options.text,
			'dataUrl' : options.dataUrl,
			'onClick' : options.onClick,
			'parent'  : options.parent
		};
		this._button = button;
	},
	
	_update: function() {
		this._container.style.padding = '5px';

		var controlUI = document.createElement('div', 'custom-control');
		controlUI.style.backgroundColor = 'white';
		controlUI.style.borderStyle = 'solid';
		controlUI.style.borderWidth = '1px';
		controlUI.style.cursor = 'pointer';
		controlUI.style.textAlign = 'center';
		controlUI.title = 'Click to display ' + this._button.text + ' scorers';
		this._container.appendChild(controlUI);

		var controlText = document.createElement('div', 'custom-control-text');
		controlText.style.fontFamily = 'Arial,sans-serif';
		controlText.style.fontSize = '12px';
		controlText.style.paddingLeft = '4px';
		controlText.style.paddingRight = '4px';
		controlText.innerHTML = '<b>' + this._button.text + '</b>';
		controlUI.appendChild(controlText);
		
		controlUI.addEventListener('click', this._button.onClick, true);
	},
});

// Button callbacks
function onClick50s() { PopulateMarkers('/restaurants/50s'); }
function onClick60s() { PopulateMarkers('/restaurants/60s'); }
function onClick70s() { PopulateMarkers('/restaurants/70s'); }
function onClick80s() { PopulateMarkers('/restaurants/80s'); }
function onClick90s() { PopulateMarkers('/restaurants/90s'); }
function onClick100() { PopulateMarkers('/restaurants/100'); }
function onClickAll() { PopulateMarkers('/restaurants/all'); }

