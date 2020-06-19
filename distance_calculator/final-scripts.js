var here_map, here_location_container;

var location_array = [];

var routeInstructionsContainer = document.getElementById('herePanelRoute');

function calculateRouteFromAtoB (platform) {
  var router = platform.getRoutingService(),
    routeRequestParams = {
      	mode: 'fastest;car',
      	representation: 'display',
      	routeattributes : 'waypoints,summary,shape,legs',
      	maneuverattributes: 'direction,action',
      	waypoint0: '33.99882,-81.04537', // Columbia, South Carolina
      	waypoint1: '33.01897,-80.17602'  // Summerville, South Carolina
    };


  	router.calculateRoute(
    	routeRequestParams,
    	onSuccess_route,
   	 	onError_route
  	);
}

function onError_route(error){
	console.log(error);
}

function onSuccess_route(result) {
	var route = result.response.route[0];
  	addRouteShapeToMap(route);
  	addManueversToMap(route);
  	addWaypointsToPanel(route.waypoint);
  	addManueversToPanel(route);
  	addSummaryToPanel(route.summary);
}


function addRouteShapeToMap(route) {
    var lineString = new H.geo.LineString(),
        routeShape = route.shape,
        polyline;

    routeShape.forEach(function(point) {
        var parts = point.split(',');
        lineString.pushLatLngAlt(parts[0], parts[1]);
    });

    polyline = new H.map.Polyline(lineString, {
        style: {
            lineWidth: 4,
            strokeColor: 'rgba(0, 128, 255, 0.7)'
        }
    });
    here_map.addObject(polyline);
    here_map.getViewModel().setLookAtData({
        bounds: polyline.getBoundingBox()
    });


    var pos_a_marker = new H.map.Marker({lat:33.99882, lng:-81.04537});
    var pos_b_marker = new H.map.Marker({lat:33.01897, lng:-80.17602});

    var aviation_path = new H.geo.LineString();

    aviation_path.pushPoint(pos_a_marker.b);
    aviation_path.pushPoint(pos_b_marker.b);

    var plane_line = new H.map.Polyline(aviation_path, { lineWidth: 4, strokeColor: '#829', });

    here_map.addObject(plane_line);

    var distance = pos_a_marker.getGeometry().distance(pos_b_marker.getGeometry());

   	var distance_in_km = distance / 1000;
   	var distance_in_mi = distance * 0.00062137;
	console.log(distance + '====' + distance_in_km + '====' + distance_in_mi);

}

function addWaypointsToPanel(waypoints) {

	

	var nodeH3 = document.createElement('h3'),
        waypointLabels = [],
        i;


    for (i = 0; i < waypoints.length; i += 1) {
        waypointLabels.push(waypoints[i].label)
    }

    nodeH3.textContent = waypointLabels.join(' - ');

    routeInstructionsContainer.innerHTML = '';
    routeInstructionsContainer.appendChild(nodeH3);
}

function addSummaryToPanel(summary){
	  var summaryDiv = document.createElement('div'),
	   content = '';
	   content += '<b>Total distance</b>: ' + summary.distance  + 'm. <br/>';
	   content += '<b>Travel Time</b>: ' + summary.travelTime.toMMSS() + ' (in current traffic)';


	  summaryDiv.style.fontSize = 'small';
	  summaryDiv.style.marginLeft ='5%';
	  summaryDiv.style.marginRight ='5%';
	  summaryDiv.innerHTML = content;
	  routeInstructionsContainer.appendChild(summaryDiv);
}


function addManueversToMap(route) {
    var svgMarkup = '<svg width="18" height="18" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="8" cy="8" r="8" ' +
        'fill="#1b468d" stroke="white" stroke-width="1"  />' +
        '</svg>',
        dotIcon = new H.map.Icon(svgMarkup, {
            anchor: {
                x: 8,
                y: 8
            }
        }),
        group = new H.map.Group(),
        i,
        j;

    // Add a marker for each maneuver
    for (i = 0; i < route.leg.length; i += 1) {
        for (j = 0; j < route.leg[i].maneuver.length; j += 1) {
            // Get the next maneuver.
            maneuver = route.leg[i].maneuver[j];
            // Add a marker to the maneuvers group
            var marker = new H.map.Marker({
                lat: maneuver.position.latitude,
                lng: maneuver.position.longitude
            }, {
                icon: dotIcon
            });
            marker.instruction = maneuver.instruction;
            group.addObject(marker);
        }
    }

    group.addEventListener('tap', function(evt) {
        here_map.setCenter(evt.target.getGeometry());
        openBubble(
            evt.target.getGeometry(), evt.target.instruction);
    }, false);

    // Add the maneuvers group to the map
    here_map.addObject(group);


}

function addManueversToPanel(route){



  var nodeOL = document.createElement('ol'),
    i,
    j;

  nodeOL.style.fontSize = 'small';
  nodeOL.style.marginLeft ='5%';
  nodeOL.style.marginRight ='5%';
  nodeOL.className = 'directions';

     // Add a marker for each maneuver
  for (i = 0;  i < route.leg.length; i += 1) {
    for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
      // Get the next maneuver.
      maneuver = route.leg[i].maneuver[j];

      var li = document.createElement('li'),
        spanArrow = document.createElement('span'),
        spanInstruction = document.createElement('span');

      spanArrow.className = 'arrow '  + maneuver.action;
      spanInstruction.innerHTML = maneuver.instruction;
      li.appendChild(spanArrow);
      li.appendChild(spanInstruction);

      nodeOL.appendChild(li);
    }
  }

  routeInstructionsContainer.appendChild(nodeOL);
}

Number.prototype.toMMSS = function () {
  return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
}

// Now use the map as required...






function geocode(platform) {
    var geocoder = platform.getGeocodingService(),
        geocodingParameters = {
            searchText: 'Summerville, South Carolina',
            jsonattributes: 1
        };

    geocoder.geocode(
        geocodingParameters,
        onSuccess_geocoder,
        onError
    );
}

function onSuccess_geocoder(result) {
    var locations = result.response.view[0].result;
    addLocationsToMap(locations);
    addLocationsToPanel(locations);
}


function onError(error) {
    alert('Can\'t reach the remote server');
}

function init_map() {
    var platform = new H.service.Platform({
        "apikey": "-4yvgondphVl-8ykcu0Ys98M9Evho3p_dn3z_45jbv8"
    });

    var maptypes = platform.createDefaultLayers();

    var map = new H.Map(
        document.getElementById('hereMap'),
        maptypes.vector.normal.map, {
            zoom: 10,
            center: {
                lng: 13.4,
                lat: 52.51
            },
            pixelRatio: window.devicePixelRatio || 1
        });

    here_map = map;

    window.addEventListener('resize', () => map.getViewPort().resize());

    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    var ui = H.ui.UI.createDefault(map, maptypes);
    
    geocode(platform);

}

function openBubble(position, text) {
	var bubble;

    if (!bubble) {
        bubble = new H.ui.InfoBubble(
            position, {
                content: text
            });
        ui.addBubble(bubble);
    } else {
        bubble.setPosition(position);
        bubble.setContent(text);
        bubble.open();
    }
}


function addLocationsToMap(locations) {
    var group = new H.map.Group(),
        position,
        i;

    console.log(locations);

    // Add a marker for each location found
    for (i = 0; i < locations.length; i += 1) {
        position = {
            lat: locations[i].location.displayPosition.latitude,
            lng: locations[i].location.displayPosition.longitude
        };
        marker = new H.map.Marker(position);
        marker.label = locations[i].location.address.label;
        group.addObject(marker);
    }

    group.addEventListener('tap', function(evt) {
        here_map.setCenter(evt.target.getGeometry());
        openBubble(
            evt.target.getGeometry(), evt.target.label);
    }, false);

    // Add the locations group to the map
    here_map.addObject(group);
    here_map.setCenter(group.getBoundingBox().getCenter());
}


function addLocationsToPanel(locations) {

	var locationsContainer = document.getElementById('herePanel');

    var nodeOL = document.createElement('ul'),
        i;

    nodeOL.style.fontSize = 'small';
    nodeOL.style.marginLeft = '5%';
    nodeOL.style.marginRight = '5%';


    for (i = 0; i < locations.length; i += 1) {
        var li = document.createElement('li'),
            divLabel = document.createElement('div'),
            address = locations[i].location.address,
            content = '<strong style="font-size: large;">' + address.label + '</strong></br>';
        position = {
            lat: locations[i].location.displayPosition.latitude,
            lng: locations[i].location.displayPosition.longitude
        };

        console.log(position);

        content += '<strong>houseNumber:</strong> ' + address.houseNumber + '<br/>';
        content += '<strong>street:</strong> ' + address.street + '<br/>';
        content += '<strong>district:</strong> ' + address.district + '<br/>';
        content += '<strong>city:</strong> ' + address.city + '<br/>';
        content += '<strong>postalCode:</strong> ' + address.postalCode + '<br/>';
        content += '<strong>county:</strong> ' + address.county + '<br/>';
        content += '<strong>country:</strong> ' + address.country + '<br/>';
        content += '<br/><strong>position:</strong> ' +
            Math.abs(position.lat.toFixed(4)) + ((position.lat > 0) ? 'N' : 'S') +
            ' ' + Math.abs(position.lng.toFixed(4)) + ((position.lng > 0) ? 'E' : 'W');

        divLabel.innerHTML = content;
        li.appendChild(divLabel);

        nodeOL.appendChild(li);
    }

    locationsContainer.appendChild(nodeOL);
}





















