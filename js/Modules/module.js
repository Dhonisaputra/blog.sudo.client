window.mainApp = angular.module("mainApp", ['ngRoute', 'ngSanitize'/*, 'ui.bootstrap'*/]);
window.mainApp
.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);

    for (var i=0; i<total; i++) {
      input.push(i);
    }

    return input;
  };
})
.run(['$rootScope', function($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);


window.mainApp.run(['$rootScope', '$location', '$routeParams','$config', '$owner', '$authorize', function ($rootScope, $location, $routeParams, $config, $owner, $authorize) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        $rootScope.is_auth = 0;
        $rootScope.style_main_panel= 'width:100%';
        $rootScope.sidebar= false
        if(next.$$route.need_login)
        {
            if($authorize.is_need_login())
            {
                event.preventDefault();
                $location.path('/login');
            }else
            {
                
                $rootScope.is_auth = 1;
                $rootScope.sidebar= true
                $rootScope.style_main_panel= '';
                $rootScope.base_url = $config.base_url;
            }
        }
       
    });
}]);