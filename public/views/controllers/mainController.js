var MainController  = angular.module('MainController',['ApiFactory','ui.bootstrap','chart.js']);

MainController.controller('MainController',['$scope','$http','$location','ipCookie','ApiFactory',function($scope,$http,$location,ipCookie,ApiFactory){
    console.log('In main controller');
    var vm  =  this;

    var RESOURCE_URL      = ApiFactory.RESOURCE_URL() 
    vm.sign_form          = {};
    vm.form               = {};
    $scope.bg_disable = false;
    $scope.loaded     = true;
    
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

    $scope.verifyEmail = function(data){
        data['aid'] = ipCookie('aid');
        $scope.bg_disable = true;
        $scope.loaded     = false

        var role = ipCookie('role');
        
        var api = '';
        if(role==1){
            api = 'verify_email'
        }
        else if(role==2){
            api = 'verify_email_pat'
        }
        else if(role==3){
            api = 'verify_email_cli';
        }
        console.log(api);
        console.log(data);

        ApiFactory.save('POST',RESOURCE_URL+'/accounts/'+api,data)
        .then((res)=>{
            console.log(res);
            var at  = res['data']['token'];
            var aid = res['data']['account']['_id'];
            var role1 = res['data']['account']['role'];
            var uni_id = res['data']['uni_id'];

            ipCookie('token',at);
            ipCookie('aid',aid);
            ipCookie('role',role);
            ipCookie('uni_id',uni_id)
            
            $scope.bg_disable = false;
            $scope.loaded     = true;

            alert("successfully created your account")

            if(role1==1){
                $location.path('/doctor_dashboard')
            }
            else if(role1==2){
                $location.path('/patient_dashboard')
            }
            else if(role1==3){
                $location.path('/clinic_dashboard')
            }
        })
        .catch((e)=>{

            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded     = true;
            console.log(e);
        })
    }

    $scope.doctorSign = function(data){
        console.log(data)
        $scope.bg_disable = true;
        $scope.loaded     = false

        data['role'] = 1;
        data['ccode'] = 91;

        ApiFactory.save('POST',RESOURCE_URL+'/accounts/cr_acc_doc',data)
        .then((res)=>{

            var aid = res['data']['_id'];
            var role = res['data']['role']
            ipCookie('aid',aid);
            ipCookie('role',role)

            console.log(res)

            $scope.bg_disable = false;
            $scope.loaded = true;
            alert('please check your mail and enter otp')
            $location.path('/verify');

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.clinicSubmit = function(data){
        $scope.bg_disable = true;
        $scope.loaded     = false

        data['role'] = 3;
        data['ccode'] = 91;
        ApiFactory.save('POST',RESOURCE_URL+'/accounts/cr_acc_cli',data)
        .then((res)=>{

            var aid = res['data']['_id'];
            var role = res['data']['role']
            ipCookie('aid',aid);
            ipCookie('role',role)
            console.log(res)
            $scope.bg_disable = false;
            $scope.loaded = true;
            alert('please check your mail and enter otp')
            $location.path('/verify');

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.loginForm = function(data){
        $scope.bg_disable = true;
        $scope.loaded     = false
        // data['token'] = 5;
        var api = '';
        if($location.path()=='/doctor_login'){
            data['role'] = 1;
            api  =  'login_doc';
        }
        else if($location.path()=='/patient_login'){
            data['role'] = 2;
            api  =  'login_pat';
        }
        else if($location.path()=='/clinic_login'){
            data['role'] = 3;
            api  =  'login_cli';
        }

        ApiFactory.save('POST',RESOURCE_URL+'/accounts/'+api,data)
        .then((res)=>{
            var aid = res['data']['profile_data']['_id'];
            var token = res['data']['token']
            var role =  res['data']['profile_data']['role']
            ipCookie('aid',aid);
            ipCookie('token',token)
            ipCookie('role',role)
            console.log(res)
            $scope.bg_disable = false;
            $scope.loaded = true;
            
            if(role==1 || role=='1'){
                $location.path('/doctor_dashboard')
            }
            else if(role==2 || role=='2'){
                $location.path('/patient_dashboard');
            }
            else if(role==3 || role=='3'){
                $location.path('/clinic_dashboard');
            }

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.patientSubmit = function(data){
        $scope.bg_disable = true;
        $scope.loaded     = false

        data['role'] = 2;
        data['ccode'] = 91;
        console.log(data)

        ApiFactory.save('POST',RESOURCE_URL+'/accounts/cr_acc_pat',data)
        .then((res)=>{
            var aid = res['data']['_id'];
            ipCookie('aid',aid);
            ipCookie('role',res['data']['role']);
            console.log(res)

            $scope.bg_disable = false;
            $scope.loaded = true;
            alert('please check your mail and enter otp')
            $location.path('/verify');

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }


    // admin panel work start
    $scope.patientDetail = {};

    $scope.isObjectEmpty = function(card){
        return Object.keys(card).length === 0;
    }

    $scope.findPatientDetail  = function(data){
        console.log(data);

        $scope.bg_disable = true;
        $scope.loaded     = false

        // data['doctorId'] = ipCookie('aid');
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/patient_dtl',data)
        .then((res)=>{
            console.log(res)

            $scope.bg_disable = false;
            $scope.loaded = true;
            $scope.patientDetail = res['data'];

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.medicineSubmit = function(data,patientId){
        console.log(data);
        $scope.bg_disable = true;
        $scope.loaded     = false
        data['doctorId'] = ipCookie('aid');
        data['patientId'] = patientId;

        ApiFactory.save('POST',RESOURCE_URL+'/doctors/cr_medicine',data)
        .then((res)=>{
            console.log(res)

            $scope.bg_disable = false;
            $scope.loaded = true;
            alert("successfully created medicine");

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.medicineSubmitPatient = function(data){
        console.log(data);
        $scope.bg_disable = true;
        $scope.loaded     = false
        data['doctorId'] = '5c4c0d3d7540890016b7bdcb';
        data['patientId'] = ipCookie('aid');

        ApiFactory.save('POST',RESOURCE_URL+'/doctors/cr_medicine',data)
        .then((res)=>{
            console.log(res)

            $scope.bg_disable = false;
            $scope.loaded = true;
            alert("successfully created medicine");

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.totalPatients= function(){
        console.log(data);
        var data ={};
        $scope.bg_disable = true;
        $scope.loaded     = false
        data['doctorId'] = ipCookie('aid');
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/totalPatient_dtl',data)
        .then((res)=>{
            console.log(res)
            $scope.totalPatient = res['data']
            $scope.bg_disable = false;
            $scope.loaded = true;
        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }

    $scope.totalHistory= function(){
        console.log(data);
        var data ={};
        $scope.bg_disable = true;
        $scope.loaded     = false
        data['patientId'] = ipCookie('aid');
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/rd_patient_his',data)
        .then((res)=>{
            console.log(res)
            $scope.totalHistory = res['data']
            $scope.bg_disable = false;
            $scope.loaded = true;
        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }


    $scope.reportSubmit = function(data,patientId){
        
        $scope.bg_disable = true;
        $scope.loaded     = false
        data['clinicId'] = ipCookie('aid');
        data['patientId'] = patientId;
        console.log(data);

        ApiFactory.save('POST',RESOURCE_URL+'/doctors/cr_report',data)
        .then((res)=>{
            console.log(res)

            $scope.bg_disable = false;
            $scope.loaded = true;
            alert("successfully created medicine");

        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }



    $scope.totalReports= function(){
        console.log(data);
        var data ={};
        $scope.bg_disable = true;
        $scope.loaded     = false
        data['clinicId'] = ipCookie('aid');
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/totalReport_dtl',data)
        .then((res)=>{
            console.log(res)
            $scope.totalPatient = res['data']
            $scope.bg_disable = false;
            $scope.loaded = true;
        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        }) 
    }
    
    $scope.totalDoctors = function(){
        $scope.bg_disable = true;
        $scope.loaded     = false
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/tot_doc',{})
        .then((res)=>{
            console.log(res)
            $scope.totalDoctors = res['data']
            $scope.bg_disable = false;
            $scope.loaded = true;
        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        })
    }

    $scope.patientProfile = function(){
        $scope.bg_disable = true;
        $scope.loaded     = false
        var data = {};
        data['aid'] = ipCookie('aid');
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/rd_patient_pro',data)
        .then((res)=>{
            console.log(res)
            $scope.patientProfile =  res['data'][0];
            $scope.bg_disable = false;
            $scope.loaded = true;
        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        })
    }

    $scope.getNotification = function(){
        $scope.bg_disable = true;
        $scope.loaded     = false
        var data = {};
        data['patientId'] = ipCookie('aid');
        ApiFactory.save('POST',RESOURCE_URL+'/doctors/get_patient_notifi',data)
        .then((res)=>{
            console.log(res)
            $scope.notifications =  res['data']['history'];
            $scope.bg_disable = false;
            $scope.loaded = true;
        })
        .catch((e)=>{
            alert(e['message']);
            $scope.bg_disable = false;
            $scope.loaded = true;
            console.log("err",e);
        })
    }
    $scope.init = function(){
        if($location.path()=='/doctor_dashboard/patients'){
            $scope.totalPatients()
        }

        if($location.path()=='/patient_dashboard/history'){
            $scope.totalHistory()
        }

        if($location.path()=='/clinic_dashboard/patients'){
            $scope.totalReports()
        }

        if($location.path()=='/search'){
            $scope.totalDoctors();
        }

        if($location.path()=='/patient_dashboard/patient_profile'){
            $scope.patientProfile();
        }
        if($location.path()=='/patient_dashboard'){
            $scope.getNotification();
        }

    }

    $scope.labels = ['Below permissible', 'permissible', 'above permissible'];
    $scope.series = ['Series A'];
  
    $scope.data = [
      [25,20,55]
    ];

    $scope.init()    
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
