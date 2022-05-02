var watchGeo;


let geoController = (function () {  
    
    let position = null;  
    let lastMessage = null;  
    let lastError = null;  
    let successCallback = null;  
    let errorCallback = null;
    
    
    let options = {    
        enableHighAccuracy: true, //produce a more accurate location if the device is able to do so. (can result in a slower load time)
        timeout: 10000,  // gives the device ten seconds to return a location, otherwise an error appears.
        maximumAge: 0 // set to 0 meaning that the device must return a real time current position each time, instead of returning a cached position.
    };
    
        
     

    function watchPosition(success, error, posOptions) {
        // set the callbacks
        successCallback = success;    
        errorCallback = error;    
        if (posOptions) { 
            options = posOptions; 


        }
        
        // reset variables to take new information.   
        position = null;    
        lastError = null;    
        lastMessage = null;
        if (navigator.geolocation) {
            watchGeo = navigator.geolocation.watchPosition(setPosition, handleError, options); 
            
            // if geolocation can be found then send information to respective functions
        }    
        else {
            callError("Update your browser to use Geolocation.");
            // if geolocation is allowed on your browser then return the current position else recieve an error to update your browser
        }  

      
    }

    function stopWatchPosition(){
        navigator.geolocation.clearWatch( watchGeo );
        watchGeo = undefined;
    }

    
    function setPosition(pos) {
        
        position = pos;
        //console.log("POSITION",position );
        if (successCallback) {
            successCallback(position); // if device is successfull in obtaining 
        }  
    }
    
    function handleError(error) {
        lastError = error;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                lastMessage = "User does not want to display their location."; // display error if user denies location access
                break;      
            case error.POSITION_UNAVAILABLE:
                lastMessage = "Can't determine user's location."; // display error if the device cannot determine the users location in the set time.
                break;
            case error.TIMEOUT:
                lastMessage = "The request for geolocation information timed out."; // display error if location page struggles to load.
                break;
            case error.UNKNOWN_ERROR:
                lastMessage = "An unknown error occurred." // display error if an unknown error occours
                break;    
        }
        callError(lastMessage);  // call the approproate (lastMessage) if any of the above occur.
    }
    
    function callError(msg) {
        lastMessage = msg; 
        console.log(msg);
        if (errorCallback) {
            errorCallback(lastMessage); //display above errors in the console
        }  
    }
    
    
    return {
        "watchPosition": function (success, error, posOptions) {
            watchPosition(success, error, posOptions);
        },
        "getPosition": function () {
            return position; // if this function is called then return user position.
        },
        "getLastError": function () {
            return lastError; // if this function is called then display the appropriate error
        },
        "getLastMessage": function () {
            return lastMessage; // if this function is called then display the appropriate message in the console
        },
        "getOptions": function () {
            return options; // call the options specified at the top of the page e.g. if high accuracy, 
        },
        "stopWatchPosition": function () {
            stopWatchPosition();
        },
        "gmapController": function() {
            gmapController();
        }  
    }
})();
