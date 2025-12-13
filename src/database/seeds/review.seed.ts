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
  { rating: 5, title: 'Excellent Teaching!', text: 'The tutor explained everything clearly and made complex topics easy to understand. Highly recommended for anyone looking to improve their grades! What I particularly appreciated was how they broke down difficult concepts into smaller, manageable pieces. The patience shown when I struggled with certain topics was remarkable. I never felt rushed or judged, which made the learning environment very comfortable and conducive to asking questions.' },
  { rating: 5, title: 'Best Tutor Ever', text: 'I went from struggling to getting top marks in my class. The teaching methods are very effective and engaging. Before these sessions, I was barely passing my exams and felt completely lost in class. Now, not only do I understand the material, but I actually look forward to learning more. The tutor has a unique ability to make even the most boring topics interesting and relevant to real life.' },
  { rating: 5, title: 'Very Patient and Helpful', text: 'Even when I asked the same question multiple times, the tutor remained patient and found different ways to explain until I understood.' },
  { rating: 5, title: 'Amazing Experience', text: 'The lessons are well-structured and the tutor always comes prepared. My confidence in this subject has grown tremendously. Every session feels like a productive use of time, with clear objectives and outcomes. The tutor also provides excellent follow-up materials and is always available to answer questions between sessions. This level of dedication is rare to find and has made a significant impact on my academic performance.' },
  { rating: 4, title: 'Great Sessions', text: 'Very knowledgeable tutor who knows how to make learning fun. Sometimes sessions run a bit over time, but the quality is worth it.' },
  { rating: 4, title: 'Highly Recommended', text: 'Good teaching style and flexible scheduling. Helped me prepare well for my exams. The tutor understood my specific needs and tailored the lessons accordingly. While there is always room for improvement, I am overall very satisfied with my experience and would definitely recommend this tutor to friends and family members who need academic support.' },
  { rating: 4, title: 'Very Knowledgeable', text: 'The tutor has deep understanding of the subject matter. Could improve on providing more practice materials.' },
  { rating: 4, title: 'Solid Teaching', text: 'Clear explanations and good examples. Would be great to have more interactive exercises during sessions.' },
  { rating: 4, title: 'Good Value', text: 'The sessions are productive and I can see improvement in my understanding. Reasonable pricing for the quality provided.' },
  { rating: 3, title: 'Decent Experience', text: 'The tutor knows the material well, but sometimes goes too fast. Had to ask for clarification several times. I think with some adjustments to pacing and more frequent check-ins to ensure understanding, the sessions could be even more effective. The content knowledge is definitely there, it is just about finding the right delivery method for different students learning styles.' },
  { rating: 3, title: 'Average but Helpful', text: 'Sessions are okay. The explanations are clear but could use more real-world examples to make concepts stick.' },
  { rating: 5, title: 'Life Changing!', text: 'I used to hate this subject, but now I actually enjoy it thanks to this amazing tutor. The passion for teaching really shows! My entire perspective on learning has changed. I now approach challenging topics with curiosity rather than dread. The tutor has not only helped me academically but has also taught me valuable study skills that I will use for the rest of my educational journey and beyond.' },
  { rating: 5, title: 'Worth Every Penny', text: 'Professional, punctual, and incredibly effective. My test scores improved by 30% after just a few sessions. The investment in tutoring has paid off tremendously. What impressed me most was the structured approach to identifying my weak areas and systematically addressing them. The progress tracking was also very helpful in seeing how far I have come.' },
  { rating: 4, title: 'Very Satisfied', text: 'The tutor adapts well to my learning pace. Good communication and always responds quickly to questions.' },
  { rating: 5, title: 'Exceeded Expectations', text: 'I was skeptical at first, but the results speak for themselves. Went from a C student to getting As consistently. I initially doubted whether tutoring would make a difference, but I am so glad I gave it a chance. The personalized attention and customized learning plan made all the difference. The tutor genuinely cares about student success and it shows in every interaction.' },
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

  for (const tutor of tutors) {
    const existingReviews = await reviewRepository.find({ where: { tutorId: tutor.userId } });

    if (existingReviews.length > 0) {
      await reviewRepository.remove(existingReviews);
      const tutorUser = await userRepository.findOne({ where: { id: tutor.userId } });
      console.log(`Deleted ${existingReviews.length} existing reviews for tutor: ${tutorUser?.fullName || tutor.userId}`);
    }

    const reviewCount = Math.floor(Math.random() * 6) + 20;
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
