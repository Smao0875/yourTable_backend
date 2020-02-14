var MS_PER_HOUR = 36e5;
var KM_PER_HOUR = 60;

module.exports = {
    validateEventBody: function(body) {
        if (!body.yelpID) return new Error('Missing field: yelpID');

        if (!body.purpose) return new Error('Missing field: purpose');

        if (!body.startTime) return new Error('Missing field: startTime');

        if (!body.capacity) return new Error('Missing field: capacity');

        if (!body.lat || !body.lng) return new Error('Missing location info')
    },

    validateCoordination: function(lat, lng) {
        return (lat >= -90 && lat <= 90) && (lng >= -180 && lng <= 180);
    },

    validateOpenHour: function(event, restaurant) {
        var startTime = new Date(event.startTime);
        var day = startTime.getDay();
        var hour = startTime.getHours();
        if(hour < 10){
            hour = "0" + hour;
        }
        var time = "" + hour + startTime.getMinutes();

        return restaurant.hours.some(function(element) {
            return element.open.some(function(entry) {
                return day === entry.day && (time > entry.start && time < entry.end)
            })
        })
    },

    validateDistance: function(outset, destination, timeToLeave, eventStart, isFromCurrLocation) {
        var dist = this.calcCrow(outset.lat, outset.lng, destination.latitude, destination.longitude);
        var timeCost = dist / KM_PER_HOUR;
        var timeLeft = (eventStart - timeToLeave) / MS_PER_HOUR;

        if(isFromCurrLocation) return timeLeft > timeCost;

        return Math.abs(timeLeft) > timeCost;
    },

    // Referenced from stackOverFlow:
    //  https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
    calcCrow: function(lat1, lon1, lat2, lon2) {
      var R = 6371; // km

      var dLat = (lat2-lat1) * (Math.PI / 180);
      var dLon = (lon2-lon1) * (Math.PI / 180);

      var lat1 = lat1 * (Math.PI / 180);
      var lat2 = lat2 * (Math.PI / 180);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }
};