import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { showError } from "@/utils/showError";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../api";
import { logout, selectUser, setLoading, setUser } from "../authSlice";
import { User } from "../types";

// Define a custom hook that will select a user from the store
// Should be able to decide if you want to refetch
export const useAuth = ({ refetch } = { refetch: false }) => {
  const user = useAppSelector((state) => selectUser(state));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      if (refetch) {
        let response: User | null = null;

        try {
          dispatch(setLoading(true));
          response = await getUser();
          dispatch(setLoading(false));
        } catch (error: unknown) {
          dispatch(logout());
          showError(
            "There was an error in the system. Please try again later."
          );
          navigate("/auth");
          return;
        }

        dispatch(
          setUser({
            email: response.email,
            name: response.name,
            id: response.id,
            credits: response.credits,
            isLoggedIn: true,
            projects: response.projects,
          })
        );
      }
    })();
  }, [dispatch, navigate, refetch]);

  return user;
};

export const useIsAuthenticated = () => {
  const user = useAuth({ refetch: false });
  return user.user.isLoggedIn;
};
