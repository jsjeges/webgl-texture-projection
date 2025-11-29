import {
  ShaderMaterial,
  Vector3,
  Vector2,
  Matrix4,
  TextureLoader
} from "./lib/three.module.min.js"

const textureLoader = new TextureLoader();
const t1 = textureLoader.load( 'cloud.png' );
const t2 = textureLoader.load(  'target.png' );

const vertexShader=`
uniform mat4 modelViewMatrix2;
uniform mat4 projectionMatrix2;
uniform mat4 worldMatrix;

varying vec2 vUv;
varying vec4 viewPosition;

void main() {

  viewPosition = projectionMatrix2 * modelViewMatrix2 * vec4(position, 1.0f);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader= `
uniform float time;
uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 vUv;
varying vec4 viewPosition;

void main( ) {

  vec2 projectTexCoord;
  projectTexCoord.x = viewPosition.x / viewPosition.w / 2.0f + 0.5f;
  projectTexCoord.y = viewPosition.y / viewPosition.w / 2.0f + 0.5f;

  vec4 t1 = texture2D( texture1, vUv );
  vec4 t2 = texture2D( texture2, projectTexCoord );

  gl_FragColor = vec4(t1.r, t2.r, 1.0, 1.0);
}
`

const uniforms = {
  'texture1': { value: t1 },
  'texture2': { value: t2 },
  'projectionMatrix2':{value: new Matrix4()},
  'modelViewMatrix2':{value: new Matrix4()},
};

export const makeMaterial= ()=>{

  const material = new ShaderMaterial( {
    uniforms,
    vertexShader,
    fragmentShader,

  } );

  return material;
}
