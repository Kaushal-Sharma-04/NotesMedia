const cloudName = window.cloudName;
const uploadPreset = window.uploadPreset;

tinymce.init({
  selector: "#content",
  plugins: "image fullscreen",
  toolbar: "undo redo | link image | fullscreen",
  image_title: true,
  automatic_uploads: true,
  file_picker_types: "image",
  file_picker_callback: function (cb, value, meta) {
    var input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.onchange = function () {
      var file = this.files[0];
      var formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          cb(data.secure_url, { title: file.name });

          // Store the image URL in a hidden input field
          let imageUrlsInput = document.getElementById("imageUrls");
          imageUrlsInput.value += data.secure_url + ";";
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };
    input.click();
  },
});
