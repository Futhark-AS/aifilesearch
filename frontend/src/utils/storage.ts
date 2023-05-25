const storagePrefix = "aisearch";

const storage = {
  setAzureToken: (token: string) => {
    window.localStorage.setItem(`${storagePrefix}azureToken`, token);
  },
  getAzureToken: () => {
    return window.localStorage.getItem(`${storagePrefix}azureToken`);
  }
};

export default storage;
