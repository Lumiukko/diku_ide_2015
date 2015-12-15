$(document).ready(function() {
    var container;
    var camera;
    var scene;
    var renderer;
    
    init();
    
    function init() {
        container = $("#visbox1");
        var w = container.width()
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
        
        camera.lookAt(scene.position);
        renderer.render(scene, camera);       

        container.append( renderer.domElement );
    
    };
    
    
});
