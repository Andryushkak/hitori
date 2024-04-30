document.querySelector('.take-photo-button').addEventListener('click', function() {
  var firstName = document.querySelector('input[name="first_name"]').value;
  var lastName = document.querySelector('input[name="last_name"]').value;
  var popup = window.open(`popup.html?firstName=${firstName}&lastName=${lastName}`, 'popup', 'width=400,height=400');
});