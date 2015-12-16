$(document).ready(function() {
    var container;
    var camera;
    var scene;
    var renderer;
    var controls;
    
    var pdb_loader = new THREE.PDBLoader();
    var atoms = [];
    
    
    init();
    animate();
    

    function init() {
        container = $("#visbox1");
        var w = container.width();
        var h = container.height();
        
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.set(-20, 20, 130);
        
        // create trackball controls
        controls = new THREE.TrackballControls( camera, document.getElementById("visbox1") );
        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 0.2;
        controls.panSpeed = 0.2;
        controls.noZoom = false;
		controls.noPan = false;
        controls.addEventListener( 'change', render);

        // create and setup a renderer
        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setSize(w, h);

        // show axes in the screen
        var axes = new THREE.AxisHelper(30);
        scene.add(axes)
        
        
        /* more of our code here */
        //load_pdb("data/2RH1.pdb");
        load_pdb("data/caffeine.pdb");
        add_stuff();
      
        
        camera.lookAt(scene.position);
             

        container.append( renderer.domElement );
        
    };
    
    
    function render() {
        renderer.render( scene, camera );
    }
    
    function animate() {
        requestAnimationFrame( animate );
        controls.update();
    }

    function load_pdb( url ) {
        pdb_loader.load( url, function ( geometry, geometryBonds ) {
            var positions = geometry.vertices;
            
            //console.log(geometry);
            //console.log(geometryBonds);
            
            $.each(positions, function(p, position) {
                sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
                sphereMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00, wireframe: false});
                sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set( 5*position.x, 5*position.y, 5*position.z );
                atoms.push(sphere);
                scene.add(sphere);
            });

            render();
            
        } );
    };
    
    
    function add_stuff() {
    /*
        var cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set( -4, 4, -4 );
        // add the cube to the scene
        scene.add(cube);
    */
        
        // setup a light source       
        
        /*
        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( -20, 20, 130 );
        spotLight.lookAt( 0, 0, 0 );
        scene.add( spotLight ); 
        */
        
        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        scene.add(light);
        
        render();
    };
    
});
