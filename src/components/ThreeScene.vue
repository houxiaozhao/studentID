<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineEmits, defineExpose } from "vue";
import * as THREE from "three";
import { useI18n } from "vue-i18n";
import { templates } from "../templates";

const { t, locale } = useI18n();

const props = defineProps({
  cardData: {
    type: Object,
    required: true,
  },
  template: {
    type: String,
    default: "classic",
  },
});

const emit = defineEmits(["capture"]);

const backgrounds = {
  desk1: "./backgrounds/desk1.jpg",
  desk2: "./backgrounds/desk2.jpg",
  desk3: "./backgrounds/desk3.jpg",
  desk4: "./backgrounds/desk4.jpg",
};

const container = ref(null);
let scene, camera, renderer, card;
let isDragging = false;
let isShiftPressed = false;
let previousMousePosition = { x: 0, y: 0 };

// Camera controls
const cameraPosition = {
  minZ: 1,
  maxZ: 15,
  defaultZ: 7,
};

const init = () => {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Camera setup
  const aspect = container.value.clientWidth / container.value.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 0, cameraPosition.defaultZ);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Main directional light (simulating sun)
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.2);
  mainLight.position.set(5, 5, 7);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 500;
  scene.add(mainLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-5, 2, 3);
  scene.add(fillLight);

  // Back light for rim lighting effect
  const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
  backLight.position.set(0, -3, -5);
  scene.add(backLight);

  // Add subtle point lights for specular highlights
  const pointLight1 = new THREE.PointLight(0xffffff, 0.1);
  pointLight1.position.set(3, 3, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 0.1);
  pointLight2.position.set(-3, -3, 3);
  scene.add(pointLight2);

  // Enable shadow rendering
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create card geometry
  createCard();

  // Add event listeners
  container.value.addEventListener("mousedown", onMouseDown);
  container.value.addEventListener("mousemove", onMouseMove);
  container.value.addEventListener("mouseup", onMouseUp);
  container.value.addEventListener("wheel", onWheel);
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // Initial render
  renderer.render(scene, camera);
  animate();
};

const createCard = () => {
  // Get current template
  const currentTemplate = templates[props.template] || templates.classic;

  // Create a plane geometry for the card with template-specific dimensions
  const geometry = new THREE.PlaneGeometry(currentTemplate.width / 100, currentTemplate.height / 100);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    metalness: 0.1,
    roughness: 0.3,
    envMapIntensity: 1,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    reflectivity: 1,
  });

  card = new THREE.Mesh(geometry, material);
  scene.add(card);

  // Adjust camera position based on template orientation
  const maxDimension = Math.max(currentTemplate.width, currentTemplate.height) / 100;
  camera.position.z = maxDimension * 2.8;

  // Create and apply card texture
  updateCardTexture();
};

const updateCardTexture = async () => {
  // Get current template
  const currentTemplate = templates[props.template] || templates.classic;

  // Create a canvas to draw the card content
  const canvas = document.createElement("canvas");
  canvas.width = currentTemplate.width * 5;
  canvas.height = currentTemplate.height * 5;
  const ctx = canvas.getContext("2d");

  // Draw background first if available
  if (props.cardData.background) {
    try {
      if (props.cardData.background === "custom" && props.cardData.customBackground) {
        const fileUrl = URL.createObjectURL(props.cardData.customBackground);
        const bgImage = await loadImage(fileUrl);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(fileUrl);
      } else {
        const bgImage = await loadImage(backgrounds[props.cardData.background]);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error("Failed to load background:", error);
    }
  }

  // Add shadow effect
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Load photo if available
  let photoImage = null;
  if (props.cardData.photo) {
    try {
      photoImage = await loadImage(URL.createObjectURL(props.cardData.photo));
    } catch (error) {
      console.error("Failed to load photo:", error);
    }
  }

  // Set card dimensions and position
  const cardWidth = currentTemplate.width;
  const cardHeight = currentTemplate.height;
  const cardX = (canvas.width - cardWidth) / 2;
  const cardY = (canvas.height - cardHeight) / 2;
  console.log({ cardX, cardY, cardWidth, cardHeight });

  // Save context state before rendering template
  ctx.save();

  // Render template
  currentTemplate.render(
    ctx,
    {
      ...props.cardData,
      photo: photoImage,
    },
    t,
    {
      cardX,
      cardY,
      cardWidth,
      cardHeight,
    }
  );

  // Restore context state
  ctx.restore();

  // Create and apply texture
  const texture = new THREE.CanvasTexture(canvas);
  if (card) {
    if (card.material instanceof THREE.MeshPhysicalMaterial) {
      card.material.map = texture;
      card.material.needsUpdate = true;
    } else {
      card.material = new THREE.MeshPhysicalMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.3,
        envMapIntensity: 1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        reflectivity: 1,
      });
    }
  }
};

// Helper function to load images
const loadImage = src => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Handle zoom with mouse wheel
const onWheel = event => {
  event.preventDefault();

  const zoomSpeed = 0.001;
  const delta = -event.deltaY * zoomSpeed;
  const newZ = camera.position.z - delta * 5;

  // Limit zoom range
  if (newZ >= cameraPosition.minZ && newZ <= cameraPosition.maxZ) {
    camera.position.z = newZ;
  }
};

// Track shift key for pan mode
const onKeyDown = event => {
  if (event.key === "Shift") {
    isShiftPressed = true;
    container.value.style.cursor = "move";
  }
};

const onKeyUp = event => {
  if (event.key === "Shift") {
    isShiftPressed = false;
    container.value.style.cursor = "grab";
  }
};

const onMouseDown = event => {
  isDragging = true;
  container.value.style.cursor = isShiftPressed ? "move" : "grabbing";
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
};

const onMouseMove = event => {
  if (!isDragging) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  if (isShiftPressed) {
    // Pan mode
    const panSpeed = 0.005;
    camera.position.x -= (deltaMove.x * panSpeed * camera.position.z) / 5;
    camera.position.y += (deltaMove.y * panSpeed * camera.position.z) / 5;

    // Limit pan range
    const maxPan = 3;
    camera.position.x = Math.max(-maxPan, Math.min(maxPan, camera.position.x));
    camera.position.y = Math.max(-maxPan, Math.min(maxPan, camera.position.y));
  } else {
    // Rotate mode
    if (card) {
      card.rotation.y += deltaMove.x * 0.005;
      card.rotation.x += deltaMove.y * 0.005;

      // Limit rotation
      card.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, card.rotation.x));
    }
  }

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
};

const onMouseUp = () => {
  isDragging = false;
  container.value.style.cursor = isShiftPressed ? "move" : "grab";
};

const onWindowResize = () => {
  if (camera && renderer && container.value) {
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  }
};

const animate = () => {
  if (!card) return;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// Add capture method
const captureScene = () => {
  if (!renderer || !scene || !camera) return null;

  // Simply render and capture the current view
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL("image/png");
};

// Expose capture method to parent
defineExpose({ captureScene });

// Watch for changes in card data and locale
watch(
  [() => props.cardData, locale],
  () => {
    if (card) {
      updateCardTexture();
    }
  },
  { deep: true }
);

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  if (container.value) {
    container.value.removeEventListener("mousedown", onMouseDown);
    container.value.removeEventListener("mousemove", onMouseMove);
    container.value.removeEventListener("mouseup", onMouseUp);
    container.value.removeEventListener("wheel", onWheel);
  }
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
});
</script>

<template>
  <div ref="container" class="three-container" :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"></div>
</template>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
}
</style>
