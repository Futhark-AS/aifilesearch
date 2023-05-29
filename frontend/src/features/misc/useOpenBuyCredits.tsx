import { useAppDispatch } from "@/redux/hooks";
import { closeBuyCredits, openBuyCredits } from "./buyCreditsSlice";

export const useOpenBuyCredits = () => {
  const dispatch = useAppDispatch();
  const open = () => {
    dispatch(openBuyCredits());
  };
  const close = () => {
    dispatch(closeBuyCredits());
  };

  return { open, close };
};
