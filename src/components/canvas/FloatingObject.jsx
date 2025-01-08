'use client'

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const RotatingCube = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Set up scene, camera, and renderer with a transparent background
    const scene = new THREE.Scene();
    scene.background = null; // This makes the background transparent

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: true, // Enable transparency
      antialias: true
    });

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0); // Fully transparent clear color
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: "#9CDBA6", emissive: "#9CDBA6" });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

const FloatingObject = () => {
  return (
    <div
      style={{
        height: "400px",
        width: "400px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: 'transparent' // Optional: ensures transparent background
      }}
    >
      <RotatingCube />
    </div>
  );
};

export default FloatingObject;