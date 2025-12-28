export interface CurriculumTemplate {
  curriculum: string;
  grade: number;
  subjects: {
    name: string;
    subtopics: string[];
  }[];
}

export const KURIKULUM_MERDEKA: Record<number, CurriculumTemplate['subjects']> = {
    7: [
    {
      name: 'Matematika',
      subtopics: ['Bilangan Bulat', 'Pecahan', 'Aljabar Dasar', 'Persamaan Linear', 'Perbandingan', 'Geometri Dasar'],
    },
    {
      name: 'IPA',
      subtopics: ['Besaran dan Satuan', 'Zat dan Perubahannya', 'Suhu dan Kalor', 'Energi', 'Tata Surya', 'Klasifikasi Makhluk Hidup'],
    },
    {
      name: 'IPS',
      subtopics: ['Interaksi Sosial', 'Lembaga Sosial', 'Keragaman Budaya', 'Aktivitas Ekonomi', 'Konsep Ruang'],
    },
    {
      name: 'Bahasa Indonesia',
      subtopics: ['Teks Deskripsi', 'Teks Narasi', 'Teks Prosedur', 'Teks Laporan', 'Puisi'],
    },
    {
      name: 'Bahasa Inggris',
      subtopics: ['Simple Present Tense', 'Simple Past Tense', 'Descriptive Text', 'Narrative Text', 'Vocabulary Building'],
    },
  ],
  8: [
    {
      name: 'Matematika',
      subtopics: ['Teorema Pythagoras', 'Lingkaran', 'Bangun Ruang', 'Persamaan Garis Lurus', 'Sistem Persamaan Linear', 'Peluang'],
    },
    {
      name: 'IPA',
      subtopics: ['Gerak', 'Gaya dan Hukum Newton', 'Tekanan', 'Getaran dan Gelombang', 'Cahaya', 'Sistem Pencernaan', 'Sistem Peredaran Darah'],
    },
    {
      name: 'IPS',
      subtopics: ['Mobilitas Sosial', 'Pluralitas Masyarakat', 'Konflik Sosial', 'Penawaran dan Permintaan', 'Pasar', 'Pengaruh Interaksi Sosial'],
    },
    {
      name: 'Bahasa Indonesia',
      subtopics: ['Teks Eksposisi', 'Teks Eksplanasi', 'Teks Persuasi', 'Teks Drama', 'Puisi Rakyat'],
    },
    {
      name: 'Bahasa Inggris',
      subtopics: ['Present Continuous Tense', 'Past Continuous Tense', 'Recount Text', 'Explanation Text', 'Reading Comprehension'],
    },
  ],
  9: [
    {
      name: 'Matematika',
      subtopics: ['Perpangkatan', 'Bentuk Akar', 'Persamaan Kuadrat', 'Fungsi Kuadrat', 'Kongruensi dan Kesebangunan', 'Transformasi Geometri'],
    },
    {
      name: 'IPA',
      subtopics: ['Listrik Dinamis', 'Listrik Statis', 'Kemagnetan', 'Bioteknologi', 'Sistem Reproduksi', 'Pewarisan Sifat', 'Atom dan Partikel'],
    },
    {
      name: 'IPS',
      subtopics: ['Perubahan Sosial', 'Globalisasi', 'Ketergantungan Antarruang', 'Perdagangan Internasional', 'Asia Tenggara'],
    },
    {
      name: 'Bahasa Indonesia',
      subtopics: ['Teks Laporan Percobaan', 'Teks Pidato', 'Teks Diskusi', 'Teks Cerita Pendek', 'Teks Tanggapan'],
    },
    {
      name: 'Bahasa Inggris',
      subtopics: ['Present Perfect Tense', 'Passive Voice', 'Analytical Exposition', 'Hortatory Exposition', 'Grammar and Writing'],
    },
  ],
  10: [
    {
      name: 'Matematika',
      subtopics: ['Aljabar', 'Kalkulus', 'Trigonometri', 'Geometri', 'Statistika'],
    },
    {
      name: 'Fisika',
      subtopics: ['Mekanika', 'Termodinamika', 'Gelombang', 'Optik', 'Listrik dan Magnet'],
    },
    {
      name: 'Kimia',
      subtopics: ['Struktur Atom', 'Ikatan Kimia', 'Stoikiometri', 'Termokimia', 'Larutan'],
    },
    {
      name: 'Biologi',
      subtopics: ['Sel', 'Jaringan', 'Sistem Organ', 'Ekologi', 'Genetika'],
    },
  ],
  11: [
    {
      name: 'Matematika',
      subtopics: ['Fungsi', 'Limit', 'Turunan', 'Integral', 'Matriks'],
    },
    {
      name: 'Fisika',
      subtopics: ['Kinematika', 'Dinamika', 'Usaha dan Energi', 'Momentum', 'Getaran dan Gelombang'],
    },
    {
      name: 'Kimia',
      subtopics: ['Kesetimbangan Kimia', 'Asam Basa', 'Redoks', 'Elektrokimia', 'Kimia Karbon'],
    },
  ],
  12: [
    {
      name: 'Matematika',
      subtopics: ['Barisan dan Deret', 'Limit Fungsi', 'Turunan Fungsi', 'Integral Fungsi', 'Aplikasi Turunan'],
    },
    {
      name: 'Fisika',
      subtopics: ['Rangkaian Listrik', 'Medan Magnet', 'Induksi Elektromagnetik', 'Fisika Modern', 'Relativitas'],
    },
  ],
};

export const CAMBRIDGE: Record<number, CurriculumTemplate['subjects']> = {
  7: [
    {
      name: 'Mathematics',
      subtopics: ['Number and Calculation', 'Algebra and Graphs', 'Geometry', 'Measure', 'Handling Data', 'Problem Solving'],
    },
    {
      name: 'Science',
      subtopics: ['Biology - Cells and Organisms', 'Chemistry - Matter and Materials', 'Physics - Forces and Energy', 'Scientific Enquiry', 'Earth and Space'],
    },
    {
      name: 'English',
      subtopics: ['Reading Comprehension', 'Creative Writing', 'Grammar and Punctuation', 'Vocabulary', 'Speaking and Listening'],
    },
  ],
  8: [
    {
      name: 'Mathematics',
      subtopics: ['Number Operations', 'Algebraic Expressions', 'Equations and Inequalities', 'Shapes and Space', 'Data Handling', 'Ratio and Proportion'],
    },
    {
      name: 'Science',
      subtopics: ['Biology - Human Body Systems', 'Chemistry - Chemical Reactions', 'Physics - Motion and Pressure', 'Energy and Waves', 'Experimental Skills'],
    },
    {
      name: 'English',
      subtopics: ['Literary Analysis', 'Persuasive Writing', 'Text Types', 'Advanced Grammar', 'Oral Presentation'],
    },
  ],
  9: [
    {
      name: 'Mathematics',
      subtopics: ['Advanced Algebra', 'Quadratic Functions', 'Geometry and Trigonometry', 'Statistics and Probability', 'Sequences and Series'],
    },
    {
      name: 'Science',
      subtopics: ['Biology - Genetics and Evolution', 'Chemistry - Periodic Table and Bonding', 'Physics - Electricity and Magnetism', 'Waves and Radiation', 'Scientific Investigation'],
    },
    {
      name: 'English',
      subtopics: ['Critical Reading', 'Argumentative Writing', 'Language Devices', 'Poetry Analysis', 'Debate and Discussion'],
    },
  ],
  10: [
    {
      name: 'Mathematics',
      subtopics: ['Number', 'Algebra', 'Geometry', 'Statistics', 'Probability'],
    },
    {
      name: 'Physics',
      subtopics: ['Forces and Motion', 'Energy', 'Waves', 'Electricity', 'Magnetism'],
    },
    {
      name: 'Chemistry',
      subtopics: ['Atomic Structure', 'Bonding', 'States of Matter', 'Chemical Reactions', 'Acids and Bases'],
    },
  ],
  11: [
    {
      name: 'Mathematics',
      subtopics: ['Pure Mathematics', 'Mechanics', 'Statistics', 'Calculus'],
    },
    {
      name: 'Physics',
      subtopics: ['Kinematics', 'Dynamics', 'Forces', 'Work and Energy', 'Circular Motion'],
    },
  ],
  12: [
    {
      name: 'Mathematics',
      subtopics: ['Further Pure Mathematics', 'Further Mechanics', 'Further Statistics', 'Decision Mathematics'],
    },
  ],
};

export function getCurriculumTemplate(curriculum: string, grade: number): CurriculumTemplate | null {
  const templates = curriculum === 'merdeka' ? KURIKULUM_MERDEKA : curriculum === 'cambridge' ? CAMBRIDGE : null;

  if (!templates || !templates[grade]) {
    return null;
  }

  return {
    curriculum,
    grade,
    subjects: templates[grade],
  };
}
