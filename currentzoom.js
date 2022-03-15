(function()
{
	var initialized_containers = {};
	var zoom_elements = {};

	function is_generated(container)
	{
		for (var key in initialized_containers)
		{
			if (container.className.indexOf(key) > 0)
				return true;
		}

		return false;
	}

	function check_containers()
	{
		var has_leaflet = check_leaflet();
		if (!has_leaflet)
			return;

		var containers = document.querySelectorAll(".leaflet-container");
		if (containers.length == 0)
			return;

		for (var i=0;i<containers.length;i++)
		{
			var c = containers[i];
			if (is_generated(c))
				continue;

			var id = random_string(16);
			c.classList.add(id);
			initialized_containers[id] = c;
			var z = create_zoom_element(c);
			zoom_elements[id] = z;
			z.innerHTML = get_zoom_value(c);
		}
	}

	function check_zoom()
	{
		for (var key in zoom_elements)
		{
			var z = get_zoom_value(initialized_containers[key])
			zoom_elements[key].innerHTML = z;
		}
	}

	function check_leaflet()
	{
		if (typeof L == "undefined")
			return false;

		if (typeof L.version == "undefined")
			return false;

		return true;
	}

	// this is not a definite way to get zoom value 
	// we check loaded tile url parameters to guess the zoom
	// in the old versions of leaflet 
	// there is no class like "leaflet-proxy" that gives information
	// about the map's state
	function get_old_leaflet_version_zoom_value(container)
	{
		var tiles = container.querySelectorAll(".leaflet-tile");
		for (var i=0;i<tiles.length;i++)
		{
			var tile = tiles[i];
			var url = new URL(tile.src);
			var params = new URLSearchParams(url.search);
			if (params.get("z") != null)
				return params.get("z");

			// this is a very loose check and my fail
			var parts = url.pathname.split("/");
			return parts[1];
		}

		return container;
	}

	function get_zoom_value(container)
	{
		var p = container.querySelector(".leaflet-proxy");
		if (p == null)
			return get_old_leaflet_version_zoom_value(container);
		
		var index = p.style.transform.indexOf("scale(") + 6;
		var s = p.style.transform.substring(index);
		s = s.substring(0, s.indexOf(")"));
		s = Number(s);
		s = Math.log2(s) + 1;
		s = parseFloat(s.toFixed(1));
		return s;
	}

	function create_zoom_element(container)
	{
		var e = document.createElement("div");
		e.style.width = "40px";
		e.style.height = "30px";
		e.style.lineHeight = "30px";
		e.style.fontSize = "14px";
		e.style.position = "absolute";
		e.style.zIndex = "200000";
		e.style.top = "10px";
		e.style.right = "10px";
		e.style.background = "white";
		e.style.borderRadius = "3px";
		e.style.border = "solid 1px #aaa";
		e.style.textAlign = "center";
		e.innerHTML = "";
		container.appendChild(e);
		return e;
	}

	function random_string(l)
	{
		function r()
		{
			return Math.floor(Math.random() * 16);
		}
	
		var s = ""
		for (var i=0;i<l;i++)
		{
			s += r().toString(16);
		}

		return s;
	}

	setInterval(check_containers, 1000);
	setInterval(check_zoom, 400);
})();
