import api from './api';

const assistantService = {
    chat: async (question, data = null) => {
        const payload = {
            question,
        };

        if (data !== null && data !== undefined) {
            payload.data = data;
        }

        const response = await api.post('/v1/assistant/chat', payload);
        return response.data;
    },
};

export default assistantService;
