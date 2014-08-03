'use strict';

angular.module('doingFineApp')
  .controller('ScheduleCtrl', function ($scope, Setup) {
    //verify that data from '/setup' state persists through Setup factory
    console.log(Setup.sender);

    //boolean used to toggle schedule setup and confirmation screens
    $scope.submitted = false;

    $scope.submit = function(){
      $scope.submitted = true;
    };


    $scope.mytime = new Date();

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridian = true;
    $scope.toggleMode = function() {
      $scope.ismeridian = ! $scope.ismeridian;
    };

    $scope.update = function() {
      var d = new Date();
      d.setHours( 14 );
      d.setMinutes( 0 );
      $scope.mytime = d;
    };

    $scope.changed = function () {
      console.log('Time changed to: ' + $scope.mytime);
    };

    $scope.clear = function() {
      $scope.mytime = null;
    };
  });
