import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import { getProfile , createUser} from "./data-service";

const authConfig = {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
        })
    ],
    callbacks: {
        authorized({auth, request}) {
            return !!auth?.user;
        },
        async signIn({user, account, profile}) {
            try {
            console.log(user.email)
            const existingUser = await getProfile(user.email);

            if (!existingUser) await createUser({email: user.email, nomeUsuario: user.name})
                return true
            } catch {
                return false
            }
        },
        async session({session, user}) {
            const perfil = await getProfile(session.user.email);
            session.user.userId = perfil.id;
            return session
        },
    },
    pages: {
        signIn: "/login"
    }
};

export const {
    auth,
    signIn,
    signOut,
    handlers: { GET, POST, UPDATE, DELETE }
} = NextAuth(authConfig)