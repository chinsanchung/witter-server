// 출처: https://stackoverflow.com/a/51812642
const getCookies = (value: string | undefined) => {
  const result = {};

  if (!value) {
    return result;
  }

  value.split(';').forEach((cookie) => {
    const parts = cookie.match(/(.*?)=(.*)$/);
    result[parts[1].trim()] = (parts[2] || '').trim();
  });
  return result;
};

export default getCookies;
