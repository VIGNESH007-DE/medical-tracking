export interface Company {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  units: number;
  senderName: string;
  description: string;
  companyId: string;
  companyName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchHistoryItem {
  code: string;
  medicineName: string;
  companyName: string;
  searchedAt: string;
}
