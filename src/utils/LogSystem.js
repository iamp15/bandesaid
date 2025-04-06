export const saveLog = (message, type = "info") => {
  const today = new Date().toISOString().split("T")[0];
  const logs = JSON.parse(localStorage.getItem("logs")) || {};
  if (!logs[today]) logs[today] = [];
  logs[today].push({ timestamp: new Date().toISOString(), message, type });
  localStorage.setItem("logs", JSON.stringify(logs));
};

export const getLogsByDate = (date) => {
  const logs = JSON.parse(localStorage.getItem("logs")) || {};
  return logs[date] || [];
};

export const deleteLogsByDate = (date) => {
  const logs = JSON.parse(localStorage.getItem("logs")) || {};
  delete logs[date];
  localStorage.setItem("logs", JSON.stringify(logs));
};

export const getAllLogDates = () => {
  const logs = JSON.parse(localStorage.getItem("logs")) || {};
  return Object.keys(logs);
};
