var prevPos = 0;

class NestedViewerExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
    }
    load() {
        console.log(prevPos);
        this.createToolbar();
        console.log('NestedViewerExtensions has been loaded');
        //this.viewer.navigation.setCamera(THREE.Vector3(59.91213368381141, -63.325886161864766, 0.09867663643945346));
        this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChange);
        return true;
    }
    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log('NestedViewerExtensions has been unloaded');
        return true;
    }
    onCameraChange() {
        const ray = new THREE.Ray(viewer.navigation.getPosition(), viewer.navigation.getEyeVector());
        const intersections = viewer.impl.rayIntersect(ray, false);
        if(intersections && intersections.distance <= 2) {
            viewer.navigation.setPosition(prevPos);
        }
        prevPos = viewer.navigation.getPosition();
    }
    createToolbar(){
        var toolbar = new Autodesk.Viewing.UI.ToolBar('toolbar-TtIf');

        var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup('Autodesk.Research.TtIf.Extension.Toolbar.ControlGroup');

            ctrlGroup.addClass('toolbar-vertical-group');

            // Names, icons and tooltips for our toolbar buttons
            var names = ['CGB1', 'CGB2', 'CGB3','CGB4'];
            var icons = ['play', 'fire', 'flash', 'dashboard'];
            var tips = ['Play', 'Temperature', 'Power','Dashboard'];
            
            // Operations for when the buttons are clicked
            var clicks =
            [
            function () { setStartingPos(); },
            function () { console.log('Temperature clicked'); },
            function () { console.log('Power clicked'); }
            ]

            // Operations for when buttons are unclicked (i.e. toggled off)

            // If false, then the button won't have any 'state'
            var unclicks =
            [
            function () { console.log('Dashboard clicked'); },
            function () { console.log('Temperature clicked'); }
            ]

            var button;
            
            for (var i = 0; i < names.length; i++) {
                // Start by creating the button
                button = new Autodesk.Viewing.UI.Button('Autodesk.Research.TtIf.Extension.Toolbar.' + names[i]         
                );
         
                // Assign an icon     
                if (icons[i] && icons[i] !== '') {         
                  button.icon.classList.add('myicon');         
                  button.icon.classList.add('glyphicon');         
                  button.icon.classList.add('glyphicon-' + icons[i]);         
                }
               // Set the tooltip   
                button.setToolTip(tips[i]);
         
                // Only create a toggler for our button if it has an unclick operation        
                if (unclicks[i]) {         
                  button.onClick = createToggler(button, clicks[i], unclicks[i]);         
                }         
                else {         
                  button.onClick = clicks[i];         
                }

                ctrlGroup.addControl(button);   
              }

              toolbar.addControl(ctrlGroup);
              var toolbarDivHtml = '<div id="divToolbar"> </div>';

            $(viewer.container).append(toolbarDivHtml);
             // We want our toolbar to be centered vertically on the page

            toolbar.centerToolBar = function () {
              $('#divToolbar').css({
                'top': 'calc(50% + ' + toolbar.getDimensions().height / 2 + 'px)'
                  });
            };

        toolbar.addEventListener(
            Autodesk.Viewing.UI.ToolBar.Event.SIZE_CHANGED,toolbar.centerToolBar);

          $('#divToolbar').css({
            'top': '0%',      
            'left': '0%',
            'z-index': '100',
            'position': 'absolute'     
          });

          $('#divToolbar')[0].appendChild(toolbar.container);

          setTimeout(function () {
            toolbar.centerToolBar(); 
            }, 100);

            function deleteToolbar() {
                $('#divToolbar').remove();       
              }
    
              function createToggler(button, click, unclick) {

                return function () {
            
                  var state = button.getState();
            
                  if (state === Autodesk.Viewing.UI.Button.State.INACTIVE) {           
                    button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);           
                    click();           
                  }
                   else if (state === Autodesk.Viewing.UI.Button.State.ACTIVE) {           
                    button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);           
                    unclick();           
                  }
            
                };
            
              }

              function setVisibility(panel, flag) {
                  if (panel)           
                    panel.setVisible(flag);           
              }

                var css = [
                  '.myicon {',           
                    'font-size: 20px;',           
                    'padding-top: 1px !important;',            
                  '}',

                  '.toolbar-vertical-group {',           
                    'left: 943px;',           
                    'position: absolute;',    
                    'top:-90px',        
                  '}',
                          
                  '.toolbar-vertical-group > .adsk-button > .adsk-control-tooltip {',           
                    'right: 118%;', 
                    'left: -246%;',         
                    'bottom: 25%;',           
                  '}'
              
                ].join('\n');
                  $('<style type="text/css">' + css + '</style>').appendTo('head');
            }    
            

}

Autodesk.Viewing.theExtensionManager.registerExtension('NestedViewerExtension', NestedViewerExtension);
// Autodesk.Viewing.theExtensionManager.loadExtension("Autodesk.BimWalk");

// viewer.getExtension("Autodesk.BimWalk").tool.navigator.handleKeyDown = function (event, keyCode) {
//   var handled = true;
//   switch (keyCode) {
//     case this.keys.SHIFT:
//       this.running = true;
//       break;
//     case this.keys.DASH:
//       var topSpeed = this.get('topWalkSpeed') - 1;
//       this.tool.set('topWalkSpeed', topSpeed);
//       break;
//     case this.keys.EQUALS:
//     case this.keys.PLUS:
//     case this.keys.PLUSMOZ:
//       var topSpeed = this.get('topWalkSpeed') + 1;
//       this.tool.set('topWalkSpeed', topSpeed);
//       break;
//     case this.keys.CONTROL:
//     case this.keys.ALT:
//       break;
//     case this.keys.SPACE:
//       this.enableGravity(!this.gravityEnabled);
//       break;
//     case this.keys.UP:
//     case this.keys.w:
//       this.moveForward = 1.0;
//       break;
//     case this.keys.LEFT:
//       break;
//     case this.keys.RIGHT:
//       break;
//     case this.keys.DOWN:
//     case this.keys.s:
//       break;
//     case this.keys.a:
//       break;
//       break;
//     case this.keys.e:
//       break;
//     case this.keys.q:
//       break;
//     default:
//       handled = false;
//       break;}
//   this.running = event.shiftKey;
//   if (this.ui.onKeyDown) {
//     handled |= this.ui.onKeyDown(event, keyCode);
//   }
//   return handled;
// };

function setStartingPos() {
  let a = viewer.navigation;
  const v = new THREE.Vector3(60.35667198613261, -72.79151941613085, 0.09867663643945346);
  a.setPosition(v);
}



