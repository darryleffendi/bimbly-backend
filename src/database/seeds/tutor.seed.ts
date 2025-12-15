import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { TutorProfile } from '../../modules/tutors/entities/tutor-profile.entity';

const SALT_ROUNDS = 10;

const tutorData = [
  {
    user: {
      email: 'budi.santoso@email.com',
      fullName: 'Budi Santoso, S.Pd',
      phoneNumber: '081234567001',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru matematika berpengalaman dengan pendekatan mengajar yang menyenangkan dan mudah dipahami. Spesialisasi dalam persiapan UTBK dan olimpiade matematika.',
      educationBackground: 'S1 Pendidikan Matematika - Universitas Negeri Jakarta',
      teachingExperienceYears: 8,
      specializations: ['UTBK', 'Olimpiade Matematika', 'Kurikulum Merdeka'],
      subjects: ['Matematika'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 150000,
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      averageRating: 4.9,
      totalReviews: 127,
      totalSessions: 450,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'siti.rahayu@email.com',
      fullName: 'Siti Rahayu, M.Sc',
      phoneNumber: '081234567002',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Lulusan ITB dengan passion mengajar fisika. Menggunakan eksperimen sederhana dan simulasi untuk membuat fisika lebih mudah dipahami.',
      educationBackground: 'S2 Fisika - Institut Teknologi Bandung',
      teachingExperienceYears: 5,
      specializations: ['Fisika Modern', 'Mekanika', 'Termodinamika'],
      subjects: ['Fisika', 'Matematika'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 175000,
      city: 'Bandung',
      province: 'Jawa Barat',
      averageRating: 4.8,
      totalReviews: 89,
      totalSessions: 312,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'ahmad.wijaya@email.com',
      fullName: 'Ahmad Wijaya',
      phoneNumber: '081234567003',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Tutor bahasa Inggris dengan sertifikasi TOEFL dan IELTS. Pengalaman mengajar di berbagai bimbingan belajar ternama.',
      educationBackground: 'S1 Sastra Inggris - Universitas Indonesia',
      teachingExperienceYears: 6,
      specializations: ['TOEFL', 'IELTS', 'Business English'],
      subjects: ['Bahasa Inggris'],
      gradeLevels: [7, 8, 9, 10, 11, 12],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 125000,
      city: 'Depok',
      province: 'Jawa Barat',
      averageRating: 4.7,
      totalReviews: 156,
      totalSessions: 520,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'dewi.lestari@email.com',
      fullName: 'Dewi Lestari, S.Si',
      phoneNumber: '081234567004',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Pecinta kimia yang ingin menularkan kecintaannya kepada siswa. Pendekatan belajar dengan eksperimen virtual dan praktikum sederhana.',
      educationBackground: 'S1 Kimia - Universitas Gadjah Mada',
      teachingExperienceYears: 4,
      specializations: ['Kimia Organik', 'Kimia Anorganik', 'Stoikiometri'],
      subjects: ['Kimia'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 140000,
      city: 'Yogyakarta',
      province: 'Yogyakarta',
      averageRating: 4.6,
      totalReviews: 72,
      totalSessions: 198,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'rudi.hermawan@email.com',
      fullName: 'Rudi Hermawan, S.Kom',
      phoneNumber: '081234567005',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Software engineer yang juga passionate dalam mengajar programming. Mengajar dengan project-based learning.',
      educationBackground: 'S1 Teknik Informatika - Universitas Bina Nusantara',
      teachingExperienceYears: 3,
      specializations: ['Python', 'Web Development', 'Algoritma'],
      subjects: ['Informatika'],
      gradeLevels: [7, 8, 9, 10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 200000,
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      averageRating: 4.9,
      totalReviews: 45,
      totalSessions: 180,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'maya.putri@email.com',
      fullName: 'Maya Putri Andini',
      phoneNumber: '081234567006',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru biologi dengan keahlian dalam biologi molekuler. Suka mengajar dengan analogi dan visualisasi yang menarik.',
      educationBackground: 'S1 Biologi - Institut Pertanian Bogor',
      teachingExperienceYears: 5,
      specializations: ['Biologi Sel', 'Genetika', 'Ekologi'],
      subjects: ['Biologi', 'IPA'],
      gradeLevels: [7, 8, 9, 10, 11, 12],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 130000,
      city: 'Bogor',
      province: 'Jawa Barat',
      averageRating: 4.5,
      totalReviews: 98,
      totalSessions: 340,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'eko.prasetyo@email.com',
      fullName: 'Eko Prasetyo, S.E',
      phoneNumber: '081234567007',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Ahli ekonomi dengan pengalaman kerja di perbankan. Mengajar ekonomi dengan studi kasus nyata dari dunia bisnis.',
      educationBackground: 'S1 Ekonomi - Universitas Airlangga',
      teachingExperienceYears: 7,
      specializations: ['Ekonomi Makro', 'Ekonomi Mikro', 'Akuntansi Dasar'],
      subjects: ['Ekonomi'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['offline'] as ('online' | 'offline')[],
      hourlyRate: 145000,
      city: 'Surabaya',
      province: 'Jawa Timur',
      averageRating: 4.7,
      totalReviews: 83,
      totalSessions: 290,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'lisa.wulandari@email.com',
      fullName: 'Lisa Wulandari, S.Pd',
      phoneNumber: '081234567008',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru bahasa Indonesia dengan spesialisasi sastra dan penulisan kreatif. Membantu siswa menulis esai yang berkualitas.',
      educationBackground: 'S1 Pendidikan Bahasa Indonesia - Universitas Negeri Malang',
      teachingExperienceYears: 9,
      specializations: ['Sastra Indonesia', 'Penulisan Kreatif', 'Tata Bahasa'],
      subjects: ['Bahasa Indonesia'],
      gradeLevels: [7, 8, 9, 10, 11, 12],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 100000,
      city: 'Malang',
      province: 'Jawa Timur',
      averageRating: 4.8,
      totalReviews: 134,
      totalSessions: 478,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'hendra.kusuma@email.com',
      fullName: 'Hendra Kusuma, S.Pd',
      phoneNumber: '081234567009',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru geografi dengan keahlian dalam GIS dan kartografi. Mengajar dengan peta interaktif dan data real-time.',
      educationBackground: 'S1 Pendidikan Geografi - Universitas Pendidikan Indonesia',
      teachingExperienceYears: 6,
      specializations: ['GIS', 'Geografi Fisik', 'Geografi Sosial'],
      subjects: ['Geografi'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 120000,
      city: 'Bandung',
      province: 'Jawa Barat',
      averageRating: 4.4,
      totalReviews: 56,
      totalSessions: 167,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'rina.susanti@email.com',
      fullName: 'Rina Susanti',
      phoneNumber: '081234567010',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru sejarah dengan passion untuk sejarah Indonesia dan dunia. Mengajar dengan storytelling yang menarik.',
      educationBackground: 'S1 Sejarah - Universitas Indonesia',
      teachingExperienceYears: 8,
      specializations: ['Sejarah Indonesia', 'Sejarah Dunia', 'Sejarah Asia Tenggara'],
      subjects: ['Sejarah'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 110000,
      city: 'Jakarta Timur',
      province: 'DKI Jakarta',
      averageRating: 4.6,
      totalReviews: 91,
      totalSessions: 312,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'david.chen@email.com',
      fullName: 'David Chen',
      phoneNumber: '081234567011',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Tutor matematika dan fisika untuk level SD-SMP. Sabar dan telaten dalam mengajar anak-anak.',
      educationBackground: 'S1 Teknik Elektro - Universitas Trisakti',
      teachingExperienceYears: 4,
      specializations: ['Matematika Dasar', 'Fisika Dasar'],
      subjects: ['Matematika', 'Fisika', 'IPA'],
      gradeLevels: [4, 5, 6, 7, 8, 9],
      teachingMethods: ['offline'] as ('online' | 'offline')[],
      hourlyRate: 85000,
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      averageRating: 4.8,
      totalReviews: 67,
      totalSessions: 234,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'anita.pratama@email.com',
      fullName: 'Anita Pratama, S.Pd',
      phoneNumber: '081234567012',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru PKN dengan pendekatan diskusi dan debat. Membantu siswa memahami nilai-nilai kewarganegaraan dengan cara yang menarik.',
      educationBackground: 'S1 Pendidikan Kewarganegaraan - Universitas Negeri Semarang',
      teachingExperienceYears: 5,
      specializations: ['Hukum Tata Negara', 'Pancasila', 'Demokrasi'],
      subjects: ['PKN'],
      gradeLevels: [7, 8, 9, 10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 95000,
      city: 'Semarang',
      province: 'Jawa Tengah',
      averageRating: 4.5,
      totalReviews: 42,
      totalSessions: 156,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'bambang.irawan@email.com',
      fullName: 'Bambang Irawan, M.Pd',
      phoneNumber: '081234567013',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Dosen dan tutor IPS dengan spesialisasi sosiologi dan antropologi. Pengalaman mengajar lebih dari 10 tahun.',
      educationBackground: 'S2 Pendidikan IPS - Universitas Negeri Yogyakarta',
      teachingExperienceYears: 12,
      specializations: ['Sosiologi', 'Antropologi', 'Ilmu Politik'],
      subjects: ['IPS'],
      gradeLevels: [7, 8, 9],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 135000,
      city: 'Yogyakarta',
      province: 'Yogyakarta',
      averageRating: 4.9,
      totalReviews: 178,
      totalSessions: 623,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'nina.kartika@email.com',
      fullName: 'Nina Kartika',
      phoneNumber: '081234567014',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Fresh graduate dengan nilai cumlaude. Semangat tinggi untuk berbagi ilmu matematika dengan pendekatan modern.',
      educationBackground: 'S1 Matematika - Institut Teknologi Sepuluh Nopember',
      teachingExperienceYears: 1,
      specializations: ['Aljabar', 'Kalkulus', 'Statistika'],
      subjects: ['Matematika'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 75000,
      city: 'Surabaya',
      province: 'Jawa Timur',
      averageRating: 4.3,
      totalReviews: 23,
      totalSessions: 67,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'tommy.gunawan@email.com',
      fullName: 'Tommy Gunawan, S.T',
      phoneNumber: '081234567015',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Insinyur mesin yang juga mengajar fisika dan matematika. Menggunakan aplikasi praktis dalam kehidupan sehari-hari.',
      educationBackground: 'S1 Teknik Mesin - Universitas Diponegoro',
      teachingExperienceYears: 3,
      specializations: ['Mekanika', 'Termodinamika Teknik', 'Matematika Teknik'],
      subjects: ['Fisika', 'Matematika'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['offline'] as ('online' | 'offline')[],
      hourlyRate: 160000,
      city: 'Semarang',
      province: 'Jawa Tengah',
      averageRating: 4.7,
      totalReviews: 38,
      totalSessions: 142,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'sarah.amelia@email.com',
      fullName: 'Sarah Amelia',
      phoneNumber: '081234567016',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Native-level English speaker dengan pengalaman tinggal di Australia. Fokus pada conversation dan pronunciation.',
      educationBackground: 'S1 Hubungan Internasional - Universitas Parahyangan',
      teachingExperienceYears: 4,
      specializations: ['Conversation', 'Pronunciation', 'Academic Writing'],
      subjects: ['Bahasa Inggris'],
      gradeLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 150000,
      city: 'Tangerang',
      province: 'Banten',
      averageRating: 4.8,
      totalReviews: 112,
      totalSessions: 389,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'agus.purnomo@email.com',
      fullName: 'Agus Purnomo, S.Si',
      phoneNumber: '081234567017',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Peneliti kimia dengan pengalaman lab yang extensive. Membantu siswa memahami reaksi kimia dengan visualisasi 3D.',
      educationBackground: 'S1 Kimia - Universitas Brawijaya',
      teachingExperienceYears: 6,
      specializations: ['Kimia Fisik', 'Biokimia', 'Kimia Analitik'],
      subjects: ['Kimia', 'Biologi'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 155000,
      city: 'Malang',
      province: 'Jawa Timur',
      averageRating: 4.6,
      totalReviews: 64,
      totalSessions: 213,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'winda.sari@email.com',
      fullName: 'Winda Sari',
      phoneNumber: '081234567018',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru SD dengan pendekatan fun learning. Spesialisasi mengajar anak-anak dengan metode bermain sambil belajar.',
      educationBackground: 'S1 Pendidikan Guru SD - Universitas Muhammadiyah Malang',
      teachingExperienceYears: 7,
      specializations: ['Calistung', 'Matematika SD', 'IPA SD'],
      subjects: ['Matematika', 'IPA', 'Bahasa Indonesia'],
      gradeLevels: [1, 2, 3, 4, 5, 6],
      teachingMethods: ['offline'] as ('online' | 'offline')[],
      hourlyRate: 70000,
      city: 'Bekasi',
      province: 'Jawa Barat',
      averageRating: 4.9,
      totalReviews: 145,
      totalSessions: 534,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'ferry.hidayat@email.com',
      fullName: 'Ferry Hidayat, M.T',
      phoneNumber: '081234567019',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Programmer profesional dengan 10+ tahun pengalaman. Mengajar programming dengan pendekatan industry-ready.',
      educationBackground: 'S2 Teknik Informatika - Institut Teknologi Bandung',
      teachingExperienceYears: 5,
      specializations: ['Python', 'Java', 'Data Science', 'Machine Learning'],
      subjects: ['Informatika'],
      gradeLevels: [10, 11, 12],
      teachingMethods: ['online'] as ('online' | 'offline')[],
      hourlyRate: 250000,
      city: 'Bandung',
      province: 'Jawa Barat',
      averageRating: 5.0,
      totalReviews: 34,
      totalSessions: 128,
      isApproved: true,
    },
  },
  {
    user: {
      email: 'putri.maharani@email.com',
      fullName: 'Putri Maharani, S.Pd',
      phoneNumber: '081234567020',
      profileImageUrl: null,
    },
    profile: {
      bio: 'Guru matematika dengan fokus pada siswa yang kesulitan. Sabar dan menggunakan berbagai metode hingga siswa paham.',
      educationBackground: 'S1 Pendidikan Matematika - Universitas Negeri Surabaya',
      teachingExperienceYears: 8,
      specializations: ['Remedial Teaching', 'Slow Learner Support', 'Fun Math'],
      subjects: ['Matematika'],
      gradeLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      teachingMethods: ['online', 'offline'] as ('online' | 'offline')[],
      hourlyRate: 90000,
      city: 'Surabaya',
      province: 'Jawa Timur',
      averageRating: 4.8,
      totalReviews: 167,
      totalSessions: 589,
      isApproved: true,
    },
  },
];

async function seed() {
  console.log('Initializing data source...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'bimbly_user',
    password: process.env.DB_PASSWORD || 'bimbly_password',
    database: process.env.DB_DATABASE || 'bimbly_db',
    entities: [User, TutorProfile],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Data source initialized!');

  const userRepository = dataSource.getRepository(User);
  const tutorRepository = dataSource.getRepository(TutorProfile);

  const defaultPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  console.log(`Seeding ${tutorData.length} tutors...`);

  for (const tutor of tutorData) {
    const existingUser = await userRepository.findOne({
      where: { email: tutor.user.email },
    });

    if (existingUser) {
      console.log(`Skipping ${tutor.user.email} - already exists`);
      continue;
    }

    const user = new User();
    user.email = tutor.user.email;
    user.passwordHash = defaultPassword;
    user.userType = 'tutor';
    user.fullName = tutor.user.fullName;
    user.phoneNumber = tutor.user.phoneNumber;
    user.profileImageUrl = tutor.user.profileImageUrl || undefined;

    const savedUser = await userRepository.save(user);

    const profile = tutorRepository.create({
      userId: savedUser.id,
      bio: tutor.profile.bio,
      educationBackground: tutor.profile.educationBackground,
      teachingExperienceYears: tutor.profile.teachingExperienceYears,
      specializations: tutor.profile.specializations,
      subjects: tutor.profile.subjects,
      gradeLevels: tutor.profile.gradeLevels,
      teachingMethods: tutor.profile.teachingMethods,
      hourlyRate: tutor.profile.hourlyRate,
      city: tutor.profile.city,
      province: tutor.profile.province,
      averageRating: tutor.profile.averageRating,
      totalReviews: tutor.profile.totalReviews,
      totalSessions: tutor.profile.totalSessions,
      isApproved: tutor.profile.isApproved,
    });

    await tutorRepository.save(profile);
    console.log(`Created tutor: ${tutor.user.fullName}`);
  }

  console.log('Seeding complete!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
