<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineEmits, defineExpose } from "vue";
import * as THREE from "three";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  cardData: {
    type: Object,
    required: true,
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 2, 5);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-2, -2, -5);
  scene.add(backLight);

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
  // Create a plane geometry for the card
  const geometry = new THREE.PlaneGeometry(4, 2.5);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  card = new THREE.Mesh(geometry, material);
  scene.add(card);

  // Create and apply card texture
  updateCardTexture();
};

const updateCardTexture = async () => {
  // Create a canvas to draw the card content
  const canvas = document.createElement("canvas");
  canvas.width = 2000;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");

  // Draw background first if available
  console.log(props.cardData.background);

  if (props.cardData.background) {
    try {
      if (props.cardData.background === "custom" && props.cardData.customBackground) {
        console.log("自定义", props.cardData);
        const fileUrl = URL.createObjectURL(props.cardData.customBackground);
        const bgImage = await loadImage(fileUrl);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(fileUrl);

        // const bgImage = await loadImage(props.cardData.background);
        // ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      } else {
        const bgImage = await loadImage(backgrounds[props.cardData.background]);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error("Failed to load background:", error);
    }
  }

  // Draw card content
  const cardWidth = 400;
  const cardHeight = 250;
  const cardX = (canvas.width - cardWidth) / 2;
  const cardY = (canvas.height - cardHeight) / 2;

  // Add shadow effect
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Draw white background with rounded corners
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(cardX + 10, cardY);
  ctx.lineTo(cardX + cardWidth - 10, cardY);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 10);
  ctx.lineTo(cardX + cardWidth, cardY + cardHeight - 10);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - 10, cardY + cardHeight);
  ctx.lineTo(cardX + 10, cardY + cardHeight);
  ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - 10);
  ctx.lineTo(cardX, cardY + 10);
  ctx.quadraticCurveTo(cardX, cardY, cardX + 10, cardY);
  ctx.closePath();
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw blue header with rounded corners
  ctx.fillStyle = "#1B4B8A";
  ctx.beginPath();
  ctx.moveTo(cardX + 10, cardY);
  ctx.lineTo(cardX + cardWidth - 10, cardY);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 10);
  ctx.lineTo(cardX + cardWidth, cardY + 40);
  ctx.lineTo(cardX, cardY + 40);
  ctx.lineTo(cardX, cardY + 10);
  ctx.quadraticCurveTo(cardX, cardY, cardX + 10, cardY);
  ctx.closePath();
  ctx.fill();

  // Draw school name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 24px Microsoft YaHei";
  ctx.textAlign = "center";
  ctx.fillText(props.cardData.school || "", cardX + cardWidth / 2, cardY + 28);

  // Draw photo frame and photo if available
  ctx.strokeStyle = "#1B4B8A";
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX + 20, cardY + 60, 100, 140);

  if (props.cardData.photo) {
    try {
      const photo = await loadImage(URL.createObjectURL(props.cardData.photo));
      ctx.drawImage(photo, cardX + 20, cardY + 60, 100, 140);
    } catch (error) {
      console.error("Failed to load photo:", error);
    }
  }

  // Draw text fields
  ctx.fillStyle = "#333333";
  ctx.font = "14px Microsoft YaHei";
  ctx.textAlign = "left";

  const startX = cardX + 130;
  const startY = cardY + 60;
  const lineHeight = 30;
  const labelWidth = 90;
  const textStartX = startX + 10;
  const valueStartX = startX + labelWidth + 15;

  // Draw lines
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(startX, startY + i * lineHeight);
    ctx.lineTo(cardX + cardWidth - 20, startY + i * lineHeight);
    ctx.strokeStyle = "#1B4B8A";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Draw vertical line
  ctx.beginPath();
  ctx.moveTo(startX + labelWidth, startY);
  ctx.lineTo(startX + labelWidth, startY + lineHeight * 5);
  ctx.stroke();

  // Draw labels
  ctx.fillText(t("form.name"), textStartX, startY + lineHeight - 8);
  ctx.fillText(t("form.studentId"), textStartX, startY + lineHeight * 2 - 8);
  ctx.fillText(t("form.department"), textStartX, startY + lineHeight * 3 - 8);
  ctx.fillText(t("form.major"), textStartX, startY + lineHeight * 4 - 8);
  ctx.fillText(t("form.validDate"), textStartX, startY + lineHeight * 5 - 8);

  // Draw values
  ctx.textAlign = "left";
  ctx.fillText(props.cardData.name || "", valueStartX, startY + lineHeight - 8);
  ctx.fillText(props.cardData.studentId || "", valueStartX, startY + lineHeight * 2 - 8);
  ctx.fillText(props.cardData.department || "", valueStartX, startY + lineHeight * 3 - 8);
  ctx.fillText(props.cardData.major || "", valueStartX, startY + lineHeight * 4 - 8);
  ctx.fillText(props.cardData.validDate || "", valueStartX, startY + lineHeight * 5 - 8);

  // Draw logo if available
  if (props.cardData.logo) {
    try {
      const logo = await loadImage(URL.createObjectURL(props.cardData.logo));
      ctx.drawImage(logo, cardX + cardWidth - 60, cardY + 10, 50, 50);
    } catch (error) {
      console.error("Failed to load logo:", error);
    }
  }

  // Create and apply texture
  const texture = new THREE.CanvasTexture(canvas);
  if (card) {
    if (card.material instanceof THREE.MeshPhongMaterial) {
      card.material.map = texture;
      card.material.needsUpdate = true;
    } else {
      card.material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
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
