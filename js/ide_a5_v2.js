$(document).ready(function() {
    var container2, container2_view;
    var camera2, camera2_view;
    var scene2, scene2_view;
    var renderer2, renderer2_view;
    
    var imageManager = new THREE.LoadingManager();
    var textureLoader = new THREE.TextureLoader(imageManager);
    
    var helpers2 = false;
    
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
    
    $(".v2_coordinates_a").text(zero_pad(axial, 3));
    $(".v2_coordinates_c").text(zero_pad(coronal, 3));
    $(".v2_coordinates_s").text(zero_pad(sagittal, 3));
    
    
    load_textures();

    
    function load_textures() {
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
            init2();
            init2_view();
            
            render2();
            render2_view();
        };
    }
    
    function init2_view() {
        container2_view = $("#visbox2_views");
        
        var w = container2_view.width();
        var h = container2_view.height();
       
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene2_view = new THREE.Scene();
        
        // create an orthographic camera without perspective distortion
        camera2_view = new THREE.OrthographicCamera(w/-2, w/2, h/2, h/-2, 0.1, 1000);
        camera2_view.position.set(0, 1000, 0);
        camera2_view.lookAt(scene2_view.position);
        
        //camera2_view = new THREE.PerspectiveCamera(default_camera_fov2, w / h, 0.1, 1000);
        //camera2_view.position.set(default_camera_pos2.x, default_camera_pos2.y, default_camera_pos2.z);
        //camera2_view.lookAt(scene2_view.position);
        
        scene2_view.add(camera2_view);
        
        // create a webgl renderer
        renderer2_view = new THREE.WebGLRenderer( { antialias: true } );
        renderer2_view.setSize(w, h);
        
        // add axis helper
        var axes = new THREE.AxisHelper(100);
        scene2_view.add(axes);
        
        // add light
        var light = new THREE.AmbientLight(0xffffff);
        scene2_view.add(light);
        
        // add renderer to container
        container2_view.html( renderer2_view.domElement );
        
        // add view planes
        redraw_view_planes();
    }
    
    function render2_view() {
        renderer2_view.render( scene2_view, camera2_view );
    }
    
    function redraw_view_planes() {
        var padding = 10;
    
        sagittal = $("#sagittal_slider").val();
        scene2_view.remove(scene2_view.getObjectByName('sagittal_plane_view'));
        var s_cube_geo = new THREE.BoxGeometry(181, 10, 181);
        var s_cube_mat = new THREE.MeshLambertMaterial({map: get_texture("sagittal", sagittal), color: 0xffffff });
        var s_cube = new THREE.Mesh(s_cube_geo, s_cube_mat);
        s_cube.rotateY(deg2rad(90));
        s_cube.position.set(0, 0, 217/2 + 181/2 + padding*2);
        s_cube.name = 'sagittal_plane_view';
        scene2_view.add( s_cube );
        
        axial = $("#axial_slider").val();
        scene2_view.remove(scene2_view.getObjectByName('axial_plane_view'));
        var a_cube_geo = new THREE.BoxGeometry(181, 10, 217);
        var a_cube_mat = new THREE.MeshLambertMaterial({map: get_texture("axial", axial), color: 0xffffff });
        var a_cube = new THREE.Mesh(a_cube_geo, a_cube_mat);
        a_cube.position.set(0, 0, padding);
        a_cube.name = 'axial_plane_view';
        scene2_view.add( a_cube );
        
        coronal = $("#coronal_slider").val();
        scene2_view.remove(scene2_view.getObjectByName('coronal_plane_view'));
        var c_cube_geo = new THREE.BoxGeometry(217, 10, 181);
        var c_cube_mat = new THREE.MeshLambertMaterial({map: get_texture("coronal", coronal), color: 0xffffff });
        var c_cube = new THREE.Mesh(c_cube_geo, c_cube_mat);
        c_cube.rotateY(deg2rad(90));
        c_cube.position.set(0, 0, - 217/2 - 217/2);
        c_cube.name = 'coronal_plane_view';
        scene2_view.add( c_cube );
        
        render2_view();
    }
    
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
        
        // create and setup a renderer
        renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer2.setSize(w, h);
        
        // show axes in the screen
        if (helpers2) {
            var axes = new THREE.AxisHelper(181);
            scene2.add(axes)
        };

        container2.html( renderer2.domElement );
        
        add_light();            
        add_planes();
        
        $("#axial_slider").on("input", function() {
            $(".v2_coordinates_a").text(zero_pad(this.value, 3));
            scene2.remove(scene2.getObjectByName('axial_plane'));
            add_axial_plane();
            redraw_view_planes()
            render2();
        });
        
        $("#coronal_slider").on("input", function() {
            $(".v2_coordinates_c").text(zero_pad(this.value, 3));
            scene2.remove(scene2.getObjectByName('coronal_plane'));
            add_coronal_plane();
            redraw_view_planes()
            render2();
        });
        
        $("#sagittal_slider").on("input", function() {
            $(".v2_coordinates_s").text(zero_pad(this.value, 3));
            scene2.remove(scene2.getObjectByName('sagittal_plane'));
            add_sagittal_plane();
            redraw_view_planes()
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
        var material = new THREE.MeshLambertMaterial( {map: get_texture("sagittal", sagittal), color: 0x6666ff, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.position.set(90.5, 90.5, sagittal);
        plane.name = 'sagittal_plane';
        scene2.add( plane );

    }
    
    function add_axial_plane() {
        // Axial Plane (Red / Bottom to Top)
        axial = $("#axial_slider").val();
        geometry = new THREE.PlaneGeometry( 181, 217, 0 );
        material = new THREE.MeshLambertMaterial( {map: get_texture("axial", axial), color: 0xff6666, side: THREE.DoubleSide} );
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
        material = new THREE.MeshLambertMaterial( {map: get_texture("coronal", coronal), color: 0x66ff66, side: THREE.DoubleSide} );
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
