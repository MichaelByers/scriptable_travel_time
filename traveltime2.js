const w = new ListWidget();
w.backgroundColor = new Color("#f7f7f7");
const myGradient = new LinearGradient();
myGradient.colors = [new Color("#0000ff"), new Color("#f7f7f7")];
myGradient.locations = [0,0.35];
//myGradient.startPoint = new Point(0,1);
//myGradient.endPoint = new Point(1,0.3);
w.backgroundGradient = myGradient;

//tomtom api key
const API_KEY = '';
const config = [
    {
        lat:    39.0,
        long:   -105.0,
        img:    "https://www.pngitem.com/pimgs/m/298-2986710_sweet-to-people-png-home-clipart-png-transparent.png",
        letter: 'H'
    },
    {
        lat:    39.0,
        long:   -104.0,
        img:    "https://www.pngitem.com/pimgs/m/9-90664_office-space-for-lease-in-picadilly-star-bgc.png",
        letter: 'O'
    },
    {
        lat:    39.0,
        long:   -105.0,
        img:    "https://www.pngitem.com/pimgs/m/293-2932392_golf-hole-flag-two-sport-game-golf-flag.png",
        letter: 'G'
    }
];

// get current location
var loc = await getCurrentLocation(config);
var stack = w.addStack();
stack.centerAlignContent();
const title = stack.addText('Travel Time');
title.textColor = Color.white();
title.font = Font.boldSystemFont(18);
stack = w.addStack();
const spacer = stack.addText(' ');
for (let cfg of config) { 
    // get distance, ignore if close
    var distanceFromLocation = haversine(
        { latitude: loc.latitude, longitude: loc.longitude },
        { latitude: cfg.lat, longitude: cfg.long }
    );
    console.log("Distance: " + distanceFromLocation);
    if(distanceFromLocation > 2.5) {
        const tUrl = 'https://api.tomtom.com/routing/1/calculateRoute/'+loc.latitude+','+loc.longitude+':'+cfg.lat+','+cfg.long+'/json?computeTravelTimeFor=all&sectionType=traffic&traffic=true&travelMode=car&key='+API_KEY;
        console.log("Getting traffic time");
        var resp = await get({url: tUrl});
        var travelTime = Math.round(resp.summary.travelTimeInSeconds/60);
        console.log("Time is: " + travelTime);
        stack = w.addStack();
        stack.centerAlignContent();
        var img = await loadImage(cfg.img);
        if(img) {
            var imgw = stack.addImage(img);
            imgw.imageSize = new Size(30,30);
        } else {
            const label = stack.addText(cfg.letter);
            label.textColor = Color.black();
            label.font = Font.boldSystemFont(16);
        }
        stack.addSpacer(10);
        var timew = stack.addText(travelTime.toString()+ ' min');
        timew.textColor = Color.black();
        stack.addSpacer(5);
    }
}

// display
Script.setWidget(w);
Script.complete();
w.presentSmall();

async function get(opts){
    try {
        const request = new Request(opts.url);
        request.headers = {
            ...opts.headers,
            ...this.defaultHeaders
        }
        var result = await request.loadJSON();
        var route = result.routes[0];
        return route;
    } catch (error) {
        console.log('Could not fetch traffic: ' + error);
        return {summary: {travelTimeInSeconds: 0}};
    }
}

async function loadImage(imgUrl) {
    try {
        let req = new Request(imgUrl);
        let image = await req.loadImage();
        return image;
    } catch (error) {
        console.log('Could not fetch image: ' + error);
        return null;
    }    
}

async function getCurrentLocation(config) {
    try {
        const {latitude, longitude} = await Location.current();
        console.log(latitude);
        console.log(longitude);
        return {latitude: latitude, longitude: longitude};
    } catch(error) {
        console.log('Could not fetch location: ' + error);
        return {latitude: config[0].lat,
        longitude: config[0].long};
    }
}

/**
 * Returns the haversine distance between start and end.
 *
 * @param {LatLon} start
 * @param {LatLon} end
 * @returns {number}
 */
 function haversine(start, end) {
    const toRadians = (n) => (n * Math.PI) / 180;
  
    const deltaLat = toRadians(end.latitude - start.latitude);
    const deltaLon = toRadians(end.longitude - start.longitude);
    const startLat = toRadians(start.latitude);
    const endLat = toRadians(end.latitude);
  
    const angle =
      Math.sin(deltaLat / 2) ** 2 +
      Math.sin(deltaLon / 2) ** 2 * Math.cos(startLat) * Math.cos(endLat);
    
    const c = 2 * Math.atan2(Math.sqrt(angle), Math.sqrt(1 - angle));
    // distance in miles
    const d = 3958.7603 * c;
    return d;
}