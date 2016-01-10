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
    var default_camera_pos2 = {x: 308, y: 180, z: 370};
    
    var axial = $("#axial_slider").val();
    var coronal = $("#coronal_slider").val();
    var sagittal = $("#sagittal_slider").val();
    
    var img_stacks = {
        "axial":    181,
        "coronal":  181,
        "sagittal": 217
    };
    var textures = [];
    
    $("#v2_coordinates_a").text(zero_pad(axial, 3));
    $("#v2_coordinates_c").text(zero_pad(coronal, 3));
    $("#v2_coordinates_s").text(zero_pad(sagittal, 3));
    
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
                var url = "data/" + k + "_stack/slice_" + zero_pad(i, 3) + ".png";
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
        
        container2.html( renderer2.domElement );
        
        $("#axial_slider").on("input", function() {
            $("#v2_coordinates_a").text(zero_pad(this.value, 3));
            scene2.remove(scene2.getObjectByName('axial_plane'));
            add_axial_plane();
            render2();
        });
        
        $("#coronal_slider").on("input", function() {
            $("#v2_coordinates_c").text(zero_pad(this.value, 3));
            scene2.remove(scene2.getObjectByName('coronal_plane'));
            add_coronal_plane();
            render2();
        });
        
        $("#sagittal_slider").on("input", function() {
            $("#v2_coordinates_s").text(zero_pad(this.value, 3));
            scene2.remove(scene2.getObjectByName('sagittal_plane'));
            add_sagittal_plane();
            render2();
        });
    }
    
    function render2() {
        renderer2.render( scene2, camera2 );
    }
    
    function animate2() {
        requestAnimationFrame( animate2 );
        controls2.update();
    }
    

    function add_sagittal_plane() {
        // Sagittal Plane (Blue / Back to Front)
        sagittal = $("#sagittal_slider").val();
        var geometry = new THREE.PlaneGeometry( 181, 181, 0 );
        var material = new THREE.MeshLambertMaterial( {map: get_texture("sagittal", sagittal), color: 0x3333aa, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.position.set(90.5, 90.5, sagittal);
        plane.name = 'sagittal_plane';
        scene2.add( plane );

    }
    
    function add_axial_plane() {
        // Axial Plane (Red / Bottom to Top)
        axial = $("#axial_slider").val();
        geometry = new THREE.PlaneGeometry( 181, 217, 0 );
        material = new THREE.MeshLambertMaterial( {map: get_texture("axial", axial), color: 0xaa3333, side: THREE.DoubleSide} );
        plane = new THREE.Mesh( geometry, material );
        plane.rotateX(deg2rad(90));
        plane.position.set(90.5, axial, 217/2);
        plane.name = 'axial_plane';
        scene2.add( plane );

    }
    
    function add_coronal_plane() {
        // Coronal Plane (Green / Right to Left)
        coronal = $("#coronal_slider").val();
        geometry = new THREE.PlaneGeometry( 217, 181, 0 );
        material = new THREE.MeshLambertMaterial( {map: get_texture("coronal", coronal), color: 0x33aa33, side: THREE.DoubleSide} );
        plane = new THREE.Mesh( geometry, material );
        plane.rotateY(deg2rad(90));
        plane.position.set(coronal, 90.5, 217/2);
        plane.name = 'coronal_plane';
        scene2.add( plane );
    }
    
    function add_planes() {
        add_sagittal_plane();
        add_axial_plane();
        add_coronal_plane();
    };
    
    function get_texture(axis, number) {
        if (axis == "axial") return textures[number-1];
        if (axis == "coronal") return textures[number-1 + img_stacks["axial"]];
        if (axis == "sagittal") return textures[number-1 + img_stacks["axial"] + img_stacks["coronal"]];
        return undefined;
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
