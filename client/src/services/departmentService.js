import { apiRequest } from './api.js';

export async function getDepartments() {
  const result = await apiRequest('/departments');
  return result.departments;
}

export async function createDepartment(department) {
  const result = await apiRequest('/departments', {
    method: 'POST',
    body: JSON.stringify(department),
  });
  return result.department;
}
