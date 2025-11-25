import {initShaderProgram} from "./initShaderProgram.mjs"

const frag = `
varying lowp vec4 vPos;

void main(void) {
  gl_FragColor = vec4(vPos.xyz, 1.0);
}
`;

const vert = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vPos;

void main(void) {
  vPos = aVertexPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`

export const simpleShader = (gl)=>{

  const program = initShaderProgram(gl,vert,frag);

  const info = {
    program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
    },
  };

  return info;
}
