//const browserifyShim = require("browserify-shim");
// const fileSystem = require("browserify-fs");

var gmapController = (function () {
             
    function initialize() {
        geoController.watchPosition(displayPosition, displayError); // display either the users position if allowed or an appropriate error message for the reason a location cannot be displayed.
    }
    
    const geoCoords = [];
    const locMarkers = [];

    
    
    var marker;


    // var fs = require('fs');
    // var fileName = './data.json';
    // var file = require(fileName);

    // file.key = "new value";

    // fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err){
    //     //JSON.parse();
    //     if (err) return console.log(err);
    //     console.log(JSON.stringify(file));
    //     console.log('writing to' + fileName);

        
    // });

    // fileSystem.readFile("geo.json", (err, data) => {
    //     if(err) {
    //         console.log("file reading failed", err);
    //         return;
    //     }
    //     try{
    //         const geo = JSON.parse(data)
    //         console.log("geo data is", geo)
    //     }
    //     catch(err) {
    //         console.log("error parsing JSON string", err);
    //     }
    // })
   
          
    function displayPosition(pos) {
        let coords = pos.coords; 
        // var latX = coords.latitude;
        // var longX = coords.longitude;
          
        addMap(coords); //add lat and long coordinates to the map so you can see your current position.
        //console.log(coords);    
    
        geoCoords.push([coords.latitude, coords.longitude]);
                // window.sessionStorage.setItem(
                //     "geoCoords", 
                //     JSON.stringify(geoCoords) 
                //     );
                    
        //console.log(geoCoords);

        // const myJSONString = JSON.stringify(geoCoords);
        // console.log(myJSONString);


       

                    

                    
    }
          
    function displayError(msg) {
        $("#errorArea").removeClass("d-none");
        $("#errorArea").html(msg);  // display the approprite error
    }
          
    function addMap(location) {
        var i;
        for(i = 0; i < geoCoords.length; i++){
        let pos = new google.maps.LatLng(geoCoords[i][0], geoCoords[i][1]); // Create a lat/lng object to store the latitude and longitude values.
        
        if( i > 2){
            localStorage.clear();
        }

        // Create map options
        let mapOptions = {
             center: pos, //user coordinates as map center.
             zoom: 17, // map zoom level 15.
             mapTypeId: google.maps.MapTypeId.ROADMAP // display style set to ROADMAP (default google map look).
            };
        let map = new google.maps.Map(document.getElementById("map"), mapOptions); // create the google map with the above specified parameters.
        
        
           
        marker = new google.maps.Marker({
            position: pos, //place a marker on user coordinates
            title: "You are here",
            animation: google.maps.Animation.DROP,
            optimized: true,
            draggable: true


            
        })
        locMarkers.push(marker);
        //console.log("Markers", marker);

        // locMarkers.push([marker.position]);
        // window.localStorage.setItem(
        //     "markers",
        //     JSON.stringify(marker)
        //     );

        //     console.log(marker);
        
         marker.setMap(map);
         

        
       } 
       
        
    }
    
          
                
    return {
    "initialize": initialize
     }
    })();

    
         