document.addEventListener("DOMContentLoaded", function () {
  // Attach event listener to the form submission
  document
    .getElementById("blogForm")
    .addEventListener("submit", function (event) {
      // Select form elements
      const excerpt = document.getElementById("excerpt");
      const excerptValue = excerpt.value.trim();
      const excerptFeedback = document.getElementById("excerptFeedback");

      // Calculate the word count
      const wordCount = excerptValue ? excerptValue.split(/\s+/).length : 0;

      // Initialize form validity
      let formIsValid = true;

      // Validate the excerpt (minimum 10 words)
      if (wordCount < 10) {
        // Prevent form submission
        formIsValid = false;
        excerpt.classList.add("is-invalid");
        excerptFeedback.style.display = "block";
      } else {
        // Valid excerpt case
        excerpt.classList.remove("is-invalid");
        excerptFeedback.style.display = "none";

        // No need to truncate `excerpt.value` for storage
        // Just ensure full text is stored in the database
      }

      // If the form is not valid, prevent submission
      if (!formIsValid) {
        event.preventDefault(); // Stop form submission
        event.stopPropagation(); // Stop further event propagation
      }

      // Add Bootstrap validation classes
      this.classList.add("was-validated");

      
    });
});


