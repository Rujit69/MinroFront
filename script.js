const inputImg = document.getElementById("fileInput");
const imgView = document.getElementById("view");
const dropArea = document.getElementById("drop-area");
const view = document.getElementById("crop-view");
const dialog = document.getElementById("myDialog");
const cancelCrop = document.getElementById("cancel_crop");
const changeImg = document.getElementById("pick-another");
const upload = document.getElementById("submit");
const resultText = document.getElementById("result");
const resultDialog = document.getElementById("resultDialog");
const closeResultDialog = document.getElementById("closeResultDialog");

//! close the info dialog when clicking outside of it
const infoD = document.getElementById("infoDialogue");
infoD.addEventListener("click", (event) => {
  if (event.target === infoD) {
    infoD.close();
  }
});
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

closeResultDialog.addEventListener("click", () => {
  resultDialog.close();
});
let resize = null;
let currentFile = null; // Ensure this is defined

// Create a persistent <img> element for cropping
const img = document.createElement("img");
img.style.maxWidth = "100%";
img.style.display = "none";
img.id = "cropImage";

function loadImage(file) {
  currentFile = file;
  const imgLink = URL.createObjectURL(file);

  // Clear the view and show the image
  // Keep the input but hide the text/icon
  const input = imgView.querySelector("input");
  imgView.innerHTML = "";
  if (input) imgView.appendChild(input);

  imgView.style.backgroundImage = `url(${imgLink})`;
  imgView.style.backgroundSize = "contain";
  imgView.style.backgroundPosition = "center";
  imgView.style.backgroundRepeat = "no-repeat";

  img.src = imgLink;
  img.style.display = "block";
  document.getElementById("buttons").style.display = "flex"; // Changed to flex for new CSS
}

upload.addEventListener("click", async function () {
  document.getElementById("buttons").style.display = "none";
  if (!currentFile) {
    alert("Please select an image first!");
    return;
  }

  const client = await window.gradioClient.connect(
    "Rujit/ai_generated_face_detection"
  );

  const result = await client.predict("/predict", { image: currentFile });
  document.getElementById("buttons").style.display = "flex"; // Changed to flex
  let ress = result.data.toString();
  const label = ress.split(" ")[0];
  console.log(label);

  if (label === "real") {
    resultDialog.showModal();
    resultText.style.color = "#10b981"; // Green
    resultText.style.display = "block";
    resultText.textContent = ress;
  } else if (label === "fake") {
    resultDialog.showModal();
    resultText.style.color = "#ef4444"; // Red
    resultText.style.display = "block";
    resultText.textContent = ress;
  }

  console.log(result);
});

inputImg.addEventListener("change", function () {
  if (inputImg.files[0]) {
    loadImage(inputImg.files[0]);
  }
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  inputImg.files = event.dataTransfer.files;
  if (inputImg.files[0]) {
    loadImage(inputImg.files[0]);
  }
});

document.getElementById("crop").addEventListener("click", function () {
  dialog.showModal(); // better than .show()
  if (!resize) {
    resize = new Croppie(view, {
      viewport: { width: 100, height: 100 },
      boundary: { width: 300, height: 300 },
      showZoomer: true,
      enableResize: true,
      enableOrientation: true,
      mouseWheelZoom: "ctrl",
    });
  }
  resize.bind({ url: img.src });

  document
    .getElementById("confirm_crop")
    .addEventListener("click", function () {
      resize.result("blob").then(function (blob) {
        // do something with cropped blob
        loadImage(blob);
        dialog.close();
        resize.destroy();
        resize = null;
      });
    });
});

cancelCrop.addEventListener("click", function () {
  dialog.close();
  if (resize) {
    resize.destroy();
    resize = null;
  }
});

changeImg.addEventListener("click", (event) => {
  inputImg.click();
  // refreshes the page
});

/**
 * Background Animation: Star Network & Shooting Stars
 */
(function () {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let width, height;
  let stars = [];
  let shootingStars = [];

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.2; // Slow drift
      this.vy = (Math.random() - 0.5) * 0.2;
      this.size = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random();
      this.fadeDir = Math.random() > 0.5 ? 0.01 : -0.01;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Twinkle effect
      this.opacity += this.fadeDir;
      if (this.opacity > 1 || this.opacity < 0.3) {
        this.fadeDir *= -1;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = 0;
      this.len = Math.random() * 80 + 10;
      this.speed = Math.random() * 10 + 6;
      this.size = Math.random() * 1 + 0.1;
      // Shoot towards bottom-left or bottom-right randomly
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = this.speed;
      this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
      this.active = false;
    }

    update() {
      if (this.active) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > height || this.x < 0 || this.x > width) {
          this.active = false;
          this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
        }
      } else {
        if (new Date().getTime() > this.waitTime) {
          this.active = true;
          this.x = Math.random() * width;
          this.y = -50;
        }
      }
    }

    draw() {
      if (!this.active) return;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = this.size;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 5, this.y - this.vy * 5); // Trail
      ctx.stroke();
    }
  }

  function init() {
    resizeCanvas();
    stars = [];
    shootingStars = [];

    // Create background stars
    const starCount = Math.floor((width * height) / 6000);
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // Create a few shooting stars
    for (let i = 0; i < 3; i++) {
      shootingStars.push(new ShootingStar());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw background gradient (deep space)
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width
    );
    gradient.addColorStop(0, "rgba(15, 23, 42, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Update and draw stars
    stars.forEach((star) => {
      star.update();
      star.draw();
    });

    // Draw connections (Constellations)
    ctx.lineWidth = 0.5;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - dist / 100)})`;
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Update and draw shooting stars
    shootingStars.forEach((s) => {
      s.update();
      s.draw();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    init();
  });

  init();
  animate();
})();
