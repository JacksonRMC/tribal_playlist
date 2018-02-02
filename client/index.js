angular.module( 'tribal', [] )

  .config( function($locationProvider, $sceDelegateProvider) {

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://open.spotify.com/**'
    ]);

  });
