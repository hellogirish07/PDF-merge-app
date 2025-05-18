const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");
const mergeBtn = document.getElementById("merge-btn");
const statusMsg = document.getElementById("status");
let pdfFiles = [];

// File handling events
dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("border-blue-400", "scale-105");
});
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("border-blue-400", "scale-105");
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("border-blue-400", "scale-105");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(files) {
  fileList.innerHTML = "";
  pdfFiles = [];
  
  statusMsg.textContent = "Processing files...";
  statusMsg.classList.add("text-blue-400");
  
  let validFiles = Array.from(files).filter(file => file.type === "application/pdf");
  
  if (validFiles.length === 0) {
    statusMsg.textContent = "Please select PDF files only.";
    statusMsg.classList.remove("text-blue-400");
    statusMsg.classList.add("text-red-400");
    return;
  }

  validFiles.forEach((file) => {
    pdfFiles.push(file);
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="flex items-center justify-between p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
        <div class="flex items-center space-x-3">
          <span class="text-blue-400">📄</span>
          <span class="text-gray-200">${file.name}</span>
        </div>
        <span class="text-gray-400 text-sm">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    `;
    fileList.appendChild(listItem);
  });

  statusMsg.textContent = `${validFiles.length} PDF file(s) ready to merge`;
  statusMsg.classList.remove("text-blue-400", "text-red-400");
  statusMsg.classList.add("text-green-400");
  mergeBtn.classList.remove("opacity-50", "cursor-not-allowed");
}

mergeBtn.addEventListener("click", async () => {
  if (pdfFiles.length < 2) {
    statusMsg.textContent = "Please select at least 2 PDFs to merge";
    statusMsg.classList.remove("text-green-400");
    statusMsg.classList.add("text-red-400");
    return;
  }

  mergeBtn.disabled = true;
  mergeBtn.classList.add("opacity-50", "cursor-not-allowed");
  statusMsg.textContent = "Merging PDFs...";
  statusMsg.classList.remove("text-green-400", "text-red-400");
  statusMsg.classList.add("text-blue-400");

  try {
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
    downloadLink.innerHTML = `
      <div class="flex items-center justify-center space-x-2">
        <span>📥</span>
        <span>Download Merged PDF</span>
      </div>
    `;
    downloadLink.classList.add(
      "block",
      "bg-gradient-to-r",
      "from-green-500",
      "to-green-600",
      "hover:from-green-600",
      "hover:to-green-700",
      "text-white",
      "mt-4",
      "px-6",
      "py-3",
      "rounded-lg",
      "text-center",
      "transition-all",
      "duration-300",
      "transform",
      "hover:scale-105",
      "shadow-lg"
    );

    statusMsg.innerHTML = `
      <div class="flex flex-col items-center space-y-2">
        <span class="text-green-400">✅ Merge Successful!</span>
      </div>
    `;
    statusMsg.appendChild(downloadLink);
    mergeBtn.disabled = false;
    mergeBtn.classList.remove("opacity-50", "cursor-not-allowed");

  } catch (error) {
    statusMsg.textContent = "Error merging PDFs. Please try again.";
    statusMsg.classList.remove("text-blue-400", "text-green-400");
    statusMsg.classList.add("text-red-400");
    mergeBtn.disabled = false;
    mergeBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
});

// Navigation and UI handling
document.addEventListener('DOMContentLoaded', function () {
  const tryNowButton = document.querySelector('a[href="#main-container"]');
  const mainContainer = document.getElementById('main-container');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');

  tryNowButton.addEventListener('click', function (e) {
    e.preventDefault();
    mainContainer.classList.add('show');
    mainContainer.scrollIntoView({ behavior: 'smooth' });
  });

  hamburger.addEventListener('click', function () {
    this.classList.toggle('active');
    mobileMenu.classList.toggle('show');
  });

  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('show');
    });
  });

  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('show');
    }
  });
});
