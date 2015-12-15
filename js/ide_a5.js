$(document).ready(function() {
    var container;
    var camera;
    var scene;
    var renderer;
    
    init();
    

    function init() {
        container = $("#visbox1");
        var w = container.width();
        var h = container.height();
        
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.set(-30, 40, 30);

        // create and setup a renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor(new THREE.Color(0x151515, 1.0));
        renderer.setSize(w, h);

        // show axes in the screen
        var axes = new THREE.AxisHelper(20);
        scene.add(axes)
        
        
        /* more of our code here */
        add_stuff();
        
        
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        
        container.append( renderer.domElement );
    };
    
    
    function add_stuff() {
        var cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set( -4, 4, -4 );
        // add the cube to the scene
        scene.add(cube);
        
        // setup a light source       
        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( -50, 120, 0 );
        spotLight.lookAt( 10, 5, 0 );
        scene.add( spotLight ); 
    };
    
});
