const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const register = async (username, email, password, role = 'user', publicKey = null, encryptedPrivateKey = null) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role, publicKey, encryptedPrivateKey }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const updateProfile = async (username, email, token, publicKey = null, encryptedPrivateKey = null) => {
  const bodyData = { username, email };
  if (publicKey) bodyData.publicKey = publicKey;
  if (encryptedPrivateKey) bodyData.encryptedPrivateKey = encryptedPrivateKey;

  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(bodyData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
};

export const updateUserStatus = async (userId, status, token) => {
  const response = await fetch(`${API_URL}/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update user status');
  return data;
};

export const getUsers = async (token) => {
  const response = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const uploadEncryptedFile = async (formData, token) => {
  const response = await fetch(`${API_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'File upload failed');
  return data;
};

export const getUserFiles = async (token) => {
  const response = await fetch(`${API_URL}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch files');
  return data;
};

export const downloadEncryptedFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'File download failed');
  }
  return await response.arrayBuffer();
};

export const deleteFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'File delete failed');
  return data;
};

export const createShareLink = async (fileId, password, token) => {
  const response = await fetch(`${API_URL}/files/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileId, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create share link');
  return data;
};

export const getSharedFileMeta = async (shareId) => {
  const response = await fetch(`${API_URL}/files/share/${shareId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Share link invalid or expired');
  return data;
};

export const downloadSharedFile = async (shareId, password) => {
  const response = await fetch(`${API_URL}/files/share/${shareId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to download shared file');
  }
  return await response.arrayBuffer();
};

export const getUserStats = async (token) => {
  const response = await fetch(`${API_URL}/users/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch user stats');
  return data;
};

export const getUserLogs = async (token) => {
  const response = await fetch(`${API_URL}/users/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch user logs');
  return data;
};

export const getAdminStats = async (token) => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch admin stats');
  return data;
};

export const getNotifications = async (token) => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications');
  return data;
};

export const markNotificationsRead = async (token) => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
export const deleteAccount = async (token) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete account');
  return data;
};

export const getUserByEmail = async (email, token) => {
  const response = await fetch(`${API_URL}/users/lookup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'User lookup failed');
  return data;
};

export const inviteUserToFile = async (fileId, userId, encryptedKeyForUser, permissions, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId, encryptedKeyForUser, permissions })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to invite user');
  return data;
};

export const revokeUserAccess = async (fileId, userId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to revoke access');
  return data;
};

export const getSharedWithMeFiles = async (token) => {
  const response = await fetch(`${API_URL}/files/shared-with-me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch shared files');
  return data;
};

export const downloadSharedWithMeFile = async (fileId, token) => {
  const response = await fetch(`${API_URL}/files/${fileId}/download-shared`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Shared file download failed');
  }
  return await response.arrayBuffer();
};

export const sendContactMessage = async (name, email, subject, message) => {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send message');
  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send recovery link');
  return data;
};

export const resetPassword = async (token, password) => {
  const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
};

