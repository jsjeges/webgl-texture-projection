import {
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

const keymap = new Map();

const keys = new Proxy(keymap, {get(target,name,receiver){
  return target.get(name)===true;
}})

const renderer = new WebGLRenderer();

document.body.appendChild(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const oc = new OrthographicCamera(-2,2,-2,2);
scene.add(oc)

const cg1 = new Group();
const cg2 = new Group();

cg1.add(cg2);
cg2.add(camera);
cg2.rotateX(45*DEG2RAD);

scene.add(cg1);

const ax = new AxesHelper(0.5);
oc.add(ax);

const geometry = new BoxGeometry( 1, 1, 1 );
const cube = new Mesh( geometry, material );
//scene.add( cube );

cube.translateZ(0.5);

const pg = new PlaneGeometry( 5, 5 );
const pl = new Mesh( pg, material );
scene.add( pl );

camera.translateZ(2);

let pFrame = 0

const animation = ()=>{

  const {innerWidth:w, innerHeight:h} = window;

  renderer.setSize( w,h );
  camera.aspect = w/h;

  camera.updateProjectionMatrix();
  oc.updateProjectionMatrix();

  const cFrame = performance.now();
  const dTime = (cFrame-pFrame)/1000;

  pFrame=cFrame;
  if(keys.d) cg1.rotateZ((20*dTime)*DEG2RAD)
  if(keys.a) cg1.rotateZ((-20*dTime)*DEG2RAD)

  if(keys.s) cg2.rotateX((20*dTime)*DEG2RAD)
  if(keys.w) cg2.rotateX((-20*dTime)*DEG2RAD)

  if(keys.t) oc.translateZ(1*dTime)
  if(keys.g) oc.translateZ(-1*dTime)

  if(keys.y) oc.translateX(1*dTime)
  if(keys.h) oc.translateX(-1*dTime)

  if(keys.b) oc.translateY(1*dTime)
  if(keys.n) oc.translateY(-1*dTime)

  if(keys.j) oc.rotateZ((20*dTime)*DEG2RAD)
  if(keys.l) oc.rotateZ((-20*dTime)*DEG2RAD)

  if(keys.k) oc.rotateX((20*dTime)*DEG2RAD)
  if(keys.i) oc.rotateX((-20*dTime)*DEG2RAD)


  material.uniforms.modelViewMatrix2.value.copy(oc.matrixWorldInverse).multiply(pl.matrixWorld)
  material.uniforms.projectionMatrix2.value.copy(oc.projectionMatrix);

  renderer.render(scene, camera);

  requestAnimationFrame(animation)
}

animation();


document.body.onkeydown = (e)=>{
  keymap.set(e.key,true)
}

document.body.onkeyup = (e)=>{
  keymap.set(e.key,false)
}
