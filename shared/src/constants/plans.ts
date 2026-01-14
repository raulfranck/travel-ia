import { UserPlan } from '../types/user.types';

export const PLAN_LIMITS = {
  [UserPlan.FREE]: {
    tripsPerMonth: 1,
    features: ['Roteiros básicos', 'Suporte por email'],
    price: 0,
  },
  [UserPlan.BASIC]: {
    tripsPerMonth: 10,
    features: ['Roteiros avançados', 'Gestão de gastos', 'Suporte prioritário'],
    price: 1900, // em centavos
  },
  [UserPlan.PRO]: {
    tripsPerMonth: 999,
    features: [
      'Viagens ilimitadas',
      'Roteiros premium',
      'Assistente 24/7',
      'Integrações avançadas',
      'Relatórios detalhados',
    ],
    price: 4900, // em centavos
  },
};

export const PLAN_NAMES = {
  [UserPlan.FREE]: 'Free',
  [UserPlan.BASIC]: 'Basic',
  [UserPlan.PRO]: 'Pro',
};

