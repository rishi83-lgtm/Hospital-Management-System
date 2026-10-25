import { apiRequest } from './api.js';

export async function getDoctors(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const result = await apiRequest(`/doctors${query ? `?${query}` : ''}`);
  return result.doctors;
}

export async function createDoctor(doctor) {
  const result = await apiRequest('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctor),
  });
  return result.doctor;
}

export async function updateMyAvailability(workingHours) {
  const result = await apiRequest('/doctors/me/availability', {
    method: 'PATCH',
    body: JSON.stringify({ workingHours }),
  });
  return result.doctor;
}