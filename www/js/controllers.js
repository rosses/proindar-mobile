//
angular.module('andes.controllers', [])
.controller('ValeCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.$on('$destroy', deregisterFirst);

  $scope.warehouse = $stateParams.warehouse;
  $scope.popCloseable = null;
  $rootScope.barra = '';
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.inventory = [];
  $scope.conteo = 0;
  $scope.custom_c = 1;

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $rootScope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.vale = null;
      $scope.receptor = "";
      $scope.bodega = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $rootScope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.vale = null;
    $scope.receptor = "";
    $scope.bodega = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.vale = null;
    $scope.receptor = "";
    $scope.bodega = "";
  }
  $scope.formatQty = function(x) {
    return parseFloat( x ) || 0;
  }
  $scope.borrar = function (IdArticulo) {
    $rootScope.confirmar('Desea reiniciar el artículo: '+IdArticulo+'?', function() {
      $rootScope.showload();
    });
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $rootScope.barra = document.getElementById('textbox_consumo').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=VC", { barra: $rootScope.barra }, function(data) {
        $rootScope.hideload();
        $rootScope.barra = "";
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }

        $scope.enableOp = true;
        $scope.vale = data;

        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_consumo').focus();
       
      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.barra = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_consumo').focus();
      });

    }

  });

  $scope.modalSalida = null;
  $scope.receptor = "";
  $scope.bodega = "";
  $scope.receptores = [];
  $scope.bodegas = [];


  $ionicModal.fromTemplateUrl('templates/finish_salida.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
  $scope.setreceptor = function(x) { $scope.receptor = x; }
  $scope.setbodega = function(x) { $scope.bodega = x; }
  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
  }
  $scope.finishValeconsumo = function() {
    if ($scope.vale.items.length == 0) {
      $rootScope.err("Vale sin lineas");
    }
    else {
      var sumado = 0;
      for (var i = 0; i < $scope.vale.items.length; i++) {
        var parcial = parseFloat($scope.vale.items[i].parcial);
        sumado += parcial;
      }

      if (sumado <= 0) {
        $rootScope.err("Suma de cantidades parciales deben ser mayor a cero");
        return false;
      }

      $scope.receptor = "";
      $scope.bodega = "";
      $scope.receptores = [];
      $scope.bodegas = [];
      $rootScope.showload();
      jQuery.get(app.rest+"ajax.mobile.data.php&a=employee", function(data) {
        $scope.receptores = data;
      },"json");
      jQuery.get(app.rest+"ajax.mobile.data.php&a=whs", function(data) {
        $rootScope.hideload();
        $scope.modalSalida.show();
        $scope.bodegas = data;
      },"json");


    }
  }
  $scope.confirmada = function() {
    if ($scope.bodega == "") {
      $rootScope.err("Indique bodega");
      return;
    }
    if ($scope.receptor == "") {
      $rootScope.err("Indique receptor de mercancias");
      return;
    }
    $rootScope.confirmar("Esta seguro?", function() {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=SendVC", {
        bodega: $scope.bodega,
        receptor: $scope.receptor,
        vale: $scope.vale, 
        autor: localStorage.getItem('user')
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else {
          $rootScope.ok(data.msg);
          $scope.vale = null;
          $scope.enableOp = false;
          $scope.modalSalida.hide();
        }        
      },"json");


    });
  };
  $scope.cancelarValeConsumo = function() {
    $rootScope.confirmar("Anular captura del vale de consumo?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });
  }
  $scope.moveParcial = function(index,variation) {
    var p = parseFloat($scope.vale.items[index].parcial);
    var q = parseFloat($scope.vale.items[index].quantity);
    
    if (p+variation > q || p+variation < 0) {
      return false;
    }

    p += variation;
    $scope.vale.items[index].parcial = ""+(p)+"";
  }
  document.getElementById('textbox_consumo').focus();
})
.controller('MakeloteentradaCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.$on('$destroy', deregisterFirst);
 
  $scope.barra = ''; 
  $scope.packet = [];
  $scope.modoEscaner = 'leer';

  $scope.grupo = localStorage.getItem('ocip');

  $scope.$on('$ionicView.enter', function(obj, viewData){
    
    if (viewData.direction == 'back') {
      $scope.barra = '';
      $scope.packet = [];
      $scope.modoEscaner = 'leer';
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.barra = '';
    $scope.packet = [];
    $scope.modoEscaner = 'leer';
  }); 

  $scope.cancelar = function() {
    $scope.barra = '';
    $scope.packet = [];
    $scope.modoEscaner = 'leer';
  }
  $scope.borrar = function (internalcode) {
    $rootScope.confirmar('Quitar pieza?', function() {
      for (var i = 0; i < $scope.packet.length; i++) {
        if ($scope.packet[i].internalcode == internalcode) {
          $scope.packet.splice(i,1);
          break;
        }
      }
    });
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {

      $scope.pieza = document.getElementById('pieza_lote_entrada').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=pieza&to=lote", { barra: $scope.pieza }, function(data) {
        $rootScope.hideload();
        $scope.pieza = "";
        document.getElementById('pieza_lote_entrada').value = "";
        $rootScope.$apply();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        if ($scope.packet.length > 0 && $scope.packet[0].OT!=data.OT) {
          $rootScope.err("Pieza no corresponde a OT en trabajo");
          return;
        }
        var add = 1;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya existe en este lote");
            add = 0;
            break;
          }
        }

        if (add==1) {
          $scope.packet.push({
            mark: data.mark,
            dimtype: data.dimtype,
            kg: parseFloat(data.totalkg),
            internalcode: data.internalcode,
            cardname: data.cardname,
            OT: data.OT,
            totalkg: parseFloat(data.totalkg),
            ot_id: data.ot_id
          });
        }

        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('pieza_lote_entrada').focus();
       
      },"json");

    } 

  });


  $scope.finishLote = function() {

    if ($scope.packet.length == 0) {
      $rootScope.err("Lote vacio, revise nuevamente");
    }
    else {
      $rootScope.confirmar("Se generará un lote y se moveran las piezas a la próxima etapa. Desea continuar?", function() {
        $rootScope.showload();
        jQuery.post(app.rest+"ajax.mobile.data.php&a=crearLote", { 
          ot: $scope.packet[0].ot_id,
          packet: $scope.packet,
          autor: localStorage.getItem('user')
        }, function(data) {
          $rootScope.hideload();
  
          if (data.error) {
            $rootScope.err(data.error);
            return;
          }

          $scope.barra = '';
          $scope.pieza = '';
          $scope.packet = [];
          $scope.modoEscaner = 'leer';
          $scope.enableOp = false;
          $scope.ot = null;

          $rootScope.ok(data.msg);

          $scope.$broadcast('scroll.resize');
          $rootScope.$apply();
          document.getElementById('pieza_lote_entrada').focus();
          
        },"json");
      });
    }
  }
  $scope.confirmada = function() {
    if ($scope.bodega == "") {
      $rootScope.err("Indique bodega");
      return;
    }

    if ($scope.receptor == "") {
      $rootScope.err("Indique receptor de mercancias");
      return;
    }
    $rootScope.confirmar("Esta seguro?", function() {
      $rootScope.showload();
    });
  };
  $scope.cancelarLote = function() {
    $rootScope.confirmar("Anular cierre de corte y armado del lote?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
  document.getElementById('pieza_lote_entrada').focus();
})
.controller('MoverCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.$on('$destroy', deregisterFirst);

  $scope.barra = '';
  $scope.modoEscaner = 'leer';
  $scope.enableOp = false;
  $scope.packet = [];
  $scope.ejecutor = "";
 

  $scope.$on('$ionicView.enter', function(obj, viewData){
    
    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.enableOp = false;
      $scope.packet = [];
      $scope.ejecutor = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.packet = [];
    $scope.ejecutor = "";
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.enableOp = false;
    $scope.packet = [];
    $scope.ejecutor = "";
  }
  $scope.borrar = function (IdPieza) {
    for (var i = 0; i < $scope.packet.length; i++) {
      if ($scope.packet[i].internalcode == IdPieza) {
        $scope.packet.splice(i, 1);
        break;
      }
    }
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $scope.barra = document.getElementById('textbox_moveme').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=moving", { barra: $scope.barra, autor: localStorage.getItem('user') }, function(data) {
        $rootScope.hideload();

        $scope.barra = "";
        $rootScope.$apply();
        
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        
        var found = 0;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya existe en esta gestión");
            found = 1;
            break;
          }
        }

        if (found == 1) {
          return;
        }
        
        if (found == 0) {
          /*
          if (data.current_step != $scope.gol) {
            $rootScope.err("Pieza no se encuentra en la etapa indicada. Se encuentra en "+data.stepName);
            return;
          }
          */

          $scope.packet.push({
            internalcode: data.internalcode,
            mark: data.mark,
            dimtype: data.dimtype,
            destination: data.stepId,
            nextStep: {
              id: data.nextStepId,
              name: data.nextStepName
            },
            prevStep: {
              id: data.prevStepId,
              name: data.prevStepName
            },
            currentStep: {
              id: data.stepId,
              name: data.stepName
            }
          });
        } 
        
        
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('textbox_moveme').focus();

      },"json").fail(function(err) {
        $rootScope.hideload(); 
        $rootScope.barra = "";
        $rootScope.$apply();
        $rootScope.err(err.error);
        document.getElementById('textbox_moveme').focus();
      });

    }

  });

  $scope.MOVER = function(gol) {
      $scope.enableOp = true;
      $scope.modoEscaner = "moving";
      $scope.flowforward = true;
      $scope.gol = gol;
  }

  $scope.modalSalida = null;
  $scope.ejecutor = "";
  $scope.ejecutores = [];

  $ionicModal.fromTemplateUrl('templates/finish_move.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalSalida = modal;
  });
  $scope.closeSalida = function() {
    $scope.modalSalida.hide();
  }
  $scope.finishMover = function() {
    if ($scope.packet.length == 0) {
      $rootScope.err("movimiento vacio");
    }
    else {
      $scope.finalMoves = [];
      for (var i = 0; i < $scope.packet.length; i++) {
        if ($scope.packet[i].destination != $scope.packet[i].currentStep.id) {
          $scope.finalMoves.push($scope.packet[i]);
        }
      }

      if ($scope.finalMoves.length == 0) {
        $rootScope.err("sin movimientos");
        return false;
      }


      console.log($scope.finalMoves);
      $scope.ejecutor = "";
      $scope.ejecutores = [];
      $rootScope.showload();
      jQuery.get(app.rest+"ajax.mobile.data.php&a=employee", function(data) {
        $scope.ejecutores = data;
        $rootScope.hideload();
        $scope.modalSalida.show();
      },"json");
    }
  }

  $scope.setejecutor = function(x) { $scope.ejecutor = x; }
  $scope.confirmada = function() {
    if ($scope.ejecutor == "") {
      $rootScope.err("Indique ejecutor de tarea");
      return;
    }  
    $rootScope.confirmar("Esta seguro?", function() {
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=Mover", {
        ejecutor: $scope.ejecutor,
        items: $scope.finalMoves, 
        autor: localStorage.getItem('user')
      }, function(data) {
        $rootScope.hideload();
        if (data.error) {
          $rootScope.err(data.error);
        }
        else {
          $scope.packet = [];
          $scope.modalSalida.hide();
          $rootScope.ok(data.msg);
        }        
      },"json");

    });
  };
  $scope.cancelarEntrega = function() {
    $rootScope.confirmar("Anular proceso?", function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {
    });

  }
  document.getElementById('textbox_moveme').focus();
})
.controller('MarcaterminoCtrl', function($scope, $state, $rootScope, $localStorage, $ionicModal, $http, $location, $timeout, $ionicLoading, $ionicPopup, $ionicHistory, $stateParams, $ionicPlatform) {
  

  var deregisterFirst = $ionicPlatform.registerBackButtonAction(
    function() {
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, 100
  );
  $scope.modalSteper = null;
  $scope.$on('$destroy', deregisterFirst);


  $scope.barra = '';
  $scope.stepName = '';
 
  if ($stateParams.step == "4") { $scope.stepName = "ARMADO"; }
  if ($stateParams.step == "5") { $scope.stepName = "SOLDADURA"; } 
  //if ($stateParams.step == "7") { $scope.stepName = "CALIDAD"; }
  $scope.setStep = function(sx) {
    $stateParams.step = sx;
 
    if ($stateParams.step == "4") { $scope.stepName = "ARMADO"; }
    if ($stateParams.step == "5") { $scope.stepName = "SOLDADURA"; } 
  }
  $scope.etapaOK = function() {
    $scope.modalSteper.hide();
  };
  $scope.modoEscaner = 'leer';
  $scope.packet = [];
  $scope.ejecutor = "";
 

  $scope.$on('$ionicView.enter', function(obj, viewData){

    if ($stateParams.step == "" || $stateParams.step == null) {
      //$stateParams.step = "3";
      $scope.ejecutor = "";
      $scope.etapas = [{
        id: 4,
        name: 'ARMADO'
      },{
        id: 5,
        name: 'SOLDADURA'
      }];

      $ionicModal.fromTemplateUrl('templates/modal_step.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalSteper = modal;
        $scope.modalSteper.show();
      });
    }

    if (viewData.direction == 'back') {
      $scope.popCloseable = null;
      $scope.barra = '';
      $scope.modoEscaner = 'leer';
      $scope.packet = [];
      $scope.ejecutor = "";
    }
  });

  $scope.$on('$ionicView.beforeLeave', function(obj, viewData){
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.packet = [];
    $scope.ejecutor = ""; 
  }); 

  $scope.cancelar = function() {
    $scope.popCloseable = null;
    $scope.barra = '';
    $scope.modoEscaner = 'leer';
    $scope.packet = [];
    $scope.ejecutor = "";
  }
  $scope.borrar = function (IdPieza) {
    for (var i = 0; i < $scope.packet.length; i++) {
      if ($scope.packet[i].internalcode == IdPieza) {
        $scope.packet.splice(i, 1);
        break;
      }
    }
  };

  $scope.$on('scanner', function(event, args) {
    if ($scope.modoEscaner == "leer") {
      $scope.barra = document.getElementById('pieza_lote_salida').value;
      $rootScope.showload();
      jQuery.post(app.rest+"ajax.mobile.data.php&a=moving", { 
        barra: $scope.barra, 
        autor: localStorage.getItem('user'),
        to: $stateParams.step,
        action: "final"
      }, function(data) {
        $rootScope.hideload();
        document.getElementById('pieza_lote_salida').value = "";
        $scope.barra = "";
        $rootScope.$apply();
        if (data.error) {
          $rootScope.err(data.error);
          return;
        }
        if ($scope.packet.length > 0 && $scope.packet[0].OT!=data.OT) {
          $rootScope.err("Pieza no corresponde a OT en trabajo");
          return;
        }
        var found = 0;
        for (var i = 0; i < $scope.packet.length; i++) {
          if ($scope.packet[i].internalcode == data.internalcode) {
            $rootScope.err("Pieza ya existe en esta gestión");
            found = 1;
            break;
          }
        }
        if (found == 1) {
          return;
        }
        
        if (found == 0) {

          $scope.packet.push({
            internalcode: data.internalcode,
            mark: data.mark,
            dimtype: data.dimtype,
            cardname: data.cardname,
            OT: data.OT,
            totalkg: parseFloat(data.totalkg)
          });
        } 
        
        
        $scope.$broadcast('scroll.resize');
        $rootScope.$apply();
        document.getElementById('pieza_lote_salida').focus();

      },"json");

    }

  });

  $scope.modalInicio = null;
  $scope.ejecutor = "";
  $scope.ejecutores = [];

  $ionicModal.fromTemplateUrl('templates/modal_emp_inicio.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalInicio = modal;
  });
  $scope.closeSalida = function() {
    $scope.modalInicio.hide();
  }
  $scope.prepareTermino = function() {
    if ($scope.packet.length == 0) {
      $rootScope.err("movimiento vacio");
    }
    else {

      $rootScope.confirmar("Esta seguro?", function() {
        $rootScope.showload();
        jQuery.post(app.rest+"ajax.mobile.data.php&a=trx_mover", {
          ejecutor: $scope.ejecutor,
          items: $scope.packet, 
          autor: localStorage.getItem('user'),
          to: $stateParams.step, 
          action: "final"
        }, function(data) {
          $rootScope.hideload();
          if (data.error) {
            $rootScope.err(data.error);
          }
          else {
            $scope.packet = [];
            $scope.modalInicio.hide();
            $rootScope.ok(data.msg);
          }        
        },"json");

      });
 
    }
  }

  $scope.setejecutor = function(x) { $scope.ejecutor = x; }
 
  $scope.cancelarInicio = function() {
    $rootScope.confirmar("Salir?", function() {
      $ionicHistory.clearCache();
      $ionicHistory.nextViewOptions({
          historyRoot: true
      });
      $state.go('main.selector');
    }, function() {

    });
  }
  document.getElementById('pieza_lote_salida').focus();
})
.controller('MainCtrl', function($scope, $state, $localStorage, $timeout, $interval, $ionicModal, $rootScope, $location, $ionicLoading, $ionicSideMenuDelegate, $ionicHistory) {

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.inicio = function() {
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });
    $state.go('main.selector');
    $ionicSideMenuDelegate.toggleLeft();
  };
})
String.prototype.toBytes = function() {
    var arr = []
    for (var i=0; i < this.length; i++) {
    arr.push(this[i].charCodeAt(0))
    }
    return arr
}
function miles(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}