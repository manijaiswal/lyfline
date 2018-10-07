var EditProfileController  = angular.module('EditProfileController',['ui.bootstrap','ApiFactory']);

EditProfileController.controller('EditProfileController',[
    '$scope',
    '$uibModalInstance',
    'edit_profile_form',
    'ApiFactory',
    'ipCookie',
    function($scope,$uibModalInstance,edit_profile_form,ApiFactory,ipCookie){
        var RESOURCE_URL = ApiFactory.RESOURCE_URL();
        var vm =  this
        $scope.loaded = true;
        $scope.bg_disable = false;
        //https://mighty-lake-13366.herokuapp.com
        $scope.close = function(){

            console.log("close in coursemodal");
            $uibModalInstance.close();
        }

        $scope.editProfile  = function(form){
        form['token'] = ipCookie('token');
        form['aid'] = ipCookie('aid');
        form['agent_aid'] = form['_id'];
        $scope.bg_disable = true;    

        console.log(form);    
        ApiFactory.save('POST',RESOURCE_URL+'/adminPanels/ed_pro',form)
        .then((res)=>{
            console.log("hello",res);
            $scope.bg_disable = false;
            alert("successfully update agent");
            $scope.close();

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            console.log("err",e);
        })
        }

    
        $scope.init = function(){
            $scope.sign_form 		= edit_profile_form; 
            console.log($scope.edit_profile_form);   	
        }
        $scope.init();
    }
])