import { getUserByEmailAndPassword } from '@/calls/user';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as v from 'valibot';

// Create a schema for validating user inputs
const SignInSchema = v.object({
  email: v.pipe(v.string('Email is required'), v.email()),
  password: v.pipe(v.string(), v.minLength(8, 'Password should more than 8 characters'), v.maxLength(32, 'Password should be less than 32 characters')),
});

// Configure NextAuth
export const { handlers, auth, signIn } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = v.parse(SignInSchema, credentials);

          // logic to verify if user exists
          const user = await getUserByEmailAndPassword(email, password);

          if (!user) throw new Error('User not found.');

          // return user object with their profile data
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            image: `https://placehold.co/100?text=${user.name[0].toUpperCase()}`,
          };
        } catch (err) {
          if (v.isValiError(err)) {
            // Return null to indicate that the credentials are invalid
            return null;
          }
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    session({ session, user, token }) {
      session.user.id = token.userId as string;
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }

      return token;
    }
  },
});