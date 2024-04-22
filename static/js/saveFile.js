const fileInput = document.getElementById("pfPictureInput");

fileInput.addEventListener("change", validateFile());

function validateFile() {
    const fileInput = document.getElementById("pfPictureInput");
    const file = fileInput.files[0]; // Retrieve the selected file

    const fileError = document.getElementById("fileError");
    fileError.textContent = "";

    // Check if a file is selected
    if (!file) {
        return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
        fileError.textContent = "Please upload an image file.";
        fileInput.value = ""; // Clear the file input
        return;
    }

    // Check file size
    if (file.size > 2000) {
        fileError.textContent = "File size exceeds the allowed limit (2 KB).";
        fileInput.value = ""; // Clear the file input
        return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = function () {
        if (img.width > 200 || img.height > 200) {
            fileError.textContent = "Image dimensions should be 200x200 pixels or less.";
            fileInput.value = ""; // Clear the file input
            return;
        }
    };
    img.src = URL.createObjectURL(file);
}
