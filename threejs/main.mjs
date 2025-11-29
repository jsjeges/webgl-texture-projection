import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh
} from "./lib/three.module.min.js"

import {makeMaterial} from "./shader.mjs"

const m = makeMaterial();

const DEG2RAD = Math.PI/180;

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

const renderer = new WebGLRenderer();

document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const geometry = new BoxGeometry( 1, 1, 1 );
const material = m//new MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
scene.add( cube );

camera.position.z = 2;

let pFrame = 0

const animation = ()=>{

  const {innerWidth:w, innerHeight:h} = window;

  renderer.setSize( w,h );
  camera.aspect = w/h;
  camera.updateProjectionMatrix();

  const cFrame = performance.now();
  const dTime = (cFrame-pFrame)/1000;

  pFrame=cFrame;

  renderer.render(scene,camera);

  cube.rotateX((9*dTime)*DEG2RAD)
  cube.rotateY((18*dTime)*DEG2RAD)
  cube.rotateZ((27*dTime)*DEG2RAD)

  requestAnimationFrame(animation)
}

animation();
