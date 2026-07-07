// src/tests/utilisateurTest.ts
import * as utilisateurService from '../services/utilisateurs';

async function main() {
  console.log('\n========== 🧪 TESTS UTILISATEURS ==========\n');

  try {
    // 1️⃣ CREATE
    console.log('📝 1. Creating users...');
    await utilisateurService.createUtilisateur({
      nomUtilisateur: 'admin123',
      email:'admin123@gmail.com',
      motDePasse: 'securepass123',
      role: 'admin',
    });

    await utilisateurService.createUtilisateur({
      nomUtilisateur: 'john_doe',
      email:'john_doe@gmail.com',
      motDePasse: 'password456',
      role: 'user',
    });

    await utilisateurService.createUtilisateur({
      nomUtilisateur: 'guest_user',
      email:'guest_user@gmail.com',
      motDePasse: 'guestpass789',
      role: 'user',
    });

    // 2️⃣ READ ALL
    console.log('\n📖 2. Fetching all users...');
    const allUtilisateurs = await utilisateurService.getAllUtilisateurs();
    console.log(`✅ Found ${allUtilisateurs.length} users`);
    allUtilisateurs.forEach(u => console.log(`   - ${u.nomUtilisateur} (${u.role})`));

    // 3️⃣ READ BY ID
    console.log('\n🔍 3. Fetching user by ID (id=1)...');
    const utilisateurById = await utilisateurService.getUtilisateurById(1);
    if (utilisateurById) {
      console.log(`   - ID: ${utilisateurById.id}`);
      console.log(`   - Username: ${utilisateurById.nomUtilisateur}`);
      console.log(`   - Role: ${utilisateurById.role}`);
    }

    // 4️⃣ READ BY NAME
    console.log('\n🔍 4. Fetching user by name ("admin123")...');
    const utilisateurByName = await utilisateurService.getUtilisateurByName('admin123');
    if (utilisateurByName) {
      console.log(`   - Found: ${utilisateurByName.nomUtilisateur}`);
      console.log(`   - Role: ${utilisateurByName.role}`);
    }

    // 5️⃣ UPDATE
    console.log('\n✏️ 5. Updating user (id=1)...');
    await utilisateurService.updateUtilisateur(1, {
      nomUtilisateur: 'admin_updated',
      role: 'admin',
    });
    const updatedUtilisateur = await utilisateurService.getUtilisateurById(1);
    if (updatedUtilisateur) {
      console.log(`   - New username: ${updatedUtilisateur.nomUtilisateur}`);
      console.log(`   - Role: ${updatedUtilisateur.role}`);
    }

    // 6️⃣ DELETE
    console.log('\n🗑️ 6. Deleting user (id=3)...');
    await utilisateurService.deleteUtilisateur(3);

    // 7️⃣ VERIFY
    console.log('\n✅ 7. Verifying deletion...');
    const finalUtilisateurs = await utilisateurService.getAllUtilisateurs();
    console.log(`   - Remaining users: ${finalUtilisateurs.length}`);

    console.log('\n========== ✅ ALL TESTS COMPLETED ==========\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    // process.exit(1);
  }
}

main();
