import * as produitService from '../services/produits';
import { enregistrerImage, remplacerImage } from "../utils/images";

async function main() {
  console.log('\n========== 🧪 TESTS PRODUITS ==========\n');

  try {

    const image = await enregistrerImage(
    "/Users/oth/Documents/der Krieg/Facturation/rec/src/tests/images/laptop.jpeg"
);
    // 1️⃣ CREATE
    console.log('📝 1. Creating products...');
    await produitService.createProduit({
      nom: 'Laptop',
      description: 'High-performance laptop',
      image,
      prixUnitaire: 1200.00,
      reduction: 10,
    });

    const image2 = await enregistrerImage(
    "/Users/oth/Documents/der Krieg/Facturation/rec/src/tests/images/mouse.jpeg"
);

    await produitService.createProduit({
      nom: 'Mouse',
      description: 'Wireless mouse',
      image:image2,
      prixUnitaire: 25.50,
      reduction: 5,
    });
    const image3 = await enregistrerImage(
    "/Users/oth/Documents/der Krieg/Facturation/rec/src/tests/images/keyboard.jpeg"
);
    await produitService.createProduit({
      nom: 'Keyboard',
      description: 'Mechanical keyboard',
      image: image3,
      prixUnitaire: 150.00,
      reduction: 15,
    });



    // 2️⃣ READ ALL
    console.log('\n📖 2. Fetching all products...');
    const allProduits = await produitService.getAllProduits();
    console.log(`✅ Found ${allProduits.length} products`);
    allProduits.forEach(p => console.log(`   - ${p.nom}: $${p.prixUnitaire}`));



    // 3️⃣ READ BY ID
    console.log('\n🔍 3. Fetching product by ID (id=1)...');
    const produitById = await produitService.getProduitById(1);
    if (produitById) {
      console.log(`   - ID: ${produitById.id}`);
      console.log(`   - Name: ${produitById.nom}`);
      console.log(`   - Price: $${produitById.prixUnitaire}`);
    }

    // 4️⃣ READ BY NAME
    console.log('\n🔍 4. Fetching product by name ("Laptop")...');
    const produitByName = await produitService.getProduitByName('Laptop');
    if (produitByName) {
      console.log(`   - Found: ${produitByName.nom}`);
      console.log(`   - Description: ${produitByName.description}`);
    }

    // 5️⃣ UPDATE
    console.log('\n✏️ 5. Updating product (id=1)...');
    const updatedProduit = await produitService.getProduitById(1);
    const updatedImage = await remplacerImage(
    updatedProduit!.image,
    "/Users/oth/Documents/der Krieg/Facturation/rec/src/tests/images/laptop2.jpeg"
);

    await produitService.updateProduit(1, {
      prixUnitaire: 1100.00,
      reduction: 20,
      image:updatedImage,
    });
   
    if (updatedProduit) {
      console.log(`   - New price: $${updatedProduit.prixUnitaire}`);
      console.log(`   - New reduction: ${updatedProduit.reduction}%`);
      console.log(`   - New Image: ${updatedProduit.image}%`);
    }

    // 6️⃣ DELETE
    console.log('\n🗑️ 6. Deleting product (id=3)...');
    await produitService.deleteProduit(3);

    // 7️⃣ VERIFY
    console.log('\n✅ 7. Verifying deletion...');
  
    const finalProduits = await produitService.getAllProduits();
    console.log(`   - Remaining products: ${finalProduits.length}`);

    console.log('\n========== ✅ ALL TESTS COMPLETED ==========\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    // process.exit(1);
  }
}

main();
