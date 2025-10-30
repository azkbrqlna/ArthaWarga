import React, { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { MessageCircle, Loader2 } from "lucide-react";

export default function AIChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend() {
        if (!input.trim()) return;
        setLoading(true);
        const userMsg = { role: "user", text: input };
        setMessages((m) => [...m, userMsg]);

        const [bopRes, iuranRes] = await Promise.all([
            fetch("/api/masuk-bop").then((r) => r.json()),
            fetch("/api/masuk-iuran").then((r) => r.json()),
        ]);

        const prompt = `
      Kamu adalah asisten analisis keuangan RT.
      Berikut data pemasukan BOP: ${JSON.stringify(bopRes.data)}
      Berikut data pemasukan IURAN: ${JSON.stringify(iuranRes.data)}
      Jawablah pertanyaan ini secara singkat dan jelas:
      "${input}"
      Jawab hanya berdasarkan data di atas.
    `;

        try {
            const res = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyAALenC0K6vVMt7tmN3x2GQ7qLMlwIoerU",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            const data = await res.json();
            const reply =
                data.candidates?.[0]?.content?.parts?.[0]?.text ||
                data.error?.message ||
                "Gagal memproses.";

            setMessages((m) => [...m, { role: "ai", text: reply }]);
        } catch (err) {
            setMessages((m) => [
                ...m,
                { role: "ai", text: "Terjadi kesalahan." },
            ]);
        } finally {
            setInput("");
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200"
            >
                <MessageCircle className="w-5 h-5" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 animate-fadeIn"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Chatbox */}
            {open && (
                <Card
                    className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-[520px]
  max-h-[85vh] shadow-2xl rounded-2xl z-50 overflow-hidden
  transition-all animate-[slideUp_0.3s_ease-out]"
                >
                    <CardHeader className="border-b px-4 py-2 font-semibold bg-green-50">
                        ArthaWarga AI
                    </CardHeader>

                    <CardContent className="p-4 space-y-2 overflow-y-auto scroll-smooth break-words max-h-[65vh] md:max-h-[400px]">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-lg text-sm opacity-0 animate-fadeIn ${
                                    msg.role === "user"
                                        ? "bg-green-100 ml-auto max-w-[85%]"
                                        : "bg-gray-100 mr-auto max-w-[85%]"
                                }`}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {msg.role === "ai" ? (
                                    <div
                                        className="text-sm text-gray-800 leading-relaxed whitespace-pre-line [&_table]:w-full [&_td]:p-1 [&_td]:align-top [&_b]:text-green-700 [&_table]:border-collapse [&_td]:border [&_td]:border-gray-200"
                                        dangerouslySetInnerHTML={{
                                            __html: marked.parse(msg.text),
                                        }}
                                    />
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="bg-gray-100 p-2 rounded-lg mr-auto flex items-center gap-2 animate-pulse max-w-[85%]">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500">
                                    Sedang berpikir...
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input */}
                    <div className="flex border-t p-2 bg-white rounded-b-2xl">
                        <Input
                            placeholder="Tanya data BOP / Iuran..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={loading}
                            className="text-sm"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="ml-2 px-4"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Kirim"
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease forwards;
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
