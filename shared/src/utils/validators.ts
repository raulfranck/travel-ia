export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function isValidDate(date: string | Date): boolean {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function isValidBudget(budget: number): boolean {
  return budget > 0 && budget < 1000000;
}

export function isValidTripDates(startDate: Date, endDate: Date): boolean {
  return startDate < endDate && startDate >= new Date();
}

