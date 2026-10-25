import { apiRequest } from './api.js';

export async function getMyPatientRecord() {
  const result = await apiRequest('/patients/me');
  return result.patient;
}

export async function getPatients() {
  const result = await apiRequest('/patients');
  return result.patients;
}

export async function createPatient(patient) {
  const result = await apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  });
  return result.patient;
}