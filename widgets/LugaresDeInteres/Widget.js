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
"esri/dijit/Bookmarks", "dojo/dom", "esri/layers/FeatureLayer", "esri/geometry/Extent",
"esri/geometry/Point", "dojo/on", "dojo/_base/lang", "esri/SpatialReference", 
"esri/tasks/query", "esri/tasks/QueryTask", "esri/dijit/BookmarkItem", 
"esri/geometry/geometryEngine", "esri/graphic", "esri/geometry/Polygon", 
"esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/dijit/Popup", "esri/dijit/PopupTemplate", "dojo/dom-construct",
],
  function(declare, BaseWidget, Bookmarks, dom, FeatureLayer, Extent, Point, on, 
    lang, SpatialReference, Query, QueryTask, BookmarkItem, geometryEngine, 
    Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol, Color, Popup, PopupTemplate, domConstruct,
    ) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      // Custom widget code goes here

      baseClass: 'jimu-widget-customwidget',

      //this property is set by the framework when widget is loaded.
      //name: 'CustomWidget',


      //methods to communication with app container:

      // postCreate: function() {
        // // Widget de marcadores
        // var marcadores = new Bookmarks({
        //   map: this.map,
        //   bookmarks: [],
        //   editable: false
        // }, this.esriBookmarks);      

        // const urlPuntosInteres = "https://services5.arcgis.com/zZdalPw2d0tQx8G1/ArcGIS/rest/services/Servicios_no_editables_PFM/FeatureServer/0";

        // var capaPuntosDeInteres = new FeatureLayer(urlPuntosInteres, {outFields: ['*']});
        // this.map.addLayer(capaPuntosDeInteres.hide());

       
        // // var popup = new Popup({
        // //   fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
        // //     new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
        // //       new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
        // // }, domConstruct.create("div"));


        // var arrayPrueba = [];

        // const queryTask = new QueryTask(urlPuntosInteres);
        // var query = new Query();
        // query.returnGeometry = true;
        // query.where = '1=1';
        // queryTask.execute(query, lang.hitch(this, function(results) {
        //   for (objeto of results.features) {
        //     // marcadores.addBookmark(objeto);
        //     var bufferedGeometries = geometryEngine.geodesicBuffer(objeto.geometry, [150], "meters", false);

        //     console.log("objeto",objeto)
        //     console.log(this.map.infoWindow.show(objeto,objeto))

        //     var extensionBufferedGeometries = bufferedGeometries.getExtent();
        //     marcadores.addBookmark({"extent":extensionBufferedGeometries, "name": `${objeto.attributes.nombre}`});
        //   };
        // }));
        // marcadores.startup();
        // marcadores.show();
        
        // // Zoom provisional
        // var puntoProvisional = new Point(-991211.9633276506, 5195303.719843492, new SpatialReference({ wkid: 102100 }));
        // this.map.centerAndZoom(puntoProvisional,12);
      // },

      // startup: function() {
      //  this.inherited(arguments);
      //  this.mapIdNode.innerHTML = 'map id:' + this.map.id;
      //  console.log('startup');
      // },

      onOpen: function(){
        // Widget de marcadores
        var marcadores = new Bookmarks({
          map: this.map,
          bookmarks: [],
          editable: false
        }, this.esriBookmarks);      

        const urlPuntosInteres = "https://services5.arcgis.com/zZdalPw2d0tQx8G1/ArcGIS/rest/services/Servicios_no_editables_PFM/FeatureServer/0";

        var capaPuntosDeInteres = new FeatureLayer(urlPuntosInteres, {outFields: ['*']});
        this.map.addLayer(capaPuntosDeInteres.hide());


        var arrayPrueba = [];

        const queryTask = new QueryTask(urlPuntosInteres);
        var query = new Query();
        query.returnGeometry = true;
        query.where = '1=1';
        queryTask.execute(query, lang.hitch(this, function(results) {
          for (objeto of results.features) {
            // marcadores.addBookmark(objeto);
            var bufferedGeometries = geometryEngine.geodesicBuffer(objeto.geometry, [150], "meters", false);

            var extensionBufferedGeometries = bufferedGeometries.getExtent();
            marcadores.addBookmark({"extent":extensionBufferedGeometries, "name": `${objeto.attributes.nombre}`});
          };
        }));
        marcadores.startup();
        marcadores.show();
        

      },


      // onClose: function(){
      //   console.log('onClose');
      // },

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