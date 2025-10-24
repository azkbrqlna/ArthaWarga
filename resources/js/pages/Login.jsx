import { useState } from "react";
import { router } from "@inertiajs/react";

export default function Login() {
    const [values, setValues] = useState({ email: "", password: "" });

    function handleChange(e) {
        setValues({ ...values, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        router.post("/login", values);
    }

    return (
        <div className="max-w-md mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full border p-2 mb-2"
                />
                <input
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full border p-2 mb-2"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
