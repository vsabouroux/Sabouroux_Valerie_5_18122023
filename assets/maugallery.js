(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    let currentCategory;
   
    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options, currentCategory); //la fonction listener "embarqueaussi la catégorie actuelle"

      $(this)
        .children(".gallery-item")
        //index déclarée mais jamais lue ??
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }
      //galerie en fondu qd se télécharge
      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  $.fn.mauGallery.listeners = function (options, currentCategory) {
    $(".gallery-item").on("click", function () {
      const clickedCategory = $(this).data("gallery-tag");

      if (clickedCategory && clickedCategory !== currentCategory) {
        currentCategory = clickedCategory;
        console.log("Current category: ", currentCategory);
        console.log("Clicked category: ", clickedCategory);

        currentImageIndex = 0;
        console.log("Current image index: ", currentImageIndex);
        // updateLightboxImage(); //Appel pour mettre à jour l'image dans la modale
      } else {
        if (options.lightBox && $(this).prop("tagName") === "IMG") {
          $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
        } else {
          return;
        }
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    /*ajout fonction pour l'écoute d'événements*/
    $(".gallery").on("click", ".mg-prev", function () {
      $.fn.mauGallery.methods.prevImage(options.lightboxId, currentCategory);
      /*contrôle*/
      console.log("Prev Image Clicked");
      console.log("Updated Image Source:", $(".lightboxImage").attr("src"));
    });
    $(".gallery").on("click", ".mg-next", function () {
      $.fn.mauGallery.methods.nextImage(options.lightboxId, currentCategory);
      /*contrôle*/
      console.log("Next Image Clicked");
      console.log("Updated Image Source:", $(".lightboxImage").attr("src"));
    });
    /*Définition de la couleur de fond du bouton cliqué*/
    $(".gallery").on("click", ".nav-link", function () {
      $(".nav-link").css("background-color", ""); // Réinitialiser la couleur de fond de tous les boutons
      $(this).css("background-color", "#847706"); // Définir la couleur de fond du bouton cliqué
    });
  };

  $.fn.mauGallery.methods = {
  
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = null;
      let imagesCollection = [];
      // Ajout de la variable currentImageIndex pour suivre l'index de l'image dans la modale
      // let currentImageIndex = 0;

      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
      
    },
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === currentCategory) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation,currentCategory) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
      /**Ajout logique d'ecoute evt click ds modale */
      if (navigation) {
        const lightbox = $(`#${lightboxId ? lightboxId : "galleryLightbox"}`);
       
        function updateLightboxImage() {
          let currentImageIndex = 0;
          const imgElement = lightbox.find(".lightboxImage");
          imgElement.attr(
            "src",
            categories[currentCategory][currentImageIndex]
          );
          $(".mg-prev").on("click", function () {
            currentImageIndex =
              (currentImageIndex - 1 + categories[currentCategory].length) %
              categories[currentCategory].length;
            updateLightboxImage();
          });
  
          $(".mg-next").on("click", function () {
            currentImageIndex =
              (currentImageIndex + 1) % categories[currentCategory].length;
            updateLightboxImage();
          });
      
        };
        updateLightboxImage;
      
        const concertsImages = [
          "./assets/images/gallery/concerts/aaron-paul-concert.webp",
          "./assets/images/gallery/concerts/austin-neill-concert.webp"
        ];

        const entrepriseImages =[
          "./assets/images/gallery/entreprise/businessman-by-ali-morshedlou.webp",
          "./assets/images/gallery/entreprise/jason-goodman-firm.webp",
          "./assets/images/gallery/entreprise/photo-by-mateus-campos-felipe.webp"
        ]

        const mariageImages =[
          "./assets/images/gallery/mariage/hannah-busing-wedding.webp",
          "./assets/images/gallery/mariage/wedding-photo-by-jakob-owens.webp"
        ]

        const portraitsImages=[
          "./assets/images/gallery/portraits/ade-tunji-portrait.webp",
          "./assets/images/gallery/portraits/woman-portrait-by-nino-van-prattenburg.webp"
        ]
      

        // Création catégories ici car images dans HTML
          const categories = {
            concerts: concertsImages,
            mariage: mariageImages,
            entreprise:entrepriseImages,
            portraits:portraitsImages
        };
      }
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    },
  };
})(jQuery);
