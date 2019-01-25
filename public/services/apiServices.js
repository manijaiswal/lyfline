'use strict';

var ApiFactory   = angular.module('ApiFactory',[]);


ApiFactory.factory('ApiFactory',['$http','$q',function($http,$q){
    console.log("in api factory");
    var data  = {};
    $http.defaults.headers.post["Content-Type"] = "text/plain";
    data.save = function(method,url,data){
        var deferred = $q.defer();
        $http({
            url:url,
            method:method,
            data:$.param(data),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then((data)=>{
            
            if(data['status']==200){
                deferred.resolve(data['data']);
            }else{
                console.log("hee",data);
                deferred.reject(data['data']);
            }
            
        }).catch((e)=>{
            deferred.reject(e['data']);
        })
        return deferred.promise
    }

    

    data.RESOURCE_URL = function(){
        return "https://medexpertnitp.herokuapp.com";  //http://localhost:3000  //https://vizack-tech.herokuapp.com/ https://medexpertnitp.herokuapp.com/
    }

    return data;
}])