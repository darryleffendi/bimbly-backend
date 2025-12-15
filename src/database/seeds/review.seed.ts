import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { TutorProfile } from '../../modules/tutors/entities/tutor-profile.entity';
import { Review } from '../../modules/reviews/entities/review.entity';

const SALT_ROUNDS = 10;

const studentData = [
  { email: 'student.andi@email.com', fullName: 'Andi Pratama', phoneNumber: '081111111001' },
  { email: 'student.bella@email.com', fullName: 'Bella Safitri', phoneNumber: '081111111002' },
  { email: 'student.cahyo@email.com', fullName: 'Cahyo Nugroho', phoneNumber: '081111111003' },
  { email: 'student.diana@email.com', fullName: 'Diana Putri', phoneNumber: '081111111004' },
  { email: 'student.eka@email.com', fullName: 'Eka Wijaya', phoneNumber: '081111111005' },
  { email: 'student.faisal@email.com', fullName: 'Faisal Rahman', phoneNumber: '081111111006' },
  { email: 'student.gita@email.com', fullName: 'Gita Anjani', phoneNumber: '081111111007' },
  { email: 'student.hendra@email.com', fullName: 'Hendra Saputra', phoneNumber: '081111111008' },
  { email: 'student.indah@email.com', fullName: 'Indah Permata', phoneNumber: '081111111009' },
  { email: 'student.joko@email.com', fullName: 'Joko Susanto', phoneNumber: '081111111010' },
  { email: 'student.kiki@email.com', fullName: 'Kiki Amelia', phoneNumber: '081111111011' },
  { email: 'student.lukman@email.com', fullName: 'Lukman Hakim', phoneNumber: '081111111012' },
  { email: 'student.maya@email.com', fullName: 'Maya Sari', phoneNumber: '081111111013' },
  { email: 'student.nando@email.com', fullName: 'Nando Firmansyah', phoneNumber: '081111111014' },
  { email: 'student.olive@email.com', fullName: 'Olive Handayani', phoneNumber: '081111111015' },
  { email: 'student.putra@email.com', fullName: 'Putra Wibowo', phoneNumber: '081111111016' },
  { email: 'student.qori@email.com', fullName: 'Qori Rahmawati', phoneNumber: '081111111017' },
  { email: 'student.rendi@email.com', fullName: 'Rendi Kurniawan', phoneNumber: '081111111018' },
  { email: 'student.sinta@email.com', fullName: 'Sinta Dewi', phoneNumber: '081111111019' },
  { email: 'student.tomi@email.com', fullName: 'Tomi Hidayat', phoneNumber: '081111111020' },
  { email: 'student.umar@email.com', fullName: 'Umar Syarif', phoneNumber: '081111111021' },
  { email: 'student.vina@email.com', fullName: 'Vina Oktavia', phoneNumber: '081111111022' },
  { email: 'student.wawan@email.com', fullName: 'Wawan Setiawan', phoneNumber: '081111111023' },
  { email: 'student.xena@email.com', fullName: 'Xena Putri', phoneNumber: '081111111024' },
  { email: 'student.yusuf@email.com', fullName: 'Yusuf Abdullah', phoneNumber: '081111111025' },
];

const reviewTemplates = [
  {
    rating: 5,
    title: 'Transformed my understanding completely',
    text: 'Bimbly has made it possible for me to stay on top of my studies and make real progress quickly and easily. The tutor explains concepts in a way that just clicks.',
  },
  {
    rating: 5,
    title: 'Exceeded all my expectations',
    text: 'I was hesitant to try online tutoring at first, but I am so glad I did - it has exceeded all of my expectations. My grades improved significantly within weeks.',
  },
  {
    rating: 5,
    title: 'The most effective learning experience',
    text: 'This tutor stands out as the most patient and effective teacher I have ever had. Complex topics become simple and easy to understand.',
  },
  {
    rating: 5,
    title: 'Finally understand math!',
    text: 'After struggling for years, I finally understand the concepts. The tutor has a gift for breaking down difficult problems into manageable steps.',
  },
  {
    rating: 5,
    title: 'Best investment in my education',
    text: 'Professional, punctual, and incredibly effective. My test scores improved dramatically after just a few sessions. Worth every penny!',
  },
  {
    rating: 5,
    title: 'Patient and understanding',
    text: 'Even when I asked the same question multiple times, the tutor remained patient and found different ways to explain until I understood. No judgment, just support.',
  },
  {
    rating: 5,
    title: 'From failing to top of my class',
    text: 'I went from barely passing to getting top marks. The teaching methods are engaging and effective. I actually look forward to studying now!',
  },
  {
    rating: 5,
    title: 'Confidence boost I needed',
    text: 'Not only did my grades improve, but my confidence in tackling difficult subjects has grown tremendously. I feel prepared for any exam now.',
  },
  {
    rating: 4,
    title: 'Great learning experience',
    text: 'Very knowledgeable tutor who makes learning enjoyable. The sessions are well-structured and always productive.',
  },
  {
    rating: 4,
    title: 'Flexible and accommodating',
    text: 'Good teaching style with flexible scheduling. The tutor understood my specific needs and tailored lessons accordingly. Highly recommended!',
  },
  {
    rating: 4,
    title: 'Clear explanations',
    text: 'The tutor has deep understanding of the subject matter. Explanations are clear and easy to follow. Very satisfied with my progress.',
  },
  {
    rating: 4,
    title: 'Solid improvement in grades',
    text: 'Sessions are productive and I can see real improvement in my understanding. Good value for quality education provided.',
  },
  {
    rating: 4,
    title: 'Responsive and helpful',
    text: 'The tutor adapts well to my learning pace and always responds quickly to questions. Communication has been excellent throughout.',
  },
  {
    rating: 5,
    title: 'Changed my perspective on learning',
    text: 'I used to dread this subject, but now I genuinely enjoy it. The passion for teaching really shows in every session. Life-changing experience!',
  },
  {
    rating: 5,
    title: 'Personalized attention makes the difference',
    text: 'The personalized attention and customized learning plan made all the difference. The tutor genuinely cares about student success.',
  },
  {
    rating: 4,
    title: 'Well-prepared sessions',
    text: 'Every session feels like a productive use of time, with clear objectives. The tutor always comes prepared with relevant materials.',
  },
  {
    rating: 5,
    title: 'Wish I found this sooner',
    text: 'If only I had discovered this tutor earlier! My academic journey would have been so much smoother. Better late than never though!',
  },
  {
    rating: 5,
    title: 'Makes difficult topics simple',
    text: 'The ability to simplify complex concepts is remarkable. What seemed impossible before now feels achievable and even enjoyable.',
  },
  {
    rating: 4,
    title: 'Consistent quality',
    text: 'Every session maintains the same high quality. The tutor is reliable, knowledgeable, and truly dedicated to helping students succeed.',
  },
  {
    rating: 5,
    title: 'Beyond just academics',
    text: 'Not only improved my grades but also taught me valuable study skills and time management. These lessons will stay with me forever.',
  },
];

function getRandomDateInPast(maxDaysAgo: number): Date {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function seed() {
  console.log('Initializing data source...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'bimbly',
    entities: [User, TutorProfile, Review],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Data source initialized!');

  const userRepository = dataSource.getRepository(User);
  const tutorRepository = dataSource.getRepository(TutorProfile);
  const reviewRepository = dataSource.getRepository(Review);

  const tutors = await tutorRepository.find({ where: { isApproved: true } });

  if (tutors.length === 0) {
    console.log('No tutors found in database. Please run tutor.seed.ts first.');
    await dataSource.destroy();
    return;
  }

  console.log(`Found ${tutors.length} tutors in database.`);

  const defaultPassword = await bcrypt.hash('password123', SALT_ROUNDS);
  const studentUsers: User[] = [];

  console.log('Creating student users...');
  for (const student of studentData) {
    let user = await userRepository.findOne({ where: { email: student.email } });

    if (!user) {
      user = new User();
      user.email = student.email;
      user.passwordHash = defaultPassword;
      user.userType = 'student';
      user.fullName = student.fullName;
      user.phoneNumber = student.phoneNumber;
      user.isEmailVerified = true;
      user = await userRepository.save(user);
      console.log(`Created student: ${student.fullName}`);
    } else {
      console.log(`Student ${student.fullName} already exists`);
    }
    studentUsers.push(user);
  }

  console.log('\nCreating reviews for each tutor...');

  for (let tutorIndex = 0; tutorIndex < tutors.length; tutorIndex++) {
    const tutor = tutors[tutorIndex];
    const existingReviews = await reviewRepository.find({ where: { tutorId: tutor.userId } });

    if (existingReviews.length > 0) {
      await reviewRepository.remove(existingReviews);
      const tutorUser = await userRepository.findOne({ where: { id: tutor.userId } });
      console.log(`Deleted ${existingReviews.length} existing reviews for tutor: ${tutorUser?.fullName || tutor.userId}`);
    }

    let reviewCount: number;
    if (tutorIndex === 0) {
      reviewCount = 1;
    } else if (tutorIndex === 1) {
      reviewCount = 2;
    } else {
      reviewCount = Math.floor(Math.random() * 6) + 5;
    }

    const shuffledStudents = shuffleArray(studentUsers);
    const shuffledTemplates = shuffleArray(reviewTemplates);

    let totalRating = 0;
    let reviewsCreated = 0;

    for (let i = 0; i < Math.min(reviewCount, shuffledStudents.length); i++) {
      const student = shuffledStudents[i];
      const template = shuffledTemplates[i % shuffledTemplates.length];

      const review = new Review();
      review.tutorId = tutor.userId;
      review.studentId = student.id;
      review.rating = template.rating;
      review.reviewTitle = template.title;
      review.reviewText = template.text;
      review.createdAt = getRandomDateInPast(180);

      await reviewRepository.save(review);
      totalRating += template.rating;
      reviewsCreated++;
    }

    const averageRating = Math.round((totalRating / reviewsCreated) * 10) / 10;
    await tutorRepository.update(tutor.id, {
      averageRating,
      totalReviews: reviewsCreated,
    });

    const tutorUser = await userRepository.findOne({ where: { id: tutor.userId } });
    console.log(`Created ${reviewsCreated} reviews for tutor: ${tutorUser?.fullName || tutor.userId} (avg: ${averageRating})`);
  }

  console.log('\nSeeding complete!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
