import { apiRequest } from './api.js';

export async function getStaff() {
  const result = await apiRequest('/auth/staff');
  return result.staff;
}

export async function createReceptionist(staffMember) {
  const result = await apiRequest('/auth/staff', {
    method: 'POST',
    body: JSON.stringify(staffMember),
  });
  return result.staff;
}
