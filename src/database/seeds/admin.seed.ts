import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('Initializing data source...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'bimbly_user',
    password: process.env.DB_PASSWORD || 'bimbly_password',
    database: process.env.DB_DATABASE || 'bimbly_db',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Data source initialized!');

  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@gmail.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping...');
    await dataSource.destroy();
    return;
  }

  const adminPassword = await bcrypt.hash('admin', SALT_ROUNDS);

  const admin = new User();
  admin.email = 'admin@gmail.com';
  admin.passwordHash = adminPassword;
  admin.userType = 'admin';
  admin.fullName = 'Administrator';
  admin.phoneNumber = '000000000000';

  await userRepository.save(admin);
  console.log('Admin user created successfully!');
  console.log('Email: admin@gmail.com');
  console.log('Password: admin');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
