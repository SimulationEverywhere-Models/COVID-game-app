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
    - vp_INFECTED = ... add later
    - IMPERMEABLE_STRUCTURE = -300
    - DOOR = -400
    - TABLE = -500
    - VENTILATION = -600
    - CHAIR = -700
    - vp_RECEIVER = -800
*/

let data;
let group;
let skipFrames = 0;
let playGame = false;
let taskOne;
let taskTwo;
let taskThree;
let _panel;

class GameExtension extends Autodesk.Viewing.Extension {

  /**
   * @description Sets up visualization properties 
   * @param {*} viewer - Forge Viewer with a bunch of accessible properties
   * @param {*} options - Extensions set in ForgeViewer.js
   */

  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
    // The overview panel
    this._panel = null;
    this._playGame = false;
    this._skipFrames = 0;
    this._gameMode = "";
    this.prevPos = viewer.navigation.getPosition();
    this.health = 100.0;
    this._startPos = false;
    this._legend = false;

    // The countdown in the overview panel
    this.timer = "0:00";

    // PointCloud position properties
    this.zaxisOffsetParticle = -4.5;
    this.zaxisOffsetHuman = -2;
    this.xaxisOffset = -89.5;
    this.yaxisOffset = -70;

    // Textures
    this.texture = THREE.ImageUtils.loadTexture("../img/5_imgList.png");

    // For PointCloud colouring and D3 legend
    this.createColorScale()
  }

   /**
   * @description The colour scale is used for 
   * colouring the viral particles (PointClouds) 
   * and setting the D3 color legend (see the code in onToolbarCreated())
   */

  createColorScale(){
    this.colorScale = d3
      .scaleLinear()
      .domain([
        0,
        //600 * 0.04,
        600 * 0.01,
        600 * 0.02,
        600 * 0.04,
        600 * 0.08,
        600 * 0.12,
        600 * 0.14,
        600 * 0.16,
        600 * 0.2,
        600 * 0.25,
        600 * 0.3,
        600 * 0.5,
        600,
      ])
      .range([
        "#feed00",
        "#ffdb00",
        "#ffc801",
        "#ffb600",
        "#ffa401",
        "#ff9201",
        "#fd6d03",
        "#ff5c01",
        "#ff4900",
        "#ff3801",
        "#fc2501",
        "#ff1200",
        "#fe0000",
      ]);
  }

  load() {
    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      // on camera movement run this function
      this.onCameraChange
    );
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
    return true;
  }

  /**
   * @description Checks whether the tasks is getting clicked on mouse click
   */
  onMouseClick(e) {
    //See if we clicked tasks
    if (taskOne != null && viewer.getCamera().isPerspective == true) {
      //https://threejs.org/docs/#api/en/core/Raycaster
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      var camera = viewer.getCamera();

      raycaster.ray.origin.copy(camera.position);
      raycaster.ray.direction
        .set(mouse.x, mouse.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();

      if (raycaster.intersectObjects(viewer.impl.overlayScenes.overlaySceneOne.scene.children).length > 0) {
        _panel.highlightableElements["Fix VentIncompleteTask Bar"][1].innerText = "Complete";
        taskOne.material.color.r = 0;
        taskOne.material.color.g = 1;
      } else if(raycaster.intersectObjects(viewer.impl.overlayScenes.overlaySceneTwo.scene.children).length > 0) {
        _panel.highlightableElements["Watch ConferenceIncompleteTask Bar"][1].innerText = "Complete";
        taskTwo.material.color.r = 0;
        taskTwo.material.color.g = 1;
      } else if (raycaster.intersectObjects(viewer.impl.overlayScenes.overlaySceneThree.scene.children).length > 0) {
        _panel.highlightableElements["Go to classIncompleteTask Bar"][1].innerText = "Complete";
        taskThree.material.color.r = 0;
        taskThree.material.color.g = 1;
      }
      viewer.impl.invalidate(true);
    }
  }

  /**
   * @description Check the collision detection with any BIM geometry
   */
  onCameraChange() {
    const ray = new THREE.Ray(
      viewer.navigation.getPosition(),
      viewer.navigation.getEyeVector()
    );
    const intersections = viewer.impl.rayIntersect(ray, false);

    // Wall collision detection
    if (intersections && intersections.distance <= 2) {
      viewer.navigation.setPosition(this.prevPos);
    }
    this.prevPos = viewer.navigation.getPosition();
  }

  _renderCloud() {

    this.points = new THREE.PointCloud(
      this._generatePointCloudGeometry(this.zaxisOffsetParticle, 0), //argument is zoffset, icon selection
      this._generateShaderMaterial(50, true) //argument is size,transparency
    )

    this._createObjectives();

    this.viewer.impl.createOverlayScene("pointclouds");
    this.viewer.impl.addOverlay("pointclouds", this.points);
  }

  /**
   * @description creates the task using the geometry
   */
  _createObjectives() {

    var geom = new THREE.SphereGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    taskOne = new THREE.Mesh(geom, material);
    // Vent
    taskOne.position.set(89, -13.8, 0);
    viewer.impl.createOverlayScene("overlaySceneOne");
    viewer.impl.addOverlay("overlaySceneOne", taskOne);
    viewer.impl.invalidate(true);

    var geomTwo = new THREE.SphereGeometry(1, 1, 1);
    var materialTwo = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    taskTwo = new THREE.Mesh(geomTwo, materialTwo);
    // Conference
    taskTwo.position.set(28, 35, -2);
    viewer.impl.createOverlayScene("overlaySceneTwo");
    viewer.impl.addOverlay("overlaySceneTwo", taskTwo);
    viewer.impl.invalidate(true);

    var geomThree = new THREE.SphereGeometry(1, 1, 1);
    var materialThree = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    taskThree = new THREE.Mesh(geomThree, materialThree);
    // Room with desks
    taskThree.position.set(-17, 14, -2);
    viewer.impl.createOverlayScene("overlaySceneThree");
    viewer.impl.addOverlay("overlaySceneThree", taskThree);
    viewer.impl.invalidate(true);
  }
  
  /**
   * @description Generate a BufferGeometry with various attributes 
   * for PointClouds and Shader Material
   * @param {number} zOffset - Offset for the sprite on the z-axis
   * @param {number} iconSelection - The desired icon from the spritesheet
   * @returns {BufferGeometry} 
   */
  _generatePointCloudGeometry(zOffset,iconSelection) {
    let geometry = new THREE.BufferGeometry();

    // Row with the highest x coordinate value
    const maxRowX = this.data.reduce(function (prev, current) {
      return prev.x > current.x ? prev : current;
    });

    // // Row with the highest y coordinate value
    const maxRowY = this.data.reduce(function (prev, current) {
      return prev.y > current.y ? prev : current;
    });

    this.maxX = maxRowX.x + 1;
    this.maxY = maxRowY.y + 1;

    this.numPoints = this.maxX * this.maxY;

    let positions = new Float32Array(this.numPoints * 3);

    // Sprite colors
    let colors = new Float32Array(this.numPoints * 3);

    // Icon selection and opacity
    let icon = new Float32Array(this.numPoints * 2);

    for (var i = 0; i < this.data.length; i++) {
      var m = this.data[i];

      let k = m.x * this.maxY + m.y;
      let u = m.x + this.xaxisOffset;
      let v = m.y + this.yaxisOffset;

      positions[3 * k] = u;
      positions[3 * k + 1] = v;
      positions[3 * k + 2] = zOffset;

      // Select particle icon and set opacity 
      icon[2 * k] = iconSelection;
      icon[2 * k + 1] = 0;
      
      // Color doesn't matter yet 
      let color = new THREE.Color(0xFFFFFF);

      color.toArray(colors, k * 3);
    }

    // These are all passed into the shader material when creating PointClouds
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute("uv", new THREE.BufferAttribute(icon, 2));

    geometry.computeBoundingBox();
    geometry.isPoints = true; // This flag will force Forge Viewer to render the geometry as gl.POINTS

    return geometry;
  }

   /**
   * @description Generate shader material for PointClouds
   * @param {number} pointSize - Size of the sprite 
   * @param {boolean} transparent - Whether or not we want the sprite transparent
   */
  _generateShaderMaterial(pointSize,transparent) {
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
          // Get flags for WebGL errors
          //float transparency = 1.0 - 2.0 * distance(gl_PointCoord.xy, vec2(0.5, 0.5));
          gl_FragColor = vec4( vColor.x, vColor.y, vColor.z, uVu.y ); 
          gl_FragColor = gl_FragColor * texture2D(tex, vec2((gl_PointCoord.x+uVu.x*1.0)/5.0, 1.0-gl_PointCoord.y));
          
          // Transparency
          // Blending?
          // WebGL has method for distance between points to generate radial
          //gl_FragColor = vec4( 1,0,0, gl_PointCoord.y ); 
          if (gl_FragColor.w < 0.5) discard;
      }`;

      // Material rendered with custom shaders and sprites
    return new THREE.ShaderMaterial({
      vertexColors: THREE.VertexColors,
      fragmentShader: this.fShader,
      vertexShader: this.vShader,
      transparent: transparent,
      // If rendered, update zBuffer so nothing renders behind
      // Better result, compute transparency in fShader
      depthWrite: false,
      depthTest: true,
      // Pass uniforms into shader code
      uniforms: {
        // I want to avoid using uniform for color changing
        size: { type: "f", value: pointSize },
        tex: { type: "t", value: this.texture },
      },
    });
  }

  /**
   * @description Update the PointCloud based on the new data
   */
  _updateRenderCloud() {
    // Particles

    // group.children[0].geometry.attributes.color.array
    // group.children[0].geometry.attributes.uv.array

    let particleColors = this.points.geometry.attributes.color.array;
    let particleIconAndOpacity = this.points.geometry.attributes.uv.array;
    let particlePositions = this.points.geometry.attributes.position.array;

    let camPos = this.viewer.getState().viewport.eye; //this.viewer.navigation.getPosition();

    for (var i = 0; i < this.data.length; i++) {
      var m = this.data[i];

      // Item to update
      let k = m.x * this.maxY + m.y;

      if (m.current_state > 0) {
        let x = particlePositions[3 * k];
        let y = particlePositions[3 * k + 1];

        let xDiff = x - camPos[0];
        let yDiff = y - camPos[1];
        if (xDiff <= 2 && xDiff >= -2 && yDiff <= 2 && yDiff >= -2) {
          if (this.health.toFixed(2) == 0.0) {
            this._panel.highlightableElements[
              "Health100%Health"
            ][1].innerText = `0.00%`;
          } else {
            this.health -= 0.1;
            this._panel.highlightableElements[
              "Health100%Health"
            ][1].innerText = `${this.health.toFixed(2)}%`;
          }
        }
      }

      // If an air particle and has viral load
      if (
        (m.curr_type == -100 || m.curr_type == -200 || m.curr_type == -800) &&
        m.current_state != 0
      ) {
        particleIconAndOpacity[2 * k] = 0;
        particleIconAndOpacity[2 * k + 1] = 0.7;
      } else {
        particleIconAndOpacity[2 * k] = 0;
        particleIconAndOpacity[2 * k + 1] = 0;
      }
      let color = new THREE.Color(this.colorScale(m.current_state));
      color.toArray(particleColors, k * 3);
    }

    // group.children[0].geometry.attributes.color.array
    // group.children[0].geometry.attributes.uv.array

    this.points.geometry.attributes.uv.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
    this.viewer.impl.invalidate(true, false, true);
  }

  _startGame(maskOption) {
    _panel = this._panel;

    $(viewer.container).bind("click", this.onMouseClick);

    console.log(maskOption);

    alert("Loading simulation...Good luck!");

    // To access things in jQuery
    let self = this;

    // Begin splitting the maskOn or maskOff CSV data
    jQuery.get(
      "/api/forge/csvStreamer/streaming",
      {
        // Change file name later
        filepath: `./public/data/output/state_change_${maskOption}.csv`,
        output: `mask${maskOption}`,
        view_name: "3D",
      },
      (result) => {
          //start reading the splitted csv with time steps
          readCSVs(result, maskOption);
      }
    );

    //load the minimap once it start the simulation
    let minimap = document.querySelector(".minimap3D");
    let v = document.querySelector(".adsk-viewing-viewer");
    v.appendChild(minimap);

    function readCSVs(result, maskOption) {

      var numFiles = result.totalChunks; // 1 chunk is one file
      // How fast to read a file in milliseconds 
     // 1000ms is 1 second in real time, 100ms is 0.1 second in real time
      // Only use 50 or more or else you get errors

      var time = 1000; // 1000ms is 1 second in real time

      var speed = 1
      // Try multiples (1, 10, 100, etc.)
      // Ex. When speed = 10 then every 10th file is read

      self.realTime = (1000 * numFiles - 1000) / (speed);

      var interval = setInterval(() => {
        var file =
          `./public/data/output/mask${maskOption}-` + self.index + ".csv";

        jQuery.get(
          "/api/forge/csvStreamer/reading",
          {
            filepath: file,
          },
          (result) => {
            self.data = result;
            self._CreateAndAnimateGroupOfGeometries();

            if(_panel.highlightableElements["Fix VentIncompleteTask Bar"][1].innerText == "Complete" && 
            _panel.highlightableElements["Watch ConferenceIncompleteTask Bar"][1].innerText == "Complete" &&
            _panel.highlightableElements["Go to classIncompleteTask Bar"][1].innerText == "Complete"
            ){
              clearInterval(interval);
              alert("You've survived exposure and completed your tasks. Thanks for playing!");
            }
            
            if (self.index == numFiles - 1) {
              clearInterval(interval);
              alert("You've survived exposure. Thanks for playing!");
            }
            if (self.health.toFixed(2) == 0.0) {
              clearInterval(interval);
              alert("You are now infected. Thanks for playing!");
            }
            self.index++;
            self._updateCountdown();
            self.realTime -= 1000;
          }
        );
      }, time);
    }
  }

   /**
   * @description If we're reading our first file, then generate
   * the PointClouds and add them to the Forge Viewer scene. 
   * Else update the existing PointClouds in the scene
   */
  _CreateAndAnimateGroupOfGeometries() {
    if (this.index == 0) {
      this._renderCloud();
    } else {
      this._updateRenderCloud();
    }
  }

  _turnHumansRed() {
    let red = new THREE.Vector4(1, 0, 0, 1);
    // Note that these numbers may change
    viewer.setThemingColor(4283, red);
    viewer.setThemingColor(4287, red);
    viewer.setThemingColor(4288, red);
  }

  
  /**
   * @description Update the countdown time in the overview panel.
   * The time decrements as the simulation goes on. Once the 
   * simulation dies off, the countdown is reset or stopped 
   * entirely. 
   */
  _updateCountdown() {
    const minutes = Math.floor(
      (this.realTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    let seconds = Math.floor((this.realTime % (1000 * 60)) / 1000);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    this.timer = `${minutes}:${seconds}`;
    this._panel.highlightableElements[
      "Countdown0:00Time"
    ][1].innerText = `${minutes}:${seconds}`;
    countdown.innerHTML = `${minutes}:${seconds}`;
  }

  /**
   * @description Set the starting postion of the gamer
   */
  _setStartingPos() {
    let a = viewer.navigation;
    const v = new THREE.Vector3(
      61.640195898895314,
      -55.61276868987284,
      0.9866847541152346
    );
    a.setPosition(v);
  }

  onToolbarCreated() {
    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl(
      "allGameExtensionsToolbar"
    );
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup(
        "allGameExtensionsToolbar"
      );
      this.viewer.toolbar.addControl(this._group);
    }

    ///////////////////////////////////////////////////////
    // Reset back to timestep one and remove all visuals
    ////////////////////////////////////////////////////////
    this._button = new Autodesk.Viewing.UI.Button("Reset");
    this._button.onClick = (ev) => {
      //write the code for onCLick
    };
    this._button.setToolTip("Reset All");
    this._button.addClass("resetIcon");
    this._group.addControl(this._button);

    //////////////
    // Mask on //
    ////////////
    this._button = new Autodesk.Viewing.UI.Button("Mask On");
    this._button.onClick = (ev) => {

      if (this._gameMode == "Off") {
        alert("You've already selected the MaskOff game mode");
      } else {
        this._gameMode = "On";
        this._turnHumansRed();
        if (this._startPos == false) {
          this._setStartingPos();
          this._startPos = true;
        }

        // Execute an action here
        // Check if the panel is created or not
        if (this._panel == null) {
          this._panel = new ModelSummaryPanel(
            this.viewer,
            this.viewer.container,
            "modelSummaryPanel",
            "Game Overview"
          );
        }

        // Show/hide docking panel
        this._panel.setVisible(!this._panel.isVisible());
        // If panel is NOT visible, exit the function
        if (!this._panel.isVisible()) return;

        if (this._playGame == false) {
          this._panel.addProperty("Health", `${this.health}%`, "Health");
          this._panel.addProperty("Countdown", this.timer, "Time");
          let task = "Task Bar";
          for (let i = 0; i < 2; i++) {
            this._panel.addProperty("Fix Vent", "Incomplete", task);
            this._panel.addProperty("Watch Conference", "Incomplete", task);
            this._panel.addProperty("Go to class", "Incomplete", task);
          }

          this._playGame = true;

          playGame = this._playGame;

          // Reset the number of files read back to zero
          this.index = 0;

          // Get into first person view
          viewer.getExtension("Autodesk.BimWalk").activate();

          // Remove toolbar buttons?
          // Does not look like anyone else disables buttons
          //this.viewer.toolbar.getControl("allGameExtensionsToolbar").removeControl("GameExtensionButton")
          //this.viewer.toolbar.getControl("allGameExtensionsToolbar").removeControl("ModelSummaryExtensionButton")

          // Steps:
          // - Split CSVs
          // - Read CSVs
          // - Begin Visualization and share data throughout the program
          this._startGame("On");
        }

        this._panel.container.style.left = "10px";
        this._panel.container.style.top = "10px";
      }
    };
    this._button.setToolTip("Mask On Simulation");
    this._button.addClass("maskOnIcon");
    this._group.addControl(this._button);

    ///////////////
    // Mask off //
    /////////////
    this._button = new Autodesk.Viewing.UI.Button("Mask Off");
    this._button.onClick = (ev) => {
      if (this._gameMode == "On") {
        alert("You've already selected the MaskOn game mode");
      } else {
        this._gameMode = "Off";
        this._turnHumansRed();
        if (this._startPos == false) {
          this._setStartingPos();
          this._startPos = true;
        }
        // Execute an action here
        // Check if the panel is created or not
        if (this._panel == null) {
          this._panel = new ModelSummaryPanel(
            this.viewer,
            this.viewer.container,
            "modelSummaryPanel",
            "Game Overview"
          );
        }

        // Show/hide docking panel
        this._panel.setVisible(!this._panel.isVisible());
        // If panel is NOT visible, exit the function
        if (!this._panel.isVisible()) return;

        if (this._playGame == false) {
          this._panel.addProperty("Health", `${this.health}%`, "Health");
          this._panel.addProperty("Countdown", this.timer, "Time");
          let task = "Task Bar";
          for (let i = 0; i < 2; i++) {
            this._panel.addProperty("Fix Vent", "Incomplete", task);
            this._panel.addProperty("Watch Conference", "Incomplete", task);
            this._panel.addProperty("Go to class", "Incomplete", task);
          }

          this._playGame = true;
          playGame = this._playGame;

          // Reset the number of files read back to zero
          this.index = 0;

          // Get into first person view
          viewer.getExtension("Autodesk.BimWalk").activate();

          // Remove toolbar buttons?
          // Does not look like anyone else disables buttons
          //this.viewer.toolbar.getControl("allGameExtensionsToolbar").removeControl("GameExtensionButton")
          //this.viewer.toolbar.getControl("allGameExtensionsToolbar").removeControl("ModelSummaryExtensionButton")

          // Steps:
          // - Split CSVs
          // - Read CSVs
          // - Begin Visualization and share data throughout the program
          this._startGame("Off");
        }

        this._panel.container.style.left = "10px";
        this._panel.container.style.top = "10px";
      }
    };

    this._button.setToolTip("Mask Off Simulation");
    this._button.addClass("maskOffIcon");
    this._group.addControl(this._button);

    ////////////
    // Legend //
    ///////////
    this._button = new Autodesk.Viewing.UI.Button("Legend ON/OFF");
    this._button.onClick = (ev) => {
      this.appearLegend();
    };

    this._button.setToolTip("Legend");
    this._button.addClass("legendIcon");
    this._group.addControl(this._button);
  }

  /**
   * @description color legend atthe top signify the aerosol concentration 
   */
  appearLegend(){
    if(this._legend == false){
      this._legend = true;
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
        { offset: "0%", color: this.colorScale.range()[0] },
        { offset: "8%", color: this.colorScale.range()[1] },
        { offset: "16%", color: this.colorScale.range()[2] },
        { offset: "24%", color: this.colorScale.range()[3] },
        { offset: "32%", color: this.colorScale.range()[4] },
        { offset: "40%", color: this.colorScale.range()[5] },
        { offset: "48%", color: this.colorScale.range()[6] },
        { offset: "56%", color: this.colorScale.range()[7] },
        { offset: "64%", color: this.colorScale.range()[8] },
        { offset: "72%", color: this.colorScale.range()[9]},
        { offset: "80%", color: this.colorScale.range()[10]},
        { offset: "88%", color: this.colorScale.range()[11]},
        { offset: "100%",color: this.colorScale.range()[12] },
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
      .domain([1, 300, 600])
      .range([0, 135 / 2, 135]);

    var axisLeg = d3.axisBottom(xLeg);

    svgLegend
      .attr("class", "axis")
      .append("g")
      .attr("transform", "translate(10, 40)")
      .call(axisLeg);

      this._keepLegendInForgeViewer()

    }else{
      this._legend = false;
      this.deleteLegend()
    }
    
  }

  deleteLegend(){
    var svg = d3.select("#legend");
    svg.selectAll("*").remove();
  }

  /**
   * @description Keep the legend in the Forge Viewer when going
   * full screen. You can reuse this code to keep other HTML elements
   * in the Forge Viewer when going full screen just by changing respective element id.
   */
  _keepLegendInForgeViewer(){
    let legend = document.getElementById("legend");
    let v2 = document.querySelector(".adsk-viewing-viewer");
    v2.appendChild(legend);
  }

}

class ModelSummaryPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(viewer, container, id, title, options) {
    super(container, id, title, options);
    this.viewer = viewer;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "GameExtension",
  GameExtension
);
