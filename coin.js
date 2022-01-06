// Mutliple renderers
//https://threejs.org/manual/?q=mu#en/multiple-scenes

class Coin {
    constructor( container, video, videoName, width, height ) {
        this.videoName = videoName;
        this.container = container;
        this.video = video; 

        this.width = width;
        this.height = height;

        this.windowHalfX = width / 2;
        this.windowHalfY = height / 2;
    }   

    init() {
        var _this = this;
        this.mouseX = 0, this.mouseY = 0;

        let object_video, mesh, mesh2;
        var videoTexture, video;

        this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 1, 2000 );
        this.camera.position.z = 250;
        // scene

        this.scene = new THREE.Scene();

        const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.2 );
        this.scene.add( ambientLight );

        const pointLight1 = new THREE.PointLight( 0xffffff, 0.8 );
        pointLight1.position.set( -100, 400, 500 );
        this.scene.add( pointLight1 );

        const pointLight2 = new THREE.PointLight( 0xffffff, 0.8 );
        pointLight2.position.set( 60, -200, 150 );
        this.scene.add( pointLight2 );


        this.scene.add( this.camera );

        this.raycaster = new THREE.Raycaster();

        this.pointer = new THREE.Vector2(-Infinity, -Infinity);

        this.helperMesh = new THREE.Mesh( new THREE.PlaneGeometry(140, 140),
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.0,
                color: 0x0000ff
            })
        )

        this.scene.add( this.helperMesh );
        
        var source = document.createElement('source');

        this.video.appendChild(source);
        
        source.setAttribute('src', this.videoName);
        source.setAttribute('type', 'video/mp4');        

        this.video.load();
        this.video.play();
        this.video.addEventListener( 'play', function () {
            // this.currentTime = 3;
        } );


        videoTexture = new THREE.VideoTexture( this.video );
        window.videoTexture = videoTexture;

        this.object = new THREE.Object3D();

        this.scene.add( this.object );
        // manager

        const manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        // texture

        const textureLoader = new THREE.TextureLoader( manager );
        const texture1 = textureLoader.load( 'tex_uv_inv_blur2_contrast.png' );
        const texture2 = textureLoader.load( 'tex_uv.png' );
        // model

        function onProgress( xhr ) {
            if ( xhr.lengthComputable ) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
            }
        }

        function onError(e) {
            console.log( e );
        }

        const loader = new THREE.OBJLoader( manager );
        loader.load( './coin24.obj', function ( obj ) {
            obj.traverse( function ( child ) {
                if ( child.isMesh ) {                    
                    const mat = new THREE.MeshStandardMaterial( { 
                        color: 0xffffff,
                        map: texture2,
                        //map: videoTexture,
                        bumpMap: texture1,
                        bumpScale: 2,
                        roughness: 0.3,
                        metalness: 0.7,
                        // transparent: true,
                        // opacity: 0.8,
                        // side: THREE.DoubleSide
                    } );
                    mesh = child;                    
                    mesh.material = mat;
                    mesh.position.y = 0;
                    mesh.scale.multiplyScalar( 40 );                    
                    window.mesh = mesh;
                    _this.object.add( mesh );
                    _this.animate();
                }
            } );
        }, onProgress, onError );

        loader.load( './coin_vidlayer7.obj', function ( obj ) {                        

            obj.traverse( function ( child ) {

                if ( child.isMesh ) {
                    // child.geometry.computeVertexNormals();                    
                    const mat = new THREE.MeshStandardMaterial( { 
                        color: 0xffffff,
                        map: videoTexture,
                        roughness: 0.5,
                        metalness: 0.3,
                    } );

                    mesh2 = child;                    
                    mesh2.material = mat;
                    mesh2.position.y = 0;
                    mesh2.scale.multiplyScalar( 38.5 );
                    mesh2.position.y = 3.35;
                    window.mesh2 = mesh2;
                    _this.object.add( mesh2 );
                }
            } );
        }, onProgress, onError );

        //

        // const webglCanvas = document.getElementById("webgl-canvas");
        const webglCanvas = document.createElement("canvas");

        this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );
        this.container.appendChild( this.renderer.domElement );

        document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this) );
        //
        this.container.addEventListener( 'resize', this.onWindowResize.bind(this) );

        document.addEventListener( 'pointermove', this.onPointerMove.bind(this) );

    }

    onWindowResize() {

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.windowHalfX = this.width / 2;
        this.windowHalfY = this.height / 2;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.width, this.height );

    }

    onDocumentMouseMove( event ) {
        this.mouseX = ( event.clientX - this.windowHalfX ) / 2;
        this.mouseY = ( event.clientY - this.windowHalfY ) / 2;
    }

    onPointerMove( event ) {
        this.pointer.x = ( event.clientX / this.width ) * 2 - 1;
        this.pointer.y = - ( event.clientY / this.height ) * 2 + 1;
    }

    //

    animate() {

        // var _this = this;
        window.requestAnimationFrame( () => this.animate() );
        this.render();

    }

    render() {

        this.object.rotation.z += 0.003;

        this.raycaster.setFromCamera( this.pointer, this.camera );

        const intersects = this.raycaster.intersectObject( this.helperMesh );

        if ( intersects.length > 0 ) {

            const intersect = intersects[ 0 ];
            const face = intersect.face;

            // console.log( intersect.point.x );

            this.object.rotation.z = - intersect.point.x / 22;
            this.object.rotation.x = Math.PI/2 - intersect.point.y / 120;


        } else {

            this.object.rotation.x = Math.PI/2;

        }

        this.renderer.render( this.scene, this.camera );

    }
}