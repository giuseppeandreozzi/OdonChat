const photoUpload = document.getElementById('photo-upload');
const previewImage = document.getElementById('avatar');
const fileNameDisplay = document.getElementById('file-name-display');
const submitButton = document.getElementById('submit-button');

// Show image preview when the user select an image to upload for changing his avatar
photoUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        submitButton.classList.add('visible');
    } else {
        submitButton.classList.remove('visible');
    }
});