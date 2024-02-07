// pages/signin.tsx

import { signIn, signOut, useSession } from 'next-auth/react';

const SignInComponent: React.FC = () => {
    const { data: session } = useSession();

    return (
        <nav className="absolute right-0 top-0 flex items-center justify-between p-4 border-b border-gray-300">
            {!session ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        signIn('credentials', {
                            username: (e.target as any).username.value,
                            password: (e.target as any).password.value,
                        });
                    }}
                    className="flex items-center space-x-2"
                >
                    <input name="username" type="text" placeholder="Username" className="px-2 py-1 border rounded" />
                    <input name="password" type="password" placeholder="Password" className="px-2 py-1 border rounded" />
                    <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Sign in</button>
                </form>
            ) : (
                <div className="flex items-center space-x-4">
                    <span>{session.user?.name || session.user?.email}</span>
                    <button onClick={() => signOut()} className="px-3 py-1 bg-red-500 text-white rounded">Sign out</button>
                </div>
            )}
        </nav>
    );
};

export default SignInComponent;
