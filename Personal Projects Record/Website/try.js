const backgroundImages = document.querySelectorAll('.opening-image img');
const lines = document.querySelectorAll('.opening-line');

lines.forEach((line, index) => {
  line.addEventListener('mouseover', () => {
    // Increase the size of the hovered line
    line.style.fontSize = '72px';

    // Set the opacity of the corresponding background image to 1 (show it)
    backgroundImages[index].style.opacity = 1;

    // Reduce the size of the other lines
    lines.forEach((otherLine, otherIndex) => {
      if (otherIndex !== index) {
        otherLine.style.fontSize = '36px';

        // Hide other background images
        backgroundImages[otherIndex].style.opacity = 0;
      }
    });
  });
});
