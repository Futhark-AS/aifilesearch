export const getChatPrice = () => {
    const GPT_3_PRICE_1000 = 0.005;
    const GPT_3_TOKEN_PRICE = GPT_3_PRICE_1000 / 1000;
  
    const price = GPT_3_TOKEN_PRICE * 8000; 
    const price_credits = import.meta.env.VITE_DOLLAR_TO_CREDIT * price;
    return price_credits;
  };
  