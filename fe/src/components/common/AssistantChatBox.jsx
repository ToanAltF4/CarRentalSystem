import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import assistantService from '../../services/assistantService';

const NO_DATA_MESSAGE = 'No matching data is currently available in the system.';
const HIDDEN_PREFIXES = ['/admin', '/operator', '/staff', '/driver'];
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const createMessage = (role, content) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
});

const isUrl = (value) => value.startsWith('http://') || value.startsWith('https://');

const renderMessageContent = (content, isUserMessage) => {
    const parts = String(content ?? '').split(URL_REGEX);
    return parts.map((part, index) => {
        if (isUrl(part)) {
            return (
                <a
                    key={`link-${index}`}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={isUserMessage
                        ? 'underline break-all text-white'
                        : 'underline break-all text-blue-600 hover:text-blue-700'}
                >
                    {isUserMessage ? part : 'View details here'}
                </a>
            );
        }
        return <span key={`text-${index}`}>{part}</span>;
    });
};

const AssistantChatBox = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState(() => ([
        createMessage(
            'assistant',
            'Hi, I am your rental AI assistant. You can ask in any language, and I will answer in English based only on system data.'
        ),
    ]));

    const shouldHide = useMemo(
        () => HIDDEN_PREFIXES.some((prefix) => location.pathname.startsWith(prefix)),
        [location.pathname]
    );

    if (shouldHide) {
        return null;
    }

    const appendMessage = (role, content) => {
        setMessages((prev) => [...prev, createMessage(role, content)]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const question = input.trim();
        if (!question || isSending) return;

        appendMessage('user', question);
        setInput('');
        setIsSending(true);

        try {
            const response = await assistantService.chat(question);
            const answer = response?.answer?.trim() || NO_DATA_MESSAGE;
            appendMessage('assistant', answer);
        } catch (error) {
            const backendMessage = error?.response?.data?.message;
            appendMessage(
                'assistant',
                typeof backendMessage === 'string' && backendMessage.trim()
                    ? backendMessage.trim()
                    : NO_DATA_MESSAGE
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <section className="flex h-[min(72vh,550px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    <header className="flex items-center justify-between border-b border-gray-200 bg-[#0f172a] px-4 py-3 text-white">
                        <div>
                            <p className="text-sm font-semibold">Rental Assistant</p>
                            <p className="text-xs text-slate-300">Data-grounded answers in English</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-md p-1 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                            aria-label="Close chat panel"
                        >
                            <X size={18} />
                        </button>
                    </header>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                                        message.role === 'user'
                                            ? 'bg-[#5fcf86] text-white'
                                            : 'border border-gray-200 bg-white text-gray-800'
                                    }`}
                                >
                                    {renderMessageContent(message.content, message.role === 'user')}
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                                    Processing...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Ask about cars, price, or availability..."
                                rows={2}
                                className="max-h-28 min-h-[44px] flex-1 resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#5fcf86] focus:ring-2 focus:ring-[#5fcf86]/20"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={isSending || !input.trim()}
                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5fcf86] text-white transition hover:bg-[#49b673] disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Send message"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5fcf86] text-white shadow-lg transition hover:bg-[#49b673]"
                aria-label={isOpen ? 'Hide chat' : 'Open chat'}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default AssistantChatBox;
