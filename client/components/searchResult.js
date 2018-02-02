const SearchResultController = function( tribalServer ) {

  this.addSongButtonHandler = () => {
    tribalServer.addSong( this.searchResult );
  };
};

const SearchResult = function() {
  return {
    scope: {
      searchResult: '<',
    },
    restrict: 'E',
    controller: [ 'tribalServer', SearchResultController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/searchResult.html'
  };
};

angular.module('tribal').directive('searchResult', SearchResult);
