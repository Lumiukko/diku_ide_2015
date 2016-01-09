$(document).ready(function() {
    var container;
    var camera;
    var scene;
    var renderer;
    var controls;
    
    var pdb_loader;
    var atoms = [];
    var bonds = [];
    
    
    // Enables the axis helper
    var helpers = true;
   
    // Enables mouse rotation and zoom.
    // Warning: This is very very problematic with large molecules!
    var movement = false;
    
    var default_camera_fov = 75;
    var default_camera_pos = {x: 50, y: 50, z: 50};
    
    var step_size_zoom = 0.05;
    var step_size_rotation = 0.2;
        
    init();
    
    if (movement) animate();

    
    function init() {
        container = $("#visbox1");
        $(document).ready(function() {
          $("#visbox1").click(onDocumentMouseDown);
        });
        var w = container.width();
        var h = container.height();
        
        pdb_loader = new THREE.PDBLoader();
        
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(default_camera_fov, w / h, 0.1, 1000);     
        // create trackball controls
        if (movement) {
            controls = new THREE.TrackballControls( camera, document.getElementById("visbox1") );
            controls.rotateSpeed = 5.0;
            controls.zoomSpeed = 0.2;
            controls.panSpeed = 0.2;
            controls.noZoom = false;
            controls.noPan = false;
            controls.addEventListener( 'change', render);
        };
        
        // create and setup a renderer
        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setSize(w, h);
        
        // show axes in the screen
        if (helpers) {
            var axes = new THREE.AxisHelper(30);
            scene.add(axes)
        };
        

        /* more of our code here */
        add_stuff();
        
        // Load 2RH1 and use good camera position.
        load_pdb("data/2RH1.pdb");
        default_camera_pos = new THREE.Vector3(201, -93, -153);
        
        // Load Caffeine molecule
        //load_pdb("data/caffeine.pdb");
        
        
        add_controls();
        reset_camera();
      
        container.append( renderer.domElement );
    };
    
    
    function reset_camera() {
        camera.fov = default_camera_fov;
        camera.position.set(default_camera_pos.x, default_camera_pos.y, default_camera_pos.z);
        camera.lookAt(scene.position);
        camera.updateProjectionMatrix();
        render();
    };
    
    
    function zoom_in() {
        camera.position.multiplyScalar(1-step_size_zoom);
        //console.log(camera.position);
        render();
    };
    
    
    function zoom_out() {
        camera.position.multiplyScalar(1+step_size_zoom);
        //console.log(camera.position);
        render();
    }
    
    
    function rotate_left() {
        var rot = new THREE.Matrix3().set(
                                            Math.cos(-step_size_rotation),  0,  Math.sin(-step_size_rotation),
                                            0,                              1,  0,
                                          - Math.sin(-step_size_rotation),  0,  Math.cos(-step_size_rotation)
                                        );
        camera.position = camera.position.applyMatrix3(rot);
        camera.lookAt(scene.position);
        render();
    };
    
    
    function rotate_right() {
        var rot = new THREE.Matrix3().set(
                                            Math.cos(step_size_rotation),  0,  Math.sin(step_size_rotation),
                                            0,                             1,  0,
                                          - Math.sin(step_size_rotation),  0,  Math.cos(step_size_rotation)
                                        );
        camera.position = camera.position.applyMatrix3(rot);
        camera.lookAt(scene.position);
        render();
    };
    
    
    function rotate_up() {
        // This is literally wonky!
        var rot = new THREE.Matrix3().set(
                                            1,  0,                              0,
                                            0,  Math.cos(step_size_rotation), - Math.sin(step_size_rotation),
                                            0,  Math.sin(step_size_rotation),   Math.cos(step_size_rotation)
                                        );
                                                            
        camera.position = camera.position.applyMatrix3(rot);
        camera.lookAt(scene.position);
        render();
    };
    
    
    function rotate_down() {
        // This is literally wonky!
        var rot = new THREE.Matrix3().set(
                                            1,  0,                               0,
                                            0,  Math.cos(-step_size_rotation), - Math.sin(-step_size_rotation),
                                            0,  Math.sin(-step_size_rotation),   Math.cos(-step_size_rotation)
                                        );
                                                            
        camera.position = camera.position.applyMatrix3(rot);
        camera.lookAt(scene.position);
        render();
    };
    
    
    function add_controls() {
        $("#ctrl_reset").click(function() {
            reset_camera();
        });
    
        $("#ctrl_zoom_in").click(function() {
            zoom_in();
        });
        
        $("#ctrl_zoom_out").click(function() {
            zoom_out();
        });
        
        $("#ctrl_up").click(function() {
            rotate_up();
        });
        
        $("#ctrl_down").click(function() {
            rotate_down();
        });
        
        $("#ctrl_left").click(function() {
            rotate_left();
        });
        
        $("#ctrl_right").click(function() {
            rotate_right();
        });
    };
    
    
    function render() {
        renderer.render( scene, camera );
    }
    
    
    function animate() {
        requestAnimationFrame( animate );
        controls.update();
    }
    

    function load_pdb( url ) {
        stretch_factor = 8;
        sphere_size = 4;
        sphere_detail = 6;
        bond_distance_limit = 1.9;
        pdb_loader.load( url, function ( geometry, geometryBonds ) {
              
            //console.log(geometry);
            //console.log(geometryBonds);
            
            var comparisons = 0;
            var couples = 0;
            
            // Attempt to get the dataset somewhat to the origin...
            var bounding_box = new THREE.Box3().setFromPoints(geometry.vertices);
            var bb_center = bounding_box.max.sub(bounding_box.min).multiplyScalar(-1);
            // console.log("Center of Molecule Bounding Box:");
            // console.log(bb_center);

            
            $.each(geometry.vertices, function(i, position) {
                var atom_color = new THREE.Color().setRGB(geometry.colors[i].r, geometry.colors[i].g, geometry.colors[i].b);
                var sphereGeometry = new THREE.SphereGeometry(sphere_size, sphere_detail, sphere_detail);
                sphereGeometry.translate(bb_center.x, bb_center.y, bb_center.z);
                var sphereMaterial = new THREE.MeshLambertMaterial({color: atom_color, wireframe: false});
                var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                
                sphere.position.set( position.x * stretch_factor,
                                     position.y * stretch_factor,
                                     position.z * stretch_factor);
                                    
                
                atoms.push(sphere);
                scene.add(sphere);      
                
                $.each(geometry.vertices, function(j, mate_position) {
                    if (i != j && j > i) {
                        comparisons++;
                        if (distance_euclidean(position, mate_position) < bond_distance_limit) {
                            couples++;
                            draw_line(position, mate_position, stretch_factor, bb_center);
                        }
                    }
                });
            });
            console.log("Number of Comparisons: " + comparisons);
            console.log("Couples: " + couples);
            
            
            
            /*
            // This is the default bonding description based on the data in the PDB file.
            for ( var i = 0; i < geometryBonds.vertices.length; i += 2 ) {            
                var bond_geometry = new THREE.Geometry();
                bond_geometry.vertices.push(new THREE.Vector3(stretch_factor * geometryBonds.vertices[i].x,
                                                     stretch_factor * geometryBonds.vertices[i].y,
                                                     stretch_factor * geometryBonds.vertices[i].z));
                bond_geometry.vertices.push(new THREE.Vector3(stretch_factor * geometryBonds.vertices[i+1].x,
                                                     stretch_factor * geometryBonds.vertices[i+1].y,
                                                     stretch_factor * geometryBonds.vertices[i+1].z));
                
                var bond = new THREE.Line(bond_geometry, new THREE.LineBasicMaterial({ color: "#ffffff" }));
                bonds.push(bond);
                scene.add(bond);
            };
            */
            
            render();

        } );
    };
    
    
    function draw_line(p1, p2, stretch_factor, bbcenter) {
        var bond_geometry = new THREE.Geometry();
        bond_geometry.vertices.push(new THREE.Vector3(stretch_factor * p1.x,
                                                      stretch_factor * p1.y,
                                                      stretch_factor * p1.z));
        bond_geometry.vertices.push(new THREE.Vector3(stretch_factor * p2.x,
                                                      stretch_factor * p2.y,
                                                      stretch_factor * p2.z));
        bond_geometry.translate(bbcenter.x, bbcenter.y, bbcenter.z);
        var bond = new THREE.Line(bond_geometry, new THREE.LineBasicMaterial({ color: "#ffffff" }));
        bonds.push(bond);
        scene.add(bond);
    };
    
    
    function add_stuff() {
        /*
        var cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: true});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set( 0, 0, 16 );
        // add the cube to the scene
        scene.add(cube);
        */
        
        // setup a light source       
        

        
        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        scene.add(light);
        
        render();
    };
    
    
    function distance_euclidean(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
    }
    
    function onDocumentMouseDown(event) {
        // get clicked point:
        var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
        // "unproject" clicked point from 2D to 3D:
        vector = vector.unproject(camera);
        // get ray direction from origin and direction:
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        // check the objects in arguments for interesection with the ray:
        var intersects = raycaster.intersectObjects(atoms);
        // take the nearest intersected object and make it transparent
        if (intersects.length > 0) {
            camera.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            camera.updateProjectionMatrix();
            render();
        }
    }
    
    
});
