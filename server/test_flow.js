import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMyConversations } from './src/services/message.service.js';
import { getOrganizerDashboard } from './src/services/dashboard.service.js';
import User from './src/models/User.model.js';
import Message from './src/models/Message.model.js';
import Tour from './src/models/Tour.model.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Find a user to test getMyConversations
  const user = await User.findOne({ role: 'TOURIST' });
  if (user) {
    console.log(`Testing getMyConversations for user: ${user.email} (${user._id})`);
    try {
      const convs = await getMyConversations(user._id);
      console.log('getMyConversations output:', convs);
      if (convs.length > 0) {
        console.log('First conversation mapping fields:', Object.keys(convs[0]));
        console.log('Sender structure:', convs[0].sender);
        console.log('Recipient structure:', convs[0].recipient);
      } else {
        console.log('No conversations found for this user, which is fine.');
      }
    } catch (e) {
      console.error('Error running getMyConversations:', e);
    }
  } else {
    console.log('No tourist user found in database.');
  }

  // Find an organizer to test getOrganizerDashboard
  const organizer = await User.findOne({ role: 'ORGANIZER' });
  if (organizer) {
    console.log(`Testing getOrganizerDashboard for organizer: ${organizer.email} (${organizer._id})`);
    try {
      const dashboard = await getOrganizerDashboard(organizer._id);
      console.log('getOrganizerDashboard output keys:', Object.keys(dashboard));
      console.log('Dashboard activeToursCount:', dashboard.activeToursCount);
      console.log('Dashboard totalBookingsCount:', dashboard.totalBookingsCount);
    } catch (e) {
      console.error('Error running getOrganizerDashboard:', e);
    }
  } else {
    console.log('No organizer user found in database.');
  }

  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch(console.error);
