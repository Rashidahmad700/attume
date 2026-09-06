/**
 * Creates or promotes an admin account. The only way an admin comes into
 * existence — there is deliberately no admin signup endpoint.
 *
 *   npm run create-admin -- --email you@example.com --password 'strong pass' --name 'Your Name'
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/user.model.js';

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(`--${flag}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = arg('email')?.toLowerCase().trim();
  const password = arg('password');
  const name = arg('name') ?? 'attume admin';

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --email <email> --password <password> [--name <name>]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    existing.role = 'admin';
    existing.password = password; // re-hashed by the pre-save hook
    await existing.save();
    console.log(`[admin] promoted existing account and reset password: ${email}`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`[admin] created: ${email}`);
  }

  await disconnectDB();
  process.exit(0);
}

void main();
