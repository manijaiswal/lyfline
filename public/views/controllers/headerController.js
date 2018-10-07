var HeaderController  = angular.module('HeaderController',['ApiFactory','ui.bootstrap']);

HeaderController.controller('HeaderController',['$scope','$http','$location','ipCookie','ApiFactory','$uibModal',function($scope,$http,$location,ipCookie,ApiFactory,$uibModal){
    console.log("in Header cotroler")

    var RESOURCE_URL      = ApiFactory.RESOURCE_URL() 
    $scope.bg_disable = false;
    $scope.data = [];

    $scope.deleteProfile = function(agent){

        $scope.form_del = {};
        $scope.form_del['token'] = ipCookie('token');
        $scope.form_del['aid'] = ipCookie('aid');
        $scope.form_del['agent_aid'] = agent['_id'];
        console.log($scope.form_del);

        ApiFactory.save('POST',RESOURCE_URL+'/adminPanels/del_pro',$scope.form_del)
        .then((res)=>{
            $scope.bg_disable = false;
            alert("successfully deleted agent");
            $scope.init();

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            console.log("err",e);
        })

    }


    $scope.editModal = function(profile){
        console.log(profile);
        $scope.edit_profile_form = profile

        var modalInstance = $uibModal.open({
			animation: true,
			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',
			templateUrl: 'views/edit_profile.html',
			controller: 'EditProfileController',
			windowClass: 'show',
			backdrop : 'static',
			size:'lg',
			resolve: {
				edit_profile_form:function(){
					return $scope.edit_profile_form;
				}
			}
	   });
	   modalInstance.result.then(function(passedData){
			$scope.edit_profile_form = passedData;
			$scope.init();
	   });
    }

    $scope.init = function(){
        $scope.form = {};
        $scope.bg_disable = true;

        $scope.form['token'] = ipCookie('token');
        $scope.form['aid'] = ipCookie('aid');

        console.log($scope.form);

        ApiFactory.save('POST',RESOURCE_URL+'/adminPanels/rd_pro',$scope.form)
        .then((res)=>{
            console.log("hello",res);
            $scope.bg_disable = false;
            $scope.data = res['data'];

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            console.log("err",e);
        })
    }

    $scope.init();
}])
