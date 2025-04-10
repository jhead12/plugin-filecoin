import { invoke } from '@tauri-apps/api/core';

document.addEventListener('DOMContentLoaded', () => {
  // Three.js Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('threejs-container').appendChild(renderer.domElement);

  // Lego-like blocks
  const blocks = [];
  const blockGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const blockMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });

  function createBlock() {
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    block.position.x = (Math.random() - 0.5) * 20;
    block.position.y = 15; // Start above the screen
    block.position.z = (Math.random() - 0.5) * 10;
    scene.add(block);
    blocks.push(block);
  }

  // Add initial blocks
  for (let i = 0; i < 20; i++) {
    createBlock();
  }

  camera.position.z = 10;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    blocks.forEach((block, index) => {
      block.position.y -= 0.1; // Falling speed
      block.rotation.x += 0.05;
      block.rotation.y += 0.05;

      if (block.position.y < -15) { // Reset when off-screen
        scene.remove(block);
        blocks.splice(index, 1);
        createBlock();
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // Menu interaction
  const menuItems = document.querySelectorAll('.menu-item');

  menuItems.forEach(item => {
    item.addEventListener('click', async () => {
      const route = item.getAttribute('data-route');
      if (!route) return;

      switch (route) {
        case 'data-transfers':
          await invoke('open_telemetry_window');
          break;
        case 'character-builder':
          console.log('Opening Character Builder...');
          break;
        case 'game-engine':
          console.log('Launching Game Engine...');
          break;
        case 'vscod':
          console.log('Opening VSCOD...');
          break;
        case 'performance':
          console.log('Checking Performance...');
          break;
        case 'bitcoin-invest':
          console.log('Entering Bitcoin Invest...');
          break;
        case 'bitcoin-submenu-placeholder':
          console.log('Bitcoin Invest Placeholder...');
          break;
        case 'user-profile':
          console.log('Viewing User Profile...');
          break;
        case 'placeholder':
          console.log('Placeholder Route...');
          break;
        case 'options':
          console.log('Opening Options...');
          placeholderOptionsFunction();
          break;
        default:
          console.log(`Route ${route} not implemented yet.`);
      }
    });
  });
});

function placeholderOptionsFunction() {
  alert('Options menu coming soon!');
}