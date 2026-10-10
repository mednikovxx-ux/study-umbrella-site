import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, X, Check, Calendar, Users, Clock, ChevronRight, RotateCcw,
  Trash2, AlertCircle, GraduationCap, Pencil, ArrowRight, Loader2,
  Send, BookOpen, MessageCircle, Paperclip, Building2, LifeBuoy, ShoppingBag, Inbox
} from "lucide-react";

import { storage } from "./storage.js";
import AdminAccess from "./admin-access.jsx";
import { ClubsPanel, TeacherClubs, StudentClubs, CLUB_PRICE, LessonFiles, TargetPicker, targetText, SelfOverviewPanel, kindForStudent, GoalMarker, CHECK_KINDS, SelfMonthPanel, LESSON_KINDS, PayrollCard, slotKind, teacherPayroll, UmbrellaPanel, umbrellaOf, UMBRELLA_PRICES, AdminInbox, CallAdminButton, EmojiPicker, EXTRA_CSS, FormatBadge, FormatPanel, GroupsPanel, LibraryPanel, PayRequestModal, ProgramEditor, ProgressCharts, QUICK_REACTIONS, StudentLessons, StudentOverview, CHANGE_DEADLINE_H, PAY_DEADLINE_H, seedLibrary, withPackagePaid } from "./extras.jsx";
const LOGO_DATA_URI = "/img/logo.png";

/* ----------------------------- helpers ----------------------------- */

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return localDateStr(d);
}

function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", weekday: "short" });
}

function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  const today = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return today ? time : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) + ", " + time;
}

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function shiftWeek(weekStart, delta) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 7 * delta);
  return d;
}

function fmtWeekRange(d1, d2) {
  return d1.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }) + " – " + d2.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const TOPIC_STATUS_ORDER = ["todo", "in_progress", "done"];
function nextTopicStatus(cur) {
  const idx = TOPIC_STATUS_ORDER.indexOf(cur);
  return TOPIC_STATUS_ORDER[(idx + 1) % TOPIC_STATUS_ORDER.length];
}

function topicSetProgress(arr) {
  if (!arr || arr.length === 0) return null;
  const sum = arr.reduce((acc, t) => acc + (t.status === "done" ? 1 : t.status === "in_progress" ? 0.5 : 0), 0);
  return Math.round((sum / arr.length) * 100);
}

function progressOf(student) {
  const all = [...(student.grammarTopics || []), ...(student.vocabTopics || []), ...(student.examTopics || [])];
  if (all.length === 0) return 0;
  const sum = all.reduce((acc, t) => acc + (t.status === "done" ? 1 : t.status === "in_progress" ? 0.5 : 0), 0);
  return Math.round((sum / all.length) * 100);
}

const STATUS_LABELS = {
  active: "Активный",
  trial: "Пробный урок",
  paused: "На паузе",
  finished: "Завершил обучение",
};

const TYPE_LABELS = { trial: "Пробный урок", regular: "Обычный урок" };

const SLOT_STATUS_LABELS = {
  available: "Свободный слот",
  booked: "Занято",
  "reschedule-requested": "Запрошен перенос",
  cancelled: "Отменено",
};

const DEPARTMENTS = {
  language: "Языковое подразделение",
  humanities: "Гуманитарное подразделение",
};

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

/* --------------------------- subjects config -------------------------- */

// Humanities levels mean where the student stands on the way to the exams.
const HUM_LEVELS = ["Основы (5–8 класс)", "Уровень ОГЭ", "Уровень ЕГЭ", "ЕГЭ на 80+"];
const OLD_HUM_LEVEL = { "Базовый": "Основы (5–8 класс)", "Средний": "Уровень ОГЭ", "Продвинутый": "Уровень ЕГЭ" };
const humLevel = (l) => OLD_HUM_LEVEL[l] || l;

const SUBJECTS = {
  english: { label: "Английский", emoji: "🇬🇧", dept: "language", levels: ["A1", "A2", "B1", "B2", "C1", "C2"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  spanish: { label: "Испанский", emoji: "🇪🇸", dept: "language", levels: ["A1", "A2", "B1", "B2", "C1", "C2"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  chinese: { label: "Китайский", emoji: "🇨🇳", dept: "language", levels: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  korean: { label: "Корейский", emoji: "🇰🇷", dept: "language", levels: ["TOPIK 1", "TOPIK 2", "TOPIK 3", "TOPIK 4", "TOPIK 5", "TOPIK 6"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  italian: { label: "Итальянский", emoji: "🇮🇹", dept: "language", levels: ["A1", "A2", "B1", "B2", "C1", "C2"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  turkish: { label: "Турецкий", emoji: "🇹🇷", dept: "language", levels: ["A1", "A2", "B1", "B2", "C1", "C2"], grammarLabel: "Грамматика", vocabLabel: "Лексика" },
  history: { label: "История", emoji: "🏛️", dept: "humanities", levels: HUM_LEVELS, grammarLabel: "Темы курса", vocabLabel: "Ключевые понятия" },
  social: { label: "Обществознание", emoji: "⚖️", dept: "humanities", levels: HUM_LEVELS, grammarLabel: "Темы курса", vocabLabel: "Ключевые понятия" },
  russian: { label: "Русский язык", emoji: "📖", dept: "humanities", levels: HUM_LEVELS, grammarLabel: "Грамматика", vocabLabel: "Лексика" },
};

const SUBJECT_ACCENTS = {
  english: "#5B7FB5", spanish: "#C9922E", chinese: "#D65655", korean: "#4D8FB0", italian: "#3F8F5E", turkish: "#B8303C",
  history: "#C1673F", social: "#B23A3A", russian: "#9C3F5C",
};

const SUBJECT_ORDER = {
  language: ["english", "spanish", "italian", "chinese", "korean", "turkish"],
  humanities: ["history", "social", "russian"],
};

const ENGLISH_VOCAB = ["Family & Relationships", "Food & Dining", "Travel & Transport", "Work & Career", "Technology & Gadgets", "Health & Body", "Weather & Nature", "Shopping & Services", "Education & Learning", "Sports & Hobbies", "Emotions & Feelings", "Housing & Home", "Money & Finance", "Environment", "Media & Entertainment", "Daily Routine"];
const SPANISH_VOCAB = ["Familia y relaciones", "Comida y restaurantes", "Viajes y transporte", "Trabajo y carrera", "Tecnología", "Salud y cuerpo", "Clima y naturaleza", "Compras y servicios", "Educación", "Deportes y aficiones", "Emociones y sentimientos", "Vivienda y hogar", "Dinero y finanzas", "Medio ambiente", "Medios de comunicación", "Rutina diaria"];
const CJK_VOCAB = ["Семья и отношения", "Еда и рестораны", "Путешествия и транспорт", "Работа и карьера", "Технологии", "Здоровье и тело", "Погода и природа", "Покупки и услуги", "Образование", "Спорт и хобби", "Эмоции и чувства", "Жильё и дом", "Деньги и финансы", "Повседневный распорядок"];

const VOCAB_BANK = {
  english: ENGLISH_VOCAB, spanish: SPANISH_VOCAB, chinese: CJK_VOCAB, korean: CJK_VOCAB, italian: CJK_VOCAB, turkish: CJK_VOCAB,
  history: ["Даты и события", "Исторические личности", "Термины и понятия", "Причинно-следственные связи", "Работа с картами", "Работа с источниками", "Историография", "Периодизация"],
  social: ["Термины и определения", "Учёные и теории", "Нормативные документы", "Практические кейсы", "Аргументация для эссе", "Обществоведческие понятия ЕГЭ"],
  russian: ["Фразеологизмы", "Термины лингвистики", "Стилистические средства", "Изобразительно-выразительные средства", "Орфоэпические нормы", "Лексические нормы"],
};

const GRAMMAR_BANK = {
  english: {
    A1: ["Verb to be", "Present Simple", "Articles a/an/the", "Possessive pronouns", "Plural nouns"],
    A2: ["Past Simple", "Present Continuous", "Comparatives and superlatives", "Modal verbs: can/must/should", "Prepositions of place and time"],
    B1: ["Present Perfect", "Past Continuous", "Conditionals 0–1", "Passive Voice (basic)", "Reported Speech (simple)"],
    B2: ["Conditionals 2–3", "Gerunds and Infinitives", "Past modal verbs", "Passive Voice (advanced)", "Inversion (basic)"],
    C1: ["Mixed conditionals", "Advanced Reported Speech", "Cleft sentences", "Participle clauses"],
    C2: ["Stylistic inversion", "Idiomatic grammar structures", "Subtle modality", "Literary grammar devices"],
  },
  spanish: {
    A1: ["Ser vs Estar", "Presente de indicativo", "Artículos el/la/los/las", "Adjetivos posesivos", "Plural de sustantivos"],
    A2: ["Pretérito indefinido", "Pretérito imperfecto", "Comparativos y superlativos", "Verbos reflexivos", "Preposiciones por / para"],
    B1: ["Subjuntivo presente (introducción)", "Pretérito perfecto", "Condicionales reales", "Voz pasiva con se"],
    B2: ["Subjuntivo imperfecto", "Condicionales irreales", "Estilo indirecto", "Gerundio"],
    C1: ["Casos complejos de subjuntivo", "Inversión y énfasis", "Tiempos literarios"],
    C2: ["Construcciones estilísticas", "Formas gramaticales arcaicas"],
  },
  chinese: {
    HSK1: ["Глагол-связка 是", "Порядок слов SVO", "Базовые счётные слова", "Отрицание 不 / 没"],
    HSK2: ["Аспектная частица 了", "Сравнение с 比", "Модальные глаголы 能/可以/会", "Конструкция 从…到…"],
    HSK3: ["Конструкция 把", "Длительность действия 着", "Условные 如果…就…", "Результативные морфемы"],
    HSK4: ["Пассив 被", "Расширенные сравнения", "Союз 不但…而且…"],
    HSK5: ["Продвинутые результативные конструкции", "Эмфатическая конструкция 是…的", "Письменные обороты"],
    HSK6: ["Классические письменные обороты", "成语 в грамматике", "Тонкая модальность"],
  },
  korean: {
    "TOPIK 1": ["Частицы 은/는, 이/가", "Настоящее время -아요/어요", "Отрицание 안 / 못"],
    "TOPIK 2": ["Прошедшее время -았/었어요", "Соединения -고 / -아서", "Базовые уровни вежливости"],
    "TOPIK 3": ["Условное -(으)면", "Простая косвенная речь", "Модальное -(으)ㄹ 수 있다"],
    "TOPIK 4": ["Пассив и каузатив", "Уступительное -아도/어도", "Именные окончания -기 / -음"],
    "TOPIK 5": ["Продвинутые связки", "Формальный официальный стиль", "Литературные конструкции"],
    "TOPIK 6": ["Тонкая модальность", "Идиоматические обороты", "Публицистический стиль"],
  },
  italian: {
    A1: ["Essere и avere", "Presente indicativo", "Артикли il/lo/la", "Притяжательные местоимения"],
    A2: ["Passato prossimo", "Imperfetto", "Возвратные глаголы", "Предлоги a/in/da/di"],
    B1: ["Futuro semplice", "Condizionale presente", "Pronomi combinati", "Congiuntivo presente"],
    B2: ["Congiuntivo imperfetto", "Periodo ipotetico", "Discorso indiretto"],
    C1: ["Congiuntivo trapassato", "Forme implicite"], C2: ["Стилистические конструкции"],
  },
  turkish: {
    A1: ["Гармония гласных", "Аффиксы принадлежности", "Настоящее время -yor", "Падежи: местный и исходный"],
    A2: ["Прошедшее время -di", "Будущее время -ecek", "Винительный и дательный падежи", "Модальность -ebil"],
    B1: ["Широкое время -r", "Причастия -en / -dik", "Условное наклонение -se"],
    B2: ["Деепричастия", "Пассив и каузатив", "Косвенная речь"],
    C1: ["Сложные синтаксические конструкции"], C2: ["Стилистика официальной речи"],
  },
  history: {
    "Основы (5–8 класс)": ["Древний мир", "Средние века", "Великие географические открытия", "История России до XVII века"],
    "Уровень ОГЭ": ["Новое время", "Революции XVIII–XIX вв.", "История России XVIII–XIX вв.", "Мировые войны"],
    "Уровень ЕГЭ": ["Новейшая история", "Историография и источниковедение", "История России XX–XXI вв.", "Историческая аналитика и эссе"],
    "ЕГЭ на 80+": ["Историческое сочинение на максимум", "Сложные задания второй части", "Аргументация и историография"],
  },
  social: {
    "Основы (5–8 класс)": ["Человек и общество", "Семья", "Экономика: основные понятия", "Право: основы"],
    "Уровень ОГЭ": ["Политическая система", "Гражданское общество", "Рыночная экономика", "Социальные институты"],
    "Уровень ЕГЭ": ["Международные отношения", "Экономическая теория", "Конституционное право", "Подготовка к ЕГЭ: эссе"],
    "ЕГЭ на 80+": ["Задание 25: обоснование и примеры", "Сложные задачи по экономике и праву", "Аргументация без потери баллов"],
  },
  russian: {
    "Основы (5–8 класс)": ["Части речи", "Орфограммы корня", "Простое предложение", "Пунктуация при однородных членах"],
    "Уровень ОГЭ": ["Сложное предложение", "Причастный и деепричастный обороты", "Прямая и косвенная речь", "Стили речи"],
    "Уровень ЕГЭ": ["Синтаксис сложных конструкций", "Пунктуация в СПП", "Анализ текста", "Подготовка к сочинению"],
    "ЕГЭ на 80+": ["Сочинение на максимум", "Трудные случаи пунктуации", "Трудные случаи орфографии"],
  },
};

function firstLevel(subject) {
  return SUBJECTS[subject].levels[0];
}

/* ---- normalization: fills in any fields missing from older saved data.
   This is the permanent fix for data loss on schema changes — we NEVER
   bump storage-key versions again; old data is loaded and gap-filled instead. ---- */

function normalizeTeacher(t) {
  return {
    photo: "", bio: "", available: true, availableSpots: null, payoutOverrides: {}, staffMessages: [],
    ...t,
    pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [], ...(t.pageTheme || {}) },
  };
}

function normalizeStudent(s) {
  const base = {
    contact: "", startNote: "", planType: "individual", status: "trial",
    grammarTopics: [], vocabTopics: [], materials: [], homework: [], messages: [], supportMessages: [],
    packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [],
    examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [],
    canRequestTeacherChange: false, teacherChangeRequest: null,
    ...s,
    pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [], ...(s.pageTheme || {}) },
  };
  base.startLevel = humLevel(base.startLevel); base.currentLevel = humLevel(base.currentLevel); if (base.targetLevel) base.targetLevel = humLevel(base.targetLevel);
  base.grammarTopics = (base.grammarTopics || []).map((t) => (t.level ? { ...t, level: humLevel(t.level) } : t));
  base.messages = (base.messages || []).map((m) => ({ attachment: null, reactions: {}, ...m }));
  base.supportMessages = (base.supportMessages || []).map((m) => ({ attachment: null, reactions: {}, ...m }));
  base.homework = (base.homework || []).map((h) => ({ materialAttachment: null, submissionAttachment: null, ...h }));
  return base;
}

function normalizeSlot(sl) {
  return {
    requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "",
    paymentRequest: null, trialName: "", slotPaymentLink: "", reminderSent: false,
    ...sl,
  };
}

function normalizeProduct(p) {
  return { lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0, subject: null, ...p };
}

function normalizeExpense(e) {
  return { category: "Прочее", note: "", ...e };
}

async function loadStrict(currentKey) {
  try {
    const r = await storage.get(currentKey, true);
    return { value: JSON.parse(r.value), needsSave: false };
  } catch (e) {
    return { value: null, needsSave: true };
  }
}

function genTimeOptions() {
  const out = [];
  for (let h = 8; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
    }
  }
  return out;
}
const TIME_OPTIONS = genTimeOptions();

const HOMEWORK_STATUS_LABELS = {
  assigned: "Задано",
  submitted: "Сдано, ждёт проверки",
  in_review: "На проверке",
  needs_revision: "На доработке",
  reviewed: "Проверено ✓",
  not_done: "Не выполнено",
};

const HOMEWORK_STATUS_TONE = {
  not_done: "danger",
  assigned: "default",
  submitted: "gold",
  in_review: "gold",
  needs_revision: "danger",
  reviewed: "green",
};

const PLAN_LABELS = { individual: "Индивидуальный план", package: "Пакет занятий" };

// International exams first, then the Russian school ones where they exist.
const EXAM_OPTIONS = {
  english: ["IELTS", "TOEFL", "Cambridge B2 First (FCE)", "CAE", "ОГЭ", "ЕГЭ"],
  spanish: ["DELE", "SIELE", "ОГЭ", "ЕГЭ"],
  chinese: ["HSK", "ОГЭ", "ЕГЭ"],
  korean: ["TOPIK"],
  italian: ["CILS", "CELI", "PLIDA"],
  turkish: ["TYS (Yunus Emre)", "TÖMER"],
  history: ["ОГЭ", "ЕГЭ"],
  social: ["ОГЭ", "ЕГЭ"],
  russian: ["ОГЭ", "ЕГЭ"],
};

const EXAM_TASK_BANK = {
  IELTS: ["Reading: True/False/Not Given", "Writing Task 1 (график/диаграмма)", "Writing Task 2 (эссе)", "Speaking Part 2 (монолог)", "Listening: Multiple choice"],
  TOEFL: ["Reading: Vocabulary in context", "Integrated Writing", "Independent Writing", "Speaking: Independent task", "Listening: Lectures"],
  "Cambridge B2 First (FCE)": ["Reading and Use of English Parts 1–7", "Writing: Essay", "Writing: Article/Email/Review", "Listening Parts 1–4", "Speaking Parts 1–4"],
  CILS: ["Ascolto", "Comprensione della lettura", "Analisi delle strutture di comunicazione", "Produzione scritta", "Produzione orale"],
  CELI: ["Comprensione della lettura", "Produzione di testi scritti", "Competenza linguistica", "Comprensione dell'ascolto", "Produzione orale"],
  PLIDA: ["Ascoltare", "Leggere", "Scrivere", "Parlare"],
  "TYS (Yunus Emre)": ["Okuma (чтение)", "Dinleme (аудирование)", "Yazma (письмо)", "Konuşma (говорение)"],
  "TÖMER": ["Okuma (чтение)", "Dinleme (аудирование)", "Yazma (письмо)", "Konuşma (говорение)", "Dil bilgisi (грамматика)"],
  CAE: ["Reading Use of English Parts 5–8", "Writing: Essay", "Writing: Report/Review", "Speaking Part 3 (дискуссия)"],
  DELE: ["Comprensión de lectura", "Comprensión auditiva", "Expresión e interacción escritas", "Expresión e interacción orales"],
  SIELE: ["Comprensión de lectura", "Comprensión auditiva", "Producción escrita", "Producción oral"],
  HSK: ["听力 (аудирование)", "阅读 (чтение)", "书写 (письмо, HSK 4+)", "口语 HSKK (говорение, отдельный экзамен)"],
  TOPIK: ["듣기 (аудирование)", "읽기 (чтение)", "쓰기 (письмо, TOPIK II)", "말하기 (устный, отдельный формат)"],
  "ОГЭ": ["Аудирование", "Чтение", "Грамматика и лексика", "Письмо: личное письмо", "Говорение: описание фото"],
  "ЕГЭ": ["Аудирование", "Чтение", "Грамматика и лексика", "Письмо: эссе", "Говорение: монолог и диалог"],
};

const HUM_EXAM = {
  "ЕГЭ:history": { tasks: ["Хронология и даты", "Работа с исторической картой", "Работа с историческим источником", "Культура: памятники и деятели", "Развёрнутый ответ: причины и последствия", "Аргументация точки зрения"], grammar: ["Древняя Русь и Московское государство", "Россия в XVIII–XIX вв.", "Россия в XX веке", "Великая Отечественная война", "Новейшая история России"], vocab: ["Термины и понятия", "Исторические личности", "Даты ключевых событий"] },
  "ОГЭ:history": { tasks: ["Хронология", "Работа с картой", "Работа с источником", "Культура", "Развёрнутый ответ"], grammar: ["Древняя Русь", "Россия в XVI–XVII вв.", "Россия в XVIII–XIX вв.", "Всеобщая история"], vocab: ["Термины и понятия", "Даты и личности"] },
  "ЕГЭ:social": { tasks: ["Понятия и термины", "Анализ графика и статистики", "Сложный план по теме", "Обоснование и примеры", "Работа с текстом", "Задача-ситуация"], grammar: ["Человек и общество", "Экономика", "Социальные отношения", "Политика", "Право"], vocab: ["Термины и определения", "Нормативные документы", "Примеры из жизни для аргументации"] },
  "ОГЭ:social": { tasks: ["Понятия и термины", "Работа с текстом", "Анализ диаграмм", "Задача-ситуация"], grammar: ["Человек и общество", "Экономика", "Социальная сфера", "Политика", "Право"], vocab: ["Термины и определения", "Примеры для ответа"] },
  "ЕГЭ:russian": { tasks: ["Орфография", "Пунктуация", "Орфоэпия и лексические нормы", "Грамматические нормы", "Анализ текста", "Сочинение по тексту"], grammar: ["Правописание корней и приставок", "Н и НН", "Пунктуация в сложном предложении", "Обособленные члены", "Средства выразительности"], vocab: ["Паронимы", "Фразеологизмы", "Термины лингвистики"] },
  "ОГЭ:russian": { tasks: ["Изложение", "Тестовая часть", "Сочинение-рассуждение", "Пунктуационный анализ"], grammar: ["Орфография", "Пунктуация", "Синтаксис", "Средства выразительности"], vocab: ["Термины лингвистики", "Лексика текста"] },
};
function examBank(kind, exam, subject) {
  const h = HUM_EXAM[exam + ":" + subject];
  if (h) return h[kind] || [];
  const B = kind === "tasks" ? EXAM_TASK_BANK : kind === "grammar" ? EXAM_GRAMMAR_BANK : EXAM_VOCAB_BANK;
  return B[exam] || [];
}

const EXAM_GRAMMAR_BANK = {
  IELTS: ["Mixed conditionals", "Passive Voice in academic writing", "Tense agreement", "Relative clauses", "Modal verbs for academic writing"],
  TOEFL: ["Complex sentences", "Gerunds and Infinitives", "Conditional sentences", "Passive Voice"],
  CAE: ["Inversion", "Use of English complex structures", "Participle clauses", "Past modal verbs"],
  DELE: ["Subjuntivo (presente e imperfecto)", "Voz pasiva y pasiva refleja", "Estilo indirecto", "Conectores del discurso", "Perífrasis verbales"],
  SIELE: ["Subjuntivo en distintos contextos", "Oraciones condicionales", "Voz pasiva", "Conectores y marcadores"],
  HSK: ["把字句", "被字句", "复合趋向补语", "程度补语"],
  TOPIK: ["연결어미 (соединительные окончания)", "피동/사동 표현 (пассив и каузатив)", "높임법 (уровни вежливости)"],
  "ОГЭ": ["Времена группы Simple/Continuous/Perfect", "Степени сравнения прилагательных", "Модальные глаголы", "Условные предложения 0–1 типа", "Пассивный залог (базовый)"],
  "ЕГЭ": ["Все времена английского глагола", "Условные предложения 0–3 типа", "Пассивный залог", "Косвенная речь", "Словообразование (задания 29–34)"],
};

const EXAM_VOCAB_BANK = {
  IELTS: ["Academic Word List (AWL)", "Paraphrasing synonyms", "Task 2 opinion & argument vocabulary", "Speaking collocations", "Linking words"],
  TOEFL: ["Academic vocabulary", "Integrated tasks vocabulary", "Synonyms and paraphrase"],
  CAE: ["Idioms and phrasal verbs", "Academic and formal vocabulary", "C1-level collocations"],
  DELE: ["Léxico académico y formal", "Expresiones idiomáticas", "Léxico para expresar opinión", "Marcadores del discurso"],
  SIELE: ["Vocabulario general y académico", "Expresiones coloquiales", "Falsos amigos"],
  HSK: ["HSK核心词汇 (базовая лексика уровня)", "近义词辨析 (различение синонимов)", "四字成语 (устойчивые выражения)"],
  TOPIK: ["TOPIK 필수 어휘 (базовая лексика)", "관용어 (идиомы)", "한자어 (слова китайского происхождения)"],
  "ОГЭ": ["Лексика по темам ФИПИ", "Словообразование", "Базовые фразовые глаголы"],
  "ЕГЭ": ["Лексика по темам ЕГЭ", "Словообразование", "Клише для эссе и письма"],
};


/* ----------------------------- seed data ---------------------------- */

const seedTeachers = [
  { id: "t1", name: "Анна Лапина", contact: "@anna_lapina · +7 900 000-00-01", department: "language", subject: "english", photo: "", bio: "Опыт 3 года. Разговорная практика и подготовка к экзаменам.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t2", name: "Ульяна Железнякова", contact: "@ulyana · +7 900 000-00-02", department: "language", subject: "spanish", photo: "", bio: "Опыт 4+ года. Испанский для переезда, быта и общения.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t3", name: "Урие", contact: "@eleyuim", department: "language", subject: "turkish", photo: "", bio: "Английский и турецкий.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t5", name: "Дарья Колобова", contact: "@daria_k · +7 900 000-00-05", department: "humanities", subject: "history", photo: "", bio: "Опыт 2 года. Даты, реформы, работа с источниками. ЕГЭ по истории — 98.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
  { id: "t6", name: "Антон Бердечевский", contact: "@anton_b · +7 900 000-00-06", department: "humanities", subject: "social", photo: "", bio: "Опыт 3 года. Задания с развёрнутым ответом. ЕГЭ по обществознанию — 99.", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } },
];

const seedStudents = [
  {
    id: "s1", teacherId: "t6", name: "Маша Соколова", contact: "@masha_s · мама Ирина +7 901 000-00-11",
    startLevel: "Средний", currentLevel: "Средний", goal: "ЕГЭ по обществознанию, 11 класс", status: "active", planType: "package", startNote: "Хорошо знает теорию, теряет баллы на развёрнутых ответах.",
    grammarTopics: [
      { id: uid("g"), name: "Человек и общество", status: "done" },
      { id: uid("g"), name: "Рыночная экономика", status: "done" },
      { id: uid("g"), name: "Политическая система", status: "in_progress" },
      { id: uid("g"), name: "Конституционное право", status: "todo" },
    ],
    vocabTopics: [{ id: uid("v"), name: "Термины и определения", status: "in_progress" }],
    materials: [], homework: [
      { id: uid("hw"), title: "Задание 25: обоснование + 3 примера", material: "Тема «Право». Обоснуйте необходимость… и приведите три примера.", materialAttachment: null, dueDate: isoDate(2), status: "assigned", submissionText: "", submissionAttachment: null, submittedAt: null, feedback: "", createdAt: isoDate(-1) },
    ],
    messages: [{ id: uid("msg"), sender: "teacher", text: "Маша, добавил задание 25 — разберём в понедельник.", attachment: null, reactions: {}, at: new Date(Date.now() - 3600 * 1000 * 5).toISOString() }],
    packageProductId: "p_so12", packageTotal: 12, packageAssignedAt: isoDate(-30), packageLabel: "Пакет: 12 занятий", checkpoints: [
      { id: uid("chk"), title: "Входная диагностика", date: isoDate(-40), maxScore: 100, achievedScore: 52, note: "Слабые места: право и экономика" },
      { id: uid("chk"), title: "Пробный вариант ЕГЭ №1", date: isoDate(-21), maxScore: 100, achievedScore: 61, note: "" },
      { id: uid("chk"), title: "Пробный вариант ЕГЭ №2", date: isoDate(-6), maxScore: 100, achievedScore: 68, note: "Первая часть почти без ошибок, задания 24–25 — подтянуть" },
    ],
    examTarget: { exam: "ЕГЭ", targetScore: "85", examDate: "2027-06-01" }, examGrammar: [], examVocab: [], examTopics: [], examMaterials: [],
    canRequestTeacherChange: true, teacherChangeRequest: null, pageTheme: { bannerColor: "", bannerEmoji: "⚖️", accentColor: "", stickers: ["⭐"] },
  },
  {
    id: "s2", teacherId: "t5", name: "Петя Соколов", contact: "мама Ирина +7 901 000-00-11",
    startLevel: "Базовый", currentLevel: "Базовый", goal: "ОГЭ по истории, 9 класс", status: "active", planType: "package", startNote: "Путается в датах XVII века.",
    grammarTopics: [{ id: uid("g"), name: "История России до XVII века", status: "in_progress" }],
    vocabTopics: [{ id: uid("v"), name: "Даты и события", status: "in_progress" }],
    materials: [], homework: [], messages: [],
    packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [], examTarget: { exam: "ОГЭ", targetScore: "", examDate: "" }, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    format: "umbrella", umbrellaId: "um1",
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
  {
    id: "s5", teacherId: "t6", name: "Петя Соколов", contact: "мама Ирина +7 901 000-00-11",
    startLevel: "Базовый", currentLevel: "Базовый", goal: "ОГЭ по обществознанию, 9 класс", status: "active", planType: "package", startNote: "",
    grammarTopics: [{ id: uid("g"), name: "Человек и общество", status: "in_progress", level: "Базовый" }], vocabTopics: [], materials: [], homework: [], messages: [],
    packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [], examTarget: { exam: "ОГЭ", targetScore: "", examDate: "" }, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    format: "umbrella", umbrellaId: "um1",
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
  {
    id: "s3", teacherId: "t1", name: "Анна Миронова", contact: "@anna_m",
    startLevel: "A2", currentLevel: "B1", goal: "Заговорить на английском для работы", status: "active", planType: "package", startNote: "Понимает, но боится говорить.",
    grammarTopics: [{ id: uid("g"), name: "Present Perfect", status: "in_progress" }], vocabTopics: [{ id: uid("v"), name: "Work & Career", status: "in_progress" }],
    materials: [], homework: [], messages: [],
    packageProductId: null, packageTotal: 4, packageAssignedAt: isoDate(-20), packageLabel: "«Сам, но не один»: абонемент на месяц, 4 занятия", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    format: "self",
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
  {
    id: "s4", teacherId: "t2", name: "Игорь Петров", contact: "+7 903 000-00-14",
    startLevel: "A1", currentLevel: "A2", goal: "Испанский для переезда: аренда, врач, банк", status: "active", planType: "package", startNote: "",
    grammarTopics: [{ id: uid("g"), name: "Ser vs Estar", status: "done" }, { id: uid("g"), name: "Pretérito indefinido", status: "in_progress" }],
    vocabTopics: [{ id: uid("v"), name: "Vivienda y hogar", status: "in_progress" }], materials: [], homework: [], messages: [],
    packageProductId: "p_es8", packageTotal: 8, packageAssignedAt: isoDate(-35), packageLabel: "Пакет: 8 занятий", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
    pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
  },
];

// Demo: Петя занимается историей и обществознанием одним пакетом «Под одним зонтом».
const seedUmbrellas = [{ id: "um1", name: "Петя Соколов", contact: "мама Ирина +7 901 000-00-11", total: 12, assignedAt: isoDate(-25), memberIds: ["s2", "s5"], plan: { s2: 6, s5: 6 }, createdAt: new Date().toISOString() }];

const SUBJECT_GENITIVE = {
  english: "английскому языку", spanish: "испанскому языку", chinese: "китайскому языку", korean: "корейскому языку", italian: "итальянскому языку", turkish: "турецкому языку",
  history: "истории", social: "обществознанию", russian: "русскому языку",
};

const PRICE_TABLE = {
  language: { 1: 1600, 4: 6000, 6: 8400, 8: 10400, 12: 15000 },
  humanities: { 1: 1400, 4: 5400, 6: 7800, 8: 10000, 12: 14400 },
};

function buildProductsForSubject(subject, dept, idPrefix) {
  const genitive = SUBJECT_GENITIVE[subject];
  const P = PRICE_TABLE[dept];
  // payoutPerUnit = 0: ставка преподавателя задаётся администратором по итогам собеседования
  return [
    { id: idPrefix + "1", name: "Индивидуальное занятие по " + genitive + ", 60 минут", price: P[1], department: dept, subject, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0 },
    ...[4, 6, 8, 12].map((n) => ({ id: idPrefix + n, name: "Пакет " + n + " занятий по " + genitive, price: P[n], department: dept, subject, lessonsIncluded: n, paymentLink: "", payoutPerUnit: 0 })),
  ];
}

const seedProducts = [
  { id: "trial_lang", name: "Пробное занятие, 30 минут", price: 0, department: "language", subject: null, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0 },
  { id: "trial_hum", name: "Пробное занятие, 30 минут", price: 0, department: "humanities", subject: null, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0 },
  { id: "diag_hum", name: "Диагностика, 90 минут, с письменным планом", price: 2000, department: "humanities", subject: null, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0 },
  { id: "diag_lang", name: "Диагностика, 90 минут, с письменным планом", price: 2000, department: "language", subject: null, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0 },
  { id: "club", name: "Разговорный клуб, 90 минут", price: 1000, department: "language", subject: null, lessonsIncluded: 0, paymentLink: "", payoutPerUnit: 0 },
  ...buildProductsForSubject("english", "language", "p"),
  ...buildProductsForSubject("spanish", "language", "p_es"),
  ...buildProductsForSubject("italian", "language", "p_it"),
  ...buildProductsForSubject("chinese", "language", "p_zh"),
  ...buildProductsForSubject("korean", "language", "p_ko"),
  ...buildProductsForSubject("turkish", "language", "p_tr"),
  ...buildProductsForSubject("history", "humanities", "p_hi"),
  ...buildProductsForSubject("social", "humanities", "p_so"),
  ...buildProductsForSubject("russian", "humanities", "p_ru"),
];

const seedDiscountPercent = 10;

function calcSaleAmount(product, qty, discounted, discountPercent) {
  if (!product) return 0;
  const base = product.price * qty;
  return discounted ? Math.round(base * (1 - discountPercent / 100)) : base;
}

function calcPayout(product, qty, teacher) {
  if (!product) return 0;
  const rate = teacher && teacher.payoutOverrides && teacher.payoutOverrides[product.id] !== undefined
    ? teacher.payoutOverrides[product.id]
    : (product.payoutPerUnit || 0);
  return rate * qty;
}

function daysAgoInMonth(offset) { return isoDate(offset); }

const seedSales = [
  { id: uid("sale"), date: daysAgoInMonth(-35), productId: "p_es8", qty: 1, discounted: false, studentId: "s4", teacherId: "t2" },
  { id: uid("sale"), date: daysAgoInMonth(-30), productId: "p_so12", qty: 1, discounted: true, studentId: "s1", teacherId: "t6" },
  { id: uid("sale"), date: daysAgoInMonth(-25), productId: "p_hi8", qty: 1, discounted: false, studentId: "s2", teacherId: "t5" },
  { id: uid("sale"), date: daysAgoInMonth(-20), productId: "p12", qty: 1, discounted: true, studentId: "s3", teacherId: "t1" },
  { id: uid("sale"), date: daysAgoInMonth(-6), productId: "club", qty: 3, discounted: false },
  { id: uid("sale"), date: daysAgoInMonth(-2), productId: "diag_hum", qty: 1, discounted: false },
].map((s) => ({ ...s, amount: calcSaleAmount(seedProducts.find((p) => p.id === s.productId), s.qty, s.discounted, seedDiscountPercent), payout: 0 }));

const SL = (teacherId, studentId, off, time, extra = {}) => ({ id: uid("sl"), teacherId, studentId, date: isoDate(off), time, duration: 60, type: "regular", status: studentId ? "booked" : "available", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: !!studentId, meetingLink: studentId ? "https://telemost.yandex.ru/" : "", paymentRequest: null, ...extra });
const seedSchedule = [
  SL("t6", "s1", -7, "17:00", { topicsCovered: ["Рыночная экономика"] }), SL("t6", "s1", -3, "17:00", { topicsCovered: ["Политическая система"] }),
  SL("t6", "s1", 0, "17:00"), SL("t6", "s1", 3, "17:00"),
  SL("t5", "s2", -4, "16:00"), SL("t5", "s2", 1, "16:00"), SL("t5", "s2", 4, "16:00"),
  SL("t1", "s3", -2, "19:00"), SL("t1", "s3", 2, "19:00"),
  SL("t2", "s4", -1, "11:00"), SL("t2", "s4", 2, "11:00"),
  SL("t1", null, 1, "18:00", { duration: 30, type: "trial", paid: false }),
  SL("t5", null, 2, "15:00", { duration: 30, type: "trial", paid: false }),
  SL("t6", null, 3, "18:00", { duration: 30, type: "trial", paid: false }),
  SL("t3", null, 4, "12:00", { duration: 30, type: "trial", paid: false }),
];

/* ----------------------------- small UI ----------------------------- */

function Pill({ children, tone = "default" }) {
  return <span className={"pill pill-" + tone}>{children}</span>;
}

function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: value + "%" }} />
      <span className="progress-label">{value}%</span>
    </div>
  );
}

function MiniBar({ label, value }) {
  if (value === null) return null;
  return (
    <div className="mini-bar-row">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track"><div className="mini-bar-fill" style={{ width: value + "%" }} /></div>
      <span className="mini-bar-value">{value}%</span>
    </div>
  );
}

function ProgressBreakdown({ student, subjMeta }) {
  const grammar = topicSetProgress(student.grammarTopics);
  const vocab = topicSetProgress(student.vocabTopics);
  const exam = topicSetProgress(student.examTopics);
  const checkpoints = student.checkpoints || [];
  const latestCheckpoint = checkpoints.length ? checkpoints[checkpoints.length - 1] : null;

  return (
    <div className="progress-breakdown">
      <MiniBar label={subjMeta.grammarLabel} value={grammar} />
      <MiniBar label={subjMeta.vocabLabel} value={vocab} />
      {exam !== null && <MiniBar label={"Задания " + (student.examTarget?.exam || "экзамена")} value={exam} />}
      {latestCheckpoint && (
        <div className="hint-text" style={{ marginTop: 4 }}>
          Последняя проверка: {latestCheckpoint.title} — <span className="checkpoint-score">{latestCheckpoint.achievedScore}/{latestCheckpoint.maxScore}</span>
        </div>
      )}
    </div>
  );
}

function LevelLadder({ levels, start, current }) {
  const startIdx = levels.indexOf(start);
  const curIdx = levels.indexOf(current);
  if (startIdx === -1 || curIdx === -1) {
    return (
      <div className="level-fallback">
        <Pill>{start || "—"}</Pill>
        <ArrowRight size={14} />
        <Pill tone="accent">{current || "—"}</Pill>
      </div>
    );
  }
  return (
    <div className="level-ladder">
      {levels.map((lvl, i) => (
        <div key={lvl} className={"ladder-step" + (i <= curIdx ? " filled" : "") + (i === curIdx ? " current" : "")}>
          {i === startIdx && <span className="ladder-tag">старт</span>}
          {lvl}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="empty-state">
      <Icon size={22} />
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
    </div>
  );
}

function Avatar({ name, photo, size = 40 }) {
  const initials = (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (photo) return <img src={photo} alt={name} className="avatar-img" style={{ width: size, height: size }} />;
  return <div className="avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</div>;
}

/* --------------------------- topic selector --------------------------- */

function TopicSelector({ label, options, selected, onAdd, onRemove, onCycle, readOnly }) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const selectedNames = selected.map((s) => s.name);
  const allOptions = Array.from(new Set([...(options || []), ...selectedNames]));

  const symbol = (status) => (status === "done" ? <Check size={11} /> : status === "in_progress" ? "◐" : "○");

  return (
    <div className="topic-selector">
      <div className="field-label">{label}</div>
      {!open && (
        <div className="chip-row">
          {selected.length === 0 && <span className="muted-text">Темы не выбраны</span>}
          {selected.map((item) => (
            <button
              key={item.id}
              className={"chip chip-" + item.status}
              onClick={() => !readOnly && onCycle(item.id)}
              disabled={readOnly}
              title={readOnly ? "" : "Клик — сменить статус: не начато / в процессе / пройдено"}
            >
              <span className="chip-symbol">{symbol(item.status)}</span> {item.name}
            </button>
          ))}
          {!readOnly && (
            <button className="btn-small" onClick={() => setOpen(true)}>
              <Pencil size={11} /> {selected.length ? "Изменить" : "Выбрать темы"}
            </button>
          )}
        </div>
      )}
      {open && !readOnly && (
        <div className="topic-dropdown">
          <div className="row-gap" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <span className="hint-text">Отметьте темы для этого ученика</span>
            <button className="btn-icon" onClick={() => setOpen(false)} title="Закрыть список"><X size={14} /></button>
          </div>
          <div className="topic-dropdown-list">
            {allOptions.map((name) => {
              const existing = selected.find((s) => s.name === name);
              return (
                <label key={name} className="topic-option">
                  <input type="checkbox" checked={!!existing} onChange={() => (existing ? onRemove(existing.id) : onAdd(name))} />
                  <span>{name}</span>
                </label>
              );
            })}
          </div>
          <div className="row-gap">
            <input className="mini-input wide" placeholder="Своя тема (если нет в списке)" value={customName} onChange={(e) => setCustomName(e.target.value)} />
            <button className="btn-icon" disabled={!customName.trim()} onClick={() => { onAdd(customName.trim()); setCustomName(""); }} title="Добавить свою тему"><Plus size={14} /></button>
          </div>
          <button className="btn-small accent" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
            <Check size={12} /> Готово, закрыть список
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------- attachment helpers ------------------------ */

// Demo storage lives in the browser, so big videos go in as links (Яндекс Диск, YouTube, Rutube).
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const ATTACH_ACCEPT = "image/*,audio/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";

function AttachFileButton({ onPicked, label, multiple }) {
  const [busy, setBusy] = useState(false);
  async function handle(e) {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    const big = files.filter((f) => f.size > MAX_ATTACHMENT_BYTES);
    if (big.length) alert("Больше 4 МБ: " + big.map((f) => f.name).join(", ") + ". Загрузите такой файл в Яндекс Диск или YouTube и вставьте ссылку.");
    setBusy(true);
    for (const file of files.filter((f) => f.size <= MAX_ATTACHMENT_BYTES)) {
      try { onPicked({ name: file.name, type: file.type, dataUrl: await fileToDataURL(file) }); } catch (err) { console.error(err); }
    }
    setBusy(false);
  }
  return (
    <label className="btn-small" title="Фото, документы, аудио, видео до 4 МБ">
      <Paperclip size={12} /> {busy ? "Загрузка…" : (label || "Прикрепить файл")}
      <input type="file" accept={ATTACH_ACCEPT} multiple={!!multiple} onChange={handle} style={{ display: "none" }} />
    </label>
  );
}

const asList = (one, many) => [...(one ? [one] : []), ...(many || [])];
function AttachmentList({ items, onRemove }) {
  if (!items || !items.length) return null;
  return <div className="attach-list">{items.map((a, i) => <AttachmentView key={i} attachment={a} onRemove={onRemove ? () => onRemove(i) : undefined} />)}</div>;
}
function MediaLink({ url }) {
  if (!url) return null;
  return <a className="attachment-file" href={url} target="_blank" rel="noreferrer">🎬 {/youtu|rutube|vk\.com\/video|vkvideo/.test(url) ? "Видео" : "Ссылка"}: {url.replace(/^https?:\/\//, "").slice(0, 48)}</a>;
}

function AttachmentView({ attachment, onRemove }) {
  if (!attachment) return null;
  const t = attachment.type || "";
  const isImage = t.startsWith("image/");
  if (t.startsWith("audio/") || t.startsWith("video/")) return (
    <div className="attachment-chip media">
      {t.startsWith("audio/") ? <audio controls src={attachment.dataUrl} style={{ maxWidth: 280 }} /> : <video controls src={attachment.dataUrl} style={{ maxWidth: 320, borderRadius: 10 }} />}
      <span className="hint-text">{attachment.name}</span>
      {onRemove && <button className="topic-remove" onClick={onRemove}><X size={12} /></button>}
    </div>
  );
  return (
    <div className="attachment-chip">
      {isImage ? (
        <a href={attachment.dataUrl} target="_blank" rel="noreferrer"><img src={attachment.dataUrl} alt={attachment.name} className="attachment-thumb" /></a>
      ) : (
        <a href={attachment.dataUrl} download={attachment.name} className="attachment-file">
          <Paperclip size={12} /> {attachment.name}
        </a>
      )}
      {onRemove && <button className="topic-remove" onClick={onRemove}><X size={12} /></button>}
    </div>
  );
}

/* --------------------------- materials list --------------------------- */

function MaterialsList({ items, onAdd, onRemove, readOnly }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

  return (
    <div>
      <ul className="materials-list">
        {items.length === 0 && <li className="muted-text">Материалы пока не добавлены</li>}
        {items.map((m) => (
          <li key={m.id}>
            <BookOpen size={13} />
            <span><strong>{m.title}</strong>{m.note ? " — " + m.note : ""}</span>
            {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="material-link">ссылка</a>}
            {m.fileDataUrl && <AttachmentView attachment={{ name: m.fileName, type: m.fileType, dataUrl: m.fileDataUrl }} />}
            {!readOnly && <button className="topic-remove" onClick={() => onRemove(m.id)}><X size={12} /></button>}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <div className="add-panel" style={{ marginTop: 6 }}>
          <div className="row-gap">
            <input className="mini-input" placeholder="Учебник / материал" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="mini-input wide" placeholder="Комментарий (юнит, страницы...)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="row-gap">
            <input className="mini-input wide" placeholder="Ссылка (видео, аудио, документ)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <AttachFileButton label={file ? file.name : "Файл / картинка"} onPicked={setFile} />
            {file && <button className="btn-small" onClick={() => setFile(null)}>Убрать файл</button>}
          </div>
          <button
            className="btn-icon"
            disabled={!title.trim()}
            onClick={() => {
              onAdd(title.trim(), note.trim(), url.trim(), file);
              setTitle(""); setNote(""); setUrl(""); setFile(null);
            }}
          ><Plus size={14} /></button>
        </div>
      )}
    </div>
  );
}

/* --------------------------- homework panel --------------------------- */

function HomeworkPanel({ student, actions, role, canAct }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", material: "", dueDate: isoDate(3) });
  const [formAttachments, setFormAttachments] = useState([]);
  const [formLink, setFormLink] = useState("");
  const [drafts, setDrafts] = useState({});
  const [draftAttachments, setDraftAttachments] = useState({});
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const items = [...(student.homework || [])].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return (
    <div>
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <div className="field-label" style={{ margin: 0 }}>Домашние задания</div>
        {role === "teacher" && canAct && (
          <button className="btn-icon" onClick={() => setShowAdd((v) => !v)} title="Добавить задание"><Plus size={14} /></button>
        )}
      </div>

      {showAdd && role === "teacher" && canAct && (
        <div className="add-panel">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <span className="hint-text">Новое домашнее задание</span>
            <button className="btn-icon" onClick={() => setShowAdd(false)} title="Закрыть"><X size={14} /></button>
          </div>
          <input className="mini-input wide" placeholder="Название задания" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="mini-textarea" placeholder="Материалы / инструкции / ссылка" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <AttachmentList items={formAttachments} onRemove={(i) => setFormAttachments(formAttachments.filter((_, j) => j !== i))} />
          <div className="row-gap" style={{ flexWrap: "wrap" }}>
            <AttachFileButton multiple label="Файлы, фото, аудио, видео" onPicked={(a) => setFormAttachments((x) => [...x, a])} />
            <VoiceRecordButton onRecorded={(a) => setFormAttachments((x) => [...x, a])} />
            <input className="mini-input wide" placeholder="Ссылка на видео или файл (YouTube, Rutube, Яндекс Диск)" value={formLink} onChange={(e) => setFormLink(e.target.value)} />
          </div>
          <div className="row-gap">
            <span className="hint-text">Срок:</span>
            <input type="date" className="mini-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <button
            className="btn-small accent"
            disabled={!form.title.trim()}
            onClick={() => { actions.addHomework(student.id, { ...form, materialAttachments: formAttachments, mediaLink: formLink.trim() }); setForm({ title: "", material: "", dueDate: isoDate(3) }); setFormAttachments([]); setFormLink(""); setShowAdd(false); }}
          >
            <Check size={12} /> Добавить задание
          </button>
        </div>
      )}

      <div className="homework-list">
        {items.length === 0 && <EmptyState icon={BookOpen} title="Заданий пока нет" />}
        {items.map((hw) => (
          <div key={hw.id} className="homework-item">
            <div className="row-gap" style={{ justifyContent: "space-between" }}>
              <strong>{hw.title}</strong>
              <Pill tone={HOMEWORK_STATUS_TONE[hw.status]}>
                {HOMEWORK_STATUS_LABELS[hw.status]}
              </Pill>
            </div>
            {hw.material && <p className="body-text" style={{ marginTop: 4 }}>{hw.material}</p>}
            <AttachmentList items={asList(hw.materialAttachment, hw.materialAttachments)} />
            <MediaLink url={hw.mediaLink} />
            {hw.dueDate && <div className="hint-text">Срок: {formatDate(hw.dueDate)}</div>}

            {role === "student" && (
              <div style={{ marginTop: 8 }}>
                {(hw.status === "assigned" || hw.status === "needs_revision" || hw.status === "not_done") ? (
                  <>
                    {hw.status === "needs_revision" && hw.feedback && (
                      <div className="hw-feedback" style={{ marginBottom: 6 }}><strong>Замечания учителя:</strong> {hw.feedback}</div>
                    )}
                    <textarea
                      className="mini-textarea"
                      placeholder="Ваш ответ / ссылка на выполненную работу"
                      value={drafts[hw.id] ?? hw.submissionText ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [hw.id]: e.target.value })}
                    />
                    <AttachmentList items={draftAttachments[hw.id] || []} onRemove={(i) => setDraftAttachments({ ...draftAttachments, [hw.id]: (draftAttachments[hw.id] || []).filter((_, j) => j !== i) })} />
                    <div className="row-gap" style={{ marginTop: 6, flexWrap: "wrap" }}>
                      <AttachFileButton multiple label="Файлы, фото, аудио, видео" onPicked={(a) => setDraftAttachments((d) => ({ ...d, [hw.id]: [...(d[hw.id] || []), a] }))} />
                      <VoiceRecordButton onRecorded={(a) => setDraftAttachments((d) => ({ ...d, [hw.id]: [...(d[hw.id] || []), a] }))} />
                      <button
                        className="btn-small accent"
                        disabled={!(drafts[hw.id] ?? hw.submissionText ?? "").trim() && !(draftAttachments[hw.id] || []).length}
                        onClick={() => { actions.submitHomework(student.id, hw.id, drafts[hw.id] ?? hw.submissionText ?? "", draftAttachments[hw.id] || []); setDraftAttachments((d) => ({ ...d, [hw.id]: [] })); }}
                      >
                        <Send size={12} /> {hw.status === "needs_revision" ? "Отправить исправленный вариант" : "Отправить ответ"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="hw-submission">
                    <div className="hint-text">Ваш ответ ({formatDateTime(hw.submittedAt)}):</div>
                    <p className="body-text">{hw.submissionText}</p>
                    <AttachmentList items={asList(hw.submissionAttachment, hw.submissionAttachments)} />
                    {hw.status === "reviewed" && hw.feedback && <div className="hw-feedback"><strong>Комментарий учителя:</strong> {hw.feedback}</div>}
                  </div>
                )}
              </div>
            )}

            {role === "teacher" && (
              <div style={{ marginTop: 8 }}>
                {(hw.submissionText || hw.submissionAttachment || (hw.submissionAttachments || []).length) ? (
                  <div className="hw-submission">
                    <div className="hint-text">Ответ ученика ({formatDateTime(hw.submittedAt)}):</div>
                    <p className="body-text">{hw.submissionText}</p>
                    <AttachmentList items={asList(hw.submissionAttachment, hw.submissionAttachments)} />

                    {canAct && hw.status === "submitted" && (
                      <button className="btn-small" style={{ marginTop: 6 }} onClick={() => actions.markHomeworkInReview(student.id, hw.id)}>Взять на проверку</button>
                    )}

                    {canAct && (hw.status === "submitted" || hw.status === "in_review") && (
                      <>
                        <textarea
                          className="mini-textarea"
                          style={{ marginTop: 6 }}
                          placeholder="Комментарий / замечания (нужны, если возвращаете на доработку)"
                          value={feedbackDrafts[hw.id] ?? ""}
                          onChange={(e) => setFeedbackDrafts({ ...feedbackDrafts, [hw.id]: e.target.value })}
                        />
                        <div className="row-gap">
                          <button className="btn-small accent" onClick={() => actions.reviewHomework(student.id, hw.id, feedbackDrafts[hw.id] || "")}>
                            <Check size={12} /> Принять
                          </button>
                          <button
                            className="btn-small danger"
                            disabled={!(feedbackDrafts[hw.id] || "").trim()}
                            onClick={() => actions.sendHomeworkForRevision(student.id, hw.id, feedbackDrafts[hw.id])}
                          >
                            Вернуть с замечаниями
                          </button>
                        </div>
                      </>
                    )}
                    {hw.status === "needs_revision" && hw.feedback && <div className="hw-feedback"><strong>Замечания отправлены:</strong> {hw.feedback}</div>}
                    {hw.status === "reviewed" && (
                      <>
                        {hw.feedback && <div className="hw-feedback"><strong>Ваш комментарий:</strong> {hw.feedback}</div>}
                        {canAct && (
                          <button className="btn-small" style={{ marginTop: 6 }} onClick={() => actions.reopenHomework(student.id, hw.id)}><RotateCcw size={11} /> Отменить проверку</button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <span className="muted-text">Ученик ещё не отправил ответ в кабинет</span>
                )}
                {canAct && (
                  <div className="hw-status-bar">
                    <span className="hint-text">Статус:</span>
                    {[["reviewed", "✓ Проверено"], ["needs_revision", "↩ На доработку"], ["not_done", "✗ Не выполнено"], ["assigned", "Задано"]].map(([st, lbl]) => (
                      <button key={st} className={"btn-small" + (hw.status === st ? " accent" : "")} disabled={st === "needs_revision" && !(feedbackDrafts[hw.id] || hw.feedback || "").trim()} title={st === "needs_revision" ? "Напишите замечания в поле комментария" : ""}
                        onClick={() => actions.setHomeworkStatus(student.id, hw.id, st, feedbackDrafts[hw.id])}>{lbl}</button>
                    ))}
                    {!(hw.submissionText || hw.submissionAttachment || (hw.submissionAttachments || []).length) && (
                      <input className="mini-input wide" placeholder="Комментарий ученику (нужен для «На доработку»)" value={feedbackDrafts[hw.id] ?? ""} onChange={(e) => setFeedbackDrafts({ ...feedbackDrafts, [hw.id]: e.target.value })} />
                    )}
                    <button className="btn-icon ghost" title="Удалить задание" onClick={() => { if (window.confirm("Удалить задание «" + hw.title + "»?")) actions.removeHomework(student.id, hw.id); }}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- message panel --------------------------- */

const MESSAGE_REACTIONS = QUICK_REACTIONS;

function VoiceRecordButton({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const dataUrl = await fileToDataURL(blob);
        onRecorded({ name: "Голосовое сообщение", type: "audio/webm", dataUrl });
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
    } catch (e) {
      console.error(e);
      setError("Браузер не дал доступ к микрофону (заблокировано настройками сайта/браузера или платформой показа этой страницы) — голосовые сообщения тут недоступны, попробуйте открыть страницу отдельной вкладкой и разрешить доступ к микрофону.");
    }
  }

  function stop() {
    if (mediaRef.current) mediaRef.current.stop();
    setRecording(false);
  }

  return (
    <>
      <button className={"btn-icon" + (recording ? " danger" : "")} onClick={recording ? stop : start} title={recording ? "Остановить запись" : "Записать голосовое сообщение"}>
        {recording ? "■" : "🎙"}
      </button>
      {error && <span className="hint-text" style={{ color: "var(--danger)" }}>{error}</span>}
    </>
  );
}

const ROLE_TONE = { teacher: "tone-teacher", student: "tone-student", admin: "tone-admin" };
const dayLabel = (iso) => {
  const d = new Date(iso); const t = new Date(); const y = new Date(); y.setDate(t.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  return same(d, t) ? "Сегодня" : same(d, y) ? "Вчера" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: d.getFullYear() === t.getFullYear() ? undefined : "numeric" });
};
const timeOf = (iso) => new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

function MessageBubble({ m, isMine, who, role, onToggleReaction, first, last }) {
  const [showReactions, setShowReactions] = useState(false);
  const pressTimer = React.useRef(null);
  const reactions = m.reactions || {};
  const startPress = () => { pressTimer.current = setTimeout(() => setShowReactions(true), 450); };
  const endPress = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  return (
    <div className={"chat-row " + (isMine ? "mine" : "theirs") + (last ? " last" : "")}>
      <div className={"chat-ava " + (ROLE_TONE[who.roleKey] || "")}>{last ? <Avatar name={who.name} photo={who.photo} size={34} /> : null}</div>
      <div className="chat-bubble-wrap">
        {first && <div className="chat-name">{isMine ? "Вы" : who.name}</div>}
        <div
          className={"chat-bubble " + (isMine ? "mine" : "theirs") + (first ? " first" : "") + (last ? " last" : "")}
          onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
          onTouchStart={startPress} onTouchEnd={endPress}
        >
          {m.text && <div className="chat-text">{m.text}</div>}
          {m.attachment && <div className="chat-att"><AttachmentView attachment={m.attachment} /></div>}
          <div className="chat-meta">
            {onToggleReaction && <button type="button" className="react-open" title="Ответить реакцией" aria-label="Ответить реакцией" onClick={() => setShowReactions((v) => !v)}>🙂</button>}
            <span className="chat-time">{timeOf(m.at)}</span>
          </div>
        </div>
        {Object.keys(reactions).length > 0 && (
          <div className="chat-reactions-summary">{Object.entries(reactions).map(([k, emoji]) => <span key={k} title={k === "teacher" ? "Преподаватель" : k === "student" ? "Ученик" : "Администрация"}>{emoji}</span>)}</div>
        )}
        {showReactions && (
          <div className="chat-reactions">
            {MESSAGE_REACTIONS.map((emoji) => (
              <button key={emoji} className={"reaction-btn" + (reactions[role] === emoji ? " active" : "")} onClick={() => { onToggleReaction(m.id, emoji); setShowReactions(false); }}>{emoji}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Messages with day separators; a run of messages from one person shows the name once and the avatar on the last one.
function ChatList({ messages, role, whoOf, onToggleReaction }) {
  const list = messages || [];
  return list.map((m, i) => {
    const prev = list[i - 1], next = list[i + 1];
    const newDay = !prev || new Date(prev.at).toDateString() !== new Date(m.at).toDateString();
    const nextNewDay = !next || new Date(next.at).toDateString() !== new Date(m.at).toDateString();
    const first = newDay || prev.sender !== m.sender || new Date(m.at) - new Date(prev.at) > 10 * 6e4;
    const last = nextNewDay || next.sender !== m.sender || new Date(next.at) - new Date(m.at) > 10 * 6e4;
    return (
      <React.Fragment key={m.id}>
        {newDay && <div className="chat-day"><span>{dayLabel(m.at)}</span></div>}
        <MessageBubble m={m} isMine={m.sender === role} who={whoOf(m)} role={role} onToggleReaction={onToggleReaction} first={first} last={last} />
      </React.Fragment>
    );
  });
}

function SimpleChatPanel({ messages, onSend, onToggleReaction, role, canAct, selfName, selfPhoto, otherName, otherPhoto, otherRoleKey, placeholder }) {
  const [text, setText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const boxRef = React.useRef(null);
  const list = messages || [];

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [list.length]);

  function send() {
    if (!text.trim() && !pendingAttachment) return;
    onSend(text.trim(), pendingAttachment);
    setText("");
    setPendingAttachment(null);
  }

  return (
    <div>
      <div className="chat-box" ref={boxRef}>
        {list.length === 0 && <div className="muted-text" style={{ padding: "10px 0" }}>Сообщений пока нет</div>}
        <ChatList messages={list} role={role} onToggleReaction={onToggleReaction}
          whoOf={(m) => (m.sender === role ? { name: selfName, photo: selfPhoto, roleKey: role } : { name: otherName, photo: otherPhoto, roleKey: m.sender })} />
      </div>
      {canAct && (
        <div>
          {pendingAttachment && (
            <div className="row-gap" style={{ marginBottom: 6 }}>
              <AttachmentView attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />
            </div>
          )}
          <div className="row-gap" style={{ marginTop: 8 }}>
            <input
              className="mini-input wide"
              placeholder={placeholder || "Написать сообщение…"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <EmojiPicker onPick={(e) => setText((t) => t + e)} />
            <AttachFileButton label="" onPicked={setPendingAttachment} />
            <VoiceRecordButton onRecorded={setPendingAttachment} />
            <button className="btn-icon" disabled={!text.trim() && !pendingAttachment} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagePanel({ student, actions, role, canAct, teacherName, teacherPhoto, studentName }) {
  const [text, setText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const messages = student.messages || [];
  const boxRef = React.useRef(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages.length]);

  function send() {
    if (!text.trim() && !pendingAttachment) return;
    actions.sendMessage(student.id, role, text.trim(), pendingAttachment);
    setText("");
    setPendingAttachment(null);
  }

  function toggleReaction(messageId, emoji) {
    actions.toggleMessageReaction(student.id, messageId, role, emoji);
  }

  return (
    <div>
      <div className="field-label">Переписка</div>
      <div className="hint-text" style={{ marginBottom: 6 }}>Нажмите 🙂 рядом с сообщением, чтобы ответить реакцией. Смайлы — кнопка в строке ввода.</div>
      <div className="chat-box" ref={boxRef}>
        {messages.length === 0 && <div className="muted-text" style={{ padding: "10px 0" }}>Сообщений пока нет</div>}
        <ChatList messages={messages} role={role} onToggleReaction={toggleReaction}
          whoOf={(m) => (m.sender === "teacher" ? { name: teacherName || "Преподаватель", photo: teacherPhoto, roleKey: "teacher" } : { name: studentName || "Ученик", photo: student.photo || "", roleKey: "student" })} />
      </div>
      {canAct && (
        <div>
          {pendingAttachment && (
            <div className="row-gap" style={{ marginBottom: 6 }}>
              <AttachmentView attachment={pendingAttachment} onRemove={() => setPendingAttachment(null)} />
            </div>
          )}
          <div className="row-gap" style={{ marginTop: 8 }}>
            <input
              className="mini-input wide"
              placeholder="Написать сообщение…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <EmojiPicker onPick={(e) => setText((t) => t + e)} />
            <AttachFileButton label="" onPicked={setPendingAttachment} />
            <VoiceRecordButton onRecorded={setPendingAttachment} />
            <button className="btn-icon" disabled={!text.trim() && !pendingAttachment} onClick={send}><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- slot row ------------------------------ */

function SlotRow({ slot, students, readOnly, onAssign, onCancel, onReschedule, onResolveRequest, onRequestReschedule, teacherLabel, onAddSlotTopic, onRemoveSlotTopic, onSetSlotMaterial, onTogglePaid, onSetMeetingLink, onSetSlotPaymentLink, onPayForSlot, onConfirmPayment, onDismissPaymentRequest, onEditDetails, products, teachers }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(slot.date);
  const [time, setTime] = useState(slot.time);
  const [assignId, setAssignId] = useState("");
  const [reqDate, setReqDate] = useState(slot.date);
  const [reqTime, setReqTime] = useState(slot.time);
  const [reqNote, setReqNote] = useState("");
  const [asking, setAsking] = useState(false);
  const [newTopicTag, setNewTopicTag] = useState("");
  const [materialDraft, setMaterialDraft] = useState(slot.lessonMaterial || "");
  const [showLessonNotes, setShowLessonNotes] = useState(false);
  const [linkDraft, setLinkDraft] = useState(slot.meetingLink || "");
  const [payLinkDraft, setPayLinkDraft] = useState(slot.slotPaymentLink || "");
  const [editingPayLink, setEditingPayLink] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [paying, setPaying] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({ duration: slot.duration, type: slot.type, trialName: slot.trialName || "" });
  const [payForm, setPayForm] = useState({ productId: products?.[0]?.id || "", teacherId: slot.teacherId });

  const student = students.find((s) => s.id === slot.studentId);
  const hasLessonInfo = (slot.topicsCovered && slot.topicsCovered.length > 0) || (slot.lessonMaterial && slot.lessonMaterial.trim());
  const isFuture = slot.date >= isoDate(0);

  return (
    <div className={"slot-row status-" + slot.status}>
      <div className="slot-when">
        <div className="slot-date">{formatDate(slot.date)}</div>
        <div className="slot-time"><Clock size={12} /> {slot.time} · {slot.duration} мин</div>
      </div>

      <div className="slot-mid">
        {teacherLabel && <span className="slot-student">{teacherLabel}</span>}
        <Pill tone={slot.type === "trial" ? "gold" : "default"}>{TYPE_LABELS[slot.type]}</Pill>
        <Pill tone={slot.status === "booked" ? "accent" : slot.status === "reschedule-requested" ? "gold" : slot.status === "cancelled" ? "danger" : "default"}>
          {SLOT_STATUS_LABELS[slot.status]}
        </Pill>
        {student && (
          !readOnly ? (
            <button className={"pill pill-clickable " + (slot.paid ? "pill-accent" : "pill-danger")} onClick={() => onTogglePaid(slot.id)} title="Отметить оплату">
              {slot.paid ? "Оплачено ✓" : "Не оплачено"}
            </button>
          ) : (
            <Pill tone={slot.paid ? "accent" : "danger"}>{slot.paid ? "Оплачено" : "Не оплачено"}</Pill>
          )
        )}
        {student && <span className="slot-student">{student.name}</span>}
        {!student && slot.trialName && <span className="slot-student">{slot.trialName} <Pill tone="gold">не в системе</Pill></span>}
        {slot.status === "reschedule-requested" && slot.requested && (
          <span className="slot-request-note">
            предложено: {formatDate(slot.requested.date)} {slot.requested.time}
            {slot.requested.note ? " — «" + slot.requested.note + "»" : ""}
          </span>
        )}
      </div>

      {student && !slot.paid && (
        <div className="meeting-link-row">
          {!readOnly ? (
            editingPayLink ? (
              <div className="row-gap">
                <input className="mini-input wide" placeholder="Ссылка на оплату этого занятия (ЮKassa и т.п.)" value={payLinkDraft} onChange={(e) => setPayLinkDraft(e.target.value)} />
                <button className="btn-icon" onClick={() => { onSetSlotPaymentLink(slot.id, payLinkDraft); setEditingPayLink(false); }}><Check size={12} /></button>
                <button className="btn-icon" onClick={() => setEditingPayLink(false)}><X size={12} /></button>
              </div>
            ) : (
              <button className="btn-small" onClick={() => setEditingPayLink(true)}>💳 {slot.slotPaymentLink ? "Изменить ссылку на оплату" : "Добавить ссылку на оплату"}</button>
            )
          ) : (
            slot.slotPaymentLink && <a href={slot.slotPaymentLink} target="_blank" rel="noreferrer" className="btn-small accent">💳 Оплатить по ссылке</a>
          )}
        </div>
      )}

      {student && (
        <div className="meeting-link-row">
          {!readOnly ? (
            editingLink ? (
              <div className="row-gap">
                <input className="mini-input wide" placeholder="Ссылка на занятие (Zoom/Meet/Skype)" value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} />
                <button className="btn-icon" onClick={() => { onSetMeetingLink(slot.id, linkDraft); setEditingLink(false); }}><Check size={12} /></button>
                <button className="btn-icon" onClick={() => setEditingLink(false)}><X size={12} /></button>
              </div>
            ) : (
              <button className="btn-small" onClick={() => setEditingLink(true)}><Paperclip size={11} /> {slot.meetingLink ? "Изменить ссылку на занятие" : "Добавить ссылку на занятие"}</button>
            )
          ) : slot.paid ? (
            slot.meetingLink ? <a href={slot.meetingLink} target="_blank" rel="noreferrer" className="attachment-file">🔗 Ссылка на занятие</a> : <span className="muted-text">Ссылка пока не добавлена учителем</span>
          ) : (
            <span className="muted-text locked-link">🔒 Ссылка появится после оплаты</span>
          )}
        </div>
      )}

      {readOnly && student && !slot.paid && onPayForSlot && (
        <div className="pay-slot-row">
          {slot.paymentRequest ? (
            <div className="hint-text">💳 Запрос на оплату отправлен {formatDateTime(slot.paymentRequest.requestedAt)}, ожидайте подтверждения от учителя.</div>
          ) : !paying ? (
            <button className="btn-small accent" onClick={() => setPaying(true)}>💳 Оплатить занятие</button>
          ) : (
            <div className="add-panel">
              <select className="mini-select" value={payForm.productId} onChange={(e) => setPayForm({ ...payForm, productId: e.target.value })}>
                {(products || []).map((p) => <option key={p.id} value={p.id}>{p.name} — {fmtMoney(p.price)}</option>)}
              </select>
              <select className="mini-select" value={payForm.teacherId} onChange={(e) => setPayForm({ ...payForm, teacherId: e.target.value })}>
                {(teachers || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {(() => {
                const chosen = (products || []).find((p) => p.id === payForm.productId);
                return chosen && chosen.paymentLink ? (
                  <a className="btn-small accent" href={chosen.paymentLink} target="_blank" rel="noreferrer">🔗 Перейти к оплате в ЮKassa</a>
                ) : (
                  <div className="hint-text">Ссылка на оплату для этого товара пока не настроена администратором — оплатите school напрямую и нажмите кнопку ниже.</div>
                );
              })()}
              <div className="row-gap">
                <button className="btn-small" onClick={() => { onPayForSlot(slot.id, payForm); setPaying(false); }}>📨 Сообщить учителю об оплате</button>
                <button className="btn-small" onClick={() => setPaying(false)}>Отмена</button>
              </div>
              <div className="hint-text">Это не подтверждение оплаты — только уведомление. Занятие станет отмеченным как оплаченное после проверки учителем или администратором.</div>
            </div>
          )}
        </div>
      )}

      {!readOnly && slot.paymentRequest && !slot.paid && (
        <div className="pay-slot-row">
          <div className="add-panel">
            <div className="hint-text">💳 Ученик сообщил об оплате {formatDateTime(slot.paymentRequest.requestedAt)}. Подтвердите после проверки поступления средств.</div>
            <div className="row-gap">
              <button className="btn-small accent" onClick={() => onConfirmPayment(slot.id)}><Check size={12} /> Подтвердить оплату</button>
              <button className="btn-small" onClick={() => onDismissPaymentRequest(slot.id)}>Отклонить</button>
            </div>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="slot-actions">
          {slot.status === "available" && (
            <>
              <select value={assignId} onChange={(e) => setAssignId(e.target.value)} className="mini-select">
                <option value="">Назначить ученика…</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="btn-icon" disabled={!assignId} onClick={() => { onAssign(slot.id, assignId); setAssignId(""); }} title="Забронировать"><Check size={14} /></button>
              <button className="btn-icon danger" onClick={() => onCancel(slot.id)} title="Удалить слот"><Trash2 size={14} /></button>
            </>
          )}

          {slot.status === "booked" && !editing && !editingDetails && (
            <>
              <button className="btn-small" onClick={() => setEditing(true)}><Pencil size={12} /> Перенести</button>
              {onEditDetails && <button className="btn-small" onClick={() => { setDetailsDraft({ duration: slot.duration, type: slot.type, trialName: slot.trialName || "", format: slotKind(slot, students), isCheck: !!slot.isCheck }); setEditingDetails(true); }}><Pencil size={12} /> Изменить детали</button>}
              <button className="btn-icon danger" onClick={() => onCancel(slot.id)} title="Отменить"><Trash2 size={14} /></button>
            </>
          )}

          {slot.status === "booked" && editingDetails && (
            <div className="add-panel">
              <div className="row-gap">
                <select className="mini-select" value={detailsDraft.duration} onChange={(e) => setDetailsDraft({ ...detailsDraft, duration: Number(e.target.value) })}>
                  <option value={30}>30 мин</option><option value={45}>45 мин</option><option value={60}>60 мин</option><option value={90}>90 мин</option>
                </select>
                <select className="mini-select" value={detailsDraft.type} onChange={(e) => setDetailsDraft({ ...detailsDraft, type: e.target.value, format: e.target.value === "trial" ? "trial" : detailsDraft.format === "trial" ? "individual" : detailsDraft.format })}>
                  <option value="trial">Пробный урок</option><option value="regular">Обычный урок</option>
                </select>
                <label className="hint-text" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><input type="checkbox" checked={!!detailsDraft.isCheck} onChange={(e) => setDetailsDraft({ ...detailsDraft, isCheck: e.target.checked })} /> 📝 Контрольный срез</label>
                <select className="mini-select" title="Формат урока: от него зависит ставка преподавателя" value={detailsDraft.format || "individual"} onChange={(e) => setDetailsDraft({ ...detailsDraft, format: e.target.value })}>
                  {Object.entries(LESSON_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              {!slot.studentId && (
                <input className="mini-input wide" placeholder="Имя записавшегося" value={detailsDraft.trialName} onChange={(e) => setDetailsDraft({ ...detailsDraft, trialName: e.target.value })} />
              )}
              <div className="row-gap">
                <button className="btn-icon" onClick={() => { onEditDetails(slot.id, detailsDraft); setEditingDetails(false); }} title="Сохранить"><Check size={14} /></button>
                <button className="btn-icon" onClick={() => setEditingDetails(false)} title="Отмена"><X size={14} /></button>
              </div>
            </div>
          )}

          {slot.status === "booked" && editing && (
            <>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mini-input" />
              <select className="mini-select" value={time} onChange={(e) => setTime(e.target.value)}>{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
              <button className="btn-icon" onClick={() => { onReschedule(slot.id, date, time); setEditing(false); }} title="Сохранить"><Check size={14} /></button>
              <button className="btn-icon" onClick={() => setEditing(false)} title="Отмена"><X size={14} /></button>
            </>
          )}

          {slot.status === "reschedule-requested" && (
            <>
              <button className="btn-small accent" onClick={() => onResolveRequest(slot.id, true)}>Принять перенос</button>
              <button className="btn-small" onClick={() => onResolveRequest(slot.id, false)}>Отклонить</button>
            </>
          )}
        </div>
      )}

      {readOnly && slot.status === "booked" && onRequestReschedule && !asking && (new Date(slot.date + "T" + slot.time + ":00").getTime() - Date.now()) / 36e5 > CHANGE_DEADLINE_H && (
        <div className="slot-actions">
          <button className="btn-small" onClick={() => setAsking(true)}><RotateCcw size={12} /> Предложить перенос</button>
        </div>
      )}

      {readOnly && asking && (
        <div className="slot-actions">
          <input type="date" value={reqDate} onChange={(e) => setReqDate(e.target.value)} className="mini-input" />
          <select className="mini-select" value={reqTime} onChange={(e) => setReqTime(e.target.value)}>{TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <input type="text" placeholder="Комментарий (необязательно)" value={reqNote} onChange={(e) => setReqNote(e.target.value)} className="mini-input wide" />
          <button className="btn-icon" onClick={() => { onRequestReschedule(slot.id, reqDate, reqTime, reqNote); setAsking(false); }}><Check size={14} /></button>
          <button className="btn-icon" onClick={() => setAsking(false)}><X size={14} /></button>
        </div>
      )}

      {slot.history && slot.history.length > 0 && (
        <div className="slot-history">
          история переносов: {slot.history.map((h, i) => (
            <span key={i}>{formatDate(h.date)} {h.time}{i < slot.history.length - 1 ? " → " : ""}</span>
          ))}
        </div>
      )}

      {slot.studentId && (readOnly ? hasLessonInfo : true) && (
        <div className="lesson-notes">
          {!readOnly && (
            <button className="btn-small" onClick={() => setShowLessonNotes((v) => !v)}>
              <BookOpen size={11} /> {showLessonNotes ? "Скрыть заметки урока" : (isFuture ? "Тема и план урока" : "Пройденные темы и материалы")}
            </button>
          )}

          {(readOnly || showLessonNotes) && (
            <div className="lesson-notes-body">
              {(slot.topicsCovered && slot.topicsCovered.length > 0) && (
                <div className="chip-row" style={{ marginBottom: 6 }}>
                  {slot.topicsCovered.map((name) => (
                    <span key={name} className={"chip " + (isFuture ? "chip-in_progress" : "chip-done")}>
                      {name}
                      {!readOnly && <button className="topic-remove" style={{ marginLeft: 4 }} onClick={() => onRemoveSlotTopic(slot.id, name)}><X size={10} /></button>}
                    </span>
                  ))}
                </div>
              )}
              {!readOnly && (
                <div className="row-gap" style={{ marginBottom: 8 }}>
                  <input className="mini-input wide" placeholder={isFuture ? "Тема урока (Enter)" : "Пройденная тема (Enter)"} value={newTopicTag}
                    onChange={(e) => setNewTopicTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && newTopicTag.trim()) { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); } }}
                  />
                  <button className="btn-icon" disabled={!newTopicTag.trim()} onClick={() => { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); }}><Plus size={13} /></button>
                </div>
              )}

              {readOnly ? (
                slot.lessonMaterial && <p className="body-text">{slot.lessonMaterial}</p>
              ) : (
                <>
                  <textarea
                    className="mini-textarea"
                    placeholder={isFuture ? "План урока, материалы к занятию, ссылки..." : "Материалы для повторения, ссылка на запись урока, видео..."}
                    value={materialDraft}
                    onChange={(e) => setMaterialDraft(e.target.value)}
                    onBlur={() => onSetSlotMaterial(slot.id, materialDraft)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------- schedule table --------------------------- */

function PastLessonCard({ slot, students, editable, onAddSlotTopic, onRemoveSlotTopic, onSetSlotMaterial, onAddSlotFile, onRemoveSlotFile }) {
  const student = students.find((s) => s.id === slot.studentId);
  const [linkDraft, setLinkDraft] = useState("");
  const [newTopicTag, setNewTopicTag] = useState("");
  const [materialDraft, setMaterialDraft] = useState(slot.lessonMaterial || "");

  if (slot.status === "cancelled") {
    return (
      <div className="past-lesson-card cancelled">
        <div className="row-gap" style={{ justifyContent: "space-between" }}>
          <strong>{formatDate(slot.date)}, {slot.time}</strong>
          <Pill tone="danger">Отменено</Pill>
        </div>
        {(student || slot.trialName) && <div className="muted-text">{student ? student.name : slot.trialName}</div>}
      </div>
    );
  }

  return (
    <div className="past-lesson-card">
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <strong>{formatDate(slot.date)}, {slot.time}</strong>
        <Pill tone={slot.paid ? "accent" : "danger"}>{slot.paid ? "Оплачено" : "Не оплачено"}</Pill>
      </div>
      {(student || slot.trialName) && <div className="muted-text" style={{ marginBottom: 6 }}>{student ? student.name : slot.trialName + " (не в системе)"}</div>}

      <div className="field-label" style={{ marginTop: 4 }}>Пройденные темы</div>
      {slot.topicsCovered && slot.topicsCovered.length > 0 && (
        <div className="chip-row" style={{ marginBottom: 6 }}>
          {slot.topicsCovered.map((name) => (
            <span key={name} className="chip chip-done">
              {name}
              {editable && <button className="topic-remove" style={{ marginLeft: 4 }} onClick={() => onRemoveSlotTopic(slot.id, name)}><X size={10} /></button>}
            </span>
          ))}
        </div>
      )}
      {editable && (
        <div className="row-gap" style={{ marginBottom: 8 }}>
          <input
            className="mini-input wide" placeholder="Пройденная тема (Enter)" value={newTopicTag}
            onChange={(e) => setNewTopicTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newTopicTag.trim()) { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); } }}
          />
          <button className="btn-icon" disabled={!newTopicTag.trim()} onClick={() => { onAddSlotTopic(slot.id, newTopicTag.trim()); setNewTopicTag(""); }}><Plus size={13} /></button>
        </div>
      )}

      <div className="field-label">Материалы урока для повторения</div>
      <LessonFiles slot={slot} />
      {editable && onAddSlotFile && (
        <div className="row-gap" style={{ margin: "6px 0", flexWrap: "wrap" }}>
          <AttachFileButton multiple label="Прикрепить файлы, аудио, видео" onPicked={(a) => onAddSlotFile(slot.id, a)} />
          <input className="mini-input wide" placeholder="Ссылка (запись урока, презентация, видео) — Enter" value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && /^https?:\/\//.test(linkDraft.trim())) { onAddSlotFile(slot.id, { url: linkDraft.trim() }); setLinkDraft(""); } }} />
          {(slot.lessonFiles || []).length > 0 && <button className="btn-small" onClick={() => onRemoveSlotFile(slot.id, (slot.lessonFiles || []).length - 1)}>Убрать последний</button>}
        </div>
      )}
      <div className="field-label">Что было на уроке</div>
      {editable ? (
        <textarea
          className="mini-textarea" placeholder="Что было на уроке, материалы для повторения, ссылка на запись..."
          value={materialDraft} onChange={(e) => setMaterialDraft(e.target.value)}
          onBlur={() => onSetSlotMaterial(slot.id, materialDraft)}
        />
      ) : (
        slot.lessonMaterial ? <p className="body-text">{slot.lessonMaterial}</p> : <span className="muted-text">Учитель ещё не оставил заметки</span>
      )}
    </div>
  );
}

function PastLessonsSection({ count, children }) {
  const [open, setOpen] = useState(false);
  if (count === 0) return null;
  return (
    <div className="past-lessons-section">
      <button className="past-lessons-toggle" onClick={() => setOpen((v) => !v)}>
        <span className={"past-chevron" + (open ? " open" : "")}>›</span> Прошедшие занятия ({count}){!open && " — показать"}
      </button>
      {open && <div className="slot-list past-list">{children}</div>}
    </div>
  );
}

function LessonPlanTimeline({ slots }) {
  const todayIso = isoDate(0);
  const relevant = slots
    .filter((sl) => sl.studentId && sl.status !== "cancelled" && ((sl.topicsCovered && sl.topicsCovered.length > 0) || (sl.lessonMaterial && sl.lessonMaterial.trim())))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (relevant.length === 0) return null;

  return (
    <div className="field-block">
      <div className="field-label">План занятий: пройденные и предстоящие темы</div>
      <div className="lesson-plan-timeline">
        {relevant.map((sl) => {
          const isPast = sl.date < todayIso;
          return (
            <div key={sl.id} className={"lesson-plan-row " + (isPast ? "done" : "upcoming")}>
              <div className="lesson-plan-dot" />
              <div className="lesson-plan-body">
                <div className="row-gap" style={{ justifyContent: "space-between" }}>
                  <strong>{formatDate(sl.date)}</strong>
                  <Pill tone={isPast ? "accent" : "gold"}>{isPast ? "Пройдено" : "Запланировано"}</Pill>
                </div>
                {sl.topicsCovered && sl.topicsCovered.length > 0 && (
                  <div className="chip-row" style={{ marginTop: 4 }}>
                    {sl.topicsCovered.map((t) => <span key={t} className={"chip " + (isPast ? "chip-done" : "chip-in_progress")}>{t}</span>)}
                  </div>
                )}
                {sl.lessonMaterial && <p className="body-text" style={{ marginTop: 4 }}>{sl.lessonMaterial}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleTable({ slots, students, teacherId, teacherOptions, teachersById, editable, actions, mode, products, allTeachers }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [addingCell, setAddingCell] = useState(null);
  const [addForm, setAddForm] = useState({ time: "17:00", duration: 60, type: "trial", teacherId: teacherId || (teacherOptions && teacherOptions[0]?.id), studentId: "", trialName: "" });
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const dayIso = (d) => localDateStr(d);
  const todayIso = isoDate(0);

  const weekSlots = slots.filter((sl) => sl.status !== "cancelled" && days.some((d) => dayIso(d) === sl.date));
  const selectedSlot = slots.find((sl) => sl.id === selectedSlotId);

  function studentsFor(tid) {
    return teachersById ? students.filter((s) => s.teacherId === tid) : students;
  }

  function cellSlots(dateIso, hour) {
    const seen = new Set();
    return weekSlots.filter((sl) => sl.date === dateIso && sl.time.slice(0, 2) === hour.slice(0, 2)).filter((sl) => {
      if (!sl.groupId) return true;
      const k = sl.groupId + sl.date + sl.time;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }

  function openAdd(dateIso, hour) {
    setSelectedSlotId(null);
    setAddingCell({ date: dateIso, hourClicked: hour });
    setAddForm({ time: hour, duration: 60, type: "trial", teacherId: teacherId || (teacherOptions && teacherOptions[0]?.id), studentId: "", trialName: "" });
  }

  function submitAdd() {
    actions.addSlot(addForm.teacherId, {
      date: addingCell.date, time: addForm.time, duration: addForm.duration, type: addForm.type,
      studentId: addForm.studentId || null, trialName: addForm.trialName.trim(),
    });
    setAddingCell(null);
  }

  return (
    <div className="schedule-wrap">
      <div className="schedule-nav">
        <button className="btn-small" onClick={() => setWeekStart(shiftWeek(weekStart, -1))}>← Пред. неделя</button>
        <span className="schedule-range">{fmtWeekRange(days[0], days[6])}</span>
        <button className="btn-small" onClick={() => setWeekStart(mondayOf(new Date()))}>Сегодня</button>
        <button className="btn-small" onClick={() => setWeekStart(shiftWeek(weekStart, 1))}>След. неделя →</button>
      </div>

      <div className="schedule-grid-scroll">
        <div className="schedule-grid" style={{ gridTemplateColumns: "56px repeat(7,1fr)" }}>
          <div className="schedule-corner" />
          {days.map((d) => (
            <div key={dayIso(d)} className={"schedule-day-head" + (dayIso(d) === todayIso ? " is-today" : "")}>
              <div className="schedule-day-name">{d.toLocaleDateString("ru-RU", { weekday: "short" })}</div>
              <div className="schedule-day-date">{d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</div>
            </div>
          ))}

          {HOURS.map((h) => (
            <React.Fragment key={h}>
              <div className="schedule-time-label">{h}</div>
              {days.map((d) => {
                const iso = dayIso(d);
                const cs = cellSlots(iso, h);
                return (
                  <div
                    key={iso + h}
                    className={"schedule-cell" + (cs.length === 0 && editable ? " is-empty" : "")}
                    onClick={() => { if (cs.length === 0 && editable) openAdd(iso, h); }}
                  >
                    {cs.map((sl) => {
                      const t = teachersById ? teachersById[sl.teacherId] : null;
                      const who = sl.groupName ? "👥 " + sl.groupName : sl.status === "available" ? (sl.type === "trial" ? "Пробный" : "Свободно") : (studentsFor(sl.teacherId).find((s) => s.id === sl.studentId)?.name || sl.trialName || "—");
                      return (
                        <button
                          key={sl.id}
                          className={"schedule-chip status-" + sl.status}
                          onClick={(e) => { e.stopPropagation(); setAddingCell(null); setSelectedSlotId(sl.id); }}
                        >
                          <span className="chip-time">{sl.time}</span>
                          <span className="chip-info"><span className="slot-kind" title={LESSON_KINDS[slotKind(sl, students)]}>{LESSON_KINDS[slotKind(sl, students)].split(" ")[0]}{sl.isCheck ? "📝" : ""}</span>{t ? t.name.split(" ")[0] + " · " : ""}{who}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {addingCell && (
        <div className="add-panel schedule-add-panel">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <strong>{formatDate(addingCell.date)}</strong>
            <button className="btn-icon" onClick={() => setAddingCell(null)} title="Закрыть"><X size={14} /></button>
          </div>
          {teacherOptions && (
            <select className="mini-select" value={addForm.teacherId} onChange={(e) => setAddForm({ ...addForm, teacherId: e.target.value })}>
              {teacherOptions.map((t) => <option key={t.id} value={t.id}>{t.name} — {SUBJECTS[t.subject].label}</option>)}
            </select>
          )}
          <div className="row-gap">
            <span className="hint-text">Время:</span>
            <select className="mini-select" value={addForm.time} onChange={(e) => setAddForm({ ...addForm, time: e.target.value })}>
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="mini-select" value={addForm.duration} onChange={(e) => setAddForm({ ...addForm, duration: Number(e.target.value) })}>
              <option value={30}>30 мин</option><option value={45}>45 мин</option><option value={60}>60 мин</option><option value={90}>90 мин</option>
            </select>
            <select className="mini-select" value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}>
              <option value="trial">Пробный урок</option><option value="regular">Обычный урок</option>
            </select>
          </div>
          <div className="row-gap">
            <span className="hint-text">Ученик:</span>
            <select className="mini-select" value={addForm.studentId} onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value, trialName: e.target.value ? "" : addForm.trialName })}>
              <option value="">Не назначать — свободный слот</option>
              {studentsFor(addForm.teacherId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {!addForm.studentId && addForm.type === "trial" && (
            <input
              className="mini-input wide"
              placeholder="Имя записавшегося на пробный (если его ещё нет в системе)"
              value={addForm.trialName}
              onChange={(e) => setAddForm({ ...addForm, trialName: e.target.value })}
            />
          )}
          <div className="row-gap">
            <button className="btn-small accent" disabled={!addForm.teacherId} onClick={submitAdd}><Check size={12} /> Назначить урок</button>
            <button className="btn-small" onClick={() => setAddingCell(null)}>Отмена</button>
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="schedule-detail">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <span className="field-label" style={{ margin: 0 }}>Детали занятия</span>
            <button className="btn-icon" onClick={() => setSelectedSlotId(null)} title="Закрыть"><X size={14} /></button>
          </div>
          <SlotRow
            slot={selectedSlot}
            students={studentsFor(selectedSlot.teacherId)}
            readOnly={!editable}
            teacherLabel={teachersById ? teachersById[selectedSlot.teacherId]?.name : undefined}
            onAssign={actions.assignSlot}
            onCancel={(id) => { actions.cancelSlot(id); setSelectedSlotId(null); }}
            onReschedule={actions.rescheduleSlot}
            onResolveRequest={actions.resolveRequest}
            onRequestReschedule={mode === "student" ? actions.requestReschedule : undefined}
            onAddSlotTopic={actions.addSlotTopic}
            onRemoveSlotTopic={actions.removeSlotTopic}
            onSetSlotMaterial={actions.setSlotMaterial}
            onTogglePaid={actions.toggleSlotPaid}
            onSetMeetingLink={actions.setMeetingLink}
            onSetSlotPaymentLink={actions.setSlotPaymentLink}
            onPayForSlot={undefined}
            onConfirmPayment={actions.confirmPayment}
            onDismissPaymentRequest={actions.dismissPaymentRequest}
            onEditDetails={editable ? actions.updateSlotDetails : undefined}
            products={products}
            teachers={allTeachers}
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------- package tracker --------------------------- */

function PackageTracker({ student, actions, canEdit, products, slots, subject }) {
  const today = isoDate(0);
  const usedCount = (slots || []).filter((sl) =>
    sl.studentId === student.id && sl.type === "regular" && sl.status !== "cancelled" && sl.date < today &&
    (!student.packageAssignedAt || sl.date >= student.packageAssignedAt)
  ).length;
  const remaining = student.packageTotal ? Math.max(0, student.packageTotal - usedCount) : null;
  const displayLabel = student.packageLabel || (student.packageTotal ? "Пакет на " + student.packageTotal + " занятий" : "");
  const [expanded, setExpanded] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState(student.packageLabel || "");
  const [customCount, setCustomCount] = useState(student.packageTotal || "");

  function pickStandard(count) {
    setCustomOpen(false);
    const match = (products || []).find((p) => p.subject === subject && p.lessonsIncluded === count);
    actions.setPackagePlan(student.id, {
      packageProductId: match ? match.id : null,
      packageTotal: count,
      packageLabel: "Пакет на " + count + " занятий",
    });
    setExpanded(false);
  }

  function pickIndividual() {
    setCustomOpen(false);
    actions.setPackagePlan(student.id, { packageProductId: null, packageTotal: null, packageLabel: "" });
    setExpanded(false);
  }

  function saveCustom() {
    actions.setPackagePlan(student.id, {
      packageProductId: null,
      packageTotal: customCount === "" ? null : Number(customCount),
      packageLabel: customLabel.trim() || (customCount ? "Пакет на " + customCount + " занятий" : ""),
    });
    setCustomOpen(false);
    setExpanded(false);
  }

  if (student.umbrellaId) return <div className="hint-text">🌂 Занятия списываются с комплексного пакета «Под одним зонтом».</div>;
  if (!canEdit && !student.packageTotal) return null;

  const isIndividual = !student.packageTotal;
  const PRESETS = [4, 6, 8, 12];
  const isPreset = (n) => student.packageTotal === n && student.packageLabel === "Пакет на " + n + " занятий";
  const isCustomActive = student.packageTotal && !PRESETS.some(isPreset) && !isIndividual;

  return (
    <div className="package-widget">
      <button className={"package-badge" + (!canEdit ? " readonly" : "")} onClick={() => canEdit && setExpanded((v) => !v)} disabled={!canEdit}>
        <span>📦 {student.packageTotal ? displayLabel : "Индивидуальный план"}</span>
        {student.packageTotal !== null && student.packageTotal !== undefined && student.packageTotal > 0 && (
          <span className="package-badge-remaining">осталось {remaining} из {student.packageTotal}</span>
        )}
        {canEdit && <span className={"package-chevron" + (expanded ? " open" : "")}>›</span>}
      </button>

      {!!student.packageTotal && (
        <div className="progress-track package-mini-progress">
          <div className="progress-fill" style={{ width: Math.round((usedCount / student.packageTotal) * 100) + "%" }} />
        </div>
      )}

      {canEdit && expanded && (
        <div className="package-expand-panel">
          <div className="package-quick-picks">
            <button className={"btn-small" + (isIndividual ? " accent" : "")} onClick={pickIndividual}>Индивидуальный план</button>
            {PRESETS.map((n) => <button key={n} className={"btn-small" + (isPreset(n) ? " accent" : "")} onClick={() => pickStandard(n)}>Пакет на {n} занятий</button>)}
            {student.format === "self" && <button className="btn-small" onClick={() => { actions.setPackagePlan(student.id, { packageProductId: null, packageTotal: 4, packageLabel: "«Сам, но не один»: абонемент на месяц, 4 занятия" }); setExpanded(false); }}>☂️ Абонемент на месяц (4 занятия)</button>}
            <button className={"btn-small" + (customOpen || isCustomActive ? " accent" : "")} onClick={() => setCustomOpen((v) => !v)}>Свой вариант</button>
          </div>
          {customOpen && (
            <div className="row-gap" style={{ marginTop: 6 }}>
              <input className="mini-input wide" placeholder="Название плана (например «Пакет на 8 занятий»)" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
              <input type="number" min="0" className="mini-input" style={{ width: 70 }} placeholder="Занятий" value={customCount} onChange={(e) => setCustomCount(e.target.value)} />
              <button className="btn-icon" onClick={saveCustom}><Check size={14} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------- checkpoints panel -------------------------- */

function CheckpointsPanel({ student, actions, canEdit }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", maxScore: "", achievedScore: "", note: "", kind: "check", date: isoDate(0) });
  const items = [...(student.checkpoints || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div>
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <div className="field-label" style={{ margin: 0 }}>Контрольные срезы и пробники</div>
        {canEdit && <button className="btn-icon" onClick={() => setShowAdd((v) => !v)}><Plus size={13} /></button>}
      </div>

      {showAdd && canEdit && (
        <div className="add-panel">
          <div className="row-gap" style={{ justifyContent: "space-between" }}>
            <span className="hint-text">Новый срез / тест</span>
            <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={14} /></button>
          </div>
          <div className="row-gap" style={{ flexWrap: "wrap" }}>
            {Object.entries(CHECK_KINDS).map(([k, l]) => <button key={k} className={"btn-small" + (form.kind === k ? " accent" : "")} onClick={() => setForm({ ...form, kind: k })}>{l}</button>)}
            <input type="date" className="mini-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <input className="mini-input wide" placeholder="Название (напр. «Срез по теме Право» или «IELTS Mock Test»)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="row-gap">
            <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Из скольки" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
            <span className="hint-text">из</span>
            <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Набрал(а)" value={form.achievedScore} onChange={(e) => setForm({ ...form, achievedScore: e.target.value })} />
          </div>
          <input className="mini-input wide" placeholder="Комментарий (необязательно)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button
            className="btn-small accent"
            disabled={!form.title.trim() || !form.maxScore || form.achievedScore === ""}
            onClick={() => { actions.addCheckpoint(student.id, form); setForm({ title: "", maxScore: "", achievedScore: "", note: "", kind: "check", date: isoDate(0) }); setShowAdd(false); }}
          ><Check size={12} /> Добавить результат</button>
        </div>
      )}

      {items.length === 0 && <div className="muted-text">Проверок пока не было</div>}
      <div className="checkpoint-list">
        {items.map((c) => {
          const pct = c.maxScore ? Math.round((c.achievedScore / c.maxScore) * 100) : 0;
          return (
            <div key={c.id} className="checkpoint-item">
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <strong>{c.kind && CHECK_KINDS[c.kind] && <span className="ck-kind">{CHECK_KINDS[c.kind]}</span>}{c.title}</strong>
                {canEdit && <button className="topic-remove" onClick={() => actions.removeCheckpoint(student.id, c.id)}><X size={12} /></button>}
              </div>
              <div className="row-gap">
                <span className="checkpoint-score">{c.achievedScore} / {c.maxScore}</span>
                <ProgressBar value={pct} />
              </div>
              {c.note && <div className="hint-text">{c.note}</div>}
              <div className="hint-text">{formatDate(c.date)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------- teacher-change request (admin) ------------------- */

function TeacherChangeRequestAdmin({ student, teachers, actions }) {
  const [pickTeacherId, setPickTeacherId] = useState("");
  const currentTeacher = teachers.find((t) => t.id === student.teacherId);
  const sameSubjectTeachers = teachers.filter((t) => t.subject === currentTeacher?.subject && t.id !== student.teacherId);

  return (
    <div>
      <div className="field-label">Смена учителя</div>
      <label className="row-gap" style={{ fontSize: 12.5, marginBottom: 6 }}>
        <input type="checkbox" checked={!!student.canRequestTeacherChange} onChange={() => actions.toggleCanRequestTeacherChange(student.id)} />
        Разрешить ученику отправить запрос на смену учителя
      </label>

      {student.teacherChangeRequest && (
        <div className="add-panel">
          <div className="hint-text">Ученик запросил смену учителя {formatDateTime(student.teacherChangeRequest.at)}{student.teacherChangeRequest.note ? ": «" + student.teacherChangeRequest.note + "»" : ""}</div>
          <div className="row-gap">
            <select className="mini-select" value={pickTeacherId} onChange={(e) => setPickTeacherId(e.target.value)}>
              <option value="">Выбрать нового учителя…</option>
              {sameSubjectTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn-small accent" disabled={!pickTeacherId} onClick={() => { actions.reassignStudentTeacher(student.id, pickTeacherId); setPickTeacherId(""); }}>Перевести</button>
            <button className="btn-small" onClick={() => actions.dismissTeacherChangeRequest(student.id)}>Отклонить запрос</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- page customizer ---------------------------- */

const STICKER_CHOICES = ["⭐", "🏆", "🔥", "🎯", "📚", "🎓", "💪", "🌟", "✅", "❤️"];
const BANNER_COLORS = ["", "#F3E6C6", "#E8E1F2", "#DCEEF5", "#F5DCDC", "#DCEDEC", "#F3E1D6"];

const ACCENT_CHOICES = ["", "#2F6F73", "#B8303C", "#5B7FB5", "#C9922E", "#3F8F5E", "#7A5BA6", "#1E2B2F"];

function PageCustomizer({ theme, onUpdate, photo, onPhoto }) {
  const t = theme || { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] };
  const [busy, setBusy] = useState(false);

  function toggleSticker(s) {
    const has = (t.stickers || []).includes(s);
    const next = has ? t.stickers.filter((x) => x !== s) : [...(t.stickers || []), s];
    onUpdate({ ...t, stickers: next });
  }

  async function handleBannerFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES * 2) { alert("Изображение слишком большое (максимум ~3 МБ)."); return; }
    setBusy(true);
    try {
      const url = await fileToDataURL(file);
      onUpdate({ ...t, bannerImage: url });
    } catch (err) { console.error(err); }
    setBusy(false);
  }

  return (
    <div>
      <div className="field-label">Оформление страницы</div>
      <div className="hint-text" style={{ marginBottom: 6 }}>Фото, цвет страницы, баннер, эмодзи и наклейки. Видно вам и вашим преподавателям или ученикам.</div>
      {onPhoto && (
        <div className="row-gap" style={{ marginBottom: 8 }}>
          <Avatar name="" photo={photo} size={40} />
          <label className="btn-small"><Paperclip size={11} /> {photo ? "Сменить фото" : "Загрузить фото профиля"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; if (f.size > MAX_ATTACHMENT_BYTES) { alert("Фото больше 4 МБ."); return; } onPhoto(await fileToDataURL(f)); }} />
          </label>
          {photo && <button className="btn-small" onClick={() => onPhoto("")}>Убрать фото</button>}
        </div>
      )}
      <div className="hint-text" style={{ marginBottom: 4 }}>Цвет страницы:</div>
      <div className="row-gap" style={{ marginBottom: 8 }}>
        {ACCENT_CHOICES.map((c, i) => (
          <button key={i} className={"color-swatch" + ((t.accentColor || "") === c ? " selected" : "")} style={{ background: c || "repeating-linear-gradient(45deg, #ddd, #ddd 4px, #fff 4px, #fff 8px)" }} onClick={() => onUpdate({ ...t, accentColor: c })} title={c ? "Цвет " + c : "как у предмета"} />
        ))}
      </div>
      <div className="hint-text" style={{ marginBottom: 4 }}>Баннер:</div>

      <div className="row-gap" style={{ marginBottom: 8 }}>
        {BANNER_COLORS.map((c, i) => (
          <button
            key={i}
            className={"color-swatch" + (t.bannerColor === c && !t.bannerImage ? " selected" : "")}
            style={{ background: c || "repeating-linear-gradient(45deg, #ddd, #ddd 4px, #fff 4px, #fff 8px)" }}
            onClick={() => onUpdate({ ...t, bannerColor: c, bannerImage: "" })}
            title={c || "без баннера"}
          />
        ))}
        <input
          type="color"
          className="color-picker-native"
          value={t.bannerColor && t.bannerColor.startsWith("#") ? t.bannerColor : "#e8e1f2"}
          onChange={(e) => onUpdate({ ...t, bannerColor: e.target.value, bannerImage: "" })}
          title="Свой цвет"
        />
      </div>

      <div className="row-gap" style={{ marginBottom: 8 }}>
        <label className="btn-small">
          <Paperclip size={11} /> {busy ? "Загрузка…" : "Загрузить картинку баннера"}
          <input type="file" accept="image/*" onChange={handleBannerFile} style={{ display: "none" }} />
        </label>
        {t.bannerImage && <button className="btn-small" onClick={() => onUpdate({ ...t, bannerImage: "" })}>Убрать картинку</button>}
      </div>

      <input
        className="mini-input wide"
        placeholder="Эмодзи для баннера (например 🚀)"
        value={t.bannerEmoji || ""}
        onChange={(e) => onUpdate({ ...t, bannerEmoji: e.target.value })}
        style={{ marginBottom: 8 }}
      />

      <div className="hint-text" style={{ marginBottom: 4 }}>Наклейки:</div>
      <div className="row-gap">
        {STICKER_CHOICES.map((s) => (
          <button key={s} className={"sticker-choice" + ((t.stickers || []).includes(s) ? " active" : "")} onClick={() => toggleSticker(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}


function PageBanner({ theme }) {
  if (!theme) return null;
  const hasBanner = theme.bannerColor || theme.bannerImage || theme.bannerEmoji;
  const hasStickers = theme.stickers && theme.stickers.length > 0;
  if (!hasBanner && !hasStickers) return null;
  const style = theme.bannerImage
    ? { backgroundImage: "url(" + theme.bannerImage + ")", backgroundSize: "cover", backgroundPosition: "center" }
    : { background: theme.bannerColor || "var(--accent-soft)" };
  return (
    <div className="student-banner" style={style}>
      {theme.bannerEmoji && <span className="student-banner-emoji">{theme.bannerEmoji}</span>}
      {hasStickers && (
        <div className="student-banner-stickers">
          {theme.stickers.map((s, i) => <span key={i} className="student-sticker">{s}</span>)}
        </div>
      )}
    </div>
  );
}

function ChangeTeacherRequest({ student, actions }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (student.teacherChangeRequest) {
    return (
      <div className="add-panel">
        <div className="field-label" style={{ margin: 0 }}>Смена учителя</div>
        <div className="hint-text">Запрос отправлен администратору {formatDateTime(student.teacherChangeRequest.at)}. Ожидайте ответа.</div>
      </div>
    );
  }

  return (
    <div className="add-panel">
      <div className="field-label" style={{ margin: 0 }}>Сменить учителя</div>
      {!sent ? (
        <>
          <textarea className="mini-textarea" placeholder="Коротко опишите причину (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-small accent" onClick={() => { actions.requestTeacherChange(student.id, note.trim()); setSent(true); }}>Отправить запрос администратору</button>
        </>
      ) : (
        <div className="hint-text">Запрос отправлен.</div>
      )}
    </div>
  );
}

function GoalPanel({ student, subject, canEdit, actions }) {
  const isExam = !!(student.examTarget && student.examTarget.exam);
  const examOptions = EXAM_OPTIONS[subject] || [];
  const grammarBank = isExam ? examBank("grammar", student.examTarget.exam, subject) : [];
  const vocabBank = isExam ? examBank("vocab", student.examTarget.exam, subject) : [];
  const taskBank = isExam ? examBank("tasks", student.examTarget.exam, subject) : [];

  if (!canEdit && !isExam) return null;

  return (
    <div>
      <div className="field-label">Цель обучения</div>
      {canEdit && (
        <div className="goal-type-switch">
          <button className={"btn-small" + (!isExam ? " accent" : "")} onClick={() => actions.setExamTarget(student.id, null)}>📘 Базовая программа{SUBJECTS[subject]?.dept === "language" ? " (для себя, работы, переезда)" : ""}</button>
          {SUBJECTS[subject]?.dept === "humanities" ? ["ОГЭ", "ЕГЭ"].map((ex) => (
            <button key={ex} className={"btn-small" + (isExam && student.examTarget.exam === ex ? " accent" : "")} onClick={() => actions.setExamTarget(student.id, { ...(student.examTarget || { targetScore: "", examDate: "" }), exam: ex })}>🎯 {ex}</button>
          )) : (
            <button className={"btn-small" + (isExam ? " accent" : "")} onClick={() => actions.setExamTarget(student.id, { exam: examOptions[0], targetScore: "", examDate: "" })}>🎯 Международный экзамен</button>
          )}
        </div>
      )}

      {isExam && (
        <div className="exam-goal-box">
          {canEdit ? (<>
            <div className="row-gap" style={{ marginTop: 8 }}>
              <select className="mini-select" value={student.examTarget.exam} onChange={(e) => actions.setExamTarget(student.id, { ...student.examTarget, exam: e.target.value })}>
                {examOptions.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
              </select>
              <span className="hint-text">дата экзамена:</span>
              <input type="date" className="mini-input" value={student.examTarget.examDate} onChange={(e) => actions.setExamTarget(student.id, { ...student.examTarget, examDate: e.target.value })} />
            </div>
            <TargetPicker examTarget={student.examTarget} onChange={(t) => actions.setExamTarget(student.id, t)} />
          </>) : (
            <div className="row-gap" style={{ marginTop: 8 }}>
              <Pill tone="gold">🎯 {student.examTarget.exam}</Pill>
              {targetText(student.examTarget) && <span className="hint-text">цель: {targetText(student.examTarget)}</span>}
              {student.examTarget.examDate && <span className="hint-text">дата: {formatDate(student.examTarget.examDate)}</span>}
            </div>
          )}

          <div className="exam-subblock">
            <TopicSelector
              label={(SUBJECTS[subject] && SUBJECTS[subject].dept === "humanities" ? "Темы под " : "Грамматика под ") + (targetText(student.examTarget) || student.examTarget.exam)}
              options={grammarBank}
              selected={student.examGrammar || []}
              readOnly={!canEdit}
              onAdd={(name) => actions.addTopic(student.id, "examGrammar", name)}
              onRemove={(id) => actions.removeTopic(student.id, "examGrammar", id)}
              onCycle={(id) => actions.cycleTopicStatus(student.id, "examGrammar", id)}
            />
          </div>

          <div className="exam-subblock">
            <TopicSelector
              label={SUBJECTS[subject] && SUBJECTS[subject].dept === "humanities" ? "Понятия под цель" : "Лексика под цель"}
              options={vocabBank}
              selected={student.examVocab || []}
              readOnly={!canEdit}
              onAdd={(name) => actions.addTopic(student.id, "examVocab", name)}
              onRemove={(id) => actions.removeTopic(student.id, "examVocab", id)}
              onCycle={(id) => actions.cycleTopicStatus(student.id, "examVocab", id)}
            />
          </div>

          <div className="exam-subblock">
            <TopicSelector
              label={"Задания формата " + student.examTarget.exam}
              options={taskBank}
              selected={student.examTopics || []}
              readOnly={!canEdit}
              onAdd={(name) => actions.addTopic(student.id, "examTopics", name)}
              onRemove={(id) => actions.removeTopic(student.id, "examTopics", id)}
              onCycle={(id) => actions.cycleTopicStatus(student.id, "examTopics", id)}
            />
          </div>

          <div className="exam-subblock">
            <div className="field-label">Материалы к урокам и ссылки</div>
            <MaterialsList
              items={student.examMaterials || []}
              readOnly={!canEdit}
              onAdd={(title, note, url, file) => actions.addExamMaterial(student.id, title, note, url, file)}
              onRemove={(id) => actions.removeExamMaterial(student.id, id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherView({ teacher, teachers, students, schedule, actions, perm, products, ext }) {
  const myStudents = students.filter((s) => s.teacherId === teacher.id);
  const mySlots = schedule.filter((sl) => sl.teacherId === teacher.id);
  const [tab, setTab] = useState("students");
  const [selectedId, setSelectedId] = useState(myStudents[0]?.id || null);
  const selected = myStudents.find((s) => s.id === selectedId) || myStudents[0] || null;
  const subjMeta = SUBJECTS[teacher.subject];
  const [editingOwnProfile, setEditingOwnProfile] = useState(false);
  const [customizingOwnPage, setCustomizingOwnPage] = useState(false);
  const [deleteStudentArmedId, setDeleteStudentArmedId] = useState(null);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", contact: "", goal: "", startLevel: "", startNote: "" });

  const past = mySlots.filter((sl) => sl.date < isoDate(0)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  const grammarOptions = selected ? (GRAMMAR_BANK[teacher.subject]?.[selected.currentLevel] || []) : [];
  const vocabOptions = VOCAB_BANK[teacher.subject] || [];

  return (
    <div className={"subj-" + teacher.subject} style={teacher.pageTheme?.accentColor ? { "--accent": teacher.pageTheme.accentColor } : undefined}>
      <div className="card teacher-profile-header">
        <PageBanner theme={teacher.pageTheme} />
        {editingOwnProfile ? (
          <TeacherEditForm
            teacher={teacher}
            subjects={SUBJECT_ORDER[teacher.department]}
            onCancel={() => setEditingOwnProfile(false)}
            onSave={(form) => { actions.updateTeacher(teacher.id, form); setEditingOwnProfile(false); }}
          />
        ) : (
          <div className="row-gap" style={{ alignItems: "flex-start" }}>
            <Avatar name={teacher.name} photo={teacher.photo} size={56} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>{teacher.name}</h2>
                {perm.profile && (
                  <div className="row-gap">
                    <button className="btn-small" onClick={() => setCustomizingOwnPage((v) => !v)} title="Оформление страницы">🎨 Оформить страницу</button>
                    <button className="btn-icon" onClick={() => setEditingOwnProfile(true)} title="Редактировать профиль"><Pencil size={13} /></button>
                  </div>
                )}
              </div>
              <div className="muted-text">{subjMeta.emoji} {subjMeta.label} · {teacher.contact}</div>
              {teacher.bio && <p className="body-text" style={{ marginTop: 6 }}>{teacher.bio}</p>}
              <div className="row-gap" style={{ marginTop: 8 }}>
                <button
                  className={"btn-small availability-toggle " + (teacher.available ? "is-open" : "is-closed")}
                  onClick={() => actions.toggleTeacherAvailability(teacher.id)}
                >
                  {teacher.available ? "Есть места" : "Мест нет"}
                </button>
                {teacher.available && (
                  <input
                    type="number" min="0" className="mini-input" style={{ width: 110 }}
                    placeholder="Сколько мест"
                    value={teacher.availableSpots ?? ""}
                    onChange={(e) => actions.setAvailableSpots(teacher.id, e.target.value === "" ? null : Number(e.target.value))}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {perm.profile && customizingOwnPage && !editingOwnProfile && (
          <div className="add-panel" style={{ marginTop: 10 }}>
            <PageCustomizer theme={teacher.pageTheme} onUpdate={(t) => actions.updateTeacher(teacher.id, { pageTheme: t })} photo={teacher.photo} onPhoto={(ph) => actions.updateTeacher(teacher.id, { photo: ph })} />
          </div>
        )}
      </div>

      <div className="tabs">
        <button className={tab === "students" ? "tab active" : "tab"} onClick={() => setTab("students")}><Users size={13} /> Ученики</button>
        <button className={tab === "materials" ? "tab active" : "tab"} onClick={() => setTab("materials")}><BookOpen size={13} /> Материалы</button>
        <button className={tab === "schedule" ? "tab active" : "tab"} onClick={() => setTab("schedule")}><Calendar size={13} /> Расписание</button>
        <button className={tab === "staff" ? "tab active" : "tab"} onClick={() => setTab("staff")}><Building2 size={13} /> Администрация</button>
      </div>

      {tab === "students" && (
        <div className="teacher-layout">
          <div className="col-students">
            <div className="col-header">
              <h3><Users size={16} /> Ученики ({myStudents.length})</h3>
              {perm.profile && <button className="btn-icon" onClick={() => setShowAddStudent((v) => !v)} title="Добавить ученика"><Plus size={16} /></button>}
            </div>

            {showAddStudent && perm.profile && (
              <div className="add-panel">
                <div className="row-gap" style={{ justifyContent: "space-between" }}>
                  <span className="hint-text">Новый ученик</span>
                  <button className="btn-icon" onClick={() => setShowAddStudent(false)} title="Закрыть"><X size={14} /></button>
                </div>
                <input placeholder="Имя ученика" className="mini-input wide" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                <input placeholder="Контакт (телефон/telegram)" className="mini-input wide" value={newStudent.contact} onChange={(e) => setNewStudent({ ...newStudent, contact: e.target.value })} />
                <textarea placeholder="Изначальная цель ученика" className="mini-textarea" value={newStudent.goal} onChange={(e) => setNewStudent({ ...newStudent, goal: e.target.value })} />
                <div className="row-gap">
                  <span className="hint-text">Уровень при входе:</span>
                  <select className="mini-select" value={newStudent.startLevel || firstLevel(teacher.subject)} onChange={(e) => setNewStudent({ ...newStudent, startLevel: e.target.value })}>
                    {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <textarea placeholder="Стартовая точка: что уже умеет, какие пробелы (необязательно)" className="mini-textarea" value={newStudent.startNote} onChange={(e) => setNewStudent({ ...newStudent, startNote: e.target.value })} />
                <div className="row-gap">
                  <button
                    className="btn-small accent"
                    disabled={!newStudent.name.trim()}
                    onClick={() => {
                      const id = actions.addStudent(teacher.id, newStudent);
                      setNewStudent({ name: "", contact: "", goal: "", startLevel: "", startNote: "" });
                      setShowAddStudent(false);
                      setSelectedId(id);
                    }}
                  >
                    <Check size={12} /> Создать личный кабинет
                  </button>
                  <button className="btn-small" onClick={() => setShowAddStudent(false)}>Отмена</button>
                </div>
              </div>
            )}

            <div className="student-list">
              {myStudents.length === 0 && <EmptyState icon={Users} title="Пока нет учеников" hint="Добавьте первого ученика кнопкой выше" />}
              {myStudents.map((s) => (
                <div key={s.id} className={"student-item" + (selectedId === s.id ? " active" : "")}>
                  <div className="student-item-clickable" onClick={() => setSelectedId(s.id)}>
                    <div className="student-item-top">
                      <span className="student-item-name">{s.name}</span>
                      <ChevronRight size={14} />
                    </div>
                    <div className="student-item-meta">
                      <FormatBadge student={s} />
                      <Pill tone={s.status === "active" ? "accent" : s.status === "trial" ? "gold" : "default"}>{STATUS_LABELS[s.status]}</Pill>
                      {s.examTarget?.exam && <Pill tone="gold">🎯 {s.examTarget.exam}</Pill>}
                      <span className="muted-text">{s.currentLevel}</span>
                    </div>
                  </div>
                  {perm.profile && (
                    deleteStudentArmedId === s.id ? (
                      <button className="btn-icon danger student-delete-btn armed" onClick={() => { actions.deleteStudent(s.id); setDeleteStudentArmedId(null); if (selectedId === s.id) setSelectedId(null); }} title="Подтвердить удаление"><Check size={12} /></button>
                    ) : (
                      <button className="btn-icon danger student-delete-btn" onClick={() => setDeleteStudentArmedId(s.id)} title="Удалить ученика"><Trash2 size={12} /></button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-main">
            {!selected && <EmptyState icon={GraduationCap} title="Выберите ученика слева" hint="Здесь появится его личный кабинет" />}

            {selected && (
              <>
                <div className="card">
                  <PageBanner theme={selected.pageTheme} />
                  <div className="card-head">
                    <div>
                      <h2>{selected.name}</h2>
                      <div className="muted-text">{selected.contact || "контакт не указан"}</div>
                    </div>
                    {perm.profile ? (
                      <select className="mini-select" value={selected.status} onChange={(e) => actions.updateStudent(selected.id, { status: e.target.value })}>
                        {Object.keys(STATUS_LABELS).map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                      </select>
                    ) : (
                      <Pill tone={selected.status === "active" ? "accent" : "default"}>{STATUS_LABELS[selected.status]}</Pill>
                    )}
                  </div>

                  <FormatPanel student={selected} students={students} teachers={teachers} groups={ext.groups} umbrellas={ext.umbrellas} slots={schedule} subjectMeta={SUBJECTS} canEdit={perm.profile || perm.package} canManage={!!ext.onOpenAdminTab} onOpenAdminTab={ext.onOpenAdminTab} actions={actions} />
                  {selected.format === "self" && <SelfMonthPanel student={selected} slots={mySlots} canEdit={perm.profile || perm.schedule} actions={actions} />}

                  <div style={{ marginTop: 10 }}>
                    <PackageTracker student={selected} actions={actions} canEdit={perm.package} products={products} slots={mySlots} subject={teacher.subject} />
                  </div>


                  <div className="field-block">
                    <div className="field-label">Желаемый результат</div>
                    <div className="row-gap" style={{ flexWrap: "wrap" }}>
                      <span className="hint-text">Уровень-цель:</span>
                      <select className="mini-select" disabled={!(perm.profile || perm.package)} value={selected.targetLevel || ""} onChange={(e) => actions.updateStudent(selected.id, { targetLevel: e.target.value })}>
                        <option value="">не задан</option>
                        {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <textarea className="mini-textarea" style={{ marginTop: 6 }} readOnly={!(perm.profile || perm.package)} placeholder="Чего хотим добиться: например «свободно говорить на работе» или «ЕГЭ на 85+»" value={selected.targetResult || ""} onChange={(e) => actions.updateStudent(selected.id, { targetResult: e.target.value })} />
                  </div>

                  <div className="field-block">
                    <div className="field-label">Уровень: старт → текущий</div>
                    <LevelLadder levels={subjMeta.levels} start={selected.startLevel} current={selected.currentLevel} />
                    {(perm.profile || perm.package) && (
                      <div className="row-gap" style={{ marginTop: 8, flexWrap: "wrap" }}>
                        <span className="hint-text">Стартовый уровень:</span>
                        <select className="mini-select" value={selected.startLevel} onChange={(e) => actions.updateStudent(selected.id, { startLevel: e.target.value })}>
                          {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <span className="hint-text">Текущий уровень:</span>
                        <select className="mini-select" value={selected.currentLevel} onChange={(e) => actions.updateStudent(selected.id, { currentLevel: e.target.value })}>
                          {subjMeta.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <div className="hint-text">Стартовая точка (что умеет / пробелы):</div>
                      {perm.profile ? (
                        <textarea className="mini-textarea" value={selected.startNote || ""} onChange={(e) => actions.updateStudent(selected.id, { startNote: e.target.value })} />
                      ) : (
                        <p className="body-text">{selected.startNote || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div className="field-block">
                    <div className="field-label">Изначальная цель</div>
                    {perm.profile ? (
                      <textarea className="mini-textarea" value={selected.goal} onChange={(e) => actions.updateStudent(selected.id, { goal: e.target.value })} />
                    ) : (
                      <p className="body-text">{selected.goal || "—"}</p>
                    )}
                  </div>

                  <div className="field-block">
                    <GoalPanel student={selected} subject={teacher.subject} canEdit={perm.profile} actions={actions} />
                  </div>

                  <div className="field-block">
                    <div className="field-label">Прогресс</div>
                    <ProgressBar value={progressOf(selected)} />
                    <ProgressBreakdown student={selected} subjMeta={subjMeta} />
                  </div>

                  <div className="field-block">
                    <CheckpointsPanel student={selected} actions={actions} canEdit={perm.profile} />
                  </div>

                  <LessonPlanTimeline slots={mySlots.filter((sl) => sl.studentId === selected.id)} />

                  {!perm.profile && (
                    <div className="field-block">
                      <TeacherChangeRequestAdmin student={selected} teachers={teachers} actions={actions} />
                    </div>
                  )}

                  <div className="field-block">
                    <ProgramEditor
                      label={subjMeta.grammarLabel + " по уровням"} topics={selected.grammarTopics} levels={subjMeta.levels} bank={GRAMMAR_BANK[teacher.subject] || {}}
                      startLevel={selected.startLevel} currentLevel={selected.currentLevel} canEdit={perm.profile}
                      onAdd={(name, level) => actions.addTopic(selected.id, "grammarTopics", name, level)}
                      onRename={(id, name) => actions.updateTopic(selected.id, "grammarTopics", id, { name })}
                      onSetLevel={(id, level) => actions.updateTopic(selected.id, "grammarTopics", id, { level })}
                      onRemove={(id) => actions.removeTopic(selected.id, "grammarTopics", id)}
                      onCycle={(id) => actions.cycleTopicStatus(selected.id, "grammarTopics", id)}
                    />
                  </div>

                  <div className="field-block">
                    <TopicSelector
                      label={subjMeta.vocabLabel} options={vocabOptions} selected={selected.vocabTopics} readOnly={!perm.profile}
                      onAdd={(name) => actions.addTopic(selected.id, "vocabTopics", name)}
                      onRemove={(id) => actions.removeTopic(selected.id, "vocabTopics", id)}
                      onCycle={(id) => actions.cycleTopicStatus(selected.id, "vocabTopics", id)}
                    />
                  </div>

                  {perm.profile && (
                    <div className="field-block">
                      <PageCustomizer theme={selected.pageTheme} onUpdate={(t) => actions.updatePageTheme(selected.id, t)} />
                    </div>
                  )}
                </div>

                <div className="card">
                  <PastLessonsSection count={mySlots.filter((sl) => sl.studentId === selected.id && sl.date < isoDate(0)).length}>
                    <div className="hint-text" style={{ marginBottom: 6 }}>Прикрепите к прошедшим урокам темы, файлы, записи и ссылки — ученик увидит их в «Занятиях» и сможет повторить.</div>
                    {mySlots.filter((sl) => sl.studentId === selected.id && sl.date < isoDate(0)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 20).map((sl) => (
                      <PastLessonCard key={sl.id} slot={sl} students={myStudents} editable={perm.schedule}
                        onAddSlotTopic={actions.addSlotTopic} onRemoveSlotTopic={actions.removeSlotTopic} onSetSlotMaterial={actions.setSlotMaterial}
                        onAddSlotFile={actions.addSlotFile} onRemoveSlotFile={actions.removeSlotFile} />
                    ))}
                  </PastLessonsSection>
                </div>

                <div className="card">
                  <HomeworkPanel key={selected.id} student={selected} actions={actions} role="teacher" canAct={perm.profile} />
                </div>

                <div className="card">
                  <MessagePanel key={selected.id} student={selected} actions={actions} role="teacher" canAct={perm.profile} teacherName={teacher.name} teacherPhoto={teacher.photo} studentName={selected.name} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "materials" && (
        <div className="card">
          <LibraryPanel items={ext.library} subjects={[teacher.subject]} subjectMeta={SUBJECTS} canEdit={() => true} author={teacher.name} onAdd={actions.addLibraryItem} onUpdate={actions.updateLibraryItem} onRemove={actions.removeLibraryItem} title={"Общая библиотека: " + SUBJECTS[teacher.subject].label} hint="Видна всем ученикам предмета. Добавляют и правят преподаватели предмета и администратор, ученики только смотрят." />
        </div>
      )}
      {tab === "materials" && (
        <div className="card">
          <h3><BookOpen size={16} /> Материалы по ученикам</h3>
          <div className="muted-text" style={{ marginBottom: 10 }}>Какие учебники и материалы используются с каждым учеником</div>
          {myStudents.length === 0 && <EmptyState icon={BookOpen} title="Пока нет учеников" />}
          {myStudents.map((s) => (
            <div key={s.id} className="materials-block">
              <div className="materials-block-head">
                <strong>{s.name}</strong>
                <Pill tone={s.status === "active" ? "accent" : "gold"}>{s.currentLevel}</Pill>
              </div>
              <MaterialsList
                items={s.materials || []}
                readOnly={!perm.profile}
                onAdd={(title, note) => actions.addMaterial(s.id, title, note)}
                onRemove={(id) => actions.removeMaterial(s.id, id)}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "schedule" && (
        <div className="card">
          <TeacherClubs clubs={ext.clubs} teacher={teacher} students={students} actions={actions} />
          <ScheduleTable slots={mySlots} students={myStudents} teacherId={teacher.id} editable={perm.schedule} actions={actions} mode="teacher" />
          <PastLessonsSection count={past.length}>
            {past.slice(0, 30).map((sl) => (
              <PastLessonCard
                key={sl.id} slot={sl} students={myStudents} editable={perm.schedule}
                onAddSlotTopic={actions.addSlotTopic} onRemoveSlotTopic={actions.removeSlotTopic} onSetSlotMaterial={actions.setSlotMaterial}
                onAddSlotFile={actions.addSlotFile} onRemoveSlotFile={actions.removeSlotFile}
              />
            ))}
          </PastLessonsSection>
        </div>
      )}

      {tab === "staff" && (
        <div className="card">
          <div className="field-label">Связь с администрацией</div>
          <div className="hint-text" style={{ marginBottom: 6 }}>Рабочие вопросы, зарплата, расписание — сюда.</div>
          <SimpleChatPanel
            messages={teacher.staffMessages}
            onSend={(text, att) => actions.sendStaffMessage(teacher.id, perm.profile ? "teacher" : "admin", text, att)}
            onToggleReaction={(id, emoji) => actions.toggleStaffReaction(teacher.id, id, perm.profile ? "teacher" : "admin", emoji)}
            role={perm.profile ? "teacher" : "admin"} canAct={true}
            selfName={perm.profile ? teacher.name : "Администрация"} selfPhoto={perm.profile ? teacher.photo : ""}
            otherName={perm.profile ? "Администрация" : teacher.name} otherPhoto={perm.profile ? "" : teacher.photo}
            placeholder={perm.profile ? "Написать администрации…" : "Ответить учителю…"}
          />
        </div>
      )}
    </div>
  );
}

/* --------------------------- student view ---------------------------- */

function StudentView({ student, teacher, schedule, actions, products, ext, onSwitchStudent }) {
  const subjMeta = SUBJECTS[teacher.subject];
  const [tab, setTab] = useState("card");
  const [styling, setStyling] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  // Lessons covered by the package count as paid: the link opens for them.
  const mySlots = withPackagePaid(student, schedule.filter((sl) => sl.studentId === student.id));
  const ctx = { students: ext.students, teachers: ext.teachers, groups: ext.groups, umbrellas: ext.umbrellas, allSlots: schedule, subjectMeta: SUBJECTS };
  const T = (key, icon, label) => <button className={tab === key ? "tab active" : "tab"} onClick={() => setTab(key)}>{icon} {label}</button>;

  return (
    <div className={"subj-" + teacher.subject} style={student.pageTheme?.accentColor ? { "--accent": student.pageTheme.accentColor } : undefined}>
      {(() => {
        // «Под одним зонтом»: one person, a card per subject — switch between them here.
        const um = umbrellaOf(ext.umbrellas, student);
        if (!um || !onSwitchStudent) return null;
        return (
          <div className="subj-switch">
            <span className="hint-text">🌂 Ваши предметы:</span>
            {um.memberIds.map((id) => {
              const st = ext.students.find((x) => x.id === id);
              const t = st && ext.teachers.find((x) => x.id === st.teacherId);
              if (!t) return null;
              return <button key={id} className={"btn-small" + (id === student.id ? " accent" : "")} onClick={() => onSwitchStudent(id)}>{SUBJECTS[t.subject].emoji} {SUBJECTS[t.subject].label}</button>;
            })}
          </div>
        );
      })()}
      <div className="tabs">
        {T("card", <GraduationCap size={13} />, "Моя карточка")}
        {T("progress", <ListChecksIcon />, "Прогресс")}
        {T("lessons", <Calendar size={13} />, "Занятия")}
        {T("homework", <BookOpen size={13} />, "Домашние задания")}
        {T("library", <BookOpen size={13} />, "Материалы")}
        {T("chat", <MessageCircle size={13} />, "Переписка")}
        {T("support", <LifeBuoy size={13} />, "Поддержка")}
      </div>

      {payOpen && (
        <PayRequestModal student={student} products={umbrellaOf(ext.umbrellas, student) ? [8, 12].map((n) => ({ id: "um" + n, subject: teacher.subject, lessonsIncluded: n, price: UMBRELLA_PRICES[n] })) : products} subject={teacher.subject} onClose={() => setPayOpen(false)} onSubmit={(d) => { actions.requestPayment(student.id, teacher.id, d); setPayOpen(false); }} />
      )}

      {tab === "card" && <>
        <div className="card">
          <PageBanner theme={student.pageTheme} />
          <div className="card-head">
            <div>
              <h2>{student.name}</h2>
              <div className="muted-text">{student.contact || "контакт не указан"}</div>
            </div>
            <div className="row-gap">
              <Pill tone={student.status === "active" ? "accent" : "gold"}>{STATUS_LABELS[student.status]}</Pill>
              <FormatBadge student={student} />
              <button className="btn-small" onClick={() => setStyling((v) => !v)}>🎨 Оформить страницу</button>
            </div>
          </div>
          {styling && (
            <div className="field-block">
              <PageCustomizer theme={student.pageTheme} onUpdate={(t) => actions.updatePageTheme(student.id, t)} photo={student.photo} onPhoto={(ph) => actions.updateStudent(student.id, { photo: ph })} />
              <button className="btn-small accent" style={{ marginTop: 8 }} onClick={() => setStyling(false)}><Check size={12} /> Готово</button>
            </div>
          )}
          <div className="field-block">
            <div className="field-label">Ваш преподаватель</div>
            <div className="teacher-mini-card">
              <Avatar name={teacher.name} photo={teacher.photo} size={44} />
              <div>
                <div style={{ fontWeight: 700 }}>{teacher.name}</div>
                <div className="muted-text">{subjMeta.emoji} {subjMeta.label} · {teacher.contact}</div>
                {teacher.bio && <p className="body-text" style={{ marginTop: 4 }}>{teacher.bio}</p>}
              </div>
            </div>
          </div>
          <div className="field-block">
            <div className="field-label">Цель и программа</div>
            <p className="body-text">{student.goal || "—"}</p>
            <div className="row-gap" style={{ marginTop: 6 }}>
              <Pill tone="teal">{student.examTarget?.exam ? "🎯 " + student.examTarget.exam + (targetText(student.examTarget) ? " · цель " + targetText(student.examTarget) : "") + (student.examTarget.examDate ? " · " + formatDate(student.examTarget.examDate) : "") : "📘 Базовая программа"}</Pill>
              <span className="hint-text">Уровень: {student.startLevel} → <b>{student.currentLevel}</b></span>
            </div>
          </div>
        </div>
        <StudentOverview student={student} teacher={teacher} subjMeta={subjMeta} slots={mySlots} payRequests={ext.payRequests} onPay={() => setPayOpen(true)} onPayAction={actions.payRequestAction} ctx={ctx} showProgram={false} />
        {student.format === "self" && <SelfMonthPanel student={student} slots={mySlots} canEdit={false} actions={actions} />}
        {student.canRequestTeacherChange && (
          <div className="card"><ChangeTeacherRequest student={student} actions={actions} /></div>
        )}
      </>}

      {tab === "progress" && <>
        <GoalMarker student={student} levels={subjMeta.levels} />
        <ProgressCharts student={student} subjMeta={{ ...subjMeta, bank: GRAMMAR_BANK[teacher.subject] || {} }} slots={mySlots} />
        {student.format === "self" && <SelfMonthPanel student={student} slots={mySlots} canEdit={false} actions={actions} />}
        <div className="card">
          <div className="field-block">
            <ProgramEditor label={subjMeta.grammarLabel + " по уровням"} topics={student.grammarTopics} levels={subjMeta.levels} bank={GRAMMAR_BANK[teacher.subject] || {}} startLevel={student.startLevel} currentLevel={student.currentLevel} canEdit={false} />
          </div>
          <div className="field-block">
            <TopicSelector label={subjMeta.vocabLabel} options={[]} selected={student.vocabTopics} readOnly={true} onAdd={() => {}} onRemove={() => {}} onCycle={() => {}} />
          </div>
          {student.examTarget?.exam && (
            <div className="field-block">
              <GoalPanel student={student} subject={teacher.subject} canEdit={false} actions={actions} />
            </div>
          )}
          <div className="field-block">
            <CheckpointsPanel student={student} actions={actions} canEdit={false} />
          </div>
        </div>
      </>}

      {tab === "lessons" && (
        <div className="card">
          <StudentLessons student={student} teacher={teacher} slots={mySlots} products={products} payRequests={ext.payRequests} actions={actions} />
          <StudentClubs clubs={ext.clubs} student={student} subject={teacher.subject} payRequests={ext.payRequests} actions={actions} />
          <div className="field-block" style={{ marginTop: 18 }}>
            <div className="field-label">Календарь</div>
            <ScheduleTable slots={mySlots} students={[student]} teacherId={teacher.id} editable={false} actions={actions} mode="student" products={products} allTeachers={[teacher]} />
          </div>
        </div>
      )}

      {tab === "library" && (
        <div className="card">
          <LibraryPanel items={ext.library} subjects={[teacher.subject]} subjectMeta={SUBJECTS} canEdit={() => false} title={"Материалы: " + subjMeta.label} />
        </div>
      )}

      {tab === "homework" && (
        <div className="card">
          <HomeworkPanel student={student} actions={actions} role="student" canAct={true} />
        </div>
      )}

      {tab === "chat" && (
        <div className="card">
          <MessagePanel student={student} actions={actions} role="student" canAct={true} teacherName={teacher.name} teacherPhoto={teacher.photo} studentName={student.name} />
        </div>
      )}

      {tab === "support" && (
        <div className="card">
          <div className="field-label">Связь с администрацией</div>
          <div className="hint-text" style={{ marginBottom: 6 }}>Вопросы по оплате, расписанию или смене учителя — сюда.</div>
          <SimpleChatPanel
            messages={student.supportMessages}
            onSend={(text, att) => actions.sendSupportMessage(student.id, "student", text, att)}
            onToggleReaction={(id, emoji) => actions.toggleSupportReaction(student.id, id, "student", emoji)}
            role="student" canAct={true}
            selfName={student.name} selfPhoto={student.photo || ""}
            otherName="Администрация" otherPhoto=""
            placeholder="Написать администрации…"
          />
        </div>
      )}
    </div>
  );
}

const ListChecksIcon = () => <span aria-hidden="true" style={{ fontSize: 12 }}>📈</span>;

/* --------------------------- teacher edit form ------------------------- */

function TeacherEditForm({ teacher, subjects, onSave, onCancel, products, actions, showPayoutRates }) {
  const [form, setForm] = useState({ name: teacher.name, contact: teacher.contact, subject: teacher.subject, bio: teacher.bio || "", photo: teacher.photo || "" });
  const [busy, setBusy] = useState(false);

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataURL(file);
      setForm((f) => ({ ...f, photo: url }));
    } catch (err) { console.error(err); }
    setBusy(false);
  }

  return (
    <div className="add-panel">
      <div className="row-gap" style={{ justifyContent: "space-between" }}>
        <span className="hint-text">Редактирование учителя</span>
        <button className="btn-icon" onClick={onCancel} title="Закрыть"><X size={14} /></button>
      </div>
      <div className="row-gap">
        <Avatar name={form.name} photo={form.photo} size={48} />
        <label className="btn-small">
          <Paperclip size={12} /> {busy ? "Загрузка…" : "Загрузить фото"}
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        </label>
        {form.photo && <button className="btn-small" onClick={() => setForm({ ...form, photo: "" })}>Убрать фото</button>}
      </div>
      <input className="mini-input wide" placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="mini-input wide" placeholder="Контакт" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
      <select className="mini-select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
        {subjects.map((sub) => <option key={sub} value={sub}>{SUBJECTS[sub].label}</option>)}
      </select>
      <textarea className="mini-textarea" placeholder="Краткая информация об учителе" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      <div className="row-gap">
        <button className="btn-small accent" disabled={!form.name.trim()} onClick={() => onSave(form)}><Check size={12} /> Сохранить</button>
        <button className="btn-small" onClick={onCancel}>Отмена</button>
      </div>

      {showPayoutRates && (
        <div className="payout-rates-block">
          <div className="field-label">Ставки за уроки (зарплата с продажи)</div>
          <div className="hint-text" style={{ marginBottom: 6 }}>Сколько этот учитель получает с каждой продажи конкретного товара. Если не задано — используется базовая ставка товара.</div>
          <div className="payout-rates-table">
            {products.map((p) => {
              const override = teacher.payoutOverrides && teacher.payoutOverrides[p.id];
              const value = override !== undefined ? override : "";
              return (
                <div key={p.id} className="payout-rate-row">
                  <span>{p.name}</span>
                  <input
                    type="number" className="mini-input" style={{ width: 90 }}
                    placeholder={"база: " + fmtMoney(p.payoutPerUnit || 0)}
                    value={value}
                    onChange={(e) => actions.setTeacherPayoutRate(teacher.id, p.id, e.target.value === "" ? null : e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- admin view ------------------------------ */

function AdminView({ department, teachers, students, schedule, sales, products, discountPercent, expenses, actions, ext }) {
  const [tab, setTab] = useState("teachers");
  const [detailTeacherId, setDetailTeacherId] = useState(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const deptSubjects = SUBJECT_ORDER[department];
  const [newTeacher, setNewTeacher] = useState({ name: "", contact: "", subject: deptSubjects[0] });
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [deleteArmedId, setDeleteArmedId] = useState(null);

  const deptTeachers = teachers.filter((t) => t.department === department);
  const deptStudentsAll = students.filter((s) => deptTeachers.some((t) => t.id === s.teacherId));

  const unreadSupport = deptStudentsAll.filter((s) => (s.supportMessages || []).length > 0 && s.supportMessages[s.supportMessages.length - 1].sender === "student");
  const unreadStaff = deptTeachers.filter((t) => (t.staffMessages || []).length > 0 && t.staffMessages[t.staffMessages.length - 1].sender === "teacher");
  const unreadTotal = unreadSupport.length + unreadStaff.length;

  const [showAddStudentRoster, setShowAddStudentRoster] = useState(false);
  const [rosterForm, setRosterForm] = useState({ teacherId: deptTeachers[0]?.id || "", name: "", contact: "", goal: "" });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [chattingStudentId, setChattingStudentId] = useState(null);
  const [studentEditForm, setStudentEditForm] = useState({ name: "", contact: "", goal: "", startLevel: "", currentLevel: "", status: "trial" });
  const [openThread, setOpenThread] = useState(null);

  const detailTeacher = teachers.find((t) => t.id === detailTeacherId);

  if (detailTeacher) {
    return (
      <div>
        <button className="btn-small" onClick={() => setDetailTeacherId(null)} style={{ marginBottom: 12 }}>← Ко всем учителям</button>
        <TeacherView teacher={detailTeacher} teachers={teachers} students={students} schedule={schedule} actions={actions} products={products} perm={{ profile: false, schedule: true, package: true }} ext={{ ...ext, onOpenAdminTab: (t) => { setDetailTeacherId(null); setTab(t); } }} />
      </div>
    );
  }

  const totalActive = students.filter((s) => s.status === "active").length;
  const totalActiveLang = students.filter((s) => s.status === "active" && teachers.find((t) => t.id === s.teacherId)?.department === "language").length;
  const totalActiveHum = students.filter((s) => s.status === "active" && teachers.find((t) => t.id === s.teacherId)?.department === "humanities").length;

  return (
    <div>
      <div className="school-stats">
        <div className="school-stat"><div className="school-stat-value">{totalActive}</div><div className="school-stat-label">Активных учеников по школе</div></div>
        <div className="school-stat"><div className="school-stat-value">{totalActiveLang}</div><div className="school-stat-label">Языковое подразделение</div></div>
        <div className="school-stat"><div className="school-stat-value">{totalActiveHum}</div><div className="school-stat-label">Гуманитарное подразделение</div></div>
      </div>

      <AdminInbox calls={ext.calls} payRequests={ext.payRequests} students={students} teachers={teachers} onResolveCall={actions.resolveCall} onPayAction={actions.payRequestAction} />

      <div className="tabs">
        <button className={tab === "teachers" ? "tab active" : "tab"} onClick={() => setTab("teachers")}><Users size={13} /> Учителя</button>
        <button className={tab === "schedule" ? "tab active" : "tab"} onClick={() => setTab("schedule")}><Calendar size={13} /> Общее расписание</button>
        <button className={tab === "roster" ? "tab active" : "tab"} onClick={() => setTab("roster")}><GraduationCap size={13} /> Ученики школы</button>
        <button className={tab === "groups" ? "tab active" : "tab"} onClick={() => setTab("groups")}><Users size={13} /> Пары и группы</button>
        <button className={tab === "self" ? "tab active" : "tab"} onClick={() => setTab("self")}>☂️ Сам, но не один</button>
        {department === "language" && <button className={tab === "clubs" ? "tab active" : "tab"} onClick={() => setTab("clubs")}>🗣 Разговорные клубы</button>}
        <button className={tab === "umbrella" ? "tab active" : "tab"} onClick={() => setTab("umbrella")}>🌂 Под одним зонтом</button>
        <button className={tab === "library" ? "tab active" : "tab"} onClick={() => setTab("library")}><BookOpen size={13} /> Материалы</button>
        <button className={tab === "sales" ? "tab active" : "tab"} onClick={() => setTab("sales")}><ShoppingBag size={13} /> Магазин</button>
        <button className={tab === "messages" ? "tab active" : "tab"} onClick={() => setTab("messages")}>
          <Inbox size={13} /> Сообщения{unreadTotal > 0 ? " (" + unreadTotal + ")" : ""}
        </button>
      </div>

      {tab === "clubs" && department === "language" && (
        <div className="card">
          <ClubsPanel clubs={ext.clubs} students={students} teachers={teachers} subjectMeta={SUBJECTS} langSubjects={SUBJECT_ORDER.language} actions={actions} />
        </div>
      )}
      {tab === "self" && (
        <div className="card">
          <SelfOverviewPanel students={students} teachers={teachers} slots={schedule} subjectMeta={SUBJECTS} actions={actions} />
        </div>
      )}
      {tab === "umbrella" && (
        <div className="card">
          <UmbrellaPanel umbrellas={ext.umbrellas} students={students} teachers={teachers} slots={schedule} subjectMeta={SUBJECTS} actions={actions} />
        </div>
      )}
      {tab === "groups" && (
        <div className="card">
          <GroupsPanel groups={ext.groups} students={students} teachers={teachers} subjectMeta={SUBJECTS} teacherIds={deptTeachers.map((t) => t.id)} canPickTeacher={true} actions={actions} />
        </div>
      )}
      {tab === "library" && (
        <div className="card">
          <LibraryPanel items={ext.library} subjects={deptSubjects} subjectMeta={SUBJECTS} canEdit={() => true} author="Администрация" onAdd={actions.addLibraryItem} onUpdate={actions.updateLibraryItem} onRemove={actions.removeLibraryItem} />
        </div>
      )}

      {tab === "teachers" && (
        <div>
          <div className="col-header">
            <h3><Users size={16} /> Учителя — {DEPARTMENTS[department]}</h3>
            <button className="btn-icon" onClick={() => setShowAddTeacher((v) => !v)}><Plus size={16} /></button>
          </div>

          {showAddTeacher && (
            <div className="add-panel">
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <span className="hint-text">Новый учитель</span>
                <button className="btn-icon" onClick={() => setShowAddTeacher(false)} title="Закрыть"><X size={14} /></button>
              </div>
              <input placeholder="Имя учителя" className="mini-input wide" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
              <input placeholder="Контакт" className="mini-input wide" value={newTeacher.contact} onChange={(e) => setNewTeacher({ ...newTeacher, contact: e.target.value })} />
              <select className="mini-select" value={newTeacher.subject} onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}>
                {deptSubjects.map((sub) => <option key={sub} value={sub}>{SUBJECTS[sub].label}</option>)}
              </select>
              <div className="row-gap">
                <button
                  className="btn-small accent"
                  disabled={!newTeacher.name.trim()}
                  onClick={() => { actions.addTeacher({ ...newTeacher, department }); setNewTeacher({ name: "", contact: "", subject: deptSubjects[0] }); setShowAddTeacher(false); }}
                >
                  <Check size={12} /> Добавить учителя
                </button>
                <button className="btn-small" onClick={() => setShowAddTeacher(false)}>Отмена</button>
              </div>
            </div>
          )}

          {deptSubjects.map((sub) => {
            const subjTeachers = deptTeachers.filter((t) => t.subject === sub);
            return (
              <div key={sub} className={"subject-group subj-" + sub}>
                <div className="subject-group-title">{SUBJECTS[sub].emoji} {SUBJECTS[sub].label} <span className="muted-text">({subjTeachers.length})</span></div>
                {subjTeachers.length === 0 ? (
                  <div className="muted-text" style={{ marginBottom: 10 }}>Пока нет учителей по этому предмету</div>
                ) : (
                  <div className="teacher-grid">
                    {subjTeachers.map((t) => {
                      const myStudents = students.filter((s) => s.teacherId === t.id);
                      const active = myStudents.filter((s) => s.status === "active").length;
                      const upcomingCount = schedule.filter((sl) => sl.teacherId === t.id && sl.date >= isoDate(0) && sl.status !== "cancelled").length;

                      if (editingTeacherId === t.id) {
                        return (
                          <div key={t.id} className="teacher-card">
                            <TeacherEditForm
                              teacher={t}
                              subjects={deptSubjects}
                              products={products}
                              actions={actions}
                              showPayoutRates={true}
                              onCancel={() => setEditingTeacherId(null)}
                              onSave={(form) => { actions.updateTeacher(t.id, form); setEditingTeacherId(null); }}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={t.id} className="teacher-card">
                          <div className="teacher-card-actions">
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingTeacherId(t.id); }} title="Редактировать"><Pencil size={13} /></button>
                            {deleteArmedId === t.id ? (
                              <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); actions.deleteTeacher(t.id); setDeleteArmedId(null); }} title="Подтвердить удаление"><Check size={13} /></button>
                            ) : (
                              <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteArmedId(t.id); }} title="Удалить учителя" disabled={myStudents.length > 0}><Trash2 size={13} /></button>
                            )}
                          </div>
                          <div className="teacher-card-body" onClick={() => setDetailTeacherId(t.id)}>
                            <div className="row-gap" style={{ marginBottom: 6 }}>
                              <Avatar name={t.name} photo={t.photo} size={40} />
                              <div>
                                <div className="teacher-card-name">{t.name}</div>
                                <div className="muted-text">{SUBJECTS[t.subject].emoji} {SUBJECTS[t.subject].label}</div>
                              </div>
                            </div>
                            {t.bio && <div className="teacher-card-bio">{t.bio}</div>}
                            <div className="muted-text">{t.contact}</div>
                            <button
                              className={"btn-small availability-toggle " + (t.available ? "is-open" : "is-closed")}
                              onClick={(e) => { e.stopPropagation(); actions.toggleTeacherAvailability(t.id); }}
                            >
                              {t.available ? "Есть места" + (t.availableSpots ? " (" + t.availableSpots + ")" : "") : "Мест нет"}
                            </button>
                            <div className="teacher-card-stats">
                              <span><Users size={13} /> {active} активных · {myStudents.length} всего</span>
                              <span><Calendar size={13} /> {upcomingCount} предстоящих занятий</span>
                            </div>
                            <PayrollCard teacher={t} slots={schedule} students={students} clubs={ext.clubs} onSetRate={actions.setTeacherRate} />
                            {myStudents.length > 0 && deleteArmedId === t.id && (
                              <div className="hint-text" style={{ color: "var(--danger)" }}>Нельзя удалить: есть ученики. Сначала переведите их к другому учителю.</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "schedule" && (
        <div className="card">
          <h3><Calendar size={16} /> Общее расписание — {DEPARTMENTS[department]}</h3>
          <div className="muted-text" style={{ marginBottom: 10 }}>Занятия всех учителей подразделения: предмет, ученик, учитель — в одной сетке</div>
          {deptTeachers.length === 0 ? (
            <EmptyState icon={Calendar} title="В этом подразделении пока нет учителей" />
          ) : (
            <ScheduleTable
              slots={schedule.filter((sl) => deptTeachers.some((t) => t.id === sl.teacherId))}
              students={students.filter((s) => deptTeachers.some((t) => t.id === s.teacherId))}
              teacherOptions={deptTeachers}
              teachersById={Object.fromEntries(deptTeachers.map((t) => [t.id, t]))}
              editable={true}
              actions={actions}
              mode="admin"
            />
          )}
        </div>
      )}

      {tab === "roster" && (
        <div>
          <div className="col-header">
            <h3><GraduationCap size={16} /> Ученики школы — {DEPARTMENTS[department]}</h3>
            <button className="btn-icon" onClick={() => setShowAddStudentRoster((v) => !v)} disabled={deptTeachers.length === 0}><Plus size={16} /></button>
          </div>

          {showAddStudentRoster && (
            <div className="add-panel">
              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                <span className="hint-text">Новый ученик</span>
                <button className="btn-icon" onClick={() => setShowAddStudentRoster(false)} title="Закрыть"><X size={14} /></button>
              </div>
              <select className="mini-select" value={rosterForm.teacherId} onChange={(e) => setRosterForm({ ...rosterForm, teacherId: e.target.value })}>
                {deptTeachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {SUBJECTS[t.subject].label}</option>)}
              </select>
              <input placeholder="Имя ученика" className="mini-input wide" value={rosterForm.name} onChange={(e) => setRosterForm({ ...rosterForm, name: e.target.value })} />
              <input placeholder="Контакт" className="mini-input wide" value={rosterForm.contact} onChange={(e) => setRosterForm({ ...rosterForm, contact: e.target.value })} />
              <textarea placeholder="Изначальная цель" className="mini-textarea" value={rosterForm.goal} onChange={(e) => setRosterForm({ ...rosterForm, goal: e.target.value })} />
              <div className="row-gap">
                <button
                  className="btn-small accent"
                  disabled={!rosterForm.name.trim() || !rosterForm.teacherId}
                  onClick={() => { actions.addStudent(rosterForm.teacherId, rosterForm); setRosterForm({ teacherId: deptTeachers[0]?.id || "", name: "", contact: "", goal: "" }); setShowAddStudentRoster(false); }}
                >
                  <Check size={12} /> Создать личный кабинет
                </button>
                <button className="btn-small" onClick={() => setShowAddStudentRoster(false)}>Отмена</button>
              </div>
            </div>
          )}

          {deptSubjects.map((sub) => {
            const subjTeacherIds = deptTeachers.filter((t) => t.subject === sub).map((t) => t.id);
            const subjStudents = students.filter((s) => subjTeacherIds.includes(s.teacherId));
            if (subjStudents.length === 0) return null;
            return (
              <div key={sub} className={"subject-group subj-" + sub}>
                <div className="subject-group-title">{SUBJECTS[sub].emoji} {SUBJECTS[sub].label} <span className="muted-text">({subjStudents.length})</span></div>
                <div className="admin-schedule-table">
                  <div className="admin-schedule-row head roster-row">
                    <span>Ученик</span><span>Учитель</span><span>Уровень</span><span>Пакет</span><span>Статус</span><span>Прогресс</span><span></span>
                  </div>
                  {subjStudents.map((s) => {
                    const t = teachers.find((x) => x.id === s.teacherId);
                    const subjMetaS = SUBJECTS[t?.subject];
                    const hasUnread = (s.supportMessages || []).length > 0 && s.supportMessages[s.supportMessages.length - 1].sender === "student";
                    return (
                      <React.Fragment key={s.id}>
                        <div className="admin-schedule-row roster-row">
                          <span>{s.name}<br /><FormatBadge student={s} /></span>
                          <span>{t ? t.name : "—"}</span>
                          <span>{s.currentLevel}</span>
                          <span>
                            <PackageTracker student={s} actions={actions} canEdit={true} products={products} slots={schedule} subject={t?.subject} />
                          </span>
                          <span><Pill tone={s.status === "active" ? "accent" : "gold"}>{STATUS_LABELS[s.status]}</Pill></span>
                          <span>{progressOf(s)}%</span>
                          <span className="row-gap" style={{ flexWrap: "nowrap" }}>
                            <button
                              className={"btn-icon" + (hasUnread ? " danger" : "")}
                              title="Переписка с учеником (поддержка)"
                              onClick={() => setChattingStudentId(chattingStudentId === s.id ? null : s.id)}
                            >🆘</button>
                            <button
                              className="btn-icon"
                              title="Редактировать ученика"
                              onClick={() => {
                                if (editingStudentId === s.id) { setEditingStudentId(null); return; }
                                setEditingStudentId(s.id);
                                setStudentEditForm({ name: s.name, contact: s.contact, goal: s.goal, startLevel: s.startLevel, currentLevel: s.currentLevel, status: s.status });
                              }}
                            ><Pencil size={12} /></button>
                          </span>
                        </div>
                        {chattingStudentId === s.id && (
                          <div className="admin-schedule-row roster-row" style={{ gridColumn: "1 / -1", display: "block" }}>
                            <div className="add-panel">
                              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                                <span className="hint-text">Поддержка — {s.name}</span>
                                <button className="btn-icon" onClick={() => setChattingStudentId(null)}><X size={14} /></button>
                              </div>
                              <SimpleChatPanel
                                messages={s.supportMessages}
                                onSend={(text, att) => actions.sendSupportMessage(s.id, "admin", text, att)}
                                onToggleReaction={(id, emoji) => actions.toggleSupportReaction(s.id, id, "admin", emoji)}
                                role="admin" canAct={true}
                                selfName="Администрация" selfPhoto=""
                                otherName={s.name} otherPhoto=""
                                placeholder="Ответить ученику…"
                              />
                            </div>
                          </div>
                        )}
                        {editingStudentId === s.id && (
                          <div className="admin-schedule-row roster-row" style={{ gridColumn: "1 / -1", display: "block" }}>
                            <div className="add-panel">
                              <div className="row-gap" style={{ justifyContent: "space-between" }}>
                                <span className="hint-text">Редактирование ученика — {s.name}</span>
                                <button className="btn-icon" onClick={() => setEditingStudentId(null)}><X size={14} /></button>
                              </div>
                              <FormatPanel student={s} students={students} teachers={teachers} groups={ext.groups} umbrellas={ext.umbrellas} slots={schedule} subjectMeta={SUBJECTS} canEdit={true} canManage={true} onOpenAdminTab={setTab} actions={actions} />
                              <input className="mini-input wide" placeholder="Имя" value={studentEditForm.name} onChange={(e) => setStudentEditForm({ ...studentEditForm, name: e.target.value })} />
                              <input className="mini-input wide" placeholder="Контакт" value={studentEditForm.contact} onChange={(e) => setStudentEditForm({ ...studentEditForm, contact: e.target.value })} />
                              <textarea className="mini-textarea" placeholder="Изначальная цель" value={studentEditForm.goal} onChange={(e) => setStudentEditForm({ ...studentEditForm, goal: e.target.value })} />
                              {subjMetaS && (
                                <div className="row-gap">
                                  <span className="hint-text">Старт:</span>
                                  <select className="mini-select" value={studentEditForm.startLevel} onChange={(e) => setStudentEditForm({ ...studentEditForm, startLevel: e.target.value })}>
                                    {subjMetaS.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                                  </select>
                                  <span className="hint-text">Текущий:</span>
                                  <select className="mini-select" value={studentEditForm.currentLevel} onChange={(e) => setStudentEditForm({ ...studentEditForm, currentLevel: e.target.value })}>
                                    {subjMetaS.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                                  </select>
                                </div>
                              )}
                              <select className="mini-select" value={studentEditForm.status} onChange={(e) => setStudentEditForm({ ...studentEditForm, status: e.target.value })}>
                                {Object.keys(STATUS_LABELS).map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                              </select>
                              <div className="row-gap">
                                <button
                                  className="btn-small accent"
                                  onClick={() => {
                                    actions.updateStudent(s.id, {
                                      name: studentEditForm.name.trim(), contact: studentEditForm.contact.trim(), goal: studentEditForm.goal.trim(),
                                      startLevel: studentEditForm.startLevel, currentLevel: studentEditForm.currentLevel, status: studentEditForm.status,
                                    });
                                    setEditingStudentId(null);
                                  }}
                                ><Check size={12} /> Сохранить</button>
                                <button className="btn-small" onClick={() => setEditingStudentId(null)}>Отмена</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "sales" && <ShopPanel sales={sales} products={products} discountPercent={discountPercent} actions={actions} expenses={expenses} teachers={deptTeachers} students={students.filter((s) => deptTeachers.some((t) => t.id === s.teacherId))} schedule={schedule} allStudents={students} clubs={ext.clubs} />}

      {tab === "messages" && (
        <div>
          <div className="col-header">
            <h3>💬 Сообщения — {DEPARTMENTS[department]}</h3>
          </div>

          <div className="subject-group">
            <div className="subject-group-title">Обращения учеников (поддержка)</div>
            {deptStudentsAll.length === 0 && <EmptyState icon={MessageCircle} title="В этом подразделении пока нет учеников" />}
            {deptStudentsAll.map((s) => {
              const msgs = s.supportMessages || [];
              const last = msgs[msgs.length - 1];
              const unread = last && last.sender === "student";
              const isOpen = openThread === "support:" + s.id;
              return (
                <div key={s.id} className="thread-row-wrap">
                  <button className={"thread-row" + (unread ? " unread" : "")} onClick={() => setOpenThread(isOpen ? null : "support:" + s.id)}>
                    <Avatar name={s.name} photo="" size={32} />
                    <div className="thread-row-body">
                      <div className="thread-row-name">{s.name} {unread && <span className="thread-dot" />}</div>
                      <div className="thread-row-preview">{last ? (last.text || "📎 вложение") : "Сообщений пока нет"}</div>
                    </div>
                    {last && <div className="thread-row-time">{formatDateTime(last.at)}</div>}
                  </button>
                  {isOpen && (
                    <div className="add-panel">
                      <SimpleChatPanel
                        messages={s.supportMessages}
                        onSend={(text, att) => actions.sendSupportMessage(s.id, "admin", text, att)}
                        onToggleReaction={(id, emoji) => actions.toggleSupportReaction(s.id, id, "admin", emoji)}
                        role="admin" canAct={true}
                        selfName="Администрация" selfPhoto=""
                        otherName={s.name} otherPhoto=""
                        placeholder="Ответить ученику…"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="subject-group">
            <div className="subject-group-title">Сообщения от учителей</div>
            {deptTeachers.length === 0 && <EmptyState icon={MessageCircle} title="В этом подразделении пока нет учителей" />}
            {deptTeachers.map((t) => {
              const msgs = t.staffMessages || [];
              const last = msgs[msgs.length - 1];
              const unread = last && last.sender === "teacher";
              const isOpen = openThread === "staff:" + t.id;
              return (
                <div key={t.id} className="thread-row-wrap">
                  <button className={"thread-row" + (unread ? " unread" : "")} onClick={() => setOpenThread(isOpen ? null : "staff:" + t.id)}>
                    <Avatar name={t.name} photo={t.photo} size={32} />
                    <div className="thread-row-body">
                      <div className="thread-row-name">{t.name} {unread && <span className="thread-dot" />}</div>
                      <div className="thread-row-preview">{last ? (last.text || "📎 вложение") : "Сообщений пока нет"}</div>
                    </div>
                    {last && <div className="thread-row-time">{formatDateTime(last.at)}</div>}
                  </button>
                  {isOpen && (
                    <div className="add-panel">
                      <SimpleChatPanel
                        messages={t.staffMessages}
                        onSend={(text, att) => actions.sendStaffMessage(t.id, "admin", text, att)}
                        onToggleReaction={(id, emoji) => actions.toggleStaffReaction(t.id, id, "admin", emoji)}
                        role="admin" canAct={true}
                        selfName="Администрация" selfPhoto=""
                        otherName={t.name} otherPhoto={t.photo}
                        placeholder="Ответить учителю…"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- sales panel ------------------------------ */

const CHART_COLORS = ["#449999", "#D65655", "#A9791E", "#8B7BB8", "#6FA8C9", "#B2593B", "#C97A2B", "#6B6862"];

function fmtMoney(n) { return Math.round(n).toLocaleString("ru-RU") + " ₽"; }

const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function ShopPanel({ sales, products, discountPercent, actions, students, expenses, teachers, schedule, allStudents, clubs }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [saleForm, setSaleForm] = useState({ date: isoDate(0), productId: products[0]?.id || "", qty: 1, discounted: false, studentId: "", teacherId: teachers[0]?.id || "" });
  const [productsOpen, setProductsOpen] = useState(false);
  const [showAddProductRow, setShowAddProductRow] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", price: "", department: "language", subject: "english", lessonsIncluded: 0, paymentLink: "", payoutPerUnit: "" });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", lessonsIncluded: 0, paymentLink: "", payoutPerUnit: "" });
  const [discountDraft, setDiscountDraft] = useState(discountPercent);
  const [expenseForm, setExpenseForm] = useState({ date: isoDate(0), category: "Аренда", amount: "", note: "" });
  const [shopTab, setShopTab] = useState("overview");

  function shiftMonth(delta) {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  }

  const monthPrefix = viewYear + "-" + String(viewMonth + 1).padStart(2, "0");
  const monthSales = sales.filter((s) => s.date.startsWith(monthPrefix));
  const monthExpenses = (expenses || []).filter((e) => e.date.startsWith(monthPrefix));
  const monthTotal = monthSales.reduce((a, s) => a + s.amount, 0);
  const lessonPayroll = (teachers || []).reduce((a, t) => a + teacherPayroll(t, schedule, allStudents || students, monthPrefix, clubs).total, 0);
  const monthPayouts = monthExpenses.filter((e) => e.auto).reduce((a, e) => a + e.amount, 0) + lessonPayroll;
  const monthOtherExpenses = monthExpenses.filter((e) => !e.auto).reduce((a, e) => a + e.amount, 0);
  const monthExpenseTotal = monthPayouts + monthOtherExpenses;
  const monthProfit = monthTotal - monthExpenseTotal;
  const monthMargin = monthTotal > 0 ? Math.round((monthProfit / monthTotal) * 100) : null;

  const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevPrefix = prevY + "-" + String(prevM + 1).padStart(2, "0");
  const prevTotal = sales.filter((s) => s.date.startsWith(prevPrefix)).reduce((a, s) => a + s.amount, 0);
  const delta = prevTotal > 0 ? Math.round(((monthTotal - prevTotal) / prevTotal) * 100) : null;

  const todayIso = isoDate(0);
  const weekStartIso = localDateStr(mondayOf(new Date()));
  const todayTotal = sales.filter((s) => s.date === todayIso).reduce((a, s) => a + s.amount, 0);
  const weekTotal = sales.filter((s) => s.date >= weekStartIso).reduce((a, s) => a + s.amount, 0);

  const byProduct = products.map((p, i) => ({
    product: p,
    total: monthSales.filter((s) => s.productId === p.id).reduce((a, s) => a + s.amount, 0),
    color: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((x) => x.total > 0);

  let acc = 0;
  const gradientStops = byProduct.map((x) => {
    const start = acc;
    const pct = monthTotal > 0 ? (x.total / monthTotal) * 100 : 0;
    acc += pct;
    return `${x.color} ${start}% ${acc}%`;
  }).join(", ");

  return (
    <div className="card">
      <h3>🛍️ Магазин и продажи</h3>
      <div className="muted-text" style={{ marginBottom: 10 }}>
        Товары и услуги школы, скидка на приветственные пакеты, зарплатные отчисления учителям и статистика по месяцам. Цифры вносятся вручную.
      </div>

      <div className="sales-stats">
        <div className="sales-stat"><div className="sales-stat-label">Сегодня</div><div className="sales-stat-value">{fmtMoney(todayTotal)}</div></div>
        <div className="sales-stat"><div className="sales-stat-label">За неделю</div><div className="sales-stat-value">{fmtMoney(weekTotal)}</div></div>
        <div className="sales-stat"><div className="sales-stat-label">За выбранный месяц</div><div className="sales-stat-value">{fmtMoney(monthTotal)}</div></div>
      </div>

      <div className="month-switch">
        <button className="btn-small" onClick={() => shiftMonth(-1)}>← Пред. месяц</button>
        <strong>{MONTH_NAMES[viewMonth]} {viewYear}</strong>
        <button className="btn-small" onClick={() => shiftMonth(1)}>След. месяц →</button>
        {delta !== null && (
          <Pill tone={delta >= 0 ? "accent" : "danger"}>{delta >= 0 ? "+" : ""}{delta}% к пред. месяцу</Pill>
        )}
      </div>

      <div className="donut-row">
        <div className="donut-chart" style={{ background: byProduct.length ? `conic-gradient(${gradientStops})` : "var(--border)" }}>
          <div className="donut-hole">
            <div className="donut-hole-value">{fmtMoney(monthTotal)}</div>
            <div className="donut-hole-label">за месяц</div>
          </div>
        </div>
        <div className="donut-legend">
          {byProduct.length === 0 && <div className="muted-text">Нет продаж за этот месяц</div>}
          {byProduct.map((x) => (
            <div key={x.product.id} className="donut-legend-row">
              <span className="donut-dot" style={{ background: x.color }} />
              <span className="donut-legend-name">{x.product.name}</span>
              <span className="donut-legend-value">{fmtMoney(x.total)} · {monthTotal > 0 ? Math.round((x.total / monthTotal) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="field-block">
        <div className="field-label">Финансы за {MONTH_NAMES[viewMonth]}</div>
        <div className="finance-grid">
          <div className="finance-cell"><div className="hint-text">Выручка</div><div className="finance-value">{fmtMoney(monthTotal)}</div></div>
          <div className="finance-cell"><div className="hint-text" title="Ставки за проведённые уроки по форматам (карточки учителей) + выплаты с продаж">Зарплата учителям (по урокам)</div><div className="finance-value">− {fmtMoney(monthPayouts)}</div></div>
          <div className="finance-cell"><div className="hint-text">Прочие траты школы</div><div className="finance-value">− {fmtMoney(monthOtherExpenses)}</div></div>
          <div className="finance-cell finance-profit"><div className="hint-text">Чистая прибыль</div><div className="finance-value">{fmtMoney(monthProfit)}</div></div>
          <div className="finance-cell finance-margin"><div className="hint-text">Рентабельность</div><div className="finance-value">{monthMargin === null ? "—" : monthMargin + "%"}</div></div>
        </div>

        <div className="add-panel" style={{ marginTop: 10 }}>
          <div className="hint-text">Новая трата школы (аренда, реклама, хостинг и т.д.)</div>
          <div className="row-gap">
            <input type="date" className="mini-input" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            <input className="mini-input" placeholder="Категория" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
            <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Сумма" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          </div>
          <input className="mini-input wide" placeholder="Комментарий (необязательно)" value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
          <button className="btn-small accent" disabled={!expenseForm.amount} onClick={() => { actions.addExpense(expenseForm.date, expenseForm.category, expenseForm.amount, expenseForm.note); setExpenseForm({ ...expenseForm, amount: "", note: "" }); }}><Check size={12} /> Добавить трату</button>
        </div>

        {monthExpenses.length > 0 && (
          <div className="sales-log" style={{ marginTop: 8 }}>
            {[...monthExpenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
              <div key={e.id} className="sales-log-row">
                <span>{formatDate(e.date)}</span>
                <span>{e.auto && <Pill tone="gold">авто</Pill>} {e.category}{e.note ? " — " + e.note : ""}</span>
                <span>{fmtMoney(e.amount)}</span>
                <button className="topic-remove" onClick={() => actions.removeExpense(e.id)}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="field-block">
        <button className="products-dropdown-toggle" onClick={() => setProductsOpen((v) => !v)}>
          <span className={"past-chevron" + (productsOpen ? " open" : "")}>›</span>
          <span className="field-label" style={{ margin: 0 }}>Товары и услуги ({products.length})</span>
        </button>

        {productsOpen && (
          <div className="products-dropdown-list">
            <ul className="materials-list">
              {products.map((p) => (
                editingProductId === p.id ? (
                  <li key={p.id} className="product-edit-row">
                    <input className="mini-input wide" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Цена" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Занятий" value={editForm.lessonsIncluded} onChange={(e) => setEditForm({ ...editForm, lessonsIncluded: e.target.value })} />
                    <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Зарплата учителю" value={editForm.payoutPerUnit} onChange={(e) => setEditForm({ ...editForm, payoutPerUnit: e.target.value })} />
                    <input className="mini-input wide" placeholder="Ссылка на оплату в ЮKassa" value={editForm.paymentLink} onChange={(e) => setEditForm({ ...editForm, paymentLink: e.target.value })} />
                    <button className="btn-icon" onClick={() => { actions.updateProduct(p.id, { name: editForm.name.trim(), price: Number(editForm.price) || 0, lessonsIncluded: Number(editForm.lessonsIncluded) || 0, paymentLink: editForm.paymentLink.trim(), payoutPerUnit: Number(editForm.payoutPerUnit) || 0 }); setEditingProductId(null); }}><Check size={12} /></button>
                    <button className="btn-icon" onClick={() => setEditingProductId(null)}><X size={12} /></button>
                  </li>
                ) : (
                  <li key={p.id}>
                    <span><strong>{p.name}</strong> — {fmtMoney(p.price)}{p.lessonsIncluded > 0 ? " · пакет на " + p.lessonsIncluded + " занятий" : ""}{p.payoutPerUnit > 0 ? " · зарплата " + fmtMoney(p.payoutPerUnit) : ""}</span>
                    <button className="topic-remove" onClick={() => { setEditingProductId(p.id); setEditForm({ name: p.name, price: p.price, lessonsIncluded: p.lessonsIncluded || 0, paymentLink: p.paymentLink || "", payoutPerUnit: p.payoutPerUnit || 0 }); }}><Pencil size={12} /></button>
                    <button className="topic-remove" onClick={() => actions.removeProduct(p.id)}><X size={12} /></button>
                  </li>
                )
              ))}
              {showAddProductRow ? (
                <li className="product-edit-row">
                  <input className="mini-input wide" placeholder="Название" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Цена" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                  <input type="number" className="mini-input" style={{ width: 80 }} placeholder="Занятий" value={productForm.lessonsIncluded} onChange={(e) => setProductForm({ ...productForm, lessonsIncluded: e.target.value })} />
                  <input type="number" className="mini-input" style={{ width: 90 }} placeholder="Зарплата учителю" value={productForm.payoutPerUnit} onChange={(e) => setProductForm({ ...productForm, payoutPerUnit: e.target.value })} />
                  <select className="mini-select" value={productForm.subject} onChange={(e) => setProductForm({ ...productForm, subject: e.target.value, department: SUBJECTS[e.target.value].dept })}>
                    {Object.keys(SUBJECTS).map((sub) => <option key={sub} value={sub}>{SUBJECTS[sub].emoji} {SUBJECTS[sub].label}</option>)}
                  </select>
                  <input className="mini-input wide" placeholder="Ссылка на оплату в ЮKassa (необязательно)" value={productForm.paymentLink} onChange={(e) => setProductForm({ ...productForm, paymentLink: e.target.value })} />
                  <button className="btn-icon" disabled={!productForm.name.trim() || !productForm.price} onClick={() => { actions.addProduct(productForm); setProductForm({ name: "", price: "", department: "language", subject: "english", lessonsIncluded: 0, paymentLink: "", payoutPerUnit: "" }); setShowAddProductRow(false); }}><Check size={12} /></button>
                  <button className="btn-icon" onClick={() => setShowAddProductRow(false)}><X size={12} /></button>
                </li>
              ) : (
                <li className="add-product-row" onClick={() => setShowAddProductRow(true)}>
                  <Plus size={13} /> Добавить товар / услугу
                </li>
              )}
            </ul>
            <div className="hint-text">«Занятий в пакете» = 0 для разовой услуги. «Зарплата учителю» — сколько автоматически уйдёт учителю с каждой продажи этой позиции, вычтется из выручки в разделе «Финансы».</div>
          </div>
        )}
      </div>

      <div className="field-block">
        <div className="field-label">Скидка на приветственные пакеты</div>
        <div className="row-gap">
          <input type="number" className="mini-input" style={{ width: 80 }} value={discountDraft} onChange={(e) => setDiscountDraft(e.target.value)} />
          <span className="hint-text">%</span>
          <button className="btn-small accent" onClick={() => actions.setDiscount(Number(discountDraft) || 0)}>Сохранить</button>
        </div>
        <div className="hint-text" style={{ marginTop: 4 }}>Применяется автоматически при отметке «со скидкой» на продаже пакета — вычитается из цены товара.</div>
      </div>

      <div className="field-block">
        <div className="field-label">Новая продажа</div>
        <div className="add-panel">
          <div className="row-gap">
            <input type="date" className="mini-input" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} />
            <select className="mini-select" value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" className="mini-input" style={{ width: 60 }} value={saleForm.qty} onChange={(e) => setSaleForm({ ...saleForm, qty: Number(e.target.value) || 1 })} />
          </div>
          <div className="row-gap">
            <select className="mini-select" value={saleForm.studentId} onChange={(e) => {
              const st = students.find((s) => s.id === e.target.value);
              setSaleForm({ ...saleForm, studentId: e.target.value, teacherId: st ? st.teacherId : saleForm.teacherId });
            }}>
              <option value="">Без привязки к ученику</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="mini-select" value={saleForm.teacherId} onChange={(e) => setSaleForm({ ...saleForm, teacherId: e.target.value })}>
              <option value="">Без привязки к учителю</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="hint-text">Если выбрать ученика и товар-пакет — пакет автоматически назначится ученику. Учитель нужен, чтобы зарплата ушла по его ставке.</div>
          {(() => {
            const p = products.find((x) => x.id === saleForm.productId);
            const t = teachers.find((x) => x.id === saleForm.teacherId);
            const payoutPreview = calcPayout(p, saleForm.qty, t);
            return payoutPreview > 0 ? <div className="hint-text">Зарплата учителю по этой продаже: {fmtMoney(payoutPreview)} (запишется в расходы автоматически)</div> : null;
          })()}
          <label className="row-gap" style={{ fontSize: 12.5 }}>
            <input type="checkbox" checked={saleForm.discounted} onChange={(e) => setSaleForm({ ...saleForm, discounted: e.target.checked })} />
            Со welcome-скидкой ({discountPercent}%)
          </label>
          <button className="btn-small accent" disabled={!saleForm.productId} onClick={() => { actions.addSale(saleForm); setSaleForm({ ...saleForm, qty: 1, discounted: false, studentId: "" }); }}><Check size={12} /> Записать продажу</button>
        </div>
      </div>

      <div className="sales-log">
        {[...monthSales].sort((a, b) => b.date.localeCompare(a.date)).map((s) => {
          const p = products.find((x) => x.id === s.productId);
          return (
            <div key={s.id} className="sales-log-row">
              <span>{formatDate(s.date)}</span>
              <span>{p ? p.name : "—"}{s.qty > 1 ? " × " + s.qty : ""}{s.discounted ? " (скидка)" : ""}</span>
              <span>{fmtMoney(s.amount)}</span>
              <button className="topic-remove" onClick={() => actions.removeSale(s.id)}><X size={12} /></button>
            </div>
          );
        })}
        {monthSales.length === 0 && <div className="muted-text">Нет записей за этот месяц</div>}
      </div>
    </div>
  );
}


/* -------------------------------- app --------------------------------- */

const ROLE_LABELS = {
  admin: "Кабинет администратора",
  teacher: "Кабинет преподавателя",
  student: "Кабинет ученика",
};

export default function App({ session, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(seedDiscountPercent);
  const [expenses, setExpenses] = useState([]);
  const [role, setRole] = useState(session.role === "admin" && !session.isAdmin ? "student" : session.role);
  const [department, setDepartment] = useState(session.department || "humanities");
  const [asTeacherId, setAsTeacherId] = useState(null);
  const [asStudentId, setAsStudentId] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [resetArmed, setResetArmed] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [library, setLibrary] = useState([]);
  const [calls, setCalls] = useState([]);
  const [payRequests, setPayRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [umbrellas, setUmbrellas] = useState([]);
  const [clubs, setClubs] = useState([]);

  const persist = useCallback(async (key, value) => {
    try {
      const res = await storage.set(key, JSON.stringify(value), true);
      if (!res) throw new Error("empty response");
    } catch (e) {
      console.error("storage save failed", key, e);
      setErrorMsg("Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const tRes = await loadStrict("su-teachers-v3");
      const sRes = await loadStrict("su-students-v3");
      const schRes = await loadStrict("su-schedule-v3");
      const salRes = await loadStrict("su-sales-v3");
      const prodRes = await loadStrict("su-products-v2");
      const discRes = await loadStrict("su-discount-v2");
      const expRes = await loadStrict("su-expenses-v1");
      const libRes = await loadStrict("su-library-v1");
      const callRes = await loadStrict("su-calls-v1");
      const payRes = await loadStrict("su-payreq-v1");
      const grpRes = await loadStrict("su-groups-v1");
      setGroups(grpRes.value || []);
      const clubRes = await loadStrict("su-clubs-v1");
      setClubs(clubRes.value || []);
      const umRes = await loadStrict("su-umbrella-v1");
      setUmbrellas(umRes.value || seedUmbrellas);
      setLibrary(libRes.value || seedLibrary);
      setCalls(callRes.value || []);
      setPayRequests(payRes.value || []);
      if (!libRes.value) persist("su-library-v1", seedLibrary);

      const t = (tRes.value || seedTeachers).map(normalizeTeacher);
      const s = (sRes.value || seedStudents).map(normalizeStudent);
      // Every lesson keeps the format it was given in; old ones get it from the student once.
      const sch0 = (schRes.value || seedSchedule).map(normalizeSlot);
      // One-on-one lessons of students with a package go at the package rate (unless set by hand).
      const toPackage = (sl) => sl.format === "individual" && !sl.formatSet && s.find((x) => x.id === sl.studentId)?.packageTotal;
      const schNeedsFormat = sch0.some((sl) => (!sl.format && (sl.studentId || sl.trialName)) || toPackage(sl));
      const sch = sch0.map((sl) => (toPackage(sl) ? { ...sl, format: "package" } : sl.format || !(sl.studentId || sl.trialName) ? sl : { ...sl, format: slotKind(sl, s) }));
      const sal = salRes.value || seedSales;
      const prod = (prodRes.value || seedProducts).map(normalizeProduct);
      const disc = discRes.value !== null ? discRes.value : seedDiscountPercent;
      const exp = (expRes.value || []).map(normalizeExpense);

      setTeachers(t);
      setStudents(s);
      setSchedule(sch);
      setSales(sal);
      setProducts(prod);
      setDiscountPercent(disc);
      setExpenses(exp);
      setAsTeacherId(session.teacherId || t.find((x) => x.department === department)?.id || t[0]?.id || null);
      setAsStudentId(session.studentId || s[0]?.id || null);
      setLoading(false);

      // Persist under the current key whenever data came from seed data or was
      // recovered from an older key, so it's found directly next time.
      if (tRes.needsSave) persist("su-teachers-v3", t);
      if (sRes.needsSave) persist("su-students-v3", s);
      if (schRes.needsSave || schNeedsFormat) persist("su-schedule-v3", sch);
      if (salRes.needsSave) persist("su-sales-v3", sal);
      if (prodRes.needsSave) persist("su-products-v2", prod);
      if (discRes.needsSave) persist("su-discount-v2", disc);
      if (expRes.needsSave) persist("su-expenses-v1", exp);
    })();
  }, [persist]);

  useEffect(() => {
    if (loading) return;
    const deptTeachers = teachers.filter((t) => t.department === department);
    if (!deptTeachers.find((t) => t.id === asTeacherId)) setAsTeacherId(deptTeachers[0]?.id || null);
    const deptTeacherIds = deptTeachers.map((t) => t.id);
    const deptStudents = students.filter((s) => deptTeacherIds.includes(s.teacherId));
    if (!deptStudents.find((s) => s.id === asStudentId)) setAsStudentId(deptStudents[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, loading]);

  const saveTeachers = (next) => { setTeachers(next); persist("su-teachers-v3", next); };
  const saveStudents = (next) => { setStudents(next); persist("su-students-v3", next); };
  const saveSchedule = (next) => { setSchedule(next); persist("su-schedule-v3", next); };
  const saveSales = (next) => { setSales(next); persist("su-sales-v3", next); };
  const saveProducts = (next) => { setProducts(next); persist("su-products-v2", next); };
  const saveDiscount = (next) => { setDiscountPercent(next); persist("su-discount-v2", next); };
  const saveExpenses = (next) => { setExpenses(next); persist("su-expenses-v1", next); };
  const saveLibrary = (next) => { setLibrary(next); persist("su-library-v1", next); };
  const saveCalls = (next) => { setCalls(next); persist("su-calls-v1", next); };
  const savePayRequests = (next) => { setPayRequests(next); persist("su-payreq-v1", next); };
  const saveGroups = (next) => { setGroups(next); persist("su-groups-v1", next); };
  const saveUmbrellas = (next) => { setUmbrellas(next); persist("su-umbrella-v1", next); };
  const saveClubs = (next) => { setClubs(next); persist("su-clubs-v1", next); };

  const [reminderTick, setReminderTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setReminderTick((x) => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const nowMs = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    const dueSlots = schedule.filter((sl) => {
      if (sl.reminderSent || sl.status !== "booked" || !sl.studentId) return false;
      const dt = new Date(sl.date + "T" + sl.time + ":00");
      const diff = dt.getTime() - nowMs;
      return diff > 0 && diff <= oneHourMs;
    });
    if (dueSlots.length === 0) return;
    const dueIds = new Set(dueSlots.map((sl) => sl.id));
    saveSchedule(schedule.map((sl) => (dueIds.has(sl.id) ? { ...sl, reminderSent: true } : sl)));
    const byStudent = {};
    dueSlots.forEach((sl) => { (byStudent[sl.studentId] = byStudent[sl.studentId] || []).push(sl); });
    saveStudents(students.map((s) => {
      if (!byStudent[s.id]) return s;
      const newMsgs = byStudent[s.id].map((sl) => ({
        id: uid("msg"), sender: "teacher",
        text: "Напоминание: через час у вас урок в " + sl.time + ".",
        attachment: null, reactions: {}, at: new Date().toISOString(),
      }));
      return { ...s, messages: [...(s.messages || []), ...newMsgs] };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, students, reminderTick, loading]);

  const actions = {
    addLibraryItem: (item) => saveLibrary([item, ...library]),
    updateLibraryItem: (id, patch) => saveLibrary(library.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    removeLibraryItem: (id) => saveLibrary(library.filter((m) => m.id !== id)),
    // A call also lands in the chat with the administration, so the answer is there.
    callAdmin: (fromRole, fromId, { reason, text }) => {
      const at = new Date().toISOString();
      saveCalls([...calls, { id: uid("call"), fromRole, fromId, reason, text, at, status: "open" }]);
      const msg = { id: uid("smsg"), sender: fromRole, text: "🙋 Вызов администратора: " + reason + (text ? ". " + text : ""), attachment: null, reactions: {}, at };
      if (fromRole === "student") saveStudents(students.map((s) => (s.id === fromId ? { ...s, supportMessages: [...(s.supportMessages || []), msg] } : s)));
      else saveTeachers(teachers.map((t) => (t.id === fromId ? { ...t, staffMessages: [...(t.staffMessages || []), msg] } : t)));
    },
    resolveCall: (id) => saveCalls(calls.map((c) => (c.id === id ? { ...c, status: "resolved", resolvedAt: new Date().toISOString() } : c))),
    studentCancelSlot: (slotId) => {
      const sl = schedule.find((x) => x.id === slotId);
      if (!sl || (new Date(sl.date + "T" + sl.time + ":00").getTime() - Date.now()) / 36e5 <= CHANGE_DEADLINE_H) return;
      saveSchedule(schedule.map((x) => (x.id === slotId ? { ...x, status: "cancelled", cancelledBy: "student", cancelledAt: new Date().toISOString() } : x)));
      saveStudents(students.map((s) => (s.id === sl.studentId ? { ...s, messages: [...(s.messages || []), { id: uid("msg"), sender: "student", text: "✕ Отменяю урок " + formatDate(sl.date) + " в " + sl.time + ".", attachment: null, reactions: {}, at: new Date().toISOString() }] } : s)));
    },
    requestPayment: (studentId, teacherId, d) => savePayRequests([...payRequests, { id: uid("pay"), studentId, teacherId, ...d, status: "new", link: "", at: new Date().toISOString() }]),
    // Statuses: new → link_sent → paid (student says so) → confirmed by the admin; or rejected / cancelled.
    payRequestAction: (id, status, extra = {}) => {
      const r = payRequests.find((x) => x.id === id);
      if (!r) return;
      savePayRequests(payRequests.map((x) => (x.id === id ? { ...x, ...extra, status, [status + "At"]: new Date().toISOString() } : x)));
      const note = (text) => saveStudents(students.map((s) => (s.id === r.studentId ? { ...s, supportMessages: [...(s.supportMessages || []), { id: uid("smsg"), sender: "admin", text, attachment: null, reactions: {}, at: new Date().toISOString() }] } : s)));
      if (status === "link_sent") note("💳 Ссылка на оплату (" + r.label + "): " + extra.link + "\nПосле оплаты нажмите «Я оплатил(а)» в разделе «Мой прогресс».");
      if (status === "rejected") note("Запрос на оплату «" + r.label + "» отменён администратором. Если что-то не так, напишите здесь.");
      if (status !== "confirmed") return;
      if (r.clubMeetingId) {
        saveClubs(clubs.map((x) => (x.id === r.clubId ? { ...x, meetings: x.meetings.map((y) => (y.id === r.clubMeetingId ? { ...y, paidIds: [...new Set([...(y.paidIds || []), r.studentId])] } : y)) } : x)));
        saveSales([...sales, { id: uid("sale"), date: isoDate(0), productId: "club", qty: 1, discounted: false, studentId: r.studentId, teacherId: r.teacherId || null, amount: r.amount || 0, payout: 0 }]);
        note("✅ Оплата получена: " + r.label + ". Ссылка на встречу открыта в разделе «Занятия».");
        return;
      }
      if (r.slotId) {
        // One lesson paid: the lesson opens its link, no package changes.
        saveSchedule(schedule.map((sl) => (sl.id === r.slotId ? { ...sl, paid: true } : sl)));
        saveSales([...sales, { id: uid("sale"), date: isoDate(0), productId: r.productId, qty: 1, discounted: false, studentId: r.studentId, teacherId: r.teacherId || null, amount: r.amount || 0, payout: 0 }]);
        note("✅ Оплата получена: " + r.label + ". Ссылка на урок открыта в разделе «Занятия».");
        return;
      }
      // From now on this student's one-on-one lessons go at the package rate.
      const nowMs = Date.now();
      if (!r.slotId) saveSchedule(schedule.map((sl) => (sl.studentId === r.studentId && sl.format === "individual" && !sl.formatSet && new Date(sl.date + "T" + sl.time + ":00").getTime() > nowMs ? { ...sl, format: "package" } : sl)));
      const umb = umbrellas.find((u) => (u.memberIds || []).includes(r.studentId));
      if (umb) {
        const used = schedule.filter((sl) => umb.memberIds.includes(sl.studentId) && sl.type === "regular" && sl.status !== "cancelled" && sl.date < isoDate(0) && (!umb.assignedAt || sl.date >= umb.assignedAt)).length;
        const total = Math.max(0, umb.total - used) + r.lessons;
        saveUmbrellas(umbrellas.map((u) => (u.id === umb.id ? { ...u, total, assignedAt: isoDate(0) } : u)));
        saveSales([...sales, { id: uid("sale"), date: isoDate(0), productId: r.productId, qty: 1, discounted: false, studentId: r.studentId, teacherId: r.teacherId || null, amount: r.amount || 0, payout: 0 }]);
        note("✅ Оплата получена: " + r.label + " «Под одним зонтом». В пакете теперь " + total + " занятий на все предметы. Спасибо!");
        return;
      }
      // Paid lessons go on top of what is left in the current package.
      const date = isoDate(0);
      const product = products.find((p) => p.id === r.productId);
      const teacher = teachers.find((t) => t.id === r.teacherId);
      const amount = r.amount || 0;
      const payout = calcPayout(product, 1, teacher);
      const saleId = uid("sale");
      saveSales([...sales, { id: saleId, date, productId: r.productId, qty: 1, discounted: false, studentId: r.studentId, teacherId: r.teacherId || null, amount, payout }]);
      if (payout > 0 && r.teacherId) saveExpenses([...expenses, { id: uid("exp"), date, category: "Зарплата учителю", amount: payout, note: (teacher ? teacher.name : "Учитель") + " — " + (product ? product.name : r.label), linkedSaleId: saleId, auto: true }]);
      saveStudents(students.map((s) => {
        if (s.id !== r.studentId) return s;
        const used = schedule.filter((sl) => sl.studentId === s.id && sl.type === "regular" && sl.status !== "cancelled" && sl.date < date && (!s.packageAssignedAt || sl.date >= s.packageAssignedAt)).length;
        const left = s.packageTotal ? Math.max(0, s.packageTotal - used) : 0;
        const total = left + r.lessons;
        return {
          ...s, status: s.status === "trial" ? "active" : s.status, planType: "package",
          packageProductId: r.productId || null, packageTotal: total, packageAssignedAt: date,
          packageLabel: "Пакет на " + total + " занятий" + (left ? " (" + r.lessons + " новых + " + left + " с прошлого)" : ""),
          supportMessages: [...(s.supportMessages || []), { id: uid("smsg"), sender: "admin", text: "✅ Оплата получена: " + r.label + ". В пакете теперь " + total + " занятий. Спасибо!", attachment: null, reactions: {}, at: new Date().toISOString() }],
        };
      }));
    },
    addTeacher: ({ name, contact, subject, department: dept }) => {
      const id = uid("t");
      saveTeachers([...teachers, { id, name: name.trim(), contact: (contact || "").trim(), department: dept, subject, photo: "", bio: "", available: true, availableSpots: null, pageTheme: { bannerColor: "", bannerImage: "", bannerEmoji: "", stickers: [] } }]);
      return id;
    },
    updateTeacher: (id, patch) => saveTeachers(teachers.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    toggleTeacherAvailability: (id) => saveTeachers(teachers.map((t) => (t.id === id ? { ...t, available: !t.available } : t))),
    setAvailableSpots: (id, count) => saveTeachers(teachers.map((t) => (t.id === id ? { ...t, availableSpots: count } : t))),
    deleteTeacher: (id) => {
      const hasStudents = students.some((s) => s.teacherId === id);
      if (hasStudents) return;
      saveTeachers(teachers.filter((t) => t.id !== id));
      saveSchedule(schedule.filter((sl) => sl.teacherId !== id));
    },
    addStudent: (teacherId, { name, contact, goal, startLevel, startNote }) => {
      const teacher = teachers.find((t) => t.id === teacherId);
      const lvl = startLevel || firstLevel(teacher.subject);
      const id = uid("s");
      saveStudents([...students, {
        id, teacherId, name: name.trim(), contact: (contact || "").trim(), startLevel: lvl, currentLevel: lvl, startNote: (startNote || "").trim(),
        goal: (goal || "").trim(), status: "trial", planType: "individual", grammarTopics: [], vocabTopics: [], materials: [], homework: [], messages: [],
        packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "", checkpoints: [], examTarget: null, examTopics: [], examGrammar: [], examVocab: [], examMaterials: [], canRequestTeacherChange: false, teacherChangeRequest: null,
        pageTheme: { bannerColor: "", bannerEmoji: "", accentColor: "", stickers: [] },
      }]);
      return id;
    },
    updateStudent: (id, patch) => saveStudents(students.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    deleteStudent: (id) => {
      saveStudents(students.filter((s) => s.id !== id));
      saveSchedule(schedule.filter((sl) => sl.studentId !== id));
    },
    setPackage: (studentId, productId) => saveStudents(students.map((s) => {
      if (s.id !== studentId) return s;
      if (!productId) return { ...s, packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "" };
      const product = products.find((p) => p.id === productId);
      return { ...s, packageProductId: productId, packageTotal: product ? product.lessonsIncluded : null, packageAssignedAt: isoDate(0), packageLabel: product ? product.name : "" };
    })),
    setPackagePlan: (studentId, { packageProductId, packageTotal, packageLabel }) => saveStudents(students.map((s) => {
      if (s.id !== studentId) return s;
      if (packageTotal === null) return { ...s, packageProductId: null, packageTotal: null, packageAssignedAt: null, packageLabel: "" };
      return { ...s, packageProductId: packageProductId || null, packageTotal, packageLabel: packageLabel || "", packageAssignedAt: s.packageAssignedAt || isoDate(0) };
    })),
    addCheckpoint: (studentId, { title, maxScore, achievedScore, note, kind, date, monthKey }) => saveStudents(students.map((s) => s.id === studentId ? { ...s, checkpoints: [...(s.checkpoints || []), { id: uid("chk"), title: title.trim(), maxScore: Number(maxScore), achievedScore: Number(achievedScore), note: (note || "").trim(), date: date || isoDate(0), kind: kind || "check", ...(monthKey ? { monthKey } : {}) }] } : s)),
    setSelfWeek: (studentId, weekKey, patch) => saveStudents(students.map((s) => (s.id === studentId ? { ...s, selfWeeks: { ...(s.selfWeeks || {}), [weekKey]: { ...((s.selfWeeks || {})[weekKey] || {}), ...patch } } } : s))),
    removeCheckpoint: (studentId, chkId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, checkpoints: (s.checkpoints || []).filter((c) => c.id !== chkId) } : s)),
    toggleCanRequestTeacherChange: (studentId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, canRequestTeacherChange: !s.canRequestTeacherChange } : s)),
    requestTeacherChange: (studentId, note) => saveStudents(students.map((s) => s.id === studentId ? { ...s, teacherChangeRequest: { at: new Date().toISOString(), note: note || "" } } : s)),
    dismissTeacherChangeRequest: (studentId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, teacherChangeRequest: null } : s)),
    reassignStudentTeacher: (studentId, newTeacherId) => {
      saveStudents(students.map((s) => s.id === studentId ? { ...s, teacherId: newTeacherId, teacherChangeRequest: null, canRequestTeacherChange: false } : s));
      saveSchedule(schedule.filter((sl) => !(sl.studentId === studentId && sl.date >= isoDate(0))));
    },
    updatePageTheme: (studentId, patch) => saveStudents(students.map((s) => s.id === studentId ? { ...s, pageTheme: { ...(s.pageTheme || {}), ...patch } } : s)),
    addTopic: (studentId, kind, name, level) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: [...s[kind], { id: uid("tp"), name, status: "todo", ...(level ? { level } : {}) }] } : s)),
    updateTopic: (studentId, kind, topicId, patch) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: s[kind].map((t) => (t.id === topicId ? { ...t, ...patch } : t)) } : s)),
    setHomeworkStatus: (studentId, hwId, status, feedback) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, status, feedback: (feedback ?? "").trim() ? feedback.trim() : h.feedback || "", reviewedAt: status === "reviewed" ? new Date().toISOString() : h.reviewedAt } : h) } : s)),
    removeHomework: (studentId, hwId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).filter((h) => h.id !== hwId) } : s)),
    // «Сам, но не один»: the format plus a month subscription of 4 lessons.
    startSelf: (studentId) => {
      const now = Date.now();
      saveStudents(students.map((s) => (s.id === studentId ? { ...s, format: "self", planType: "package", packageProductId: null, packageTotal: 4, packageAssignedAt: isoDate(0), packageLabel: "«Сам, но не один»: абонемент на месяц, 4 занятия" } : s)));
      saveSchedule(schedule.map((sl) => (sl.studentId === studentId && !sl.groupId && sl.type !== "trial" && new Date(sl.date + "T" + sl.time + ":00").getTime() > now ? { ...sl, format: "self" } : sl)));
    },
    renewSelf: (studentId) => saveStudents(students.map((s) => (s.id === studentId ? { ...s, packageTotal: 4, packageAssignedAt: isoDate(0), packageLabel: "«Сам, но не один»: абонемент на месяц, 4 занятия" } : s))),
    setFormat: (studentId, format) => {
      saveStudents(students.map((s) => (s.id === studentId ? { ...s, format } : s)));
      const now = Date.now();
      const st = students.find((x) => x.id === studentId);
      const kind = kindForStudent({ ...st, format });
      saveSchedule(schedule.map((sl) => (sl.studentId === studentId && !sl.groupId && sl.type !== "trial" && new Date(sl.date + "T" + sl.time + ":00").getTime() > now ? { ...sl, format: kind } : sl)));
    },
    // «Под одним зонтом»: one package, a student card per subject (each with its own teacher).
    createUmbrella: ({ baseId, name, contact, total, rows }) => {
      const base = students.find((x) => x.id === baseId);
      const id = uid("um");
      const date = isoDate(0);
      const created = [];
      const memberIds = rows.map((r) => {
        if (base && base.teacherId === r.teacherId) return base.id;
        const t = teachers.find((x) => x.id === r.teacherId);
        const lvl = SUBJECTS[t.subject].levels[0];
        const nid = uid("s");
        created.push(normalizeStudent({ id: nid, teacherId: t.id, name: base?.name || name, contact: base?.contact || contact, goal: base?.goal || "", status: "active", planType: "package", startLevel: lvl, currentLevel: lvl }));
        return nid;
      });
      saveUmbrellas([...umbrellas, { id, name: base?.name || name, contact: base?.contact || contact, total, assignedAt: date, memberIds, createdAt: new Date().toISOString() }]);
      saveStudents([...students, ...created].map((x) => (memberIds.includes(x.id) ? { ...x, format: "umbrella", umbrellaId: id } : x)));
      const now = Date.now();
      saveSchedule(schedule.map((sl) => (memberIds.includes(sl.studentId) && sl.type !== "trial" && new Date(sl.date + "T" + sl.time + ":00").getTime() > now ? { ...sl, format: "umbrella" } : sl)));
    },
    createClub: (c) => saveClubs([...clubs, { id: uid("club"), ...c, meetings: [] }]),
    removeClub: (id) => saveClubs(clubs.filter((c) => c.id !== id)),
    updateClubMeeting: (clubId, mId, patch) => saveClubs(clubs.map((c) => (c.id === clubId ? { ...c, meetings: c.meetings.map((m) => (m.id === mId ? { ...m, ...patch } : m)) } : c))),
    generateClubMeetings: (clubId, weeks) => {
      const c = clubs.find((x) => x.id === clubId);
      if (!c) return "";
      const add = [];
      for (let i = 0; i < weeks * 7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const date = localDateStr(d);
        if (((d.getDay() + 6) % 7) + 1 !== c.weekday || (c.meetings || []).some((m) => m.date === date)) continue;
        if (new Date(date + "T" + c.time + ":00").getTime() < Date.now()) continue;
        add.push({ id: uid("meet"), date, time: c.time, topic: "", studentIds: [], paidIds: [], attendedIds: [], status: "planned" });
      }
      if (!add.length) return "Новых встреч нет: на эти недели всё уже стоит.";
      saveClubs(clubs.map((x) => (x.id === clubId ? { ...x, meetings: [...(x.meetings || []), ...add] } : x)));
      return "✅ Поставлено встреч: " + add.length + " («" + c.name + "»).";
    },
    // Signing up also asks the admin for a payment link for this meeting.
    clubSignUp: (clubId, mId, studentId) => {
      const c = clubs.find((x) => x.id === clubId);
      const m = c?.meetings.find((x) => x.id === mId);
      if (!m || (m.studentIds || []).includes(studentId) || (m.studentIds || []).length >= c.capacity) return;
      saveClubs(clubs.map((x) => (x.id === clubId ? { ...x, meetings: x.meetings.map((y) => (y.id === mId ? { ...y, studentIds: [...(y.studentIds || []), studentId] } : y)) } : x)));
      savePayRequests([...payRequests, { id: uid("pay"), studentId, teacherId: c.teacherId, productId: "club", lessons: 1, label: "Разговорный клуб " + formatDate(m.date) + " в " + m.time, amount: CLUB_PRICE, note: "", clubId, clubMeetingId: mId, status: "new", link: "", at: new Date().toISOString() }]);
    },
    clubLeave: (clubId, mId, studentId) => {
      saveClubs(clubs.map((x) => (x.id === clubId ? { ...x, meetings: x.meetings.map((y) => (y.id === mId ? { ...y, studentIds: (y.studentIds || []).filter((z) => z !== studentId), paidIds: (y.paidIds || []).filter((z) => z !== studentId) } : y)) } : x)));
      savePayRequests(payRequests.map((r) => (r.clubMeetingId === mId && r.studentId === studentId && ["new", "link_sent", "paid"].includes(r.status) ? { ...r, status: "cancelled" } : r)));
    },
    toggleClubAttendance: (clubId, mId, studentId) => saveClubs(clubs.map((x) => (x.id === clubId ? { ...x, meetings: x.meetings.map((y) => (y.id === mId ? { ...y, attendedIds: (y.attendedIds || []).includes(studentId) ? y.attendedIds.filter((z) => z !== studentId) : [...(y.attendedIds || []), studentId] } : y)) } : x))),
    setUmbrellaPlan: (umId, studentId, n) => saveUmbrellas(umbrellas.map((x) => (x.id === umId ? { ...x, plan: { ...(x.plan || {}), [studentId]: n } } : x))),
    addUmbrellaSubject: (umId, teacherId) => {
      const u = umbrellas.find((x) => x.id === umId);
      const t = teachers.find((x) => x.id === teacherId);
      if (!u || !t) return;
      const lvl = SUBJECTS[t.subject].levels[0];
      const nid = uid("s");
      saveStudents([...students, normalizeStudent({ id: nid, teacherId, name: u.name, contact: u.contact, status: "active", planType: "package", startLevel: lvl, currentLevel: lvl, format: "umbrella", umbrellaId: umId })]);
      saveUmbrellas(umbrellas.map((x) => (x.id === umId ? { ...x, memberIds: [...x.memberIds, nid] } : x)));
    },
    removeUmbrellaSubject: (umId, studentId) => {
      saveUmbrellas(umbrellas.map((x) => (x.id === umId ? { ...x, memberIds: x.memberIds.filter((m) => m !== studentId) } : x)));
      saveStudents(students.map((x) => (x.id === studentId ? { ...x, format: "individual", umbrellaId: null } : x)));
    },
    // A new package: what is left of the old one moves into it.
    renewUmbrella: (umId, n) => {
      const u = umbrellas.find((x) => x.id === umId);
      if (!u) return;
      const used = schedule.filter((sl) => u.memberIds.includes(sl.studentId) && sl.type === "regular" && sl.status !== "cancelled" && sl.date < isoDate(0) && (!u.assignedAt || sl.date >= u.assignedAt)).length;
      saveUmbrellas(umbrellas.map((x) => (x.id === umId ? { ...x, total: Math.max(0, u.total - used) + n, assignedAt: isoDate(0) } : x)));
    },
    removeUmbrella: (umId) => {
      const u = umbrellas.find((x) => x.id === umId);
      saveUmbrellas(umbrellas.filter((x) => x.id !== umId));
      if (u) saveStudents(students.map((x) => (u.memberIds.includes(x.id) ? { ...x, format: "individual", umbrellaId: null } : x)));
    },
    createGroup: ({ kind, teacherId, studentIds }, then) => {
      const n = groups.filter((g) => g.kind === kind).length + 1;
      const g = { id: uid("grp"), kind, teacherId, studentIds: studentIds || [], name: (kind === "pair" ? "Пара " : "Группа ") + n, slots: [], startDate: "" };
      saveGroups([...groups, g]);
      if (studentIds?.length) saveStudents(students.map((s) => (studentIds.includes(s.id) ? { ...s, format: kind } : s)));
      if (then) then(g);
    },
    updateGroup: (id, patch) => {
      saveGroups(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
      if (patch.studentIds) saveStudents(students.map((s) => (patch.studentIds.includes(s.id) ? { ...s, format: patch.kind || s.format } : s)));
    },
    removeGroup: (id) => saveGroups(groups.filter((g) => g.id !== id)),
    joinGroup: (id, studentId) => saveGroups(groups.map((g) => (g.id === id ? { ...g, studentIds: [...new Set([...(g.studentIds || []), studentId])] } : g))),
    leaveGroup: (id, studentId) => saveGroups(groups.map((g) => (g.id === id ? { ...g, studentIds: (g.studentIds || []).filter((x) => x !== studentId) } : g))),
    // Lessons for every member at the group's weekly times; already planned ones are skipped.
    generateGroupLessons: (id, weeks) => {
      const g = groups.find((x) => x.id === id);
      if (!g) return "";
      const start = new Date(Math.max(Date.now(), g.startDate ? new Date(g.startDate + "T00:00:00").getTime() : 0));
      const add = [];
      for (let i = 0; i < weeks * 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const wd = ((d.getDay() + 6) % 7) + 1;
        const date = localDateStr(d);
        for (const x of g.slots || []) {
          if (x.weekday !== wd) continue;
          for (const sid of g.studentIds || []) {
            if (schedule.some((sl) => sl.studentId === sid && sl.date === date && sl.time === x.time && sl.status !== "cancelled")) continue;
            add.push({ id: uid("sl"), teacherId: g.teacherId, studentId: sid, groupId: g.id, groupName: g.name, format: g.kind, date, time: x.time, duration: x.duration || 60, type: "regular", status: "booked", requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null });
          }
        }
      }
      if (!add.length) return "Новых занятий нет: всё на эти недели уже в расписании.";
      saveSchedule([...schedule, ...add]);
      const per = add.length / Math.max(1, (g.studentIds || []).length);
      return "✅ Поставлено " + per + " занятий для «" + g.name + "» каждому участнику (" + (g.studentIds || []).length + ").";
    },
    removeTopic: (studentId, kind, topicId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: s[kind].filter((t) => t.id !== topicId) } : s)),
    cycleTopicStatus: (studentId, kind, topicId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, [kind]: s[kind].map((t) => t.id === topicId ? { ...t, status: nextTopicStatus(t.status) } : t) } : s)),
    setExamTarget: (studentId, examTarget) => saveStudents(students.map((s) => s.id === studentId ? { ...s, examTarget, examTopics: examTarget ? (s.examTopics || []) : [] } : s)),
    addMaterial: (studentId, title, note, url, file) => saveStudents(students.map((s) => s.id === studentId ? { ...s, materials: [...(s.materials || []), { id: uid("m"), title, note, url: url || "", fileName: file?.name || "", fileType: file?.type || "", fileDataUrl: file?.dataUrl || "" }] } : s)),
    removeMaterial: (studentId, matId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, materials: (s.materials || []).filter((m) => m.id !== matId) } : s)),
    addExamMaterial: (studentId, title, note, url, file) => saveStudents(students.map((s) => s.id === studentId ? { ...s, examMaterials: [...(s.examMaterials || []), { id: uid("em"), title, note, url: url || "", fileName: file?.name || "", fileType: file?.type || "", fileDataUrl: file?.dataUrl || "" }] } : s)),
    removeExamMaterial: (studentId, matId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, examMaterials: (s.examMaterials || []).filter((m) => m.id !== matId) } : s)),
    addHomework: (studentId, { title, material, dueDate, materialAttachment, materialAttachments, mediaLink }) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: [...(s.homework || []), { id: uid("hw"), title: title.trim(), material: (material || "").trim(), materialAttachment: materialAttachment || null, materialAttachments: materialAttachments || [], mediaLink: mediaLink || "", dueDate: dueDate || null, status: "assigned", submissionText: "", submissionAttachment: null, submittedAt: null, feedback: "", createdAt: isoDate(0) }] } : s)),
    submitHomework: (studentId, hwId, text, attachments) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, submissionText: text, ...(Array.isArray(attachments) ? (attachments.length ? { submissionAttachment: null, submissionAttachments: attachments } : {}) : { submissionAttachment: attachments || null }), submittedAt: new Date().toISOString(), status: "submitted" } : h) } : s)),
    markHomeworkInReview: (studentId, hwId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, status: "in_review" } : h) } : s)),
    reviewHomework: (studentId, hwId, feedback) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, feedback: feedback || "", status: "reviewed" } : h) } : s)),
    sendHomeworkForRevision: (studentId, hwId, feedback) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, feedback: feedback || "", status: "needs_revision" } : h) } : s)),
    reopenHomework: (studentId, hwId) => saveStudents(students.map((s) => s.id === studentId ? { ...s, homework: (s.homework || []).map((h) => h.id === hwId ? { ...h, status: "in_review" } : h) } : s)),
    sendMessage: (studentId, sender, text, attachment) => saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: [...(s.messages || []), { id: uid("msg"), sender, text, attachment: attachment || null, reactions: {}, at: new Date().toISOString() }] } : s)),
    toggleMessageReaction: (studentId, messageId, who, emoji) => saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: (s.messages || []).map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      if (reactions[who] === emoji) delete reactions[who]; else reactions[who] = emoji;
      return { ...m, reactions };
    }) } : s)),
    sendSupportMessage: (studentId, sender, text, attachment) => saveStudents(students.map((s) => s.id === studentId ? { ...s, supportMessages: [...(s.supportMessages || []), { id: uid("smsg"), sender, text, attachment: attachment || null, reactions: {}, at: new Date().toISOString() }] } : s)),
    toggleSupportReaction: (studentId, messageId, who, emoji) => saveStudents(students.map((s) => s.id === studentId ? { ...s, supportMessages: (s.supportMessages || []).map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      if (reactions[who] === emoji) delete reactions[who]; else reactions[who] = emoji;
      return { ...m, reactions };
    }) } : s)),
    sendStaffMessage: (teacherId, sender, text, attachment) => saveTeachers(teachers.map((t) => t.id === teacherId ? { ...t, staffMessages: [...(t.staffMessages || []), { id: uid("stmsg"), sender, text, attachment: attachment || null, reactions: {}, at: new Date().toISOString() }] } : t)),
    toggleStaffReaction: (teacherId, messageId, who, emoji) => saveTeachers(teachers.map((t) => t.id === teacherId ? { ...t, staffMessages: (t.staffMessages || []).map((m) => {
      if (m.id !== messageId) return m;
      const reactions = { ...(m.reactions || {}) };
      if (reactions[who] === emoji) delete reactions[who]; else reactions[who] = emoji;
      return { ...m, reactions };
    }) } : t)),
    addSlot: (teacherId, { date, time, duration, type, studentId, trialName }) => {
      saveSchedule([...schedule, {
        id: uid("sl"), teacherId, studentId: studentId || null, trialName: trialName || "", date, time, duration, type,
        format: type === "trial" ? "trial" : kindForStudent(students.find((x) => x.id === studentId)),
        status: (studentId || trialName) ? "booked" : "available",
        requested: null, history: [], topicsCovered: [], lessonMaterial: "", paid: false, meetingLink: "", paymentRequest: null,
      }]);
      if (studentId) {
        saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: [...(s.messages || []), {
          id: uid("msg"), sender: "teacher", text: "Вам назначен урок: " + formatDate(date) + ", " + time + ".", attachment: null, reactions: {}, at: new Date().toISOString(),
        }] } : s));
      }
    },
    assignSlot: (slotId, studentId) => {
      const slot = schedule.find((sl) => sl.id === slotId);
      saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, studentId, status: "booked" } : sl));
      if (slot) {
        saveStudents(students.map((s) => s.id === studentId ? { ...s, messages: [...(s.messages || []), {
          id: uid("msg"), sender: "teacher", text: "Вам назначен урок: " + formatDate(slot.date) + ", " + slot.time + ".", attachment: null, reactions: {}, at: new Date().toISOString(),
        }] } : s));
      }
    },
    cancelSlot: (slotId) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, status: "cancelled" } : sl)),
    rescheduleSlot: (slotId, newDate, newTime) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, history: [...sl.history, { date: sl.date, time: sl.time }], date: newDate, time: newTime, requested: null, status: "booked" } : sl)),
    updateSlotDetails: (slotId, { duration, type, trialName, format, isCheck }) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, duration, type, trialName: trialName || "", ...(format ? { format, formatSet: true } : {}), isCheck: !!isCheck } : sl)),
    addSlotFile: (slotId, file) => saveSchedule(schedule.map((sl) => (sl.id === slotId ? { ...sl, lessonFiles: [...(sl.lessonFiles || []), file] } : sl))),
    removeSlotFile: (slotId, idx) => saveSchedule(schedule.map((sl) => (sl.id === slotId ? { ...sl, lessonFiles: (sl.lessonFiles || []).filter((_, i) => i !== idx) } : sl))),
    addSlotTopic: (slotId, name) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, topicsCovered: [...(sl.topicsCovered || []), name] } : sl)),
    removeSlotTopic: (slotId, name) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, topicsCovered: (sl.topicsCovered || []).filter((n) => n !== name) } : sl)),
    setSlotMaterial: (slotId, text) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, lessonMaterial: text } : sl)),
    toggleSlotPaid: (slotId) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paid: !sl.paid } : sl)),
    payForSlot: (slotId, { productId, teacherId }) => {
      // Student-facing: only RECORDS that the student says they paid. Does NOT mark the lesson
      // paid, does NOT record a sale, and does NOT touch package balances — that requires
      // confirmPayment(), which is only reachable from teacher/admin UI (perm.schedule).
      saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paymentRequest: { productId, teacherId, requestedAt: new Date().toISOString() } } : sl));
    },
    confirmPayment: (slotId) => {
      const slot = schedule.find((sl) => sl.id === slotId);
      if (!slot || !slot.paymentRequest) return;
      const { productId } = slot.paymentRequest;
      const product = products.find((p) => p.id === productId);
      const teacher = teachers.find((t) => t.id === slot.teacherId);
      saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paid: true, paymentRequest: null } : sl));
      const amount = calcSaleAmount(product, 1, false, discountPercent);
      const payout = calcPayout(product, 1, teacher);
      const saleId = uid("sale");
      saveSales([...sales, { id: saleId, date: isoDate(0), productId, qty: 1, discounted: false, studentId: slot.studentId, teacherId: slot.teacherId, amount, payout }]);
      if (payout > 0) {
        saveExpenses([...expenses, { id: uid("exp"), date: isoDate(0), category: "Зарплата учителю", amount: payout, note: (teacher ? teacher.name : "Учитель") + " — " + (product ? product.name : ""), linkedSaleId: saleId, auto: true }]);
      }
      if (product && product.lessonsIncluded > 0 && slot.studentId) {
        saveStudents(students.map((s) => s.id === slot.studentId ? { ...s, packageProductId: product.id, packageTotal: product.lessonsIncluded, packageAssignedAt: isoDate(0) } : s));
      }
    },
    dismissPaymentRequest: (slotId) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, paymentRequest: null } : sl)),
    setMeetingLink: (slotId, link) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, meetingLink: link } : sl)),
    setSlotPaymentLink: (slotId, link) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, slotPaymentLink: link } : sl)),
    requestReschedule: (slotId, date, time, note) => saveSchedule(schedule.map((sl) => sl.id === slotId ? { ...sl, status: "reschedule-requested", requested: { date, time, note } } : sl)),
    resolveRequest: (slotId, accept) => saveSchedule(schedule.map((sl) => {
      if (sl.id !== slotId) return sl;
      if (accept && sl.requested) return { ...sl, history: [...sl.history, { date: sl.date, time: sl.time }], date: sl.requested.date, time: sl.requested.time, requested: null, status: "booked" };
      return { ...sl, requested: null, status: "booked" };
    })),
    addProduct: ({ name, price, department: dept, subject, lessonsIncluded, paymentLink, payoutPerUnit }) => saveProducts([...products, { id: uid("prod"), name: name.trim(), price: Number(price) || 0, department: dept || "language", subject: subject || null, lessonsIncluded: Number(lessonsIncluded) || 0, paymentLink: (paymentLink || "").trim(), payoutPerUnit: Number(payoutPerUnit) || 0 }]),
    updateProduct: (id, patch) => saveProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    removeProduct: (id) => saveProducts(products.filter((p) => p.id !== id)),
    setDiscount: (percent) => saveDiscount(Number(percent) || 0),
    setTeacherRate: (teacherId, kind, amount) => saveTeachers(teachers.map((t) => (t.id === teacherId ? { ...t, rates: { ...(t.rates || {}), [kind]: amount } } : t))),
    setTeacherPayoutRate: (teacherId, productId, amount) => saveTeachers(teachers.map((t) => t.id === teacherId ? { ...t, payoutOverrides: { ...(t.payoutOverrides || {}), [productId]: amount === null ? undefined : Number(amount) || 0 } } : t)),
    addSale: ({ date, productId, qty, discounted, studentId, teacherId }) => {
      const product = products.find((p) => p.id === productId);
      const teacher = teachers.find((t) => t.id === teacherId);
      const amount = calcSaleAmount(product, qty || 1, discounted, discountPercent);
      const payout = calcPayout(product, qty || 1, teacher);
      const saleId = uid("sale");
      saveSales([...sales, { id: saleId, date, productId, qty: qty || 1, discounted: !!discounted, studentId: studentId || null, teacherId: teacherId || null, amount, payout }]);
      if (payout > 0 && teacherId) {
        saveExpenses([...expenses, { id: uid("exp"), date, category: "Зарплата учителю", amount: payout, note: (teacher ? teacher.name : "Учитель") + " — " + (product ? product.name : ""), linkedSaleId: saleId, auto: true }]);
      }
      if (studentId && product && product.lessonsIncluded > 0) {
        saveStudents(students.map((s) => s.id === studentId ? { ...s, packageProductId: product.id, packageTotal: product.lessonsIncluded, packageAssignedAt: date } : s));
      }
    },
    removeSale: (id) => {
      saveSales(sales.filter((x) => x.id !== id));
      saveExpenses(expenses.filter((e) => e.linkedSaleId !== id));
    },
    addExpense: (date, category, amount, note) => saveExpenses([...expenses, { id: uid("exp"), date, category, amount: Number(amount) || 0, note: note || "" }]),
    removeExpense: (id) => saveExpenses(expenses.filter((x) => x.id !== id)),
    resetDemo: () => { saveTeachers(seedTeachers); saveStudents(seedStudents); saveSchedule(seedSchedule); saveSales(seedSales); saveProducts(seedProducts); saveDiscount(seedDiscountPercent); saveExpenses([]); saveLibrary(seedLibrary); saveCalls([]); savePayRequests([]); saveGroups([]); saveUmbrellas(seedUmbrellas); saveClubs([]); setResetArmed(false); },
  };

  async function runDiagnostics() {
    try {
      const results = [];
      for (const prefix of ["su-", "school-"]) {
        const listing = await storage.list(prefix, true);
        for (const k of listing.keys || []) {
          try {
            const r = await storage.get(k, true);
            const parsed = JSON.parse(r.value);
            const info = Array.isArray(parsed) ? parsed.length + " записей" : (parsed && typeof parsed === "object" ? Object.keys(parsed).length + " полей" : String(parsed));
            results.push({ key: k, info });
          } catch (e) {
            results.push({ key: k, info: "не читается" });
          }
        }
      }
      setDiagnostics(results);
    } catch (e) {
      setDiagnostics([]);
      setErrorMsg("Не удалось просканировать хранилище: " + e.message);
    }
  }

  async function forceRestoreFrom(key, targetType) {
    try {
      const r = await storage.get(key, true);
      const parsed = JSON.parse(r.value);
      if (targetType === "teachers") saveTeachers(parsed.map(normalizeTeacher));
      else if (targetType === "students") saveStudents(parsed.map(normalizeStudent));
      else if (targetType === "schedule") saveSchedule(parsed.map(normalizeSlot));
      else if (targetType === "sales") saveSales(parsed);
      else if (targetType === "products") saveProducts(parsed.map(normalizeProduct));
      else if (targetType === "discount") saveDiscount(parsed);
      else if (targetType === "expenses") saveExpenses(parsed.map(normalizeExpense));
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Не удалось восстановить из ключа " + key + ": " + e.message);
    }
  }

  function exportAllData() {
    const payload = { teachers, students, schedule, sales, products, discountPercent, expenses, library, calls, payRequests, groups, umbrellas, clubs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study-umbrella-backup-" + isoDate(0) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importAllData(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      if (data.teachers) saveTeachers(data.teachers.map(normalizeTeacher));
      if (data.students) saveStudents(data.students.map(normalizeStudent));
      if (data.schedule) saveSchedule(data.schedule.map(normalizeSlot));
      if (data.sales) saveSales(data.sales);
      if (data.products) saveProducts(data.products.map(normalizeProduct));
      if (typeof data.discountPercent === "number") saveDiscount(data.discountPercent);
      if (data.expenses) saveExpenses(data.expenses.map(normalizeExpense));
      if (data.library) saveLibrary(data.library);
      if (data.calls) saveCalls(data.calls);
      if (data.payRequests) savePayRequests(data.payRequests);
      if (data.groups) saveGroups(data.groups);
      if (data.umbrellas) saveUmbrellas(data.umbrellas);
      if (data.clubs) saveClubs(data.clubs);
      setErrorMsg("");
      return true;
    } catch (e) {
      setErrorMsg("Не удалось прочитать файл импорта: " + e.message);
      return false;
    }
  }

  if (loading) {
    return (
      <div className="app-root loading-root">
        <style>{CSS}</style>
        <Loader2 className="spin" size={22} />
        <span>Загружаем данные школы…</span>
      </div>
    );
  }

  const ext = { library, calls, payRequests, groups, umbrellas, clubs, students, teachers };
  const currentTeacher = teachers.find((t) => t.id === asTeacherId && t.department === department) || teachers.filter((t) => t.department === department)[0];
  const currentStudent = students.find((s) => s.id === asStudentId) || null;
  const currentStudentTeacher = currentStudent ? teachers.find((t) => t.id === currentStudent.teacherId) : null;
  const deptTeachersForSelect = teachers.filter((t) => t.department === department);
  const deptStudentsForSelect = students.filter((s) => {
    const t = teachers.find((tt) => tt.id === s.teacherId);
    return t && t.department === department;
  });

  return (
    <div className={"app-root theme-" + department}>
      <style>{CSS + EXTRA_CSS}</style>

      <header className="top-bar">
        <a href="/" className="brand-link" title="На сайт школы"><img src={LOGO_DATA_URI} alt="Study Umbrella" className="brand-logo" /></a>
        <div className="header-titles">
          <div className="brand-name">{ROLE_LABELS[role]}</div>
          <div className="muted-text">{session.who}</div>
        </div>
        {session.demo && (
          <div className="role-switch" role="group" aria-label="Демо: смотреть как">
            <span className="role-switch-label">Демо, смотреть как:</span>
            {session.isAdmin && <button className={role === "admin" ? "role-btn active" : "role-btn"} onClick={() => setRole("admin")}>Администратор</button>}
            <button className={role === "teacher" ? "role-btn active" : "role-btn"} onClick={() => setRole("teacher")}>Преподаватель</button>
            <button className={role === "student" ? "role-btn active" : "role-btn"} onClick={() => setRole("student")}>Ученик</button>
          </div>
        )}
        {session.demo && role === "teacher" && (
          <select className="mini-select" value={asTeacherId || ""} onChange={(e) => setAsTeacherId(e.target.value)}>
            {deptTeachersForSelect.map((t) => <option key={t.id} value={t.id}>Я — {t.name}</option>)}
          </select>
        )}
        {session.demo && role === "student" && (
          <select className="mini-select" value={asStudentId || ""} onChange={(e) => setAsStudentId(e.target.value)}>
            {deptStudentsForSelect.map((s) => <option key={s.id} value={s.id}>Я — {s.name}</option>)}
          </select>
        )}
        {role === "student" && currentStudent && <CallAdminButton role="student" calls={calls} fromId={currentStudent.id} onCall={(d) => actions.callAdmin("student", currentStudent.id, d)} />}
        {role === "teacher" && currentTeacher && <CallAdminButton role="teacher" calls={calls} fromId={currentTeacher.id} onCall={(d) => actions.callAdmin("teacher", currentTeacher.id, d)} />}
        <a className="logout-btn site-link" href="/" title="Вернуться на сайт Study Umbrella">← <span className="site-txt">На сайт</span></a>
        <button className="logout-btn" onClick={onLogout} title="Выйти">Выйти</button>
      </header>

      {((role === "admin" && session.isAdmin) || session.demo) && (
        <div className="dept-bar">
          <button className={"dept-btn dept-language" + (department === "language" ? " active" : "")} onClick={() => setDepartment("language")}>Языковая школа</button>
          <button className={"dept-btn dept-humanities" + (department === "humanities" ? " active" : "")} onClick={() => setDepartment("humanities")}>Гуманитарная школа · ОГЭ и ЕГЭ</button>
        </div>
      )}

      {noticeVisible && session.demo && (
        <div className="notice">
          <AlertCircle size={14} />
          <span>Демо-режим: данные выдуманные и сохраняются только в этом браузере. В рабочей версии кабинет подключится к базе школы, а вход определит роль сам.</span>
          <button className="notice-close" onClick={() => setNoticeVisible(false)} aria-label="Закрыть"><X size={13} /></button>
        </div>
      )}

      {errorMsg && errorMsg !== "__imported_ok__" && (
        <div className="notice error">
          <AlertCircle size={14} /> <span>{errorMsg}</span>
          <button className="notice-close" onClick={() => setErrorMsg("")} aria-label="Закрыть"><X size={13} /></button>
        </div>
      )}

      <main className="main-area">
        {role === "admin" && session.isAdmin && <AdminAccess session={session} />}
        {role === "admin" && session.isAdmin && <AdminView department={department} teachers={teachers} students={students} schedule={schedule} sales={sales} products={products} discountPercent={discountPercent} expenses={expenses} actions={actions} ext={ext} />}
        {role === "teacher" && currentTeacher && (
          <TeacherView teacher={currentTeacher} teachers={teachers} students={students} schedule={schedule} actions={actions} products={products} perm={{ profile: true, schedule: true, package: true }} ext={ext} />
        )}
        {role === "teacher" && !currentTeacher && <EmptyState icon={Users} title="В этом подразделении пока нет учителей" />}
        {role === "student" && currentStudent && currentStudentTeacher && (
          <StudentView student={currentStudent} teacher={currentStudentTeacher} schedule={schedule} actions={actions} products={products} ext={ext} onSwitchStudent={setAsStudentId} />
        )}
        {role === "student" && !currentStudent && <EmptyState icon={GraduationCap} title="В этом подразделении пока нет учеников" />}
      </main>

      {role === "admin" && session.isAdmin && <footer className="foot-bar">
        <div className="row-gap" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="row-gap">
            {!resetArmed ? (
              <button className="btn-small" onClick={() => setResetArmed(true)}><RotateCcw size={12} /> Сбросить к демо-данным</button>
            ) : (
              <span className="row-gap">
                Точно сбросить все данные?
                <button className="btn-small danger" onClick={actions.resetDemo}>Да, сбросить</button>
                <button className="btn-small" onClick={() => setResetArmed(false)}>Отмена</button>
              </span>
            )}
          </div>
          <div className="row-gap">
            <button className="btn-small accent" onClick={exportAllData}>⬇️ Скачать резервную копию</button>
            <label className="btn-small">
              ⬆️ Загрузить резервную копию
              <input
                type="file" accept="application/json" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  e.target.value = "";
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => { if (importAllData(reader.result)) setErrorMsg("__imported_ok__"); };
                  reader.readAsText(file);
                }}
              />
            </label>
            <button className="btn-small" onClick={runDiagnostics}>🔍 Показать ключи хранилища</button>
          </div>
        </div>
        {errorMsg === "__imported_ok__" && (
          <div className="hint-text" style={{ color: "var(--accent)", marginTop: 6 }}>Резервная копия загружена.</div>
        )}
        <div className="hint-text" style={{ marginTop: 6 }}>
          Рекомендуем время от времени скачивать резервную копию — она сохраняется как обычный файл на вашем компьютере и её всегда можно загрузить обратно.
        </div>
        {diagnostics && (
          <div className="add-panel" style={{ marginTop: 8 }}>
            <div className="row-gap" style={{ justifyContent: "space-between" }}>
              <span className="hint-text">Всё, что реально есть в хранилище (su-/school-):</span>
              <button className="btn-icon" onClick={() => setDiagnostics(null)}><X size={14} /></button>
            </div>
            {diagnostics.length === 0 && <div className="muted-text">Ключей не найдено — хранилище для этого артефакта пустое.</div>}
            {diagnostics.map((d) => (
              <div key={d.key} className="sales-log-row">
                <span>{d.key}</span>
                <span>{d.info}</span>
                <select className="mini-select" defaultValue="" onChange={(e) => { if (e.target.value) { forceRestoreFrom(d.key, e.target.value); e.target.value = ""; } }}>
                  <option value="">Загрузить как…</option>
                  <option value="teachers">Учителя</option>
                  <option value="students">Ученики</option>
                  <option value="schedule">Расписание</option>
                  <option value="sales">Продажи</option>
                  <option value="products">Товары</option>
                  <option value="discount">Скидка</option>
                  <option value="expenses">Траты</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </footer>}
    </div>
  );
}

/* --------------------------------- css --------------------------------- */

const CSS = `

:root {
  --ink: #1E2B2F;
  --ink-soft: #5A6669;
  --paper: #F5F0E8;
  --card: #FFFFFF;
  --border: #E2D9CB;
  --coral: #B8303C;
  --coral-soft: #F7DCD9;
  --teal: #2F6F73;
  --teal-soft: #D6E8E6;
  --butter: #F3D27A;
  --accent: var(--coral);
  --accent-soft: var(--coral-soft);
  --gold: #8A6A12;
  --gold-soft: #FFF0C7;
  --danger: #A3423D;
  --danger-soft: #F3DEDC;
  --font-display: 'Kyiv Type Serif', Georgia, serif;
  --font-ui: 'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-hand: 'Caveat', 'Segoe Print', cursive;
}

.theme-language { --accent: var(--teal); --accent-soft: var(--teal-soft); }
.theme-humanities { --accent: #A9791E; --accent-soft: #FFF0C7; }

.subj-english { --accent: #5B7FB5; --accent-soft: #E1E9F6; }
.subj-italian { --accent: #3F8F5E; --accent-soft: #DDEFE3; }
.subj-turkish { --accent: #B8303C; --accent-soft: #F7DCD9; }
.subj-spanish { --accent: #C9922E; --accent-soft: #F5E7CC; }
.subj-chinese { --accent: #E0685C; --accent-soft: #FBDEDB; }
.subj-korean { --accent: #6FA8C7; --accent-soft: #DCEEF5; }
.subj-history { --accent: #A9791E; --accent-soft: #FFF0C7; }
.subj-social { --accent: #2F6F73; --accent-soft: #D6E8E6; }
.subj-russian { --accent: #9C3F5C; --accent-soft: #F2DEE6; }

.app-root { font-family: var(--font-ui); background: var(--paper); color: var(--ink); min-height: 100vh; font-size: 15px; }
.loading-root { display:flex; align-items:center; justify-content:center; gap:10px; padding: 60px 0; color: var(--ink-soft); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.top-bar { position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:10px 16px; flex-wrap:wrap; padding: 12px clamp(16px,2.5vw,32px); border-bottom: 1px solid var(--border); background: rgba(255,255,255,.96); backdrop-filter: blur(8px); }
.brand-link { display:block; }
.logout-btn { border:1.5px solid var(--ink); background:transparent; color:var(--ink); border-radius:999px; padding:7px 16px; font:600 13px var(--font-ui); cursor:pointer; }
.logout-btn:hover { background: var(--ink); color:#fff; }
.site-link { text-decoration:none; display:inline-flex; align-items:center; }
.role-switch-label { font-size:12px; color: var(--ink-soft); padding: 0 6px 0 8px; align-self:center; }
.header-wave { position:absolute; left:0; right:0; bottom:0; width:100%; height:40px; pointer-events:none; }
.brand-logo { height: 40px; width: auto; display:block; position:relative; z-index:1; }
.header-titles { display:flex; flex-direction:column; margin-right: 8px; position:relative; z-index:1; }
.brand-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--ink); line-height:1.1; }
.role-switch { display:flex; flex-wrap:wrap; gap:2px; background: var(--paper); border:1px solid var(--border); border-radius: 999px; padding:2px; margin-left: auto; position:relative; z-index:1; }
.role-btn { border:none; background:transparent; padding:6px 12px; border-radius:999px; font-family: var(--font-ui); font-size:13px; font-weight:500; color: var(--ink-soft); cursor:pointer; transition: all .15s ease; }
.role-btn.active { background: var(--ink); color:#fff; }

.dept-bar { display:flex; flex-wrap:wrap; gap:8px; padding: 10px clamp(16px,2.5vw,32px); border-bottom: 1px solid var(--border); background: var(--card); }
.dept-btn { border:1.5px solid var(--border); background: var(--paper); padding:8px 18px; border-radius:999px; font-family: var(--font-ui); font-size:13px; font-weight:600; cursor:pointer; color: var(--ink-soft); transition: all .15s ease; }
.dept-btn:hover { transform: translateY(-1px); }
.dept-btn.dept-language.active { background: var(--teal); border-color: var(--teal); color:#fff; }
.dept-btn.dept-humanities.active { background: var(--butter); border-color: var(--butter); color: var(--ink); }

.notice { display:flex; align-items:center; gap:8px; font-size:13px; background: var(--gold-soft); color: var(--ink); padding:9px clamp(16px,2.5vw,32px); }
.notice.error { background: var(--danger-soft); }
.notice-close { margin-left:auto; background:none; border:none; cursor:pointer; color: var(--ink-soft); }

.main-area { padding: 20px clamp(16px,2.5vw,32px) 48px; max-width: 1480px; margin: 0 auto; }
.foot-bar { padding: 14px clamp(16px,2.5vw,32px); background: var(--card); border-top: 1px solid var(--border); }

.card { background: var(--card); border:1px solid var(--border); border-top: 4px solid var(--accent); border-radius: 22px; padding: 20px; margin-bottom: 16px; }
.card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom: 10px; }
.card h2 { font-family: var(--font-display); font-size: 24px; line-height:1.1; margin:0 0 2px 0; }
.card h3, .col-header h3 { font-family: var(--font-display); font-size: 15px; margin:0; display:flex; align-items:center; gap:6px; }

.field-block { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--border); }
.field-label { font-size: 11.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-soft); margin-bottom: 6px; font-weight:600; }
.body-text { font-size: 14px; line-height:1.5; margin:0; white-space: pre-wrap; }
.muted-text { font-size: 12.5px; color: var(--ink-soft); }
.hint-text { font-size: 11.5px; color: var(--ink-soft); }

.pill { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; background: var(--border); color: var(--ink-soft); }
.pill-accent { background: var(--accent-soft); color: var(--accent); }
.pill-teal { background: var(--teal-soft); color: var(--teal); }
.pill-gold { background: var(--gold-soft); color: var(--gold); }
.pill-danger { background: var(--danger-soft); color: var(--danger); }
.pill-green { background: #DCEEDC; color: #3C8C3C; }

.progress-track { position:relative; height: 18px; background: var(--border); border-radius: 999px; overflow:hidden; margin-bottom:6px; }
.progress-fill { height:100%; background: var(--accent); border-radius:999px; transition: width .3s ease; }
.progress-label { position:absolute; right:8px; top:0; font-size:10.5px; line-height:18px; color: var(--ink); font-weight:600; }

.level-ladder { display:flex; gap:5px; margin-top: 14px; }
.ladder-step { flex:1; text-align:center; padding:7px 4px; border-radius:8px; background: var(--border); color: var(--ink-soft); font-size:11.5px; font-weight:600; position:relative; }
.ladder-step.filled { background: var(--accent-soft); color: var(--accent); }
.ladder-step.current { background: var(--accent); color:#fff; box-shadow: 0 0 0 3px var(--accent-soft); }
.ladder-tag { position:absolute; top:-15px; left:50%; transform:translateX(-50%); font-size:9px; color: var(--gold); font-weight:700; text-transform:uppercase; white-space:nowrap; }
.level-fallback { display:flex; align-items:center; gap:6px; margin-top:8px; }

.chip-row { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.chip { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:500; padding:5px 10px; border-radius:999px; border:1.5px solid var(--border); background: var(--card); color: var(--ink-soft); cursor:pointer; transition: all .12s ease; }
.chip:hover:not(:disabled) { transform: translateY(-1px); }
.chip-symbol { font-size:11px; }
.chip-todo { background: var(--card); border-color: var(--border); color: var(--ink-soft); }
.chip-in_progress { background: var(--gold-soft); border-color: var(--gold); color: var(--gold); border-style: dashed; }
.chip-done { background: var(--accent); border-color: var(--accent); color: #fff; }
.chip:disabled { cursor:default; }
.topic-dropdown { margin-top:8px; background: var(--paper); border:1px solid var(--border); border-radius:10px; padding:10px; }
.topic-dropdown-list { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:4px 12px; margin-bottom:10px; max-height:220px; overflow-y:auto; }
.topic-option { display:flex; align-items:center; gap:7px; font-size:12.5px; padding:3px 0; cursor:pointer; }

.materials-list { list-style:none; margin:6px 0; padding:0; display:flex; flex-direction:column; gap:5px; }
.materials-list li { display:flex; align-items:center; gap:7px; font-size:13px; padding:6px 8px; border-radius:8px; background: var(--paper); }
.product-edit-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; background: var(--paper); border-radius:8px; padding:6px 8px; }
.materials-block { padding: 10px 0; border-top: 1px dashed var(--border); }
.materials-block:first-child { border-top:none; }
.materials-block-head { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.topic-remove { margin-left:auto; background:none; border:none; color: var(--ink-soft); cursor:pointer; }

.homework-list { display:flex; flex-direction:column; gap:10px; margin-top:8px; }
.homework-item { background: var(--paper); border-radius:12px; padding:12px; }
.hw-submission { background: var(--card); border-radius:8px; padding:8px; margin-top:6px; }
.attach-list { display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; }
.attachment-chip.media { flex-direction:column; align-items:flex-start; gap:4px; }
.subj-switch { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:12px; }
.hw-status-bar { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); }
.hw-feedback { margin-top:6px; font-size:12.5px; background: var(--accent-soft); color: var(--ink); padding:6px 8px; border-radius:8px; }

.chat-box { display:flex; flex-direction:column; gap:2px; max-height:440px; overflow-y:auto; padding:8px 4px; }
.chat-day { text-align:center; margin:10px 0 6px; }
.chat-day span { font-size:11px; color: var(--ink-soft); background: var(--paper); border-radius:999px; padding:3px 12px; }
.chat-bubble { padding:7px 12px 5px; border-radius:16px; font-size:14px; line-height:1.4; width:fit-content; max-width:100%; }
.chat-bubble.mine { background: var(--accent); color:#fff; border-bottom-right-radius:16px; }
.chat-bubble.theirs { background: var(--paper); color: var(--ink); border-bottom-left-radius:16px; }
.chat-bubble.mine.last { border-bottom-right-radius:5px; }
.chat-bubble.theirs.last { border-bottom-left-radius:5px; }
.chat-text { white-space:pre-wrap; overflow-wrap:anywhere; }
.chat-meta { display:flex; justify-content:flex-end; align-items:center; gap:6px; margin-top:2px; }
.chat-time { font-size:10.5px; opacity:.7; }
.chat-name { font-size:11.5px; font-weight:600; color: var(--ink-soft); margin:6px 6px 2px; }
.chat-row.mine .chat-name { text-align:right; }
.chat-att { margin-top:4px; }

.slot-group-label { font-size:11px; text-transform:uppercase; letter-spacing:.04em; color: var(--ink-soft); margin: 14px 0 6px; font-weight:600; }
.past-lessons-section { margin-top: 16px; padding-top: 12px; border-top: 2px dotted var(--border); }
.past-lessons-toggle { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-size:12px; font-weight:600; color: var(--ink-soft); padding:4px 0; }
.past-chevron { display:inline-block; transition: transform .15s ease; }
.past-chevron.open { transform: rotate(90deg); }
.past-list { margin-top: 8px; opacity: 0.75; filter: grayscale(30%); }
.past-list .slot-row { background: var(--paper); }
.past-lesson-card { background: var(--paper); border-radius:10px; padding:10px 12px; margin-bottom:8px; font-size:12.5px; }
.past-lesson-card.cancelled { opacity:.6; }
.slot-list { display:flex; flex-direction:column; gap:8px; }
.slot-row { background: var(--paper); border-radius:10px; padding:8px 10px; font-size:12.5px; }
.slot-row.status-cancelled { opacity:.55; }
.slot-when { display:flex; justify-content:space-between; font-weight:600; margin-bottom:4px; }
.slot-time { display:flex; align-items:center; gap:4px; font-weight:400; color: var(--ink-soft); }
.slot-mid { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:6px; }
.slot-student { font-weight:600; }
.slot-request-note { font-size:11.5px; color: var(--gold); }
.slot-actions { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.slot-history { margin-top:6px; font-size:10.5px; color: var(--ink-soft); }

.schedule-wrap { }
.schedule-nav { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
.schedule-range { font-weight:600; font-size:13px; font-family: var(--font-display); }
.schedule-grid-scroll { overflow-x:auto; }
.schedule-grid { display:grid; gap:3px; min-width:640px; }
.schedule-corner { background:transparent; }
.schedule-day-head { text-align:center; background: var(--paper); border-radius:8px; padding:5px 2px; font-size:11.5px; }
.schedule-day-head.is-today { background: var(--accent-soft); color: var(--accent); font-weight:700; }
.schedule-day-name { text-transform:capitalize; font-weight:600; }
.schedule-day-date { color: var(--ink-soft); font-size:10.5px; }
.schedule-time-label { font-size:10.5px; color: var(--ink-soft); text-align:right; padding-right:4px; align-self:center; }
.schedule-cell { min-height:34px; background: var(--paper); border-radius:6px; padding:2px; display:flex; flex-direction:column; gap:2px; }
.schedule-cell.is-empty { cursor:pointer; }
.schedule-cell.is-empty:hover { background: var(--accent-soft); }
.schedule-chip { border:none; border-radius:5px; padding:2px 4px; font-size:9.5px; text-align:left; cursor:pointer; line-height:1.25; background: var(--border); color: var(--ink-soft); }
.schedule-chip.status-available { background: var(--card); border: 1px dashed var(--accent); color: var(--accent); }
.schedule-chip.status-booked { background: var(--accent); color:#fff; }
.schedule-chip.status-reschedule-requested { background: var(--gold-soft); color: var(--gold); border: 1px solid var(--gold); }
.chip-time { font-weight:700; display:block; }
.chip-info { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.schedule-add-panel, .schedule-detail { margin-top:12px; }
.schedule-detail { background: var(--paper); border-radius:10px; padding:10px; }

.add-panel { display:flex; flex-direction:column; gap:8px; background: var(--paper); border-radius:12px; padding:12px; margin-bottom:10px; }
.row-gap { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }

.mini-input, .mini-select, .mini-textarea { font-family: var(--font-ui); font-size:13.5px; border:1px solid var(--border); border-radius:10px; padding:7px 10px; background:#fff; color: var(--ink); }
.mini-input.wide { flex:1; min-width:160px; }
.mini-textarea { width:100%; min-height:52px; resize:vertical; }

.btn-icon { background: var(--accent); color:#fff; border:none; border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: transform .12s ease; }
.btn-icon:hover:not(:disabled) { transform: translateY(-1px); }
.btn-icon:disabled { opacity:.4; cursor:not-allowed; }
.btn-icon.danger { background: var(--danger); }
.btn-small { display:inline-flex; align-items:center; gap:4px; background:#fff; border:1px solid var(--border); border-radius:999px; padding:6px 12px; font-family: var(--font-ui); font-size:12px; font-weight:500; cursor:pointer; color: var(--ink); transition: transform .12s ease; }
.btn-small:hover { transform: translateY(-1px); }
.btn-small.accent { background: var(--accent); color:#fff; border-color: var(--accent); }
.btn-small.danger { background: var(--danger); color:#fff; border-color: var(--danger); }

.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding: 26px 10px; color: var(--ink-soft); text-align:center; }
.empty-title { font-weight:600; font-size:13px; }
.empty-hint { font-size:11.5px; }

.tabs { display:flex; gap:4px; margin-bottom:14px; flex-wrap:wrap; }
.tab { display:inline-flex; align-items:center; gap:6px; background: var(--card); border:1px solid var(--border); padding:9px 16px; border-radius:999px; font-family: var(--font-ui); font-size:13px; font-weight:500; cursor:pointer; color: var(--ink-soft); transition: transform .12s ease; }
.tab:hover { transform: translateY(-1px); }
.tab.active { background: var(--accent); color:#fff; border-color: var(--accent); }

.subject-group { margin-bottom: 18px; }
.subject-group-title { font-family: var(--font-display); font-size: 15px; font-weight:700; margin-bottom:8px; padding-bottom:6px; border-bottom: 2px solid var(--accent-soft); }
.thread-row-wrap { margin-bottom: 6px; }
.thread-row { display:flex; align-items:center; gap:10px; width:100%; text-align:left; background: var(--card); border:1px solid var(--border); border-radius:10px; padding:8px 12px; cursor:pointer; }
.thread-row.unread { border-color: var(--accent); background: var(--accent-soft); }
.thread-row-body { flex:1; min-width:0; }
.thread-row-name { font-weight:600; font-size:13px; display:flex; align-items:center; gap:6px; }
.thread-row-preview { font-size:12px; color: var(--ink-soft); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:400px; }
.thread-row-time { font-size:10.5px; color: var(--ink-soft); flex-shrink:0; }
.thread-dot { width:7px; height:7px; border-radius:50%; background: var(--danger); display:inline-block; }

.teacher-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(230px,1fr)); gap:12px; align-items:stretch; }
.teacher-card { position:relative; text-align:left; background: var(--card); border:1px solid var(--border); border-radius:14px; padding:14px; display:flex; flex-direction:column; height:100%; }
.teacher-card-body { cursor:pointer; display:flex; flex-direction:column; flex:1; }
.teacher-card-actions { position:absolute; top:10px; right:10px; display:flex; gap:4px; z-index:2; }
.teacher-card-actions .btn-icon { width:24px; height:24px; }
.teacher-card:hover { border-color: var(--accent); }
.teacher-card-name { font-weight:700; font-size:14.5px; margin-bottom:2px; min-height:19px; }
.teacher-card-bio { font-size:12px; color: var(--ink-soft); margin: 6px 0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:33px; }
.teacher-card-stats { display:flex; flex-direction:column; gap:3px; margin-top:auto; padding-top:8px; font-size:12px; color: var(--ink-soft); }
.teacher-card-stats span { display:flex; align-items:center; gap:5px; }

.avatar-img { border-radius:50%; object-fit:cover; }
.avatar-fallback { border-radius:50%; background: var(--accent-soft); color: var(--accent); display:flex; align-items:center; justify-content:center; font-weight:700; }

.admin-schedule-table { display:flex; flex-direction:column; gap:2px; }
.admin-schedule-row { display:grid; grid-template-columns: 1.3fr 1.3fr 0.8fr 1fr 0.8fr; gap:8px; padding:8px 10px; font-size:12.5px; background: var(--card); border-radius:8px; align-items:center; }
.admin-schedule-row.roster-row { grid-template-columns: 1.2fr 1.1fr 0.7fr 1.3fr 0.9fr 0.6fr 0.6fr; }
.compact-package-select { max-width: 130px; font-size: 11.5px; }
.admin-schedule-row.head { background:transparent; font-size:11px; text-transform:uppercase; color: var(--ink-soft); font-weight:600; letter-spacing:.03em; }

.teacher-layout { display:grid; grid-template-columns: 240px 1fr; gap: 16px; align-items:start; }
.col-students { background: var(--card); border:1px solid var(--border); border-radius:14px; padding:14px; }
.col-main { min-width:0; }
.col-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.student-list { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.student-item { position:relative; display:flex; align-items:center; gap:4px; text-align:left; background: var(--paper); border:1px solid transparent; border-radius:10px; padding:4px 4px 4px 10px; transition: transform .12s ease; }
.student-item:hover { transform: translateY(-1px); }
.student-item.active { border-color: var(--accent); background: var(--accent-soft); }
.student-item-clickable { flex: 1; min-width: 0; cursor: pointer; padding: 4px 0; }
.student-delete-btn { width:24px; height:24px; flex-shrink:0; opacity:.7; }
.student-delete-btn:hover { opacity:1; }
.student-item-top { display:flex; justify-content:space-between; align-items:center; font-weight:600; font-size:13.5px; }
.student-item-meta { display:flex; gap:6px; align-items:center; margin-top:4px; flex-wrap:wrap; }

@media (max-width: 900px) {
  .teacher-layout { grid-template-columns: 1fr; }
}

/* ---- v3 additions: stats, sales, availability, attachments, lesson notes ---- */

.school-stats { display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
.school-stat { background: var(--card); border:1px solid var(--border); border-top:4px solid var(--accent); border-radius:14px; padding:12px 18px; min-width:150px; }
.school-stat-value { font-family: var(--font-display); font-size:24px; font-weight:700; color: var(--accent); }
.school-stat-label { font-size:11.5px; color: var(--ink-soft); margin-top:2px; }

.sales-stats { display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
.finance-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:8px; }
.payout-rates-block { margin-top:12px; padding-top:10px; border-top: 1px dashed var(--border); }
.payout-rates-table { display:flex; flex-direction:column; gap:5px; }
.payout-rate-row { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12.5px; background: var(--paper); padding:5px 9px; border-radius:8px; }
.finance-cell { background: var(--paper); border-radius:10px; padding:10px 12px; }
.finance-value { font-family: var(--font-display); font-weight:700; font-size:16px; margin-top:2px; }
.finance-profit { background: var(--accent-soft); }
.finance-profit .finance-value { color: var(--accent); }
.finance-margin { background: var(--gold-soft); }
.finance-margin .finance-value { color: var(--gold); }
.products-dropdown-toggle { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; width:100%; text-align:left; padding:4px 0; }
.products-dropdown-list { margin-top:8px; }
.add-product-row { display:flex; align-items:center; gap:6px; justify-content:center; cursor:pointer; color: var(--accent); font-weight:600; border:1.5px dashed var(--border); background:transparent; }
.add-product-row:hover { border-color: var(--accent); }
.sales-stat { background: var(--paper); border-radius:12px; padding:10px 16px; min-width:130px; }
.sales-stat-label { font-size:11px; color: var(--ink-soft); text-transform:uppercase; letter-spacing:.03em; }
.sales-stat-value { font-family: var(--font-display); font-size:20px; font-weight:700; margin-top:2px; }
.sales-chart { display:flex; align-items:flex-end; gap:6px; height:110px; padding:8px 4px; margin-bottom:14px; border-bottom:1px solid var(--border); }
.sales-bar-col { display:flex; flex-direction:column; align-items:center; justify-content:flex-end; flex:1; height:100%; }
.sales-bar { width:100%; max-width:22px; background: var(--accent); border-radius:4px 4px 0 0; }
.sales-bar-label { font-size:9.5px; color: var(--ink-soft); margin-top:4px; }
.sales-log { display:flex; flex-direction:column; gap:4px; margin-top:10px; }
.sales-log-row { display:flex; align-items:center; gap:10px; font-size:12.5px; background: var(--paper); padding:6px 10px; border-radius:8px; }
.sales-log-row span:first-child { flex:1; }

.availability-toggle.is-open { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
.availability-toggle.is-closed { background: var(--danger-soft); color: var(--danger); border-color: var(--danger); }

.teacher-profile-header { margin-bottom: 14px; }
.teacher-mini-card { display:flex; gap:10px; align-items:flex-start; background: var(--paper); border-radius:12px; padding:10px; margin-top:6px; }

.attachment-chip { display:inline-flex; align-items:center; gap:6px; margin-top:6px; }
.attachment-thumb { max-width:160px; max-height:120px; border-radius:8px; object-fit:cover; display:block; }
.attachment-file { display:inline-flex; align-items:center; gap:5px; font-size:12px; background: var(--paper); padding:4px 9px; border-radius:8px; color: var(--accent); text-decoration:none; }
.material-link { font-size:11.5px; color: var(--accent); margin-left:4px; }

.lesson-notes { margin-top:8px; padding-top:8px; border-top: 1px dashed var(--border); }
.lesson-notes-body { margin-top:8px; }

/* ---- v4 additions: chat, banner, checkpoints, package, lesson plan, payment, shop ---- */

.chat-row { display:flex; align-items:flex-end; gap:8px; width:100%; }
.chat-row.mine { flex-direction:row-reverse; }
.chat-row.last { margin-bottom:6px; }
.chat-ava { width:34px; min-width:34px; display:flex; }
.chat-ava.tone-teacher .avatar-fallback { background: var(--accent); color:#fff; }
.chat-ava.tone-student .avatar-fallback { background:#F3D27A; color:#1E2B2F; }
.chat-ava.tone-admin .avatar-fallback { background:#1E2B2F; color:#fff; }
.chat-bubble-wrap { display:flex; flex-direction:column; max-width:min(75%, 560px); }
.chat-row.mine .chat-bubble-wrap { align-items:flex-end; }
.chat-row.theirs .chat-bubble-wrap { align-items:flex-start; }
.chat-row.mine .chat-bubble-wrap { align-items:flex-end; }
.chat-row.theirs .chat-bubble-wrap { align-items:flex-start; }
.chat-reactions { display:flex; gap:3px; margin-top:2px; }
.chat-reactions-summary { font-size:12px; margin-top:2px; }
.reaction-btn { font-size:15px; background: var(--card); border:1px solid var(--border); border-radius:999px; padding:2px 7px; cursor:pointer; }
.reaction-btn.active { background: var(--accent-soft); border-color: var(--accent); }

.student-banner { display:flex; align-items:center; gap:10px; border-radius:12px; padding:10px 14px; margin-bottom:12px; }
.student-banner-emoji { font-size:26px; }
.student-banner-stickers { display:flex; gap:6px; flex-wrap:wrap; }
.student-sticker { font-size:18px; }
.color-swatch { width:26px; height:26px; border-radius:8px; border:2px solid var(--border); cursor:pointer; }
.color-picker-native { width:26px; height:26px; padding:0; border:2px solid var(--border); border-radius:8px; cursor:pointer; background:none; }
.color-swatch.selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.sticker-choice { font-size:16px; background: var(--card); border:1px solid var(--border); border-radius:8px; padding:3px 6px; cursor:pointer; }
.sticker-choice.active { background: var(--accent-soft); border-color: var(--accent); }

.checkpoint-list { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
.checkpoint-item { background: var(--paper); border-radius:10px; padding:8px 10px; }
.checkpoint-score { font-weight:700; color: var(--accent); }

.package-tracker { }
.package-widget { display:inline-block; width:100%; }
.package-badge { display:inline-flex; align-items:center; gap:6px; background: var(--paper); border:1px solid var(--border); border-radius:999px; padding:4px 10px; font-size:12px; font-weight:600; cursor:pointer; max-width:100%; }
.package-badge:hover:not(:disabled) { border-color: var(--accent); }
.package-badge:disabled { cursor:default; opacity:.85; }
.package-badge-remaining { font-weight:700; color: var(--accent); }
.package-chevron { display:inline-block; transition: transform .15s ease; color: var(--ink-soft); }
.package-chevron.open { transform: rotate(90deg); }
.package-mini-progress { height:5px; margin-top:4px; margin-bottom:0; }
.package-expand-panel { margin-top:8px; background: var(--paper); border-radius:10px; padding:8px 10px; }
.package-quick-picks { display:flex; flex-wrap:wrap; gap:6px; }

.lesson-plan-timeline { display:flex; flex-direction:column; gap:10px; margin-top:8px; position:relative; padding-left:4px; }
.lesson-plan-row { display:flex; gap:10px; }
.lesson-plan-dot { width:10px; height:10px; border-radius:50%; background: var(--border); margin-top:6px; flex-shrink:0; }
.lesson-plan-row.done .lesson-plan-dot { background: var(--accent); }
.lesson-plan-row.upcoming .lesson-plan-dot { background: var(--gold); }
.lesson-plan-body { flex:1; background: var(--paper); border-radius:10px; padding:8px 10px; }

.meeting-link-row { margin-top:6px; }
.pay-slot-row { margin-top:6px; }
.goal-type-switch { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:4px; }
.exam-goal-box { background: var(--paper); border-radius:10px; padding:10px; margin-top:6px; }
.exam-subblock { margin-top:12px; padding-top:10px; border-top: 1px dashed var(--border); }
.progress-breakdown { margin-top:10px; display:flex; flex-direction:column; gap:5px; }
.mini-bar-row { display:flex; align-items:center; gap:8px; font-size:11.5px; }
.mini-bar-label { width:90px; flex-shrink:0; color: var(--ink-soft); }
.mini-bar-track { flex:1; height:6px; background: var(--border); border-radius:999px; overflow:hidden; }
.mini-bar-fill { height:100%; background: var(--accent); border-radius:999px; }
.mini-bar-value { width:34px; text-align:right; color: var(--ink-soft); }
.locked-link { font-style: italic; }
.pill-clickable { border:none; cursor:pointer; font-family: var(--font-ui); }

.month-switch { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }

.donut-row { display:flex; gap:20px; align-items:center; flex-wrap:wrap; margin-bottom:16px; }
.donut-chart { width:150px; height:150px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.donut-hole { width:100px; height:100px; border-radius:50%; background: var(--card); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.donut-hole-value { font-family: var(--font-display); font-weight:700; font-size:14px; }
.donut-hole-label { font-size:10px; color: var(--ink-soft); }
.donut-legend { display:flex; flex-direction:column; gap:6px; flex:1; min-width:200px; }
.donut-legend-row { display:flex; align-items:center; gap:8px; font-size:12.5px; }
.donut-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.donut-legend-name { flex:1; }
.donut-legend-value { font-weight:600; white-space:nowrap; }

@media (max-width: 700px) { .header-titles { display:none; } .role-switch { margin-left:0; order:5; width:100%; justify-content:center; } .admin-schedule-row, .admin-schedule-row.roster-row { grid-template-columns: 1fr 1fr; } }
`;