import { FormEvent, useState } from "react";

interface DeveloperLoginPageProps {
    onLogin: () => void;
}

const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://127.0.0.1:5000";

export default function DeveloperLoginPage({
    onLogin,
}: DeveloperLoginPageProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Invalid developer credentials."
                );
            }

            onLogin();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to connect to the developer account."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl p-7 shadow-2xl">
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-blue-600 mb-2">
                            SOMA HUB
                        </p>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Developer Login
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Access the SOMA HUB student management dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                                autoComplete="username"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Developer username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Developer password"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-slate-900 text-white py-3.5 font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}