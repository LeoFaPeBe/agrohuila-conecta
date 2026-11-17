export type Role = 'PRODUCER' | 'BUYER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  municipality: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  quantity: number;
  imageUrl: string;
  active: boolean;
  category: Category;
  producer: { id: string; fullName: string; municipality: string };
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string; unit: string; quantity: number };
}

export interface Order {
  id: string;
  number: number;
  status: 'PENDING' | 'CONFIRMED';
  total: number;
  createdAt: string;
  confirmedAt: string | null;
  items: OrderItem[];
  buyer: { id: string; fullName: string; municipality: string };
  producer: { id: string; fullName: string; municipality: string };
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
