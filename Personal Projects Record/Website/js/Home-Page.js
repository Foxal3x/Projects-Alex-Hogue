

function previewOpenFull_1() {
  document.getElementById("window-1").style.display = "block";
}

function previewCloseFull_1() {
  document.getElementById("window-1").style.display = "none";
}



function previewOpenFull_2() {
  document.getElementById("window-2").style.display = "block";
}

function previewCloseFull_2() {
  document.getElementById("window-2").style.display = "none";
}



function previewOpenFull_3() {
  document.getElementById("window-3").style.display = "block";
}

function previewCloseFull_3() {
  document.getElementById("window-3").style.display = "none";
}



function previewOpenFull_4() {
  document.getElementById("window-4").style.display = "block";
}

function previewCloseFull_4() {
  document.getElementById("window-4").style.display = "none";
}



function previewOpenFull_5() {
  document.getElementById("window-5").style.display = "block";
}

function previewCloseFull_5() {
  document.getElementById("window-5").style.display = "none";
}



function previewOpenFull_6() {
  document.getElementById("window-6").style.display = "block";
}

function previewCloseFull_6() {
  document.getElementById("window-6").style.display = "none";
}


function previewOpenFull_7() {
  document.getElementById("window-7").style.display = "block";
}

function previewCloseFull_7() {
  document.getElementById("window-7").style.display = "none";
}


function previewOpenFull_8() {
  document.getElementById("window-8").style.display = "block";
}

function previewCloseFull_8() {
  document.getElementById("window-8").style.display = "none";
}


function previewOpenFull_9() {
  document.getElementById("window-9").style.display = "block";
}

function previewCloseFull_9() {
  document.getElementById("window-9").style.display = "none";
}



document.getElementById('scrollLink').addEventListener('click', function(event) {
  event.preventDefault();
  
  const targetElement = document.querySelector(this.getAttribute('href'));
  targetElement.scrollIntoView({
    behavior: 'smooth'
  });
});

window.addEventListener('scroll', function() {
  var header = document.querySelector('.bottom');
  var joinprogram = document.querySelector('.join-program');
  var specificDiv = document.querySelector('.intro-page');
  var offset = 100;
  
  if (specificDiv && window.scrollY >= specificDiv.offsetTop+ offset) {
    header.classList.remove('hidden');
    joinprogram.classList.remove('hidden');
  } else {
    header.classList.add('hidden');
    joinprogram.classList.add('hidden');
  }
});

function joinOpenFull() {
  const imageUrl = 'Images/JOIN-PROJECT.jpg';
  const imageContainer = document.getElementById('join-program-image');
  imageContainer.innerHTML = `<img src="${imageUrl}" alt="Image" class="fullscreen-image">`;
}
function joinCloseFull() {
  window.location.href = 'https://createwithlimits.com/';
}