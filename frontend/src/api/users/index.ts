import { baseApi } from '@/api'
import { USERS } from '@/api/path'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: USERS.GET,
        method: 'GET',
      }),
      providesTags: ['USERS'],
    }),

    getUserById: builder.query<User, number>({
      query: (id) => ({
        url: USERS.GET_BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'USERS', id }],
    }),

    createUser: builder.mutation<User, CreateUserRequest>({
      query: (data) => ({
        url: USERS.POST,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['USERS'],
    }),

    updateUser: builder.mutation<
      User,
      { id: number; data: UpdateUserRequest }
    >({
      query: ({ id, data }) => ({
        url: USERS.PATCH(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'USERS', id },
        'USERS',
      ],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: USERS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['USERS'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
