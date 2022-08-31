import { Box, Button, Grid, Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { EnumProtocolName } from "../../@types/protocol";
import { colors } from "../../common";
import {
	NavBack,
	ProposalCardVaultEmission,
	ProposalCardVaultIncentive,
	ProposalCardVaultReward,
	TimeRemaining,
} from "../../components";
import { useSelector } from "../../redux/store";
import { RootState } from "../../redux/store";
import { GET_PROPOSAL } from "../../gql";
import { useLazyQuery } from "@apollo/client";
import proposal from "../../redux/slices/proposal";
import Action from "../../services";
import { ethers } from "ethers";

type Props = {};

const ProposalSymbolVote = (props: Props) => {
	const walletAddress: any = useSelector(
		(state: RootState) => state.wallet.address
	);
	const [getProposal] = useLazyQuery(GET_PROPOSAL);
	const [voteWeight, setVoteWeight] = useState(0);
	const location = useLocation();
	const { symbol } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const [proposalInfo, setProposalInfo] = useState();

	const isProposer = searchParams.get("proposer") && true;
	const navState = location.state as any;
	let { proposal: currentProposal } = navState;

	useEffect(() => {
		GetInfo();
	}, [])

	const GetInfo = async () => {
		const proposalinfo = await getProposal({
			variables: { id: currentProposal.proposalId }
		})
		setProposalInfo(proposalinfo.data.proposal);
		const req = {
			strategies: proposalinfo.data.proposal.strategies,
			snapshot: proposalinfo.data.proposal.snapshot,
			space: proposalinfo.data.proposal.space.id,
			address: walletAddress
		}
		const result = await Action.GetVoteWeight(req);
		setVoteWeight(result.vp);
	}

	const voteProposal = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		// const flag = await
		const signer = provider.getSigner();
		const msg: any = {
			address: walletAddress,
		}
		// const signMsg = await signer.signMessage(msg);
	}

	return (
		<Box className="main-body flex flex-col grow">
			<Box className="flex flex-col main-content gap-14">
				<Box className="flex justify-between proposer-flex">
					<NavBack />
					{isProposer ? (
						<Box className="flex gap-8">
							<Button className="proposer-button" variant="contained" color="tealLight">
								Copy Link
							</Button>
							<Button className="proposer-button" variant="contained" color="tealLight">
								Add Rewards
							</Button>
							<Button className="top-button" variant="contained" color="tealLight">
								Release Rewards
							</Button>
						</Box>
					) : voteWeight == 0 ? (
						<Button disabled variant="contained" color="secondary">
							Vote
						</Button>
					) : (
						<Button onClick={voteProposal} variant="contained" color="tealLight">
							Vote
						</Button>
					)
					}
				</Box>
			</Box>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Box className="flex flex-col gap-12 mt-12">
						<Box className="flex flex-col">
							<Typography variant="h6">{navState.proposal.name}</Typography>
							<Typography color={colors.textGray}>
								{navState.proposal.description}
							</Typography>
						</Box>
						<Box className="flex flex-col gap-8">
							<ProposalCardVaultIncentive
								proposal={currentProposal}
								isProposer={isProposer}
								voteWeight={voteWeight}
							/>
							<ProposalCardVaultEmission
								proposal={currentProposal}
								isProposer={isProposer}
							/>
							<ProposalCardVaultReward
								proposal={currentProposal}
								isProposer={isProposer}
							/>
						</Box>
					</Box>
				</Grid>
				<Grid item xs={12} md={6} className="flex !flex-col">
					<TimeRemaining time={navState.proposal.endTime}></TimeRemaining>
					<Box className="relative flex flex-auto">
						<Box className="flex flex-col flex-auto gap-2 text-center pt-6 md:text-right md:pt-0 md:absolute md:right-0 md:bottom-0">
							<Link href={"https://snapshot.org/#/" + symbol + ".eth"}>Go to Snapshot</Link>
							<Link href={"/proposal/" + symbol}>
								Go to{" "}
								{`${EnumProtocolName[symbol as keyof typeof EnumProtocolName]}`}
							</Link>
						</Box>
					</Box>
				</Grid>
			</Grid>
			<Box className="mt-16 mb-32"></Box>
		</Box >
	);
};

export default ProposalSymbolVote;
