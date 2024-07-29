document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("blogForm")
    .addEventListener("submit", function (event) {
      const excerpt = document.getElementById("excerpt");
      const excerptValue = excerpt.value.trim();
      const excerptFeedback = document.getElementById("excerptFeedback");

      // Calculate word count
      const wordCount = excerptValue ? excerptValue.split(/\s+/).length : 0;

      console.log("Excerpt Value:", excerptValue); // Debug line
      console.log("Word Count:", wordCount); // Debug line

      // Validate the excerpt
      if (wordCount < 10) {
        event.preventDefault();
        excerpt.classList.add("is-invalid");
        excerptFeedback.style.display = "block";
      } else {
        excerpt.classList.remove("is-invalid");
        excerptFeedback.style.display = "none";

        // Truncate excerpt if more than 15 words
        if (wordCount > 11) {
          const words = excerptValue.split(/\s+/).slice(0, 11);
          excerpt.value = words.join(" ") + "...";
        }
      }

      // Validate the form
      if (!this.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      this.classList.add("was-validated");
    });
});
