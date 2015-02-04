
var clientApp = angular.module('clientApp', ['ui.router'])
  .config(function($stateProvider) {

    $stateProvider.state('matches', {
      title: 'Matches',
      url:   '',
      views: {
        'mainContent@': {
          templateUrl: 'views/matches.html',
          controller: 'MatchesCtrl',
          resolve: {
            preloaded: function(Match){
              return Match.all();
            }
          }
        }
      }
    });

    $stateProvider.state('match', {
      url: '/:series_id/:match_id',
      views: {
        'mainContent@': {
          templateUrl: 'views/match.html',
          controller: 'MatchCtrl',
          resolve: {
            preloaded: function(Match, $stateParams){
              return Match.find($stateParams.series_id, $stateParams.match_id);
            }
          }
        }
      }
    });
  });

clientApp.controller('ApplicationCtrl', function($scope) {
  // Global stuff
});

clientApp.controller('MatchesCtrl', function($scope, $rootScope, preloaded, $interval) {
  $scope.matches = preloaded.matches;

  if ($rootScope.live) {
    $interval.cancel($rootScope.live);
  }
});

clientApp.controller('MatchCtrl', function($scope, $location, $rootScope, preloaded, $stateParams, $interval) {
  $scope.match = preloaded;
  $scope.scoreCard = $scope.match.d.MainScorecard.Sportsflash.Scorecard[0];

  $scope.currentOver = $scope.scoreCard.Overs[0].Over[$scope.scoreCard.Overs[0].Over.length - 1];

  $scope.batsmen = $scope.scoreCard.Batsmen[0].Batsman;

  $('title').html("(" + $scope.scoreCard.Score[0] + ") " + $scope.match.score);
  $scope.expanded = $location.search().expanded;

  $scope.toggleExpanded = function () {
    var expanded = $location.search().expanded;

    if (expanded) {
      $location.search('expanded', null);
    } else {
      $location.search('expanded', true);
    }

    $scope.expanded = $location.search().expanded;
  }

  Tinycon.setBubble( parseInt($scope.scoreCard.Score[0].split('/')[0]) );

  $rootScope.live = $interval(function() {
    $.getJSON('/cricket/' + $stateParams.series_id + '/' + $stateParams.match_id, function(data) {
      $scope.match = data;
      $scope.scoreCard = $scope.match.d.MainScorecard.Sportsflash.Scorecard[0];
      $('title').html("(" + $scope.scoreCard.Score[0] + ") " + $scope.match.score);
      Tinycon.setBubble( parseInt($scope.scoreCard.Score[0].split('/')[0]) );
    })
  }, 30000);
});

clientApp.service('Match', ['$http', '$q', function($http, $q) {
  var all = function all(options) {
    var defer = $q.defer();

    $http.get('/matches', { params: options }).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  var find = function find(series_id, match_id) {
    var defer = $q.defer();

    $http.get('/cricket/' + series_id + '/' + match_id).then(function(response) {
      defer.resolve(response.data);
    });

    return defer.promise;
  };

  return {
    all: all,
    find: find
  }
}]);

clientApp.filter('wicket', function() {
  return function(boolean) {
    return boolean == 'true' ? true : null;
  };
});
