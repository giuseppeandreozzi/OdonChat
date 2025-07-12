const photoUpload = document.getElementById('photo-upload');
const previewImage = document.getElementById('avatar');
const fileNameDisplay = document.getElementById('file-name-display');
const submitButton = document.getElementById('submit-button');

photoUpload.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        // Mostra l'anteprima dell'immagine
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Mostra il pulsante di submit aggiungendo la classe 'visible'
        submitButton.classList.add('visible');
    } else {
        submitButton.classList.remove('visible');
    }
});