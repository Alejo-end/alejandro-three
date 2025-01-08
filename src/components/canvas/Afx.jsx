'use client'

import React, { useState, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { TextureLoader, MeshPhongMaterial } from 'three'

export function Afx(props) {
    const {
        position = [0, 0, 0],
        scale = [20, 20, 20],
        rotation = [20, 80, 50]
    } = props

    // Load materials and model
    const materials = useLoader(MTLLoader, '/Afx/Afx.mtl')
    const obj = useLoader(OBJLoader, '/Afx/Afx.obj')

    // Load textures
    const diffuseMap = useLoader(TextureLoader, '/Afx/tex_u1_v1_diffuse.jpg')
    const normalMap = useLoader(TextureLoader, '/Afx/tex_u1_v1_normal.jpg')

    // Preload materials to ensure they are ready for use
    useEffect(() => {
        if (materials) {
            materials.preload()
        }
    }, [materials])

    // Create a state to hold the loaded object with applied materials
    const [loadedObj, setLoadedObj] = useState(null)

    // Apply materials and textures to the object when both materials and object are loaded
    useEffect(() => {
        if (materials && obj) {
            const loadedObject = obj.clone()
            loadedObject.traverse((child) => {
                if (child.isMesh) {
                    // Apply material from MTL or create a new one with textures
                    child.material =
                        materials.materials[child.name] ||
                        new MeshPhongMaterial({
                            map: diffuseMap,
                            normalMap: normalMap,
                        })
                }
            })
            setLoadedObj(loadedObject)
        }
    }, [materials, obj, diffuseMap, normalMap])

    return loadedObj ? (
        <group position={position} scale={scale} rotation={rotation}>
            <primitive object={loadedObj} />
        </group>
    ) : null
}
