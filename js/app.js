//Location array
var initialLocation = [{
    name: "Nepal",
    lat: 28.3949,
    lng: 84.1240
}, {
    name: "Pakistan",
    lat: 30.3753,
    lng: 69.3451
}, {
    name: "Bhutan",
    lat: 27.5142,
    lng: 90.4336
}, {
    name: "Sri Lanka",
    lat: 7.8731,
    lng: 80.7718
}, {
    name: "Bangladesh",
    lat: 23.6850,
    lng: 90.3563
}, {
    name: "San Francisco",
    lat: 37.7749,
    lng: -122.4194
}, {
    name: "Bengaluru",
    lat: 12.9716,
    lng: 77.5946
}, {
    name: "New Delhi",
    lat: 28.6139,
    lng: 77.2090
}, {
    name: "Mumbai",
    lat: 19.0760,
    lng: 72.8777
}];
//Function to get content from wikipedia and set the infoWindow
var addContent = function(infowindow, name, lat, lng) {
    var place = lat + ',' + lng;
    var imgUrl = 'http://maps.googleapis.com/maps/api/streetview?size=300x150&location=' + place + '&key=AIzaSyCZWj1DxN7ckZD5I6CJDJcTbay_hR-6YeE';
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';
    // infowindow = location.createInfoWindow();
    var wikiarr = "";
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response) {
            var articleList = response[1];

            for (var i = 0; i < articleList.length && i < 3; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                var wikiLink = '<li><a href="' + url + '"target="_blank">' + articleStr + '</a></li>';
                wikiarr = wikiarr + wikiLink;
            }
            if (wikiarr === "") {
                wikiarr = "No Data Found..."
            }
            var contentString = '<div id="content">' +
                '<h2 id="firstHeading" class="firstHeading">' + name + '</h2>' +
                '<div id="bodyContent">' +
                '<img src = "' + imgUrl + '">' +
                '<h5><p>Popular <em>Wikipedia</em> search results for<strong> ' + name + ',' +
                '</strong><ul>' + wikiarr + '</ul>' +
                '</p>' +
                '</div>' +
                '</div>';
            infowindow.setContent(contentString);
        },
        error: function(errorMessage) {
            alert("Something went worng :(")
        }
    });
};
//Location object
var Country = function(data) {
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;

    var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(data.lat, data.lng),
        animation: google.maps.Animation.DROP,
        draggable: false
    });

    //to set visiblity of the marker
    this.isVisible = ko.observable(false);
    this.isVisible.subscribe(function(currentState) {
        marker.setVisible(currentState);
    });
    this.isVisible(true);

    //Info window of markers
    var infowindow = new google.maps.InfoWindow();
    addContent(infowindow, this.name, this.lat, this.lng);

    //marker on click event
    google.maps.event.addListener(marker, 'click', function() {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1500);
        infowindow.open(map, marker);
    });

    //function to open infowindow and animate marker
    this.clicked = ko.observable(true);
    this.clicked.subscribe(function(currentState) {
        if (currentState) {
            google.maps.event.trigger(marker, 'click');
        }
    });
    this.clicked(false);
};

var viewModel = function() {
    var self = this;
    var center = new google.maps.LatLng(20.5937, 78.9629);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: center
    });
    self.locationsList = ko.observableArray([]); //observableArray of all locations
    this.visiblePlace = ko.observableArray([]); //observableArray of visible locations
    //Adding locations to the observableArray
    for (var i = 0; i < initialLocation.length; i++) {
        self.locationsList.push(new Country(initialLocation[i]));
    }
    //adding locations to visiblePlace
    for (var x = 0; x < self.locationsList().length; x++) {
        self.visiblePlace.push(self.locationsList()[x]);
    }
    //function to remove marker
    var removeMarker = function(markerArr) {
        for (var x = 0; x < markerArr().length; x++) {
            markerArr()[x].isVisible(false);
        }
    };
    //function to add markers
    var addMarker = function(markerArr) {
        for (var x = 0; x < markerArr().length; x++) {
            markerArr()[x].isVisible(true);
        }
    };
    //function to handle click on location list(<li>) elements
    openInfoWindow = function() {
        this.clicked(true);
        this.clicked(false);
    };
    //function to handle click on toggle button
    toggle = function() {
            $("#wrapper").toggleClass("toggled");
        }
        //input text data-bind
    self.query = ko.observable('');
    //to handle change in query
    self.query.subscribe(function(value) {
        removeMarker(self.visiblePlace); //removes marker
        self.visiblePlace.removeAll(); //removes location form list
        //finding locations w.r.t query's value (user input)
        for (var location = 0; location < self.locationsList().length; location++) {
            if (self.locationsList()[location].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.visiblePlace.push(self.locationsList()[location]); //push matched locations
                addMarker(self.visiblePlace); //showing them in map by adding marker
            }
        }
    });
};
initMap = function() {
    ko.applyBindings(new viewModel());
}
mapError = function() {
    alert('Something went worng :(');
}