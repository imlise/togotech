'use strict';

/**
 * PdfExport
 * Génère un vrai fichier .pdf téléchargeable à partir d'un noeud DOM
 * (typiquement .pdf-page), via html2canvas + jsPDF.
 * Contrairement à window.print(), cette méthode ne passe jamais par la
 * boîte de dialogue d'impression du navigateur : il n'y a donc ni
 * en-tête/pied de page ajoutés par le navigateur (date, titre, URL,
 * numéro de page), ni dépendance à un réglage utilisateur.
 */
window.PdfExport = (function () {

  function librariesReady() {
    return !!(window.html2canvas && window.jspdf && window.jspdf.jsPDF);
  }

  /**
   * Convertit un canvas en JPEG data URL, avec un message clair si le
   * canvas est "taché" (image dessinée en file:// ou domaine externe sans
   * CORS) plutôt que la SecurityError brute du navigateur.
   */
  function canvasToDataUrl(canvas) {
    try {
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (err) {
      if (err && err.name === 'SecurityError') {
        throw new Error('Impossible de générer le rendu : une image de la facture (logo, produit…) est chargée depuis un fichier local ou un site externe sans autorisation CORS. Ouvrez l\'application via un serveur (http://…) plutôt qu\'en fichier local, ou utilisez des images hébergées avec CORS activé.');
      }
      throw err;
    }
  }

  /**
   * Construit le jsPDF (mêmes pixels que l'aperçu en direct, capturés via
   * html2canvas) sans encore l'enregistrer ni l'ouvrir. Partagé par
   * download(). Le bouton "Imprimer" n'utilise plus ce module (voir plus bas).
   * @param {HTMLElement} pageEl - noeud représentant une page A4 (.pdf-page)
   */
  async function buildPdf(pageEl) {
    if (!pageEl) throw new Error('Élément de facture introuvable.');
    if (!librariesReady()) throw new Error('Bibliothèques PDF non chargées.');

    // Pas de useCORS ici : toutes les images de la facture (logo, produits)
    // sont soit des data URL base64, soit des fichiers du même site — donc
    // jamais besoin de CORS. Activer useCORS peut au contraire provoquer
    // un canvas "taché" (SecurityError) si le navigateur avait déjà mis
    // l'image en cache sans l'attribut crossorigin.
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      windowWidth: pageEl.scrollWidth,
      windowHeight: pageEl.scrollHeight,
    });

    const imgData = canvasToDataUrl(canvas);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Tolérance de 2mm : `scrollHeight` est toujours un nombre entier de
    // pixels, alors que 297mm ne correspond jamais à un nombre entier de
    // pixels exact (≈1122,52px à 96dpi). Cet écart d'arrondi, une fois
    // reconverti en mm, laissait un `heightLeft` résiduel de l'ordre de
    // 0,1 à 0,5mm après la 1re page — assez pour que `> 0` soit vrai et
    // qu'une 2e page quasi vide soit ajoutée pour rien. Une vraie page
    // supplémentaire (facture longue) dépasse toujours ce seuil très
    // largement, donc ce n'est jamais elle qui est masquée ici.
    while (heightLeft > 2) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  }

  /**
   * @param {HTMLElement} pageEl - noeud représentant une page A4 (.pdf-page)
   * @param {string} filename - nom du fichier, avec extension .pdf
   */
  async function download(pageEl, filename) {
    const pdf = await buildPdf(pageEl);
    pdf.save(filename);
  }

  // L'impression (bouton "Imprimer") n'utilise plus ce module : elle
  // appelle window.print() directement sur le DOM live, pris en charge
  // par le CSS @media print de chaque page. Ce module ne sert plus qu'au
  // vrai téléchargement de fichier .pdf (bouton "Télécharger PDF").

  return { download, librariesReady };
})();
