export type EmailCategory = {
  name: string;
  description: string;
  emailIds: string[];
};

export type EmailAnalysisResult = {
  categories: EmailCategory[];
};