import { gql } from "@apollo/client";

const GET_PROPOSAL = gql`
    query Proposals($name: String) {
        proposals(
            first: 20
            skip: 0
            where: { space_in: ["balancer", $name], state: "active" }
            orderBy: "created"
            orderDirection: desc
        ) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            space {
                id
                name
            }
        }
    }
`;

const GET_SPACES = gql`
    query Spaces {
        spaces(first: 20, skip: 0, orderBy: "created", orderDirection: desc) {
            id
            name
            about
            network
            symbol
            strategies {
                name
                network
                params
            }
            admins
            members
            filters {
                minScore
                onlyMembers
            }
            plugins
        }
    }
`;

const GET_Follows = gql`
    query Follows($address:String) {
        follows(
            first: 10000,
            where: { follower: $address }
        ) {
            id
            follower
            space {
                id
            }
            created
        }
    }
`;

const GET_VOTE = gql`
    query Votes($proposal:String) {
        votes(
            where: {
                proposal: $proposal
            }
        ) {
            id
            voter
            created
            choice
            space {
                id
            }
        }
    }
`;

export { GET_PROPOSAL, GET_Follows, GET_SPACES, GET_VOTE };
