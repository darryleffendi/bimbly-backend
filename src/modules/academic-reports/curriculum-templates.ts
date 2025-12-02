export interface CurriculumTemplate {
  curriculum: string;
  grade: number;
  subjects: {
    name: string;
    subtopics: string[];
  }[];
}

export const KURIKULUM_MERDEKA: Record<number, CurriculumTemplate['subjects']> = {
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
