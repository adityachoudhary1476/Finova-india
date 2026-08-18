export type IconName =
  | 'arrow-up-right'
  | 'book-open'
  | 'briefcase'
  | 'calculator'
  | 'chart'
  | 'check'
  | 'clock'
  | 'compass'
  | 'equal'
  | 'file-text'
  | 'grid'
  | 'landmark'
  | 'lock'
  | 'mail'
  | 'menu'
  | 'percent'
  | 'piggy-bank'
  | 'receipt'
  | 'rupee'
  | 'search'
  | 'shield'
  | 'spark'
  | 'target'
  | 'trending-up'
  | 'wallet';

export type CalculatorStatus = 'popular' | 'catalogue';
export type CalculatorAvailability = 'live' | 'planned';

export interface CalculatorItem {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  icon: IconName;
  aliases: readonly string[];
  status: CalculatorStatus;
  availability: CalculatorAvailability;
  route: string;
  seoTitle: string;
  seoDescription: string;
  relatedCalculatorIds: readonly string[];
}

export interface CalculatorCategory {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  calculatorIds: readonly string[];
}

export interface GuideSection {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

export interface GuideFaqItem {
  question: string;
  answer: string;
}

export interface GuideDefinition {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  updatedDate: string;
  relatedCalculatorIds: readonly string[];
  sections: readonly GuideSection[];
  faqs: readonly GuideFaqItem[];
}
