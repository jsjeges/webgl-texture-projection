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

const elem = (tag, parent, props)=>{
  const e =document.createElement(tag);
  if(parent) parent.appendChild(e)

    for(const key in props) {
      e[key] = props[key];
    }

  return e
}

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

let canvasContainer;

init();

function init() {

  const style = elem("style");
  document.head.appendChild(style);

style.sheet.insertRule(`
html,body,canvas {
  padding:0;
  margin:0;
}
`)

style.sheet.insertRule(`

  .layout {
    overflow:hidden;
    width:100%;
    height:1024px;
    display:grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr;

    .listContainer {

    }

    .canvasContainer {
      width:100%;
      height:100%;
      background-color:black;
    }
  }
`)

  renderer = new WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );

  const container = elem("div", document.body, {className:"layout"})


const listElement = elem("ul", container, {className:"listContainer"});

  for(let i =0; i < 10; i++) {
    const li = elem("li", listElement);
    li.innerText="hello" + i;
  }

   canvasContainer = elem("div", container, {className:"canvasContainer"})

  canvasContainer.appendChild(renderer.domElement)

  scene = new Scene();

  camera = new PerspectiveCamera( 45, 1, 1, 1000 );
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

  let moved = false;

  controls.addEventListener( 'change', function () {

    moved = true;

  } );

  window.addEventListener( 'pointerdown', function () {

    moved = false;

  } );

  window.addEventListener( 'pointerup', function ( event ) {
    if ( moved === true ) return

    checkIntersection( event );
    if ( intersection.intersects ) place();

  } );

  window.addEventListener( 'pointermove', onPointerMove );

  function onPointerMove( event ) {

    if ( event.isPrimary ) {
      checkIntersection( event );
    }
  }

  function checkIntersection( event ) {
    if(event.target !== renderer.domElement) return 
    if ( mesh === undefined ) return;

    const x =  event.offsetX;
    const y = event.offsetY;

    const {clientWidth:width, clientHeight:height} = renderer.domElement

    mouse.x = ( x / width ) * 2 - 1;
    mouse.y = - ( y / height ) * 2 + 1;

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

  renderer.setAnimationLoop( animate );
}

function place() {

  position.copy( intersection.point );
  orientation.copy( mouseHelper.rotation );

 // if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  const scale = 5;
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

function animate() {
  renderer.domElement.style.display="none";
  const {clientWidth:w,clientHeight:h} = canvasContainer
  renderer.domElement.style.display="block";

  camera.aspect = w/h;
  camera.updateProjectionMatrix();

  renderer.setSize( w,h );
  renderer.render( scene, camera );
}
