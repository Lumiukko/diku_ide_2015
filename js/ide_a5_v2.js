$(document).ready(function() {
    var container2;
    var camera2;
    var scene2;
    var renderer2;
    var controls2;
    
    var imageManager = new THREE.LoadingManager();
    var textureLoader = new THREE.TextureLoader(imageManager);
    
    var helpers2 = true;
    var movement2 = false;
    
    var default_camera_fov2 = 45;
    var default_camera_pos2 = {x: 278, y: 205, z: 351};
    
    var img_stacks = {
        "axial":    181,
        "coronal":  181,
        "sagittal": 217
    };
    var textures = [];
    
    init2();
    
    if (movement2) animate2();
    
    
    
    
    function init2() {
        container2 = $("#visbox2");
        
        var w = container2.width();
        var h = container2.height();
       
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene2 = new THREE.Scene();
        
        // create a camera, which defines where we're looking at.
        camera2 = new THREE.PerspectiveCamera(default_camera_fov2, w / h, 0.1, 1000);
        camera2.position.set(default_camera_pos2.x, default_camera_pos2.y, default_camera_pos2.z);
        camera2.lookAt(scene2.position);
        
        // mouse controls
        if (movement2) {
            controls2 = new THREE.TrackballControls( camera2, document.getElementById("visbox2") );
            controls2.rotateSpeed = 5.0;
            controls2.zoomSpeed = 0.2;
            controls2.panSpeed = 0.2;
            controls2.noZoom = false;
            controls2.noPan = false;
            controls2.addEventListener( 'change', render2);
        }
        
        // create and setup a renderer
        renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer2.setSize(w, h);
        
        // show axes in the screen
        if (helpers2) {
            var axes = new THREE.AxisHelper(181);
            scene2.add(axes)
        };
        
        $.each(img_stacks, function(k, v) {
            for (var i = 1; i <= v; i++) {
                var url = get_img_name(k, i);
                textureLoader.load(url, function(img) {
                    textures.push(img);
                });
            }
        });
        
        imageManager.onProgress = function(item, loaded, total) {
            // loaded "item", which is number "loaded" out of "total"
            // can be used for a loading progress bar
        };
        
        imageManager.onLoad = function() {
            // ... finished loading all items
            // can be used to render scene and enable control elements
            add_light();
            add_planes();
            render2();
        };
        
        container2.append( renderer2.domElement );
    }
    
    
    function render2() {
        renderer2.render( scene2, camera2 );
    }
    
    function animate2() {
        requestAnimationFrame( animate2 );
        controls2.update();
    }
    
    function add_planes() {
        // Sagittal Plane (Blue / Back to Front)
        var geometry = new THREE.PlaneGeometry( 181, 181, 0 );
        var material = new THREE.MeshLambertMaterial( {map: textures[181*2+100], color: 0x3333aa, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.position.set(90.5, 90.5, 0);
        scene2.add( plane );
        
        // Axial Plane (Red / Bottom to Top)
        geometry = new THREE.PlaneGeometry( 181, 217, 0 );
        material = new THREE.MeshLambertMaterial( {map: textures[70], color: 0xaa3333, side: THREE.DoubleSide} );
        plane = new THREE.Mesh( geometry, material );
        plane.rotateX(deg2rad(90));
        plane.position.set(90.5, 0, 217/2);
        scene2.add( plane );
        
        // Coronal Plane (Green / Right to Left)
        geometry = new THREE.PlaneGeometry( 217, 181, 0 );
        material = new THREE.MeshLambertMaterial( {map: textures[181+80], color: 0x33aa33, side: THREE.DoubleSide} );
        plane = new THREE.Mesh( geometry, material );
        plane.rotateY(deg2rad(90));
        plane.position.set(0, 90.5, 217/2);
        scene2.add( plane );
    };
    
    
    function get_img_name(axis, number) {
        return "data/" + axis + "_stack/slice_" + zero_pad(number, 3) + ".png";
    }
    
    function deg2rad(degree) {
        return degree * (Math.PI / 180);
    }
    
    
    function add_light() {    
        var light = new THREE.AmbientLight( 0xffffff );
        scene2.add( light );
    };
    
    
    function zero_pad(str, len) {
        str = str.toString();
        return str.length < len ? zero_pad("0" + str, len) : str;
    }
    
    
});
