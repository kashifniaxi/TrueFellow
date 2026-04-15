import {gql} from 'apollo-server-express';

export default gql`
    enum Role {
        TOURIST
        ORGANIZER
        ADMIN
    }
        
    type AuthPayload {
        accessToken: String!
        refreshToken: String!
        user: User!
    }

    input RegisterInput {
        name: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    type Mutation {
        register(input: RegisterInput!): AuthPayload!
        login(input: LoginInput!): AuthPayload!
    }
`;