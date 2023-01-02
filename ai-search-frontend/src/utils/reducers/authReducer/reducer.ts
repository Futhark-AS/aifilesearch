export const initialState: LoginState = {
  email: "hei",
  name: "",
  uid: "",
  token: "",
  isLoading: false,
  error: "",
  isLoggedIn: false,
};

export interface LoginState {
  email: string;
  name: string;
  uid: string;
  token: string;
  isLoading: boolean;
  error: string;
  isLoggedIn: boolean;
}

export type LoginAction =
  | { type: "error" | "logout" }
  | {
      type: "login";
      payload: {
        email: string;
        name: string;
        token: string;
        uid: string;
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
        uid: action.payload.uid,
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
    case "logout": {
      return {
        ...state,
        isLoggedIn: false,
      };
    }
    default:
      return state;
  }
}
