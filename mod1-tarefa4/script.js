const colorBox = document.getElementById("colorBox");
const moodText = document.getElementById("moodText");
const button = document.getElementById("changeColorBtn");

const moods = [
  { color: "#e63946", mood: "Apaixonado ❤️" },
  { color: "#457b9d", mood: "Calmo 🌊" },
  { color: "#2a9d8f", mood: "Equilibrado 🍃" },
  { color: "#f4a261", mood: "Criativo 🎨" },
  { color: "#e9c46a", mood: "Esperançoso ☀️" },
  { color: "#9b5de5", mood: "Sonhador 💭" },
  { color: "#ff6b6b", mood: "Vibrante 🔥" },
  { color: "#118ab2", mood: "Reflexivo 🌌" },
];

button.addEventListener("click", () => {
  const random = Math.floor(Math.random() * moods.length);
  const { color, mood } = moods[random];

  document.body.style.background = `linear-gradient(135deg, ${color}, #000)`;
  colorBox.style.backgroundColor = color;
  moodText.textContent = mood;
});
