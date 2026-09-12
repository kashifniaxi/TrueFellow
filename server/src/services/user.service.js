import User from '../models/User.model.js';
import OrganizerProfile from '../models/OrganizerProfile.model.js';
import { createNotification } from './notification.service.js';
import { NotFoundError, ConflictError, BusinessRuleError } from '../utils/errors.js';

// ─── Get any user by ID (admin) ──────────────────────────────────────────────

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User');
  return user;
};

// ─── Apply for Organizer ─────────────────────────────────────────────────────

export const applyForOrganizer = async (userId, input) => {
  // Block if there's already a PENDING or APPROVED application
  const active = await OrganizerProfile.findOne({
    user: userId,
    status: { $in: ['PENDING', 'APPROVED'] },
  });
  if (active) {
    if (active.status === 'APPROVED') throw new ConflictError('Your organizer account is already approved.');
    throw new ConflictError('You already have a pending application under review.');
  }

  const profile = await OrganizerProfile.create({ user: userId, ...input });
  return profile.populate('user');
};

// ─── Approve Organizer ───────────────────────────────────────────────────────

export const approveOrganizer = async (adminId, userId) => {
  const profile = await OrganizerProfile.findOne({ user: userId, status: 'PENDING' });
  if (!profile) throw new NotFoundError('Pending organizer application');

  profile.status = 'APPROVED';
  profile.isApproved = true;
  profile.reviewedBy = adminId;
  profile.reviewedAt = new Date();
  await profile.save();

  await User.findByIdAndUpdate(userId, { role: 'ORGANIZER', isVerified: true });

  await createNotification(userId, {
    type: 'ORGANIZER_APPROVED',
    title: 'Application Approved!',
    message: 'Congratulations! Your organizer application has been approved. You can now create tours.',
  });

  return profile.populate('user');
};

// ─── Reject Organizer ────────────────────────────────────────────────────────

export const rejectOrganizer = async (adminId, userId, rejectionReason) => {
  const profile = await OrganizerProfile.findOne({ user: userId, status: 'PENDING' });
  if (!profile) throw new NotFoundError('Pending organizer application');

  profile.status = 'REJECTED';
  profile.reviewedBy = adminId;
  profile.reviewedAt = new Date();
  profile.rejectionReason = rejectionReason || 'Your application did not meet our requirements.';
  await profile.save();

  await createNotification(userId, {
    type: 'ORGANIZER_REJECTED',
    title: 'Application Not Approved',
    message: `Your organizer application was not approved. Reason: ${profile.rejectionReason}. You may re-apply after addressing the feedback.`,
  });

  return profile.populate('user');
};

// ─── List Pending Applications (admin) ──────────────────────────────────────

export const listPendingApplications = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [profiles, total] = await Promise.all([
    OrganizerProfile.find({ status: 'PENDING' })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('user'),
    OrganizerProfile.countDocuments({ status: 'PENDING' }),
  ]);
  return { profiles, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Suspend User (admin) ────────────────────────────────────────────────────

export const suspendUser = async (adminId, userId, reason) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');
  if (user.role === 'ADMIN') throw new BusinessRuleError('Cannot suspend an admin account.');

  user.isActive = false;
  await user.save();

  if (user.role === 'ORGANIZER') {
    await OrganizerProfile.findOneAndUpdate(
      { user: userId, status: 'APPROVED' },
      { status: 'SUSPENDED', suspendedAt: new Date(), suspendReason: reason }
    );
  }

  await createNotification(userId, {
    type: 'ORGANIZER_SUSPENDED',
    title: 'Account Suspended',
    message: `Your account has been suspended. Reason: ${reason}. Please contact support.`,
  });

  return user;
};

// ─── Activate User (admin) ───────────────────────────────────────────────────

export const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
  if (!user) throw new NotFoundError('User');
  return user;
};

// ─── List All Users (admin) ──────────────────────────────────────────────────

export const listAllUsers = async ({ page = 1, limit = 20, role, isActive } = {}) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total, page, totalPages: Math.ceil(total / limit) };
};
