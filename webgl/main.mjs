import {simpleShader} from "./simpleShader.mjs"
import {mat4} from "./lib/glMatrix/esm/index.js"
import {initBuffers} from "./initBuffers.mjs"

const DEG2RAD = Math.PI/180;

const style = document.createElement("style");
document.head.appendChild(style);

style.sheet.insertRule(`
html,body {
  padding:0;
  margin:0;
}
`)

const width = 800;
const height = 600;
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height=height;

document.body.appendChild(canvas);

const gl = canvas.getContext("webgl");

const shader = simpleShader(gl);

const buffers = initBuffers(gl);

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, shader) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

  gl.vertexAttribPointer(
    shader.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );

  gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);
}

function drawSquare(gl, projectionMatrix, modelViewMatrix) {

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, buffers, shader);

  // Tell WebGL to use our program when drawing
  gl.useProgram(shader.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv( shader.uniformLocations.projectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv( shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

const makeCamera = ()=>{
  const transform =  mat4.create();
  mat4.translate(transform, transform, [-0.0, 0.0, -4.0],)

  return  {
    transform,
    projectionMatrix:mat4.create(),
    modelViewMatrix:mat4.create(),
    aspect:0,
    vFov:45*DEG2RAD,
    zNear:0.1,
    zFar:100,
  }
}

const updateProjectionMatrix = (camera, viewportWidth, viewportHeight) =>{
  camera.aspect = viewportWidth/ viewportHeight;

  const {transform, projectionMatrix, modelViewMatrix, aspect, vFov, zNear, zFar} = camera;

  mat4.perspective(projectionMatrix, vFov, aspect, zNear, zFar);

  mat4.identity(modelViewMatrix);
  mat4.multiply(modelViewMatrix, modelViewMatrix, transform); 
}

const camera = makeCamera();

// from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
function drawScene(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const {canvas:{clientWidth, clientHeight}} = gl;
  updateProjectionMatrix(camera, clientWidth, clientHeight);

  mat4.multiply(camera.modelViewMatrix, camera.modelViewMatrix, tr);

  drawSquare(gl, camera.projectionMatrix, camera.modelViewMatrix);
}

let pFrame = 0

const tr = mat4.create();

const animation = ()=>{
  const cFrame = performance.now();
  const dTime = (cFrame-pFrame)/1000;

  pFrame=cFrame;

  mat4.rotateX(tr,tr, (9*dTime)*DEG2RAD)
  mat4.rotateY(tr,tr, (18*dTime)*DEG2RAD)
  mat4.rotateZ(tr,tr, (27*dTime)*DEG2RAD)
  
  drawScene(gl)
  requestAnimationFrame(animation)
}

animation();
