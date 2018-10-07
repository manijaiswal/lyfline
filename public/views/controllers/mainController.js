var MainController  = angular.module('MainController',['ApiFactory','ui.bootstrap']);

MainController.controller('MainController',['$scope','$http','$location','ipCookie','ApiFactory',function($scope,$http,$location,ipCookie,ApiFactory){
    console.log('In main controller');
    var vm  =  this;

    var RESOURCE_URL      = ApiFactory.RESOURCE_URL() 
    vm.sign_form              = {};
    vm.form               = {};
    $scope.bg_disable = false;

    $scope.create_agent_account  = function(){
        console.log(vm.sign_form);
        vm.sign_form['role'] = 2;
        vm.sign_form['ccode'] = 91;
        $scope.bg_disable = true;

        ApiFactory.save('POST',RESOURCE_URL+'/accounts/cr_acc',vm.sign_form)
        .then((res)=>{
            var at  = res['data']['at'];
            var aid = res['data']['account_details']['_id'];

            ipCookie('token',at);
            ipCookie('aid',aid);
            ipCookie('profile',res['data']['account_details']);

            $scope.bg_disable = false;

            alert('successfully created account')

            $location.path('/agent_dashboard');

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            console.log("err",e);
        })   
    }

    $scope.mobile_submit = function(){
        vm.form['token'] = 5;
        vm.form['ccode'] = 91;
        $scope.bg_disable = true;

        console.log(vm.form);

        ApiFactory.save('POST',RESOURCE_URL+'/accounts/login',vm.form)
        .then((res)=>{
            var at  = res['data']['token'];
            var aid = res['data']['profile_data']['_id'];
            var role = res['data']['profile_data']['role'];

            ipCookie('token',at);
            ipCookie('aid',aid);
            ipCookie('profile',res['data']['profile_data']);
            
            $scope.bg_disable = false;

            if(role==2){
                $location.path('/agent_dashboard');
            }else if(role==3){
                $location.path('/admin_dashboard');

            }
            
        })
        .catch((e)=>{

            alert(e['message']);
            $scope.bg_disable = false;
            console.log(e);
        })
    }

    
    
}])


MainController.directive("compareTo", function () {
	return {
		require: "ngModel",
		scope: {
			confirmPassword: "=compareTo"
		},
		link: function (scope, element, attributes, modelVal) {

			modelVal.$validators.compareTo = function (val) {
				return val == scope.confirmPassword;
			};

			scope.$watch("confirmPassword", function () {
				modelVal.$validate();
			});
		}
	};
});