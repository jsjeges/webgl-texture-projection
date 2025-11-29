import {
  Euler,
  MeshPhongMaterial,
  Vector3,
  Vector2,
  Matrix3,
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  Group,
  Matrix4,
  AxesHelper,
  OrbitControls,
  GLTFLoader,    
  DecalGeometry, 
  TextureLoader,
  SRGBColorSpace,
  AmbientLight,
  DirectionalLight,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Raycaster,
  MeshNormalMaterial,
} from "./lib/index.mjs"

const loader = new GLTFLoader();
const textureLoader = new TextureLoader();

let renderer, scene, camera;
let mesh;
let raycaster;
let line;

const intersection = {
  intersects: false,
  point: new Vector3(),
  normal: new Vector3()
};
const mouse = new Vector2();
const intersects = [];

const decalDiffuse = textureLoader.load( 'stickerDiffuse.png' );
const decalNormal = textureLoader.load( 'stickerNormal.png' );
decalDiffuse.colorSpace = SRGBColorSpace;

const decalMaterial = new MeshPhongMaterial( {
  specular: 0x444444,
  map: decalDiffuse,
  normalMap: decalNormal,
  normalScale: new Vector2( 1, 1 ),
  shininess: 30,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: - 4,
  wireframe: false
} );


function loadWidget() {

  const map = textureLoader.load( 'widgetDiffuse.png' );
  map.colorSpace = SRGBColorSpace;


  loader.load( 'widget.gltf', function ( gltf ) {

    mesh = gltf.scene.children[ 0 ];
    mesh.material = new MeshPhongMaterial( {
      specular: 0x111111,
      map: map,
      shininess: 25
    } );

    scene.add( mesh );
    mesh.scale.multiplyScalar( 10 );

  } );
}


const decals = [];
let mouseHelper;
const position = new Vector3();
const orientation = new Euler();
const size = new Vector3( 2, 2, 0 );

const params = {
  minScale: 3,
  maxScale: 8,
  rotate: false,
  clear: function () {

    removeDecals();

  }
};

init();

function init() {


  const style = document.createElement("style");
  document.head.appendChild(style);

  style.sheet.insertRule(`
  html,body,canvas {
    padding:0;
    margin:0;
    width:100%;
    height:100%;
    background-color:black;
  }
  `)

  renderer = new WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animate );

  document.body.appendChild( renderer.domElement );

  scene = new Scene();

  camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 120;

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 50;
  controls.maxDistance = 200;

  scene.add( new AmbientLight( 0x666666 ) );

  const dirLight1 = new DirectionalLight( 0xffddcc, 3 );
  dirLight1.position.set( 1, 0.75, 0.5 );
  scene.add( dirLight1 );

  const dirLight2 = new DirectionalLight( 0xccccff, 3 );
  dirLight2.position.set( - 1, 0.75, - 0.5 );
  scene.add( dirLight2 );

  const geometry = new BufferGeometry();
  geometry.setFromPoints( [ new Vector3(), new Vector3() ] );

  line = new Line( geometry, new LineBasicMaterial() );
  scene.add( line );

  loadWidget();

  raycaster = new Raycaster();

  mouseHelper = new Mesh( new BoxGeometry( 1, 1, 10 ), new MeshNormalMaterial() );
  mouseHelper.visible = false;
  scene.add( mouseHelper );

  window.addEventListener( 'resize', onWindowResize );

  let moved = false;

  controls.addEventListener( 'change', function () {

    moved = true;

  } );

  window.addEventListener( 'pointerdown', function () {

    moved = false;

  } );

  window.addEventListener( 'pointerup', function ( event ) {

    if ( moved === false ) {

      checkIntersection( event.clientX, event.clientY );

      if ( intersection.intersects ) shoot();

    }

  } );

  window.addEventListener( 'pointermove', onPointerMove );

  function onPointerMove( event ) {

    if ( event.isPrimary ) {

      checkIntersection( event.clientX, event.clientY );

    }

  }

  function checkIntersection( x, y ) {

    if ( mesh === undefined ) return;

    mouse.x = ( x / window.innerWidth ) * 2 - 1;
    mouse.y = - ( y / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    raycaster.intersectObject( mesh, false, intersects );

    if ( intersects.length > 0 ) {

      const p = intersects[ 0 ].point;
      mouseHelper.position.copy( p );
      intersection.point.copy( p );

      const normalMatrix = new Matrix3().getNormalMatrix( mesh.matrixWorld );

      const n = intersects[ 0 ].face.normal.clone();
      n.applyNormalMatrix( normalMatrix );
      n.multiplyScalar( 10 );
      n.add( intersects[ 0 ].point );

      intersection.normal.copy( intersects[ 0 ].face.normal );
      mouseHelper.lookAt( n );

      const positions = line.geometry.attributes.position;
      positions.setXYZ( 0, p.x, p.y, p.z );
      positions.setXYZ( 1, n.x, n.y, n.z );
      positions.needsUpdate = true;

      intersection.intersects = true;

      intersects.length = 0;

    } else {
      intersection.intersects = false;
    }
  }
}


function shoot() {

  position.copy( intersection.point );
  orientation.copy( mouseHelper.rotation );

  if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set( scale, scale, scale );

  const material = decalMaterial.clone();
  material.color.setHex( Math.random() * 0xffffff );

  const m = new Mesh( new DecalGeometry( mesh, position, orientation, size ), material );
  m.renderOrder = decals.length; // give decals a fixed render order

  decals.push( m );

  mesh.attach( m );

}

function removeDecals() {

  decals.forEach( function ( d ) {

    mesh.remove( d );

  } );

  decals.length = 0;

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  renderer.render( scene, camera );

}

