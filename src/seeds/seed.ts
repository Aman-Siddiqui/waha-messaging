import { AppDataSource } from '../db/typeorm.config';
import { Tenant } from '../entities/tenant.entity';
import { User, UserRole } from '../entities/user.entity';  // 👈 import UserRole enum
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  // Tenant check/create
  const tenantRepo = AppDataSource.getRepository(Tenant);
  let tenant = await tenantRepo.findOne({ where: { name: 'DemoTenant' } });
  if (!tenant) {
    tenant = tenantRepo.create({ name: 'DemoTenant' });
    tenant = await tenantRepo.save(tenant);
    console.log('✅ Tenant created:', tenant.name);
  } else {
    console.log('ℹ️ Tenant already exists:', tenant.name);
  }

  // User check/create
  const userRepo = AppDataSource.getRepository(User);
  let adminUser = await userRepo.findOne({ where: { email: 'admin@demo.com' } });
  if (!adminUser) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    adminUser = userRepo.create({
      tenant,  // 👈 relation assign instead of tenantId
      email: 'admin@demo.com',
      password_hash: hashed,
      role: UserRole.TENANT_ADMIN,  // 👈 use enum instead of string
    });
    await userRepo.save(adminUser);
    console.log('✅ Admin user created:', adminUser.email);
  } else {
    console.log('ℹ️ Admin user already exists:', adminUser.email);
  }

  await AppDataSource.destroy();
}

seed()
  .then(() => {
    console.log('🌱 Seeding completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
