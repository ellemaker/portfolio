var here_map, platform, maptypes;
var first_init = true;


function init_map(location_1, location_2) {


	if (first_init) {
		platform = new H.service.Platform({
	        "apikey": "-4yvgondphVl-8ykcu0Ys98M9Evho3p_dn3z_45jbv8"
	    });

	    maptypes = platform.createDefaultLayers();

	    here_map = new H.Map(
	        document.getElementById('hereMap'),
	        maptypes.vector.normal.map, {
	            zoom: 10,
	            center: {
	                lng: 33.981300,
	                lat: -81.238358
	            },
	            pixelRatio: window.devicePixelRatio || 1
	        }
	    );

	    first_init = false;
	}

    var locations = [location_1, location_2];

    var location_position_array = [];

    locations.forEach(function(itm, idx){
    	 var geocoder = platform.getGeocodingService(),
	        geocodingParameters = {
	            searchText: itm,
	            jsonattributes: 1
	        };

	    geocoder.geocode(
	        geocodingParameters,
	        function(success){
	        	var get_display_position = success.response.view[0].result[0].location.displayPosition;
	        	get_display_position["address"] = itm;
	        	location_position_array.push(get_display_position);

	        	if (location_position_array.length == 2) {
	        		make_a_marker_to_map(location_position_array);
	        	}

	        },
	        function(error){
	        	console.log(error);
	        }
	    );
    })
   

}

function make_a_marker_to_map(list_of_location){
	
	// var group = new H.map.Group();

	// list_of_location.forEach(function(itm, idx){
	// 	var _positon = {
 //            lat: itm.latitude,
 //            lng: itm.longitude
 //        };
	// 	var _marker = new H.map.Marker(_positon);
 //        _marker.label = itm.address;
 //        group.addObject(_marker);
	// });


 //    group.addEventListener('tap', function(evt) {
 //        here_map.setCenter(evt.target.getGeometry());
 //        openBubble( evt.target.getGeometry(), evt.target.label );
 //    }, false);

 //    here_map.addObject(group);
 //    here_map.setCenter(group.getBoundingBox().getCenter());


    var aviation_path = new H.geo.LineString();

    marker_1 = new H.map.Marker({ lat: list_of_location[0].latitude, lng: list_of_location[0].longitude })
    marker_2 = new H.map.Marker({ lat: list_of_location[1].latitude, lng: list_of_location[1].longitude })

    aviation_path.pushPoint(marker_1.getGeometry());
    aviation_path.pushPoint(marker_2.getGeometry());

    var plane_line = new H.map.Polyline(aviation_path, { lineWidth: 4, strokeColor: '#829', });

    here_map.addObject(plane_line);

    calculate_distance(marker_1, marker_2);
}

function openBubble(position, text) {
	var bubble;
	var ui = H.ui.UI.createDefault(here_map, here_map_types);
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

function calculate_distance(loc1, loc2){
	var distance = loc1.getGeometry().distance(loc2.getGeometry());

   	var distance_in_km = distance / 1000;
   	var distance_in_mi = distance * 0.00062137;

   	var calculated_distance = {
   		meters : distance,
   		kilometer : distance_in_km,
   		miles : distance_in_mi
   	}
	console.log(calculated_distance);
}















