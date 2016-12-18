var app = angular
.module('app', ['ui.router']) //ui.router dependency injection
.config(['$urlRouterProvider','$stateProvider',function($urlRouterProvider,$stateProvider) {
	$urlRouterProvider.otherwise('/movies');

	$stateProvider //perfoming funcionality for the view and showing it depending on the state of app
	.state("Movies", {
		url:'/movies',
		templateUrl: 'Templates/movies.html',
		controller: function($scope,API) {
			$scope.datasrc = [];
			$scope.searchTag = "";
			$scope.topRatedUrl = "https://api.themoviedb.org/3/movie/top_rated?api_key=3a5a3b14bbc8da71c7ac6a11a2b40ae8&language=en-US&page=1";
			$scope.api_base = "https://api.themoviedb.org/3/search/movie?api_key=3a5a3b14bbc8da71c7ac6a11a2b40ae8&language=en-US&query=";
			$scope.add_param = "&page=1&include_adult=false";
			$scope.callback = "&callback=JSON_CALLBACK";
			$scope.imgUrl = "http://image.tmdb.org/t/p/original";

			API.search($scope.topRatedUrl+$scope.callback) //http get factory
			.success(function(data) {
				$scope.topRated = data.results;
				$scope.datasrc = data.results;
				$scope.topRated.splice(10,$scope.topRated.length-9);
			});
			var updateFn = function() {
				if($scope.searchTag.length > 2) {
					API.search($scope.api_base + $scope.searchTag + $scope.callback)
					.success(function (data) {
						$scope.datasrc = data.results;
					});
				}else {
					$scope.datasrc = $scope.topRated;
				}
			}
			updateFn();
			$scope.update = updateFn;
		},
	})
	.state('TVshows', {
		url: '/TVshows',
		templateUrl: "Templates/TVshows.html",
		controller: function(shows,$scope,API) { //passing in 'shows' from resolve get request
			$scope.title = "Top Rated TV Shows";
			$scope.showList = shows; 
			$scope.datasrc = [];
			$scope.searchTag = "";
			$scope.api_base = "https://api.themoviedb.org/3/search/tv?api_key=3a5a3b14bbc8da71c7ac6a11a2b40ae8&language=en-US&query=";
			$scope.add_param = "&page=1&include_adult=false";
			$scope.callback = "&callback=JSON_CALLBACK";
			$scope.imgUrl = "http://image.tmdb.org/t/p/original";

			$scope.topRated = shows;
			$scope.datasrc = shows;
			$scope.topRated.splice(10,$scope.topRated.length-9);

		var updateFn = function() {
			if($scope.searchTag.length > 2) { //live search..if search isnt more than 2 chars..give top rated movies..else give search
				API.search($scope.api_base + $scope.searchTag + $scope.callback)
				.success(function (data) {
					$scope.datasrc = data.results;
				});
			}else {
				$scope.datasrc = $scope.topRated;
			}
		}
		updateFn();
		$scope.update = updateFn;
	},
	resolve: { // cannot use factory on this link...dont know why
			shows: function($http) { //calling top_rated shows
				return $http.get("https://api.themoviedb.org/3/tv/top_rated?api_key=3a5a3b14bbc8da71c7ac6a11a2b40ae8&language=en-US&page=1")
				.then(function(response) { //converting promise object data to array of 10 shows
					var sho = response.data.results;
					var show = [];
					for(var i = 0; i < 10; i++) {
						show.push(sho[i]);
					}
					return show;

				});
			}
		}
	})
	.state('showDetails',{ 
		url: '/TVshows/:id',
		templateUrl: 'Templates/tvShowDetails.html',
		controller: function(show,$scope,$stateParams,$sce) {
			$scope.title = "Show";
			$scope.showDetails = show;
			$scope.genres = show.genres;
			$scope.checkVideo = false;
			if(show.videos.results[0] != undefined) {//for TV shows majority has no videos..used picture instead..see tvshowdetails.html
				$scope.videoUrl = show.videos.results[0].id;
				$scope.checkVideo = true;
			}
			$scope.videoUrl2 =  $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.videoUrl);
			$scope.imgUrl = "http://image.tmdb.org/t/p/original" + show.poster_path;
			console.log($scope.imgUrl);
		},
		resolve: {
			show: function($http,$stateParams) {
				return $http.get("https://api.themoviedb.org/3/tv/"+$stateParams.id+"?api_key=3a5a3b14bbc8da71c7ac6a11a2b40ae8&language=en-US&append_to_response=videos")
				.then(function(response) {

					return response.data;

				});
			}
		}
	})	
	.state('movieDetails',{ 
		url: '/Movie/:id',
		templateUrl: 'Templates/movieDetails.html',
		controller: function(movie,$scope,$stateParams,$sce) {
			$scope.title = "Movie";
			$scope.movieDetails = movie;
			$scope.genres = movie.genres
			$scope.videoUrl = movie.videos.results[0].key;
			$scope.videoUrl2 =  $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.videoUrl);
			$scope.imgUrl = "http://image.tmdb.org/t/p/original" + movie.poster_path;
		},
		resolve: {
			movie: function($http,$stateParams) {
				return $http.get("https://api.themoviedb.org/3/movie/"+$stateParams.id+"?api_key=3a5a3b14bbc8da71c7ac6a11a2b40ae8&language=en-US&append_to_response=videos")
				.then(function(response) {

					return response.data;

				});
			}
		}
	})
}])
app.controller('MainController', ['$scope', function($scope){
	$scope.appName = "Movie App";
}])

app.factory('API', [ '$http', function ($http) {
	return {
		search: function(targetUrl) {
			console.log(targetUrl);
			return $http.jsonp(targetUrl);
		}
	}
}]);