<script setup>
import { ref, onMounted } from "vue";
import ThreeScene from "./components/ThreeScene.vue";
import { useI18n } from "vue-i18n";
import { templates } from "./templates";

const { t, locale } = useI18n();

const form = ref(null);
const threeScene = ref(null);
const selectedTemplate = ref("classic");

const cardData = ref({
  name: "",
  studentId: "",
  school: "",
  department: "",
  major: "",
  validDate: "",
  photo: null,
  background: "desk1",
  logo: null,
  customBackground: null,
});

const backgrounds = {
  desk1: "./backgrounds/desk1.jpg",
  desk2: "./backgrounds/desk2.jpg",
  desk3: "./backgrounds/desk3.jpg",
  desk4: "./backgrounds/desk4.jpg",
};

onMounted(() => {
  form.value = document.getElementById("studentForm");
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach(input => {
    input.addEventListener("input", debounce(updateCardData, 300));
  });
  updateCardData();
});

async function updateCardData() {
  cardData.value = {
    name: document.getElementById("name").value,
    studentId: document.getElementById("studentId").value,
    school: document.getElementById("school").value,
    department: document.getElementById("department").value,
    major: document.getElementById("major").value,
    validDate: document.getElementById("validDate").value,
    photo: document.getElementById("photo").files[0],
    background: document.getElementById("background").value,
    logo: document.getElementById("logoUpload").files[0],
    customBackground: document.getElementById("backgroundUpload").files[0],
  };
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function downloadImage() {
  const imageData = threeScene.value?.captureScene();
  if (!imageData) {
    console.error("Failed to capture scene");
    return;
  }

  const link = document.createElement("a");
  link.href = imageData;
  link.download = "student_card.png";
  link.click();
}

function toggleLanguage() {
  locale.value = locale.value === "zh" ? "en" : "zh";
}
</script>

<template>
  <div class="flex justify-between items-center px-4 py-2 bg-gray-100">
    <h1 class="text-2xl font-bold">{{ t("title") }}</h1>
    <button @click="toggleLanguage" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {{ locale === "zh" ? "English" : "中文" }}
    </button>
  </div>
  <p class="text-center mb-6">{{ t("subtitle") }}</p>

  <div class="w-full mx-auto px-4">
    <div class="flex justify-between gap-8">
      <div class="w-300px bg-white p-6 rounded-lg shadow-md">
        <form id="studentForm" class="space-y-4">
          <div class="flex flex-col">
            <label for="template" class="font-semibold mb-1">{{ t("form.template") }}:</label>
            <select id="template" v-model="selectedTemplate" class="p-2 border border-gray-300 rounded">
              <option v-for="(template, id) in templates" :key="id" :value="id">
                {{ template.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="name" class="font-semibold mb-1">{{ t("form.name") }}：</label>
            <input type="text" id="name" value="张三" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="studentId" class="font-semibold mb-1">{{ t("form.studentId") }}：</label>
            <input type="text" id="studentId" value="20230001" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="school" class="font-semibold mb-1">{{ t("form.school") }}：</label>
            <input type="text" id="school" value="清华大学" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="department" class="font-semibold mb-1">{{ t("form.department") }}：</label>
            <input type="text" id="department" value="计算机系" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="major" class="font-semibold mb-1">{{ t("form.major") }}：</label>
            <input type="text" id="major" value="软件工程" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="validDate" class="font-semibold mb-1">{{ t("form.validDate") }}：</label>
            <input type="date" id="validDate" value="2024-12-31" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="photo" class="font-semibold mb-1">{{ t("form.photo") }}：</label>
            <input type="file" id="photo" accept="image/*" required class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="logoUpload" class="font-semibold mb-1">{{ t("form.logo") }}：</label>
            <input type="file" id="logoUpload" accept="image/*" class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <label for="background" class="font-semibold mb-1">{{ t("form.background") }}:</label>
            <select id="background" class="p-2 border border-gray-300 rounded">
              <option value="desk1" selected>{{ t("backgrounds.desk1") }}</option>
              <option value="desk2">{{ t("backgrounds.desk2") }}</option>
              <option value="desk3">{{ t("backgrounds.desk3") }}</option>
              <option value="desk4">{{ t("backgrounds.desk4") }}</option>
              <option value="custom">{{ t("backgrounds.custom") }}</option>
            </select>
            <input v-show="cardData.background === 'custom'" type="file" id="backgroundUpload" accept="image/*" class="p-2 border border-gray-300 rounded" />
          </div>
          <div class="flex flex-col">
            <button id="downloadBtn" @click="downloadImage" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{{ t("download") }}</button>
          </div>
        </form>
      </div>

      <div class="flex-1 bg-white p-6 rounded-lg shadow-md">
        <ThreeScene ref="threeScene" :cardData="cardData" :template="selectedTemplate" />
      </div>
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
