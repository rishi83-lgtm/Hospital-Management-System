import { apiRequest } from './api.js';

export async function getAppointments(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const result = await apiRequest(`/appointments${query ? `?${query}` : ''}`);
  return result.appointments;
}

export async function bookAppointment(appointment) {
  const result = await apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment),
  });
  return result.appointment;
}

export async function updateAppointmentStatus(id, status) {
  const result = await apiRequest(`/appointments/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return result.appointment;
}