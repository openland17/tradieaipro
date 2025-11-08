/**
 * Format number as Australian currency (no cents)
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Check if job description mentions green waste
 */
export function hasGreenWaste(jobDescription: string): boolean {
  const lower = jobDescription.toLowerCase();
  const keywords = ["lawn", "hedge", "tree", "garden", "waste", "green waste"];
  return keywords.some(keyword => lower.includes(keyword));
}

/**
 * Get property type label
 */
export function getPropertyTypeLabel(propertyType: string): string {
  const labels: Record<string, string> = {
    'residential-house': 'Residential - House',
    'residential-unit': 'Residential - Unit/Apartment',
    'commercial': 'Commercial',
    'industrial': 'Industrial',
    'other': 'Other'
  };
  return labels[propertyType] || propertyType;
}

/**
 * Get urgency/timeline label
 */
export function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    'asap': 'ASAP / Emergency',
    'this-week': 'This Week',
    'next-week': 'Next Week',
    'this-month': 'This Month',
    'flexible': 'Flexible / No Rush'
  };
  return labels[urgency] || urgency;
}

