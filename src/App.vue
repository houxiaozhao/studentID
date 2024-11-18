<script setup>
import { ref, onMounted } from "vue";

const form = ref(null);
const canvas = ref(null);
const ctx = ref(null);
const downloadBtn = ref(null);
const logoImage = ref(null);

const backgrounds = {
  desk1: "./backgrounds/desk1.jpg",
  desk2: "./backgrounds/desk2.jpg",
  desk3: "./backgrounds/desk3.jpg",
  desk4: "./backgrounds/desk4.jpg",
};

onMounted(() => {
  form.value = document.getElementById("studentForm");
  canvas.value = document.getElementById("previewCanvas");
  ctx.value = canvas.value.getContext("2d");
  downloadBtn.value = document.getElementById("downloadBtn");

  canvas.value.width = 1000;
  canvas.value.height = 750;

  const inputs = document.querySelectorAll("input, select");
  inputs.forEach(input => {
    input.addEventListener("input", debounce(generateStudentCard, 300));
  });

  form.value.addEventListener("submit", async function (e) {
    e.preventDefault();
    await generateStudentCard();
  });

  document.getElementById("logoUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        loadImage(e.target.result).then(img => {
          logoImage.value = img;
          generateStudentCard();
        });
      };
      reader.readAsDataURL(file);
    }
  });

  generateStudentCard();
});

async function generateStudentCard() {
  try {
    const data = {
      name: document.getElementById("name").value,
      studentId: document.getElementById("studentId").value,
      school: document.getElementById("school").value,
      department: document.getElementById("department").value,
      major: document.getElementById("major").value,
      validDate: document.getElementById("validDate").value,
      photo: document.getElementById("photo").files[0],
      background: document.getElementById("background").value,
    };

    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

    const bgImg = await loadImage(backgrounds[data.background]);
    ctx.value.drawImage(bgImg, 0, 0, canvas.value.width, canvas.value.height);

    ctx.value.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.value.shadowBlur = 15;
    ctx.value.shadowOffsetX = 3;
    ctx.value.shadowOffsetY = 3;

    const cardWidth = 400;
    const cardHeight = 250;
    const cardX = (canvas.value.width - cardWidth) / 2;
    const cardY = (canvas.value.height - cardHeight) / 2;

    ctx.value.fillStyle = "#FFFFFF";
    ctx.value.beginPath();
    ctx.value.moveTo(cardX + 10, cardY);
    ctx.value.lineTo(cardX + cardWidth - 10, cardY);
    ctx.value.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 10);
    ctx.value.lineTo(cardX + cardWidth, cardY + cardHeight - 10);
    ctx.value.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - 10, cardY + cardHeight);
    ctx.value.lineTo(cardX + 10, cardY + cardHeight);
    ctx.value.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - 10);
    ctx.value.lineTo(cardX, cardY + 10);
    ctx.value.quadraticCurveTo(cardX, cardY, cardX + 10, cardY);
    ctx.value.closePath();
    ctx.value.fill();

    ctx.value.shadowColor = "transparent";
    ctx.value.shadowBlur = 0;
    ctx.value.shadowOffsetX = 0;
    ctx.value.shadowOffsetY = 0;

    ctx.value.fillStyle = "#1B4B8A";
    ctx.value.beginPath();
    ctx.value.moveTo(cardX + 10, cardY);
    ctx.value.lineTo(cardX + cardWidth - 10, cardY);
    ctx.value.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 10);
    ctx.value.lineTo(cardX + cardWidth, cardY + 40);
    ctx.value.lineTo(cardX, cardY + 40);
    ctx.value.lineTo(cardX, cardY + 10);
    ctx.value.quadraticCurveTo(cardX, cardY, cardX + 10, cardY);
    ctx.value.closePath();
    ctx.value.fill();

    ctx.value.fillStyle = "#FFFFFF";
    ctx.value.font = "bold 24px Microsoft YaHei";
    ctx.value.textAlign = "center";
    ctx.value.fillText(data.school, cardX + cardWidth / 2, cardY + 28);

    ctx.value.textAlign = "left";

    ctx.value.strokeStyle = "#1B4B8A";
    ctx.value.lineWidth = 1;
    ctx.value.strokeRect(cardX + 20, cardY + 60, 100, 140);

    if (data.photo) {
      const photo = await loadImage(URL.createObjectURL(data.photo));
      ctx.value.drawImage(photo, cardX + 20, cardY + 60, 100, 140);
    }

    ctx.value.fillStyle = "#333333";
    ctx.value.font = "16px Microsoft YaHei";

    const startX = cardX + 130;
    const startY = cardY + 60;
    const lineHeight = 30;

    for (let i = 0; i <= 5; i++) {
      ctx.value.beginPath();
      ctx.value.moveTo(startX, startY + i * lineHeight);
      ctx.value.lineTo(cardX + cardWidth - 20, startY + i * lineHeight);
      ctx.value.strokeStyle = "#1B4B8A";
      ctx.value.lineWidth = 0.5;
      ctx.value.stroke();
    }

    ctx.value.beginPath();
    ctx.value.moveTo(startX + 60, startY);
    ctx.value.lineTo(startX + 60, startY + 5 * lineHeight);
    ctx.value.stroke();

    const textStartX = startX + 10;
    ctx.value.fillStyle = "#333333";
    ctx.value.font = "14px Microsoft YaHei";

    ctx.value.fillText("姓名", textStartX, startY + lineHeight - 8);
    ctx.value.fillText("学号", textStartX, startY + lineHeight * 2 - 8);
    ctx.value.fillText("院系", textStartX, startY + lineHeight * 3 - 8);
    ctx.value.fillText("专业", textStartX, startY + lineHeight * 4 - 8);
    ctx.value.fillText("有效期", textStartX, startY + lineHeight * 5 - 8);

    ctx.value.font = "bold 14px Microsoft YaHei";
    ctx.value.fillText(data.name, startX + 70, startY + lineHeight - 8);
    ctx.value.fillText(data.studentId, startX + 70, startY + lineHeight * 2 - 8);
    ctx.value.fillText(data.department, startX + 70, startY + lineHeight * 3 - 8);
    ctx.value.fillText(data.major, startX + 70, startY + lineHeight * 4 - 8);
    ctx.value.fillText(data.validDate, startX + 70, startY + lineHeight * 5 - 8);

    if (logoImage.value) {
      const logoSize = 50;
      ctx.value.globalAlpha = 0.7;
      ctx.value.drawImage(logoImage.value, cardX + cardWidth - logoSize - 10, cardY + 10, logoSize, logoSize);
      ctx.value.globalAlpha = 1.0;
    }

    applyVintageEffect(ctx.value, cardX, cardY, cardWidth, cardHeight);

    downloadBtn.value.style.display = "inline-block";
  } catch (error) {
    console.error("生成学生证失败:", error);
    alert("生成学生证失败，请检查输入数据和图片路径");
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = e => {
      console.error("图片加载失败:", src, e);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function applyVintageEffect(ctx, x, y, width, height) {
  ctx.fillStyle = "rgba(255, 235, 205, 0.1)";
  ctx.fillRect(x, y, width, height);

  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() - 0.5;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, x, y);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]);
}
function downloadImage() {
  const link = document.createElement("a");
  link.href = canvas.value.toDataURL();
  link.download = "student_card.png";
  link.click();
}
</script>

<template>
  <h1 class="text-2xl font-bold text-center my-4">学生证照片生成器</h1>
  <p class="text-center mb-6">请填写以下信息以生成您的学生证照片。</p>
  <div class="flex justify-between gap-4 mt-4">
    <div class="w-1/2 p-4 bg-white rounded-lg">
      <form id="studentForm" class="space-y-4">
        <div class="flex flex-col">
          <label for="name" class="font-semibold mb-1">姓名：</label>
          <input type="text" id="name" value="张三" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="studentId" class="font-semibold mb-1">学号：</label>
          <input type="text" id="studentId" value="20230001" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="school" class="font-semibold mb-1">学校名称：</label>
          <input type="text" id="school" value="清华大学" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="department" class="font-semibold mb-1">院系：</label>
          <input type="text" id="department" value="计算机系" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="major" class="font-semibold mb-1">专业：</label>
          <input type="text" id="major" value="软件工程" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="validDate" class="font-semibold mb-1">有效期：</label>
          <input type="date" id="validDate" value="2024-12-31" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="photo" class="font-semibold mb-1">上传照片：</label>
          <input type="file" id="photo" accept="image/*" required class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="logoUpload" class="font-semibold mb-1">上传校徽:</label>
          <input type="file" id="logoUpload" accept="image/*" class="p-2 border border-gray-300 rounded" />
        </div>
        <div class="flex flex-col">
          <label for="background" class="font-semibold mb-1">选择背景：</label>
          <select id="background" class="p-2 border border-gray-300 rounded">
            <option value="desk1" selected>木质桌面</option>
            <option value="desk2">大理石桌面</option>
            <option value="desk3">白色桌面</option>
            <option value="desk4">木质桌面（深色）</option>
          </select>
        </div>
      </form>
    </div>
    <div class="w-1/2 p-4 bg-white rounded-lg text-center">
      <canvas id="previewCanvas" class="w-full border border-gray-300 rounded mb-4"></canvas>
      <button id="downloadBtn" style="display: none" class="bg-green-500 text-white py-2 px-4 rounded" @click="downloadImage">下载照片</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
}

.form-container {
  width: 45%;
}

.preview-container {
  width: 45%;
}

.input-group {
  margin-bottom: 1em;
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5em;
  font-weight: bold;
}

.input-group input,
.input-group select {
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.preview-container {
  margin-top: 2em;
  text-align: center;
}

.preview-container canvas {
  max-width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-container button {
  margin-top: 1em;
  padding: 0.5em 1em;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preview-container button:hover {
  background-color: #45a049;
}
</style>
