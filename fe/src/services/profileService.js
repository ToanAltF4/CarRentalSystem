import api from './api';

const profileService = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },

    updateProfile: async (payload) => {
        const response = await api.put('/profile', payload);
        return response.data;
    },

    updateDriverLicense: async (formData) => {
        const response = await api.post('/profile/driver-license', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default profileService;
