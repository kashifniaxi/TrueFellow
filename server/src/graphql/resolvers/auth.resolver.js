import { register, login } from "../../services/auth.service.js";

export default {
    Mutation: {
        register: async (_, { input }) => {
            return register(input);
        },
        login: async (_, { input }) => {
            return login(input);
        },
    },
};
