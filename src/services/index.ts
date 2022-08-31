import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_SERVERENDPOINT;

var baseURL = "https://score.snapshot.org/";

const Proposal_load = async () => {
    try {
        var res = await axios.post("/api/load-proposal");
        return res.data;
    } catch (err: any) {
        return false;
    }
};

const GetVoteWeight = async (req: any) => {
    try {
        var res = await axios.post(baseURL, {
            "jsonrpc": "2.0",
            "method": "get_vp",
            "params": {
                "address": req.address,
                "network": "1",
                "strategies": req.strategies,
                "snapshot": req.snapshot,
                "space": req.space,
                "delegation": false
            },
            "id": null
        });
        return res.data.result;
    } catch (err: any) {
        console.log(err);
    }
}

// Export Functions
const Action = {
    Proposal_load,
    GetVoteWeight
};

export default Action;
