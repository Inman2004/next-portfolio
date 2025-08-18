import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

// Initialize Firebase (you'll need to add your config)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateCommentUsernames() {
  try {
    console.log('Starting to update comment usernames...');
    
    // Get all comments
    const commentsRef = collection(db, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    
    console.log(`Found ${commentsSnapshot.size} comments`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();
      
      // Skip if comment already has a username
      if (commentData.username) {
        console.log(`Comment ${commentDoc.id} already has username: ${commentData.username}`);
        skippedCount++;
        continue;
      }
      
      // Get user data from users collection
      if (commentData.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', commentData.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const username = userData.username;
            
            if (username) {
              // Update the comment with the username
              await updateDoc(doc(db, 'comments', commentDoc.id), {
                username: username
              });
              console.log(`Updated comment ${commentDoc.id} with username: ${username}`);
              updatedCount++;
            } else {
              console.log(`User ${commentData.uid} has no username`);
              skippedCount++;
            }
          } else {
            console.log(`User ${commentData.uid} not found`);
            skippedCount++;
          }
        } catch (error) {
          console.error(`Error updating comment ${commentDoc.id}:`, error);
          skippedCount++;
        }
      } else {
        console.log(`Comment ${commentDoc.id} has no uid`);
        skippedCount++;
      }
    }
    
    console.log(`Update complete! Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    
  } catch (error) {
    console.error('Error updating comment usernames:', error);
  }
}

// Run the update
updateCommentUsernames();
