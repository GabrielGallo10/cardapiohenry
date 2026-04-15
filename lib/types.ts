export type UserRole = "admin" | "client";

export type SavedAddress = {
  id: string;
  /** Ex.: Casa, Trabalho */
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
};

export type UserRecord = {
  id: string;
  name: string;
  /** Apenas dígitos (DDI + número). */
  phone: string;
  password: string;
  role: UserRole;
  /** Endereços salvos (clientes). */
  addresses?: SavedAddress[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  /** Data URL ou URL externa da foto do produto (opcional). */
  imageUrl?: string;
};

export type CartLine = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderItem = CartLine;

export type OrderStatus = "novo" | "em_preparo" | "pronto" | "concluido";

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  /** Texto completo do endereço de entrega (pedidos antigos podem não ter). */
  deliveryAddress?: string;
  notes: string;
  items: OrderItem[];
  status: OrderStatus;
  /** Total final do pedido vindo da API (inclui taxas quando aplicável). */
  totalAmount?: number;
  /** Forma de pagamento escolhida no carrinho (pedidos antigos podem não ter). */
  paymentMethod?: string;
};

/** Lançamento manual em Finanças (recebimento ou despesa). */
export type ManualFinanceKind = "entrada" | "saida";

export type ManualFinanceEntry = {
  id: string;
  createdAt: string;
  /** Data de competência do lançamento. */
  occurredAt: string;
  kind: ManualFinanceKind;
  description: string;
  /** Sempre positivo; o tipo indica se entra ou sai do caixa. */
  amount: number;
};
