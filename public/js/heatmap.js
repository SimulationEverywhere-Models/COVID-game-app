let geom;
let plane;

class HeatMapFloorFlat extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
    }

    load() {
        console.log("Heat Map Floor loaded.");
        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }

        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('myAwesomeExtensionButton');
        this._button.onClick = (ev) => {
            // Get current selection and isolate objects
            this.renderCloud();

        };
        this._button.setToolTip('Isolate Object');
        this._button.addClass('myAwesomeExtensionIcon');
        this._group.addControl(this._button);
        
    }

    renderCloud(){
        // Turn off progressive rendering and ambient shadows for nice look
        if (viewer.prefs.progressiveRendering) {
            progressiveRenderingWasOn = true;
            viewer.setProgressiveRendering(false);
        }
        if (viewer.prefs.ambientShadows) {
            ambientShadowsWasOn = true;
            viewer.prefs.set("ambientShadows", false);
        }

         // Settings configuration flags
         var progressiveRenderingWasOn = false, ambientShadowsWasOn = false;
        
         // Find fragmentId of a desired mesh by selection_changed_event listener
         var roofFrag = 1; 
 
         // simpleheat private variables
         var _heat, _data = [];
         
         // Configurable heatmap variables:
         // MAX-the maximum amplitude of data input
         // VAL-the value of a data input, in this case, it's constant
         // RESOLUTION-the size of the circles, high res -> smaller circles
         // FALLOFF-the rate a datapoint disappears
         // Z_POS-vertical displacement of plane
         var MAX = 2000, VAL = 1500, RESOLUTION = 20, FALLOFF = 30, Z_POS = 0.1;
 
         // THREE.js private variables
         var _material, _texture, _bounds, _plane;

        this._bounds = this.genBounds(roofFrag);        
        this._heat = this.genHeatMap();
        this._texture = this.genTexture();
        this._material = this.genMaterial();
        
        this._plane = this.clonePlane();
        
        this.animate();
    }

    unload() {
        if (progressiveRenderingWasOn)
            viewer.setProgressiveRendering(true);
        if (ambientShadowsWasOn) {
            viewer.prefs.set("ambientShadows", true);
        }
        if (groundShadowWasOn) {
            viewer.setGroundShadow(true);
        }
        
        progressiveRenderingWasOn = ambientShadowsWasOn = groundShadowWasOn = false;
        
        delete viewer.impl.matman().materials.heatmap;
        viewer.impl.scene.remove(this._plane);
        
        console.log("Heat Map Floor unloaded.");
        return true;
    }

    genBounds(fragId){
        var bBox = new THREE.Box3();        
        viewer.model.getFragmentList().getWorldBounds(fragId, bBox);

        var width = Math.abs(bBox.max.x - bBox.min.x);
        var height = Math.abs(bBox.max.y - bBox.min.y);
        var depth = Math.abs(bBox.max.z - bBox.min.z);

        // min is used to shift for the shader, the others are roof dimensions
        return {width: width, height: height, depth: depth, min: bBox.min};
    }

    genHeatMap(){
         var MAX = 2000,RESOLUTION = 20;
        var canvas = document.createElement("canvas");
        canvas.id = "texture";
        canvas.width = this._bounds.width * RESOLUTION;
        canvas.height = this._bounds.height * RESOLUTION;
        document.body.appendChild(canvas);

        return simpleheat("texture").max(MAX);
    }

    receivedData(){
        return [Math.random() * $("#texture").width(),
                Math.random() * $("#texture").height(),
                Math.random() * 1500];
    }

    decay(data){
        // removes elements whose amlitude is < 1
        return data.filter(function(d) {
            d[2] -= 30;
            return d[2] > 1;
        });
    }

    genTexture(){
        var canvas = document.getElementById("texture");
        var texture = new THREE.Texture(canvas);
        return texture;
    }

    genMaterial(){
        var material = new THREE.MeshBasicMaterial({
            map: this._texture,
            side: THREE.DoubleSide,
            alphaMap: THREE.ImageUtils.loadTexture("../img/particle.png")
        });
        material.transparent = true;

        // register the material under the name "heatmap"
        viewer.impl.matman().addMaterial("heatmap", material, true);
        
        return material;
    }

    clonePlane(){
        // To use native three.js plane, use the following mesh constructor
        geom = new THREE.PlaneBufferGeometry(this._bounds.width, this._bounds.height);
        plane = new THREE.Mesh(geom, this._material);
        plane.position.set(0, 0, this._bounds.min.z + 0.1);

        viewer.impl.addOverlay("pivot", plane);
        
        return plane;
    }         

    // Animation loop for checking for new points and drawing them on texture
    animate() {
        var _heat, _data = [];
        requestAnimationFrame(this.animate());
        this._heat.add(this.receivedData());
        this._heat.add(this.receivedData());
        this._heat.add(this.receivedData());
        this._heat._data = this.decay(this._heat._data);
        this._heat.draw();

        this._texture.needsUpdate = true;
        // setting var 3 to true enables invalidation even without changing scene
        viewer.impl.invalidate(true, false, true);
    }  

}

Autodesk.Viewing.theExtensionManager.registerExtension('HeatMapFloorFlat', HeatMapFloorFlat);
