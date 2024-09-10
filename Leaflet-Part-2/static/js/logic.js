// Retrieve the earthquake GeoJSON data.
// Once we get a response, send the data.features object to the createFeatures function.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    createFeatures(data.features);
});

// Create layer for tectonic plates
tectonicPlates = new L.layerGroup();

    // Perform a GET request to the tectonicplatesURL
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plates) {

        // Console log the data retrieved 
        console.log(plates);
        L.geoJSON(plates, {color: "orange",weight: 2}).addTo(tectonicPlates);
    });


// CREATING FEATURES FUNCTIONS
function createFeatures(earthquakeData) {

    // Define a function for each feature in the array
    // Provide popup that describes the location and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3>
      <hr><p>Time: ${new Date(feature.properties.time)}</p>
      <p>Magnitude: ${feature.properties.mag}</p>
      <p>Depth: ${feature.geometry.coordinates[2]}</p></hr>`);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object
    function createMarker(feature, latlng){
      let options = {
       radius: feature.properties.mag * 5,
       fillColor: chooseColor(feature.geometry.coordinates[2]),
       color: chooseColor(feature.geometry.coordinates[2]),
       weight: 1,
       stroke: true,
       opacity: 1.5,
       fillOpacity: 0.75
      } 
      return L.circleMarker(latlng, options);
   }
  
    // Run the onEachFeature and pointToLayer function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: createMarker
    });
  
    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
  
  // Create a color palette for the markers based on the depth of the earthquake
  function chooseColor(depth){
  
      if (depth > 70) {
          return color = "#3e4444";
      }
      else if (depth > 50) {
          return color = "#82b74b";
      }
      else if (depth > 30) {
          return color = "#c1946a";
      }
      else if (depth > 10) {
          return color = "#405d27";
      }
      else {
          return color = "#c4b7a6";
      }
  }
  
  // Provide context for map data using map legend
  let legend = L.control({position: "bottomright"});
  
  legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var depths = [-10, 10, 30, 50, 70];
      var labels = [];
  
      // Loop through each depth item to add it to labels for the legend and color the legend
      for (var i = 0; i < depths.length; i++) {
            labels.push('<ul style="background-color:' 
            + chooseColor(depths[i] + 1) + '"> <span>' + 
            depths[i] + (depths[i + 1] ? '&ndash;' + 
            depths[i + 1] + '' : '+') + '</span></ul>');
          }
  
        // Add each label item to the div which is under the <ul> tag
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      
      return div;
    };
  
  
  // Create map
  function createMap(earthquakes) {
  
    // Create the base layers
     let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create the Topographic Map layers.
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = { "Street Map": street, "Topographic Map": topo };

    // Create an overlay object to hold overlay
    let overlayMaps = { "Earthquakes": earthquakes ,"Tectonic Plates": tectonicPlates};
  
    // Add street map and earthquakes layers
    let myMap = L.map("map", { center: [37.09, -95.71], zoom: 4, layers: [topo, earthquakes, tectonicPlates] });
  
    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: true
    }).addTo(myMap);
  
    // Add legend to the map
    legend.addTo(myMap)
  
  }