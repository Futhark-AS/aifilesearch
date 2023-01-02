export const initialState: LoginState = {
  email: "",
  name: "",
  token: "",
  isLoading: false,
  error: "",
  isLoggedIn: false,
};

export interface LoginState {
  email: string;
  name: string;
  token: string;
  isLoading: boolean;
  error: string;
  isLoggedIn: boolean;
}

export type LoginAction =
  | { type: "error" | "logOut" }
  | {
      type: "login";
      payload: {
        email: string;
        name: string;
        token: string;
      };
    };

export function authReducer(
  state: LoginState,
  action: LoginAction
): LoginState {
  switch (action.type) {
    case "login": {
      return {
        error: "",
        email: action.payload.email,
        name: action.payload.name,
        token: action.payload.token,
        isLoggedIn: true,
        isLoading: false,
      };
    }
    case "error": {
      return {
        ...state,
        error: "There was an error logging in",
        isLoggedIn: false,
        isLoading: false,
      };
    }
    case "logOut": {
      return {
        ...state,
        isLoggedIn: false,
      };
    }
    default:
      return state;
  }
}
