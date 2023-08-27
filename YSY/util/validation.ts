export const isVaildEmail = (email: string) => {
  let pattern =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
  return pattern.test(email);
};

export const isVaildPhone = (phone: string) => {
  const pattern = /^010\d{8}$/;
  return pattern.test(phone);
};
