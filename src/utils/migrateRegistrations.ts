import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Migration Script: Add missing mobile and batch numbers to existing registrations
 * 
 * This script:
 * 1. Fetches all registrations from Firestore
 * 2. For each registration, checks if mobile/batch are missing
 * 3. Fetches the user's current profile data
 * 4. Updates the registration with mobile and batch from the user profile
 * 
 * Run this from the Admin Dashboard by calling: migrateRegistrations()
 */
export async function migrateRegistrations(): Promise<{ success: number; failed: number; skipped: number }> {
    let success = 0;
    let failed = 0;
    let skipped = 0;

    try {
        console.log('🔄 Starting registration migration...');

        // Fetch all registrations
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        console.log(`📊 Found ${registrationsSnapshot.size} registrations`);

        for (const regDoc of registrationsSnapshot.docs) {
            const registration = regDoc.data();
            const needsUpdate = !registration.mobile || !registration.batch;

            if (!needsUpdate) {
                skipped++;
                continue;
            }

            try {
                // Fetch user profile to get mobile and batch
                const userDoc = await getDoc(doc(db, 'users', registration.userId));

                if (!userDoc.exists()) {
                    console.warn(`⚠️ User not found for registration ${regDoc.id}`);
                    failed++;
                    continue;
                }

                const userData = userDoc.data();
                const updates: any = {};

                if (!registration.mobile && userData.mobile) {
                    updates.mobile = userData.mobile;
                }

                if (!registration.batch && userData.batch) {
                    updates.batch = userData.batch;
                }

                // Only update if we have something to update
                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'registrations', regDoc.id), updates);
                    success++;
                    console.log(`✅ Updated registration ${regDoc.id} with:`, updates);
                } else {
                    skipped++;
                }

            } catch (error) {
                console.error(`❌ Failed to update registration ${regDoc.id}:`, error);
                failed++;
            }
        }

        console.log('✨ Migration complete!');
        console.log(`✅ Success: ${success}`);
        console.log(`⏭️ Skipped: ${skipped}`);
        console.log(`❌ Failed: ${failed}`);

        return { success, failed, skipped };

    } catch (error) {
        console.error('💥 Migration failed:', error);
        throw error;
    }
}
