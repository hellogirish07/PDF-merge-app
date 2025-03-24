const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");
const mergeBtn = document.getElementById("merge-btn");
const statusMsg = document.getElementById("status");
const themeToggle = document.getElementById("theme-toggle");
const mainContainer = document.getElementById("main-container");
let pdfFiles = [];

dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("border-blue-400");
});
dropArea.addEventListener("dragleave", () =>
  dropArea.classList.remove("border-blue-400")
);
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("border-blue-400");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(files) {
  fileList.innerHTML = "";
  pdfFiles = [];
  for (let file of files) {
    if (file.type === "application/pdf") {
      pdfFiles.push(file);
      const listItem = document.createElement("li");
      listItem.textContent = file.name;
      listItem.classList.add(
        "p-2",
        "rounded",
        "mt-2",
        "transition-colors",
        "duration-300"
      );
      updateListItemTheme(listItem);
      fileList.appendChild(listItem);
    }
  }
}

function updateListItemTheme(listItem) {
  if (document.body.classList.contains("bg-gray-900")) {
    listItem.classList.add("bg-gray-700", "text-gray-200");
    listItem.classList.remove("bg-gray-300", "text-gray-800");
  } else {
    listItem.classList.add("bg-gray-300", "text-gray-800");
    listItem.classList.remove("bg-gray-700", "text-gray-200");
  }
}

mergeBtn.addEventListener("click", async () => {
  if (pdfFiles.length < 2) return alert("Select at least 2 PDFs!");
  statusMsg.textContent = "Merging PDFs...";

  const mergedPdf = await PDFLib.PDFDocument.create();
  for (let file of pdfFiles) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    await new Promise((resolve) => (reader.onload = () => resolve()));
    const pdf = await PDFLib.PDFDocument.load(reader.result);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "merged.pdf";
  downloadLink.textContent = "Download Merged PDF";
  downloadLink.classList.add(
    "block",
    "bg-green-600",
    "hover:bg-green-500",
    "text-white",
    "mt-4",
    "px-4",
    "py-2",
    "rounded-lg",
    "text-center",
    "transition"
  );
  statusMsg.textContent = "Merge Successful!";
  statusMsg.appendChild(downloadLink);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("bg-gray-900");
  document.body.classList.toggle("bg-gray-100");
  document.body.classList.toggle("text-gray-900");
  document.body.classList.toggle("text-gray-200");

  mainContainer.classList.toggle("bg-gray-800");
  mainContainer.classList.toggle("bg-white");
  mainContainer.classList.toggle("text-gray-200");
  mainContainer.classList.toggle("text-gray-900");

  themeToggle.classList.toggle("bg-gray-100");
  themeToggle.textContent = document.body.classList.contains("bg-gray-900")
    ? "🌙"
    : "🌞";

  document.querySelectorAll("#file-list li").forEach(updateListItemTheme);
});
