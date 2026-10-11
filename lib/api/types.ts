export type LocalizedText = { fa: string; en: string };

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiListEnvelope<T> = ApiEnvelope<T[]> & {
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
};

export type PublicProject = {
  _id?: string;
  title?: Partial<LocalizedText>;
  description?: Partial<LocalizedText>;
  shortDescription?: Partial<LocalizedText>;
  images?: Array<{ url: string; alt?: Partial<LocalizedText> }>;
  technologies?: string[];
  liveUrl?: string;
  repositoryUrl?: string;
};
