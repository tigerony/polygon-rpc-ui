import { Box, Button, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import classNames from "classnames";
import { useQuery } from "@apollo/client";
import { NotificationManager } from 'react-notifications';
import { ethers } from "ethers";
import {
    FormTextField,
    FormSelect,
    FormSliderInput,
    FormRangeSliderInput,
} from "../../../../components/form";
import { colors } from "../../../../common";
import { useEffect, useState } from "react";
import { GET_PROPOSALS, GET_PROPOSAL } from "../../../../gql";
import tokens from "./token.json";
import { useSelector } from "../../../../redux/store";
import { RootState } from "../../../../redux/store";
import { dispatch } from "../../../../redux/store";
import { useLazyQuery } from "@apollo/client";
import { ERCContract, poolContract } from "../../../../contracts";
import { setClickAddress } from "../../../../redux/slices/clickToken";
import Addresses from "../../../../contracts/contracts/addresses.json";
import loader from "../../../../assets/loader.gif";
import Action from "../../../../services";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const BoxForm = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main,
}));

type Props = {
    name: String;
};

interface SnapShotData {
    value: number;
    display: string;
}

// interface snapInterface extends

const ProposalForm = (props: Props) => {
    const [myloading, setMyLoading] = useState(false);
    const [getProposal] = useLazyQuery(GET_PROPOSAL);
    const [name, setName] = useState("");
    const [time, setTime] = useState("");
    const [address, setAddress] = useState("");
    const [snapshot, setSnapshot] = useState<SnapShotData[]>([]);
    const [voteOption, setVoteOption] = useState<SnapShotData[]>([]);
    const [endTime, setEndTime] = useState(0);
    const [rewardType, setRewardType] = useState("WMATIC");
    const [maxReward, setMaxReward] = useState(0);
    const walletAddress: any = useSelector(
        (state: RootState) => state.wallet.address
    );

    useEffect(() => {
        if (props.name == "qidao") {
            setName("qidao.eth");
            setValue("platformType", "qidao");
        } else if (props.name == "aave") {
            setName("aave.eth");
            setValue("platformType", "aave");
        }
    }, []);

    useEffect(() => {
        if (walletAddress !== "") {
            setValue("userAddress", walletAddress);
        }
    }, [walletAddress]);

    const { data, loading, error } = useQuery(GET_PROPOSALS, {
        variables: { name: name },
        pollInterval: 0,
    });

    const ClickSnap = (e: any) => {
        const temp = [] as SnapShotData[];
        for (var i = 0; i < data?.proposals[e].choices.length; i++) {
            temp.push({
                value: i,
                display: data?.proposals[e].choices[i],
            });
            setVoteOption(temp);
        }
        const date = new Date(data?.proposals[e].end * 1000);
        setValue("endTime", (data?.proposals[e].end * 1000).toString());
        setValue("proposalId", (data?.proposals[e].id));
        timeStyle(date);
    };

    var monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const timeStyle = (date: Date) => {
        const month = date.getMonth();
        const hour = myHour(date);
        const day = date.getDate();
        const year = date.getFullYear();
        const result = monthName[month] + " " + day + ", " + year + ", " + hour;
        setTime(result);
    };

    const myHour = (date: Date) => {
        if (date.getHours() < 12) {
            return date.getHours() + " AM";
        } else {
            return date.getHours() - 12 + " PM";
        }
    };

    useEffect(() => {
        const temp = [] as SnapShotData[];
        data?.proposals?.map((i: any, key: number) => {
            temp.push({
                value: key,
                display: i.title,
            });
        });
        setSnapshot(temp);
    }, [data]);

    const navigate = useNavigate();
    const { prsalType, kpi } = useParams();

    const clickToken = (e: any) => {
        setAddress(e);
        dispatch(setClickAddress(e));
    }

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            platformType: "",
            proposalName: "",
            proposalDescription: "",
            snapshotProposal: "",
            desiredVote: "",
            endTime: "",
            gaugeFixed: "",
            rewardCurrency: "WMATIC",
            minimumBribe: "0",
            loyaltyVote: "",
            votePercent: [{ value: 10 }],
            votePercentNum: [{ value: 10 }],
            range: [{ value: [0, 10] }],
            rangeNum: [{ value: [0, 10] }],
            payout: "0",
            userAddress: "",
            proposalId: "",
        },
    });

    const {
        fields: votePercentFields,
        append: votePercentAppend,
        remove: votePercentRemove,
    } = useFieldArray({ control, name: "votePercent" });

    const { append: votePercentNumAppend, remove: votePercentNumRemove } =
        useFieldArray({ control, name: "votePercentNum" });

    const { append: rangeAppend, remove: rangeRemove } = useFieldArray({
        control,
        name: "range",
    });

    const { append: rangeNumAppend, remove: rangeNumRemove } = useFieldArray({
        control,
        name: "rangeNum",
    });

    // const { append: payoutAppend, remove: payoutRemove } = useFieldArray({
    //     control,
    //     name: "payout",
    // });
    const OnFormSubmit = async (value: any) => {
        const newProposal = {
            proposalId: value.proposalId,
            name: value.proposalName,
            description: value.proposalDescription,
            platformType: value.platformType,
            outcome: value.desiredVote,
            endTime: value.endTime,
            rewardCurrency: value.rewardCurrency,
            rewardAmount: ethers.utils.parseUnits(value.payout),
            creator: value.userAddress,
            isClosed: false,
            paybackAmount: ethers.utils.parseUnits("0")
        }
        if (walletAddress === "") {
            NotificationManager.warning("Please connect wallet...!", "Warning");
        } else if (value.snapshotProposal == "") {
            NotificationManager.warning("Please select proposal on snapshot!", "Warning");
        } else if (value.desiredVote == "") {
            NotificationManager.warning("Please select proposal Option on snapshot!", "Warning");
        } else {
            const Reward = ERCContract(address);
            const result = await Reward.balanceOf(walletAddress);
            const tokenAmount = ethers.utils.formatUnits(result);
            if (Number(tokenAmount) < Number(value.payout)) {
                NotificationManager.error("Your reward balance is not enough!", "Error");
            } else {
                try {
                    setMyLoading(true);
                    const Pool = poolContract.connect(signer);
                    const ERCContract = Reward.connect(signer);
                    var tx = await ERCContract.approve(Addresses.Pool, ethers.utils.parseUnits(value.payout));
                    await tx.wait();
                    const connectContract = await Pool.createPool(newProposal);
                    await connectContract.wait();
                    setMyLoading(false);
                    NotificationManager.success("Successfully created!", "Success");
                    navigate(`/proposal/${props.name}`);
                } catch (error) {
                    setMyLoading(false);
                    console.log(error);
                }
            }
        }
    };

    const isGovernance = prsalType === "governance";
    const isFixed = kpi === "fixed";
    const isVariable = !isGovernance && !isFixed;

    const onAddGaugeVariable = () => {
        votePercentAppend({ value: 0 });
        votePercentNumAppend({ value: 0 });
        rangeAppend({ value: [0, 10] });
        rangeNumAppend({ value: [0, 10] });
        // payoutAppend(0);
    };

    const onDeleteGaugeVariable = (idx?: number | number[]) => {
        votePercentRemove(idx);
        votePercentNumRemove(idx);
        rangeRemove(idx);
        rangeNumRemove(idx);
        // payoutRemove(idx);
    };

    return (
        <Box
            className="flex flex-col gap-8 "
            component="form"
            autoComplete="off"
            onSubmit={handleSubmit(OnFormSubmit)}
        >
            <Box className="grid md:grid-cols-3 gap-8">
                <Box className="flex flex-col md:col-span-2 gap-12">
                    <BoxForm className="flex flex-col p-8 md:p-20 rounded-md  gap-8">
                        <FormTextField
                            label="Proposal Name"
                            name="proposalName"
                            control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: "You must enter proposal name.",
                                },
                            }}
                            placeholder="Enter  proposal name here"
                        />
                        <FormTextField
                            label="Proposal Description"
                            name="proposalDescription"
                            rules={{
                                required: {
                                    value: true,
                                    message:
                                        "You must enter proposal description.",
                                },
                            }}
                            control={control}
                        />
                        <FormSelect
                            label="Snapshot Proposal"
                            placeholder="Choose a snashot proposal"
                            items={snapshot}
                            name="snapshotProposal"
                            setVote={ClickSnap}
                            control={control}
                        />
                        {isGovernance && (
                            <FormSelect
                                label="Desired Vote Outcome"
                                placeholder="Choose desired vote outcome"
                                items={voteOption}
                                name="desiredVote"
                                control={control}
                            />
                        )}
                        <FormTextField
                            label="Proposal End Time"
                            placeholder="Snapshot proposal end time"
                            name="endTime"
                            control={control}
                            time={time}
                            readonly={true}
                        />
                        {!isGovernance && isFixed && (
                            <FormSelect
                                label="Select Gauge"
                                placeholder="Choose gauge"
                                items={voteOption}
                                name="desiredVote"
                                control={control}
                            />
                        )}
                        <FormSelect
                            label="Reward Currency"
                            placeholder="Choose your reward currency"
                            items={tokens}
                            setReward={setRewardType}
                            setClickToken={clickToken}
                            name="rewardCurrency"
                            control={control}
                        />
                        {/* {!isGovernance && (
                            <FormTextField
                                label="Minimum Bribe"
                                name="minimumBribe"
                                textType="number"
                                helpText="Enter minimum bribe value if applicable"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message:
                                            "You must enter minimum proposal.",
                                    },
                                }}
                                placeholder="Enter minimum bribe amount if applicable"
                            />
                        )} */}
                    </BoxForm>
                    <BoxForm className="flex flex-col p-8 md:p-20 rounded-md gap-8">
                        {votePercentFields.map((vp, idx) => (
                            <Box
                                key={vp.id}
                                className={classNames(
                                    "flex flex-col gap-8",
                                    isVariable &&
                                    "bg-[#1f2028] rounded pt-6 pb-12"
                                )}
                            >
                                {isVariable && (
                                    <Box className="flex justify-between px-6">
                                        <Typography
                                            variant="subtitle1"
                                            color={colors.textGray}
                                        >{`Section ${idx + 1}`}</Typography>
                                        {votePercentFields.length > 1 && (
                                            <IconButton
                                                aria-label="delte section"
                                                className="!bg-red-500 text-white"
                                                onClick={() =>
                                                    onDeleteGaugeVariable(idx)
                                                }
                                            >
                                                <DeleteForeverIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}
                                <Box
                                    className={classNames(
                                        "flex flex-col gap-8",
                                        isVariable && "px-12"
                                    )}
                                >
                                    {/* {!isGovernance && (
                                        <FormSliderInput
                                            label="Vote %"
                                            helpText="Select the vote% per which payment would be made, eg: 1%"
                                            name={`votePercent[${idx}].value`}
                                            inputName={`votePercentNum[${idx}].value`}
                                            index={idx}
                                            control={control}
                                            setValue={setValue}
                                            valueLabelFormat={(value: number) =>
                                                `${value}%`
                                            }
                                            isArray
                                        />
                                    )} */}
                                    <FormTextField
                                        label="Max Reward"
                                        name="payout"
                                        control={control}
                                        textType="number"
                                        setrewardAmount={setMaxReward}
                                        index={idx}
                                        placeholder={
                                            isGovernance
                                                ? "Amount that will be paid out if vote concludes with desired outcome"
                                                : "Enter payout in reward currency per vote percent"
                                        }
                                    />
                                    {/* {isGovernance ? (
                                        <Box className="flex gap-4">
                                            <FormSliderInput
                                                label="Minimum Vote Weight"
                                                helpText="The minimum vote weight that the user has to vote with in order to be eligible for the bribe"
                                                name="minVoteWeightSlide"
                                                inputName="minVoteWeightNum"
                                                index={idx}
                                                control={control}
                                                setValue={setValue}
                                                isArray
                                                isFixed={true}
                                            />
                                        </Box>
                                    ) : (
                                        <FormRangeSliderInput
                                            label="Range"
                                            name={`range[${idx}].value`}
                                            inputName={`rangeNum[${idx}].value`}
                                            index={idx}
                                            setValue={setValue}
                                            control={control}
                                            helpText="Select the range that you want to incentivise. The upper range would be considered the target vote. Open ended bribes require an upper range of 100%"
                                        />
                                    )} */}
                                </Box>
                            </Box>
                        ))}
                        {!isGovernance && !isFixed && (
                            <Box className="flex justify-end">
                                <Button
                                    variant="contained"
                                    color="tealLight"
                                    type="button"
                                    onClick={onAddGaugeVariable}
                                >
                                    Add
                                </Button>
                            </Box>
                        )}
                    </BoxForm>
                    <Box className="mb-10 md:mb-20 flex justify-end"></Box>
                </Box>
                <Box>
                    <BoxForm className="flex flex-col p-8 md:p-12 rounded-md gap-8 mb-12 md:mb-0">
                        <strong>Total proposal value</strong>
                        <Box className="flex flex-col gap-8">
                            <Box className="grid grid-cols-3 gap-8">
                                <Typography className="col-span-2">
                                    Total Bond
                                </Typography>
                                <Typography className="text-right">
                                    $3,500
                                    <br />
                                    3,500 USDC
                                </Typography>
                                <Typography className="col-span-2">
                                    Max Reward
                                </Typography>
                                <Typography className="text-right">
                                    {maxReward + " " + rewardType}
                                </Typography>
                            </Box>
                        </Box>
                        {myloading ? (
                            <Button
                                variant="contained"
                                color="tealLight"
                                type="submit"
                            >
                                <img style={{ width: "25px" }} src={loader}></img>
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="tealLight"
                                type="submit"
                            >
                                Continue
                            </Button>
                        )}
                    </BoxForm>
                </Box>
            </Box>
        </Box>
    );
};

export { ProposalForm };
