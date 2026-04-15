import { gql } from "apollo-server-express";
import authSchema from "./auth.schema.js";
import reviewSchema from "./review.schema.js";
import tourSchema from "./tour.schema.js";
import bookingSchema from "./booking.schema.js";

export default gql`
    ${authSchema}
    ${reviewSchema}
    ${tourSchema}
    ${bookingSchema}

    type User {
        id: ID!
        name: String!
        email: String!
        role: Role!
        isVerified: Boolean!
    }

    type Query {
        me: User
    }
`;