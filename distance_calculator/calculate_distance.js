var mapBoxApiToken = 'pk.eyJ1IjoiZnJlZG1ldHQiLCJhIjoiY2sybXBrenZnMDMxcjNubG55bWc0aGEybyJ9.PSbS1sDoiCAg2tpgFzs9Xw';
var hereAPIKey = "4f6Bu0qCsoRbNNn24mKVqLpfQx9YNyvoksaqfF4B14E";
var geocodeService = null;
var routing;
var st_line;
var addressFrom = '';
var addressTo = '';
var mymap = L.map('mapid').setView([51.505, -0.09], 1);

L.tileLayer('https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey='+hereAPIKey, {
    attribution: '&copy; HERE 2019'
}).addTo(mymap);



var address1="",
address2="";

if(address1.length > 0 && address2.length > 0 ) {
	findAddress();
}

function findAddress(_from, _to) {

	addressFrom = _from;
	addressTo =  _to;

	resFrom = '';
	resTo = '';

	if (addressFrom.length && addressTo.length) {

		if(!geocodeService)
		{
			try { geocodeService = new GeocodeService();}
			catch(error) { geocodeService = Object.create(GeocodeService.prototype);}//for IE
		}
		geocodeService.geocode(null, addressFrom, "search", function(result, source){
			resFrom = result;
			if(!geocodeService)
			{
				try { geocodeService = new GeocodeService();}
				catch(error) { geocodeService = Object.create(GeocodeService.prototype);}//for IE
			}
			geocodeService.geocode(null, addressTo, "search", function(result, source){
				resTo = result;

				if(routing){
					routing.setWaypoints([])
					$(".leaflet-routing-container").remove()
				}
				if(st_line){
					mymap.removeLayer(st_line);
				}

				// draw route
				routing = L.Routing.control({
					waypoints: [
						L.latLng(resFrom.lat, resFrom.lng),
						L.latLng(resTo.lat, resTo.lng),
					],
					show: false,
					addWaypoints:false,
					lineOptions: {
						styles: [{color: '#8EADFD', opacity: 0.8, weight: 6}]
					},
					createMarker: function(waypointIndex, waypoint, numberOfWaypoints) {
						if(waypointIndex==0)return L.marker(waypoint.latLng).bindPopup(resFrom.formatted_address);
						if(waypointIndex==1)return L.marker(waypoint.latLng).bindPopup(resTo.formatted_address);
					},
					router: L.Routing.mapbox('pk.eyJ1IjoiZnJlZG1ldHQiLCJhIjoiY2sybXBrenZnMDMxcjNubG55bWc0aGEybyJ9.PSbS1sDoiCAg2tpgFzs9Xw'),
				}).addTo(mymap)

				// routes found
				routing.on('routesfound', function(e) {
					var routes = e.routes;
					var summary = routes[0].summary;

					var dis_km = summary.totalDistance / 1000; //meters to km
					var dis_miles = dis_km * 0.6213711922; //since 1km = 0.6213711922 miles
					var dis_feets =  dis_km * 3280.84; //since 1km=3280.84 feets

					document.getElementById("driving_status").innerHTML="Driving distance: "+dis_miles.toFixed(2)+" miles , "+dis_km.toFixed(2)+" kilometers (km) , "+dis_feets.toFixed(0)+" feet , "+summary.totalDistance.toFixed(0)+" meters";
				});

				// draw straight line
				var pointA =  L.latLng(resFrom.lat, resFrom.lng);
				var pointB =  L.latLng(resTo.lat, resTo.lng);
				var pointList = [pointA, pointB];
				st_line = L.polyline(pointList, {
					color: 'red',
					weight: 4,
					opacity: 1,
					smoothFactor: 1
				}).addTo(mymap);

				// route error
				routing.on('routingerror', function(e) {
					$(".leaflet-routing-container").remove();
					document.getElementById("driving_status").innerHTML="Driving distance: Could not be found.";
					// zoom to line
					mymap.fitBounds(st_line.getBounds());
				});

				// straight distance
				function getDistance(origin, destination) {
					// return distance in meters
					var lon1 = toRadian(origin[1]),
						lat1 = toRadian(origin[0]),
						lon2 = toRadian(destination[1]),
						lat2 = toRadian(destination[0]);

					var deltaLat = lat2 - lat1;
					var deltaLon = lon2 - lon1;

					var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
					var c = 2 * Math.asin(Math.sqrt(a));
					var EARTH_RADIUS = 6371;
					return c * EARTH_RADIUS * 1000;
				}

				function toRadian(degree) {
					return degree*Math.PI/180;
				}

				var st_dis_metres = getDistance([resFrom.lat, resFrom.lng], [resTo.lat, resTo.lng]);
				var st_distance_km = st_dis_metres/1E3;
				var st_distance_miles = 6.21371192E-4 * st_dis_metres;
				var st_dis_feets = 5280 * st_distance_miles;

				document.getElementById("status").innerHTML="Straight line distance: "+st_distance_miles.toFixed(2)+" miles , "+st_distance_km.toFixed(2)+" kilometers (km) , "+st_dis_feets.toFixed(0)+" feet , "+st_dis_metres.toFixed(0)+" meters";

				createEmbedLink();
			});

		});

	} else {
		alert("Enter addresses first");
	}

}

function createEmbedLink(){
	var url="https://www.mapdevelopers.com/distance_from_to.php?";
		url+="&from="+encodeURIComponent(addressFrom);
		url+="&to="+encodeURIComponent(addressTo);
	document.getElementById("embed_url").value=url
}