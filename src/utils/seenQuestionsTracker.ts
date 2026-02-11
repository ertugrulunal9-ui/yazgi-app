import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_QUESTIONS_KEY = '@yazgi_seen_questions';

export type ExamType = 'math' | 'turkish' | 'science' | 'history' | 'geography' | 'english' | 'art' | 'music';

interface SeenQuestionsData {
  [examType: string]: string[]; // Array of question IDs
}

class SeenQuestionsTracker {
  private static instance: SeenQuestionsTracker;
  private seenQuestions: SeenQuestionsData = {};
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): SeenQuestionsTracker {
    if (!SeenQuestionsTracker.instance) {
      SeenQuestionsTracker.instance = new SeenQuestionsTracker();
    }
    return SeenQuestionsTracker.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(SEEN_QUESTIONS_KEY);
      if (stored) {
        this.seenQuestions = JSON.parse(stored);
      }
      this.initialized = true;
    } catch (error) {
      console.error('SeenQuestionsTracker initialization failed:', error);
      this.seenQuestions = {};
      this.initialized = true;
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(this.seenQuestions));
    } catch (error) {
      console.error('SeenQuestionsTracker save failed:', error);
    }
  }

  /**
   * Bir soruyu görüldü olarak işaretle
   */
  async markQuestionAsSeen(examType: ExamType, questionId: string): Promise<void> {
    await this.initialize();

    if (!this.seenQuestions[examType]) {
      this.seenQuestions[examType] = [];
    }

    if (!this.seenQuestions[examType].includes(questionId)) {
      this.seenQuestions[examType].push(questionId);
      await this.save();
    }
  }

  /**
   * Birden fazla soruyu görüldü olarak işaretle
   */
  async markQuestionsAsSeen(examType: ExamType, questionIds: string[]): Promise<void> {
    await this.initialize();

    if (!this.seenQuestions[examType]) {
      this.seenQuestions[examType] = [];
    }

    let changed = false;
    for (const id of questionIds) {
      if (!this.seenQuestions[examType].includes(id)) {
        this.seenQuestions[examType].push(id);
        changed = true;
      }
    }

    if (changed) {
      await this.save();
    }
  }

  /**
   * Bir sorunun daha önce görülüp görülmediğini kontrol et
   */
  async isQuestionSeen(examType: ExamType, questionId: string): Promise<boolean> {
    await this.initialize();
    return this.seenQuestions[examType]?.includes(questionId) ?? false;
  }

  /**
   * Görülmemiş soruları filtrele
   * @param examType Sınav tipi
   * @param questions Soru listesi (her soruda 'id' field olmalı)
   * @returns Görülmemiş sorular
   */
  async filterUnseenQuestions<T extends { id: string }>(
    examType: ExamType,
    questions: T[]
  ): Promise<T[]> {
    await this.initialize();

    const seenIds = this.seenQuestions[examType] || [];
    return questions.filter(q => !seenIds.includes(q.id));
  }

  /**
   * Sınavda kullanılacak soruları seç
   * Önce görülmemiş sorulardan seç, yetmezse görülmüş sorulardan tamamla
   * @param examType Sınav tipi
   * @param questions Tüm soru havuzu
   * @param count İstenen soru sayısı
   * @returns Seçilen sorular (karıştırılmış)
   */
  async selectQuestionsForExam<T extends { id: string }>(
    examType: ExamType,
    questions: T[],
    count: number
  ): Promise<T[]> {
    await this.initialize();

    const seenIds = this.seenQuestions[examType] || [];
    const unseenQuestions = questions.filter(q => !seenIds.includes(q.id));
    const seenQuestionsList = questions.filter(q => seenIds.includes(q.id));

    // Soruları karıştır
    const shuffledUnseen = [...unseenQuestions].sort(() => Math.random() - 0.5);
    const shuffledSeen = [...seenQuestionsList].sort(() => Math.random() - 0.5);

    let selected: T[] = [];

    // Önce görülmemiş sorulardan al
    if (shuffledUnseen.length >= count) {
      selected = shuffledUnseen.slice(0, count);
    } else {
      // Görülmemiş sorular yetmezse, hepsini al ve görülmüşlerden tamamla
      selected = [...shuffledUnseen];
      const remaining = count - selected.length;
      if (remaining > 0 && shuffledSeen.length > 0) {
        selected.push(...shuffledSeen.slice(0, remaining));
      }
    }

    // Son bir kez karıştır
    return selected.sort(() => Math.random() - 0.5);
  }

  /**
   * Belirli bir sınav türü için görülen soru sayısını al
   */
  async getSeenCount(examType: ExamType): Promise<number> {
    await this.initialize();
    return this.seenQuestions[examType]?.length ?? 0;
  }

  /**
   * Belirli bir sınav türü için görülen soruları sıfırla
   */
  async resetExamType(examType: ExamType): Promise<void> {
    await this.initialize();
    this.seenQuestions[examType] = [];
    await this.save();
  }

  /**
   * Tüm görülen soruları sıfırla
   */
  async resetAll(): Promise<void> {
    this.seenQuestions = {};
    await this.save();
  }

  /**
   * Debug: Tüm görülen soru verilerini al
   */
  async getDebugData(): Promise<SeenQuestionsData> {
    await this.initialize();
    return { ...this.seenQuestions };
  }
}

export default SeenQuestionsTracker.getInstance();
