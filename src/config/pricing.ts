export const EUR_PER_CREDIT = 1;
export const CREDITS_PER_EUR = 1;

export type CreditPack = {
  id: string;
  credits: number;
  price: number;
  amountCents: number;
  popular?: boolean;
};

export const creditPacks: CreditPack[] = [
  {
    id: 'pack10',
    credits: 10,
    price: 10,
    amountCents: 1000
  },
  {
    id: 'pack25',
    credits: 25,
    price: 25,
    amountCents: 2500,
    popular: true
  },
  {
    id: 'pack50',
    credits: 50,
    price: 50,
    amountCents: 5000
  },
  {
    id: 'pack100',
    credits: 100,
    price: 100,
    amountCents: 10000
  },
];

export function getPackById(packId: string): CreditPack | undefined {
  return creditPacks.find(pack => pack.id === packId);
}

export function calculatePrice(credits: number): number {
  return credits * EUR_PER_CREDIT;
}

export function calculateCredits(euros: number): number {
  return euros * CREDITS_PER_EUR;
}
