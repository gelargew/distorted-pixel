// @ts-nocheck

import * as THREE from 'three'
import { Box, OrbitControls, Plane, shaderMaterial, Stats, useTexture } from "@react-three/drei";
import { Canvas, useThree, extend, useFrame, ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useMove } from '@use-gesture/react'
import { useControls } from 'leva'

import imgURL from '../images/shoe.jpg'

export default function DistortedImg({ image = imgURL, grid = 32 }) {

  return (
    <>
      <Canvas>
        <Suspense fallback={null}>
          <Background image={image} grid={grid} />
        </Suspense>      
      </Canvas>     
    </>
  )
}


const ShaderMat = shaderMaterial(
  { uTime: 0, 
    uTexture: null, 
    uMouse: null, 
    uResolution: new THREE.Vector4(1, 1, 1, 1),
    uDataTexture: null,
    chaos: 0.5
  },
  `
  varying vec2 vUv;
  void main()	{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  #ifdef GL_ES
  precision mediump float;
  #endif


  uniform float uTime;
  uniform sampler2D uTexture;
  uniform vec3 uMouse;
  uniform vec4 uResolution;
  uniform sampler2D uDataTexture;
  uniform float chaos;

  varying vec2 vUv;

  
  
  void main() {
    vec2 newUV = (vUv - vec2(0.5))*uResolution.zw + vec2(0.5);
    vec4 color = texture2D(uTexture,newUV);
    vec4 offset = texture2D(uDataTexture,vUv);
    gl_FragColor = vec4(vUv,0.0,1.);
    gl_FragColor = vec4(offset.r,0.,0.,1.);
    gl_FragColor = color;
    gl_FragColor = texture2D(uTexture,newUV - 0.005*offset.rg);
  }
  `
)


extend({ ShaderMat })


const Background = ({
  image = imgURL,
  grid = 32
}) => {
  const {
    gridSize,
    strength,
    relaxation,
    pointerSize
  } = useControls({
    gridSize: { value: grid, min: 4, max: 1024, step: 4},
    strength: { value: 0.5, min: 0.1, max: 2, step: 0.1},
    relaxation: { value: 0.96, min: 0.7, max: 1, step: 0.01 },
    pointerSize: { value: 1, min: 0.1, max: 20 }
  })

  const {viewport, mouse} = useThree()
  const {width, height} = viewport
  const ref = useRef<THREE.Mesh>(null!)
  const texture = useTexture(image)
  const resolution = new THREE.Vector4(1, 1, 1, 1)
  const aspectRatio = texture.image.height / texture.image.width
  const mouseV = new THREE.Vector2(0, 0)
  const defaultMouseV = new THREE.Vector2(0, 0)

  const dataTexture = useMemo(() => {
    const width = gridSize;
    const height = gridSize;
    const size = width * height;
    const data = new Float32Array(3 * size);
    const color = new THREE.Color(0xffffff);

    for (let i = 0; i < size; i++) {
      let r = Math.random() * 255
      let r1 = Math.random() * 255 - 125;

      const stride = i * 3;
      
      data[stride] = r;
      data[stride + 1] = r1;
      data[stride + 2] = r;

    }

    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat, THREE.FloatType);
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter;
    return texture
  }, [gridSize, image])


  useLayoutEffect(() => {    
    if (height/width > aspectRatio) {
      resolution.setZ((width/height) * aspectRatio)
      resolution.setW(1)
    }
    else {
      resolution.setZ(1)
      resolution.setW((height/width) / aspectRatio)
    }
    texture.wrapS = THREE.RepeatWrapping
    ref.current.material.uniforms.uTexture.value = texture
    ref.current.material.uniforms.uResolution.value = resolution
    ref.current.material.uniforms.uDataTexture.value = dataTexture;
    ref.current.material.uniforms.uDataTexture.value.needsUpdate = true;
    console.log(resolution, mouse.x)
  }, [viewport.width, viewport.height, gridSize, image])


  useFrame((state, delta) => {
    ref.current.material.uniforms.uTime.value += delta
/*     ref.current.material.uniforms.chaos.value = THREE.MathUtils.damp(
      ref.current.material.uniforms.chaos.value, 0, 0.2, 0.2
    ) */

    let gridMouseX = gridSize * (mouse.x/2 + 0.5);
    let gridMouseY = gridSize * (mouse.y/2 + 0.5);
    let maxDist = gridSize * 0.1;
    let aspect = height / width

    let data = dataTexture.image.data

    for (let i = 0; i < data.length; i += 3) {
      data[i] *= relaxation
      data[i + 1] *= relaxation
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        let distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2
        let maxDistSq = maxDist ** 2;

        if (distance < maxDistSq * pointerSize) {

          let index = 3 * (i + gridSize * j);

          let power = maxDist / Math.sqrt(distance);
          power = THREE.MathUtils.clamp(power, 1, 10)
          data[index] += strength * 10 * mouseV.x * power;
          data[index + 1] -= strength * 10 * mouseV.y * power;
        }
      }
    }
    mouseV.lerp(defaultMouseV, 0.2)
    dataTexture.needsUpdate = true
    
  })


  const bind = useMove((state) => {
    mouseV.set(
      (state.direction[0] || 1) * Math.sqrt((state.velocity[0]/10)),
      (state.direction[1] || 1) * Math.sqrt((state.velocity[1]/10))
    )
  })


  return (
    <group>
      <Plane ref={ref} args={[viewport.width, viewport.height]} {...bind()}>
        <shaderMat 
        attach='material' 
        side={THREE.DoubleSide} 
        extensions={{derivatives: "#extension GL_OES_standard_derivatives : enable"}} />
      </Plane>
    </group>
  )
}