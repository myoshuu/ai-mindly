import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hash } from "bcrypt";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      password: adminPassword,
      fullName: "Administrator",
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Create nurse user
  const nursePassword = await hash("nurse123", 12);
  const nurse = await prisma.user.upsert({
    where: { email: "perawat@gmail.com" },
    update: {},
    create: {
      email: "perawat@gmail.com",
      password: nursePassword,
      fullName: "dr. Susi Handayani, S.Kep",
      role: "NURSE",
      nip: "1992031501234567",
    },
  });
  console.log("Created nurse:", nurse.email);

  // Create sample patient
  const patientPassword = await hash("patient123", 12);
  const patientUser = await prisma.user.upsert({
    where: { email: "pasien@gmail.com" },
    update: {},
    create: {
      email: "pasien@gmail.com",
      password: patientPassword,
      fullName: "Ahmad Fauzi",
      role: "PATIENT",
    },
  });

  await prisma.patient.upsert({
    where: { nik: "3201234567890001" },
    update: {},
    create: {
      nik: "3201234567890001",
      fullName: "Ahmad Fauzi",
      gender: "MAN",
      birthDate: new Date("1985-06-15"),
      phone: "081234567890",
      address: "Jl. Merdeka No. 123, Jakarta",
      userId: patientUser.id,
    },
  });
  console.log("Created patient");

  // ========================================
  // SEED QUESTIONS (GAD-7, PHQ-9, SRQ-20)
  // ========================================

  const scaleLabels = JSON.stringify([
    "Tidak Pernah",
    "Jarang",
    "Kadang-kadang",
    "Sering",
    "Hampir Selalu",
  ]);

  // GAD-7 Questions (Anxiety)
  const gad7Questions = [
    {
      id: 1,
      text: "Apakah Anda sering merasa khawatir atau cemas secara berlebihan terhadap suatu masalah, meskipun penyebabnya belum tentu jelas?",
      category: "ANXIETY",
      symptomType: "MAJOR",
      order: 1,
    },
    {
      id: 2,
      text: "Apakah Anda merasa sulit berkonsentrasi atau fokus ketika sedang memikirkan suatu masalah?",
      category: "ANXIETY",
      symptomType: "MAJOR",
      order: 2,
    },
    {
      id: 3,
      text: "Apakah Anda mengalami kesulitan tidur karena pikiran yang terus-menerus mengganggu atau rasa cemas?",
      category: "ANXIETY",
      symptomType: "MAJOR",
      order: 3,
    },
    {
      id: 4,
      text: "Apakah Anda sering merasa bingung atau tidak yakin dalam mengambil keputusan ketika menghadapi suatu situasi?",
      category: "ANXIETY",
      symptomType: "MAJOR",
      order: 4,
    },
    {
      id: 5,
      text: "Saat merasa cemas, apakah jantung Anda berdebar lebih cepat, napas terasa lebih cepat, atau tubuh menjadi gemetar?",
      category: "ANXIETY",
      symptomType: "MINOR",
      order: 5,
    },
    {
      id: 6,
      text: "Apakah Anda sering merasa pusing, lemas, atau kehilangan nafsu makan ketika sedang menghadapi tekanan atau masalah?",
      category: "ANXIETY",
      symptomType: "MINOR",
      order: 6,
    },
    {
      id: 7,
      text: "Apakah Anda merasa tidak berdaya atau sulit mengendalikan rasa cemas yang sedang Anda alami?",
      category: "ANXIETY",
      symptomType: "MINOR",
      order: 7,
    },
  ];

  for (const q of gad7Questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        text: q.text,
        category: q.category as any,
        symptomType: q.symptomType as any,
        order: q.order,
        instrument: "GAD7",
        scaleMin: 0,
        scaleMax: 4,
        scaleLabels,
      },
    });
  }
  console.log("Seeded GAD-7 questions");

  // PHQ-9 Questions (Depression)
  const phq9Questions = [
    {
      id: 8,
      text: "Apakah Anda sering merasa sedih, tertekan, atau putus asa dalam dua minggu terakhir?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 1,
    },
    {
      id: 9,
      text: "Apakah Anda merasa kurang tertarik atau tidak menikmati kegiatan yang biasanya Anda sukai?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 2,
    },
    {
      id: 10,
      text: "Apakah Anda mengalami gangguan tidur seperti sulit tidur, tidur terlalu banyak, atau bangun terlalu pagi?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 3,
    },
    {
      id: 11,
      text: "Apakah Anda merasa lelah atau tidak memiliki energi untuk melakukan aktivitas sehari-hari?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 4,
    },
    {
      id: 12,
      text: "Apakah Anda mengalami perubahan nafsu makan atau berat badan (naik atau turun)?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 5,
    },
    {
      id: 13,
      text: "Apakah Anda merasa tidak berharga, bersalah, atau merasa bahwa Anda adalah kegagalan?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 6,
    },
    {
      id: 14,
      text: "Apakah Anda sulit berkonsentrasi atau membuat keputusan untuk hal-hal kecil?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 7,
    },
    {
      id: 15,
      text: "Apakah orang lain menyadari bahwa Anda bergerak atau berbicara lebih lambat dari biasanya, atau justru lebih gelisah dari biasanya?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 8,
    },
    {
      id: 16,
      text: "Apakah Anda memiliki pikiran untuk menyakiti diri sendiri, bunuh diri, atau kematian?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 9,
    },
  ];

  for (const q of phq9Questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        text: q.text,
        category: q.category as any,
        symptomType: q.symptomType as any,
        order: q.order,
        instrument: "PHQ9",
        scaleMin: 0,
        scaleMax: 4,
        scaleLabels,
      },
    });
  }
  console.log("Seeded PHQ-9 questions");

  // SRQ-20 Questions (General Mental Health)
  const srq20Questions = [
    {
      id: 17,
      text: "Apakah Anda sering mengalami sakit kepala?",
      category: "PHYSICAL",
      symptomType: "MINOR",
      order: 1,
    },
    {
      id: 18,
      text: "Apakah Anda tidak memiliki nafsu makan?",
      category: "PHYSICAL",
      symptomType: "MINOR",
      order: 2,
    },
    {
      id: 19,
      text: "Apakah Anda tidur tidak nyenyak (sulit tidur, sering terbangun, atau mimpi buruk)?",
      category: "PHYSICAL",
      symptomType: "MINOR",
      order: 3,
    },
    {
      id: 20,
      text: "Apakah Anda mudah merasa takut?",
      category: "ANXIETY",
      symptomType: "MINOR",
      order: 4,
    },
    {
      id: 21,
      text: "Apakah Anda merasa nervosus, gelisah, atau tegang?",
      category: "ANXIETY",
      symptomType: "MINOR",
      order: 5,
    },
    {
      id: 22,
      text: "Apakah Anda tidak dapat berpikir jernih?",
      category: "IMPACT",
      symptomType: "MINOR",
      order: 6,
    },
    {
      id: 23,
      text: "Apakah Anda merasa tidak bahagia?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 7,
    },
    {
      id: 24,
      text: "Apakah Anda menangis lebih dari biasanya?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 8,
    },
    {
      id: 25,
      text: "Apakah Anda mengalami kesulitan dalam mengambil keputusan sehari-hari?",
      category: "IMPACT",
      symptomType: "MINOR",
      order: 9,
    },
    {
      id: 26,
      text: "Apakah aktivitas sehari-hari Anda terganggu (pekerjaan, tugas rumah, atau kegiatan lainnya)?",
      category: "IMPACT",
      symptomType: "MAJOR",
      order: 10,
    },
    {
      id: 27,
      text: "Apakah Anda merasa tidak dapat mengatasi masalah dalam hidup Anda?",
      category: "IMPACT",
      symptomType: "MINOR",
      order: 11,
    },
    {
      id: 28,
      text: "Apakah Anda merasa tidak dapat menikmati kehidupan sehari-hari?",
      category: "IMPACT",
      symptomType: "MINOR",
      order: 12,
    },
    {
      id: 29,
      text: "Apakah Anda sering merasa sedih atau putus asa?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 13,
    },
    {
      id: 30,
      text: "Apakah Anda kehilangan kepercayaan diri?",
      category: "IMPACT",
      symptomType: "MINOR",
      order: 14,
    },
    {
      id: 31,
      text: "Apakah Anda merasa tidak berguna?",
      category: "DEPRESSION",
      symptomType: "MINOR",
      order: 15,
    },
    {
      id: 32,
      text: "Apakah Anda pernah berpikir untuk menyakiti diri sendiri?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 16,
    },
    {
      id: 33,
      text: "Apakah Anda mengalami perubahan perasaan yang tiba-tiba (marah, takut, cemas)?",
      category: "ANXIETY",
      symptomType: "MINOR",
      order: 17,
    },
    {
      id: 34,
      text: "Apakah Anda menghindari berbicara dengan orang lain?",
      category: "IMPACT",
      symptomType: "MINOR",
      order: 18,
    },
    {
      id: 35,
      text: "Apakah Anda merasa hidup tidak berguna?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 19,
    },
    {
      id: 36,
      text: "Apakah Anda mengalami pikiran untuk mengakhiri hidup Anda?",
      category: "DEPRESSION",
      symptomType: "MAJOR",
      order: 20,
    },
  ];

  for (const q of srq20Questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        text: q.text,
        category: q.category as any,
        symptomType: q.symptomType as any,
        order: q.order,
        instrument: "SRQ20",
        scaleMin: 0,
        scaleMax: 4,
        scaleLabels,
      },
    });
  }
  console.log("Seeded SRQ-20 questions");

  // ========================================
  // SEED DIAGNOSES (SDKI)
  // ========================================

  // Diagnosis 1: Gangguan Citra Tubuh
  console.log("Seeding Gangguan Citra Tubuh...");
  const diagnosis1 = await prisma.diagnosis.upsert({
    where: { code: "SDKI-001" },
    update: {},
    create: {
      code: "SDKI-001",
      title: "Gangguan Citra Tubuh",
      category: "PSIKOLOGIS",
      subcategory: "Integritas Ego",
      definition:
        "Perubahan persepsi tentang penampilan, struktur, dan fungsi fisik individu",
      causes: JSON.stringify([
        "Perubahan struktur/ bentuk tubuh (mis. amputasi, trauma, luka bakar, obesitas, jerawat)",
        "Perubahan fungsi tubuh (mis. proses penyakit, kehamilan, kelumpuhan)",
        "Perubahan fungsi kognitif",
        "Ketidaksesuaian budaya, keyakinan atau sistem nilai",
        "Transisi perkembangan",
        "Gangguan psikososial",
        "Efek tindakan/pengobatan (mis. pembedahan, kemoterapi, terapi radiasi)",
      ]),
      clinicalConditions: JSON.stringify([
        "Mastektomi",
        "Amputasi",
        "Jerawat",
        "Parut atau luka bakar yang terlihat",
        "Obesitas",
        "Hiperpigmentasi pada kehamilan",
        "Gangguan psikiatrik",
        "Program terapi neoplasma",
        "Alopecia chemically induced",
      ]),
      references: JSON.stringify([
        "PPNI (2016). Standar Diagnosis Keperawatan Indonesia: Definisi dan Indikator Diagnostik, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  // Symptoms for Gangguan Citra Tubuh
  const citraTubuhSymptoms = [
    {
      type: "MAJOR",
      subjective: "Mengungkapkan kecacatan/ kehilangan bagian tubuh",
      objective: "Kehilangan bagian tubuh",
    },
    {
      type: "MAJOR",
      subjective: "Tidak mau mengungkapkan kecacatan/ kehilangan bagian tubuh",
      objective: "Fungsi/ struktur tubuh berubah/ hilang",
    },
    {
      type: "MINOR",
      subjective: "Mengungkapkan perasaan negatif tentang perubahan tubuh",
      objective: "Mengungkapkan perubahan gaya hidup",
    },
    {
      type: "MINOR",
      subjective:
        "Mengungkapkan kekhawatiran pada penolakan/ reaksi orang lain",
      objective: "Menyembunyikan/ menunjukkan bagian tubuh secara berlebihan",
    },
    {
      type: "MINOR",
      subjective: "",
      objective: "Menghindari melihat dan/ atau menyentuh bagian tubuh",
    },
    {
      type: "MINOR",
      subjective: "",
      objective: "Fokus berlebihan pada perubahan tubuh",
    },
    {
      type: "MINOR",
      subjective: "",
      objective: "Respon nonverbal pada perubahan dan persepsi tubuh",
    },
    {
      type: "MINOR",
      subjective: "",
      objective: "Fokus pada penampilan dan kekuatan masa lalu",
    },
    { type: "MINOR", subjective: "", objective: "Hubungan sosial berubah" },
  ];

  for (let i = 0; i < citraTubuhSymptoms.length; i++) {
    await prisma.symptom.create({
      data: {
        diagnosisId: diagnosis1.id,
        type: citraTubuhSymptoms[i].type as any,
        subjective: citraTubuhSymptoms[i].subjective,
        objective: citraTubuhSymptoms[i].objective,
        order: i,
      },
    });
  }

  // Outcome for Gangguan Citra Tubuh (SLKI)
  const outcome1 = await prisma.outcome.upsert({
    where: { code: "SLKI-001" },
    update: {},
    create: {
      code: "SLKI-001",
      title: "Citra Tubuh",
      diagnosisId: diagnosis1.id,
      definition:
        "Persepsi tentang penampilan, struktur, dan fungsi fisik individu",
      expectation: "MEMBAIK",
      references: JSON.stringify([
        "PPNI (2018). Standar Luaran Keperawatan Indonesia: Definisi dan Kriteria Hasil Keperawatan, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const outcome1Criteria = [
    {
      indicator: "Verbalisasi perasaan negatif tentang perubahan tubuh",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi kekhawatiran pada penolakan/ reaksi orang lain",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi perubahan gaya hidup",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Menyembunyikan bagian tubuh berlebihan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Menunjukan bagian tubuh berlebihan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Fokus pada bagian tubuh",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Fokus pada penampilan masa lalu",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Fokus pada kekuatan masa lalu",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Melihat bagian tubuh",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Menyentuh bagian tubuh",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Verbalisasi kecacatan bagian tubuh",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Verbalisasi kehilangan bagian tubuh",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Respon nonverbal pada perubahan tubuh",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Hubungan sosial",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
  ];

  for (let i = 0; i < outcome1Criteria.length; i++) {
    await prisma.outcomeCriterion.create({
      data: { ...outcome1Criteria[i], outcomeId: outcome1.id, order: i },
    });
  }

  // Intervention for Gangguan Citra Tubuh (SIKI)
  const intervention1 = await prisma.intervention.upsert({
    where: { code: "SIKI-001" },
    update: {},
    create: {
      code: "SIKI-001",
      title: "Promosi Citra Tubuh",
      diagnosisId: diagnosis1.id,
      definition:
        "Meningkatkan perbaikan perubahan persepsi terhadap fisik pasien",
      references: JSON.stringify([
        "PPNI (2018). Standar Intervensi Keperawatan Indonesia: Definisi dan Tindakan Keperawatan, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const intervention1Actions = [
    {
      type: "OBSERVATION",
      action: "Identifikasi harapan citra tubuh berdasarkan tahap perkembangan",
    },
    {
      type: "OBSERVATION",
      action:
        "Identifikasi budaya, agama, jenis kelamin, dan umur terkait citra tubuh",
    },
    {
      type: "OBSERVATION",
      action:
        "Identifikasi perubahan citra tubuh yang mengakibatkan isolasi sosial",
    },
    {
      type: "OBSERVATION",
      action: "Monitor frekuensi pernyataan kritik terhadap diri sendiri",
    },
    {
      type: "OBSERVATION",
      action: "Monitor apakah pasien bisa melihat bagian tubuh yang berubah",
    },
    { type: "THERAPEUTIC", action: "Diskusikan perubahan tubuh dan fungsinya" },
    {
      type: "THERAPEUTIC",
      action: "Diskusikan perbedaan penampilan fisik terhadap harga diri",
    },
    {
      type: "THERAPEUTIC",
      action: "Diskusikan perubahan akibat pubertas, kehamilan dan penuaan",
    },
    {
      type: "THERAPEUTIC",
      action:
        "Diskusikan kondisi stress yang mempengaruhi citra tubuh (mis. luka penyakit, pembedahan)",
    },
    {
      type: "THERAPEUTIC",
      action:
        "Diskusikan cara mengembangkan harapan citra tubuh secara realistis",
    },
    {
      type: "THERAPEUTIC",
      action:
        "Diskusikan persepsi pasien dan keluarga tentang perubahan citra tubuh",
    },
    {
      type: "EDUCATION",
      action:
        "Jelaskan kepada keluarga tentang perawatan perubahan citra tubuh",
    },
    {
      type: "EDUCATION",
      action: "Anjurkan mengungkapkan gambaran diri terhadap citra tubuh",
    },
    {
      type: "EDUCATION",
      action: "Anjurkan menggunakan alat bantu (mis. pakaian, wig, kosmetik)",
    },
    {
      type: "EDUCATION",
      action: "Anjurkan mengikuti kelompok pendukung (mis. kelompok sebaya)",
    },
    { type: "EDUCATION", action: "Latih fungsi tubuh yang dimiliki" },
    {
      type: "EDUCATION",
      action: "Latih peningkatan penampilan diri (mis. berdandan)",
    },
    {
      type: "EDUCATION",
      action:
        "Latih pengungkapan kemampuan diri kepada orang lain maupun kelompok",
    },
  ];

  for (let i = 0; i < intervention1Actions.length; i++) {
    await prisma.interventionAction.create({
      data: {
        ...intervention1Actions[i],
        interventionId: intervention1.id,
        order: i,
      },
    });
  }

  // Diagnosis 2: Gangguan Persepsi Sensori
  console.log("Seeding Gangguan Persepsi Sensori...");
  const diagnosis2 = await prisma.diagnosis.upsert({
    where: { code: "SDKI-002" },
    update: {},
    create: {
      code: "SDKI-002",
      title: "Gangguan Persepsi Sensori",
      category: "PSIKOLOGIS",
      subcategory: "Integritas Ego",
      definition:
        "Perubahan persepsi terhadap stimulus baik internal maupun eksternal yang disertai dengan respon yang berkurang, berlebihan atau terdistorsi",
      causes: JSON.stringify([
        "Gangguan penglihatan",
        "Gangguan pendengaran",
        "Gangguan penciuman",
        "Gangguan perabaan",
        "Hipoksia serebral",
        "Penyalahgunaan zat",
        "Usia lanjut",
        "Pemajanan toksin lingkungan",
      ]),
      clinicalConditions: JSON.stringify([
        "Glaukoma",
        "Katarak",
        "Gangguan refraksi (myopia, hiperopia, astigmatisma, presbiopia)",
        "Trauma okuler",
        "Trauma pada saraf kranialis II, III, IV, dan VI akibat stroke, aneurisma intrakranial, trauma/ tumor otak",
        "Infeksi okuler",
        "Presbiakusis",
        "Malfungsi alat bantu dengar",
        "Delirium",
        "Demensia",
        "Gangguan amnestik",
        "Penyakit terminal",
        "Gangguan psikotik",
      ]),
      references: JSON.stringify([
        "PPNI (2016). Standar Diagnosis Keperawatan Indonesia: Definisi dan Indikator Diagnostik, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const sensoriSymptoms = [
    {
      type: "MAJOR",
      subjective: "Mendengar suara bisikan atau melihat bayangan",
      objective: "Distorsi sensori",
    },
    {
      type: "MAJOR",
      subjective:
        "Merasakan sesuatu melalui indera perabaan, Penciuman, pengelihatan, atau Pengecapan",
      objective: "Respon tidak sesuai",
    },
    {
      type: "MAJOR",
      subjective: "Respon tidak sesuai",
      objective:
        "Bersikap seolah melihat, mendengar, mengecap, meraba atau mencium sesuatu",
    },
    {
      type: "MAJOR",
      subjective:
        "Bersikap seolah melihat, mendengar, mengecap, meraba atau mencium sesuatu",
      objective: "",
    },
    { type: "MINOR", subjective: "Menyatakan kesal", objective: "Menyendiri" },
    { type: "MINOR", subjective: "", objective: "Melamun" },
    { type: "MINOR", subjective: "", objective: "Konsentrasi buruk" },
    {
      type: "MINOR",
      subjective: "",
      objective: "Disorientasi waktu, tempat, orang dan situasi",
    },
    { type: "MINOR", subjective: "", objective: "Curiga" },
    { type: "MINOR", subjective: "", objective: "Melihat ke satu arah" },
    { type: "MINOR", subjective: "", objective: "Mondar mandir" },
    { type: "MINOR", subjective: "", objective: "Bicara sendiri" },
  ];

  for (let i = 0; i < sensoriSymptoms.length; i++) {
    await prisma.symptom.create({
      data: {
        diagnosisId: diagnosis2.id,
        type: sensoriSymptoms[i].type as any,
        subjective: sensoriSymptoms[i].subjective,
        objective: sensoriSymptoms[i].objective,
        order: i,
      },
    });
  }

  // Outcome for Gangguan Persepsi Sensori (SLKI)
  const outcome2 = await prisma.outcome.upsert({
    where: { code: "SLKI-002" },
    update: {},
    create: {
      code: "SLKI-002",
      title: "Persepsi Sensori",
      diagnosisId: diagnosis2.id,
      definition:
        "Persepsi realistis terhadap stimulus baik internal maupun eksternal",
      expectation: "MEMBAIK",
      references: JSON.stringify([
        "PPNI (2018). Standar Luaran Keperawatan Indonesia: Definisi dan Kriteria Hasil Keperawatan, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const outcome2Criteria = [
    {
      indicator: "Verbalisasi mendengar bisikan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi melihat bayangan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi merasakan sesuatu melalui indra perabaan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi merasakan sesuatu melalui indra penciuman",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi merasakan sesuatu melalui indra pengecapan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Distorsi sensori",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Perilaku halusinasi",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Menarik diri",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Melamun",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Curiga",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Mondar-mandir",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Respon sesuai stimulus",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Konsentrasi",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Orientasi",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
  ];

  for (let i = 0; i < outcome2Criteria.length; i++) {
    await prisma.outcomeCriterion.create({
      data: { ...outcome2Criteria[i], outcomeId: outcome2.id, order: i },
    });
  }

  // Intervention for Gangguan Persepsi Sensori (SIKI)
  const intervention2 = await prisma.intervention.upsert({
    where: { code: "SIKI-002" },
    update: {},
    create: {
      code: "SIKI-002",
      title: "Manajemen Halusinasi",
      diagnosisId: diagnosis2.id,
      definition:
        "Mengidentifikasi dan mengelola peningkatan keamanan, kenyamanan dan orientasi realita",
      references: JSON.stringify([
        "PPNI (2018). Standar Intervensi Keperawatan Indonesia: Definisi dan Tindakan Keperawatan, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const intervention2Actions = [
    {
      type: "OBSERVATION",
      action: "Monitor perilaku yang mengindikasi halusinasi",
    },
    {
      type: "OBSERVATION",
      action:
        "Monitor dan sesuaikan tingkat aktivitas dan stimulasi lingkungan",
    },
    {
      type: "OBSERVATION",
      action: "Monitor isi halusinasi (mis. kekerasaan atau membahayakan diri)",
    },
    { type: "THERAPEUTIC", action: "Pertahankan lingkungan yang aman" },
    {
      type: "THERAPEUTIC",
      action:
        "Lakukan tindakan keselamatan ketika tidak dapat mengontrol perilaku (mis. limit setting, pembatasan wilayah, pengekangan fisik, seklusi)",
    },
    {
      type: "THERAPEUTIC",
      action: "Diskusikan perasaan dan respon terhadap halusinasi",
    },
    {
      type: "THERAPEUTIC",
      action: "Hindari perdebatan tentang validasi halusinasi",
    },
    {
      type: "EDUCATION",
      action: "Anjurkan memonitor sendiri situasi terjadinya halusinasi",
    },
    {
      type: "EDUCATION",
      action:
        "Anjurkan bicara pada orang yang dipercaya untuk memberi dukungan dan umpan balik korektif terhadap halusinasi",
    },
    {
      type: "EDUCATION",
      action:
        "Anjurkan melakukan distraksi (mis. mendengarkan musik melakukan aktivitas dan teknik relaksasi)",
    },
    {
      type: "EDUCATION",
      action: "Ajarkan pasien dan keluarga cara mengontrol halusinasi",
    },
    {
      type: "COLLABORATION",
      action:
        "Kolaborasi pemberian obat antipsikotik dan anti ansietas Jika perlu",
    },
  ];

  for (let i = 0; i < intervention2Actions.length; i++) {
    await prisma.interventionAction.create({
      data: {
        ...intervention2Actions[i],
        interventionId: intervention2.id,
        order: i,
      },
    });
  }

  // Diagnosis 3: Ansietas
  console.log("Seeding Ansietas...");
  const diagnosis3 = await prisma.diagnosis.upsert({
    where: { code: "SDKI-003" },
    update: {},
    create: {
      code: "SDKI-003",
      title: "Ansietas",
      category: "PSIKOLOGIS",
      subcategory: "Integritas Ego",
      definition:
        "Kondisi emosi dan pengalaman subyektif individu terhadap objek yang tidak jelas dan spesifik akibat antisipasi bahaya yang memungkinkan individu melakukan tindakan untuk menghadapi ancaman",
      causes: JSON.stringify([
        "Krisis situasional",
        "Kebutuhan tidak terpenuhi",
        "Krisis maturasional",
        "Ancaman terhadap konsep diri",
        "Ancaman terhadap kematian",
        "Kekhawatiran mengalami kegagalan",
        "Disfungsi sistem keluarga",
        "Hubungan orang tua-anak tidak memuaskan",
        "Faktor keturunan (temperamen mudah teragitasi sejak lahir)",
        "Penyalahgunaan zat",
        "Terpapar bahaya lingkungan (mis. toksin, polutan, dan lain-lain)",
        "Kurang terpapar informasi",
      ]),
      clinicalConditions: JSON.stringify([
        "Penyakit kronis progresif (mis. kanker, penyakit autoimun)",
        "Penyakit akut",
        "Hospitalisasi",
        "Rencana operasi",
        "Kondisi diagnosis penyakit belum jelas",
        "Penyakit neurologis",
        "Tahap tumbuh kembang",
      ]),
      references: JSON.stringify([
        "PPNI (2016). Standar Diagnosis Keperawatan Indonesia: Definisi dan Indikator Diagnostik, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const ansietasSymptoms = [
    { type: "MAJOR", subjective: "Merasa bingung", objective: "Tanpa gelisa" },
    {
      type: "MINOR",
      subjective: "Mengeluh pusing",
      objective: "Frekuensi nafas meningkat",
    },
    {
      type: "MINOR",
      subjective: "Anoreksia",
      objective: "Frekuensi nadi meningkat",
    },
    {
      type: "MINOR",
      subjective: "Palpitasi",
      objective: "Tekanan darah meningkat",
    },
    { type: "MINOR", subjective: "Merasa tidak berdaya", objective: "Tremor" },
    { type: "MINOR", subjective: "", objective: "Muka tampak pucat" },
    { type: "MINOR", subjective: "", objective: "Suara bergetar" },
    { type: "MINOR", subjective: "", objective: "Kontak mata buruk" },
    { type: "MINOR", subjective: "", objective: "Sering berkemih" },
    { type: "MINOR", subjective: "", objective: "Berorientasi pada masa lalu" },
  ];

  for (let i = 0; i < ansietasSymptoms.length; i++) {
    await prisma.symptom.create({
      data: {
        diagnosisId: diagnosis3.id,
        type: ansietasSymptoms[i].type as any,
        subjective: ansietasSymptoms[i].subjective,
        objective: ansietasSymptoms[i].objective,
        order: i,
      },
    });
  }

  // Outcome for Ansietas (SLKI)
  const outcome3 = await prisma.outcome.upsert({
    where: { code: "SLKI-003" },
    update: {},
    create: {
      code: "SLKI-003",
      title: "Tingkat Ansietas",
      diagnosisId: diagnosis3.id,
      definition:
        "Kondisi emosi dan pengalaman subjektif terhadap objek yang tidak jelas dan spesifik akibat antisipasi bahaya yang memungkinkan individu melakukan tindakan untuk menghadapi ancaman",
      expectation: "MENURUN",
      references: JSON.stringify([
        "PPNI (2018). Standar Luaran Keperawatan Indonesia: Definisi dan Kriteria Hasil Keperawatan, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const outcome3Criteria = [
    {
      indicator: "Verbalisasi kebingungan",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Verbalisasi khawatir akibat kondisi yang dihadapi",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Perilaku gelilsah",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Perilaku tegang",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Keluhan pusing",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Anoreksia",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Palpitasi",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Diaforesis",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Tremor",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Pucat",
      scaleType: "meningkat",
      score1: "Meningkat",
      score2: "Cukup Meningkat",
      score3: "Sedang",
      score4: "Cukup Menurun",
      score5: "Menurun",
    },
    {
      indicator: "Pola tidur",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Frekuensi pernapasan",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Frekuensi nadi",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Tekanan darah",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Kontak mata",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Pola berkemih",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
    {
      indicator: "Orientasi",
      scaleType: "membaik",
      score1: "Memburuk",
      score2: "Cukup Memburuk",
      score3: "Sedang",
      score4: "Cukup Membaik",
      score5: "Membaik",
    },
  ];

  for (let i = 0; i < outcome3Criteria.length; i++) {
    await prisma.outcomeCriterion.create({
      data: { ...outcome3Criteria[i], outcomeId: outcome3.id, order: i },
    });
  }

  // Intervention for Ansietas (SIKI)
  const intervention3 = await prisma.intervention.upsert({
    where: { code: "SIKI-003" },
    update: {},
    create: {
      code: "SIKI-003",
      title: "Reduksi Ansietas",
      diagnosisId: diagnosis3.id,
      definition:
        "Meminimalkan kondisi individu dan pengalaman subjektif terhadap objek yang tidak jelas dan spesifik akibat antisipasi bahaya yang memungkinkan individu melakukan tindakan untuk menghadapi ancaman",
      references: JSON.stringify([
        "PPNI (2018). Standar Intervensi Keperawatan Indonesia: Definisi dan Tindakan Keperawatan, Edisi 1. Jakarta: DPP PPNI.",
      ]),
    },
  });

  const intervention3Actions = [
    {
      type: "OBSERVATION",
      action:
        "Identifikasi saat tingkat ansietas berubah (mis. kondisi, waktu, stressor)",
    },
    {
      type: "OBSERVATION",
      action: "Identifikasi kemampuan mengambil keputusan",
    },
    {
      type: "OBSERVATION",
      action: "Monitor tanda-tanda ansietas (verbal dan nonverbal)",
    },
    {
      type: "THERAPEUTIC",
      action: "Ciptakan suasana terapeutik untuk menumbuhkan kepercayaan",
    },
    {
      type: "THERAPEUTIC",
      action: "Temani pasien untuk mengurangi kecemasan, jika memungkinkan",
    },
    { type: "THERAPEUTIC", action: "Pahami situasi yang membuat ansietas" },
    { type: "THERAPEUTIC", action: "Dengarkan dengan penuh perhatian" },
    {
      type: "THERAPEUTIC",
      action: "Gunakan pendekatan yang tenang dan meyakinkan",
    },
    {
      type: "THERAPEUTIC",
      action: "Tempatkan barang pribadi yang memberikan kenyamanan",
    },
    {
      type: "THERAPEUTIC",
      action: "Motivasi mengidentifikasi situasi yang memicu kecemasan",
    },
    {
      type: "THERAPEUTIC",
      action:
        "Diskusikan perencanaan realistis tentang peristiwa yang akan datang",
    },
    {
      type: "EDUCATION",
      action: "Jelaskan prosedur, termasuk sensasi yang mungkin dialami",
    },
    {
      type: "EDUCATION",
      action:
        "Informasikan secara faktual mengenai diagnosis, pengobatan, dan prognosis",
    },
    {
      type: "EDUCATION",
      action: "Anjurkan keluarga untuk tetap bersama pasien, Jika perlu",
    },
    {
      type: "EDUCATION",
      action:
        "Anjurkan melakukan kegiatan yang tidak kompetitif, sesuai kebutuhan",
    },
    {
      type: "EDUCATION",
      action: "Anjurkan mengungkapkan perasaan dan persepsi",
    },
    {
      type: "EDUCATION",
      action: "Latih kegiatan pengelihatan untuk mengurangi ketegangan",
    },
    {
      type: "EDUCATION",
      action: "Latih penggunaan mekanisme pertahanan diri yang tepat",
    },
    { type: "EDUCATION", action: "Latih teknik relaksasi" },
    {
      type: "COLLABORATION",
      action: "Kolaborasi pemberian obat antiansietas, jika perlu",
    },
  ];

  for (let i = 0; i < intervention3Actions.length; i++) {
    await prisma.interventionAction.create({
      data: {
        ...intervention3Actions[i],
        interventionId: intervention3.id,
        order: i,
      },
    });
  }

  console.log("\nSeed completed successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin: admin@gmail.com / admin123");
  console.log("Nurse: perawat@gmail.com / nurse123");
  console.log("Patient: pasien@gmail.com / patient123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
