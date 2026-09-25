import { useState } from "react";
import { useSomaStore } from "@/lib/storage";

interface SchoolPageProps {
    onNext: () => void;
}

export default function SchoolPage({ onNext }: SchoolPageProps) {
    const { schoolName, setSchoolName } = useSomaStore();
    const [value, setValue] = useState(schoolName ?? "");

    const handleContinue = () => {
        const trimmedName = value.trim();

        if (!trimmedName) return;

        setSchoolName(trimmedName);
        onNext();
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🏫</div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        What is your school name?
                    </h1>

                    <p className="text-gray-500 mt-3">
                        Enter the name of the school you attend.
                    </p>
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="schoolName"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        School name
                    </label>

                    <input
                        id="schoolName"
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleContinue();
                            }
                        }}
                        placeholder="Enter your school name"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!value.trim()}
                    className="w-full rounded-2xl bg-purple-600 px-5 py-4 text-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}