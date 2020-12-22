# COVID Game

Some CSV files are too large to upload on github, if you need to run this project please email Dr. Vinu Subashini Rajus at vinu.rajus@carleton.ca

## Description

An interactive learning environment based on real-world models for indoor COVID spread

## Videos 

[Background and Gameplay Demo](https://www.youtube.com/watch?v=kI6jyFuAzgE&t=6s)

[Game Mode Selection](https://www.youtube.com/watch?v=9D6nE-eY9js)

## Getting Started

###### Clone the repository

###### Get dependencies

```npm install```

```npm i -S fast-csv```

```npm install csv-split-stream```

###### Make a Forge Account

[Autodesk Forge](https://forge.autodesk.com/)

###### Use Forge Credentials to Run the Application

See ```launch.json``` in the ```.vscode``` folder. Enter your client ID and secret there. 

###### Convert Simulation Results to CSV
Place your ```state.txt``` file into the ```scripts``` folder, then cd into the ```scripts``` folder and run the following command in terminal:

```cat state.txt | python state-txt-to-csv.py```

This will output ```state_change.csv```

###### Create Folder(s) for Simulation Data
1. Create an ```data``` folder inside the ``public`` folder
2. Create an ```output``` folder inside ```data``` folder 
   -  This is where the split CSVs will be stored.
3. Rename your ```state_change.csv``` based on whether the data is MaskOn or MaskOff. 
   - For example, ```state_change_On.csv``` if you have data for MaskOn.
4. Place renamed csv in the ```output``` folder

## Plans for the Future

Virtual Reality! 

## Important Links

[COVID-BIM V2](https://github.com/SimulationEverywhere-Models/COVID-BIM/tree/COVID-BIM-V2)

[Cadmium simulator](https://github.com/SimulationEverywhere/Cell-DEVS-Cadmium-Simulation-Environment)

[CO2 model](https://github.com/SimulationEverywhere-Models/Cell-DEVS-CO2_spread_computer_lab)

[Indoor Virus Spread model](https://github.com/SimulationEverywhere-Models/indoor_virus_spread)

[BIM-to-DEVS](https://github.com/SimulationEverywhere/BIM-to-DEVS/tree/master)

### Resources

[Graphics reference for shaders](http://what-when-how.com/Tutorial/topic-1779u1aung/Three-js-277.html) - Explains types of qualifiers (uniform, varying, etc.)

[gl_FragCoord](https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/gl_FragCoord.xhtml) - Might help with camera view of sprites / icons

[Data Types (OpenGL)](https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)) - Scalars and vectors

[3D Markup with icons and info-Card](https://forge.autodesk.com/blog/3d-markup-icons-and-info-card) - Discusses spritesheets and clickable geometries

[Using PointCloud in Forge Viewer](https://forge.autodesk.com/blog/using-pointcloud-forge-viewer) - Uses three.js (r71)

[Fast-CSV](https://c2fo.io/fast-csv/) - CSV Parser and Formatter

[csv-split-stream](https://www.npmjs.com/package/csv-split-stream) - Split a CSV read stream into multiple write streams

[File stream](https://nodejs.org/api/stream.html#stream_readable_pause) - Node.js stream readable
