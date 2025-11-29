import {
  ShaderMaterial,
  Vector3,
  Vector2,
  TextureLoader
} from "./lib/three.module.min.js"

const textureLoader = new TextureLoader();
const t1 = textureLoader.load( 'cloud.png' );
const t2 = textureLoader.load(  'target.png' );

const vertexShader=`
varying vec2 vUv;

void main() {

  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;

}
`

const fragmentShader= `
uniform float time;
uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 vUv;

void main( void ) {

  vec4 t1 = texture2D( texture1, vUv );
  vec4 t2 = texture2D( texture2, vUv );

  gl_FragColor = vec4(t1.r, t2.r, 1.0, 1.0);
}
`

const uniforms = {
  'time': { value: 1.0 },
  'texture1': { value: t1 },
  'texture2': { value: t2 }
};

export const makeMaterial= ()=>{

  const material = new ShaderMaterial( {
    uniforms,
    vertexShader,
    fragmentShader,

  } );

  return material;
}
