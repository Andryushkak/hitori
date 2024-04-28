// camera.js
document.querySelector('.take-photo-button').addEventListener('click', function() {
  var first_name = document.querySelector('input[name="first_name"]').value;
  var last_name = document.querySelector('input[name="last_name"]').value;
  var popup = window.open(`popup.html?firstName=${first_name}&lastName=${last_name}`, 'popup', 'width=400,height=400');
});
