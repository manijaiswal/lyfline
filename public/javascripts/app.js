var app = angular.module('app',['ngRoute','ipCookie','ui.router','ui.bootstrap','MainController','HeaderController','EditProfileController']);


app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('app',{
        url:'/',
        templateUrl:'views/home.html',
        controller:'MainController'
    })
    .state('signup',{
        url:'/sign-up',
        templateUrl:'views/signup.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('login',{
        url:'/login',
        templateUrl:'views/login.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('agent_dashboard',{
        url:'/agent_dashboard',
        templateUrl:'views/agent_dashboard.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('admin_dashboard',{
        url:'/admin_dashboard',
        templateUrl:'views/admin_dashboard.html',
        controller:'HeaderController',
        controllerAs: 'vm'
    })
    

}]);    


app.run(['$rootScope','$location','ipCookie','$state','$window','ApiFactory',function($rootScope,$location,ipCookie,$state,$window,ApiFactory){
    $rootScope.$on('$locationChangeSuccess',function(event,next,current){
 
         $rootScope.loc = $location.path();
        
        if(!ipCookie('token')){      
           if($location.path()=='/customer_login'){
             $location.path('/login');
           }
         
           if($location.path()=='/sign_up'){
             $location.path('/sign_up');
           }
           if($location.path()=='/admin_dashboard'){
             $location.path('/admin_login');
             $window.location.reload();
           }
           if($location.path()=='/agent_dashboard'){
             $location.path('/');
             $window.location.reload();
           }
         }
         if(ipCookie('token')){           
            $rootScope.profile_data = ipCookie('profile')
            console.log($rootScope.profile_data)          
         } 
         
         $rootScope.isLogged = function() {
             if(!ipCookie('token')){
                 return false;
             }
             else{
                 return true;
             }
         };
 
         $rootScope.logout1 = function() {
            ipCookie.remove('token');
            ipCookie.remove('aid');
            ipCookie.remove('profile');
            $location.path('/')
         };
    })
}])

