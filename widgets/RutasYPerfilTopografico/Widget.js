///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 'jimu/BaseWidget',
"esri/tasks/RouteTask", "esri/symbols/SimpleMarkerSymbol",
"esri/symbols/SimpleLineSymbol", "esri/Color", "dojo/dom", "dojo/on",
"dojo/_base/lang", "esri/graphic", "esri/geometry/Point", "esri/tasks/RouteParameters",
"esri/tasks/FeatureSet", "esri/tasks/RouteResult", "dojo/_base/connect", "esri/toolbars/draw",
"esri/geometry/Polyline", "esri/dijit/ElevationProfile", "esri/units", "esri/SpatialReference", 
"esri/symbols/SimpleFillSymbol", "esri/tasks/QueryTask", "esri/tasks/query", 
],
  function(declare, BaseWidget, RouteTask, SimpleMarkerSymbol,
    SimpleLineSymbol, Color, dom, on, lang, Graphic, Point, RouteParameters,
    FeatureSet, RouteResult, connect, Draw, Polyline, ElevationProfile, units, SpatialReference, 
    SimpleFillSymbol, QueryTask, Query, 
    ) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      // Custom widget code goes here

      baseClass: 'jimu-widget-RutasYPerfilTopografico',

      //this property is set by the framework when widget is loaded.
      //name: 'CustomWidget',


      //methods to communication with app container:

      // postCreate: function() {
      //   this.inherited(arguments);
      //   console.log('postCreate');
      // },

      // startup: function() {
      // //  this.inherited(arguments);
      // //  this.mapIdNode.innerHTML = 'map id:' + this.map.id;
      // //  console.log('startup');
      // },

      simbolo1: null,
      simboloRuta: null,
      polygonBarrierSymbol: null,
      toolbar: null,

      onOpen: function () {
        this.map.graphics.clear();

        this.simbolo1 = new SimpleMarkerSymbol({
          "color": [255,255,255,64],
          "size": 12,
          "angle": -30,
          "xoffset": 0,
          "yoffset": 0,
          "type": "esriSMS",
          "style": "esriSMSCircle",
          "outline": {
            "color": [0,0,0,255],
            "width": 1,
            "type": "esriSLS",
            "style": "esriSLSSolid"
          }
        });

        this.simboloRuta = new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          new Color([89,95,35]),
          4.0
        );

        this.polygonBarrierSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])
        );

        var chartOptions = {
          title: "Perfil de elevaciones de la ruta",
          chartTitleFontSize: 14,
          axisTitleFontSize: 11,
          axisLabelFontSize: 9,
          indicatorFontColor: '#eee',
          indicatorFillColor: '#666',
          busyIndicatorBackgroundColor: "#666",
          titleFontColor: '#eee',
          axisFontColor: '#ccc',
          axisMajorTickColor: '#333',
          skyTopColor: "#B0E0E6",
          skyBottomColor: "#4682B4",
          waterLineColor: "#eee",
          waterTopColor: "#ADD8E6",
          waterBottomColor: "#0000FF",
          elevationLineColor: "#D2B48C",
          elevationTopColor: "#8B4513",
          elevationBottomColor: "#CD853F",
          elevationMarkerStrokeColor: "#FF0000",
          elevationMarkerSymbol: "m -6 -6, l 12 12, m 0 -12, l -12 12"
        };  
      
        perfilDeElevaciones = new ElevationProfile({
          map: this.map,
          profileTaskUrl: "https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer",
          scalebarUnits: units.METERS,
          chartOptions: chartOptions,
        },"perfilElevaciones");
        perfilDeElevaciones.startup();
      },

      tipoRuta: function() {
        if (this.selector.value == 2){
          this.puntosRuta();
        }else if(this.selector.value == 3){
          this.dibujaLinea();
        }else{
          this.borrarRuta();
        };
      },

      puntosRuta: function () {
        this.map.disableMapNavigation();
        this.toolbar = new Draw(this.map);
        this.toolbar.activate(Draw.POINT);
        this.toolbar.on("draw-complete", lang.hitch(this ,this.pintaPuntos));
      },

      pintaPuntos: function(evento) {
        this.map.enableMapNavigation();

        var punto = new Point(evento.geometry);
        var grafico = new Graphic(punto, this.simbolo1);
        this.map.graphics.add(grafico);
      },

      dibujaLinea: function(evento) {
        this.map.disableMapNavigation();
        this.toolbar = new Draw(this.map);
        this.toolbar.activate(Draw.FREEHAND_POLYLINE);
        this.toolbar.on("draw-complete", lang.hitch(this ,this.pintaLinea));
      },

      pintaLinea: function(evento){
        this.map.enableMapNavigation();

        var polilinea = new Polyline(evento.geometry);
        var grafico = new Graphic(polilinea, this.simboloRuta);
        this.map.graphics.add(grafico);

        this.muestraPerfil(evento);
      },

      borrarRuta: function(){
        this.toolbar.deactivate();
        this.map.graphics.clear();
        this.map.enableMapNavigation();
        perfilDeElevaciones.clearProfile();
      },

      calculaRuta: function () {
        this.toolbar.deactivate();
        this.map.enableMapNavigation();

        var servicioRutasAGOL = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/";
        var routeTask = new RouteTask(servicioRutasAGOL);
        var routeParams = new RouteParameters();
        routeParams.stops = new FeatureSet();
        routeParams.stops.features = this.map.graphics.graphics;
        routeParams.returnRoutes = true;
        routeParams.returnDirections = true;

        // Las barreras (zonas restringidas) tienen que ser otro feature set
        var servicioEntidadesEditable = "https://services5.arcgis.com/zZdalPw2d0tQx8G1/ArcGIS/rest/services/Servicios_editables/FeatureServer/1";
        routeParams.polygonBarriers = new FeatureSet();

        const queryTask = new QueryTask(servicioEntidadesEditable);
        var query = new Query();
        query.returnGeometry = true;
        query.where = '1=1';
        queryTask.execute(query, lang.hitch(this, function (results) {
          for (poligono of results.features) {
            routeParams.polygonBarriers.features.push(
              this.map.graphics.add(new Graphic(poligono.geometry, this.polygonBarrierSymbol)))
          };
        }));

        // routeTask.on("error", this.errorHandler);
        
        routeTask.solve(routeParams);
        routeTask.on("solve-complete", lang.hitch(this, this.muestraRuta));
        routeTask.on("solve-complete", lang.hitch(this, this.muestraPerfil));
      },

      errorHandler: function (err) {
        console.log(err);
        alert("Ha ocurrido un error:\n" + JSON.stringify(err));
      },

      muestraRuta: function(evento) {
        var solveResult = evento.result;
        var routeResults = solveResult.routeResults;
        var routePaths = routeResults[0].route;
        routePaths.setSymbol(this.simboloRuta);

        var barriers = solveResult.barriers;
        var polygonBarriers = solveResult.polygonBarriers;
        var polylineBarriers = solveResult.polylineBarriers;
        var messages = solveResult.messages;

        this.map.graphics.add(routePaths);
      },

      muestraPerfil: function(evento){
        if (evento.hasOwnProperty("result")){
          var solveResult = evento.result;
        var routeResults = solveResult.routeResults;
        var routePaths = routeResults[0].route;
        perfilDeElevaciones.set("profileGeometry", routePaths.geometry);
        }else{
          perfilDeElevaciones.set("profileGeometry", evento.geometry);
        };
        
        this.toolbar.deactivate();
        this.map.enableMapNavigation();
      },

      onClose: function(){
        this.toolbar.deactivate();
        this.map.graphics.clear();
        this.map.enableMapNavigation();
        perfilDeElevaciones.clearProfile();
      },

      // onMinimize: function(){
      //   console.log('onMinimize');
      // },

      // onMaximize: function(){
      //   console.log('onMaximize');
      // },

      // onSignIn: function(credential){
      //   /* jshint unused:false*/
      //   console.log('onSignIn');
      // },

      // onSignOut: function(){
      //   console.log('onSignOut');
      // }

      // onPositionChange: function(){
      //   console.log('onPositionChange');
      // },

      // resize: function(){
      //   console.log('resize');
      // }

      //methods to communication between widgets:

    });
  });