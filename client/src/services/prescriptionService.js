import { apiRequest } from './api.js';

export async function getPrescriptions() {
  const result = await apiRequest('/prescriptions');
  return result.prescriptions;
}

export async function createPrescription(prescription) {
  const result = await apiRequest('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescription),
  });
  return result.prescription;
}
