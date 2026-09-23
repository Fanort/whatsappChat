const API_URL = 'https://api.green-api.com';

export const sendMessage = async (idInstance, apiTokenInstance, chatId, message) => {
  const url = `${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const receiveNotification = async (idInstance, apiTokenInstance) => {
  const url = `${API_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
};

export const deleteNotification = async (idInstance, apiTokenInstance, receiptId) => {
  const url = `${API_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`;
  await fetch(url, { method: 'DELETE' });
};