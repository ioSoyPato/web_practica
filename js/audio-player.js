// Initialize audio player on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeAudioPlayer();
});

function initializeAudioPlayer() {
  // Al pulsar el botón de play se reproduce el audio y se cambia el fondo del navbar
  document.getElementById('playButton').addEventListener('click', function(e) {
    e.preventDefault();
    const audio = document.getElementById('audioElement');
    audio.play();
    
    const navbar = document.getElementById('mainNavbar');
    navbar.style.backgroundImage = "url('images/gif1.gif')";
    navbar.style.backgroundSize = "cover";
    navbar.style.backgroundColor = "black";

    const all = document.getElementById('all');
    all.style.backgroundImage = "url('images/gif1.gif')";
    all.style.backgroundSize = "cover";
    all.style.backgroundColor = "black";

    const planes = document.getElementById('planes');
    planes.style.color = "white";
    planes.style.backgroundColor = "black";
  });
}
