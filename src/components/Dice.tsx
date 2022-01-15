import { Physics, useBox } from "@react-three/cannon";
import { Lathe, OrbitControls, OrthographicCamera, PresentationControls, SpotLight, TorusKnot, TrackballControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from 'three'
import DiceMesh from "./DiceMesh";
import DiceModel from "./Scene";


export default function Dice() {

    return (
        <Canvas>
            <ambientLight />
            <OrbitControls  />
             <Group />
        </Canvas>
    )
}

const Group = () => {
    const {camera} = useThree()

    useLayoutEffect(() => {
        camera.position.set(1, 5, 5)
    }, [])

    return (
    <group scale={0.2}>
        <Physics>
            <DiceModel /> 
            <DiceMesh scale={0.1} position={[0, 5000, 0]}/>
        </Physics>
    </group>  
    )
}