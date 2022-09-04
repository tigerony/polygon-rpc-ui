import axios from "axios";
import { ethers } from "ethers";
import { ERCContract, poolContract } from "../contracts";
import Addresses from "../contracts/contracts/addresses.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const createProposal = async (props: any) => {
    try {
        const { address, walletAddress, value } = props;
        const newProposal = {
            proposalId: value.proposalId,
            name: value.proposalName,
            description: value.proposalDescription,
            platformType: value.platformType,
            outcome: value.desiredVote,
            rewardCurrency: value.rewardCurrency,
            rewardAmount: ethers.utils.parseUnits(value.payout),
            creator: value.userAddress,
            isClosed: false
        }
        const Reward = ERCContract(address);
        const result = await Reward.balanceOf(walletAddress);
        const tokenAmount = ethers.utils.formatUnits(result);
        if (Number(tokenAmount) < Number(value.payout)) {
            return ({ status: false, message: "Your reward balance is not enough!" });
        } else {
            const Pool = poolContract.connect(signer);
            const ERCContract = Reward.connect(signer);
            var tx = await ERCContract.approve(Addresses.Pool, ethers.utils.parseUnits(value.payout));
            await tx.wait();
            const connectContract = await Pool.createPool(newProposal);
            const myresult = await connectContract.wait();
            return ({ status: true, message: "Successfully created!" });
        }
    } catch (err: any) {
        console.log(err.message)
        return ({ status: false, message: "Something Wrong! Please try again!" });
    }
}

const addRewards = async (props: any) => {
    try {
        const { id, amount, rewardtype, walletAddress } = props;
        const Reward = ERCContract(rewardtype);
        const myBalance = await Reward.balanceOf(walletAddress);
        const tokenAmount = ethers.utils.formatUnits(myBalance);
        if (Number(tokenAmount) < amount) {
            return ({ status: false, message: "Your reward balance is not enough!" });
        }
        else {
            const Pool = poolContract.connect(signer);
            const erc = Reward.connect(signer);
            var tx = await erc.approve(Addresses.Pool, ethers.utils.parseUnits(amount.toString()));
            await tx.wait();
            const connectContract = await Pool.addReward(id, ethers.utils.parseUnits(amount.toString()));
            await connectContract.wait();
            return ({ status: true, message: "Successfully created!" });
        }
    } catch {
        return ({ status: false, message: "Something went wrong! Please check again!" });
    }
}

const Claim = async (props: any) => {
    try {
        const { id, address } = props;
        const Pool = poolContract.connect(signer);
        const connectContract = await Pool.claim(id);
        await connectContract.wait();
        var result = await axios.post("/api/claim", { id: id, address: address });
        if (result.data.status)
            return ({ status: true, message: "Successfully Claimed!" });
        else {
            return ({ status: false, message: result.data.message });
        }
    } catch (error: any) {
        console.log(error.message);
        return ({ status: false, message: "Something went wrong! Please check again!" });
    }
}

export { createProposal, addRewards, Claim };