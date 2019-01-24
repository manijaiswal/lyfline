var app = angular.module('app',['ngRoute','ipCookie','ui.router','ui.bootstrap','MainController','HeaderController','EditProfileController']);


app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('app',{
        url:'/',
        templateUrl:'views/home.html',
        controller:'MainController'
    })
    .state('patient_signup',{
        url:'/patient_signUp',
        templateUrl:'views/patient/signup.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('patient_login',{
        url:'/patient_login',
        templateUrl:'views/patient/login.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('doctor_login',{
        url:'/doctor_login',
        templateUrl:'views/doctor/login.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('doctor_signup',{
        url:'/doctor_signup',
        templateUrl:'views/doctor/signup.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('doctor_dashboard',{
        url:'/doctor_dashboard',
        templateUrl:'views/doctor/dashboard.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('doctor_dashboard.patient',{
        url:'/patients',
        templateUrl:'views/doctor/admin/patients.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('doctor_dashboard.dashboard',{
        url:'/dashboard',
        templateUrl:'views/doctor/admin/dashboard.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('doctor_dashboard.addDetails',{
        url:'/add_details',
        templateUrl:'views/doctor/admin/addDetail.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('clinic_login',{
        url:'/clinic_login',
        templateUrl:'views/clinic/login.html',
        controller:'MainController',
        controllerAs: 'vm'
    })
    .state('clinic_signup',{
        url:'/clinic_signup',
        templateUrl:'views/clinic/signup.html',
        controller:'MainController',
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

