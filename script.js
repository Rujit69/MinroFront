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

// Create a persistent <img> element for cropping
const img = document.createElement("img");
img.style.maxWidth = "100%";
img.style.display = "none";
img.id = "cropImage";

function loadImage(file) {
  currentFile = file;
  const imgLink = URL.createObjectURL(file);

  // Clear the view and show the image
  imgView.innerHTML = "";
  imgView.style.backgroundImage = `url(${imgLink})`;
  imgView.style.backgroundSize = "contain";
  imgView.style.backgroundPosition = "center";
  imgView.style.backgroundRepeat = "no-repeat";

  img.src = imgLink;
  img.style.display = "block";
  document.getElementById("buttons").style.display = "block";
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
  document.getElementById("buttons").style.display = "block";
  let ress = result.data.toString();
  const label = ress.split(" ")[0];
  console.log(label);

  if (label === "real") {
    resultDialog.showModal();
    resultText.style.color = "green";
    resultText.style.display = "block";
    resultText.textContent = ress;
  } else if (label === "fake") {
    resultDialog.showModal();
    resultText.style.color = "red";
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
