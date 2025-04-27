// src/components/Navigation.jsx
import React, { FC, useContext } from "react";
import Box from "@mui/material/Box";
import { Link } from "@mui/material";
import { useLocation } from "react-router-dom";
import { formatEther } from "ethers";
import { Web3Context } from "../../providers/web3";
import { navigations } from "./navigation.data";

type NavigationData = {
  path: string;
  label: string;
};

const Navigation: FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const {
    walletAddress,
    networkName,
    ethBalance,
    connectWallet,
    disconnectWallet,
  } = useContext(Web3Context);

  // Format wallet address for display
  const formatAddress = (address: string | null) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  // Format ETH balance
  const formatBalance = (balance: bigint | null): string => {
    if (!balance) {
        return '0ETH';
    }

    try {
      const formattedBalance = Number(formatEther(balance)).toFixed(4);
      return `${formattedBalance} ETH`;
    } catch (error) {
        // console.error('Error formatting balance:', error);
        return '0 ETH';
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "wrap",
        justifyContent: "end",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      {navigations.map(({ path: destination, label }: NavigationData) => (
        <Box
          key={label}
          component={Link}
          href={destination}
          sx={{
            display: "inline-flex",
            position: "relative",
            color: currentPath === destination ? "" : "white",
            lineHeight: "30px",
            letterSpacing: "3px",
            cursor: "pointer",
            textDecoration: "none",
            textTransform: "uppercase",
            fontWeight: 700,
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 0, lg: 3 },
            mb: { xs: 3, lg: 0 },
            fontSize: "20px",
            ...destination === "/" && { color: "primary.main" },
            "& > div": { display: "none" },
            "&.current>div": { display: "block" },
            "&:hover": {
              color: "text.disabled",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 12,
              transform: "rotate(3deg)",
              "& img": { width: 44, height: "auto" },
            }}
          >
            <img src="/images/headline-curve.svg" alt="Headline curve" />
          </Box>
          {label}
        </Box>
      ))}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 0, lg: 3 },
          mb: { xs: 3, lg: 0 },
        }}
      >
        {walletAddress ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            <Box>{formatAddress(walletAddress)}</Box>
            <Box sx={{ fontSize: "12px", color: "grey.400" }}>{networkName}</Box>
            <Box sx={{ fontSize: "12px", color: "grey.400" }}>
              {formatBalance(ethBalance)} 
            </Box>
            <Box
              component="button"
              onClick={disconnectWallet}
              sx={{
                mt: 1,
                color: "white",
                backgroundColor: "error.main",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              Disconnect
            </Box>
          </Box>
        ) : (
          <Box
            component="button"
            onClick={connectWallet}
            sx={{
              color: "white",
              cursor: "pointer",
              textDecoration: "none",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              px: { xs: 0, lg: 3 },
              mb: { xs: 3, lg: 0 },
              fontSize: "24px",
              lineHeight: "45px",
              width: "324px",
              height: "45px",
              borderRadius: "6px",
              backgroundColor: "#00dbe3",
              "&:hover": {
                backgroundColor: "#00c4cc",
              },
            }}
          >
            Connect Wallet
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Navigation;