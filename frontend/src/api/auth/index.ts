import { baseApi } from "@/api";
import { setAuth, logout as logoutAction } from "@/store/slices/authSlice";
import { AUTH } from "@/api/path";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user with fresh tokens
    me: builder.query<AuthResponse, void>({
      query: () => ({
        url: AUTH.ME,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuth({
              token: data.auth.access_token,
              refreshToken: data.auth.refresh_token,
              user: data.user,
            })
          );
        } catch (err) {
          console.error("Me error:", err);
        }
      },
      providesTags: ["AUTH"],
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: AUTH.LOGIN,
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuth({
              token: data.auth.access_token,
              refreshToken: data.auth.refresh_token,
              user: data.user,
            })
          );
        } catch (err) {
          console.error("Login error:", err);
        }
      },
      invalidatesTags: ["AUTH"],
    }),

    // Logout
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: AUTH.LOGOUT,
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logoutAction());
        } catch (err) {
          // Even if backend call fails, clear local state
          dispatch(logoutAction());
          console.error("Logout error:", err);
        }
      },
      invalidatesTags: ["AUTH"],
    }),

    // Refresh token
    refresh: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: AUTH.REFRESH,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useMeQuery,
  useLazyMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
