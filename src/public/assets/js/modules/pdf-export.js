'use strict';

/**
 * PdfExport
 * Génère un vrai fichier .pdf à partir d'un noeud DOM (typiquement
 * .pdf-page), via html2canvas + jsPDF — pour le téléchargement (download)
 * comme pour l'impression (print). Les deux réutilisent le même rendu
 * pixel-perfect capturé à la hauteur réelle du contenu : il n'y a donc ni
 * en-tête/pied de page ajoutés par le navigateur (date, titre, URL,
 * numéro de page), ni espace blanc résiduel dû à une hauteur de page
 * "cible" mal ajustée aux marges d'impression du navigateur.
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

       // Filet de sécurité : si l'appelant a oublié d'appeler fitToPage()
    // après avoir injecté le template (voir invoice-template.js), on le
    // fait ici avant la capture plutôt que de risquer une page mal ajustée.
    if (window.InvoiceTemplate && typeof InvoiceTemplate.fitToPage === 'function') {
      InvoiceTemplate.fitToPage(pageEl);
    }

    // `.pdf-page` porte un box-shadow (--shadow-xl) purement décoratif,
    // utile uniquement pour l'aperçu à l'écran (effet "feuille posée").
    // html2canvas l'interprète mal : comme windowWidth/windowHeight sont
    // calées sur scrollWidth/scrollHeight (qui ignorent le débordement
    // visuel de l'ombre), son rendu est tronqué/mal composé et laisse un
    // résidu carré bleuté sous le pied de page dans le PDF exporté. On la
    // neutralise donc juste le temps de la capture, puis on la restaure
    // immédiatement après (sans jamais l'enlever de l'aperçu visible par
    // l'utilisateur).
    const previousBoxShadow = pageEl.style.boxShadow;
    pageEl.style.boxShadow = 'none';

    let canvas;
    try {
      // Pas de useCORS ici : toutes les images de la facture (logo, produits)
      // sont soit des data URL base64, soit des fichiers du même site — donc
      // jamais besoin de CORS. Activer useCORS peut au contraire provoquer
      // un canvas "taché" (SecurityError) si le navigateur avait déjà mis
      // l'image en cache sans l'attribut crossorigin.
      canvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        windowWidth: pageEl.scrollWidth,
        windowHeight: pageEl.scrollHeight,
      });
    } finally {
      // Restauration systématique, même en cas d'erreur pendant la capture.
      pageEl.style.boxShadow = previousBoxShadow;
    }

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

 /**
   * Imprime le même rendu PDF que celui produit par download(), au lieu du
   * DOM live + CSS @media print. Comme le PDF est construit à la hauteur
   * RÉELLE du contenu (voir buildPdf), il n'y a plus de hauteur de page
   * "cible" à deviner ni de marges de navigateur à anticiper : l'espace
   * blanc résiduel en bas de page (compromis documenté dans le CSS
   * @media print) disparaît de fait, plutôt que d'être réduit.
   *
   * Technique : on ouvre le PDF généré dans une iframe invisible, puis on
   * appelle print() sur cette iframe une fois le PDF chargé — cela ouvre
   * la boîte de dialogue d'impression native du visualiseur PDF intégré
   * du navigateur (Chrome, Edge, Firefox). Aucun pop-up requis.
   *
   * Limite connue : sur un navigateur sans visualiseur PDF intégré
   * fonctionnel (rare), le print() de l'iframe peut ne rien déclencher.
   * L'appelant doit prévoir un repli sur window.print() dans ce cas.
   *
   * @param {HTMLElement} pageEl - noeud représentant une page A4 (.pdf-page)
   */
  function print(pageEl) {
    return buildPdf(pageEl).then(pdf => new Promise((resolve, reject) => {
      const blobUrl = pdf.output('bloburl');
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';

      let settled = false;
      const cleanup = () => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
      };
      // Filet de sécurité : si 'load' ne se déclenche jamais (blocage
      // silencieux constaté par le passé sur certains navigateurs), on
      // n'attend pas indéfiniment — on prévient l'appelant pour qu'il
      // puisse se rabattre sur window.print().
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Le visualiseur PDF n\'a pas répondu à temps.'));
      }, 4000);

      iframe.onload = () => {
        if (settled) return;
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          settled = true;
          clearTimeout(timeout);
          cleanup();
          reject(err);
          return;
        }
        settled = true;
        clearTimeout(timeout);
        resolve();
        // On laisse l'iframe en place quelques secondes : la retirer trop
        // tôt annule la boîte de dialogue d'impression sur certains
        // navigateurs (le document source disparaît sous elle).
        setTimeout(cleanup, 5000);
      };

      iframe.src = blobUrl;
      document.body.appendChild(iframe);
    }));
  }

  return { download, print, librariesReady };
})();
