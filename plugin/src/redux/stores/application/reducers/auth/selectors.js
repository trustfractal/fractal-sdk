import { createSelector } from "reselect";

export const isRegistered = createSelector(
  (state) => state.auth,
  (auth) => auth.registered,
);

export const isLoggedIn = createSelector(
  (state) => state.auth,
  (auth) => auth.loggedIn,
);

export const isSignInLoading = createSelector(
  (state) => state.auth,
  (auth) => auth.signIn.loading,
);

export const getSignInError = createSelector(
  (state) => state.auth,
  (auth) => auth.signIn.error,
);

export const isSignInSuccess = createSelector(
  (state) => state.auth,
  (auth) => auth.signIn.success,
);

export const isSignUpLoading = createSelector(
  (state) => state.auth,
  (auth) => auth.signUp.loading,
);

export const getSignUpError = createSelector(
  (state) => state.auth,
  (auth) => auth.signUp.error,
);

export const isSignUpSuccess = createSelector(
  (state) => state.auth,
  (auth) => auth.signUp.success,
);

export const getHashedPassword = createSelector(
  (state) => state.auth,
  (auth) => auth.hashedPassword,
);
