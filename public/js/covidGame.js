/* 
  Author(s): 
    - Dr. Vinu Subashini Rajus
    - Omar Kawach 
    - Mitali Patel
    - Ryan Carriere
*/

/* 
  Cell types:
    - AIR = -100
    - vp_SOURCE = -200
    - IMPERMEABLE_STRUCTURE = -300
    - DOOR = -400
    - TABLE = -500
    - VENTILATION = -600
    - CHAIR = -700
    - vp_RECEIVER = -800
*/

// HTTP Live streaming
// https://www.youtube.com/watch?v=DuS8_HoLN3Q around 1hr mark
// https://github.com/tabvn/video-streaming-service

// https://www.youtube.com/watch?v=EIPvq9n4noM

// Camera view
// Change based on keyboard click

// viewer.getState({viewport: true})
// a = viewer.getState({viewport: true})

// Copy this string
// JSON.stringify(a) into 
// viewer.restoreState()

let geom;

class covidGameExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;

    // Toolbar default settings
    this.showPoints = false;
    this.resetAll = false;

    // PointCloud position properties
    this.zaxisOffset = 1.5;

    // Textures
    this.texture = THREE.ImageUtils.loadTexture("../img/4ImgList.png");

    // Sprite visual properties
    this.pointSize = 50;
  }

  load() {
    window.renderPointCloud = true;
    this._renderCloud();
    return true;
  }

  _renderCloud() {
    if (renderPointCloud) {
      this.points = this._generatePointCloud();
      this.points.scale.set(23, 19, 5); //Match size with project size. (unit: inch)
      geom = this.points;
      this.viewer.impl.createOverlayScene("pointclouds");
      this.viewer.impl.addOverlay("pointclouds", this.points);

      // For the lines in 3D Markup
      // var geom = new THREE.Geometry();
      // geom.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1,1,1), );
      // this.line3d = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 4.0, }));
      // this.line3d.position.sub( this.zaxisOffset );
      // this.viewer.impl.scene.add(this.line3d);
    }
  }

  unload() {
    // Clean our UI elements if we added any
    if (this._group) {
      this._group.removeControl(this._button);
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group);
      }
    }
    console.log("covidGameExtension has been unloaded");
    return true;
  }

  _generatePointCloudShaders() {
    // Is there any way to stop the sprites from changing sizes when zooming in?
    this.vShader = `
        uniform float size;
        varying vec3 vColor;
        varying vec2 uVu;
        void main() {
            vColor = color;
            uVu = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = size * ( size / (length(mvPosition.xyz) + 1.0) );
            gl_Position = projectionMatrix * mvPosition;
        }`;


    // To cut up the image
    // (gl_PointCoord.x+uVu.x*1.0) / x
    // Where x should be the number of icons
    this.fShader = `
        uniform sampler2D tex;
        varying vec3 vColor;
        varying vec2 uVu;
        void main() {
            gl_FragColor = vec4( vColor.x, vColor.y, vColor.z, 1.0 ); 
            gl_FragColor = gl_FragColor * texture2D(tex, vec2((gl_PointCoord.x+uVu.x*1.0)/4.0, 1.0-gl_PointCoord.y));
            if (gl_FragColor.w < 0.5) discard;
        }`;
  }

  _generatePointCloudMaterial() {
    // Material rendered with custom shaders and sprites
    this.material = new THREE.ShaderMaterial({
      vertexColors: THREE.VertexColors,
      fragmentShader: this.fShader,
      vertexShader: this.vShader,
      depthWrite: true,
      depthTest: true,
      // Pass uniforms into shader code
      uniforms: {
        // I want to avoid using uniform for color changing
        vColorB: {
            type: 'c', value: new THREE.Color(0xFF0000)
        },
        cameraView: {
          type: 'view', value: 1
        },
        size: { type: "f", value: 70 },
        tex: { type: "t", value: this.texture },
      },
    });
  }

  _generatePointCloudGeometry() {
    let geometry = new THREE.BufferGeometry();
    let numPoints = max_x * max_y;
    let positions = new Float32Array(numPoints * 3);
    // Icons
    let colors = new Float32Array(numPoints * 3);
    // Colors
    let icon = new Float32Array(numPoints * 2);

    for (var i = 0; i < data.length; i++) {
      var messages = data[i];
      for (var j = 0; j < messages.length; j++) {
        var m = messages[j];

        let k = m.x * max_y + m.y;
        let u = m.x / max_x - 0.52;
        let v = m.y / max_y - 0.52;

        positions[3 * k] = u;
        positions[3 * k + 1] = v;
        positions[3 * k + 2] = this.zaxisOffset;

        let color;

        // Susceptible
        if (m.type == -300) {
          color = new THREE.Color(0xffebcc);
        // Exposed
        } else if (m.type == -100){
          color = new THREE.Color(0xa35050);
        } 
        // Infected
        else {
          color = new THREE.Color(0xFF0000);
        }
        color.toArray(colors, k * 3);


        // icons
        icon[2 * k] = 2
        icon[2 * k + 1] = 2

      }
    }

    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute("uv", new THREE.BufferAttribute(icon, 2));

    geometry.computeBoundingBox();
    geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS

    return geometry;
  }

  _generatePointCloud() {
    var geometry = this._generatePointCloudGeometry();

    this._generatePointCloudShaders();

    this._generatePointCloudMaterial();

    return new THREE.PointCloud(geometry, this.material);
  }

  _updatePointCloudGeometry(messages) {
    //////////////
    // Add code //
    /////////////

    this.points.geometry.attributes.color.needsUpdate = true;
    this.viewer.impl.invalidate(true, false, true);
  }

  onToolbarCreated() {
    var i;

    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl("Extensions Toolbar");
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup("Extensions Toolbar");
      this.viewer.toolbar.addControl(this._group);
    }

    // Reset back to timestep one and remove all visuals
    this._button = new Autodesk.Viewing.UI.Button("Reset");
    this._button.onClick = (ev) => {

      //////////////
      // Add code //
      /////////////
    };
    this._button.setToolTip("Reset All");
    this._button.addClass("resetIcon");
    this._group.addControl(this._button);

    // Add the button for 'PointClouds ON/OFF'
    this._button = new Autodesk.Viewing.UI.Button("PointClouds ON/OFF");
    this._button.onClick = (ev) => {
      //////////////
      // Add code //
      /////////////
    };
    this._button.setToolTip("PointClouds ON/OFF");
    this._button.addClass("pointCloudIcon");
    this._group.addControl(this._button);

    // Add button for legend ON/OFF
    this._button = new Autodesk.Viewing.UI.Button("Legend ON/OFF");
    this._button.onClick = (ev) => {
      //////////////
      // Add code //
      /////////////
    };
    this._button.setToolTip("Legend ON/OFF");
    this._button.addClass("legendIcon");
    this._group.addControl(this._button);

    // Add a new button to the toolbar group
    this._button = new Autodesk.Viewing.UI.Button("Run Simulation");
    this._button.onClick = (ev) => {
      //////////////
      // Add code //
      /////////////

      // Change first icon to viral particle
      this.points.geometry.attributes.color.array[1] = 3;
      this.points.geometry.attributes.color.needsUpdate = true;
      this.viewer.impl.invalidate(true, false, true);

      debugger;
    };

    this._button.setToolTip("Run Simulation");
    this._button.addClass("playIcon");
    this._group.addControl(this._button);
  }

  _appearLegend() {
    // append a defs (for definition) element to your SVG
    var svgLegend = d3.select("#legend").append("svg");
    var defs = svgLegend.append("defs");

    // append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs
      .append("linearGradient")
      .attr("id", "linear-gradient");

    // horizontal gradient
    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // append multiple color stops by using D3's data/enter step
    linearGradient
      .selectAll("stop")
      .data([
        //{ offset: "0%", color: "#FFFFFF" },
        { offset: "0%", color: "#F6BDC0" },
        { offset: "25%", color: "#F1959B" },
        { offset: "50%", color: "#F07470" },
        { offset: "75%", color: "#EA4C46" },
        { offset: "100%", color: "#DC1C13" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });

    // append title
    svgLegend
      .append("text")
      .attr("class", "legendTitle")
      .attr("x", 5)
      .attr("y", 20)
      .style("text-anchor", "mid")
      .text("Viral Aerosol Conc.");

    // draw the rectangle and fill with gradient
    svgLegend
      .append("rect")
      .attr("x", 5)
      .attr("y", 30)
      .attr("width", 140)
      .attr("height", 15)
      .style("fill", "url(#linear-gradient)");

    //create tick marks
    var xLeg = d3.scale
      .ordinal()
      .domain([1, max_particles / 2, max_particles])
      .range([0, 135 / 2, 135]);

    var axisLeg = d3.axisBottom(xLeg);

    svgLegend
      .attr("class", "axis")
      .append("g")
      .attr("transform", "translate(10, 40)")
      .call(axisLeg);

    // append title
    svgLegend
      .append("text")
      .attr("class", "legendTitle")
      .attr("x", 175)
      .attr("y", 20)
      .style("text-anchor", "mid")
      .text("Condition");

    var keys = ["Susceptible", "Exposed", "Infected"];

    // Add one dot in the legend for each name.
    svgLegend
      .selectAll("labels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 195)
      .attr("y", function (d, i) {
        return 40 + i * 20;
      })
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    // Circles
    svgLegend
      .append("rect")
      .attr("x", 174)
      .attr("y", 30)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "#ffebcc");
    svgLegend
      .append("rect")
      .attr("x", 174)
      .attr("y", 50)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "#a35050");
    svgLegend
      .append("rect")
      .attr("x", 174)
      .attr("y", 70)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", "#FF0000");
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "covidGameExtension",
  covidGameExtension
);
