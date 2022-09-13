import { Card } from "@mui/material";
import { ProposalCardHeader } from "../cardHeader";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import {
	CardContent,
	Box,
	Divider,
	Button,
	useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Proposal } from "../../../@types/proposal";
import { TextContent, TextHead } from "../../text";
import NumberType from "../../../common/number";
import { useNavigate } from "react-router-dom";
import { Claim } from "../../../blockchain";
import { useEffect, useState } from "react";
import { NotificationManager } from 'react-notifications';

type Props = {
	address: string;
	proposals: Proposal[];
};

const Content = styled(CardContent)(({ theme }) => ({}));

const ProposalCardActive = (props: Props) => {
	const { address, proposals } = props;
	const [myProposals, setMyProposals] = useState<Proposal[]>([]);

	useEffect(() => {
		var data = proposals?.filter(proposal => proposal.myclaim == false);
		setMyProposals(data);
	}, [proposals])
	const navigate = useNavigate();
	const onJoinClick = (proposal: Proposal, idx: number) => {
		const path = proposal.address !== address ? "proposal/" + proposal.type + "/vote" : "proposal/" + proposal.type + "/vote?proposer=1";
		navigate(path, {
			state: {
				proposal,
			},
		});
	};
	const onClaim = async (e: number, currency: string) => {
		var result = await Claim({ id: e, address: currency, walletAddress: address });
		if (result.status) {
			NotificationManager.success(result.message, "Success");
		} else {
			NotificationManager.error(result.message, "Error");
		}
	}
	const theme = useTheme();
	const isAboveMd = useMediaQuery(theme.breakpoints.up("smd"));
	const colHeads = ["Title", "Vote Incentives", "Total Votes", "$/Vote", ""];
	return (
		<Card className="" elevation={0}>
			<ProposalCardHeader title="My active proposals"></ProposalCardHeader>
			<Content className="!p-0">
				<Box
					className={classNames(
						"grid grid-cols-6 gap-8 px-6 mb-8",
						!isAboveMd && "hidden"
					)}
				>
					{colHeads.map((c, idx) => (
						<Box className={idx == 0 ? "table-first" : ""} key={`colHead_${idx}`}>
							<TextHead>{c}</TextHead>
						</Box>
					))}
				</Box>
				<Box className="flex flex-col gap-4">
					{
						myProposals?.map((p, idx) => (
							<Box key={`prop_${idx}`} className="p-6 bg-black rounded-md">
								<Box
									className={classNames(
										"grid gap-8",
										isAboveMd ? "grid-cols-6" : "grid-cols-2"
									)}
								>
									<Box
										className={classNames("flex flex-col table-first", !isAboveMd && "gap-1")}
									>
										<TextHead className={classNames(isAboveMd && "hidden")}>
											{colHeads[0]}
										</TextHead>
										<TextContent>{p.name.length > 20 ? (p.name.slice(0, 20) + "...") : p.name}</TextContent>
									</Box>
									<Box
										className={classNames("flex flex-col", !isAboveMd && "gap-1")}
									>
										<TextHead className={classNames(isAboveMd && "hidden")}>
											{colHeads[1]}
										</TextHead>
										<TextContent>${NumberType(p.usdAmount.toFixed(2))}</TextContent>
									</Box>
									<Box
										className={classNames(
											"flex flex-col",
											!isAboveMd && "gap-1 col-span-3"
										)}
									>
										<TextHead className={classNames(isAboveMd && "hidden")}>
											{colHeads[2]}
										</TextHead>
										<TextContent>{NumberType(p.totalVoteWeight.toString())}</TextContent>
									</Box>
									<Box
										className={classNames("flex flex-col", !isAboveMd && "gap-1")}
									>
										<TextHead className={classNames(isAboveMd && "hidden")}>
											{colHeads[3]}
										</TextHead>
										<TextContent>${p.totalVoteWeight == 0 ? ("0") : (
											NumberType((p.usdAmount / p.totalVoteWeight).toFixed(4))
										)}</TextContent>
									</Box>
									<Box
										className={classNames("flex", isAboveMd && "justify-center")}
									>
										{!p.isClosed ? (
											<Button variant="contained" color="tealLight" onClick={() => onJoinClick(p, idx)}>
												View
											</Button>
										) : !p.myclaim ? (
											<Button variant="contained" color="tealLight" onClick={() => onClaim(p.poolId, p.rewardCurrency)}>
												Claim
											</Button>
										) : <></>}
									</Box>
								</Box>
							</Box>
						))
					}
				</Box>
			</Content>
		</Card>
	);
};

export { ProposalCardActive };
