document.addEventListener("DOMContentLoaded", function () {
  const enterButton = document.getElementById("enter-button");
  const specialImagesContainer = document.getElementById(
    "special-images-container"
  );
  let canClick = false; // Initialiser l'état de clic à false

  // Créer et insérer le popup dans le HTML
  const popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");

  popupContainer.innerHTML = `
    <div class="popup-content">
      <div class="popup-carousel">
        <span class="arrow arrow-left">&#8249;</span>
        <img id="carousel-image" src="" alt="">
        <span class="arrow arrow-right">&#8250;</span>
      </div>
      <div class="popup-text">
        <h2 id="popup-title"></h2>
        <p id="popup-description">Description du projet.</p>
      </div>
      <span class="popup-close">&times;</span>
    </div>
  `;
  document.body.appendChild(popupContainer);

  // Variables pour le carrousel
  let currentImageIndex = 0;
  let carouselImages = [];

  const carouselImageElement = document.getElementById("carousel-image");
  const popupTitleElement = document.getElementById("popup-title");
  const popupDescriptionElement = document.getElementById("popup-description");

  const arrowLeft = document.querySelector(".arrow-left");
  const arrowRight = document.querySelector(".arrow-right");
  const popupClose = document.querySelector(".popup-close");

  // Fermer le popup
  popupClose.addEventListener("click", function () {
    popupContainer.classList.remove("active");
  });

  // Fonction pour mettre à jour l'image du carrousel
  function updateCarousel() {
    carouselImageElement.src = carouselImages[currentImageIndex];
  }

  // Naviguer dans le carrousel
  arrowLeft.addEventListener("click", function () {
    currentImageIndex =
      (currentImageIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarousel();
  });

  arrowRight.addEventListener("click", function () {
    currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
    updateCarousel();
  });

  // Charger les images avec une position initiale au centre et rotation 0
  function loadInitialImages() {
    fetch("data.json")
      .then((response) => response.json())
      .then((data) => {
        const images = data.specialImages;

        images.forEach((image, index) => {
          const imageDiv = document.createElement("div");
          imageDiv.classList.add("special-image");

          const imgElement = new Image();
          imgElement.src = image.image;
          imgElement.alt = image.name;
          imgElement.style.width = image.size.width;
          imgElement.style.height = image.size.height;

          // Appliquer la taille normale pour Special 0 et Special 1, et 50% pour les autres
          if (index === 0 || index === 1) {
            imgElement.style.width = image.size.width;
            imgElement.style.height = image.size.height;
          } else {
            imgElement.style.width = `calc(${image.size.width} / 2)`; // 50% de la taille initiale
            imgElement.style.height = `calc(${image.size.height} / 2)`; // 50% de la taille initiale
          }

          // Ajouter une ombre si nécessaire
          if (image.shadow.applyTo === "content") {
            imgElement.setAttribute("data-shadow", "content");
          } else if (image.shadow.applyTo === "all") {
            imgElement.setAttribute("data-shadow", "all");
          }

          // Placer l'image au centre avec une rotation initiale à 0
          imageDiv.style.transform = "translate(-50%, -50%) rotate(0deg)";

          // Appliquer un z-index élevé pour Special 0 et Special 1
          if (index === 0 || index === 1) {
            imageDiv.style.zIndex = 1000; // Un z-index très élevé
          }

          // Masquer les images qui ne sont pas Special 0 ou Special 1
          if (index > 1) {
            imageDiv.style.display = "none";
          }

          // Rendre l'image cliquable, mais seulement après avoir cliqué sur "Entrer"
          imgElement.addEventListener("click", function () {
            if (canClick) {
              console.log(image.name); // Loguer le nom de l'image au clic

              // Afficher le popup avec les informations
              popupTitleElement.textContent = image.name;
              carouselImages = [image.image]; // Vous pouvez ajouter plus d'images ici si nécessaire
              currentImageIndex = 0;
              updateCarousel();
              popupContainer.classList.add("active");
            }
          });

          // Ajouter l'image à son conteneur
          imageDiv.appendChild(imgElement);
          specialImagesContainer.appendChild(imageDiv);
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des données JSON:", error)
      );
  }

  // Fonction pour déplacer les images vers leurs positions finales
  function moveImagesToFinalPosition() {
    const images = document.querySelectorAll(".special-image");

    fetch("data.json")
      .then((response) => response.json())
      .then((data) => {
        const positions = data.specialImages;

        images.forEach((imageDiv, index) => {
          const finalPosition = positions[index];
          const imgElement = imageDiv.querySelector("img");

          // Appliquer les positions, la rotation, et la taille finales après l'animation
          imageDiv.style.top = finalPosition.position.top;
          imageDiv.style.left = finalPosition.position.left;
          imageDiv.style.transform = `rotate(${finalPosition.position.rotation})`;

          // Restaurer la taille normale pour les images autres que Special 0 et Special 1
          if (index > 1) {
            imgElement.style.width = finalPosition.size.width;
            imgElement.style.height = finalPosition.size.height;
          }

          // Appliquer le z-index final pour Special 0 et Special 1
          if (index !== 0 && index !== 1) {
            imageDiv.style.zIndex = finalPosition.position.zIndex;
          }
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des données JSON:", error)
      );
  }

  // Fonction pour rendre toutes les images visibles au centre
  function showAllImagesAtCenter() {
    const images = document.querySelectorAll(".special-image");

    images.forEach((imageDiv, index) => {
      imageDiv.style.display = "block"; // Rendre visible toutes les images
      // Assurer que les images sont au centre avant d'être dispatchées
      imageDiv.style.top = "50%";
      imageDiv.style.left = "50%";
      imageDiv.style.transform = "translate(-50%, -50%) rotate(0deg)";
    });
  }

  // Charger les images au centre au chargement de la page
  loadInitialImages();

  // Écouter le clic sur le bouton "Entrer"
  enterButton.addEventListener("click", function () {
    document.body.classList.add("enter-active");
    canClick = true; // Activer le clic sur les images

    // Rendre toutes les images visibles au centre
    showAllImagesAtCenter();

    // Après un délai de 1 seconde, dispatcher les images vers leurs positions finales
    setTimeout(() => {
      moveImagesToFinalPosition();
    }, 50); // Délai de 1 seconde

    // Masquer le bouton après le clic
    enterButton.style.display = "none";
  });
});
