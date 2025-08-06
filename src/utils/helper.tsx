export const formatSecondsToTime = (millionseconds: number): string => {
  const seconds = Math.floor(millionseconds / 1000);
  if (seconds < 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const initialAIContent = {
  chief_complaint: '',
  present_history: '',
  past_history: '',
  allergy_history: '',
  personal_history: '',
  family_history: '',
  childbearing_history: '',
  marriage_history: '',
  menstrual_history: '',
  physique: '',
  diagnosis: '',
  plan: '',
  examination_advice: '',
  advice: '',
  medication_treatment_advice: '',
  diet_exercise_advice: '',
};

export const parseAIInsightContent = (
  content: string | null,
): Record<string, string> => {
  try {
    const parsedContent = JSON.parse(content || '{}');
    if (typeof parsedContent !== 'object' || parsedContent === null) {
      console.error('解析内容不是有效的对象');
      return { ...initialAIContent };
    } else {
      return { ...parsedContent };
    }
  } catch (e) {
    console.error('解析 AI 内容失败:', e);
    return { ...initialAIContent };
  }
};
