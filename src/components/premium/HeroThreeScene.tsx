"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export default function HeroThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.8, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff7aa2, 2.2, 30);
    pointLight.position.set(4, 3, 4);
    scene.add(pointLight);

    const accentLight = new THREE.PointLight(0x7acbff, 1.8, 30);
    accentLight.position.set(-4, -1, 3);
    scene.add(accentLight);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.25,
      transmission: 0.9,
      thickness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    const heroCore = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.24, 200, 24), glassMaterial);
    heroCore.position.set(0, 0.2, 0);
    scene.add(heroCore);

    const cardGeometry = new THREE.BoxGeometry(0.95, 1.25, 0.2);
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f2ff,
      roughness: 0.35,
      metalness: 0.4,
      emissive: 0x4e1f5c,
      emissiveIntensity: 0.18,
    });

    const cards = [-1.8, 0, 1.8].map((x, index) => {
      const mesh = new THREE.Mesh(cardGeometry, cardMaterial);
      mesh.position.set(x, index === 1 ? -1.2 : -0.9, -0.8);
      mesh.rotation.set(-0.2, index === 1 ? 0 : x * 0.12, 0.08);
      scene.add(mesh);
      return mesh;
    });

    gsap.to(heroCore.rotation, {
      y: Math.PI * 2,
      duration: 13,
      repeat: -1,
      ease: "none",
    });

    cards.forEach((card, index) => {
      gsap.to(card.position, {
        y: card.position.y + 0.22,
        duration: 2 + index * 0.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    let animationFrame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      heroCore.rotation.x = Math.sin(elapsed * 0.8) * 0.35;
      heroCore.position.y = 0.2 + Math.sin(elapsed * 1.1) * 0.12;
      cards.forEach((card, index) => {
        card.rotation.y += 0.0015 + index * 0.0007;
      });
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-[300px] sm:h-[360px] lg:h-[430px] w-full" />;
}
