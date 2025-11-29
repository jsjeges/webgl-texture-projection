import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  Group,
  Matrix4,
} from "./lib/three.module.min.js"

import {makeMaterial} from "./shader.mjs"

const material = makeMaterial();

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

const cg1 = new Group();
const cg2 = new Group();

cg1.add(cg2);
cg2.add(camera);
cg2.rotateX(45*DEG2RAD);

scene.add(cg1);

const geometry = new BoxGeometry( 1, 1, 1 );
const cube = new Mesh( geometry, material );
scene.add( cube );

cube.translateZ(0.5);

const pg = new PlaneGeometry( 5, 5 );
const pl = new Mesh( pg, material );
scene.add( pl );

camera.position.z = 3;

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

  cg1.rotateZ((27*dTime)*DEG2RAD)

  requestAnimationFrame(animation)
}

animation();
