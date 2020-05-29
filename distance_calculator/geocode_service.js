try {
	var GeocodeService = function GeocodeService(){this.cache = {addresses:[],locations:[]}};

	GeocodeService.prototype.geocode = function(latlng, address, source, callback){
		var url = 'data.php?operation=geocode';
		var this_data = "";
		var result = this.getFromCache(latlng, address);
		var geocodeService = this;
		if(result)callback(result, source);
		else
		{
			if(typeof address != "undefined"){
				this_data += "&address="+address;
			}
			if(typeof latlng != "undefined" && latlng)
			{
				this_data += "&lat="+latlng.lat;
				this_data += "&lng="+latlng.lng;
			}
			this_data += "&region=UK";
			if(typeof lcode != "undefined"){
				this_data += "&lcode="+lcode;
			}
			if(typeof lid != "undefined"){
				this_data += "&lid="+lid;
			}
			this_data += "&code=st0PlEa3";
			$.ajax({
				type: "POST",
				url: url,
				data: this_data,
				dataType: "json",
				success: function(response){
					if (typeof response != "undefined")
					{
						if(response.response)
						{
							if(typeof response.data != "undefined" && typeof response.data.state_code_MD != "undefined")
							{
								alert("something went wrong please refresh page");
								return false;
							}
							geocodeService.addToCache(latlng, address, response.data);
							callback(response.data, source);
						}
						else console.log(response.error);
					}
					else console.log("error in geocode");
				},
				error: function (xhr, ajaxOptions, thrownError)
				{
					console.log("Thrown Error", thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
				}
			});
		}
	}

	GeocodeService.prototype.addToCache = function(latlng, address, data){
		if(typeof address != "undefined" && address != ""){
			this.cache.addresses.push([address,data]);
		}
		if(typeof latlng != "undefined" && latlng)
		{
			var lat = Math.round(latlng.lat * 100000)/100000;
			var lng = Math.round(latlng.lng * 100000)/100000;
			this.cache.locations.push([lat,lng,data]);
		}
	}

	GeocodeService.prototype.getFromCache = function(latlng, address)
	{
		if(typeof address != "undefined" && address != ""){
			var length = this.cache.addresses.length
			for (let i = 0; i < length; i++) {
			  if(address == this.cache.addresses[i][0])return this.cache.addresses[i][1];
			}
		}
		if(typeof latlng != "undefined" && latlng)
		{
			var lat = Math.round(latlng.lat * 100000)/100000;
			var lng = Math.round(latlng.lng * 100000)/100000;
			var length = this.cache.locations.length
			for (let i = 0; i < length; i++) {
			  if(lat == this.cache.locations[i][0] && lng == this.cache.locations[i][1])return this.cache.locations[i][2];
			}
		}
		return false;
	}
}
catch(error) { }